import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { authClient } from '@/lib/auth-client';

export default function CheckIn() {
    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title">Welcome back</ThemedText>
            <ThemedText themeColor="textSecondary">
                You are signed in as CheckIn.
            </ThemedText>
            <TouchableOpacity onPress={() => authClient.signOut()}>
                <ThemedText themeColor="textSecondary">Logout</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.four,
        gap: Spacing.two,
    },
});