// app/auth/register.tsx
import React, { useState } from 'react';
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
import { Post } from '@/services/serviceProvider';
import { saveUserDataToLocalStorage } from '../services/authService';

// List of popular book genres
const GENRES = [
  "Fiction", "Fantasy", "Science Fiction", "Mystery", "Thriller", 
  "Romance", "Historical Fiction", "Non-Fiction", "Biography", 
  "Self-Help", "Horror", "Adventure", "Young Adult", "Classics",
  "Poetry", "Drama", "Crime", "Comedy", "Children's"
];

export default function RegisterScreen() {
  const { baseStyles, colors, spacing } = useTheme();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showGenreSelection, setShowGenreSelection] = useState(false);

  // Define styles inside the component to access theme variables
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
    registerCard: {
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
    registerButton: {
      marginVertical: spacing.md,
    },
    loginRow: {
      marginTop: spacing.sm,
    },
    // Genre selection styles
    genreSectionToggle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      marginBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    genreSectionTitle: {
      fontWeight: '600',
      color: colors.text,
    },
    genreSection: {
      marginBottom: spacing.md,
    },
    genreTitle: {
      marginBottom: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
    genreContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: spacing.sm,
    },
    genreChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 16,
      backgroundColor: colors.secondary,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedGenreChip: {
      backgroundColor: colors.primary || 'rgba(76, 175, 80, 0.2)',
      borderColor: colors.primary,
    },
    genreText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    selectedGenreText: {
      color: colors.text,
      fontWeight: '600',
    },
    selectedGenresContainer: {
      marginBottom: spacing.md,
      padding: spacing.sm,
      backgroundColor: colors.background || 'rgba(0,0,0,0.03)',
      borderRadius: 8,
    },
    selectedGenresTitle: {
      marginBottom: spacing.xs,
      fontWeight: '600',
      color: colors.text,
    },
    selectedGenresList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    selectedGenreItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      backgroundColor: colors.primary,
      borderRadius: 16,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    removeGenreButton: {
      marginLeft: 4,
    },
  });

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      // Limit to 5 favorite genres
      if (selectedGenres.length < 5) {
        setSelectedGenres([...selectedGenres, genre]);
      } else {
        Alert.alert('Limit Reached', 'You can select up to 5 favorite genres');
      }
    }
  };

  const handleRegister = async () => {
    // Basic validation
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (selectedGenres.length === 0) {
      Alert.alert('Error', 'Please select at least one favorite genre');
      return;
    }

    setLoading(true);

    try {
      const inputData: CreateUser = {
        username,
        password,
        favourite_genres: selectedGenres,
      }

      const resp = await Post("users", JSON.stringify(inputData));

      if (!resp) {
        Alert.alert('Error', 'Cannot complete registration!');
        return;
      }

      if (!resp.ok) {
        if (resp.status == 409) {
            Alert.alert('Error', 'Username taken!');
            return;
        }
      }

      const userResp: Response = await resp.json();
      console.log(userResp);

      const user: User = userResp.data;
      await saveUserDataToLocalStorage(user.id);
      
      // Reset form
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setSelectedGenres([]);
      
      // Navigate to home screen
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  const renderGenreSelection = () => {
    return (
      <View style={styles.genreSection}>
        <Heading level={3} style={styles.genreTitle}>Select Favorite Genres (up to 5)</Heading>
        <View style={styles.genreContainer}>
          {GENRES.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[
                styles.genreChip,
                selectedGenres.includes(genre) && styles.selectedGenreChip
              ]}
              onPress={() => toggleGenre(genre)}
            >
              <Paragraph 
                style={[
                  styles.genreText,
                  selectedGenres.includes(genre) && styles.selectedGenreText
                ]}
              >
                {genre}
              </Paragraph>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

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

          <Card style={styles.registerCard}>
            <Heading level={2} style={styles.cardTitle}>Create Account</Heading>
            
            <Paragraph style={styles.inputLabel}>Username</Paragraph>
            <Input
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={styles.input}
            />
            
            <Paragraph style={styles.inputLabel}>Password</Paragraph>
            <View style={styles.passwordContainer}>
              <Input
                placeholder="Create a password"
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
            
            <Paragraph style={styles.inputLabel}>Confirm Password</Paragraph>
            <View style={styles.passwordContainer}>
              <Input
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={confirmSecureTextEntry}
                style={styles.passwordInput}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)}
              >
                <Ionicons 
                  name={confirmSecureTextEntry ? 'eye-off-outline' : 'eye-outline'} 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {/* Genre Selection Section */}
            <TouchableOpacity 
              style={styles.genreSectionToggle}
              onPress={() => setShowGenreSelection(!showGenreSelection)}
            >
              <Paragraph style={styles.genreSectionTitle}>
                {showGenreSelection ? 'Hide Genre Selection' : 'Select Favorite Genres'}
              </Paragraph>
              <Ionicons 
                name={showGenreSelection ? 'chevron-up-outline' : 'chevron-down-outline'} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
            
            {showGenreSelection && renderGenreSelection()}
            
            {/* Selected Genres Display */}
            {selectedGenres.length > 0 && (
              <View style={styles.selectedGenresContainer}>
                <Paragraph style={styles.selectedGenresTitle}>
                  Your Selections ({selectedGenres.length}/5):
                </Paragraph>
                <View style={styles.selectedGenresList}>
                  {selectedGenres.map((genre) => (
                    <View key={genre} style={styles.selectedGenreItem}>
                      <Paragraph>{genre}</Paragraph>
                      <TouchableOpacity 
                        onPress={() => toggleGenre(genre)}
                        style={styles.removeGenreButton}
                      >
                        <Ionicons name="close-circle" size={16} color={colors.warning || '#f44336'} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            <Button 
              title="Sign Up" 
              onPress={handleRegister} 
              style={styles.registerButton} 
            />
            
            <Row justify="between" style={styles.loginRow}>
              <Paragraph>Already have an account? </Paragraph>
              <Link href="./auth/login" asChild>
                <TouchableOpacity>
                  <Paragraph style={{ color: colors.secondary }}>Log In</Paragraph>
                </TouchableOpacity>
              </Link>
            </Row>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}