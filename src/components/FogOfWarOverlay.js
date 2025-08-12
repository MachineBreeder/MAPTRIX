import React, { useEffect, useRef } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Defs, Mask, Rect, Circle, RadialGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const FogOfWarOverlay = ({ exploredAreas, koreaBounds, mapRegion }) => {
  const svgRef = useRef(null);

  // 좌표를 화면 픽셀로 변환
  const latLngToPixel = (latitude, longitude) => {
    if (!mapRegion) return { x: 0, y: 0 };
    
    const { latitude: centerLat, longitude: centerLng, latitudeDelta, longitudeDelta } = mapRegion;
    
    const x = ((longitude - (centerLng - longitudeDelta / 2)) / longitudeDelta) * width;
    const y = ((centerLat + latitudeDelta / 2 - latitude) / latitudeDelta) * height;
    
    return { x, y };
  };

  // 미터를 픽셀로 변환
  const metersToPixels = (meters) => {
    if (!mapRegion) return 50;
    
    // 대략적인 변환 (위도 1도 ≈ 111km)
    const metersPerPixel = (mapRegion.latitudeDelta * 111000) / height;
    return meters / metersPerPixel;
  };

  const renderFogMask = () => {
    const maskElements = [];
    
    // 각 탐험된 지역에 대해 투명한 원을 생성
    exploredAreas.forEach((area, index) => {
      const pixelPos = latLngToPixel(area.center.latitude, area.center.longitude);
      const radius = metersToPixels(area.radius || 500);
      
      maskElements.push(
        <Circle
          key={`explored-${index}`}
          cx={pixelPos.x}
          cy={pixelPos.y}
          r={radius}
          fill="white"
          opacity={0.8}
        />
      );
      
      // 부드러운 경계를 위한 그라데이션 원
      maskElements.push(
        <Circle
          key={`gradient-${index}`}
          cx={pixelPos.x}
          cy={pixelPos.y}
          r={radius * 1.2}
          fill={`url(#fogGradient-${index})`}
        />
      );
    });

    return maskElements;
  };

  const renderGradients = () => {
    return exploredAreas.map((area, index) => (
      <RadialGradient
        key={`gradient-def-${index}`}
        id={`fogGradient-${index}`}
        cx="50%"
        cy="50%"
        r="50%"
      >
        <Stop offset="0%" stopColor="white" stopOpacity="0.6" />
        <Stop offset="70%" stopColor="white" stopOpacity="0.3" />
        <Stop offset="100%" stopColor="white" stopOpacity="0" />
      </RadialGradient>
    ));
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        pointerEvents: 'none',
      }}
    >
      <Svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ position: 'absolute' }}
      >
        <Defs>
          {/* 마스크 정의 */}
          <Mask id="fogMask">
            {/* 기본적으로 모든 영역을 검은색(가려짐)으로 설정 */}
            <Rect width={width} height={height} fill="black" />
            {/* 탐험된 영역을 흰색(보임)으로 설정 */}
            {renderFogMask()}
          </Mask>
          
          {/* 그라데이션 정의 */}
          {renderGradients()}
        </Defs>

        {/* Fog 오버레이 - 한국 외부는 완전히 가려짐 */}
        <Rect
          width={width}
          height={height}
          fill="rgba(0, 0, 0, 0.85)"
          mask="url(#fogMask)"
        />
        
        {/* 한국 실루엣 표시를 위한 테두리 (선택사항) */}
        <Rect
          width={width}
          height={height}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
};

export default FogOfWarOverlay;