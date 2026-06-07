import { Outfit } from '@/constants/theme';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { toast } from 'sonner-native';

const AnimatedLoader = Animated.createAnimatedComponent(Loader2);

function GoogleIcon() {
    return (
        <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <Path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <Path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <Path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </Svg>
    );
}

export default function SocialButtons() {
    const rotation = useSharedValue(0);
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, { duration: 1000 }),
            -1
        );
    }, [rotation]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const handleGoogleLogin = async () => {
        if (googleLoading) return;

        setGoogleLoading(true);
        try {
            const { error } = await authClient.signIn.social({
                provider: 'google',
                callbackURL: "attendancemobile://",
                fetchOptions: {
                    onSuccess: () => {
                        toast.success('Redirecting to Google...');
                    },
                    onError: () => {
                        toast.error(error?.message || 'Failed. Try Again');
                    },
                },
            });
        } catch {
            toast.error('Failed to sign in with Google');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
                style={[styles.socialButton, googleLoading && styles.socialButtonDisabled]}
                onPress={handleGoogleLogin}
                disabled={googleLoading}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
            >
                {googleLoading ? (
                    <AnimatedLoader
                        size={24}
                        color="#F5C518"
                        style={animatedStyle}
                    />
                ) : (
                    <>
                        <GoogleIcon />
                        <Text style={styles.socialButtonText}>Continue with Google</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 4,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#353534',
    },
    dividerText: {
        fontFamily: Outfit.semiBold,
        fontSize: 12,
        color: '#9CA3AF',
        letterSpacing: 1,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        height: 56,
        backgroundColor: '#2A2A2A',
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: '#4E4633',
    },
    socialButtonDisabled: {
        opacity: 0.7,
    },
    socialButtonText: {
        fontFamily: Outfit.medium,
        fontSize: 14,
        color: '#E5E2E1',
        letterSpacing: 0.3,
    },
});
