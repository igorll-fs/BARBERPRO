/**
 * Testes de segurança para validar que dados sensíveis
 * não estão expostos no código.
 */
import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.join(__dirname, '..', 'src');

function readAllFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readAllFiles(full));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

describe('Segurança - Verificação de Credenciais', () => {
  const sourceFiles = readAllFiles(SRC_DIR);
  const allCode = sourceFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

  it('não contém Firebase API keys hardcoded', () => {
    expect(allCode).not.toMatch(/AIza[0-9A-Za-z-_]{35}/);
  });

  it('não contém Stripe secret keys', () => {
    expect(allCode).not.toMatch(/sk_live_[0-9a-zA-Z]{24,}/);
    expect(allCode).not.toMatch(/sk_test_[0-9a-zA-Z]{24,}/);
  });

  it('não contém senhas hardcoded', () => {
    // Verifica padrões como password = "..." ou senha = "..."
    expect(allCode).not.toMatch(/(?:password|senha)\s*[:=]\s*["'][^"']{6,}["']/i);
  });

  it('não contém tokens JWT hardcoded', () => {
    expect(allCode).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/);
  });

  it('usa variáveis de ambiente para Firebase config', () => {
    const firebaseFile = sourceFiles.find(f => f.includes('firebase.ts'));
    expect(firebaseFile).toBeDefined();
    const content = fs.readFileSync(firebaseFile!, 'utf8');
    expect(content).toMatch(/ENV\.|process\.env\./);
  });

  it('não expõe URLs internas/admin', () => {
    // Não deve ter URLs de endpoints admin expostas
    expect(allCode).not.toMatch(/https?:\/\/.*admin.*\.firebaseio\.com/);
  });
});
