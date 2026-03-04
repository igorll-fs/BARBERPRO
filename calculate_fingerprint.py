#!/usr/bin/env python3
import hashlib
import json
import subprocess
from pathlib import Path

def main():
    # Caminho do certificado gerado pelo Expo
    cert_path = Path.home() / '.expo' / 'codesigning' / 'development-certificate.json'
    
    print("\n" + "=" * 70)
    print("🔐 IMPRESSÃO DIGITAL DO CERTIFICADO BARBERPRO")
    print("=" * 70)
    
    if cert_path.exists():
        with open(cert_path, 'r') as f:
            cert_data = json.load(f)
        
        print(f"\n✅ Certificado EXPO encontrado")
        print(f"   📋 Key ID: {cert_data.get('keyId')}")
        print(f"   📅 Criado:   {cert_data.get('createdAt')}")
        print(f"   📅 Expira:   {cert_data.get('expiresAt')}")
        
        # Extrair chave pública e calcular SHA-1
        public_key = cert_data.get('publicKey', '')
        if public_key:
            import base64
            
            # Remover header/footer e quebras de linha
            key_content = public_key.replace('-----BEGIN PUBLIC KEY-----\n', '')
            key_content = key_content.replace('\n-----END PUBLIC KEY-----\n', '')
            key_content = key_content.replace('\n', '')
            
            try:
                # Decodificar de base64
                key_der = base64.b64decode(key_content)
                
                # Calcular hashes
                sha1_hash = hashlib.sha1(key_der).hexdigest().upper()
                sha256_hash = hashlib.sha256(key_der).hexdigest().upper()
                
                print(f"\n📊 Hashes da Chave Pública Expo:")
                print(f"   SHA-1:   {sha1_hash}")
                print(f"   SHA-256: {sha256_hash}")
                
                # Formatar SHA-1 com dois pontos
                sha1_formatted = ':'.join([sha1_hash[i:i+2] for i in range(0, len(sha1_hash), 2)])
                print(f"\n   🔗 SHA-1 (formatado): {sha1_formatted}")
                
            except Exception as e:
                print(f"❌ Erro ao processar chave: {e}")
    else:
        print(f"⚠️  Certificado não encontrado em: {cert_path}")
    
    # Verificar keystore Android debug
    android_keystore = Path.home() / '.android' / 'debug.keystore'
    if android_keystore.exists():
        print(f"\n" + "=" * 70)
        print(f"🔐 KEYSTORE ANDROID DEBUG")
        print("=" * 70)
        print(f"✅ Encontrado em: {android_keystore}")
        
        try:
            result = subprocess.run(
                ['keytool', '-list', '-v', '-keystore', str(android_keystore), 
                 '-alias', 'androiddebugkey', '-storepass', 'android'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                print(f"\n📊 Certificado SHA-1 (Android Debug):")
                for line in result.stdout.split('\n'):
                    if 'SHA1' in line or 'SHA-1' in line:
                        clean_line = line.strip()
                        if clean_line:
                            # Extrair apenas o valor do hash
                            if ':' in clean_line:
                                print(f"   {clean_line}")
            else:
                print(f"⚠️  Erro ao ler keystore: {result.stderr[:200]}")
                
        except Exception as e:
            print(f"⚠️  Não foi possível ler keystore Android: {e}")
    else:
        print(f"\n⚠️  Keystore Android não encontrado em: {android_keystore}")
        print(f"   Para criar um keystore de debug, use:")
        print(f"   keytool -genkey -v -keystore {android_keystore} -alias androiddebugkey")
        print(f"           -keyalg RSA -keysize 2048 -validity 10000")
    
    print("\n" + "=" * 70 + "\n")

if __name__ == '__main__':
    main()
