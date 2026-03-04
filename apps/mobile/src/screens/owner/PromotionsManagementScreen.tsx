/* ============================
   BARBERPRO — Gerenciar Promoções (Dono)
   CRUD de promoções e ofertas especiais
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppCard, AppButton, AppInput, Badge, EmptyState } from '../../components';
import { useUser } from '../../store/user';
import type { Promotion, ServiceItem } from '../../types/models';

export default function PromotionsManagementScreen() {
  const shopId = useUser((s) => s.shopId);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!shopId || !db) {
      setLoading(false);
      return;
    }

    // Carregar promoções
    const unsubPromos = onSnapshot(
      collection(db, 'barbershops', shopId, 'promotions'),
      (snap) => {
        setPromotions(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
      }
    );

    // Carregar serviços
    getDocs(collection(db, 'barbershops', shopId, 'services')).then((snap) => {
      setServices(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });

    return () => unsubPromos();
  }, [shopId]);

  const openCreateModal = () => {
    setEditingPromo(null);
    setTitle('');
    setDescription('');
    setDiscountPercent('');
    setUsageLimit('');
    setSelectedServices([]);
    setShowModal(true);
  };

  const openEditModal = (promo: Promotion) => {
    setEditingPromo(promo);
    setTitle(promo.title);
    setDescription(promo.description || '');
    setDiscountPercent(String(promo.discountPercent || ''));
    setUsageLimit(String(promo.usageLimit || ''));
    setSelectedServices(promo.serviceIds || []);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'Título é obrigatório');
      return;
    }
    const discount = parseInt(discountPercent);
    if (isNaN(discount) || discount < 1 || discount > 100) {
      Alert.alert('Erro', 'Desconto deve ser entre 1% e 100%');
      return;
    }

    setSaving(true);
    try {
      const promoData = {
        type: 'discount' as const,
        title: title.trim(),
        description: description.trim() || null,
        discountPercent: discount,
        active: true,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        usageCount: editingPromo?.usageCount || 0,
        serviceIds: selectedServices.length > 0 ? selectedServices : null,
        startsAt: null,
        expiresAt: null,
      };

      if (editingPromo) {
        await updateDoc(doc(db, 'barbershops', shopId!, 'promotions', editingPromo.id), promoData);
        Alert.alert('✅ Sucesso', 'Promoção atualizada!');
      } else {
        await addDoc(collection(db, 'barbershops', shopId!, 'promotions'), {
          ...promoData,
          createdAt: new Date(),
        });
        Alert.alert('✅ Sucesso', 'Promoção criada!');
      }
      setShowModal(false);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (promo: Promotion) => {
    try {
      await updateDoc(doc(db, 'barbershops', shopId!, 'promotions', promo.id), { active: !promo.active });
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  const handleDelete = async (promo: Promotion) => {
    Alert.alert('Excluir promoção?', `Tem certeza que deseja excluir "${promo.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'barbershops', shopId!, 'promotions', promo.id));
            Alert.alert('✅', 'Promoção excluída');
          } catch (e: any) {
            Alert.alert('Erro', e.message);
          }
        },
      },
    ]);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  return (
    <View style={globalStyles.screen}>
      <Header title="Promoções" subtitle={`${promotions.length} promoção(ões)`} rightIcon="➕" onRightPress={openCreateModal} />

      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        renderItem={({ item }) => (
          <AppCard>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
                  🎉 {item.title}
                </Text>
                {item.description && (
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs }}>
                    {item.description}
                  </Text>
                )}
              </View>
              <Badge text={item.active ? 'Ativa' : 'Inativa'} variant={item.active ? 'success' : 'warning'} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg }}>
              <View>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>Desconto</Text>
                <Text style={{ color: colors.gold, fontSize: fontSize.xl, fontWeight: '700' }}>
                  {item.discountPercent}%
                </Text>
              </View>
              {item.usageLimit && (
                <View>
                  <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>Uso</Text>
                  <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '600' }}>
                    {item.usageCount || 0}/{item.usageLimit}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TouchableOpacity
                onPress={() => openEditModal(item)}
                style={{ flex: 1, backgroundColor: colors.primaryBg, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center' }}
              >
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: fontSize.sm }}>✏️ Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleToggleActive(item)}
                style={{ flex: 1, backgroundColor: item.active ? colors.cardElevated : colors.primaryBg, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center' }}
              >
                <Text style={{ color: item.active ? colors.textMuted : colors.primary, fontWeight: '600', fontSize: fontSize.sm }}>
                  {item.active ? '⏸️ Desativar' : '▶️ Ativar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={{ backgroundColor: colors.dangerBg, borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' }}
              >
                <Text style={{ color: colors.danger, fontWeight: '600', fontSize: fontSize.sm }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </AppCard>
        )}
        ListEmptyComponent={<EmptyState icon="🎉" title="Nenhuma promoção" message="Crie ofertas especiais para seus clientes" />}
      />

      {/* Modal de criação/edição */}
      <Modal visible={showModal} animationType="slide" transparent={false} onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: colors.bg }}>
          <Header title={editingPromo ? 'Editar promoção' : 'Nova promoção'} leftIcon="❌" onLeftPress={() => setShowModal(false)} />

          <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
            <AppCard>
              <AppInput label="Título *" value={title} onChangeText={setTitle} placeholder="Ex: Desconto de Verão" />
              <AppInput label="Descrição" value={description} onChangeText={setDescription} placeholder="Descreva a promoção" multiline numberOfLines={3} />
              
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <AppInput label="Desconto (%) *" value={discountPercent} onChangeText={setDiscountPercent} placeholder="20" keyboardType="number-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppInput label="Limite de uso" value={usageLimit} onChangeText={setUsageLimit} placeholder="Ilimitado" keyboardType="number-pad" />
                </View>
              </View>

              {/* Serviços elegíveis */}
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.md, fontWeight: '600' }}>
                Serviços elegíveis (deixe vazio para todos)
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
                {services.map((svc) => (
                  <TouchableOpacity
                    key={svc.id}
                    onPress={() => toggleService(svc.id)}
                    style={{
                      backgroundColor: selectedServices.includes(svc.id) ? colors.primary : colors.card,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: radius.full,
                    }}
                  >
                    <Text style={{ color: selectedServices.includes(svc.id) ? colors.white : colors.text, fontSize: fontSize.sm }}>
                      {svc.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <AppButton title={editingPromo ? 'Salvar alterações' : 'Criar promoção'} onPress={handleSave} loading={saving} />
            </AppCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
