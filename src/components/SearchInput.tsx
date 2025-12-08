import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

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
        Keyboard.dismiss();
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.wrapper}>
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
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearch}
                    >
                        <Ionicons name="search" size={24} color="#61dafb" />
                    </TouchableOpacity>
                </View>
                {displayError && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={16} color="#ff4444" />
                        <Text style={styles.errorText}>{displayError}</Text>
                    </View>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
        marginHorizontal: 0,
        borderWidth: 1,
        borderColor: '#61dafb',
        borderRadius: 8,
        backgroundColor: '#25292e',
        width: '100%',
    },
    containerError: {
        borderColor: '#ff4444',
    },
    input: {
        flex: 1,
        height: 40,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#fff',
        fontSize: 16,
    },
    searchButton: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 44,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 0,
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
