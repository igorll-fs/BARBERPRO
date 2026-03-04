import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pt: {
    translation: {
      appName: 'BarberPro',
      login: 'Entrar',
      phone: 'Telefone (WhatsApp)',
      sendCode: 'Enviar código',
      code6: 'Código de 6 dígitos',
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'pt',
  fallbackLng: 'pt',
  interpolation: { escapeValue: false }
});

export default i18n;
