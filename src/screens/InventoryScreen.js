import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InventoryScreen = () => {
  const [exploredAreas, setExploredAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadExploredAreas();
  }, []);

  const loadExploredAreas = async () => {
    try {
      const savedAreas = await AsyncStorage.getItem('exploredAreas');
      if (savedAreas) {
        const areas = JSON.parse(savedAreas);
        // 최신순으로 정렬
        areas.sort((a, b) => b.timestamp - a.timestamp);
        setExploredAreas(areas);
      }
    } catch (error) {
      console.error('탐험 지역 로드 오류:', error);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRegionEmoji = (regionName) => {
    const emojiMap = {
      '서울특별시': '🏙️',
      '부산광역시': '🌊',
      '대구광역시': '🏔️',
      '인천광역시': '✈️',
      '광주광역시': '🎭',
      '대전광역시': '🔬',
      '울산광역시': '🏭',
      '경기도': '🌆',
      '강원도': '⛰️',
      '충청북도': '🏞️',
      '충청남도': '🌾',
      '전라북도': '🍜',
      '전라남도': '🏝️',
      '경상북도': '🏯',
      '경상남도': '🌸',
      '제주특별자치도': '🍊',
    };
    return emojiMap[regionName] || '📍';
  };

  const getRarityColor = (experiencePoints) => {
    if (experiencePoints >= 180) return '#FF9800'; // 전설 (오렌지)
    if (experiencePoints >= 150) return '#9C27B0'; // 에픽 (보라)
    if (experiencePoints >= 120) return '#2196F3'; // 레어 (파랑)
    return '#4CAF50'; // 일반 (초록)
  };

  const getRarityText = (experiencePoints) => {
    if (experiencePoints >= 180) return '전설';
    if (experiencePoints >= 150) return '에픽';
    if (experiencePoints >= 120) return '레어';
    return '일반';
  };

  const openAreaDetails = (area) => {
    setSelectedArea(area);
    setModalVisible(true);
  };

  const renderAreaItem = ({ item }) => (
    <TouchableOpacity
      style={styles.areaItem}
      onPress={() => openAreaDetails(item)}
    >
      <View style={styles.areaHeader}>
        <View style={styles.areaInfo}>
          <Text style={styles.areaEmoji}>
            {getRegionEmoji(item.regionInfo?.name)}
          </Text>
          <View style={styles.areaText}>
            <Text style={styles.areaName}>
              {item.regionInfo?.name || '알 수 없는 지역'}
            </Text>
            <Text style={styles.areaCoords}>
              {item.regionInfo?.coordinates}
            </Text>
          </View>
        </View>
        
        <View style={styles.areaStats}>
          <View
            style={[
              styles.rarityBadge,
              { backgroundColor: getRarityColor(item.experiencePoints) }
            ]}
          >
            <Text style={styles.rarityText}>
              {getRarityText(item.experiencePoints)}
            </Text>
          </View>
          <Text style={styles.expText}>+{item.experiencePoints} EXP</Text>
        </View>
      </View>
      
      <Text style={styles.areaDate}>{formatDate(item.timestamp)}</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>🗺️</Text>
      <Text style={styles.emptyStateTitle}>탐험을 시작하세요!</Text>
      <Text style={styles.emptyStateText}>
        새로운 장소를 방문하여 대한민국을 탐험해보세요.
        탐험한 지역들이 여기에 기록됩니다.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>탐험 도감</Text>
        <Text style={styles.headerSubtitle}>
          {exploredAreas.length}개 지역 탐험 완료
        </Text>
      </View>

      <FlatList
        data={exploredAreas}
        renderItem={renderAreaItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* 상세 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedArea && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {getRegionEmoji(selectedArea.regionInfo?.name)} 탐험 기록
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>지역:</Text>
                    <Text style={styles.detailValue}>
                      {selectedArea.regionInfo?.name || '알 수 없는 지역'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>좌표:</Text>
                    <Text style={styles.detailValue}>
                      {selectedArea.center.latitude.toFixed(6)}, {' '}
                      {selectedArea.center.longitude.toFixed(6)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>탐험 시간:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedArea.timestamp)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>획득 경험치:</Text>
                    <Text style={[
                      styles.detailValue,
                      { color: getRarityColor(selectedArea.experiencePoints) }
                    ]}>
                      +{selectedArea.experiencePoints} EXP
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>등급:</Text>
                    <View
                      style={[
                        styles.rarityBadge,
                        { backgroundColor: getRarityColor(selectedArea.experiencePoints) }
                      ]}
                    >
                      <Text style={styles.rarityText}>
                        {getRarityText(selectedArea.experiencePoints)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>탐험 반경:</Text>
                    <Text style={styles.detailValue}>
                      {selectedArea.radius}m
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>GPS 정확도:</Text>
                    <Text style={styles.detailValue}>
                      ±{selectedArea.accuracy.toFixed(1)}m
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
  },
  areaItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  areaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  areaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  areaEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  areaText: {
    flex: 1,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  areaCoords: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  areaStats: {
    alignItems: 'flex-end',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  expText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  areaDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});

export default InventoryScreen;