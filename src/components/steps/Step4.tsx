import React from 'react';
import { CheckCircle, RotateCcw, Download, Share2, FileText, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import Mascot from '../Mascot';

export default function Step4() {
  const { state, dispatch } = useApp();

  const getMascotMessage = () => {
    return 'お疲れさま〜プロジェクトの準備が完了したよ☁️これで安心して進められるね！';
  };

  const handleRestart = () => {
    dispatch({ type: 'RESET' });
  };

  const handleDownload = () => {
    const data = {
      projectInfo: {
        name: 'KEN-NAVI AI プロジェクト',
        createdAt: new Date().toISOString(),
        phase: state.selectedPhase
      },
      landData: state.landData,
      landInfo: state.landInfo,
      applications: state.selectedApplications?.map(app => ({
        id: app.id,
        title: app.title,
        estimatedDays: app.estimatedDays,
        required: app.required
      })) || [],
      schedule: state.projectSchedule?.map(phase => ({
        name: phase.name,
        duration: phase.duration,
        startDate: phase.startDate.toISOString(),
        endDate: phase.endDate.toISOString()
      })) || []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ken-navi-project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'KEN-NAVI AI プロジェクト',
      text: `建築申請プロジェクトが完了しました！\n住所: ${state.landData?.address}\n用途: ${state.landData?.usage}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
        alert('プロジェクト情報をクリップボードにコピーしました！');
      }
    } catch (error) {
      console.log('Share failed:', error);
      // Additional fallback
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
        alert('プロジェクト情報をクリップボードにコピーしました！');
      } catch (clipboardError) {
        console.log('Clipboard failed:', clipboardError);
      }
    }
  };

  const totalApplications = state.selectedApplications?.length || 0;
  const totalDays = state.projectSchedule?.reduce((sum, phase) => sum + phase.duration, 0) || 0;
  const maxEndDate = state.projectSchedule?.length > 0 
    ? new Date(Math.max(...state.projectSchedule.map(p => p.endDate.getTime())))
    : new Date();

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
          {/* Success Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              プロジェクト設定が完了しました！
            </h2>
            <p className="text-lg text-gray-600">
              建築申請プロセスの準備が整いました
            </p>
          </motion.div>

          {/* Project Summary Cards */}
          <motion.div 
            className="grid md:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center mb-3">
                <MapPin className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-700">土地情報</h3>
              </div>
              <p className="text-sm text-blue-900 mb-1">{state.landData?.address}</p>
              <p className="text-sm text-blue-900">{state.landData?.usage}</p>
              <p className="text-lg font-bold text-blue-900 mt-2">{state.landData?.siteArea}㎡</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-center mb-3">
                <FileText className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-700">申請数</h3>
              </div>
              <p className="text-3xl font-bold text-green-900">{totalApplications}</p>
              <p className="text-sm text-green-700">件の申請</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center mb-3">
                <Calendar className="w-6 h-6 text-purple-600 mr-2" />
                <h3 className="font-semibold text-purple-700">予定期間</h3>
              </div>
              <p className="text-3xl font-bold text-purple-900">{totalDays}</p>
              <p className="text-sm text-purple-700">日間</p>
            </div>

            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-6 h-6 text-orange-600 mr-2" />
                <h3 className="font-semibold text-orange-700">完了予定</h3>
              </div>
              <p className="text-sm font-bold text-orange-900">
                {maxEndDate.toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </motion.div>

          {/* Detailed Project Information */}
          <motion.div 
            className="grid md:grid-cols-2 gap-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Land Information */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">土地・法規情報</h3>
              <div className="space-y-3">
                {state.landInfo && Object.entries({
                  '用途地域': state.landInfo.zoneType,
                  '容積率': state.landInfo.volumeRatio,
                  '建ぺい率': state.landInfo.buildingCoverageRatio,
                  '防火地域': state.landInfo.firePreventionArea,
                  '前面道路幅員': state.landInfo.frontRoadWidth
                }).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Applications */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">選択された申請</h3>
              <div className="space-y-2">
                {state.selectedApplications?.map((app, index) => (
                  <div key={app.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span className="text-gray-800">{app.title}</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">{app.estimatedDays}日</span>
                      {app.required && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          必須
                        </span>
                      )}
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500">申請が選択されていません</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div 
            className="bg-blue-50 p-6 rounded-xl mb-8 border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-blue-800 mb-4">次のステップ</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">1. 設計事務所との打ち合わせ</h4>
                <p className="text-sm text-gray-600">プロジェクトの詳細を確認し、設計方針を決定します。</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">2. 法規チェック</h4>
                <p className="text-sm text-gray-600">建築基準法や地域の条例に適合するか確認します。</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">3. 近隣調整</h4>
                <p className="text-sm text-gray-600">必要に応じて近隣住民への説明を行います。</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">4. 申請書類準備</h4>
                <p className="text-sm text-gray-600">建築確認申請に必要な図面と書類を準備します。</p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={handleDownload}
              className="flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-5 h-5 mr-2" />
              プロジェクトデータをダウンロード
            </motion.button>
            
            <motion.button
              onClick={handleShare}
              className="flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share2 className="w-5 h-5 mr-2" />
              プロジェクトを共有
            </motion.button>
            
            <motion.button
              onClick={handleRestart}
              className="flex items-center justify-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              新しいプロジェクトを開始
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}