"use client";

import React, { useEffect, useState } from "react";
import { Download, CheckCircle2, Info } from "lucide-react";

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register service worker for PWA installability
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (standalone) {
      setIsInstalled(true);
    }

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowTip(false);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowTip(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }
    setShowTip((prev) => !prev);
  };

  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-200 font-medium">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>App Installed</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-orange-500 hover:from-brand-500 hover:to-orange-400 text-white text-xs font-bold shadow-sm transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>Install PDFpadar App</span>
      </button>

      {showTip && (
        <p className="flex items-start gap-1.5 text-xs text-slate-400 max-w-sm leading-relaxed">
          <Info className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
          <span>
            {isIos
              ? 'In Safari, tap the Share button and choose "Add to Home Screen" to install PDFpadar.'
              : 'Click the Install icon in your browser address bar (or open browser menu → "Install PDFpadar") to install the app.'}
          </span>
        </p>
      )}
    </div>
  );
}
