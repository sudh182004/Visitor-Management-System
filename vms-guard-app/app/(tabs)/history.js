// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
// } from 'react-native';
// import { useState, useCallback } from 'react';
// import { BACKEND_URL } from '../../config/api';
// import { useFocusEffect } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Avatar from '../../assets/images/image.png';

// export default function History() {
//   const [history, setHistory] = useState([]);

//   useFocusEffect(
//     useCallback(() => {
//       fetchHistory();
//     }, [])
//   );

//   const fetchHistory = async () => {
//     try {
//       const res = await fetch(`${BACKEND_URL}/history`);
//       const data = await res.json();
//       setHistory(data);
//     } catch (e) {
//       console.log('History fetch failed');
//     }
//   };
// const getImageUri = (photo) => {
//   if (!photo) return null;

//   // already full url
//   if (photo.startsWith('http')) {
//     return photo;
//   }

//   // cloudinary path
//   return `https://res.cloudinary.com/${photo}`;
// };

//  const renderItem = ({ item }) => (
//   <View style={styles.card}>
//     <Image
//   source={
//     getImageUri(item.photo)
//       ? { uri: getImageUri(item.photo) }
//       : Avatar
//   }
//   style={styles.photo}
//   resizeMode="cover"
// />

//     <View style={{ flex: 1 }}>
//       <Text style={styles.name}>{item.name}</Text>
//       <Text>{item.phone}</Text>
//       <Text>IN: {new Date(item.inTime).toLocaleTimeString()}</Text>
//       <Text>OUT: {new Date(item.outTime).toLocaleTimeString()}</Text>
//       <Text style={styles.type}>{item.type}</Text>
//     </View>
//   </View>
// );


//   return (
//       <SafeAreaView style={styles.safeArea}>
//     <View style={styles.container}>
//       <Text style={styles.title}>Visit History</Text>

//       <FlatList
//         data={history}
//         keyExtractor={(item, index) => index.toString()}
//         ListEmptyComponent={<Text>No history available</Text>}
//         renderItem={renderItem}
//       />
//     </View>
//     </SafeAreaView>
//   );
// }

// /* ---------- STYLES ---------- */
// const styles = StyleSheet.create({
//   /* ---------- SAFE AREA ---------- */
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#F1F5F9',
//   },

//   /* ---------- CONTAINER ---------- */
//   container: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: 12,
//     backgroundColor: '#F1F5F9',
//   },

//   /* ---------- TITLE ---------- */
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 18,
//     color: '#0F172A',
//   },

//   /* ---------- CARD ---------- */
//   card: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 18,
//     padding: 14,
//     marginBottom: 14,

//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//   },

//   /* ---------- PHOTO ---------- */
//   photo: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     marginRight: 14,
//     backgroundColor: '#E5E7EB',
//   },

//   /* ---------- TEXT ---------- */
//   name: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#0F172A',
//   },

//   type: {
//     marginTop: 6,
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#2563EB',
//     textTransform: 'uppercase',
//   },
// });

import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import { useState, useCallback } from 'react';
import { BACKEND_URL } from '../../config/api';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../assets/images/image.png';

export default function History() {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/history`);
      const data = await res.json();
      setHistory(data || []);
    } catch (e) {
      console.log('History fetch failed');
    }
  };

  const getImageUri = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return `https://res.cloudinary.com/${photo}`;
  };

  const renderItem = ({ item }) => (
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
        <Text style={styles.name}>{item?.name}</Text>
        <Text>{item?.phone}</Text>
        <Text>IN: {new Date(item?.inTime).toLocaleTimeString()}</Text>
        <Text>OUT: {new Date(item?.outTime).toLocaleTimeString()}</Text>
        <Text style={styles.type}>{item?.type}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Visit History</Text>

        <FlatList
          data={history}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No history available</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#F1F5F9',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
    color: '#0F172A',
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

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,

    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  photo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: '#E5E7EB',
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },

  type: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
});
