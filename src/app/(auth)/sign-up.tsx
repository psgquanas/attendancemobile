import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthInput from '@/components/auth/AuthInput';
import { Outfit } from '@/constants/theme';

interface FormState {
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors extends Partial<FormState> { }

export default function RegisterScreen() {
    const router = useRouter();
    const [form, setForm] = useState<FormState>({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    const update = (key: keyof FormState) => (val: string) =>
        setForm(prev => ({ ...prev, [key]: val }));

    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!form.email) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 6) e.password = 'Minimum 6 characters';
        if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
        else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSignUp = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            // TODO: call your register API here
            await new Promise(resolve => setTimeout(resolve, 1000)); // mock delay
            Alert.alert('Success', 'Account created!');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#131313" />
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header / Back */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Title */}
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Sign Up To {'\n'}Chekdly.</Text>
                        <Text style={styles.subtitle}>Create a new account to explore.</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <AuthInput
                            label="Email Address"
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            value={form.email}
                            onChangeText={update('email')}
                            error={errors.email}
                            autoCorrect={false}
                        />

                        <AuthInput
                            label="Password"
                            placeholder="Create a password"
                            isPassword
                            value={form.password}
                            onChangeText={update('password')}
                            error={errors.password}
                        />

                        <AuthInput
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            isPassword
                            value={form.confirmPassword}
                            onChangeText={update('confirmPassword')}
                            error={errors.confirmPassword}
                        />

                        {/* Remember Me */}
                        <TouchableOpacity
                            style={styles.rememberRow}
                            onPress={() => setRememberMe(prev => !prev)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.radio, rememberMe && styles.radioSelected]}>
                                {rememberMe && <View style={styles.radioDot} />}
                            </View>
                            <Text style={styles.rememberText}>Remember me</Text>
                        </TouchableOpacity>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                            onPress={handleSignUp}
                            activeOpacity={0.85}
                            disabled={loading}
                        >
                            <Text style={styles.primaryButtonText}>
                                {loading ? 'Creating Account...' : 'SIGN UP'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} activeOpacity={0.7}>
                            <Text style={styles.footerLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#131313',
    },
    flex: {
        flex: 1,
    },
    header: {
        height: 56,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#201F1F',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backArrow: {
        fontFamily: Outfit.semiBold,
        fontSize: 20,
        color: '#E5E2E1',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 28,
    },
    titleSection: {
        gap: 8,
    },
    title: {
        fontFamily: Outfit.bold,
        fontSize: 32,
        color: '#E5E2E1',
        lineHeight: 40,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontFamily: Outfit.regular,
        fontSize: 16,
        color: '#9CA3AF',
        lineHeight: 24,
    },
    form: {
        gap: 16,
    },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 4,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#9CA3AF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: '#F5C518',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#F5C518',
    },
    rememberText: {
        fontFamily: Outfit.medium,
        fontSize: 14,
        color: '#E5E2E1',
    },
    primaryButton: {
        height: 56,
        backgroundColor: '#F5C518',
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    primaryButtonDisabled: {
        opacity: 0.6,
    },
    primaryButtonText: {
        fontFamily: Outfit.bold,
        fontSize: 14,
        color: '#1A1400',
        letterSpacing: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    footerText: {
        fontFamily: Outfit.regular,
        fontSize: 16,
        color: '#9CA3AF',
    },
    footerLink: {
        fontFamily: Outfit.bold,
        fontSize: 16,
        color: '#F5C518',
    },
});
