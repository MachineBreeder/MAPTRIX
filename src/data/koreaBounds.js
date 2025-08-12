// 대한민국 경계 데이터 (GeoJSON 형태)
export const KOREA_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "대한민국",
        name_en: "South Korea",
        iso_code: "KR"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            // 서해안 (서쪽 경계)
            [125.064141, 37.905],    // 백령도 근처
            [125.764, 37.654],       // 강화도
            [126.375, 37.566],       // 인천
            [126.423, 37.223],       // 서울 서쪽
            [126.734, 36.995],       // 경기도 서쪽
            [126.456, 36.321],       // 충남 서해안
            [126.123, 35.987],       // 전북 서해안
            [126.087, 35.456],       // 전남 서해안
            [125.987, 34.887],       // 목포 근처
            [126.234, 34.234],       // 진도
            [126.543, 33.887],       // 완도
            
            // 남해안 (남쪽 경계)
            [127.234, 34.123],       // 여수
            [128.123, 34.456],       // 통영
            [128.876, 34.887],       // 창원
            [129.234, 35.123],       // 부산
            [129.456, 35.234],       // 울산
            
            // 동해안 (동쪽 경계)
            [129.567, 35.567],       // 경주
            [129.234, 36.234],       // 포항
            [129.123, 36.987],       // 울진
            [128.987, 37.456],       // 동해
            [128.876, 37.887],       // 강릉
            [128.654, 38.234],       // 속초
            [128.456, 38.456],       // 고성
            [128.234, 38.612446],    // 최북단 (휴전선)
            
            // 북쪽 경계 (휴전선)
            [127.987, 38.612446],
            [127.456, 38.567],
            [126.987, 38.456],
            [126.456, 38.234],
            [125.987, 38.123],
            [125.564, 37.987],
            [125.064141, 37.905]     // 시작점으로 돌아감
          ]
        ]
      }
    },
    // 제주도
    {
      type: "Feature",
      properties: {
        name: "제주특별자치도",
        name_en: "Jeju Island",
        iso_code: "KR-49"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [126.161, 33.457],      // 제주도 서쪽
            [126.287, 33.231],      // 제주도 남서쪽
            [126.567, 33.059665],   // 마라도 (최남단)
            [126.876, 33.123],      // 제주도 남동쪽
            [126.987, 33.287],      // 제주도 동쪽
            [126.823, 33.487],      // 제주도 북동쪽
            [126.567, 33.567],      // 제주도 북쪽
            [126.287, 33.523],      // 제주도 북서쪽
            [126.161, 33.457]       // 시작점으로 돌아감
          ]
        ]
      }
    },
    // 독도
    {
      type: "Feature",
      properties: {
        name: "독도",
        name_en: "Dokdo",
        iso_code: "KR-DOKDO"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [131.872755, 37.244],   // 독도 (최동단)
            [131.873, 37.245],
            [131.874, 37.244],
            [131.873, 37.243],
            [131.872755, 37.244]
          ]
        ]
      }
    }
  ]
};

// 대한민국 행정구역별 중심 좌표
export const KOREA_REGIONS = {
  "서울특별시": { lat: 37.5665, lng: 126.9780, zoom: 11 },
  "부산광역시": { lat: 35.1796, lng: 129.0756, zoom: 11 },
  "대구광역시": { lat: 35.8714, lng: 128.6014, zoom: 11 },
  "인천광역시": { lat: 37.4563, lng: 126.7052, zoom: 11 },
  "광주광역시": { lat: 35.1595, lng: 126.8526, zoom: 11 },
  "대전광역시": { lat: 36.3504, lng: 127.3845, zoom: 11 },
  "울산광역시": { lat: 35.5384, lng: 129.3114, zoom: 11 },
  "세종특별자치시": { lat: 36.4800, lng: 127.2890, zoom: 12 },
  "경기도": { lat: 37.4138, lng: 127.5183, zoom: 9 },
  "강원도": { lat: 37.8228, lng: 128.1555, zoom: 9 },
  "충청북도": { lat: 36.6356, lng: 127.4914, zoom: 9 },
  "충청남도": { lat: 36.5184, lng: 126.8000, zoom: 9 },
  "전라북도": { lat: 35.7175, lng: 127.1530, zoom: 9 },
  "전라남도": { lat: 34.8679, lng: 126.9910, zoom: 9 },
  "경상북도": { lat: 36.4919, lng: 128.8889, zoom: 9 },
  "경상남도": { lat: 35.4606, lng: 128.2132, zoom: 9 },
  "제주특별자치도": { lat: 33.4996, lng: 126.5312, zoom: 10 }
};

// Point-in-Polygon 알고리즘을 사용한 한국 경계 확인
export const isPointInKorea = (latitude, longitude) => {
  // 각 Feature(본토, 제주도, 독도)에 대해 확인
  for (const feature of KOREA_GEOJSON.features) {
    if (isPointInPolygon(latitude, longitude, feature.geometry.coordinates[0])) {
      return true;
    }
  }
  return false;
};

// Point-in-Polygon 알고리즘 구현
const isPointInPolygon = (latitude, longitude, polygon) => {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]; // longitude
    const yi = polygon[i][1]; // latitude
    const xj = polygon[j][0]; // longitude
    const yj = polygon[j][1]; // latitude
    
    if (((yi > latitude) !== (yj > latitude)) && 
        (longitude < (xj - xi) * (latitude - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
};

// 좌표가 어느 지역에 속하는지 확인 (간단한 버전)
export const getRegionFromCoords = (latitude, longitude) => {
  // 대략적인 지역 구분 (더 정확한 구분을 위해서는 상세한 GeoJSON 필요)
  if (latitude >= 37.4 && latitude <= 37.7 && longitude >= 126.8 && longitude <= 127.2) {
    return '서울특별시';
  } else if (latitude >= 35.0 && latitude <= 35.4 && longitude >= 129.0 && longitude <= 129.4) {
    return '부산광역시';
  } else if (latitude >= 35.7 && latitude <= 36.0 && longitude >= 128.5 && longitude <= 128.9) {
    return '대구광역시';
  } else if (latitude >= 37.3 && latitude <= 37.6 && longitude >= 126.6 && longitude <= 126.8) {
    return '인천광역시';
  } else if (latitude >= 35.0 && latitude <= 35.3 && longitude >= 126.7 && longitude <= 127.0) {
    return '광주광역시';
  } else if (latitude >= 36.2 && latitude <= 36.5 && longitude >= 127.3 && longitude <= 127.5) {
    return '대전광역시';
  } else if (latitude >= 35.4 && latitude <= 35.7 && longitude >= 129.2 && longitude <= 129.4) {
    return '울산광역시';
  } else if (latitude >= 36.4 && latitude <= 36.6 && longitude >= 127.2 && longitude <= 127.4) {
    return '세종특별자치시';
  } else if (latitude >= 37.0 && latitude <= 38.2 && longitude >= 126.5 && longitude <= 127.8) {
    return '경기도';
  } else if (latitude >= 37.0 && latitude <= 38.6 && longitude >= 127.8 && longitude <= 129.4) {
    return '강원도';
  } else if (latitude >= 36.2 && latitude <= 37.2 && longitude >= 127.4 && longitude <= 128.5) {
    return '충청북도';
  } else if (latitude >= 36.0 && latitude <= 37.0 && longitude >= 126.3 && longitude <= 127.7) {
    return '충청남도';
  } else if (latitude >= 35.4 && latitude <= 36.2 && longitude >= 126.4 && longitude <= 127.8) {
    return '전라북도';
  } else if (latitude >= 34.2 && latitude <= 35.8 && longitude >= 126.0 && longitude <= 127.7) {
    return '전라남도';
  } else if (latitude >= 35.7 && latitude <= 37.5 && longitude >= 128.3 && longitude <= 129.6) {
    return '경상북도';
  } else if (latitude >= 34.8 && latitude <= 36.2 && longitude >= 127.8 && longitude <= 129.3) {
    return '경상남도';
  } else if (latitude >= 33.0 && latitude <= 33.6 && longitude >= 126.1 && longitude <= 127.0) {
    return '제주특별자치도';
  }
  
  return '알 수 없는 지역';
};

// 지역별 특색 정보
export const REGION_INFO = {
  "서울특별시": {
    emoji: "🏙️",
    description: "대한민국의 수도",
    specialties: ["경복궁", "남산타워", "한강", "명동"],
    color: "#FF5722"
  },
  "부산광역시": {
    emoji: "🌊",
    description: "항구도시",
    specialties: ["해운대", "부산타워", "자갈치시장", "태종대"],
    color: "#2196F3"
  },
  "제주특별자치도": {
    emoji: "🍊",
    description: "아름다운 섬",
    specialties: ["한라산", "성산일출봉", "협재해수욕장", "한라봉"],
    color: "#FF9800"
  },
  "경기도": {
    emoji: "🌆",
    description: "수도권",
    specialties: ["수원화성", "에버랜드", "DMZ", "한강"],
    color: "#4CAF50"
  },
  "강원도": {
    emoji: "⛰️", 
    description: "산과 바다의 고장",
    specialties: ["설악산", "강릉", "평창", "속초"],
    color: "#607D8B"
  }
  // 다른 지역들도 추가 가능
};

export default {
  KOREA_GEOJSON,
  KOREA_REGIONS,
  isPointInKorea,
  getRegionFromCoords,
  REGION_INFO
};