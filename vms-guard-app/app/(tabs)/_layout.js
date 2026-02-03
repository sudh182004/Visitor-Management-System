import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="visitor"
        options={{
          title: 'Visitor',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="preapproved"
        options={{
          title: 'Pre-Approved',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
  name="history"
  options={{
    title: 'History',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="time" size={size} color={color} />
    ),
  }}
/>
  <Tabs.Screen
    name="logout"
    options={{
      title: 'Logout',
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="log-out" size={size} color={color} />
      ),
    }}
  />

    </Tabs>
    
  );
}
