/**
 * MarketplaceScreen - Anúncios de produtos de barbearia
 * Anúncios expiram em 3 dias, custo R$ 0,99 (ou equivalente)
 * Máximo 3 anúncios ativos por pessoa
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppButton, AppCard, Badge } from '../../components';
import { useUser } from '../../store/user';
import type { GlobalFeedPost } from '../../types/models';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Preços de anúncios por país
const AD_PRICES = {
  BR: { currency: 'R$', price: '0,99', priceValue: 0.99, days: 3 },
  PT: { currency: '€', price: '0,99', priceValue: 0.99, days: 3 },
  US: { currency: 'US$', price: '0,99', priceValue: 0.99, days: 3 },
  ES: { currency: '€', price: '0,99', priceValue: 0.99, days: 3 },
  AR: { currency: 'ARS$', price: '299', priceValue: 299, days: 3 },
  MX: { currency: 'MX$', price: '19', priceValue: 19, days: 3 },
  CO: { currency: 'COP$', price: '3.900', priceValue: 3900, days: 3 },
  CL: { currency: 'CLP$', price: '890', priceValue: 890, days: 3 },
  PE: { currency: 'PEN', price: '3,90', priceValue: 3.90, days: 3 },
  UY: { currency: 'UYU$', price: '39', priceValue: 39, days: 3 },
  PY: { currency: 'PYG$', price: '7.900', priceValue: 7900, days: 3 },
};

interface AdProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  photos: string[];
  sellerUid: string;
  sellerName: string;
  sellerPhoto?: string;
  sellerCountry: string;
  sellerPhone?: string;
  sellerWhatsApp?: string;
  category: 'produto' | 'equipamento' | 'mobilia' | 'outro';
  condition: 'novo' | 'seminovo' | 'usado';
  location: string;
  expiresAt: any;
  isActive: boolean;
  views: number;
  createdAt: any;
}

export default function MarketplaceScreen() {
  const { uid, name, photoUrl, role } = useUser();
  const [activeAds, setActiveAds] = useState<AdProduct[]>([]);
  const [archivedAds, setArchivedAds] = useState<AdProduct[]>([]);
  const [myAds, setMyAds] = useState<AdProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'archived' | 'my'>('all');
  const [userCountry, setUserCountry] = useState('BR');
  const [loading, setLoading] = useState(true);

  // Detectar país do usuário
  useEffect(() => {
    // Em produção, detectar do device ou perfil do usuário
    setUserCountry('BR');
  }, []);

  // Carregar anúncios
  useEffect(() => {
    const now = Timestamp.now();
    
    // Anúncios ativos (não expirados)
    const activeQuery = query(
      collection(db, 'marketplace', 'ads', 'all'),
      where('isActive', '==', true),
      where('expiresAt', '>', now),
      orderBy('expiresAt', 'asc')
    );

    // Anúncios arquivados (expirados)
    const archivedQuery = query(
      collection(db, 'marketplace', 'ads', 'all'),
      where('isActive', '==', false),
      orderBy('expiresAt', 'desc')
    );

    const unsubscribeActive = onSnapshot(activeQuery, (snapshot) => {
      const ads: AdProduct[] = [];
      snapshot.forEach((doc) => {
        ads.push({ id: doc.id, ...doc.data() } as AdProduct);
      });
      setActiveAds(ads);
      setLoading(false);
    });

    const unsubscribeArchived = onSnapshot(archivedQuery, (snapshot) => {
      const ads: AdProduct[] = [];
      snapshot.forEach((doc) => {
        ads.push({ id: doc.id, ...doc.data() } as AdProduct);
      });
      setArchivedAds(ads);
    });

    // Meus anúncios
    if (uid) {
      const myAdsQuery = query(
        collection(db, 'marketplace', 'ads', 'all'),
        where('sellerUid', '==', uid),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribeMy = onSnapshot(myAdsQuery, (snapshot) => {
        const ads: AdProduct[] = [];
        snapshot.forEach((doc) => {
          ads.push({ id: doc.id, ...doc.data() } as AdProduct);
        });
        setMyAds(ads);
      });

      return () => {
        unsubscribeActive();
        unsubscribeArchived();
        unsubscribeMy();
      };
    }

    return () => {
      unsubscribeActive();
      unsubscribeArchived();
    };
  }, [uid]);

  const getAdPrice = () => {
    return AD_PRICES[userCountry as keyof typeof AD_PRICES] || AD_PRICES.BR;
  };

  const canCreateAd = async () => {
    if (!uid) {
      Alert.alert('Login necessário', 'Faça login para criar anúncios');
      return false;
    }

    // Verificar limite de 3 anúncios ativos
    const activeMyAds = myAds.filter(ad => ad.isActive && ad.expiresAt.toDate() > new Date());
    if (activeMyAds.length >= 3) {
      Alert.alert('Limite atingido', 'Você já tem 3 anúncios ativos. Espere um expirar ou arquive um existente.');
      return false;
    }

    return true;
  };

  const createAd = async () => {
    if (!(await canCreateAd())) return;

    const adPrice = getAdPrice();
    
    Alert.alert(
      'Criar Anúncio',
      `Custo: ${adPrice.currency} ${adPrice.price} por ${adPrice.days} dias\n\nVocê será redirecionado para o pagamento.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Continuar', 
          onPress: () => {
            // Aqui abriria o checkout do Stripe
            Alert.alert('Em desenvolvimento', 'Integração com pagamento em breve!');
          }
        }
      ]
    );
  };

  const contactSeller = (ad: AdProduct) => {
    if (ad.sellerWhatsApp) {
      const message = `Olá! Vi seu anúncio "${ad.title}" no BarberPro Marketplace. Ainda está disponível?`;
      const url = `https://wa.me/${ad.sellerWhatsApp}?text=${encodeURIComponent(message)}`;
      // Abrir WhatsApp
      Alert.alert('WhatsApp', `Contatar ${ad.sellerName} no WhatsApp`);
    } else if (ad.sellerPhone) {
      Alert.alert('Contato', `Telefone: ${ad.sellerPhone}`);
    } else {
      Alert.alert('Contato', 'Vendedor não disponibilizou contato.');
    }
  };

  const archiveAd = async (adId: string) => {
    try {
      await updateDoc(doc(db, 'marketplace', 'ads', 'all', adId), {
        isActive: false,
        archivedAt: serverTimestamp(),
      });
      Alert.alert('✅ Arquivado', 'Anúncio movido para arquivados.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível arquivar o anúncio.');
    }
  };

  const renderAd = ({ item }: { item: AdProduct }) => {
    const isExpired = item.expiresAt.toDate() < new Date();
    const daysLeft = Math.ceil((item.expiresAt.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isMine = item.sellerUid === uid;

    return (
      <AppCard style={{ marginBottom: spacing.md }}>
        {/* Fotos */}
        {item.photos && item.photos.length > 0 && (
          <Image
            source={{ uri: item.photos[0] }}
            style={{
              width: '100%',
              height: 200,
              borderRadius: radius.md,
              marginBottom: spacing.md,
            }}
            resizeMode="cover"
          />
        )}

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fontSize.lg, fontWeight: '700', color: colors.text }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: fontSize.md, color: colors.primary, fontWeight: '600' }}>
              {item.currency} {item.price.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <Badge 
            text={item.condition === 'novo' ? 'Novo' : item.condition === 'seminovo' ? 'Semi-novo' : 'Usado'} 
            variant={item.condition === 'novo' ? 'success' : 'warning'} 
            size="sm" 
          />
        </View>

        {/* Descrição */}
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm }} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Info do vendedor */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.textMuted }}>
            👤 {item.sellerName} • {item.location}
          </Text>
        </View>

        {/* Status */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
          {isExpired ? (
            <Text style={{ fontSize: fontSize.sm, color: colors.error }}>⚠️ Expirado</Text>
          ) : (
            <Text style={{ fontSize: fontSize.sm, color: colors.success }}>
              ⏰ {daysLeft} dia{daysLeft !== 1 ? 's' : ''} restante{daysLeft !== 1 ? 's' : ''}
            </Text>
          )}
          <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
            👁 {item.views} visualizações
          </Text>
        </View>

        {/* Ações */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {!isMine && !isExpired && (
            <AppButton
              title="📞 Contatar"
              onPress={() => contactSeller(item)}
              variant="primary"
              size="sm"
              style={{ flex: 1 }}
            />
          )}
          {isMine && !isExpired && (
            <AppButton
              title="📁 Arquivar"
              onPress={() => archiveAd(item.id)}
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
            />
          )}
          {isExpired && isMine && (
            <AppButton
              title="🔄 Republicar"
              onPress={createAd}
              variant="primary"
              size="sm"
              style={{ flex: 1 }}
            />
          )}
        </View>
      </AppCard>
    );
  };

  const getCurrentAds = () => {
    switch (activeTab) {
      case 'archived':
        return archivedAds;
      case 'my':
        return myAds;
      default:
        return activeAds;
    }
  };

  const adPrice = getAdPrice();

  return (
    <View style={globalStyles.screen}>
      <Header
        title="Marketplace"
        subtitle="Compre e venda produtos de barbearia"
        rightIcon="➕"
        onRightPress={createAd}
      />

      {/* Info de preço */}
      <View style={{ backgroundColor: colors.primaryBg, padding: spacing.md, margin: spacing.md, borderRadius: radius.lg }}>
        <Text style={{ fontSize: fontSize.md, color: colors.text, textAlign: 'center', fontWeight: '600' }}>
          📢 Anuncie por apenas {adPrice.currency} {adPrice.price}
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' }}>
          {adPrice.days} dias de visibilidade • Máximo 3 anúncios ativos
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginHorizontal: spacing.md }}>
        {[
          { key: 'all', label: 'Ativos', count: activeAds.length },
          { key: 'archived', label: 'Arquivados', count: archivedAds.length },
          { key: 'my', label: 'Meus', count: myAds.length },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            style={{
              flex: 1,
              paddingVertical: spacing.md,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.key ? colors.primary : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: fontSize.sm,
                fontWeight: activeTab === tab.key ? '600' : '400',
                color: activeTab === tab.key ? colors.primary : colors.textSecondary,
              }}
            >
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={getCurrentAds()}
        keyExtractor={(item) => item.id}
        renderItem={renderAd}
        contentContainerStyle={{ padding: spacing.md }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: spacing.xxl }}>
            <Text style={{ fontSize: 48, marginBottom: spacing.md }}>📦</Text>
            <Text style={{ fontSize: fontSize.lg, color: colors.text, textAlign: 'center' }}>
              Nenhum anúncio {activeTab === 'archived' ? 'arquivado' : activeTab === 'my' ? 'seu' : 'ativo'}
            </Text>
            {activeTab === 'all' && (
              <AppButton
                title="Criar primeiro anúncio"
                onPress={createAd}
                variant="primary"
                style={{ marginTop: spacing.md }}
              />
            )}
          </View>
        }
      />
    </View>
  );
}
