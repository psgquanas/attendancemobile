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


import { Colors, Outfit } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

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
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    return (
        <View style={styles.wrapper}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: colors.backgroundElement,
                        borderColor: colors.backgroundSelected,
                    },
                    isFocused && { borderColor: colors.primary, backgroundColor: colors.backgroundElement },
                    !!error && { borderColor: colors.destructive },
                ]}
            >
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholderTextColor={colors.textSecondary}
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
                        {showPassword ? (
                            <EyeOff color={colors.textSecondary} size={18} />
                        ) : (
                            <Eye color={colors.textSecondary} size={18} />
                        )}
                    </TouchableOpacity>
                )}
            </View>
            {!!error && <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>}
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
        letterSpacing: 0.5,
        paddingLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1.5,
        height: 56,
        paddingHorizontal: 14,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: Outfit.regular,
    },
    eyeButton: {
        padding: 4,
    },
    errorText: {
        fontFamily: Outfit.regular,
        fontSize: 12,
        paddingLeft: 4,
    },
});
