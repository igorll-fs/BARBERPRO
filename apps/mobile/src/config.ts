import Constants from 'expo-constants';

export const ENV = {
  FIREBASE_API_KEY: Constants.expoConfig?.extra?.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: Constants.expoConfig?.extra?.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID: Constants.expoConfig?.extra?.FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID,
  STRIPE_PUBLISHABLE_KEY: Constants.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
  GOOGLE_MAPS_API_KEY: Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY,
};
