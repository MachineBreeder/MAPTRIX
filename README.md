# Korea Explorer - 대한민국 탐험기

React Native로 개발된 위치 기반 탐험 게임입니다.

## 🎮 주요 기능

- **실시간 위치 추적** - GPS 기반 실시간 위치 추적
- **Fog of War** - 미탐험 지역을 어둡게 표시
- **탐험 시스템** - 500m 반경 탐험 지역 생성
- **레벨링** - 경험치 기반 10레벨 시스템
- **통계 추적** - 탐험률, 이동거리, 지역 수 등
- **도감 시스템** - 탐험한 지역 기록 및 등급 분류
- **업적 시스템** - 다양한 업적 달성

## 🛠️ 기술 스택

- React Native 0.72
- React Navigation 6
- React Native Maps
- React Native SVG
- AsyncStorage
- Geolocation Service

## 📱 설치 및 실행

### 필수 요구사항
- Node.js (14 이상)
- React Native CLI
- Android Studio (Android 개발 시)
- Xcode (iOS 개발 시)

### 설치
```bash
npm install
```

### Android 실행
```bash
npm run android
```

### iOS 실행
```bash
npm run ios
```

## 📁 프로젝트 구조

```
KoreaExplorer-Clean/
├── App.js                      # 메인 앱 컴포넌트
├── index.js                    # 앱 진입점
├── package.json                # 의존성 관리
├── src/
│   ├── screens/               # 화면 컴포넌트
│   │   ├── MapScreen.js      # 지도 화면
│   │   ├── ProfileScreen.js  # 프로필 화면
│   │   └── InventoryScreen.js # 도감 화면
│   ├── services/             # 서비스 클래스
│   │   ├── LocationService.js # 위치 서비스
│   │   ├── ExplorationService.js # 탐험 로직
│   │   └── FogOfWarService.js # Fog of War 렌더링
│   ├── components/           # UI 컴포넌트
│   │   ├── FogOfWarOverlay.js # Fog of War 오버레이
│   │   └── ExplorationStats.js # 탐험 통계
│   └── data/
│       └── koreaBounds.js    # 한국 지리 데이터
└── android/                  # Android 빌드 설정
```

## 🎯 게임 시스템

### 탐험 시스템
- 새로운 위치 방문 시 500m 반경의 탐험 지역 생성
- 기존 탐험 지역과 100m 이상 떨어져야 새 지역으로 인정
- 위치 정확도에 따른 경험치 보너스

### 레벨 시스템
- 1레벨: 0-500 EXP
- 2레벨: 500-1500 EXP
- 최대 10레벨까지

### 등급 시스템
- 일반: 100-119 EXP
- 레어: 120-149 EXP  
- 에픽: 150-179 EXP
- 전설: 180+ EXP

## 📋 라이선스

MIT License