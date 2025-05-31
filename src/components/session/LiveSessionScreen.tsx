// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import websocketService from '../../services/websocket';
import * as ImagePicker from 'expo-image-picker';
const STREAMING_INTERVAL = 500; // Send frames every 500ms

const LiveSessionScreen = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const { activeSession, endSession } = useAuth();

  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [flashMode, setFlashMode] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);

  const cameraRef = useRef(null);
  const streamingIntervalRef = useRef(null);

  const uploadImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true
    });

    if (!result.canceled) {
      try {
        const response = await api.post(`/session/${sessionId}/images`, {
          image: result.assets[0].base64,
          filename: 'gallery_image.jpg'
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        Alert.alert('Success', 'Image uploaded successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  };
  useEffect(() => {
    // Start streaming when component mounts
    startStreaming();

    return () => {
      stopStreaming();
    };
  }, []);

  const startStreaming = () => {
    if (streamingIntervalRef.current) return;

    streamingIntervalRef.current = setInterval(async () => {
      if (cameraRef.current && isStreaming) {
        try {
          // Take a picture
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.5,
            base64: true,
            skipProcessing: true,
          });

          // Resize to reduce data
          const processedImage = await ImageManipulator.manipulateAsync(
            photo.uri,
            [{ resize: { width: 640 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
          );

          // Send via websocket
          websocketService.emit('stream_frame', {
            session_id: sessionId,
            frame: processedImage.base64,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error('Error capturing frame:', error);
        }
      }
    }, STREAMING_INTERVAL);

    setIsStreaming(true);
  };

  const stopStreaming = () => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }

    setIsStreaming(false);
  };

  const toggleStreaming = () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  const captureHighResImage = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          base64: true
        });

        websocketService.emit('session_image', {
          session_id: sessionId,
          image: photo.base64,
          is_high_res: true,
          timestamp: Date.now()
        });

        Alert.alert('Success', 'High-resolution image sent for analysis');
      } catch (error) {
        console.error('Error capturing image:', error);
      }
    }
  };

  const handleEndSession = async () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: async () => {
            try {
              stopStreaming();
              await endSession();
              navigation.goBack();
            } catch (error) {
              console.error('Error ending session:', error);
            }
          }
        }
      ]
    );
  };

  const toggleCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  const toggleFlash = () => {
    setFlashMode(!flashMode);
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={isFrontCamera ? CameraType.front : CameraType.back}
        flashMode={flashMode ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off}
      >
        <View style={styles.header}>
          <View style={styles.streamingIndicator}>
            <View style={[styles.indicatorDot, { backgroundColor: isStreaming ? '#FF0000' : '#999999' }]} />
            <Text style={styles.streamingText}>{isStreaming ? 'STREAMING' : 'PAUSED'}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleCamera}>
            <Ionicons name="camera-reverse-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.streamButton, !isStreaming && styles.streamButtonPaused]}
            onPress={toggleStreaming}
          >
            <Ionicons name={isStreaming ? "pause" : "play"} size={30} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={captureHighResImage}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <Ionicons name={flashMode ? "flash" : "flash-off"} size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={uploadImageFromGallery}>
            <Ionicons name="images" size={28} color="#FFFFFF" />
          </TouchableOpacity>

        </View>

        <TouchableOpacity style={styles.endButton} onPress={handleEndSession}>
          <Text style={styles.endButtonText}>End Session</Text>
        </TouchableOpacity>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  streamingText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamButtonPaused: {
    backgroundColor: '#0066FF',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  endButton: {
    alignSelf: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  endButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default LiveSessionScreen;