import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import CameraCapture from '../components/camera/CameraCapture';
import ImageReview from '../components/camera/ImageReview';
import { uploadPollutionImage } from '../services/dataService';
import { PollutionType } from '../types';

const CaptureScreen = ({ navigation }: any) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleCameraCapture = (imageUri : any, locationData: any) => {
    setCapturedImage(imageUri);
    setLocation(locationData);
    setIsCameraActive(false);
  };

  const handleGalleryPick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant gallery permissions to use this feature');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Now we need to get location for the image
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location is required to tag the pollution image');
        return;
      }
      
      const locationData = await Location.getCurrentPositionAsync({});
      setCapturedImage(result.assets[0].uri);
      setLocation({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude
      });
    }
  };

  const handleSubmit = async (pollutionTypes, notes) => {
    try {
      setUploading(true);
      await uploadPollutionImage(capturedImage, location, pollutionTypes, notes);
      setUploadSuccess(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setCapturedImage(null);
        setLocation(null);
      }, 2000);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const renderContent = () => {
    if (isCameraActive) {
      return (
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={() => setIsCameraActive(false)}
        />
      );
    }

    if (capturedImage && location) {
      return (
        <ImageReview
          imageUri={capturedImage}
          location={location}
          onSubmit={handleSubmit}
          onRetake={() => setCapturedImage(null)}
        />
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Capture Ocean Pollution</Text>
          <Text style={styles.subtitle}>Document plastic, chemical, or other pollution</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={() => setIsCameraActive(true)}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="camera" size={30} color="#FFFFFF" />
              </View>
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleGalleryPick}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="images" size={30} color="#FFFFFF" />
              </View>
              <Text style={styles.optionText}>Pick from Gallery</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>How It Works</Text>
            <View style={styles.infoItem}>
              <Ionicons name="camera-outline" size={24} color="#0066FF" />
              <Text style={styles.infoText}>Capture an image of ocean pollution</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={24} color="#0066FF" />
              <Text style={styles.infoText}>Automatically tag with GPS location</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="cloud-upload-outline" size={24} color="#0066FF" />
              <Text style={styles.infoText}>Submit for AI analysis</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="analytics-outline" size={24} color="#0066FF" />
              <Text style={styles.infoText}>View impact on pollution trends</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  };

  return (
    <>
      {renderContent()}
      
      {/* Upload Loading Modal */}
      <Modal
        transparent
        visible={uploading}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066FF" />
            <Text style={styles.loadingText}>Uploading pollution data...</Text>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        transparent
        visible={uploadSuccess}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            <Text style={styles.successText}>Upload Successful!</Text>
            <Text style={styles.successSubtext}>Thank you for contributing to cleaner oceans</Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
    marginBottom: 30,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  optionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  infoContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    width: '80%',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    color: '#333333',
  },
  successContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    width: '80%',
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333333',
  },
  successSubtext: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default CaptureScreen;