import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TrendViewer from '../components/trends/TrendViewer';

const TrendsScreen = () => {
  const [timeframe, setTimeframe] = useState('week');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Pollution Trends</Text>
          <Text style={styles.subtitle}>Track and analyze pollution patterns</Text>
        </View>

        <View style={styles.timeframeContainer}>
          <TouchableOpacity
            style={[
              styles.timeframeButton,
              timeframe === 'week' && styles.activeTimeframe
            ]}
            onPress={() => setTimeframe('week')}
          >
            <Text
              style={[
                styles.timeframeText,
                timeframe === 'week' && styles.activeTimeframeText
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeframeButton,
              timeframe === 'month' && styles.activeTimeframe
            ]}
            onPress={() => setTimeframe('month')}
          >
            <Text
              style={[
                styles.timeframeText,
                timeframe === 'month' && styles.activeTimeframeText
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeframeButton,
              timeframe === 'year' && styles.activeTimeframe
            ]}
            onPress={() => setTimeframe('year')}
          >
            <Text
              style={[
                styles.timeframeText,
                timeframe === 'year' && styles.activeTimeframeText
              ]}
            >
              Year
            </Text>
          </TouchableOpacity>
        </View>

        <TrendViewer />

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="information-circle" size={24} color="#0066FF" />
            <Text style={styles.infoCardTitle}>How to Interpret</Text>
          </View>
          <Text style={styles.infoCardText}>
            The trends show the concentration of pollution detected in your monitored areas over time.
            Upward trends indicate increasing pollution, while downward trends show improvement.
            Regular monitoring helps build a more complete picture of ocean health.
          </Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionCardTitle}>Take Action</Text>
          <View style={styles.actionItem}>
            <Ionicons name="camera" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>
              Contribute more data by capturing pollution images
            </Text>
          </View>
          <View style={styles.actionItem}>
            <Ionicons name="share-social" size={24} color="#FF9800" />
            <Text style={styles.actionText}>
              Share these trends with others to raise awareness
            </Text>
          </View>
          <View style={styles.actionItem}>
            <Ionicons name="people" size={24} color="#9C27B0" />
            <Text style={styles.actionText}>
              Join local cleanup initiatives in pollution hotspots
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  timeframeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTimeframe: {
    backgroundColor: '#0066FF',
  },
  timeframeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  activeTimeframeText: {
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333333',
  },
  infoCardText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  actionText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 15,
    flex: 1,
  },
});

export default TrendsScreen;