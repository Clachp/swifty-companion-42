import { Tabs } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function TabLayout() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#25292e',
        },
      }}
    >
      {isAuthenticated ? (
        <Tabs.Screen
          name="index"
          options={{
            title: 'Logout',
            tabBarIcon: ({ color }) => (
              <Ionicons name="log-out-outline" color={color} size={24} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              logout();
            },
          }}
        />
      ) : (
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
            ),
          }}
        />
      )}

      <Tabs.Screen
        name="search"
        options={{
          title: 'Search a profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
