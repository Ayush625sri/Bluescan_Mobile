// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Camera , CameraType} from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
interface CameraCaptureProps {
  onCapture: (imageUri: string, location: { latitude: number; longitude: number }) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);


const cameraRef = useRef<Camera>(null);
  useEffect(() => {
    (async () => {
      // Request camera permission
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      
      // Request location permission
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      
      setHasPermission(
        cameraStatus === 'granted' && locationStatus === 'granted'
      );
      
      if (locationStatus === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      }
    })();
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current && cameraReady && !capturing) {
      try {
        setCapturing(true);
        
        // Take photo
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        // Get current location
        if (!location) {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation(currentLocation);
          
          if (currentLocation) {
            onCapture(photo.uri, {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            });
          } else {
            Alert.alert('Location Error', 'Unable to get your current location.');
          }
        } else {
          onCapture(photo.uri, {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Error capturing image:', error);
        Alert.alert('Error', 'Failed to capture image. Please try again.');
      } finally {
        setCapturing(false);
      }
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera and location permissions are required.</Text>
        <TouchableOpacity style={styles.button} onPress={onCancel}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.back}
        onCameraReady={() => setCameraReady(true)}
      >
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture} disabled={capturing}>
            {capturing ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Ionicons name="camera" size={40} color="white" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          
          <View style={styles.locationIndicator}>
            <Ionicons 
              name="location" 
              size={20} 
              color={location ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.locationText}>
              {location ? "GPS Ready" : "No GPS Signal"}
            </Text>
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
  },
  captureButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,102,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIndicator: {
    position: 'absolute',
    top: 30,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  locationText: {
    color: 'white',
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#0066FF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
});

export default CameraCapture;