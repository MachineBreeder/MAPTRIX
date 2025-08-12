import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ExplorationStats = ({ stats }) => {
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatPercentage = (percentage) => {
    return `${percentage.toFixed(2)}%`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalAreasExplored}</Text>
          <Text style={styles.statLabel}>탐험 지역</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatPercentage(stats.explorationPercentage)}</Text>
          <Text style={styles.statLabel}>한국 탐험률</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDistance(stats.totalDistanceTraveled)}</Text>
          <Text style={styles.statLabel}>이동 거리</Text>
        </View>
      </View>
      
      {stats.explorationPercentage > 0 && (
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(stats.explorationPercentage, 100)}%` }
            ]} 
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
});

export default ExplorationStats;