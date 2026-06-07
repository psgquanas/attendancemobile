import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';


import { Outfit } from '@/constants/theme';

interface AuthInputProps extends TextInputProps {
    label: string;
    error?: string;
    isPassword?: boolean;
}

export default function AuthInput({
    label,
    error,
    isPassword = false,
    ...props
}: AuthInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                    !!error && styles.inputContainerError,
                ]}
            >
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#6B6B6B"
                    secureTextEntry={isPassword && !showPassword}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoCapitalize="none"
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(prev => !prev)}
                        style={styles.eyeButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.eyeIcon}>
                            {showPassword ? <EyeOff color="#ffffff" /> : <Eye color="#ffffff" />}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        gap: 6,
    },
    label: {
        fontFamily: Outfit.medium,
        fontSize: 13,
        color: '#9CA3AF',
        letterSpacing: 0.5,
        paddingLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: 'transparent',
        height: 56,
        paddingHorizontal: 11,
    },
    inputContainerFocused: {
        borderColor: '#F5C518',
    },
    inputContainerError: {
        borderColor: '#EF4444',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#E5E2E1',
        fontFamily: Outfit.regular,
    },
    eyeButton: {
        padding: 4,
    },
    eyeIcon: {
        fontSize: 18,
    },
    errorText: {
        fontFamily: Outfit.regular,
        fontSize: 12,
        color: '#EF4444',
        paddingLeft: 4,
    },
});
