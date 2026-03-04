/* ============================
   BARBERPRO — Sistema de Avaliações
   Tela para cliente avaliar serviço concluído
   ============================ */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { colors, spacing, fontSize, radius } from '../../theme';
import { Header, AppButton, AppCard } from '../../components';
import type { RootStackParamList } from '../../types/navigation';

type RouteParams = RouteProp<RootStackParamList, 'RateAppointment'>;

export default function RateAppointmentScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { shopId, appointmentId, serviceName, staffName } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Avaliação', 'Por favor, selecione quantas estrelas');
      return;
    }

    setSubmitting(true);
    try {
      const fn = httpsCallable(functions, 'rateAppointment');
      await fn({ shopId, appointmentId, rating, comment: comment.trim() || null });
      Alert.alert('✅ Obrigado!', 'Sua avaliação foi enviada com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Não foi possível enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <Header title="Avaliar Atendimento" leftIcon="❌" onLeftPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <AppCard>
          <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '600', textAlign: 'center', marginBottom: spacing.xs }}>
            Como foi seu atendimento?
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', marginBottom: spacing.xxl }}>
            {serviceName} {staffName ? `com ${staffName}` : ''}
          </Text>

          {/* Stars */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.xxl }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={{ marginHorizontal: spacing.sm }}>
                <Text style={{ fontSize: 48 }}>{rating >= star ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text style={{ color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center', marginBottom: spacing.lg }}>
              {rating === 5 && '🤩 Excelente!'}
              {rating === 4 && '😊 Muito bom!'}
              {rating === 3 && '🙂 Bom'}
              {rating === 2 && '😐 Pode melhorar'}
              {rating === 1 && '😞 Não gostei'}
            </Text>
          )}

          {/* Comentário */}
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.sm, fontWeight: '600' }}>
            Comentário (opcional)
          </Text>
          <TextInput
            placeholder="Conte-nos mais sobre sua experiência..."
            placeholderTextColor={colors.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={500}
            style={{
              backgroundColor: colors.bgSecondary,
              borderWidth: 1.5,
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              color: colors.text,
              fontSize: fontSize.md,
              minHeight: 100,
              textAlignVertical: 'top',
              marginBottom: spacing.xxl,
            }}
          />

          <AppButton title="Enviar Avaliação" onPress={handleSubmit} loading={submitting} disabled={rating === 0} />

          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.md, alignItems: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Agora não</Text>
          </TouchableOpacity>
        </AppCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
