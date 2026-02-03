import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '../../config/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PreApproved() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); 
  // null | { status: FOUND | NOT_FOUND | EXPIRED }

  const router = useRouter();

  const isValidPhone = (num) => /^[6-9]\d{9}$/.test(num);

  const checkPreApproval = async () => {
    if (!isValidPhone(phone)) {
      Alert.alert('Invalid Number', 'Enter valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/preapproval/${phone}`);
      const data = await res.json();

      setTimeout(() => {
        setLoading(false);

        if (data.valid) {
          setResult({
            status: 'FOUND',
            name: data.name,
            phone,
            approvedBy: 'Pankaj Ji', // dummy
            type: 'PRE-APPROVED',
          });
        } else {
          setResult({ status: 'NOT_FOUND' });
        }
      }, 1500); // smooth UX

    } catch (e) {
      setLoading(false);
      Alert.alert('Network Error', 'Unable to check pre-approval');
    }
  };

  const goToApproval = () => {
    router.push('/(tabs)/visitor');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <Text style={styles.title}>Pre-Approved Entry</Text>

      <TextInput
        placeholder="Visitor Mobile Number"
        keyboardType="numeric"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />

      <TouchableOpacity style={styles.btn} onPress={checkPreApproval}>
        <Text style={styles.btnText}>CHECK</Text>
      </TouchableOpacity>

      {/* LOADER */}
      {loading && (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#1E5AA8" />
          <Text style={styles.loadingText}>
            Checking pre-approval…
          </Text>
        </View>
      )}

      {/* FOUND */}
      {result?.status === 'FOUND' && (
        <View style={styles.cardSuccess}>
          <Text style={styles.successTitle}>ENTRY ALLOWED</Text>
          <Text>Name: {result.name}</Text>
          <Text>Phone: {result.phone}</Text>
          <Text>Type: {result.type}</Text>
          <Text>Approved By: {result.approvedBy}</Text>
        </View>
      )}

      {/* NOT FOUND / EXPIRED */}
      {result?.status === 'NOT_FOUND' && (
        <View style={styles.cardError}>
          <Text style={styles.errorTitle}>
            No valid pre-approval found
          </Text>
          <Text style={styles.subText}>
            Approval may be expired or not created.
          </Text>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={goToApproval}
          >
            <Text style={styles.secondaryText}>
              Send Approval Request
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  /* ---------- SAFE AREA ---------- */
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  /* ---------- CONTAINER ---------- */
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#F1F5F9',
  },

  /* ---------- TITLE ---------- */
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#0F172A',
  },

  /* ---------- INPUT ---------- */
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 15,
    color: '#0F172A',
  },

  /* ---------- PRIMARY BUTTON ---------- */
  btn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
  },

  btnText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },

  /* ---------- LOADER ---------- */
  loaderBox: {
    marginTop: 24,
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },

  /* ---------- SUCCESS CARD ---------- */
  cardSuccess: {
    marginTop: 24,
    backgroundColor: '#ECFDF5',
    padding: 18,
    borderRadius: 16,
    borderColor: '#22C55E',
    borderWidth: 1,
  },

  successTitle: {
    color: '#15803D',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },

  /* ---------- ERROR CARD ---------- */
  cardError: {
    marginTop: 24,
    backgroundColor: '#FEF2F2',
    padding: 18,
    borderRadius: 16,
    borderColor: '#EF4444',
    borderWidth: 1,
  },

  errorTitle: {
    color: '#B91C1C',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },

  subText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 14,
  },

  /* ---------- SECONDARY BUTTON ---------- */
  secondaryBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
  },

  secondaryText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
});
