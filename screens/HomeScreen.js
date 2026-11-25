import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation, totalCheckIns, onAddCheckIn }) {
  const [locationData, setLocationData] = useState(null);
  const [placeLabel, setPlaceLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleGetLocation() {
    setLoading(true);
    setFeedback(null);
    setPermissionDenied(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setPermissionDenied(true);
        setLocationData(null);
        setFeedback({
          type: 'error',
          text: 'Permissão de localização negada. Ative o acesso nas configurações do aparelho ou navegador para continuar.',
        });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      let addressText = 'Endereço aproximado disponível no dispositivo móvel';

      if (Platform.OS !== 'web') {
        try {
          const results = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          if (results && results.length > 0) {
            const place = results[0];
            const parts = [
              place.street,
              place.district || place.subregion,
              place.city,
              place.region,
            ].filter(Boolean);

            if (parts.length > 0) {
              addressText = parts.join(', ');
            }
          }
        } catch {
          addressText = 'Coordenadas obtidas (endereço indisponível)';
        }
      }

      setLocationData({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        address: addressText,
      });
    } catch {
      setFeedback({
        type: 'error',
        text: 'Não foi possível capturar sua posição agora. Verifique se o GPS está ativo e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSaveCheckIn() {
    if (!locationData) return;

    const newCheckIn = {
      id: String(Date.now()),
      label: placeLabel.trim() || 'Local visitado',
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      address: locationData.address,
      createdAt: new Date().toLocaleString('pt-BR'),
    };

    onAddCheckIn(newCheckIn);
    setPlaceLabel('');
    setFeedback({
      type: 'success',
      text: 'Check-in salvo no histórico com sucesso.',
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.iconBadge}>
          <Ionicons name="location" size={28} color="#38BDF8" />
        </View>
        <Text style={styles.title}>Onde estou agora?</Text>
        <Text style={styles.subtitle}>
          Capture suas coordenadas GPS atuais e registre seus lugares visitados.
        </Text>

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleGetLocation}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <>
              <Ionicons name="navigate" size={18} color="#0F172A" />
              <Text style={styles.primaryButtonText}>
                {locationData ? 'Atualizar Localização' : 'Capturar Localização'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {feedback && (
        <View
          style={[
            styles.feedbackBox,
            feedback.type === 'error' ? styles.errorBox : styles.successBox,
          ]}
        >
          <Ionicons
            name={feedback.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
            size={20}
            color={feedback.type === 'error' ? '#FCA5A5' : '#86EFAC'}
          />
          <Text
            style={[
              styles.feedbackText,
              feedback.type === 'error' ? styles.errorText : styles.successText,
            ]}
          >
            {feedback.text}
          </Text>
        </View>
      )}

      {permissionDenied && (
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Como liberar a permissão</Text>
          <Text style={styles.tipText}>
            No celular, abra as permissões do aplicativo Expo Go e permita o acesso à localização. Depois toque em Capturar Localização novamente.
          </Text>
        </View>
      )}

      {locationData && (
        <View style={styles.resultCard}>
          <Text style={styles.sectionLabel}>POSIÇÃO ATUAL</Text>

          <View style={styles.coordsRow}>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>Latitude</Text>
              <Text style={styles.coordValue}>
                {locationData.latitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>Longitude</Text>
              <Text style={styles.coordValue}>
                {locationData.longitude.toFixed(6)}
              </Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="map-outline" size={18} color="#94A3B8" />
            <Text style={styles.addressText}>{locationData.address}</Text>
          </View>

          <Text style={styles.inputLabel}>Nome do local (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Faculdade, Trabalho, Casa..."
            placeholderTextColor="#64748B"
            value={placeLabel}
            onChangeText={setPlaceLabel}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveCheckIn}
            activeOpacity={0.85}
          >
            <Ionicons name="bookmark" size={18} color="#F8FAFC" />
            <Text style={styles.saveButtonText}>Salvar Check-in</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('History')}
        activeOpacity={0.85}
      >
        <View style={styles.historyButtonLeft}>
          <Ionicons name="list" size={20} color="#38BDF8" />
          <Text style={styles.historyButtonText}>Ver Lugares Salvos</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{totalCheckIns}</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#38BDF8',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: '#450A0A',
    borderColor: '#991B1B',
  },
  successBox: {
    backgroundColor: '#052E16',
    borderColor: '#166534',
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: '#FECACA',
  },
  successText: {
    color: '#BBF7D0',
  },
  tipBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tipTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  tipText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  resultCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 1,
    marginBottom: 12,
  },
  coordsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  coordBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  coordLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  coordValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyButtonText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: '#0F172A',
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  countText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 13,
  },
});