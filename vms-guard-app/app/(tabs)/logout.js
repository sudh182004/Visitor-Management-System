import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.removeItem('guard').then(() => {
      router.replace('/login');
    });
  }, []);

  return null;
}
