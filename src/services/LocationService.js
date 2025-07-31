import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

class LocationService {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
    this.lastKnownLocation = null;
    this.trackingCallback = null;
  }

  // 위치 권한 요청
  async requestLocationPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한',
            message: '앱에서 위치 정보를 사용하려면 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '거절',
            buttonPositive: '허용',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('위치 권한 허용됨');
          return true;
        } else {
          console.log('위치 권한 거절됨');
          return false;
        }
      } else {
        // iOS 권한 처리
        return new Promise((resolve) => {
          Geolocation.requestAuthorization('whenInUse').then((result) => {
            console.log('iOS 위치 권한:', result);
            resolve(result === 'granted');
          });
        });
      }
    } catch (error) {
      console.error('권한 요청 오류:', error);
      return false;
    }
  }

  // 현재 위치 한 번 가져오기
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          
          this.lastKnownLocation = location;
          resolve(location);
        },
        (error) => {
          console.error('위치 가져오기 오류:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  // 위치 추적 시작
  startTracking(callback) {
    if (this.isTracking) {
      console.log('이미 추적 중입니다.');
      return;
    }

    this.trackingCallback = callback;
    this.isTracking = true;

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: position.timestamp,
        };

        console.log('새 위치:', location);
        this.lastKnownLocation = location;
        
        if (this.trackingCallback) {
          this.trackingCallback(location);
        }
      },
      (error) => {
        console.error('위치 추적 오류:', error);
        
        // 오류 처리
        switch (error.code) {
          case 1:
            Alert.alert('오류', '위치 권한이 거부되었습니다.');
            break;
          case 2:
            Alert.alert('오류', '위치 정보를 사용할 수 없습니다.');
            break;
          case 3:
            Alert.alert('오류', '위치 요청 시간이 초과되었습니다.');
            break;
          default:
            Alert.alert('오류', '위치 정보를 가져올 수 없습니다.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // 10미터마다 업데이트
        interval: 5000,     // 5초마다 확인
        fastestInterval: 2000, // 최소 2초 간격
        forceRequestLocation: true,
        showLocationDialog: true,
      }
    );

    console.log('위치 추적 시작됨, watchId:', this.watchId);
  }

  // 위치 추적 중단
  stopTracking() {
    if (!this.isTracking) {
      console.log('추적 중이 아닙니다.');
      return;
    }

    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isTracking = false;
    this.trackingCallback = null;
    console.log('위치 추적 중단됨');
  }

  // 마지막 알려진 위치 반환
  getLastKnownLocation() {
    return this.lastKnownLocation;
  }

  // 두 지점 간 거리 계산 (미터 단위)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // 거리 (미터)
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // 위치 정확도 확인
  isLocationAccurate(location, requiredAccuracy = 50) {
    return location.accuracy <= requiredAccuracy;
  }

  // 한국 경계 내부 여부 확인
  isLocationInKorea(location) {
    const KOREA_BOUNDS = {
      north: 38.612446,
      south: 33.059665,
      east: 131.872755,
      west: 125.064141,
    };

    return (
      location.latitude >= KOREA_BOUNDS.south &&
      location.latitude <= KOREA_BOUNDS.north &&
      location.longitude >= KOREA_BOUNDS.west &&
      location.longitude <= KOREA_BOUNDS.east
    );
  }
}

export default new LocationService();