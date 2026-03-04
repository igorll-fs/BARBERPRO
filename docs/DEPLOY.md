# Deploy BarberPro

## Firebase
1. `firebase login`
2. `firebase init` (functions, firestore, hosting, storage). Aponte para as pastas já existentes.
3. Configure variáveis das Functions (prod):
   - `firebase functions:config:set twilio.account_sid=... twilio.auth_token=... twilio.whatsapp_from=... stripe.secret_key=... stripe.webhook_secret=...`
4. `firebase deploy`

## Mobile (Expo EAS)
1. Instale `eas-cli`: `npm i -g eas-cli`
2. `eas login`
3. Configure `eas.json` (builds android/ios)
4. `eas build -p android` e `eas build -p ios`
5. Siga as lojas:
   - Google Play Console: criar app, políticas, privacidade (LGPD), upload AAB
   - App Store Connect: criar app, privacidade, TestFlight, envio IPA

## Web Pública
- `cd apps/public-web && npm run build`
- Deploy via Firebase Hosting: já coberto por `firebase deploy`
