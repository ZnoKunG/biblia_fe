// app/index.tsx (Entry point to redirect to auth or home)
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoadingIndicator } from './styles/defaultComponents';
import { getIsLoggedIn } from './services/authService';
import { useFonts } from 'expo-font';
import { FontAwesome } from '@expo/vector-icons';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      const loggedin = await getIsLoggedIn();
      setIsLoggedIn(loggedin);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingIndicator />
      </View>
    );
  }

  if (isLoggedIn) {
    return <Redirect href="/(tabs)/home" />;
  } else {
    return <Redirect href="/auth/login" />;
  }
}