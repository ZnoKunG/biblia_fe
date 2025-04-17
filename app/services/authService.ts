import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUserDataToLocalStorage = async (userId: number): Promise<void> => {
  try {
    await AsyncStorage.setItem('userId', userId.toString());
    await AsyncStorage.setItem('isLoggedIn', "true");
  }
  catch (err) {
    console.log("Error in saving data to local storage: ", err);
    return;
  }
}
// Logout user
export const logoutUser = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.setItem('isLoggedIn', "false");
    return true;
  } catch (error) {
    console.error('Error logging out user:', error);
    return false;
  }
};

// Get current user ID
export const getCurrentUserID = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('userId');
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

// Check if user is logged in
export const getIsLoggedIn = async (): Promise<boolean> => {
  try {
    console.log("Get IsLoggedIn...");
    const userId = await AsyncStorage.getItem('userId');
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn') === "true";

    return isLoggedIn;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};