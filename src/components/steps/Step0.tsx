import React, { useState } from 'react';
import { MapPin, Home, Ruler, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import Mascot from '../Mascot';

export default function Step0() {
  const { dispatch } = useApp();
  const [address, setAddress] = useState('');
  const [usage, setUsage] = useState('');
  const [siteArea, setSiteArea] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleStart = () => {
    if (address && usage && siteArea) {
      dispatch({
        type: 'SET_LAND_DATA',
        payload: {
          address,
          usage,
          siteArea: parseFloat(siteArea),
        },
      });
      dispatch({ type: 'SET_STEP', payload: 1 });
    }
  };

  const getMascotMessage = () => {
    if (focusedField === 'address') {
      return 'ここには建築予定地の住所を入れてね〜☁️';
    }
    if (focusedField === 'usage') {
      return '用途っていうのは住宅とか店舗とかだよ〜☁️';
    }
    if (focusedField === 'siteArea') {
      return '敷地面積はだいたいでもいいから入れてね〜☁️';
    }
    if (address && usage && siteArea) {
      return 'よし！全部入力できたね〜次に進もう☁️';
    }
    return 'まずは基本情報を入力してね〜☁️';
  };

  const isValid = address && usage && siteArea;

  return (
    <>
      <Mascot message={getMascotMessage()} />
      
      <div className="max-w-2xl mx-auto">
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
            基本情報を入力してください
          </motion.h2>
          
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                住所
              </label>
              <motion.input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField(null)}
                placeholder="例: 大阪市西区京町堀２丁目4-19"
                placeholder="例: 横浜市西区みなとみらい2-2-1"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <Home className="w-5 h-5 mr-2 text-blue-500" />
                用途（建物の使用目的）
              </label>
              <motion.input
                type="text"
                value={usage}
                onChange={(e) => setUsage(e.target.value)}
                onFocus={() => setFocusedField('usage')}
                onBlur={() => setFocusedField(null)}
                placeholder="例: 戸建住宅、共同住宅、店舗併用住宅など"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <Ruler className="w-5 h-5 mr-2 text-blue-500" />
                敷地面積 (㎡)
              </label>
              <motion.input
                type="number"
                value={siteArea}
                onChange={(e) => setSiteArea(e.target.value)}
                onFocus={() => setFocusedField('siteArea')}
                onBlur={() => setFocusedField(null)}
                placeholder="例: 120.50"
                min="0"
                step="0.01"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          </div>

          <motion.button
            onClick={handleStart}
            disabled={!isValid}
            className={`w-full mt-10 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center ${
              isValid
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
          >
            法的制約を確認する
            <ArrowRight className="w-5 h-5 ml-2" />
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}