import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
    onPress?: (searchText: string) => void;
    error?: string;
};

export default function SearchInput({ onPress, error }: Props) {
    const [text, onChangeText] = React.useState('');
    const [validationError, setValidationError] = React.useState<string>('');

    const validateInput = (input: string): string | null => {
        if (!input || input.trim().length === 0) {
            return 'Please enter a username';
        }

        if (input.trim().length < 2) {
            return 'Username must be at least 2 characters';
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(input.trim())) {
            return 'Username can only contain letters, numbers, dashes and underscores';
        }

        return null;
    };

    const handleSearch = () => {
        const trimmedText = text.trim();
        const error = validateInput(trimmedText);

        if (error) {
            setValidationError(error);
            return;
        }

        setValidationError('');
        onPress?.(trimmedText);
    };

    const handleTextChange = (newText: string) => {
        onChangeText(newText);
        if (validationError) {
            setValidationError('');
        }
    };

    const displayError = validationError || error;

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <View>
                    <View style={[
                        styles.container,
                        displayError && styles.containerError
                    ]}>
                        <TextInput
                            style={styles.input}
                            onChangeText={handleTextChange}
                            value={text}
                            placeholder="Search a profile..."
                            placeholderTextColor="#999"
                            onSubmitEditing={handleSearch}
                        />
                        <TouchableOpacity
                            style={styles.searchButton}
                            onPress={handleSearch}
                        >
                            <Ionicons name="search" size={24} color="#ffd33d" />
                        </TouchableOpacity>
                    </View>
                    {displayError && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={16} color="#ff4444" />
                            <Text style={styles.errorText}>{displayError}</Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 12,
        borderWidth: 1,
        borderColor: '#ffd33d',
        borderRadius: 8,
        backgroundColor: '#25292e',
    },
    containerError: {
        borderColor: '#ff4444',
    },
    input: {
        flex: 1,
        height: 40,
        padding: 10,
        color: '#fff',
    },
    searchButton: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
        marginTop: -8,
        marginBottom: 12,
        paddingHorizontal: 8,
        gap: 6,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 13,
    },
});
