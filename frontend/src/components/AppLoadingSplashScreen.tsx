import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export const AppLoadingSplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F1115] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 text-center space-y-6 max-w-sm">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center shadow-2xl shadow-indigo-950/50"
        >
          <ShieldCheck className="w-8 h-8" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-1.5"
        >
          <h2 className="text-xl font-bold tracking-tight text-white">KeyPer</h2>
          <p className="text-xs text-slate-400">Restoring zero-knowledge secure session...</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-2 text-indigo-400 text-xs font-medium"
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Authenticating Token</span>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 text-[11px] text-slate-600 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>End-to-End Encrypted • Zero-Knowledge Architecture</span>
      </div>
    </div>
  );
};
