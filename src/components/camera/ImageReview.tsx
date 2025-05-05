import React, { useState } from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PollutionType } from '../../types';

interface ImageReviewProps {
  imageUri: string;
  location: { latitude: number; longitude: number };
  onSubmit: (pollutionTypes: PollutionType[], notes: string) => void;
  onRetake: () => void;
}

// Pollution types from the architecture document
const pollutionTypes: PollutionType[] = [
  { id: 'plastic', name: 'Plastic Debris', color: '#FF9800' },
  { id: 'microplastic', name: 'Microplastics', color: '#F44336' },
  { id: 'oil', name: 'Oil Spill', color: '#673AB7' },
  { id: 'chemical', name: 'Chemical Contamination', color: '#4CAF50' },
  { id: 'algal', name: 'Algal Bloom', color: '#2196F3' }
];

const ImageReview: React.FC<ImageReviewProps> = ({ imageUri, location, onSubmit, onRetake }) => {
  const [selectedTypes, setSelectedTypes] = useState<PollutionType[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const togglePollutionType = (type: PollutionType) => {
    if (selectedTypes.some(t => t.id === type.id)) {
      setSelectedTypes(selectedTypes.filter(t => t.id !== type.id));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    // Simulate network delay
    setTimeout(() => {
      onSubmit(selectedTypes, notes);
      setSubmitting(false);
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.locationTag}>
          <Ionicons name="location" size={16} color="#FFFFFF" />
          <Text style={styles.locationText}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Identify Pollution Types</Text>
        <View style={styles.typeContainer}>
          {pollutionTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                selectedTypes.some(t => t.id === type.id) && { backgroundColor: type.color }
              ]}
              onPress={() => togglePollutionType(type)}
            >
              <Text
                style={[
                  styles.typeText,
                  selectedTypes.some(t => t.id === type.id) && styles.selectedTypeText
                ]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
          <Ionicons name="camera-reverse" size={24} color="#0066FF" />
          <Text style={styles.retakeText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, selectedTypes.length === 0 && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={selectedTypes.length === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
              <Text style={styles.submitText}>Submit</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  locationTag: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
  },
  locationText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 12,
  },
  sectionContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  typeButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 5,
  },
  typeText: {
    color: '#333333',
    fontWeight: '500',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 10,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0066FF',
  },
  retakeText: {
    color: '#0066FF',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066FF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ImageReview;