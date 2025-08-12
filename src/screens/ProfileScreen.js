import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ExplorationService from '../services/ExplorationService';

const ProfileScreen = () => {
  const [stats, setStats] = useState({
    totalAreasExplored: 0,
    explorationPercentage: 0,
    totalDistanceTraveled: 0,
    totalExperiencePoints: 0,
    regionsCovered: [],
  });
  const [exploredAreas, setExploredAreas] = useState([]);
  const [userLevel, setUserLevel] = useState(1);
  const [expToNextLevel, setExpToNextLevel] = useState(500);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedAreas = await AsyncStorage.getItem('exploredAreas');
      const savedStats = await AsyncStorage.getItem('explorationStats');
      
      if (savedAreas) {
        const areas = JSON.parse(savedAreas);
        setExploredAreas(areas);
        
        // 통계 재계산
        const calculatedStats = ExplorationService.calculateStats(areas);
        setStats(calculatedStats);
        
        // 레벨 계산
        const level = ExplorationService.calculateLevel(calculatedStats.totalExperiencePoints);
        const expNeeded = ExplorationService.getExperienceToNextLevel(calculatedStats.totalExperiencePoints);
        
        setUserLevel(level);
        setExpToNextLevel(expNeeded);
      }
      
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
    }
  };

  const resetAllData = () => {
    Alert.alert(
      '⚠️ 데이터 초기화',
      '모든 탐험 기록이 삭제됩니다. 정말 초기화하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['exploredAreas', 'explorationStats']);
              setStats({
                totalAreasExplored: 0,
                explorationPercentage: 0,
                totalDistanceTraveled: 0,
                totalExperiencePoints: 0,
                regionsCovered: [],
              });
              setExploredAreas([]);
              setUserLevel(1);
              setExpToNextLevel(500);
              Alert.alert('완료', '모든 데이터가 초기화되었습니다.');
            } catch (error) {
              Alert.alert('오류', '데이터 초기화에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const exportData = async () => {
    try {
      const exportData = {
        exploredAreas,
        stats,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
      
      // 실제로는 파일로 저장하거나 공유 기능 구현
      console.log('Export Data:', JSON.stringify(exportData, null, 2));
      Alert.alert('내보내기 완료', '데이터가 내보내기되었습니다.');
    } catch (error) {
      Alert.alert('오류', '데이터 내보내기에 실패했습니다.');
    }
  };

  const formatDistance = (meters) => {
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getLevelTitle = (level) => {
    const titles = {
      1: '초보 탐험가',
      2: '견습 탐험가',
      3: '숙련 탐험가',
      4: '전문 탐험가',
      5: '베테랑 탐험가',
      6: '마스터 탐험가',
      7: '그랜드 마스터',
      8: '전설의 탐험가',
      9: '한국 마스터',
      10: '탐험의 신',
    };
    return titles[level] || '탐험가';
  };

  return (
    <ScrollView style={styles.container}>
      {/* 프로필 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>탐험가 프로필</Text>
      </View>

      {/* 레벨 정보 */}
      <View style={styles.levelCard}>
        <Text style={styles.levelNumber}>Lv.{userLevel}</Text>
        <Text style={styles.levelTitle}>{getLevelTitle(userLevel)}</Text>
        <Text style={styles.expText}>
          {stats.totalExperiencePoints} EXP
          {expToNextLevel > 0 && ` (다음 레벨까지 ${expToNextLevel})`}
        </Text>
        
        {expToNextLevel > 0 && (
          <View style={styles.expBar}>
            <View 
              style={[
                styles.expFill,
                { 
                  width: `${((stats.totalExperiencePoints % 500) / 500) * 100}%` 
                }
              ]} 
            />
          </View>
        )}
      </View>

      {/* 탐험 통계 */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>탐험 통계</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>탐험한 지역</Text>
          <Text style={styles.statValue}>{stats.totalAreasExplored}개</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>한국 탐험률</Text>
          <Text style={styles.statValue}>{stats.explorationPercentage.toFixed(3)}%</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>총 이동 거리</Text>
          <Text style={styles.statValue}>{formatDistance(stats.totalDistanceTraveled)}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>획득 경험치</Text>
          <Text style={styles.statValue}>{stats.totalExperiencePoints} EXP</Text>
        </View>

        {stats.totalExploredAreaKm2 && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>탐험한 면적</Text>
            <Text style={styles.statValue}>{stats.totalExploredAreaKm2} km²</Text>
          </View>
        )}
      </View>

      {/* 지역별 현황 */}
      {stats.regionsCovered && stats.regionsCovered.length > 0 && (
        <View style={styles.regionsCard}>
          <Text style={styles.cardTitle}>탐험한 지역</Text>
          {stats.regionsCovered.map((region, index) => (
            <View key={index} style={styles.regionItem}>
              <Text style={styles.regionName}>🗺️ {region}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 업적 */}
      <View style={styles.achievementsCard}>
        <Text style={styles.cardTitle}>업적</Text>
        
        {stats.totalAreasExplored >= 10 && (
          <View style={styles.achievementItem}>
            <Text style={styles.achievementText}>🏆 첫 10곳 탐험 완료</Text>
          </View>
        )}
        
        {stats.explorationPercentage >= 1 && (
          <View style={styles.achievementItem}>
            <Text style={styles.achievementText}>🎯 한국의 1% 탐험 달성</Text>
          </View>
        )}
        
        {stats.totalDistanceTraveled >= 100000 && (
          <View style={styles.achievementItem}>
            <Text style={styles.achievementText}>🚶‍♂️ 100km 이동 달성</Text>
          </View>
        )}

        {userLevel >= 5 && (
          <View style={styles.achievementItem}>
            <Text style={styles.achievementText}>⭐ 베테랑 탐험가 달성</Text>
          </View>
        )}
        
        {stats.totalAreasExplored === 0 && (
          <Text style={styles.noAchievements}>아직 획득한 업적이 없습니다.</Text>
        )}
      </View>

      {/* 액션 버튼들 */}
      <View style={styles.actionsCard}>
        <TouchableOpacity style={styles.actionButton} onPress={exportData}>
          <Text style={styles.actionButtonText}>📤 데이터 내보내기</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]} 
          onPress={resetAllData}
        >
          <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
            🗑️ 모든 데이터 초기화
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Korea Explorer v1.0.0</Text>
        <Text style={styles.footerText}>대한민국 탐험을 시작하세요! 🇰🇷</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  levelCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
  },
  expText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  expBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
  },
  expFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  regionsCard: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  regionItem: {
    paddingVertical: 5,
  },
  regionName: {
    fontSize: 16,
    color: '#333',
  },
  achievementsCard: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  achievementItem: {
    paddingVertical: 8,
  },
  achievementText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  noAchievements: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  actionsCard: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  dangerButtonText: {
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default ProfileScreen;