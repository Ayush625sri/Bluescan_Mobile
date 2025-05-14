// @ts-nocheck
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import CaptureScreen from '../screens/CaptureScreen';
import TrendsScreen from '../screens/TrendsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LiveSessionScreen from '../components/session/LiveSessionScreen';
import SessionRequestModal from '../components/session/SessionRequestModal';
import { useAuth } from '../contexts/AuthContext';

const AuthStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const CaptureStack = createStackNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

const CaptureNavigator = () => (
  <CaptureStack.Navigator>
    <CaptureStack.Screen 
      name="CaptureMain" 
      component={CaptureScreen}
      options={{ title: 'Capture Pollution' }}
    />
    <CaptureStack.Screen 
      name="LiveSession" 
      component={LiveSessionScreen}
      options={{ 
        title: 'Live Session',
        headerShown: false
      }}
    />
  </CaptureStack.Navigator>
);

const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Capture') {
          iconName = focused ? 'camera' : 'camera-outline';
        } else if (route.name === 'Trends') {
          iconName = focused ? 'stats-chart' : 'stats-chart-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#0066FF',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen 
      name="Capture" 
      component={CaptureNavigator} 
      options={{ headerShown: false }}
    />
    <Tab.Screen name="Trends" component={TrendsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const Navigation = () => {
  const { user, loading, activeSession } = useAuth();
  
  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <AppNavigator />
      {/* {user ? <AppNavigator /> : <AuthNavigator />} */}
      
      {/* Session request modal */}
      {activeSession && activeSession.status === 'pending' && (
        <SessionRequestModal visible={true} />
      )}
    </NavigationContainer>
  );
};


export default Navigation;