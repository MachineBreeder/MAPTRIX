import { isPointInKorea } from '../data/koreaBounds';

class FogOfWarService {
  constructor() {
    this.fogOpacity = 0.85;
    this.exploredOpacity = 0.1;
    this.gradientSteps = 5;
  }

  // Fog of War 마스크 생성을 위한 데이터 계산
  calculateFogMask(exploredAreas, mapRegion, screenDimensions) {
    if (!mapRegion || !exploredAreas || exploredAreas.length === 0) {
      return {
        fullFog: true,
        exploredCircles: [],
        koreaBounds: this.calculateKoreaBoundsOnScreen(mapRegion, screenDimensions)
      };
    }

    const exploredCircles = exploredAreas.map(area => {
      const screenPos = this.latLngToScreen(
        area.center.latitude,
        area.center.longitude,
        mapRegion,
        screenDimensions
      );
      
      const radiusInPixels = this.metersToPixels(
        area.radius || 500,
        mapRegion,
        screenDimensions
      );

      return {
        id: area.id,
        x: screenPos.x,
        y: screenPos.y,
        radius: radiusInPixels,
        opacity: this.exploredOpacity
      };
    });

    return {
      fullFog: false,
      exploredCircles,
      koreaBounds: this.calculateKoreaBoundsOnScreen(mapRegion, screenDimensions)
    };
  }

  // 위경도를 화면 좌표로 변환
  latLngToScreen(latitude, longitude, mapRegion, screenDimensions) {
    if (!mapRegion) return { x: 0, y: 0 };

    const { 
      latitude: centerLat, 
      longitude: centerLng, 
      latitudeDelta, 
      longitudeDelta 
    } = mapRegion;

    const { width, height } = screenDimensions;

    // 지도 영역의 경계 계산
    const northLat = centerLat + latitudeDelta / 2;
    const southLat = centerLat - latitudeDelta / 2;
    const eastLng = centerLng + longitudeDelta / 2;
    const westLng = centerLng - longitudeDelta / 2;

    // 비례를 사용하여 화면 좌표 계산
    const x = ((longitude - westLng) / (eastLng - westLng)) * width;
    const y = ((northLat - latitude) / (northLat - southLat)) * height;

    return { x, y };
  }

  // 미터를 화면 픽셀로 변환
  metersToPixels(meters, mapRegion, screenDimensions) {
    if (!mapRegion) return 50;

    const { latitudeDelta } = mapRegion;
    const { height } = screenDimensions;

    // 위도 1도 ≈ 111,000미터
    const metersPerDegree = 111000;
    const pixelsPerDegree = height / latitudeDelta;
    const pixelsPerMeter = pixelsPerDegree / metersPerDegree;

    return meters * pixelsPerMeter;
  }

  // 한국 경계를 화면 좌표로 변환
  calculateKoreaBoundsOnScreen(mapRegion, screenDimensions) {
    if (!mapRegion) return null;

    // 한국의 대략적인 경계
    const koreaBounds = {
      north: 38.612446,
      south: 33.059665,
      east: 131.872755,
      west: 125.064141
    };

    const topLeft = this.latLngToScreen(
      koreaBounds.north,
      koreaBounds.west,
      mapRegion,
      screenDimensions
    );

    const bottomRight = this.latLngToScreen(
      koreaBounds.south,
      koreaBounds.east,
      mapRegion,
      screenDimensions
    );

    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    };
  }

  // SVG 경로 생성을 위한 헬퍼
  createSVGPath(exploredAreas, mapRegion, screenDimensions) {
    const circles = exploredAreas.map(area => {
      const screenPos = this.latLngToScreen(
        area.center.latitude,
        area.center.longitude,
        mapRegion,
        screenDimensions
      );
      
      const radius = this.metersToPixels(
        area.radius || 500,
        mapRegion,
        screenDimensions
      );

      return {
        cx: screenPos.x,
        cy: screenPos.y,
        r: radius
      };
    });

    return circles;
  }

  // 탐험 영역 병합 최적화
  mergeOverlappingAreas(exploredAreas) {
    if (!exploredAreas || exploredAreas.length <= 1) {
      return exploredAreas || [];
    }

    const merged = [];
    const processed = new Set();

    for (let i = 0; i < exploredAreas.length; i++) {
      if (processed.has(i)) continue;

      const currentArea = exploredAreas[i];
      const mergedArea = { ...currentArea };
      processed.add(i);

      // 인접한 영역 찾기
      for (let j = i + 1; j < exploredAreas.length; j++) {
        if (processed.has(j)) continue;

        const otherArea = exploredAreas[j];
        const distance = this.calculateDistance(
          currentArea.center.latitude,
          currentArea.center.longitude,
          otherArea.center.latitude,
          otherArea.center.longitude
        );

        // 두 원이 겹치거나 매우 가까우면 병합
        const combinedRadius = (currentArea.radius || 500) + (otherArea.radius || 500);
        if (distance < combinedRadius * 0.8) {
          // 더 큰 반지름으로 업데이트
          mergedArea.radius = Math.max(
            mergedArea.radius || 500,
            otherArea.radius || 500,
            distance / 2 + 100 // 약간의 여유 공간
          );
          processed.add(j);
        }
      }

      merged.push(mergedArea);
    }

    return merged;
  }

  // 두 지점 간 거리 계산 (미터)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // 지구 반지름 (미터)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // 화면 영역에 보이는 탐험 지역만 필터링 (성능 최적화)
  filterVisibleAreas(exploredAreas, mapRegion, screenDimensions) {
    if (!mapRegion || !exploredAreas) return [];

    const { 
      latitude: centerLat, 
      longitude: centerLng, 
      latitudeDelta, 
      longitudeDelta 
    } = mapRegion;

    // 현재 화면에 보이는 영역의 경계
    const visibleBounds = {
      north: centerLat + latitudeDelta / 2,
      south: centerLat - latitudeDelta / 2,
      east: centerLng + longitudeDelta / 2,
      west: centerLng - longitudeDelta / 2
    };

    // 여유 공간을 두고 필터링 (화면 밖 영역도 약간 포함)
    const margin = 0.1; // 10% 여유
    const expandedBounds = {
      north: visibleBounds.north + latitudeDelta * margin,
      south: visibleBounds.south - latitudeDelta * margin,
      east: visibleBounds.east + longitudeDelta * margin,
      west: visibleBounds.west - longitudeDelta * margin
    };

    return exploredAreas.filter(area => {
      const { latitude, longitude } = area.center;
      return (
        latitude >= expandedBounds.south &&
        latitude <= expandedBounds.north &&
        longitude >= expandedBounds.west &&
        longitude <= expandedBounds.east
      );
    });
  }

  // Fog 렌더링을 위한 최적화된 데이터 생성
  generateOptimizedFogData(exploredAreas, mapRegion, screenDimensions) {
    // 1. 화면에 보이는 영역만 필터링
    const visibleAreas = this.filterVisibleAreas(
      exploredAreas, 
      mapRegion, 
      screenDimensions
    );

    // 2. 겹치는 영역 병합
    const mergedAreas = this.mergeOverlappingAreas(visibleAreas);

    // 3. SVG 경로 데이터 생성
    const svgCircles = this.createSVGPath(
      mergedAreas, 
      mapRegion, 
      screenDimensions
    );

    // 4. 그라데이션 정보 생성
    const gradients = mergedAreas.map((area, index) => ({
      id: `fog-gradient-${index}`,
      cx: '50%',
      cy: '50%',
      r: '50%',
      stops: [
        { offset: '0%', stopColor: 'white', stopOpacity: 1 },
        { offset: '70%', stopColor: 'white', stopOpacity: 0.7 },
        { offset: '90%', stopColor: 'white', stopOpacity: 0.3 },
        { offset: '100%', stopColor: 'white', stopOpacity: 0 }
      ]
    }));

    return {
      circles: svgCircles,
      gradients,
      totalAreas: exploredAreas.length,
      visibleAreas: visibleAreas.length,
      optimizedAreas: mergedAreas.length
    };
  }

  // 성능 메트릭 계산
  calculatePerformanceMetrics(exploredAreas, optimizedData) {
    const originalCount = exploredAreas?.length || 0;
    const optimizedCount = optimizedData?.optimizedAreas || 0;
    const reductionPercentage = originalCount > 0 ? 
      ((originalCount - optimizedCount) / originalCount * 100).toFixed(1) : 0;

    return {
      originalAreaCount: originalCount,
      optimizedAreaCount: optimizedCount,
      reductionPercentage: `${reductionPercentage}%`,
      renderingComplexity: optimizedCount < 50 ? 'Low' : 
                          optimizedCount < 100 ? 'Medium' : 'High'
    };
  }
}

export default new FogOfWarService();