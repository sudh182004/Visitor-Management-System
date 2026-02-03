import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
  try {
    const guard = await AsyncStorage.getItem('guard');

    setTimeout(() => {
      if (guard) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/login'); // ✅ FIX
      }
    }, 1200);
  } catch (e) {
    router.replace('/login'); // ✅ FIX
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.company}>XYZ Company</Text>
      <Text style={styles.subtitle}>Visitor Management System</Text>

      <ActivityIndicator
        size="large"
        color="#ffffff"
        style={{ marginTop: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2A44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  company: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#cbd5e1',
    marginTop: 8,
    fontSize: 14,
  },
});
