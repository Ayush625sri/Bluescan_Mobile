
// @ts-nocheck
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import Navigation from './src/navigation';
import { ErrorBoundary } from 'react-error-boundary';
import React from 'react';
import { View } from 'react-native';

function ErrorFallback({error}) {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Something went wrong:</Text>
      <Text>{error.message}</Text>
    </View>
  );
}


export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SafeAreaProvider>
        <AuthProvider>
          <Navigation />
          <StatusBar style="auto" />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}