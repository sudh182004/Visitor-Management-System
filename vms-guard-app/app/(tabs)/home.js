import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback } from 'react';
import { BACKEND_URL } from '../../config/api';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../assets/images/image.png';

export default function HomeScreen() {
  const [guard, setGuard] = useState(null);
  const [active, setActive] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  /* 🔄 FETCH ON TAB FOCUS */
  useFocusEffect(
    useCallback(() => {
      loadGuard();
      fetchActive();
    }, [])
  );
const getImageUri = (photo) => {
  if (!photo) return null;

  // already full url
  if (photo.startsWith('http')) {
    return photo;
  }

  // cloudinary path
  return `https://res.cloudinary.com/${photo}`;
};

  const loadGuard = async () => {
    const data = await AsyncStorage.getItem('guard');
    if (data) setGuard(JSON.parse(data));
  };

  const fetchActive = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/active-visits`);
      const data = await res.json();
      setActive(data);
    } catch (e) {
      console.log('Active fetch failed');
    }
    setLoading(false);
  };

  const checkout = async (phone) => {
    Alert.alert(
      'Confirm Checkout',
      'Mark this visitor as OUT?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            const res = await fetch(`${BACKEND_URL}/checkout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone }),
            });

            const data = await res.json();
            if (!data.success) {
              Alert.alert('Error', 'Visitor not inside');
              return;
            }

            fetchActive();
          },
        },
      ]
    );
  };

  const filtered = active.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.phone.includes(search)
  );

  if (!guard) return null;

  return (
    <SafeAreaView style={styles.safeArea}>

    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {guard.name} ({guard.designation})</Text>

      <TextInput
        placeholder="Search by name or phone"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#1E5AA8" />
      ) : (
        <FlatList
  data={Array.isArray(filtered) ? filtered : []}
  keyExtractor={(item, index) =>
    item?.phone ? item.phone : index.toString()
  }
  ListEmptyComponent={ <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No visitors inside</Text>
    </View>}
renderItem={({ item }) => (
  <View style={styles.card}>
    <Image
  source={
    getImageUri(item?.photo)
      ? { uri: getImageUri(item.photo) }
      : Avatar
  }
  style={styles.photo}
  resizeMode="cover"
/>


      

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item?.name || 'Unknown'}</Text>
        <Text>{item?.phone || '-'}</Text>
        <Text>
          IN: {item?.inTime
            ? new Date(item.inTime).toLocaleTimeString()
            : '--'}
        </Text>
        <Text style={styles.type}>{item?.type}</Text>
      </View>

      <TouchableOpacity
        style={styles.outBtn}
        onPress={() => checkout(item.phone)}
      >
        <Text style={styles.outText}>OUT</Text>
      </TouchableOpacity>
    </View>
  )}
/>

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

  /* ---------- LAYOUT ---------- */
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10, // extra breathing space from top
    backgroundColor: '#F1F5F9',
  },

  /* ---------- HEADER ---------- */
  welcome: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 18,
  },

  /* ---------- INPUT ---------- */
  input: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 15,
    color: '#0F172A',
  },

  /* ---------- CARD ---------- */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,

    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  /* ---------- IMAGE ---------- */
  photo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    backgroundColor: '#E5E7EB',
  },
  emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},

emptyText: {
  fontSize: 14,
  color: '#64748B',
},


  /* ---------- TEXT ---------- */
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
  },

  type: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
  },

  meta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  /* ---------- BUTTON ---------- */
  outBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  outText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* ---------- PREMIUM BADGE ---------- */
  badge: {
    backgroundColor: '#ECFEFF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 6,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0E7490',
  },
});
