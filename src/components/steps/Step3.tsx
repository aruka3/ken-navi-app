import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, Download, Building, FileText, Hammer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import Mascot from '../Mascot';

interface SchedulePhase {
  id: string;
  name: string;
  duration: number;
  startDate: Date;
  endDate: Date;
  dependencies: string[];
  application?: string;
  type: 'design' | 'application' | 'construction';
}

type SubTabType = 'all' | 'design' | 'application' | 'construction';

export default function Step3() {
  const { state, dispatch } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedule, setSchedule] = useState<SchedulePhase[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('design');

  const subTabs = [
    { id: 'design' as SubTabType, name: '設計', icon: <Building className="w-4 h-4" />, color: 'bg-green-500' },
    { id: 'application' as SubTabType, name: '申請', icon: <FileText className="w-4 h-4" />, color: 'bg-blue-500' },
    { id: 'construction' as SubTabType, name: '施工', icon: <Hammer className="w-4 h-4" />, color: 'bg-orange-500' },
    { id: 'all' as SubTabType, name: '全体', icon: <Calendar className="w-4 h-4" />, color: 'bg-gray-500' },
  ];

  const getMascotMessage = () => {
    if (isGenerating) {
      return 'スケジュールを作成中だよ〜少し待ってね☁️';
    }
    if (schedule.length > 0) {
      if (activeSubTab === 'design') {
        return '今は設計フェーズだよ〜建物の基本を決める大切な時期だね📐☁️';
      } else if (activeSubTab === 'application') {
        return '今は申請フェーズだよ〜法的手続きが中心だね📄☁️';
      } else if (activeSubTab === 'construction') {
        return '今は施工フェーズだよ〜期間は目安だから施工業者さんと相談してね🔨☁️';
      }
      return 'スケジュールができたよ〜下のタブで各フェーズを確認してね☁️';
    }
    return 'スケジュールを作成するよ〜少し待ってね☁️';
  };

  const generateSchedule = (phase: string): SchedulePhase[] => {
    const startDate = new Date();
    const applications = state.selectedApplications || [];
    
    const schedules: { [key: string]: SchedulePhase[] } = {
      design: [
        {
          id: 'hearing',
          name: 'ヒアリング・現地調査',
          duration: 7,
          startDate: new Date(startDate),
          endDate: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          dependencies: [],
          type: 'design'
        },
        {
          id: 'basic-design',
          name: '基本設計',
          duration: 21,
          startDate: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(startDate.getTime() + 28 * 24 * 60 * 60 * 1000),
          dependencies: ['hearing'],
          type: 'design'
        },
        {
          id: 'detailed-design',
          name: '実施設計',
          duration: 35,
          startDate: new Date(startDate.getTime() + 28 * 24 * 60 * 60 * 1000),
          endDate: new Date(startDate.getTime() + 63 * 24 * 60 * 60 * 1000),
          dependencies: ['basic-design'],
          type: 'design'
        },
        {
          id: 'drawing-completion',
          name: '設計図書完成',
          duration: 14,
          startDate: new Date(startDate.getTime() + 63 * 24 * 60 * 60 * 1000),
          endDate: new Date(startDate.getTime() + 77 * 24 * 60 * 60 * 1000),
          dependencies: ['detailed-design'],
          type: 'design'
        }
      ],
      application: [
        {
          id: 'pre-consultation',
          name: '事前協議',
          duration: 14,
          startDate: new Date(startDate),
          endDate: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000),
          dependencies: [],
          type: 'application'
        },
        {
          id: 'document-preparation',
          name: '申請書類作成',
          duration: 10,
          startDate: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000),
          endDate: new Date(startDate.getTime() + 24 * 24 * 60 * 60 * 1000),
          dependencies: ['pre-consultation'],
          type: 'application'
        },
        ...applications.map((app, index) => ({
          id: `application-${app.id}`,
          name: app.title,
          duration: app.estimatedDays,
          startDate: new Date(startDate.getTime() + (24 + index * 7) * 24 * 60 * 60 * 1000),
          endDate: new Date(startDate.getTime() + (24 + index * 7 + app.estimatedDays) * 24 * 60 * 60 * 1000),
          dependencies: ['document-preparation'],
          application: app.id,
          type: 'application' as const
        })),
        {
          id: 'permit-issuance',
          name: '確認済証交付',
          duration: 7,
          startDate: new Date(startDate.getTime() + (24 + applications.length * 7 + Math.max(...applications.map(a => a.estimatedDays))) * 24 * 60 * 60 * 1000),
          endDate: new Date(startDate.getTime() + (31 + applications.length * 7 + Math.max(...applications.map(a => a.estimatedDays))) * 24 * 60 * 60 * 1000),
          dependencies: applications.map(app => `application-${app.id}`),
          type: 'application'
        }
      ],
      construction: [
        {
          id: 'construction-total',
          name: '施工工程（参考）',
          duration: 90,
          startDate: new Date(startDate),
          endDate: new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000),
          dependencies: [],
          type: 'construction'
        }
      ]
    };

    return schedules[phase] || [];
  };

  // Auto-generate schedule on component mount
  useEffect(() => {
    if (schedule.length === 0) {
      handleGenerateSchedule();
    }
  }, []);

  const handleGenerateSchedule = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Generate all phases when creating schedule
      const designSchedule = generateSchedule('design');
      const applicationSchedule = generateSchedule('application');
      const constructionSchedule = generateSchedule('construction');
      
      // Combine all schedules and adjust dates properly
      const combinedSchedule = [
        ...designSchedule,
        ...applicationSchedule.map(phase => ({
          ...phase,
          startDate: new Date(designSchedule[designSchedule.length - 1].endDate.getTime() + 24 * 60 * 60 * 1000),
          endDate: new Date(designSchedule[designSchedule.length - 1].endDate.getTime() + (phase.duration + 1) * 24 * 60 * 60 * 1000)
        })),
        ...constructionSchedule.map(phase => {
          const lastApplicationEnd = applicationSchedule.length > 0 
            ? new Date(designSchedule[designSchedule.length - 1].endDate.getTime() + (applicationSchedule.reduce((sum, app) => sum + app.duration, 0) + 1) * 24 * 60 * 60 * 1000)
            : designSchedule[designSchedule.length - 1].endDate;
          return {
            ...phase,
            startDate: new Date(lastApplicationEnd.getTime() + 24 * 60 * 60 * 1000),
            endDate: new Date(lastApplicationEnd.getTime() + (phase.duration + 1) * 24 * 60 * 60 * 1000)
          };
        })
      ];
      
      setSchedule(combinedSchedule);
      dispatch({ type: 'SET_SCHEDULE', payload: combinedSchedule });
      dispatch({ type: 'SET_PHASE', payload: 'all' });
      setIsGenerating(false);
    }, 2000);
  };

  const handleNext = () => {
    dispatch({ type: 'SET_STEP', payload: 4 });
  };

  const handleDownloadCSV = () => {
    const filteredSchedule = getFilteredSchedule();
    const csvContent = [
      ['タスク名', '開始日', '終了日', '期間(日)', '依存関係', 'フェーズ'],
      ...filteredSchedule.map(phase => [
        phase.name,
        phase.startDate.toLocaleDateString('ja-JP'),
        phase.endDate.toLocaleDateString('ja-JP'),
        phase.duration.toString(),
        phase.dependencies.join(', '),
        phase.type
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedPhase}-schedule-${activeSubTab}.csv`;
    link.click();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFilteredSchedule = () => {
    if (activeSubTab === 'all') return schedule;
    return schedule.filter(phase => phase.type === activeSubTab);
  };

  const handleSubTabChange = (tabId: SubTabType) => {
    setActiveSubTab(tabId);
  };
  const getPhaseColor = (type: string) => {
    switch (type) {
      case 'design': return 'bg-green-500';
      case 'application': return 'bg-blue-500';
      case 'construction': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPhaseColorLight = (type: string) => {
    switch (type) {
      case 'design': return 'bg-green-50 border-green-200';
      case 'application': return 'bg-blue-50 border-blue-200';
      case 'construction': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredSchedule = getFilteredSchedule();
  const totalDays = filteredSchedule.reduce((sum, phase) => sum + phase.duration, 0);
  const maxEndDate = filteredSchedule.length > 0 ? new Date(Math.max(...filteredSchedule.map(p => p.endDate.getTime()))) : new Date();

  return (
    <>
      <Mascot message={getMascotMessage()} />

      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-gray-800 mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            工程スケジュール作成
          </motion.h2>

          {/* Loading State */}
          {!schedule.length && isGenerating && (
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">スケジュール生成中...</h3>
              <p className="text-gray-600">プロジェクトの工程表を作成しています</p>
            </motion.div>
          )}

          {/* Schedule Display */}
          {schedule.length > 0 && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* Sub-Tab Navigation */}
              <motion.div 
                className="flex flex-wrap gap-2 mb-6 p-2 bg-gray-100 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {subTabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleSubTabChange(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      activeSubTab === tab.id
                        ? `${tab.color} text-white shadow-md`
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.name}</span>
                    {tab.id !== 'all' && (
                      <span className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                        {schedule.filter(s => s.type === tab.id).length}
                      </span>
                    )}
                  </motion.button>
                ))}
              </motion.div>

              {/* Schedule Summary */}
              <motion.div 
                className="bg-green-50 p-6 rounded-xl mb-6 border border-green-200"
                key={activeSubTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <h3 className="text-lg font-semibold text-green-700">
                      {activeSubTab === 'all' ? '総タスク数' : `${subTabs.find(t => t.id === activeSubTab)?.name}タスク数`}
                    </h3>
                    <p className="text-2xl font-bold text-green-900">{filteredSchedule.length}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-700">期間</h3>
                    <p className="text-2xl font-bold text-green-900">
                      {filteredSchedule.length > 0 
                        ? Math.ceil((maxEndDate.getTime() - filteredSchedule[0].startDate.getTime()) / (24 * 60 * 60 * 1000))
                        : 0}日
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-700">完了予定</h3>
                    <p className="text-lg font-bold text-green-900">
                      {filteredSchedule.length > 0 ? formatDate(maxEndDate) : '-'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Schedule Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-blue-500" />
                  {activeSubTab === 'all' 
                    ? 'プロジェクトスケジュール（全体）'
                    : `${subTabs.find(t => t.id === activeSubTab)?.name}スケジュール`
                  }
                </h3>
                <motion.button
                  onClick={handleDownloadCSV}
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV出力
                </motion.button>
              </div>

              {/* Gantt-style Schedule */}
              <motion.div 
                className="space-y-3"
                key={`schedule-${activeSubTab}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                {filteredSchedule.map((phase, index) => {
                  const progress = Math.min(100, ((new Date().getTime() - phase.startDate.getTime()) / (phase.endDate.getTime() - phase.startDate.getTime())) * 100);
                  const isActive = new Date() >= phase.startDate && new Date() <= phase.endDate;
                  const isCompleted = new Date() > phase.endDate;
                  const isConstructionPhase = phase.type === 'construction';
                  
                  return (
                    <motion.div 
                      key={phase.id} 
                      className={`rounded-xl p-4 border-2 ${
                        isCompleted ? 'bg-green-50 border-green-200' :
                        isActive ? getPhaseColorLight(phase.type) :
                        'bg-gray-50 border-gray-200'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                            isCompleted ? 'bg-green-500 text-white' :
                            isActive ? getPhaseColor(phase.type) + ' text-white' :
                            'bg-gray-300 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{phase.name}</h4>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-1" />
                              {isConstructionPhase ? `約${Math.round(phase.duration / 30)}か月` : `${phase.duration}日間`}
                              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                phase.type === 'design' ? 'bg-green-100 text-green-700' :
                                phase.type === 'application' ? 'bg-blue-100 text-blue-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {phase.type === 'design' ? '設計' :
                                 phase.type === 'application' ? '申請' : '施工'}
                              </span>
                              {phase.application && (
                                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                  申請
                                </span>
                              )}
                              {isConstructionPhase && (
                                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                  概算
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div>{formatDate(phase.startDate)}</div>
                          <div className="text-gray-400">〜</div>
                          <div>{formatDate(phase.endDate)}</div>
                        </div>
                      </div>
                      
                      {/* Construction Phase Notice */}
                      {isConstructionPhase && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>※ 施工期間について：</strong><br />
                            この期間は概算です。実際の工程は建物の規模・構造・仕様により大きく変わります。<br />
                            詳細なスケジュールは施工業者との打ち合わせで決定してください。
                          </p>
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <motion.div
                          className={`h-3 rounded-full ${
                            isCompleted ? 'bg-green-500' :
                            isActive ? getPhaseColor(phase.type) :
                            'bg-gray-300'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                          transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                        />
                      </div>
                      
                      {/* Dependencies */}
                      {phase.dependencies.length > 0 && (
                        <div className="text-xs text-gray-500">
                          依存: {phase.dependencies.join(', ')}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {filteredSchedule.length === 0 && activeSubTab !== 'all' && (
                <motion.div 
                  className="text-center py-8"
                  key={`empty-${activeSubTab}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {subTabs.find(t => t.id === activeSubTab)?.name}フェーズのタスクはありません
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Next Button */}
          {schedule.length > 0 && (
            <motion.button
              onClick={handleNext}
              className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              完了
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          )}
        </motion.div>
      </div>
    </>
  );
}