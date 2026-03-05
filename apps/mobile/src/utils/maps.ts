/**
 * Utilitários para abrir mapas e rotas
 */

import { Linking, Alert, Platform } from 'react-native';

/**
 * Abre o aplicativo de mapas com rota até o endereço
 * @param address - Endereço completo
 * @param label - Nome do local (opcional)
 */
export async function openMapsRoute(address: string, label?: string): Promise<void> {
  if (!address.trim()) {
    Alert.alert('Erro', 'Endereço não disponível');
    return;
  }

  const encodedAddress = encodeURIComponent(address);
  const displayLabel = label || 'Destino';

  // URLs para diferentes plataformas
  const urls = {
    // iOS - Apple Maps
    ios: `http://maps.apple.com/?q=${encodedAddress}`,
    // Android - Google Maps
    android: `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`,
    // Fallback universal
    universal: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
  };

  const url = Platform.select({
    ios: urls.ios,
    android: urls.android,
    default: urls.universal,
  });

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Fallback para navegador
      await Linking.openURL(urls.universal);
    }
  } catch (error) {
    console.error('Erro ao abrir mapas:', error);
    Alert.alert('Erro', 'Não foi possível abrir o mapa. Tente novamente.');
  }
}

/**
 * Abre o mapa em uma localização específica (com coordenadas)
 * @param lat - Latitude
 * @param lng - Longitude  
 * @param label - Nome do local
 */
export async function openMapsWithCoordinates(
  lat: number,
  lng: number,
  label?: string
): Promise<void> {
  const encodedLabel = label ? encodeURIComponent(label) : '';

  const urls = {
    ios: `http://maps.apple.com/?q=${encodedLabel}&ll=${lat},${lng}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${encodedLabel})`,
    universal: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  };

  const url = Platform.select({
    ios: urls.ios,
    android: urls.android,
    default: urls.universal,
  });

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(urls.universal);
    }
  } catch (error) {
    console.error('Erro ao abrir mapas:', error);
    Alert.alert('Erro', 'Não foi possível abrir o mapa.');
  }
}

/**
 * Formata endereço para exibição
 */
export function formatAddress(address: string): string {
  if (!address) return 'Endereço não informado';
  return address.trim();
}
