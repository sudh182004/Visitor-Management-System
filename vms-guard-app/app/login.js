import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUARDS = {
  '672821': {
    name: 'MANJEET KUMAR',
    phone: '9717838654',
    designation: 'GUARD',
  },
  '866561': {
    name: 'ANKIT KUMAR',
    phone: '9634579811',
    designation: 'GUARD',
  },
};

export default function LoginScreen() {
  const [clockNumber, setClockNumber] = useState('');
  const router = useRouter();
  
  const handleLogin = async () => {
    const guard = GUARDS[clockNumber];

    if (!guard) {
      Alert.alert('Login Failed', 'Invalid Clock Number');
      return;
    }

    const data = {
      clockNumber,
      ...guard,
    };

    await AsyncStorage.setItem('guard', JSON.stringify(data));
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Company Branding */}
      <View style={styles.brandBox}>
        <Text style={styles.company}>XYZ Company</Text>
        <Text style={styles.subtitle}>Visitor Management System</Text>
      </View>

      {/* Login Card */}
      <View style={styles.card}>
        <Text style={styles.loginTitle}>Guard Login</Text>

        <TextInput
          placeholder="Enter Clock Number"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={clockNumber}
          onChangeText={setClockNumber}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2A44',
    justifyContent: 'center',
    padding: 24,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  company: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#cbd5e1',
    marginTop: 6,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 24,
    elevation: 6,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#0F2A44',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1E5AA8',
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
