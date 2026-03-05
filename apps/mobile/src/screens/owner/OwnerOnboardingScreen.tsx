/* ============================
   BARBERPRO — Onboarding Wizard Completo
   5 passos para configuração inicial da barbearia
   ============================ */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppCard, AppInput, AppButton } from '../../components';
import { useUser } from '../../store/user';

type Step = 1 | 2 | 3 | 4 | 5;

export default function OwnerOnboardingScreen() {
  const { shopId } = useUser();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Informações básicas
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Serviços iniciais (templates)
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  const serviceTemplates = [
    { name: 'Corte Masculino', price: 3500, duration: 30 },
    { name: 'Barba', price: 2500, duration: 20 },
    { name: 'Corte + Barba', price: 5500, duration: 45 },
    { name: 'Corte Infantil', price: 3000, duration: 25 },
    { name: 'Design (Sobrancelha)', price: 1500, duration: 15 },
  ];

  // Step 3: Horário padrão
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('19:00');

  // Step 4: Primeiro funcionário (opcional)
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');

  const validateStep = () => {
    if (step === 1) {
      if (!shopName.trim()) {
        Alert.alert('Atenção', 'O nome da barbearia é obrigatório');
        return false;
      }
      if (!address.trim()) {
        Alert.alert('Atenção', 'O endereço é obrigatório para que os clientes possam encontrar sua barbearia');
        return false;
      }
      if (!phone.trim()) {
        Alert.alert('Atenção', 'O telefone da barbearia é obrigatório');
        return false;
      }
    }
    if (step === 2 && selectedServices.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos 1 serviço');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 5) setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleFinish = async () => {
    if (!shopId) return;
    setLoading(true);

    try {
      // 1. Atualizar informações da barbearia
      await updateDoc(doc(db, 'barbershops', shopId), {
        name: shopName,
        address,
        phone,
        schedule: {
          monday: { open: openTime, close: closeTime },
          tuesday: { open: openTime, close: closeTime },
          wednesday: { open: openTime, close: closeTime },
          thursday: { open: openTime, close: closeTime },
          friday: { open: openTime, close: closeTime },
          saturday: { open: openTime, close: closeTime },
          sunday: { open: false },
        },
        onboardingComplete: true,
      });

      // 2. Criar serviços selecionados
      for (const serviceName of selectedServices) {
        const template = serviceTemplates.find((t) => t.name === serviceName);
        if (template) {
          await addDoc(collection(db, 'barbershops', shopId, 'services'), {
            name: template.name,
            price: template.price,
            duration: template.duration,
            active: true,
            description: '',
          });
        }
      }

      // 3. Adicionar funcionário se preenchido
      if (staffName.trim() && staffPhone.trim()) {
        await addDoc(collection(db, 'barbershops', shopId, 'staff'), {
          name: staffName,
          phone: staffPhone,
          role: 'funcionario',
          active: true,
          schedule: {
            monday: { open: openTime, close: closeTime },
            tuesday: { open: openTime, close: closeTime },
            wednesday: { open: openTime, close: closeTime },
            thursday: { open: openTime, close: closeTime },
            friday: { open: openTime, close: closeTime },
            saturday: { open: openTime, close: closeTime },
            sunday: { open: false },
          },
        });
      }

      Alert.alert('Sucesso! 🎉', 'Sua barbearia está configurada e pronta para uso!');
    } catch (e) {
      console.error('Erro ao finalizar onboarding:', e);
      Alert.alert('Erro', 'Não foi possível salvar as configurações.');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  return (
    <View style={globalStyles.screen}>
      <Header
        title={`Configuração ${step}/5`}
        subtitle="Configure sua barbearia"
        rightIcon="×"
        onRightPress={() => Alert.alert('Pular', 'Você pode configurar depois em Perfil.', [{ text: 'OK' }])}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <View
                key={s}
                style={{
                  width: s === step ? 32 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: s <= step ? colors.primary : colors.border,
                }}
              />
            ))}
          </View>
        </View>

        {step === 1 && (
          <AppCard>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.md }}>
              ℹ️ Informações Básicas
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.lg }}>
              Dados essenciais da sua barbearia
            </Text>

            <AppInput label="Nome da Barbearia" value={shopName} onChangeText={setShopName} placeholder="Ex: BarberPro Center" />
            <AppInput label="Endereço" value={address} onChangeText={setAddress} placeholder="Rua, número, bairro" />
            <AppInput label="Telefone/WhatsApp" value={phone} onChangeText={setPhone} placeholder="(11) 99999-9999" />
          </AppCard>
        )}

        {step === 2 && (
          <AppCard>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.md }}>
              ✂️ Serviços Iniciais
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.lg }}>
              Selecione os serviços que sua barbearia oferece (você pode editar depois)
            </Text>

            {serviceTemplates.map((service) => (
              <TouchableOpacity
                key={service.name}
                onPress={() => toggleService(service.name)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: spacing.md,
                  backgroundColor: selectedServices.includes(service.name) ? colors.primaryBg : colors.bg,
                  borderRadius: radius.md,
                  borderWidth: 2,
                  borderColor: selectedServices.includes(service.name) ? colors.primary : colors.border,
                  marginBottom: spacing.sm,
                }}
              >
                <View>
                  <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '600' }}>{service.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>
                    R$ {(service.price / 100).toFixed(2)} • {service.duration}min
                  </Text>
                </View>
                <Text style={{ fontSize: 24 }}>{selectedServices.includes(service.name) ? '✅' : '⭕'}</Text>
              </TouchableOpacity>
            ))}
          </AppCard>
        )}

        {step === 3 && (
          <AppCard>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.md }}>
              ⏰ Horário Padrão
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.lg }}>
              Defina o horário de funcionamento (segunda a sábado, domingo fechado)
            </Text>

            <AppInput label="Abertura" value={openTime} onChangeText={setOpenTime} placeholder="09:00" />
            <AppInput label="Fechamento" value={closeTime} onChangeText={setCloseTime} placeholder="19:00" />
          </AppCard>
        )}

        {step === 4 && (
          <AppCard>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.md }}>
              👤 Primeiro Funcionário (Opcional)
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.lg }}>
              Adicione um barbeiro à sua equipe. Você pode pular e adicionar depois.
            </Text>

            <AppInput label="Nome do Barbeiro" value={staffName} onChangeText={setStaffName} placeholder="Ex: João Silva" />
            <AppInput label="Telefone/WhatsApp" value={staffPhone} onChangeText={setStaffPhone} placeholder="(11) 99999-9999" />
          </AppCard>
        )}

        {step === 5 && (
          <AppCard>
            <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.md }}>
              🎉 Tudo Pronto!
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.lg }}>
              Sua barbearia será configurada com:
            </Text>

            <View style={{ backgroundColor: colors.bg, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md }}>
              <Text style={{ color: colors.text, fontSize: fontSize.sm, marginBottom: 4 }}>
                📍 <Text style={{ fontWeight: '600' }}>{shopName}</Text>
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 4 }}>{address}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 4 }}>
                📞 {phone}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 4 }}>
                ⏰ {openTime} - {closeTime} (seg a sáb)
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: 4 }}>
                ✂️ {selectedServices.length} serviço(s)
              </Text>
              {staffName && (
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                  👤 1 funcionário
                </Text>
              )}
            </View>

            <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center' }}>
              Você poderá alterar todas essas configurações depois em Configurações
            </Text>
          </AppCard>
        )}

        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
          {step > 1 && (
            <AppButton title="Voltar" variant="outline" onPress={handleBack} size="lg" style={{ flex: 1 }} />
          )}
          <AppButton
            title={step === 5 ? 'Finalizar 🎉' : 'Próximo'}
            variant="primary"
            onPress={step === 5 ? handleFinish : handleNext}
            loading={loading}
            size="lg"
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
