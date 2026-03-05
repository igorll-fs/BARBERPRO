/* ============================
   BARBERPRO — Gestão de Inventário
   Tela para donos gerenciarem produtos
   ============================ */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../store/user';
import { Header, AppButton, AppInput, AppCard, EmptyState, Badge } from '../../components';
import { colors, spacing, fontSize, globalStyles } from '../../theme';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { InventoryItem, InventoryMovement } from '../../types/models';

export default function InventoryManagementScreen() {
  const shopId = useUser((s) => s.shopId);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState('');
  const [minQty, setMinQty] = useState('');
  const [priceCents, setPriceCents] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (!shopId) return;

    const q = query(collection(db, 'barbershops', shopId, 'inventory'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryItem[];
      setItems(data.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shopId]);

  const handleSave = async () => {
    if (!shopId || !name.trim()) {
      Alert.alert('Erro', 'Nome do produto é obrigatório');
      return;
    }

    const itemData = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      qty: parseInt(qty) || 0,
      minQty: parseInt(minQty) || 0,
      priceCents: parseInt(priceCents) || 0,
      category: category.trim() || undefined,
      updatedAt: Timestamp.now(),
    };

    try {
      if (editingItem) {
        await updateDoc(
          doc(db, 'barbershops', shopId, 'inventory', editingItem.id),
          itemData
        );
      } else {
        await addDoc(collection(db, 'barbershops', shopId, 'inventory'), {
          ...itemData,
          createdAt: Timestamp.now(),
        });
      }
      closeModal();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o produto');
    }
  };

  const handleDelete = (item: InventoryItem) => {
    if (!shopId) return;
    
    Alert.alert(
      'Confirmar',
      `Deseja excluir "${item.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'barbershops', shopId, 'inventory', item.id));
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o produto');
            }
          },
        },
      ]
    );
  };

  const openModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setSku(item.sku || '');
      setQty(item.qty.toString());
      setMinQty(item.minQty.toString());
      setPriceCents(item.priceCents?.toString() || '');
      setCategory(item.category || '');
    } else {
      setEditingItem(null);
      setName('');
      setSku('');
      setQty('');
      setMinQty('');
      setPriceCents('');
      setCategory('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.qty <= 0) return { label: 'Sem estoque', color: colors.danger };
    if (item.qty <= item.minQty) return { label: 'Estoque baixo', color: colors.warning };
    return { label: 'Em estoque', color: colors.success };
  };

  const formatPrice = (cents?: number) => {
    if (!cents) return 'R$ 0,00';
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  if (modalVisible) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title={editingItem ? 'Editar Produto' : 'Novo Produto'}
          showBack
          onBack={closeModal}
        />
        <ScrollView style={styles.form}>
          <AppInput
            label="Nome do produto *"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Pomada Modeladora"
          />
          
          <AppInput
            label="SKU (código)"
            value={sku}
            onChangeText={setSku}
            placeholder="Ex: POM-001"
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <AppInput
                label="Quantidade *"
                value={qty}
                onChangeText={setQty}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.half}>
              <AppInput
                label="Mínimo *"
                value={minQty}
                onChangeText={setMinQty}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <AppInput
            label="Preço (R$)"
            value={priceCents}
            onChangeText={setPriceCents}
            placeholder="0,00"
            keyboardType="numeric"
          />

          <AppInput
            label="Categoria"
            value={category}
            onChangeText={setCategory}
            placeholder="Ex: Pomadas, Shampoos"
          />

          <AppButton
            title={editingItem ? 'Salvar Alterações' : 'Criar Produto'}
            onPress={handleSave}
            style={styles.saveButton}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="📦 Inventário"
        rightComponent={
          <TouchableOpacity onPress={() => openModal()}>
            <Text style={styles.addButton}>+ Novo</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loading}>Carregando...</Text>
        ) : items.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Nenhum produto"
            message="Cadastre produtos para controlar seu estoque"
            actionLabel="Cadastrar Produto"
            onAction={() => openModal()}
          />
        ) : (
          <>
            <View style={styles.stats}>
              <StatCard
                title="Total de Produtos"
                value={items.length.toString()}
                icon="📦"
              />
              <StatCard
                title="Estoque Baixo"
                value={items.filter(i => i.qty <= i.minQty && i.qty > 0).length.toString()}
                icon="⚠️"
                color={colors.warning}
              />
              <StatCard
                title="Sem Estoque"
                value={items.filter(i => i.qty <= 0).length.toString()}
                icon="❌"
                color={colors.danger}
              />
            </View>

            <Text style={styles.sectionTitle}>Produtos</Text>
            
            {items.map((item) => {
              const status = getStockStatus(item);
              return (
                <AppCard key={item.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.sku && (
                        <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                      )}
                    </View>
                    <Badge
                      text={status.label}
                      color={status.color}
                    />
                  </View>

                  <View style={styles.itemDetails}>
                    <View style={styles.detail}>
                      <Text style={styles.detailLabel}>Quantidade</Text>
                      <Text style={[
                        styles.detailValue,
                        item.qty <= item.minQty && styles.lowStock
                      ]}>
                        {item.qty} un
                      </Text>
                    </View>
                    
                    <View style={styles.detail}>
                      <Text style={styles.detailLabel}>Mínimo</Text>
                      <Text style={styles.detailValue}>{item.minQty} un</Text>
                    </View>

                    <View style={styles.detail}>
                      <Text style={styles.detailLabel}>Preço</Text>
                      <Text style={styles.detailValue}>
                        {formatPrice(item.priceCents)}
                      </Text>
                    </View>
                  </View>

                  {item.category && (
                    <Text style={styles.category}>📁 {item.category}</Text>
                  )}

                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      onPress={() => openModal(item)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionText}>✏️ Editar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleDelete(item)}
                      style={[styles.actionButton, styles.deleteButton]}
                    >
                      <Text style={[styles.actionText, styles.deleteText]}>
                        🗑️ Excluir
                      </Text>
                    </TouchableOpacity>
                  </View>
                </AppCard>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Componente StatCard local
function StatCard({ title, value, icon, color = colors.primary }: any) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  addButton: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  loading: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  itemSku: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  itemDetails: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  detail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  lowStock: {
    color: colors.danger,
  },
  category: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  actionText: {
    color: colors.primary,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: colors.dangerBg,
    borderRadius: 8,
  },
  deleteText: {
    color: colors.danger,
  },
  form: {
    flex: 1,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  saveButton: {
    marginTop: spacing.xl,
  },
});
