/* ============================
   BARBERPRO — Gerenciar Horários (Dono)
   Configurar horários da barbearia e dos barbeiros
   ============================ */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppCard, AppButton, Badge, EmptyState } from '../../components';
import { useUser } from '../../store/user';
import type { WeeklySchedule, StaffMember } from '../../types/models';

type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

const DAYS: { key: DayOfWeek; label: string; labelShort: string }[] = [
  { key: 'mon', label: 'Segunda-feira', labelShort: 'Seg' },
  { key: 'tue', label: 'Terça-feira', labelShort: 'Ter' },
  { key: 'wed', label: 'Quarta-feira', labelShort: 'Qua' },
  { key: 'thu', label: 'Quinta-feira', labelShort: 'Qui' },
  { key: 'fri', label: 'Sexta-feira', labelShort: 'Sex' },
  { key: 'sat', label: 'Sábado', labelShort: 'Sáb' },
  { key: 'sun', label: 'Domingo', labelShort: 'Dom' },
];

const TIME_SLOTS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const min = i % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${min}`;
}); // 06:00 até 19:30

export default function ScheduleManagementScreen() {
  const shopId = useUser((s) => s.shopId);
  const [shopSchedule, setShopSchedule] = useState<WeeklySchedule>({});
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<WeeklySchedule>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [shopId]);

  const loadData = async () => {
    if (!shopId || !db) {
      setLoading(false);
      return;
    }
    try {
      // Carregar horário da barbearia
      const shopDoc = await getDoc(doc(db, 'barbershops', shopId));
      const shopData = shopDoc.data() as any;
      setShopSchedule(shopData?.schedule || getDefaultSchedule());

      // Carregar staff
      const staffSnap = await getDocs(collection(db, 'barbershops', shopId, 'staff'));
      setStaff(staffSnap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })));
    } catch (e) {
      console.error('Erro ao carregar horários:', e);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSchedule = (): WeeklySchedule => ({
    mon: { start: '09:00', end: '18:00', off: false },
    tue: { start: '09:00', end: '18:00', off: false },
    wed: { start: '09:00', end: '18:00', off: false },
    thu: { start: '09:00', end: '18:00', off: false },
    fri: { start: '09:00', end: '18:00', off: false },
    sat: { start: '09:00', end: '14:00', off: false },
    sun: { start: '09:00', end: '14:00', off: true },
  });

  const openShopScheduleEdit = () => {
    setSelectedStaff(null);
    setEditingSchedule({ ...shopSchedule });
    setShowEditModal(true);
  };

  const openStaffScheduleEdit = (member: StaffMember) => {
    setSelectedStaff(member);
    setEditingSchedule(member.schedule || { ...shopSchedule });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selectedStaff) {
        // Salvar horário do barbeiro
        await updateDoc(
          doc(db, 'barbershops', shopId!, 'staff', selectedStaff.uid),
          { schedule: editingSchedule }
        );
        Alert.alert('✅ Sucesso', 'Horário do barbeiro atualizado!');
      } else {
        // Salvar horário da barbearia
        await updateDoc(doc(db, 'barbershops', shopId!), { schedule: editingSchedule });
        Alert.alert('✅ Sucesso', 'Horário da barbearia atualizado!');
      }
      await loadData();
      setShowEditModal(false);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleDayOff = (day: DayOfWeek) => {
    setEditingSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], off: !prev[day]?.off },
    }));
  };

  const updateTime = (day: DayOfWeek, field: 'start' | 'end', value: string) => {
    setEditingSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const copyToBusiness = () => {
    Alert.alert(
      'Copiar horários',
      'Aplicar horário da barbearia para dias úteis (Seg-Sex)?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aplicar',
          onPress: () => {
            const businessDays: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
            const updated = { ...editingSchedule };
            businessDays.forEach((day) => {
              updated[day] = { start: '09:00', end: '18:00', off: false };
            });
            setEditingSchedule(updated);
          },
        },
      ]
    );
  };

  const renderScheduleCard = (schedule: WeeklySchedule, title: string, onEdit: () => void) => (
    <AppCard>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>{title}</Text>
        <TouchableOpacity onPress={onEdit}>
          <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' }}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>
      {DAYS.map((day) => {
        const daySchedule = schedule[day.key];
        return (
          <View
            key={day.key}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            }}
          >
            <Text style={{ color: colors.text, fontSize: fontSize.md, width: 80 }}>{day.labelShort}</Text>
            {daySchedule?.off ? (
              <Badge text="Fechado" variant="danger" />
            ) : (
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                {daySchedule?.start || '09:00'} - {daySchedule?.end || '18:00'}
              </Text>
            )}
          </View>
        );
      })}
    </AppCard>
  );

  return (
    <View style={globalStyles.screen}>
      <Header title="Horários" subtitle="Gerencie quando você funciona" />

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        {/* Horário da Barbearia */}
        <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginBottom: spacing.md }}>
          🏪 Horário da Barbearia
        </Text>
        {renderScheduleCard(shopSchedule, 'Padrão da casa', openShopScheduleEdit)}

        {/* Horários dos Barbeiros */}
        <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', marginTop: spacing.xxl, marginBottom: spacing.md }}>
          💈 Horários dos Barbeiros
        </Text>
        {staff.length === 0 ? (
          <EmptyState icon="👥" title="Nenhum barbeiro" message="Adicione barbeiros na aba Equipe" />
        ) : (
          staff.map((member) => {
            const schedule = member.schedule || shopSchedule;
            return (
              <View key={member.uid} style={{ marginBottom: spacing.lg }}>
                {renderScheduleCard(schedule, member.name || 'Barbeiro', () => openStaffScheduleEdit(member))}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal de Edição */}
      <Modal visible={showEditModal} animationType="slide" transparent={false} onRequestClose={() => setShowEditModal(false)}>
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <Header
            title={selectedStaff ? `Horário de ${selectedStaff.name}` : 'Horário da Barbearia'}
            leftIcon="❌"
            onLeftPress={() => setShowEditModal(false)}
          />

          <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
            <AppCard>
              {DAYS.map((day) => {
                const daySchedule = editingSchedule[day.key] || { start: '09:00', end: '18:00', off: false };
                return (
                  <View key={day.key} style={{ marginBottom: spacing.lg }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                      <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '600' }}>{day.label}</Text>
                      <TouchableOpacity onPress={() => toggleDayOff(day.key)}>
                        <Badge text={daySchedule.off ? 'Fechado' : 'Aberto'} variant={daySchedule.off ? 'danger' : 'success'} />
                      </TouchableOpacity>
                    </View>

                    {!daySchedule.off && (
                      <View style={{ flexDirection: 'row', gap: spacing.md }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginBottom: spacing.xs }}>Abertura</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {TIME_SLOTS.slice(0, 20).map((time) => (
                              <TouchableOpacity
                                key={time}
                                onPress={() => updateTime(day.key, 'start', time)}
                                style={{
                                  backgroundColor: daySchedule.start === time ? colors.primary : colors.card,
                                  paddingHorizontal: spacing.md,
                                  paddingVertical: spacing.sm,
                                  borderRadius: radius.sm,
                                  marginRight: spacing.xs,
                                }}
                              >
                                <Text style={{ color: daySchedule.start === time ? colors.white : colors.text, fontSize: fontSize.xs }}>
                                  {time}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginBottom: spacing.xs }}>Fechamento</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {TIME_SLOTS.slice(8).map((time) => (
                              <TouchableOpacity
                                key={time}
                                onPress={() => updateTime(day.key, 'end', time)}
                                style={{
                                  backgroundColor: daySchedule.end === time ? colors.primary : colors.card,
                                  paddingHorizontal: spacing.md,
                                  paddingVertical: spacing.sm,
                                  borderRadius: radius.sm,
                                  marginRight: spacing.xs,
                                }}
                              >
                                <Text style={{ color: daySchedule.end === time ? colors.white : colors.text, fontSize: fontSize.xs }}>
                                  {time}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Ações rápidas */}
              <TouchableOpacity
                onPress={copyToBusiness}
                style={{
                  backgroundColor: colors.bgSecondary,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  marginTop: spacing.md,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.secondary || colors.info, fontWeight: '600', fontSize: fontSize.sm }}>
                  📋 Aplicar 9h-18h para dias úteis
                </Text>
              </TouchableOpacity>

              <AppButton title="Salvar horários" onPress={handleSave} loading={saving} style={{ marginTop: spacing.xl }} />
            </AppCard>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
