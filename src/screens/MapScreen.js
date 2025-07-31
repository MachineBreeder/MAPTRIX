import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Services
import LocationService from '../services/LocationService';
import ExplorationService from '../services/ExplorationService';
import FogOfWarService from '../services/FogOfWarService';

// Components
import FogOfWarOverlay from '../components/FogOfWarOverlay';
import ExplorationStats from '../components/ExplorationStats';

const { width, height } = Dimensions.get('window');

const MapScreen = () => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [exploredAreas, setExploredAreas] = useState([]);
  const [explorationStats, setExplorationStats] = useState({
    totalAreasExplored: 0,
    explorationPercentage: 0,
    totalDistanceTraveled: 0,
  });
  const [isTracking, setIsTracking] = useState(false);

  // 한국 중심 좌표
  const KOREA_CENTER = {
    latitude: 36.5,
    longitude: 127.5,
    latitudeDelta: 4.0,
    longitudeDelta: 4.0,
  };

  // 한국 경계
  const KOREA_BOUNDS = {
    north: 38.612446,
    south: 33.059665,
    east: 131.872755,
    west: 125.064141,
  };

  useEffect(() => {
    initializeApp();
    return () => {
      if (isTracking) {
        LocationService.stopTracking();
      }
    };
  }, []);

  const initializeApp = async () => {
    try {
      // 저장된 탐험 데이터 로드
      await loadExplorationData();
      
      // 위치 권한 요청 및 추적 시작
      const hasPermission = await LocationService.requestLocationPermission();
      if (hasPermission) {
        startLocationTracking();
      } else {
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
      }
    } catch (error) {
      console.error('앱 초기화 오류:', error);
    }
  };

  const loadExplorationData = async () => {
    try {
      const savedAreas = await AsyncStorage.getItem('exploredAreas');
      const savedStats = await AsyncStorage.getItem('explorationStats');
      
      if (savedAreas) {
        setExploredAreas(JSON.parse(savedAreas));
      }
      
      if (savedStats) {
        setExplorationStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    }
  };

  const startLocationTracking = () => {
    setIsTracking(true);
    
    LocationService.startTracking((location) => {
      setUserLocation(location);
      
      // 한국 경계 내부인지 확인
      if (isLocationInKorea(location)) {
        handleLocationUpdate(location);
      }
    });
  };

  const isLocationInKorea = (location) => {
    return (
      location.latitude >= KOREA_BOUNDS.south &&
      location.latitude <= KOREA_BOUNDS.north &&
      location.longitude >= KOREA_BOUNDS.west &&
      location.longitude <= KOREA_BOUNDS.east
    );
  };

  const handleLocationUpdate = async (location) => {
    try {
      // 새로운 탐험 지역 확인
      const newExploredArea = ExplorationService.checkNewExploration(
        location,
        exploredAreas
      );

      if (newExploredArea) {
        const updatedAreas = [...exploredAreas, newExploredArea];
        setExploredAreas(updatedAreas);

        // 통계 업데이트
        const newStats = ExplorationService.calculateStats(updatedAreas);
        setExplorationStats(newStats);

        // 데이터 저장
        await AsyncStorage.setItem('exploredAreas', JSON.stringify(updatedAreas));
        await AsyncStorage.setItem('explorationStats', JSON.stringify(newStats));

        // 새 지역 발견 알림
        showNewAreaDiscovered(newExploredArea);
      }
    } catch (error) {
      console.error('위치 처리 오류:', error);
    }
  };

  const showNewAreaDiscovered = (area) => {
    Alert.alert(
      '🗺️ 새로운 지역 발견!',
      `새로운 지역을 탐험했습니다!\n+${area.experiencePoints} EXP 획득`,
      [{ text: '확인', style: 'default' }]
    );
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const resetExploration = async () => {
    Alert.alert(
      '탐험 초기화',
      '모든 탐험 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'destructive',
          onPress: async () => {
            setExploredAreas([]);
            setExplorationStats({
              totalAreasExplored: 0,
              explorationPercentage: 0,
              totalDistanceTraveled: 0,
            });
            await AsyncStorage.removeItem('exploredAreas');
            await AsyncStorage.removeItem('explorationStats');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={KOREA_CENTER}
        showsUserLocation={true}
        showsMyLocationButton={false}
        minZoomLevel={5}
        maxZoomLevel={18}
        onRegionChangeComplete={(region) => {
          // 한국 범위를 벗어나면 다시 중심으로
          if (
            region.latitude < KOREA_BOUNDS.south - 1 ||
            region.latitude > KOREA_BOUNDS.north + 1 ||
            region.longitude < KOREA_BOUNDS.west - 1 ||
            region.longitude > KOREA_BOUNDS.east + 1
          ) {
            mapRef.current?.animateToRegion(KOREA_CENTER);
          }
        }}
      >
        {/* Fog of War 오버레이 */}
        <FogOfWarOverlay 
          exploredAreas={exploredAreas}
          koreaBounds={KOREA_BOUNDS}
        />
      </MapView>

      {/* 탐험 통계 */}
      <ExplorationStats stats={explorationStats} />

      {/* 컨트롤 버튼들 */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
          <Text style={styles.controlButtonText}>📍</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={resetExploration}>
          <Text style={styles.controlButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* 현재 위치 정보 */}
      {userLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            위도: {userLocation.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            경도: {userLocation.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    flexDirection: 'column',
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  controlButtonText: {
    fontSize: 20,
  },
  locationInfo: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  locationText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default MapScreen;