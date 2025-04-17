// app/(tabs)/settings.tsx
import React, { useState } from 'react';
import { 
  View, 
  Switch, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  StyleSheet,
  TextStyle,
  ViewStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, fontSize } from '../styles/defaultStyles';
import { 
  Card, 
  Heading, 
  Paragraph, 
  OutlineButton,
  Divider, 
  Row
} from '../styles/defaultComponents';
import { 
  deepLiterary, 
  minimalZen, 
  vintageLibrary, 
  nightReader 
} from '../styles/defaultStyles';
import { useTheme } from '../styles/themeContext';
import { logoutUser } from '../services/authService';
import { useRouter } from 'expo-router';

// Define types for settings
interface ThemeOption {
  id: string;
  name: string;
  colorScheme: any;
  previewColor: string;
}

export default function SettingsPage(): JSX.Element {
  // Get theme context
  const { activeTheme, colors, baseStyles, spacing, setTheme } = useTheme();
  
  // App settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState<boolean>(true);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const router = useRouter();

  // Define available themes
  const themes: ThemeOption[] = [
    { 
      id: 'minimal', 
      name: 'Minimal Zen', 
      colorScheme: minimalZen,
      previewColor: minimalZen.primary
    },
    { 
      id: 'literary', 
      name: 'Deep Literary', 
      colorScheme: deepLiterary,
      previewColor: deepLiterary.primary
    },
    { 
      id: 'vintage', 
      name: 'Vintage Library', 
      colorScheme: vintageLibrary,
      previewColor: vintageLibrary.primary
    },
    { 
      id: 'night', 
      name: 'Night Reader', 
      colorScheme: nightReader,
      previewColor: nightReader.primary
    }
  ];

  // Handler for theme selection
  const handleThemeSelection = async (themeId: string) => {
    await setTheme(themeId as any);
    Alert.alert(
      "Theme Updated",
      `Theme changed to ${themes.find(theme => theme.id === themeId)?.name}`,
      [{ text: "OK" }]
    );
  };

  // Handler for logout
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            logoutUser();
            Alert.alert("Logged Out", "You have been logged out successfully");
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  // Handler for data export
  const handleExportData = () => {
    Alert.alert(
      "Export Library",
      "Your reading data will be exported as a CSV file",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Export", 
          onPress: () => {
            // Simulate export process
            setTimeout(() => {
              Alert.alert(
                "Export Complete", 
                "Your reading data has been exported successfully"
              );
            }, 1000);
          }
        }
      ]
    );
  };

  // Combine default styles with current theme
  const styles = StyleSheet.create({
    settingsSection: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      marginBottom: spacing.sm,
    },
    sectionCard: {
      padding: spacing.md,
    },
    sectionLabel: {
      marginBottom: spacing.md,
      fontWeight: '500',
    },
    settingsDivider: {
      marginVertical: spacing.sm,
    },
    toggleRow: {
      paddingVertical: spacing.xs,
    },
    disabledRow: {
      opacity: 0.5,
    },
    disabledText: {
      color: colors.textSecondary,
    },
    actionButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    themeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    themeOption: {
      width: '48%',
      borderWidth: 2,
      borderRadius: spacing.md,
      padding: spacing.sm,
      marginBottom: spacing.md,
      alignItems: 'center',
    },
    themePreview: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginBottom: spacing.sm,
    },
    themeName: {
      fontSize: fontSize.sm,
      fontWeight: '500',
    } as TextStyle,
    checkIcon: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
    },
    versionCard: {
      alignItems: 'center',
      marginBottom: spacing.md,
      paddingVertical: spacing.sm,
    },
    versionText: {
      fontSize: fontSize.sm,
    },
    logoutButton: {
      marginBottom: spacing.xl,
    }
  });

  return (
    <SafeAreaView style={baseStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Theme Settings */}
        <SettingsSection title="Appearance">
          <Card style={styles.sectionCard}>
            <Paragraph style={styles.sectionLabel}>Choose Theme</Paragraph>
            <View style={styles.themeContainer}>
              {themes.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={{
                    ...styles.themeOption,
                    borderColor: activeTheme === theme.id 
                      ? theme.previewColor 
                      : colors.border
                  }}
                  onPress={() => handleThemeSelection(theme.id)}
                >
                  <View 
                    style={{
                      ...styles.themePreview, 
                      backgroundColor: theme.previewColor
                    }} 
                  />
                  <Paragraph 
                    style={{
                      ...styles.themeName,
                      color: activeTheme === theme.id 
                        ? theme.previewColor 
                        : colors.text 
                    }}
                  >
                    {theme.name}
                  </Paragraph>
                  {activeTheme === theme.id && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={16} 
                      color={theme.previewColor} 
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection title="Notifications">
          <Card style={styles.sectionCard}>
            <SettingsToggle
              label="Enable Notifications"
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
            <Divider style={styles.settingsDivider} />
            <SettingsToggle
              label="Daily Reading Reminder"
              value={dailyReminderEnabled}
              onValueChange={setDailyReminderEnabled}
              disabled={!notificationsEnabled}
            />
          </Card>
        </SettingsSection>

        {/* Data Settings */}
        <SettingsSection title="Data & Sync">
          <Card style={styles.sectionCard}>
            <SettingsToggle
              label="Auto-sync Library"
              value={autoSync}
              onValueChange={setAutoSync}
            />
            <Divider style={styles.settingsDivider} />
            <SettingsToggle
              label="Offline Mode"
              value={offlineMode}
              onValueChange={setOfflineMode}
            />
            <Divider style={styles.settingsDivider} />
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleExportData}
            >
              <Paragraph>Export Reading Data</Paragraph>
              <Ionicons name="download-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </Card>
        </SettingsSection>
        
        {/* Reading Preferences */}
        <SettingsSection title="Reading Preferences">
          <Card style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert("Coming Soon", "Reading goals feature is coming soon!")}
            >
              <Paragraph>Set Reading Goals</Paragraph>
              <Ionicons name="arrow-forward" size={20} color={colors.text} />
            </TouchableOpacity>
            <Divider style={styles.settingsDivider} />
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert("Coming Soon", "Genre preferences feature is coming soon!")}
            >
              <Paragraph>Genre Preferences</Paragraph>
              <Ionicons name="arrow-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          </Card>
        </SettingsSection>

        {/* Account Settings */}
        <SettingsSection title="Account">
          <Card style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert("Profile", "Edit your profile")}
            >
              <Paragraph>Edit Profile</Paragraph>
              <Ionicons name="person-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <Divider style={styles.settingsDivider} />
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert("Privacy", "Privacy settings")}
            >
              <Paragraph>Privacy Settings</Paragraph>
              <Ionicons name="lock-closed-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </Card>
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          <Card style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert("Help Center", "Get help with using the app")}
            >
              <Paragraph>Help Center</Paragraph>
              <Ionicons name="help-circle-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <Divider style={styles.settingsDivider} />
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert("Contact Support", "Send a message to our support team")}
            >
              <Paragraph>Contact Support</Paragraph>
              <Ionicons name="mail-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </Card>
        </SettingsSection>

        {/* Version Info */}
        <Card style={{
          ...styles.sectionCard,
          ...styles.versionCard
        }}>
          <Paragraph secondary style={styles.versionText}>Version 1.0.0</Paragraph>
        </Card>

        {/* Logout Button */}
        <OutlineButton 
          title="Logout" 
          onPress={handleLogout}
          style={styles.logoutButton}
        />
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper component for section headers
interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection = ({ title, children }: SettingsSectionProps) => {
  const { colors, spacing } = useTheme();
  
  const styles = StyleSheet.create({
    settingsSection: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      marginBottom: spacing.sm,
      color: colors.text,
    },
  });
  
  return (
    <View style={styles.settingsSection}>
      <Heading level={3} style={styles.sectionTitle}>{title}</Heading>
      {children}
    </View>
  );
};

// Helper component for toggle settings
interface SettingsToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const SettingsToggle = ({ label, value, onValueChange, disabled = false }: SettingsToggleProps) => {
  const { colors, spacing } = useTheme();
  
  const styles = StyleSheet.create({
    toggleRow: {
      paddingVertical: spacing.xs,
      opacity: disabled ? 0.5 : 1,
    },
    disabledText: {
      color: colors.textSecondary,
    },
  });

  return (
    <Row justify="between" style={styles.toggleRow}>
      <Paragraph style={disabled ? styles.disabledText : undefined}>{label}</Paragraph>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.secondary + '80' }}
        thumbColor={value ? colors.secondary : '#f4f3f4'}
      />
    </Row>
  );
};