//@ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { getUserContributions } from '../services/dataService';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const [contributions, setContributions] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    byType: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    try {
      setLoading(true);
      const data = await getUserContributions();
      setContributions(data);
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          onPress: signOut
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>{user?.username || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{contributions.total}</Text>
              <Text style={styles.statLabel}>Contributions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.contributionPoints || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityRow}>
              <Ionicons name="calendar" size={24} color="#0066FF" />
              <View style={styles.activityInfo}>
                <Text style={styles.activityLabel}>This Week</Text>
                <Text style={styles.activityValue}>{contributions.thisWeek} contributions</Text>
              </View>
            </View>
            <View style={styles.activityRow}>
              <Ionicons name="calendar" size={24} color="#0066FF" />
              <View style={styles.activityInfo}>
                <Text style={styles.activityLabel}>This Month</Text>
                <Text style={styles.activityValue}>{contributions.thisMonth} contributions</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingsRow}>
              <Ionicons name="person" size={24} color="#0066FF" />
              <Text style={styles.settingsLabel}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsRow}>
              <Ionicons name="notifications" size={24} color="#0066FF" />
              <Text style={styles.settingsLabel}>Notification Settings</Text>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsRow}>
              <Ionicons name="lock-closed" size={24} color="#0066FF" />
              <Text style={styles.settingsLabel}>Privacy Settings</Text>
              <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsRow} onPress={handleSignOut}>
              <Ionicons name="log-out" size={24} color="#F44336" />
              <Text style={[styles.settingsLabel, { color: '#F44336' }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              Bluescan is an ocean pollution detection platform that leverages advanced image processing and machine learning techniques to identify and track various types of ocean pollution.
            </Text>
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>Version 1.0.0</Text>
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
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  email: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    width: '80%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066FF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 15,
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
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  activityInfo: {
    marginLeft: 15,
    flex: 1,
  },
  activityLabel: {
    fontSize: 16,
    color: '#333333',
  },
  activityValue: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  settingsLabel: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    marginLeft: 15,
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aboutText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  versionInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#999999',
  },
});

export default ProfileScreen;