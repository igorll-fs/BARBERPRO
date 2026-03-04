/* ============================
   BARBERPRO — Gerenciar Serviços (Dono)
   CRUD completo: criar, editar, excluir, ativar/desativar
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppCard, AppButton, AppInput, Badge, EmptyState } from '../../components';
import { useUser } from '../../store/user';
import type { ServiceItem } from '../../types/models';

export default function ServicesManagementScreen() {
  const shopId = useUser((s) => s.shopId);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!shopId || !db) { 
      setLoading(false); 
      return; 
    }
    const unsub = onSnapshot(
      collection(db, 'barbershops', shopId, 'services'), 
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setServices(data.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao carregar serviços:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [shopId]);

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setPrice('');
    setDuration('30');
    setDescription('');
    setCategory('');
    setShowModal(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setName(service.name || '');
    setPrice(String((service.priceCents || 0) / 100));
    setDuration(String(service.durationMin || 30));
    setDescription(service.description || '');
    setCategory(service.category || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome do serviço é obrigatório');
      return;
    }
    const priceValue = parseFloat(price.replace(',', '.'));
    if (isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Erro', 'Preço inválido');
      return;
    }
    const durationValue = parseInt(duration);
    if (isNaN(durationValue) || durationValue < 5) {
      Alert.alert('Erro', 'Duração mínima: 5 minutos');
      return;
    }

    setSaving(true);
    try {
      const serviceData = {
        name: name.trim(),
        priceCents: Math.round(priceValue * 100),
        durationMin: durationValue,
        description: description.trim() || null,
        category: category.trim() || null,
        active: true,
      };

      if (editingService) {
        // Update
        await updateDoc(
          doc(db, 'barbershops', shopId!, 'services', editingService.id),
          serviceData
        );
        Alert.alert('✅ Sucesso', 'Serviço atualizado!');
      } else {
        // Create
        await addDoc(
          collection(db, 'barbershops', shopId!, 'services'),
          serviceData
        );
        Alert.alert('✅ Sucesso', 'Serviço criado!');
      }
      setShowModal(false);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (service: ServiceItem) => {
    try {
      await updateDoc(
        doc(db, 'barbershops', shopId!, 'services', service.id),
        { active: !service.active }
      );
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  const handleDelete = async (service: ServiceItem) => {
    Alert.alert(
      'Excluir serviço?',
      `Tem certeza que deseja excluir "${service.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'barbershops', shopId!, 'services', service.id));
              Alert.alert('✅', 'Serviço excluído');
            } catch (e: any) {
              Alert.alert('Erro', e.message);
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (cents: number) => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  return (
    <View style={globalStyles.screen}>
      <Header 
        title="Serviços" 
        subtitle={`${services.length} serviço(s)`} 
        rightIcon="➕" 
        onRightPress={openCreateModal} 
      />

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
        renderItem={({ item }) => (
          <AppCard>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
                  {item.name}
                </Text>
                {item.category && (
                  <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs }}>
                    📂 {item.category}
                  </Text>
                )}
                {item.description && (
                  <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs }}>
                    {item.description}
                  </Text>
                )}
              </View>
              <Badge text={item.active ? 'Ativo' : 'Inativo'} variant={item.active ? 'success' : 'warning'} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg }}>
              <View>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>Preço</Text>
                <Text style={{ color: colors.primary, fontSize: fontSize.lg, fontWeight: '700' }}>
                  {formatCurrency(item.priceCents || 0)}
                </Text>
              </View>
              <View>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.xs }}>Duração</Text>
                <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>
                  {item.durationMin || 30} min
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TouchableOpacity
                onPress={() => openEditModal(item)}
                style={{
                  flex: 1,
                  backgroundColor: colors.primaryBg,
                  borderRadius: radius.md,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: fontSize.sm }}>
                  ✏️ Editar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleToggleActive(item)}
                style={{
                  flex: 1,
                  backgroundColor: item.active ? colors.cardElevated : colors.primaryBg,
                  borderRadius: radius.md,
                  paddingVertical: spacing.sm,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: item.active ? colors.textMuted : colors.primary, fontWeight: '600', fontSize: fontSize.sm }}>
                  {item.active ? '⏸️ Desativar' : '▶️ Ativar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={{
                  backgroundColor: colors.dangerBg,
                  borderRadius: radius.md,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.danger, fontWeight: '600', fontSize: fontSize.sm }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </AppCard>
        )}
        ListEmptyComponent={
          <EmptyState 
            icon="✂️" 
            title="Nenhum serviço" 
            message="Cadastre os serviços que sua barbearia oferece" 
          />
        }
      />

      {/* Modal de criação/edição */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: colors.bg }}
        >
          <Header 
            title={editingService ? 'Editar serviço' : 'Novo serviço'} 
            leftIcon="❌" 
            onLeftPress={() => setShowModal(false)} 
          />
          
          <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
            <AppCard>
              <AppInput
                label="Nome do serviço *"
                value={name}
                onChangeText={setName}
                placeholder="Ex: Corte + Barba"
              />
              
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <AppInput
                    label="Preço (R$) *"
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppInput
                    label="Duração (min) *"
                    value={duration}
                    onChangeText={setDuration}
                    placeholder="30"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <AppInput
                label="Categoria"
                value={category}
                onChangeText={setCategory}
                placeholder="Ex: Cabelo, Barba, Tratamentos"
              />

              <AppInput
                label="Descrição"
                value={description}
                onChangeText={setDescription}
                placeholder="Descreva o serviço (opcional)"
                multiline
                numberOfLines={3}
              />

              {/* Dicas */}
              <View style={{ backgroundColor: colors.infoBg, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.md }}>
                <Text style={{ color: colors.info, fontSize: fontSize.sm }}>
                  💡 <Text style={{ fontWeight: '600' }}>Dicas:</Text>
                </Text>
                <Text style={{ color: colors.info, fontSize: fontSize.xs, marginTop: spacing.xs }}>
                  • Preço e duração são obrigatórios{'\n'}
                  • Use categorias para organizar (Cabelo, Barba, etc){'\n'}
                  • Serviços inativos não aparecem para clientes
                </Text>
              </View>

              <AppButton
                title={editingService ? 'Salvar alterações' : 'Criar serviço'}
                onPress={handleSave}
                loading={saving}
                style={{ marginTop: spacing.xl }}
              />
            </AppCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
