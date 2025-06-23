import React, { useEffect, useRef, useState } from 'react';
import { Map, ArrowRight, MapPin, Edit3, CheckCircle, ExternalLink, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import Mascot from '../Mascot';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

// Check for valid Mapbox token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const HAS_VALID_TOKEN = MAPBOX_TOKEN && 
  MAPBOX_TOKEN.startsWith('pk.') && 
  MAPBOX_TOKEN.length > 100 && 
  MAPBOX_TOKEN.split('.').length === 3;


export default function Step1() {
  const { state, dispatch } = useApp();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [address, setAddress] = useState(state.landData?.address || '');
  const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(null);
  const [zoningData, setZoningData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<any>({});
  const [mapLoadingProgress, setMapLoadingProgress] = useState(0);
  const [useMockMap, setUseMockMap] = useState(!HAS_VALID_TOKEN);

  const getMascotMessage = () => {
    if (useMockMap && !HAS_VALID_TOKEN) {
      return 'デモモードで動作中だよ〜実際の地図を使うにはMapboxトークンが必要だよ☁️';
    }
    if (isLoading && !isMapLoaded) {
      return '地図を読み込み中だよ〜少し待ってね☁️';
    }
    if (isLoading && selectedPoint) {
      return '法的制約を調べているよ〜少し待ってね☁️';
    }
    if (Object.keys(zoningData).length > 0) {
      const zoneType = zoningData.A29_005 || zoningData.用途地域;
      if (zoneType?.includes('第一種低層住居専用地域')) {
        return `ここは${zoneType}だね〜静かで住みやすそう☁️`;
      } else if (zoneType?.includes('第二種低層住居専用地域')) {
        return `${zoneType}は落ち着いた住宅街だね〜☁️`;
      } else if (zoneType?.includes('商業')) {
        return `${zoneType}は賑やかなエリアだね〜お店も多そう☁️`;
      } else if (zoneType?.includes('工業')) {
        return `${zoneType}は工場や倉庫が建てられるエリアだよ〜☁️`;
      }
      return '建ぺい率って、敷地にどれだけ建物を建てられるかの割合なんだ〜☁️';
    }
    if (isEditing) {
      return '法規のことは後でも編集できるから安心してね〜保存を忘れずに☁️';
    }
    if (isMapLoaded) {
      return '地図をクリックすると法的情報が表示されるよ〜住所検索もできるよ☁️';
    }
    return 'どこに建てるのか教えてね〜☁️';
  };

  // Initialize map only if we have a valid token
  useEffect(() => {
    console.log("🗺️ Map initialized");
    if (!mapContainer.current || useMockMap || !HAS_VALID_TOKEN) {
      // For mock map, simulate loading
      const progressInterval = setInterval(() => {
        setMapLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsMapLoaded(true);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
      return () => clearInterval(progressInterval);
    }

    try {
      // Set the access token
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [135.5023, 34.6937],
        zoom: 13,
      });

      map.current = mapInstance;

      const progressInterval = setInterval(() => {
        setMapLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      map.current.on('load', () => {
        loadOsakaZoningData();
        clearInterval(progressInterval);
        setMapLoadingProgress(100);
        setIsMapLoaded(true);
      });

      map.current.on('click', (e) => {
        if (!isMapLoaded || !map.current) return;
        
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['youto-fill'] });
        if (features.length) {
          const f = features[0].properties;
          const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
          setSelectedPoint(coordinates);
          
          // Set zoning data directly from GeoJSON properties
          const data = {
            用途地域: f.A29_005 || '不明',
            建ぺい率: f.A29_006 ? f.A29_006 + '％' : '不明',
            容積率: f.A29_007 ? f.A29_007 + '％' : '不明',
            防火地域: f.A29_008 || '指定なし',
            高度地区: f.A29_009 || '指定なし'
          };
          
          setZoningData(data);
          setEditableData(data);
          
          dispatch({
            type: 'SET_LAND_INFO',
            payload: {
              zoneType: data.用途地域,
              volumeRatio: data.容積率,
              buildingCoverageRatio: data.建ぺい率,
              firePreventionArea: data.防火地域,
              frontRoadWidth: '6.0m'
            }
          });
        }
        
        if (marker.current) {
          marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        } else {
          marker.current = new mapboxgl.Marker({ color: '#3B82F6' })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map.current);
        }
      });

      return () => {
        clearInterval(progressInterval);
        if (marker.current) {
          marker.current.remove();
        }
        if (map.current) {
          map.current.remove();
        }
      };
    } catch (error) {
      console.error('Error initializing Mapbox:', error);
      // Fallback to mock map if Mapbox fails
      setUseMockMap(true);
      const progressInterval = setInterval(() => {
        setMapLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsMapLoaded(true);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
      return () => clearInterval(progressInterval);
    }
  }, [useMockMap, HAS_VALID_TOKEN]);

  const loadOsakaZoningData = async () => {
    try {
      if (!map.current) return;

      // Load actual Osaka GeoJSON data
      map.current.addSource('youto', {
        type: 'geojson',
        data: '/osaka_youto.json'
      });

      map.current.addLayer({
        id: 'youto-fill',
        type: 'fill',
        source: 'youto',
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.3
        }
      });

      map.current.addLayer({
        id: 'youto-outline',
        type: 'line',
        source: 'youto',
        paint: {
          'line-color': '#066',
          'line-width': 1
        }
      });

    } catch (error) {
      console.error('Error loading zoning data:', error);
    }
  };

  const queryZoningData = async (coordinates: [number, number]) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (useMockMap) {
        // Mock data for demo
        const mockData = {
          用途地域: '第一種低層住居専用地域',
          建ぺい率: '50％',
          容積率: '100％',
          防火地域: '指定なし',
          高度地区: '第一種高度地区'
        };
        
        setZoningData(mockData);
        setEditableData(mockData);
        
        dispatch({
          type: 'SET_LAND_INFO',
          payload: {
            zoneType: mockData.用途地域,
            volumeRatio: mockData.容積率,
            buildingCoverageRatio: mockData.建ぺい率,
            firePreventionArea: mockData.防火地域,
            frontRoadWidth: '6.0m'
          }
        });
      } else if (map.current) {
        const features = map.current.queryRenderedFeatures([
          map.current.project(coordinates)
        ], {
          layers: ['youto-fill']
        });
        
        if (features.length > 0) {
          const feature = features[0];
          const f = feature.properties || {};
          
          const data = {
            用途地域: f.A29_005 || '不明',
            建ぺい率: f.A29_006 ? f.A29_006 + '％' : '不明',
            容積率: f.A29_007 ? f.A29_007 + '％' : '不明',
            防火地域: f.A29_008 || '指定なし',
            高度地区: f.A29_009 || '指定なし'
          };
          
          setZoningData(data);
          setEditableData(data);
          
          dispatch({
            type: 'SET_LAND_INFO',
            payload: {
              zoneType: data.用途地域,
              volumeRatio: data.容積率,
              buildingCoverageRatio: data.建ぺい率,
              firePreventionArea: data.防火地域,
              frontRoadWidth: '6.0m'
            }
          });
        }
      }
    } catch (error) {
      console.error('Error querying zoning data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (!isMapLoaded || !useMockMap) return;
    
    // Mock map click for demo
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to mock coordinates (Osaka area)
    const mockCoordinates: [number, number] = [
      135.5023 + (x - rect.width / 2) * 0.001,
      34.6937 + (rect.height / 2 - y) * 0.001
    ];
    
    setSelectedPoint(mockCoordinates);
    queryZoningData(mockCoordinates);
  };

  const handleAddressSearch = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      // Mock geocoding for demo - Osaka coordinates
      const mockCoordinates: [number, number] = [135.5023, 34.6937];
      setSelectedPoint(mockCoordinates);
      await queryZoningData(mockCoordinates);
    } catch (error) {
      console.error('Error searching address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdits = () => {
    setZoningData(editableData);
    dispatch({
      type: 'SET_LAND_INFO',
      payload: {
        zoneType: editableData.用途地域 || '',
        volumeRatio: editableData.容積率 || '',
        buildingCoverageRatio: editableData.建ぺい率 || '',
        firePreventionArea: editableData.防火地域 || '',
        frontRoadWidth: '6.0m'
      }
    });
    setIsEditing(false);
  };

  const handleNext = () => {
    dispatch({ type: 'SET_STEP', payload: 2 });
  };

  const hasZoningData = Object.keys(zoningData).length > 0;
  const isOsakaAddress = address.includes('大阪市') || address.includes('大阪');

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
            用途地域などの法規制確認
          </motion.h2>

          {/* Token Warning */}
          {useMockMap && (
            <motion.div 
              className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-400 rounded-full mr-3"></div>
                <p className="text-sm text-yellow-800">
                  <strong>デモモード:</strong> 実際の地図を表示するには、Mapboxアクセストークンが必要です。
                  現在はモックマップで動作しています。
                </p>
              </div>
            </motion.div>
          )}

          {/* Address Input */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <MapPin className="w-5 h-5 mr-2 text-blue-500" />
              住所
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="例: 大阪市西区京町堀２丁目4-19"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
              <motion.button
                onClick={handleAddressSearch}
                disabled={!address || isLoading}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-all duration-300 flex items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                住所から表示
              </motion.button>
            </div>
            
            {/* Official Osaka Map Link */}
            {isOsakaAddress && (
              <motion.div 
                className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-blue-700 mb-2">
                  大阪市の公式用途地域マップも確認できます：
                </p>
                <a
                  href="https://www.city.osaka.lg.jp/toshikeikaku/page/0000009897.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  大阪市用途地域マップ
                </a>
              </motion.div>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div 
                ref={useMockMap ? undefined : mapContainer}
                className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden cursor-pointer relative border-2 border-gray-200"
                style={{ height: '400px' }}
                onClick={useMockMap ? handleMapClick : undefined}
              >
                {/* Real Mapbox container */}
                {!useMockMap && <div ref={mapContainer} className="w-full h-full" />}

                {/* Mock map interface for when no token is available */}
                {useMockMap && (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-100 to-blue-50"></div>
                    
                    {/* Mock buildings and roads for Osaka */}
                    <div className="absolute top-16 left-16 w-20 h-14 bg-gray-300 rounded shadow-md"></div>
                    <div className="absolute top-32 left-36 w-24 h-18 bg-gray-400 rounded shadow-md"></div>
                    <div className="absolute bottom-28 right-20 w-16 h-20 bg-gray-350 rounded shadow-md"></div>
                    <div className="absolute top-20 right-32 w-18 h-16 bg-gray-300 rounded shadow-md"></div>
                    
                    {/* Mock roads */}
                    <div className="absolute top-0 left-28 w-2 h-full bg-gray-500"></div>
                    <div className="absolute left-0 top-44 w-full h-2 bg-gray-500"></div>
                    <div className="absolute top-0 right-28 w-2 h-full bg-gray-500"></div>
                    
                    {/* Zoning areas with different colors for Osaka */}
                    <div className="absolute top-12 left-12 w-36 h-28 bg-green-200 opacity-60 rounded border border-green-300"></div>
                    <div className="absolute bottom-16 right-16 w-32 h-36 bg-blue-200 opacity-60 rounded border border-blue-300"></div>
                    <div className="absolute top-28 right-28 w-28 h-24 bg-pink-200 opacity-60 rounded border border-pink-300"></div>
                    <div className="absolute bottom-32 left-20 w-30 h-26 bg-yellow-200 opacity-60 rounded border border-yellow-300"></div>
                    
                    {/* Selected point marker */}
                    {selectedPoint && (
                      <motion.div
                        className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"
                        style={{ 
                          left: '50%', 
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    
                    {!selectedPoint && isMapLoaded && (
                      <div className="text-center z-10">
                        <Map className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">
                          地図をクリックして法的制約を確認
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Map Loading State */}
                {!isMapLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-10">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 mb-2">地図を読み込み中...</p>
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className="bg-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${mapLoadingProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{mapLoadingProgress}%</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 text-center">
                地図上をクリックして法的制約を確認してください
              </p>
            </motion.div>

            {/* Zoning Information */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {isLoading && selectedPoint && (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">法的制約を確認中...</p>
                  <div className="mt-2 text-sm text-gray-500">
                    大阪市のデータベースを検索しています
                  </div>
                </motion.div>
              )}

              {hasZoningData && !isLoading && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      法的制約情報
                    </h3>
                    <motion.button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      {isEditing ? 'キャンセル' : '編集'}
                    </motion.button>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(isEditing ? editableData : zoningData).map(([key, value], index) => (
                      <motion.div 
                        key={key} 
                        className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <h4 className="font-medium text-gray-700 mb-2">{key}</h4>
                        {isEditing ? (
                          <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => setEditableData(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium text-lg">{value}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {isEditing && (
                    <motion.button
                      onClick={handleSaveEdits}
                      className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      保存完了！
                    </motion.button>
                  )}
                </motion.div>
              )}

              {!hasZoningData && !isLoading && isMapLoaded && (
                <div className="text-center py-8">
                  <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    地図上の位置をクリックするか、<br />
                    住所を入力して法的制約を確認してください
                  </p>
                  <div className="text-sm text-gray-500">
                    大阪市内の用途地域情報を表示します
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {hasZoningData && (
            <motion.button
              onClick={handleNext}
              className="w-full mt-8 py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center transform hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              次へ進む
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          )}
        </motion.div>
      </div>
    </>
  );
}