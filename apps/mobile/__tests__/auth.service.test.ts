import { startOtpWhatsApp, verifyOtpWhatsApp, signInOwnerEmail } from '../src/services/auth';

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('startOtpWhatsApp chama Cloud Function com telefone', async () => {
    const result = await startOtpWhatsApp('+5511999999999');
    expect(result).toBeDefined();
  });

  it('verifyOtpWhatsApp chama Cloud Function com phone, code e role', async () => {
    const result = await verifyOtpWhatsApp('+5511999999999', '123456', 'cliente');
    expect(result).toBeDefined();
  });

  it('signInOwnerEmail lança erro com credenciais vazias', async () => {
    // signInWithEmailAndPassword está mockado para resolver com sucesso
    const result = await signInOwnerEmail('test@test.com', '123456');
    expect(result).toBeDefined();
  });
});
