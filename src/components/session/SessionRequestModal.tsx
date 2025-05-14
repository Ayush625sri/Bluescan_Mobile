// @ts-nocheck
import React , {useState} from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

interface SessionRequestModalProps {
  visible: boolean;
}

const SessionRequestModal: React.FC<SessionRequestModalProps> = ({ visible }) => {
  const { activeSession, acceptSessionRequest, rejectSessionRequest } = useAuth();
  const [responding, setResponding] = useState(false);
  const navigation = useNavigation();
  
  if (!activeSession || activeSession.status !== 'pending') {
    return null;
  }
  
  const handleAccept = async () => {
    try {
      setResponding(true);
      await acceptSessionRequest(activeSession.id);
      navigation.navigate('LiveSession', { sessionId: activeSession.id });
    } catch (error) {
      console.error('Error accepting session:', error);
      Alert.alert('Error', 'Failed to accept session request');
    } finally {
      setResponding(false);
    }
  };
  
  const handleReject = async () => {
    try {
      setResponding(true);
      await rejectSessionRequest(activeSession.id);
    } catch (error) {
      console.error('Error rejecting session:', error);
    } finally {
      setResponding(false);
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="videocam" size={40} color="#0066FF" />
          </View>
          
          <Text style={styles.title}>Live Session Request</Text>
          <Text style={styles.message}>
            {activeSession.requesterName} is requesting to start a live session with you.
          </Text>
          
          <View style={styles.buttonContainer}>
            {responding ? (
              <ActivityIndicator size="large" color="#0066FF" />
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.button, styles.rejectButton]} 
                  onPress={handleReject}
                >
                  <Text style={styles.rejectButtonText}>Decline</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.acceptButton]} 
                  onPress={handleAccept}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  rejectButton: {
    backgroundColor: '#F5F5F5',
  },
  acceptButton: {
    backgroundColor: '#0066FF',
  },
  rejectButtonText: {
    color: '#666666',
    fontWeight: 'bold',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default SessionRequestModal;