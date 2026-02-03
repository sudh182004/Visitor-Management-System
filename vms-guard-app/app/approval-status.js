import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Linking,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BACKEND_URL } from '../config/api';

export default function ApprovalStatus() {
  const { requestId, hostNumber } = useLocalSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState('PENDING');
  const [seconds, setSeconds] = useState(60);

  // disable back
  useEffect(() => {
    const bh = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => bh.remove();
  }, []);

  // countdown
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  // poll status
  useEffect(() => {
    const poll = setInterval(async () => {
      const res = await fetch(`${BACKEND_URL}/status/${requestId}`);
      const data = await res.json();
      setStatus(data.status);
    }, 3000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if (status === 'APPROVED' || status === 'REJECTED') {
      setTimeout(() => router.replace('/(tabs)/home'), 3000);
    }

    if (status === 'EXPIRED') {
      Alert.alert(
        'Approval Expired',
        'Do you want to call the host?',
        [
          { text: 'No', onPress: () => router.replace('/(tabs)/home') },
          { text: 'Yes', onPress: () => Linking.openURL(`tel:${hostNumber}`) },
        ]
      );
    }
  }, [status]);

  return (
    <View style={styles.container}>
      {status === 'PENDING' && (
        <>
          <ActivityIndicator size="large" color="#1E5AA8" />
          <Text style={styles.big}>Waiting for Approval</Text>
          <Text style={styles.timer}>⏱ {seconds}s remaining</Text>
        </>
      )}

      {status === 'APPROVED' && <Text style={styles.approved}>✅ ENTRY ALLOWED</Text>}
      {status === 'REJECTED' && <Text style={styles.rejected}>❌ ENTRY DENIED</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FB' },
  big: { fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  timer: { fontSize: 16, marginTop: 8, color: '#374151' },
  approved: { fontSize: 28, color: '#16a34a', fontWeight: 'bold' },
  rejected: { fontSize: 28, color: '#dc2626', fontWeight: 'bold' },
});
