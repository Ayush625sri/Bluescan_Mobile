// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getRecentUploads } from '../services/dataService';
import { PollutionData } from '../types';

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [recentUploads, setRecentUploads] = useState<PollutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecentUploads();
  }, []);

  const loadRecentUploads = async () => {
    try {
      setLoading(true);
      const data = await getRecentUploads();
      setRecentUploads(data);
    } catch (error) {
      console.error('Error loading recent uploads:', error);
      Alert.alert('Error', 'Failed to load recent submissions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRecentUploads();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.username || 'Explorer'}</Text>
            <Text style={styles.subgreeting}>Let's help keep our oceans clean!</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle" size={40} color="#0066FF" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Capture')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="camera" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Capture Pollution</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Trends')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="stats-chart" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>View Trends</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Submissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Submissions</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading recent uploads...</Text>
            </View>
          ) : recentUploads?.length > 0 ? (
            <FlatList
              data={recentUploads}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.uploadCard}>
                  <Image source={{ uri: item.thumbnailUrl }} style={styles.uploadImage} />
                  <View style={styles.uploadInfo}>
                    <Text style={styles.uploadType}>
                      {item.pollutionTypes.map(t => t.name).join(', ')}
                    </Text>
                    <Text style={styles.uploadDate}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No recent submissions</Text>
              }
            />
          ) : (
            <Text style={styles.emptyText}>No recent submissions</Text>
          )}
        </View>

        {/* Impact Stats */}
        <View style={styles.impactContainer}>
          <Text style={styles.impactTitle}>Your Impact</Text>
          <View style={styles.impactStats}>
            <View style={styles.impactStat}>
              <Text style={styles.impactValue}>{user?.contributionCount || 0}</Text>
              <Text style={styles.impactLabel}>Submissions</Text>
            </View>
            <View style={styles.impactStat}>
              <Text style={styles.impactValue}>{user?.contributionPoints || 0}</Text>
              <Text style={styles.impactLabel}>Points</Text>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  subgreeting: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  uploadCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadImage: {
    width: '100%',
    height: 120,
  },
  uploadInfo: {
    padding: 10,
  },
  uploadType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  uploadDate: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    padding: 20,
  },
  impactContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactStat: {
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066FF',
  },
  impactLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
});

export default HomeScreen;