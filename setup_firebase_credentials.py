#!/usr/bin/env python3
"""
Firebase Credentials Setup Helper
Facilita o preenchimento seguro das credenciais no .env
"""

import json
import os
import sys
from pathlib import Path

def setup_firebase_credentials():
    """Setup interativo de credenciais Firebase"""
    
    print("\n" + "="*70)
    print("🔑 CONFIGURADOR DE CREDENCIAIS FIREBASE - BARBERPRO")
    print("="*70)
    
    print("""
┌─ INSTRUÇÕES ─────────────────────────────────────────────┐
│ 1. Acessa: https://console.firebase.google.com/          │
│ 2. Seleciona projeto: baberpro-31c40                    │
│ 3. Vai em ⚙️ Project Settings > General                │
│ 4. Procura "SDK & Configuration" (muda para "Config")   │
│ 5. Copia o firebaseConfig                              │
│ 6. Cola aqui os valores                                │
└──────────────────────────────────────────────────────────┘
    """)
    
    # Credenciais a preencher
    credentials = {
        'FIREBASE_API_KEY': {
            'prompt': 'Firebase API Key (começa com AIzaSy)',
            'example': 'AIzaSyCL8KqZqxZl6hP7pZj8K3QZq4K6V8P7mN9'
        },
        'FIREBASE_AUTH_DOMAIN': {
            'prompt': 'Firebase Auth Domain',
            'example': 'baberpro-31c40.firebaseapp.com',
            'default': 'baberpro-31c40.firebaseapp.com'
        },
        'FIREBASE_STORAGE_BUCKET': {
            'prompt': 'Storage Bucket',
            'example': 'baberpro-31c40.appspot.com',
            'default': 'baberpro-31c40.appspot.com'
        },
        'FIREBASE_MESSAGING_SENDER_ID': {
            'prompt': 'Messaging Sender ID',
            'example': '559665774528',
            'default': '559665774528'
        },
        'FIREBASE_APP_ID': {
            'prompt': 'Firebase App ID (começa com 1:)',
            'example': '1:559665774528:web:8f7a1b5c9d2e4f6a'
        },
        'FIREBASE_MEASUREMENT_ID': {
            'prompt': 'Measurement ID (G-...)',
            'example': 'G-4NHKDWP8XM'
        },
    }
    
    filled = {}
    
    for key, info in credentials.items():
        while True:
            default = info.get('default', '')
            if default:
                prompt = f"\n{key}\n  (padrão: {default})\n  valor: "
            else:
                prompt = f"\n{key}\n  ex: {info['example']}\n  valor: "
            
            value = input(prompt).strip()
            
            if not value and default:
                value = default
            
            if value:
                filled[key] = value
                print(f"  ✅ Salvo")
                break
            else:
                print(f"  ❌ Campo obrigatório. Tenta novamente.")
    
    return filled

def update_env_file(credentials, env_file):
    """Atualiza arquivo .env com credenciais"""
    
    if not os.path.exists(env_file):
        print(f"\n⚠️  Arquivo não encontrado: {env_file}")
        return False
    
    # Ler arquivo existente
    lines = []
    with open(env_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Atualizar valores
    for i, line in enumerate(lines):
        for key, value in credentials.items():
            if line.startswith(key + '='):
                lines[i] = f"{key}={value}\n"
    
    # Escrever arquivo
    with open(env_file, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    return True

def main():
    """Main setup flow"""
    
    # Obter credenciais
    creds = setup_firebase_credentials()
    
    print("\n" + "="*70)
    print("📝 RESUMO DAS CREDENCIAIS")
    print("="*70)
    for key, value in creds.items():
        display = value[:20] + "..." if len(value) > 20 else value
        print(f"  {key}: {display}")
    
    confirm = input("\n✅ Tá correto? (s/n): ").strip().lower()
    if confirm != 's':
        print("❌ Cancelado. Tenta de novo.")
        return
    
    # Atualizar mobile
    mobile_env = Path('apps/mobile/.env')
    if mobile_env.exists():
        update_env_file(creds, mobile_env)
        print(f"✅ Atualizado: {mobile_env}")
    
    # Atualizar web (com prefixo VITE_)
    web_env = Path('apps/public-web/.env')
    if web_env.exists():
        web_creds = {f"VITE_{k}": v for k, v in creds.items()}
        update_env_file(web_creds, web_env)
        print(f"✅ Atualizado: {web_env}")
    
    print("\n" + "="*70)
    print("🎉 CREDENCIAIS CONFIGURADAS COM SUCESSO!")
    print("="*70)
    print("""
Próximos passos:
  1. Reinicia o servidor: npm start
  2. App vai conectar ao Firebase real
  3. Testa autenticação e notificações push
  4. Nunca commita .env no Git! ✅ Already protected
    """)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n⚠️  Cancelado pelo usuário.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        sys.exit(1)
