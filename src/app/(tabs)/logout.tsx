import Button from '@/src/components/Button';
import { useAuth } from '@/src/contexts/AuthContext';
import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function Logout() {
    const { logout } = useAuth();
    const [showModal, setShowModal] = useState(false);

    const handleLogout = () => {
        if (Platform.OS !== 'web') {
            Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Logout',
                        style: 'destructive',
                        onPress: () => {
                            logout();
                        },
                    },
                ]
            );
        } else {
            setShowModal(true);
        }
    };

    const confirmLogout = () => {
        setShowModal(false);
        logout();
    };

    const cancelLogout = () => {
        setShowModal(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Ready to logout?</Text>
            <Button
                label="Logout"
                theme="primary"
                onPress={handleLogout}
            />

            {/* Modal pour web */}
            <Modal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={cancelLogout}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Logout</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to logout?
                        </Text>
                        <View style={styles.modalButtons}>
                            <Pressable
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={cancelLogout}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.logoutButton]}
                                onPress={confirmLogout}
                            >
                                <Text style={styles.logoutButtonText}>Logout</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#2d3238',
        borderRadius: 16,
        padding: 24,
        width: '80%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        color: '#999',
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#3a3f47',
    },
    logoutButton: {
        backgroundColor: '#f44336',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
