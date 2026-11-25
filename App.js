import React, { useState } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [checkIns, setCheckIns] = useState([]);

  const navigation = {
    navigate: (screenName) => setCurrentScreen(screenName),
    goBack: () => setCurrentScreen('Home'),
  };

  function handleAddCheckIn(newCheckIn) {
    setCheckIns((prev) => [newCheckIn, ...prev]);
  }

  function handleRemoveCheckIn(id) {
    setCheckIns((prev) => prev.filter((item) => item.id !== id));
  }

  const isHistory = currentScreen === 'History';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={styles.header}>
        {isHistory ? (
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => navigation.goBack()}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
          </TouchableOpacity>
        ) : null}

        <Text style={styles.headerTitle}>
          {isHistory ? 'Lugares Salvos' : 'GeoCheck'}
        </Text>
      </View>

      <View style={styles.content}>
        {isHistory ? (
          <HistoryScreen
            navigation={navigation}
            checkIns={checkIns}
            onRemoveCheckIn={handleRemoveCheckIn}
          />
        ) : (
          <HomeScreen
            navigation={navigation}
            totalCheckIns={checkIns.length}
            onAddCheckIn={handleAddCheckIn}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight || 24
        : Platform.OS === 'ios'
        ? 48
        : 0,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  content: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});