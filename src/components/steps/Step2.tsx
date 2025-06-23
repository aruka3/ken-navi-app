import React, { useState } from 'react';
import { FileText, Building, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import Mascot from '../Mascot';

interface ApplicationCard {
  id: string;
  title: string;
  description: string;
  required: boolean;
  icon: React.ReactNode;
  estimatedDays: number;
  documents: string[];
}

export default function Step2() {
  const { state, dispatch } = useApp();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const getMascotMessage = () => {
    if (selectedCards.length === 0) {
      return '必要な申請を選んでね〜建物の用途によって変わるよ☁️';
    }
    if (selectedCards.length > 0) {
      return `${selectedCards.length}個の申請が選ばれたね〜これで準備万端☁️`;
    }
    return '申請カードを確認してね〜☁️';
  };

  // Generate application cards based on land data
  const generateApplicationCards = (): ApplicationCard[] => {
    const landData = state.landData;
    const landInfo = state.landInfo;
    
    const baseCards: ApplicationCard[] = [
      {
        id: 'building-permit',
        title: '建築確認申請',
        description: '建築基準法に基づく基本的な確認申請',
        required: true,
        icon: <Building className="w-6 h-6" />,
        estimatedDays: 21,
        documents: ['設計図書', '構造計算書', '敷地測量図', '建築計画概要書']
      },
      {
        id: 'fire-prevention',
        title: '消防同意',
        description: '消防法に基づく安全確認',
        required: landInfo?.firePreventionArea?.includes('防火') || false,
        icon: <Shield className="w-6 h-6" />,
        estimatedDays: 14,
        documents: ['消防計画書', '避難経路図', '防火設備図']
      }
    ];

    // Add conditional cards based on land conditions
    if (landData?.siteArea && landData.siteArea > 1000) {
      baseCards.push({
        id: 'large-scale',
        title: '大規模建築物届出',
        description: '1000㎡を超える建築物の届出',
        required: true,
        icon: <FileText className="w-6 h-6" />,
        estimatedDays: 30,
        documents: ['大規模建築物計画書', '環境配慮計画書']
      });
    }

    if (landData?.usage?.includes('共同住宅') || landData?.usage?.includes('マンション')) {
      baseCards.push({
        id: 'housing-quality',
        title: '住宅性能評価',
        description: '共同住宅の品質確保のための評価',
        required: false,
        icon: <Users className="w-6 h-6" />,
        estimatedDays: 45,
        documents: ['住宅性能評価書', '品質管理計画書']
      });
    }

    if (landInfo?.zoneType?.includes('商業')) {
      baseCards.push({
        id: 'commercial-permit',
        title: '商業施設許可',
        description: '商業地域での特別な許可申請',
        required: true,
        icon: <Building className="w-6 h-6" />,
        estimatedDays: 28,
        documents: ['商業計画書', '交通影響評価書', '近隣説明書']
      });
    }

    return baseCards;
  };

  const applicationCards = generateApplicationCards();

  const toggleCard = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleNext = () => {
    const selectedApplications = applicationCards.filter(card => 
      selectedCards.includes(card.id) || card.required
    );
    
    dispatch({
      type: 'SET_APPLICATIONS',
      payload: selectedApplications
    });
    dispatch({ type: 'SET_STEP', payload: 3 });
  };

  const requiredCards = applicationCards.filter(card => card.required);
  const optionalCards = applicationCards.filter(card => !card.required);
  const totalEstimatedDays = applicationCards
    .filter(card => selectedCards.includes(card.id) || card.required)
    .reduce((sum, card) => Math.max(sum, card.estimatedDays), 0);

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
            必要な申請カード一覧
          </motion.h2>

          {/* Summary */}
          <motion.div 
            className="bg-blue-50 p-6 rounded-xl mb-8 border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="text-lg font-semibold text-blue-700">必須申請</h3>
                <p className="text-2xl font-bold text-blue-900">{requiredCards.length}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-700">選択済み</h3>
                <p className="text-2xl font-bold text-blue-900">{selectedCards.length + requiredCards.length}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-700">予想期間</h3>
                <p className="text-2xl font-bold text-blue-900">{totalEstimatedDays}日</p>
              </div>
            </div>
          </motion.div>

          {/* Required Applications */}
          {requiredCards.length > 0 && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-red-500" />
                必須申請
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {requiredCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    className="bg-red-50 border-2 border-red-200 rounded-xl p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg mr-3">
                          {card.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{card.title}</h4>
                          <p className="text-sm text-red-600 font-medium">必須</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">予想期間</p>
                        <p className="font-bold text-gray-800">{card.estimatedDays}日</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{card.description}</p>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">必要書類:</p>
                      <div className="flex flex-wrap gap-1">
                        {card.documents.map((doc, docIndex) => (
                          <span 
                            key={docIndex}
                            className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Optional Applications */}
          {optionalCards.length > 0 && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-blue-500" />
                選択可能な申請
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {optionalCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    onClick={() => toggleCard(card.id)}
                    className={`cursor-pointer rounded-xl p-6 border-2 transition-all duration-300 ${
                      selectedCards.includes(card.id)
                        ? 'bg-blue-50 border-blue-500 shadow-lg'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                          selectedCards.includes(card.id) ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {card.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{card.title}</h4>
                          <p className="text-sm text-blue-600 font-medium">選択可能</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">予想期間</p>
                        <p className="font-bold text-gray-800">{card.estimatedDays}日</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{card.description}</p>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">必要書類:</p>
                      <div className="flex flex-wrap gap-1">
                        {card.documents.map((doc, docIndex) => (
                          <span 
                            key={docIndex}
                            className={`px-2 py-1 text-xs rounded-full ${
                              selectedCards.includes(card.id)
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selectedCards.includes(card.id) && (
                      <motion.div 
                        className="mt-3 flex items-center text-blue-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">選択済み</span>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.button
            onClick={handleNext}
            className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center transform hover:-translate-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            スケジュールを作成する
            <ArrowRight className="w-5 h-5 ml-2" />
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}