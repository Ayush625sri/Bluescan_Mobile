// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import websocketService from '../services/websocket';

const SessionsScreen = ({ navigation }) => {
    const [sessions, setSessions] = useState({
        pending_requests: [],
        active_sessions: [],
        ended_sessions: []
    });
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('requests'); // requests, active, history
    const { isSessionActive } = useAuth();
    useEffect(() => {
        loadSessions();
    }, []);
    useEffect(() => {
        const updateStatus = () => {
            setConnectionStatus(websocketService.isConnected() ? 'connected' : 'disconnected');
        };

        websocketService.on('connected', () => setConnectionStatus('connected'));
        websocketService.on('connecting', () => setConnectionStatus('connecting'));
        websocketService.on('disconnected', () => setConnectionStatus('disconnected'));

        updateStatus();
    }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/session/active');
            console.log("session response:", response.data)
            setSessions({
                pending_requests: response.data.pending_requests || [],
                active_sessions: response.data.active_sessions || [],
                ended_sessions: response.data.ended_sessions || []
            });
        } catch (error) {
            console.error('Error loading sessions:', error);
            Alert.alert('Error', 'Failed to load sessions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    const onRefresh = () => {
        setRefreshing(true);
        loadSessions();
    };

    const acceptRequest = async (requestId) => {
        try {
            await api.post('/session/respond', {
                request_id: requestId,
                accepted: true
            });
            loadSessions(); // Refresh data
            Alert.alert('Success', 'Session request accepted');
        } catch (error) {
            console.error('Error accepting request:', error);
            Alert.alert('Error', 'Failed to accept request');
        }
    };

    const rejectRequest = async (requestId) => {
        try {
            await api.post('/session/respond', {
                request_id: requestId,
                accepted: false
            });
            loadSessions(); // Refresh data
        } catch (error) {
            console.error('Error rejecting request:', error);
            Alert.alert('Error', 'Failed to reject request');
        }
    };

    const endActiveSession = async (sessionId) => {
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
                            await api.post(`/session/${sessionId}/end`);
                            loadSessions();
                        } catch (error) {
                            console.error('Error ending session:', error);
                            Alert.alert('Error', 'Failed to end session');
                        }
                    }
                }
            ]
        );
    };

    const renderPendingRequest = ({ item }) => (
        <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
                <View>
                    <Text style={styles.requestName}>{item.from_user.name}</Text>
                    <Text style={styles.requestEmail}>{item.from_user.email}</Text>
                    <Text style={styles.requestTime}>
                        {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>PENDING</Text>
                </View>
            </View>

            <View style={styles.requestActions}>
                <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => rejectRequest(item.request_id)}
                >
                    <Text style={styles.rejectButtonText}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => acceptRequest(item.request_id)}
                >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderActiveSession = ({ item }) => (
        <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
                <View>
                    <Text style={styles.sessionPartner}>{item.partner.name}</Text>
                    <Text style={styles.sessionTime}>
                        Started: {new Date(item.start_time).toLocaleString()}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                    <Text style={styles.statusText}>ACTIVE</Text>
                </View>
            </View>

            <View style={styles.sessionActions}>
                <TouchableOpacity
                    style={styles.joinButton}
                    onPress={() => navigation.navigate('LiveSession', { sessionId: item.session_id })}
                >
                    <Ionicons name="videocam" size={20} color="#FFFFFF" />
                    <Text style={styles.joinButtonText}>Join Session</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.endButton}
                    onPress={() => endActiveSession(item.session_id)}
                >
                    <Text style={styles.endButtonText}>End</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEndedSession = ({ item }) => (
        <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
                <Text style={styles.historyPartner}>{item.partner.name}</Text>
                <Text style={styles.historyDate}>
                    {new Date(item.start_time).toLocaleDateString()}
                </Text>
            </View>
            <Text style={styles.historyDuration}>
                Duration: {item.duration > 0 ? `${Math.floor(item.duration / 60)} minutes` : 'Invalid'}
            </Text>
            <Text style={styles.historyStatus}>{item.status.toUpperCase()}</Text>
        </View>
    );

    const renderConnectionStatus = () => {
        const getColor = () => {
            switch (connectionStatus) {
                case 'connecting': return '#FF9800';
                case 'connected': return isSessionActive ? '#4CAF50' : '#2196F3';
                default: return '#F44336';
            }
        };

        return (
            <View style={styles.connectionStatus}>
                <View style={[styles.statusDot, { backgroundColor: getColor() }]} />
                <Text style={styles.statusText}>
                    {connectionStatus === 'connecting' ? 'Connecting...' :
                        connectionStatus === 'connected' ? (isSessionActive ? 'Session Active' : 'Connected') :
                            'Disconnected'}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
                    onPress={() => setActiveTab('requests')}
                >
                    <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
                        Requests ({sessions?.pending_requests.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                        Active ({sessions.active_sessions.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                        History
                    </Text>
                </TouchableOpacity>
            </View>
            {renderConnectionStatus()}
            {/* Content */}
            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {activeTab === 'requests' && (
                    <FlatList
                        data={sessions?.pending_requests}
                        renderItem={renderPendingRequest}
                        keyExtractor={(item) => item.request_id}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No pending requests</Text>
                        }
                    />
                )}

                {activeTab === 'active' && (
                    <FlatList
                        data={sessions?.active_sessions}
                        renderItem={renderActiveSession}
                        keyExtractor={(item) => item.session_id}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No active sessions</Text>
                        }
                    />
                )}

                {activeTab === 'history' && (
                    <FlatList
                        data={sessions?.ended_sessions}
                        renderItem={renderEndedSession}
                        keyExtractor={(item) => item.session_id}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No session history</Text>
                        }
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#0066FF',
    },
    tabText: {
        fontSize: 16,
        color: '#666666',
    },
    activeTabText: {
        color: '#0066FF',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    requestCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    requestName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    requestEmail: {
        fontSize: 14,
        color: '#666666',
    },
    requestTime: {
        fontSize: 12,
        color: '#999999',
    },
    statusBadge: {
        backgroundColor: '#FF9800',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    requestActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rejectButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
        marginRight: 10,
        alignItems: 'center',
    },
    acceptButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#0066FF',
        alignItems: 'center',
    },
    rejectButtonText: {
        color: '#666666',
        fontWeight: 'bold',
    },
    acceptButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    sessionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    sessionPartner: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    sessionTime: {
        fontSize: 14,
        color: '#666666',
    },
    sessionActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    joinButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
        marginRight: 10,
    },
    joinButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    endButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#F44336',
        alignItems: 'center',
    },
    endButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    historyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    historyPartner: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    historyDate: {
        fontSize: 14,
        color: '#666666',
    },
    historyDuration: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 5,
    },
    historyStatus: {
        fontSize: 12,
        color: '#999999',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666666',
        padding: 20,
        fontSize: 16,
    },
    connectionStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333333',
    },
});

export default SessionsScreen;