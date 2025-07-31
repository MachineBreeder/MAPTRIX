import LocationService from './LocationService';

class ExplorationService {
  constructor() {
    this.EXPLORATION_RADIUS = 500; // 500미터 반경
    this.MIN_EXPLORATION_DISTANCE = 100; // 최소 100미터 떨어져야 새 지역
    this.KOREA_TOTAL_AREA = 100210; // 대한민국 총 면적 (km²)
  }

  // 새로운 탐험 지역 확인
  checkNewExploration(currentLocation, existingAreas) {
    // 정확도가 낮으면 무시
    if (!LocationService.isLocationAccurate(currentLocation)) {
      return null;
    }

    // 한국 경계 내부가 아니면 무시
    if (!LocationService.isLocationInKorea(currentLocation)) {
      return null;
    }

    // 기존 탐험 지역과 너무 가까우면 무시
    const isNearExistingArea = existingAreas.some(area => {
      const distance = LocationService.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        area.center.latitude,
        area.center.longitude
      );
      return distance < this.MIN_EXPLORATION_DISTANCE;
    });

    if (isNearExistingArea) {
      return null;
    }

    // 새로운 탐험 지역 생성
    const newArea = {
      id: this.generateAreaId(),
      center: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
      radius: this.EXPLORATION_RADIUS,
      timestamp: Date.now(),
      accuracy: currentLocation.accuracy,
      experiencePoints: this.calculateExperiencePoints(currentLocation),
      regionInfo: this.getRegionInfo(currentLocation),
    };

    return newArea;
  }

  // 지역 ID 생성
  generateAreaId() {
    return `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 경험치 계산
  calculateExperiencePoints(location) {
    let basePoints = 100;
    
    // 정확도에 따른 보너스
    if (location.accuracy <= 10) basePoints += 50;
    else if (location.accuracy <= 20) basePoints += 25;
    
    // 랜덤 보너스 (1-50점)
    const randomBonus = Math.floor(Math.random() * 50) + 1;
    
    return basePoints + randomBonus;
  }

  // 지역 정보 가져오기 (간단한 버전)
  getRegionInfo(location) {
    const { latitude, longitude } = location;
    
    // 대략적인 지역 구분 (실제로는 역지오코딩 API 사용)
    let region = '알 수 없는 지역';
    
    if (latitude >= 37.4 && latitude <= 37.7 && longitude >= 126.8 && longitude <= 127.2) {
      region = '서울특별시';
    } else if (latitude >= 35.0 && latitude <= 35.4 && longitude >= 129.0 && longitude <= 129.4) {
      region = '부산광역시';
    } else if (latitude >= 37.2 && latitude <= 37.8 && longitude >= 126.6 && longitude <= 127.6) {
      region = '경기도';
    } else if (latitude >= 35.7 && latitude <= 36.0 && longitude >= 128.0 && longitude <= 129.5) {
      region = '경상북도';
    } else if (latitude >= 34.7 && latitude <= 35.3 && longitude >= 126.4 && longitude <= 127.6) {
      region = '전라남도';
    }
    
    return {
      name: region,
      coordinates: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    };
  }

  // 탐험 통계 계산
  calculateStats(exploredAreas) {
    if (!exploredAreas || exploredAreas.length === 0) {
      return {
        totalAreasExplored: 0,
        explorationPercentage: 0,
        totalDistanceTraveled: 0,
        totalExperiencePoints: 0,
        averageAccuracy: 0,
        regionsCovered: [],
      };
    }

    // 총 탐험 지역 수
    const totalAreasExplored = exploredAreas.length;

    // 총 탐험 면적 계산 (간단한 원형 면적의 합)
    const totalExploredArea = exploredAreas.reduce((total, area) => {
      const areaInKm2 = (Math.PI * Math.pow(area.radius / 1000, 2));
      return total + areaInKm2;
    }, 0);

    // 탐험 비율 (한국 전체 면적 대비)
    const explorationPercentage = (totalExploredArea / this.KOREA_TOTAL_AREA * 100);

    // 총 이동 거리 계산 (순서대로 연결했을 때)
    let totalDistanceTraveled = 0;
    for (let i = 1; i < exploredAreas.length; i++) {
      const prev = exploredAreas[i - 1];
      const curr = exploredAreas[i];
      
      const distance = LocationService.calculateDistance(
        prev.center.latitude,
        prev.center.longitude,
        curr.center.latitude,
        curr.center.longitude
      );
      
      totalDistanceTraveled += distance;
    }

    // 총 경험치
    const totalExperiencePoints = exploredAreas.reduce((total, area) => {
      return total + (area.experiencePoints || 0);
    }, 0);

    // 평균 정확도
    const averageAccuracy = exploredAreas.reduce((total, area) => {
      return total + (area.accuracy || 0);
    }, 0) / exploredAreas.length;

    // 커버된 지역들
    const regionsCovered = [...new Set(exploredAreas.map(area => area.regionInfo?.name).filter(Boolean))];

    return {
      totalAreasExplored,
      explorationPercentage: Math.min(explorationPercentage, 100), // 최대 100%
      totalDistanceTraveled: Math.round(totalDistanceTraveled),
      totalExperiencePoints,
      averageAccuracy: Math.round(averageAccuracy * 10) / 10,
      regionsCovered,
      totalExploredAreaKm2: Math.round(totalExploredArea * 100) / 100,
    };
  }

  // 탐험 레벨 계산
  calculateLevel(experiencePoints) {
    if (experiencePoints < 500) return 1;
    if (experiencePoints < 1500) return 2;
    if (experiencePoints < 3000) return 3;
    if (experiencePoints < 5000) return 4;
    if (experiencePoints < 8000) return 5;
    if (experiencePoints < 12000) return 6;
    if (experiencePoints < 17000) return 7;
    if (experiencePoints < 23000) return 8;
    if (experiencePoints < 30000) return 9;
    return 10; // 최대 레벨
  }

  // 다음 레벨까지 필요한 경험치
  getExperienceToNextLevel(currentExperience) {
    const currentLevel = this.calculateLevel(currentExperience);
    
    if (currentLevel >= 10) return 0; // 최대 레벨
    
    const nextLevelRequirements = [500, 1500, 3000, 5000, 8000, 12000, 17000, 23000, 30000];
    return nextLevelRequirements[currentLevel - 1] - currentExperience;
  }

  // 지역별 완성도 계산
  calculateRegionCompletion(exploredAreas, targetRegion) {
    const regionAreas = exploredAreas.filter(area => 
      area.regionInfo?.name === targetRegion
    );
    
    // 간단한 완성도 계산 (실제로는 더 복잡한 로직 필요)
    const baseCompletion = Math.min(regionAreas.length * 5, 100);
    
    return {
      region: targetRegion,
      areasExplored: regionAreas.length,
      completionPercentage: baseCompletion,
      lastExplored: regionAreas.length > 0 ? 
        new Date(Math.max(...regionAreas.map(a => a.timestamp))) : null,
    };
  }

  // 추천 탐험 지역 생성
  getSuggestedExplorations(userLocation, exploredAreas) {
    const suggestions = [];
    
    // 유명 관광지 좌표들 (실제로는 데이터베이스에서 가져오기)
    const famousLocations = [
      { name: '경복궁', lat: 37.5796, lng: 126.9770, region: '서울특별시' },
      { name: '부산타워', lat: 35.1013, lng: 129.0320, region: '부산광역시' },
      { name: '제주 한라산', lat: 33.3617, lng: 126.5292, region: '제주특별자치도' },
    ];

    famousLocations.forEach(location => {
      const distance = LocationService.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        location.lat,
        location.lng
      );

      // 이미 탐험한 곳인지 확인
      const alreadyExplored = exploredAreas.some(area => {
        const distanceToExplored = LocationService.calculateDistance(
          area.center.latitude,
          area.center.longitude,
          location.lat,
          location.lng
        );
        return distanceToExplored < this.EXPLORATION_RADIUS;
      });

      if (!alreadyExplored) {
        suggestions.push({
          ...location,
          distance: Math.round(distance),
          difficulty: distance > 100000 ? 'hard' : distance > 50000 ? 'medium' : 'easy',
        });
      }
    });

    return suggestions.sort((a, b) => a.distance - b.distance).slice(0, 5);
  }
}

export default new ExplorationService();