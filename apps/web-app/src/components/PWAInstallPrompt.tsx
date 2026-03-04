import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    if (!deferredPrompt || dismissed) return null;

    const handleInstall = async () => {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
    };

    return (
        <div className="pwa-install-banner">
            <div style={{ fontSize: 32 }}>📱</div>
            <div style={{ flex: 1 }}>
                <div className="heading" style={{ fontSize: 'var(--fs-md)' }}>Instalar BarberPro</div>
                <div className="caption">Acesse rápido direto da tela inicial</div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={handleInstall}>Instalar</button>
            <button className="pwa-install-banner-close" onClick={() => setDismissed(true)}>✕</button>
        </div>
    );
}
