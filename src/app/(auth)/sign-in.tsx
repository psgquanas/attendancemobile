import AuthInput from '@/components/auth/AuthInput';
import SocialButtons from '@/components/auth/SocialButtons';
import { Outfit } from '@/constants/theme';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView, Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validate = () => {
        const e: typeof errors = {};
        if (!email) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
        if (!password) e.password = 'Password is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const { error } = await authClient.signIn.email({
                email: email.trim(),
                password,
                rememberMe,
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Successful")
                        router.replace("/")
                    },
                    onError: () => {
                        toast.error(error?.message || "Invalid credentials")
                    }
                }
            });

        } catch (err: unknown) {
            toast.error('Something went wrong. Try Again');
        } finally {
            setLoading(false);
        }
    };



    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#131313" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Welcome Back.{'\n'}Sign In To Your Account.</Text>
                        <Text style={styles.subtitle}>Access your account to manage settings, explore features</Text>
                    </View>

                    <View style={styles.form}>
                        <AuthInput
                            label="Email"
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            error={errors.email}
                            autoCorrect={false}
                        />

                        <AuthInput
                            label="Password"
                            placeholder="Enter your password"
                            isPassword
                            value={password}
                            onChangeText={setPassword}
                            error={errors.password}
                        />

                        <View style={styles.rememberForgotRow}>
                            <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberMe(p => !p)}>
                                <View style={[styles.radio, rememberMe && styles.radioSelected]}>
                                    {rememberMe && <View style={styles.radioDot} />}
                                </View>
                                <Text style={styles.rememberText}>Remember me</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                                <Text style={styles.forgotText}>Forgot password?</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryButton, loading && { opacity: 0.6 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.primaryButtonText}>
                                {loading ? 'Logging in...' : 'SIGN IN'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <SocialButtons />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                            <Text style={styles.footerLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#131313' },

    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 72,
        paddingBottom: 40,
        gap: 28,
    },

    titleSection: { gap: 8 },
    title: { fontFamily: Outfit.bold, fontSize: 32, color: '#E5E2E1', lineHeight: 40, letterSpacing: -0.5 },
    subtitle: { fontFamily: Outfit.regular, fontSize: 16, color: '#9CA3AF', lineHeight: 24 },
    form: { gap: 16 },
    rememberForgotRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center' },
    radioSelected: { borderColor: '#F5C518' },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F5C518' },
    rememberText: { fontFamily: Outfit.medium, fontSize: 14, color: '#E5E2E1' },
    forgotText: { fontFamily: Outfit.bold, fontSize: 14, color: '#F5C518' },
    primaryButton: { height: 56, backgroundColor: '#F5C518', borderRadius: 9999, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    primaryButtonText: { fontFamily: Outfit.bold, fontSize: 14, color: '#1A1400', letterSpacing: 2 },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
    footerText: { fontFamily: Outfit.regular, fontSize: 16, color: '#9CA3AF' },
    footerLink: { fontFamily: Outfit.bold, fontSize: 16, color: '#F5C518' },
});
