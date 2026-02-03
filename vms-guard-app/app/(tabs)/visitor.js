import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '../../config/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VisitorScreen() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [visitor, setVisitor] = useState(null);

  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);

  const [purpose, setPurpose] = useState('');
  const [whom, setWhom] = useState('');
  const [hostNumber, setHostNumber] = useState('');

  const [loading, setLoading] = useState(false);

  /* ---------- RESET STATE WHEN PHONE CHANGES ---------- */
  useEffect(() => {
    setVisitor(null);
    setName('');
    setPhoto(null);
    setPurpose('');
    setWhom('');
    setHostNumber('');
    setError('');
  }, [phone]);

  /* ---------- VALIDATION ---------- */
  const isValidPhone = (num) => /^[6-9]\d{9}$/.test(num);

  /* ---------- CHECK VISITOR ---------- */
  const checkVisitor = async () => {
    if (!isValidPhone(phone)) {
      setError('Enter valid 10-digit mobile number');
      return;
    }

    setError('');
    const data = await AsyncStorage.getItem('visitors');
    const visitors = data ? JSON.parse(data) : {};

    if (visitors[phone]) {
      const v = visitors[phone];
      setVisitor({ new: false });
      setName(v.name);
      setPhoto(v.photo || null);
    } else {
      setVisitor({ new: true });
    }
  };

  /* ---------- CAMERA ---------- */
  const capturePhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!res.canceled) {
      setPhoto(res.assets[0].uri);
    }
  };

/* ---------- UPLOAD PHOTO ---------- */
const uploadPhotoToServer = async () => {
  if (!photo) return null;

  const formData = new FormData();
  formData.append('photo', {
    uri: photo,
    type: 'image/jpeg',
    name: 'visitor.jpg',
  });

  const res = await fetch(`${BACKEND_URL}/upload-photo`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  // ✅ RETURN public_id (MATCH BACKEND)
  return data.photoPublicId;
};

  /* ---------- SEND APPROVAL ---------- */
/* ---------- SEND APPROVAL ---------- */
const sendApproval = async () => {
  if (!purpose || !whom || !hostNumber || !name) {
    Alert.alert('Missing Details', 'Please fill all fields');
    return;
  }

  if (!isValidPhone(hostNumber)) {
    Alert.alert('Invalid Host Number');
    return;
  }

  try {
    setLoading(true);

    const requestId = 'IND-' + Math.floor(1000 + Math.random() * 9000);
    const gateTime = new Date().toLocaleTimeString();

    // ✅ UPLOAD PHOTO ONLY ONCE
    const uploadedPhotoPublicId = await uploadPhotoToServer();

    // ✅ FULL IMAGE URL FOR FRONTEND DISPLAY
    const uploadedPhotoUrl = uploadedPhotoPublicId
      ? `https://res.cloudinary.com/${uploadedPhotoPublicId}`
      : null;

    // ✅ SEND APPROVAL (PATH ONLY FOR TEMPLATE)
    const res = await fetch(`${BACKEND_URL}/send-approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        visitorName: name,
        visitorPhone: phone,
        hostNumber,
        photoPublicId: uploadedPhotoPublicId, // PATH ONLY
        gateTime,
      }),
    });

    const result = await res.json();
    if (!result.success) throw new Error();

    /* ---------- SAVE NEW VISITOR LOCALLY ---------- */
    if (visitor?.new) {
      const data = await AsyncStorage.getItem('visitors');
      const visitors = data ? JSON.parse(data) : {};

      visitors[phone] = {
        name,
        photo: uploadedPhotoUrl, // ✅ FULL HTTPS URL
      };

      await AsyncStorage.setItem('visitors', JSON.stringify(visitors));
    }

    router.replace({
      pathname: '/approval-status',
      params: { requestId, hostNumber },
    });

  } catch (e) {
    Alert.alert('Error', 'Failed to send approval');
  } finally {
    setLoading(false);
  }
};


  /* ---------- UI ---------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loaderText}>Sending approval…</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Visitor Check / Approval</Text>

        {/* PHONE INPUT */}
        <View style={styles.card}>
          <Text style={styles.label}>Visitor Mobile Number</Text>

          <TextInput
            placeholder="10-digit mobile number"
            keyboardType="numeric"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.button,
              !isValidPhone(phone) && styles.disabled,
            ]}
            disabled={!isValidPhone(phone)}
            onPress={checkVisitor}
          >
            <Text style={styles.buttonText}>CHECK VISITOR</Text>
          </TouchableOpacity>
        </View>

        {/* VISITOR DETAILS */}
        {visitor && (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.photoBox}
              onPress={visitor.new ? capturePhoto : null}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
              ) : (
                <Text style={styles.photoText}>
                  {visitor.new ? 'Tap to Capture Photo' : 'No Photo'}
                </Text>
              )}
            </TouchableOpacity>

            <TextInput
              placeholder="Visitor Name"
              value={name}
              onChangeText={setName}
              editable={visitor.new}
              style={styles.input}
            />

            <TextInput
              placeholder="Purpose of Visit"
              value={purpose}
              onChangeText={setPurpose}
              style={styles.input}
            />

            <TextInput
              placeholder="Whom to Visit"
              value={whom}
              onChangeText={setWhom}
              style={styles.input}
            />

            <TextInput
              placeholder="Host Mobile Number"
              keyboardType="numeric"
              maxLength={10}
              value={hostNumber}
              onChangeText={setHostNumber}
              style={styles.input}
            />

            <TouchableOpacity
              style={[
                styles.button,
                loading && { backgroundColor: '#9ca3af' },
              ]}
              onPress={sendApproval}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending…' : 'SEND APPROVAL'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
  container: { padding: 16 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0F2A44',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  label: { fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  error: { color: '#dc2626', marginBottom: 8 },
  button: {
    backgroundColor: '#1E5AA8',
    padding: 14,
    borderRadius: 8,
  },
  disabled: { backgroundColor: '#9ca3af' },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  photoBox: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  photo: { width: 120, height: 120, borderRadius: 60 },
  photoText: { color: '#374151', textAlign: 'center' },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loaderText: {
    color: '#ffffff',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
});
