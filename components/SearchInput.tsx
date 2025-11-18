import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import Button from './Button';

type Props = {
    onPress?: (searchText: string) => void;
};

export default function SearchInput({ onPress }: Props) {
    const [text, onChangeText] = React.useState('');


    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <TextInput
                    style={styles.input}
                    onChangeText={onChangeText}
                    value={text}
                />
                <Button onPress={() => onPress?.(text)}
                    label='search profile'
                ></Button>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
});
