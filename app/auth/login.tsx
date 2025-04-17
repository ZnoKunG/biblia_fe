// app/auth/login.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert, 
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing } from '../styles/defaultStyles';
import { 
  Card, 
  Heading, 
  Paragraph, 
  Button, 
  Input, 
  Row, 
  LoadingIndicator 
} from '../styles/defaultComponents';
import { useTheme } from '../styles/themeContext';
import { getIsLoggedIn, saveUserDataToLocalStorage } from '../services/authService';
import { Post } from '@/services/serviceProvider';

export default function LoginScreen() {
  const { baseStyles, colors } = useTheme();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loggedin = await getIsLoggedIn();
        if (loggedin) {
          setIsLoggedIn(true);
          router.replace('/(tabs)/home');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    // Basic validation
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
        // Attempt to login
        const inputData: CredentialUser = {
        username,
        password,
        }
        const resp = await Post('auth/login', JSON.stringify(inputData));

        if (!resp) {
        Alert.alert('Error', 'Some problems occur when logging in!');
        return;
        }
        
        if (!resp.ok) {

            console.log(resp.status);
            if (resp.status == 400) {
                Alert.alert('Error', 'Please put username');
            }
            if (resp.status == 401) {
                Alert.alert('Error', 'Wrong password');
            }
            if (resp.status == 404) {
                Alert.alert('Error', 'The username does not exist');
            }
            else {
                Alert.alert('Error', 'Log in Failed');
            }
            return;
        }

        const loginResp: Response = await resp.json();
        console.log(loginResp);
        const user: User = loginResp.data;

        await saveUserDataToLocalStorage(user.id)
        router.replace('/(tabs)/home');
    } catch (error) {
        console.error('Login error:', error);
        Alert.alert('Error', 'An error occurred during login');
    } finally {
        setLoading(false);
    }
    };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={[baseStyles.container, styles.container]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/app-logo.webp')} 
              style={styles.logo} 
              resizeMode="contain"
            />
            <Heading level={1}>ReadTracker</Heading>
            <Paragraph secondary>Track your reading journey</Paragraph>
          </View>

          <Card style={styles.loginCard}>
            <Heading level={2} style={styles.cardTitle}>Login</Heading>
            
            <Paragraph style={styles.inputLabel}>Username</Paragraph>
            <Input
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={styles.input}
            />
            
            <Paragraph style={styles.inputLabel}>Password</Paragraph>
            <View style={styles.passwordContainer}>
              <Input
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
                style={styles.passwordInput}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              >
                <Ionicons 
                  name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            
            <Button 
              title="Log In" 
              onPress={handleLogin} 
              style={styles.loginButton} 
            />
            
            <Row justify="between" style={styles.signupRow}>
              <Paragraph>Don't have an account? </Paragraph>
              <Link href="/auth/register" asChild>
                <TouchableOpacity>
                  <Paragraph style={{ color: colors.secondary }}>Sign Up</Paragraph>
                </TouchableOpacity>
              </Link>
            </Row>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.md,
  },
  loginCard: {
    padding: spacing.lg,
  },
  cardTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  inputLabel: {
    marginBottom: spacing.xs,
  },
  input: {
    marginBottom: spacing.md,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  loginButton: {
    marginVertical: spacing.md,
  },
  signupRow: {
    marginTop: spacing.sm,
  },
});
