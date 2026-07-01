import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmailInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-zinc-300">Business Email</label>
    <div className="relative">
      <input 
        ref={ref}
        type="email" 
        className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
        placeholder="you@company.com"
        {...props} 
      />
    </div>
  </div>
));
EmailInput.displayName = 'EmailInput';

export const PasswordInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string }>(({ label = "Password", className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const handleKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && typeof e.getModifierState === 'function') {
      setCapsLock(e.getModifierState('CapsLock'));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      <div className="relative">
        <input 
          ref={ref}
          type={showPassword ? "text" : "password"} 
          className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all pr-12"
          placeholder="••••••••"
          onKeyDown={handleKeyEvent}
          onKeyUp={handleKeyEvent}
          {...props} 
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {capsLock && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              title="Caps Lock is ON"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </motion.div>
          )}
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string }>(({ label, className, ...props }, ref) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-zinc-300">{label}</label>
    <input 
      ref={ref}
      type="text" 
      className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 transition-all"
      {...props} 
    />
  </div>
));
TextInput.displayName = 'TextInput';

export const CheckboxInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string | React.ReactNode }>(({ label, className, ...props }, ref) => (
  <div className="flex items-center space-x-3">
    <div className="relative flex items-center justify-center">
      <input 
        ref={ref}
        type="checkbox" 
        className="peer appearance-none w-5 h-5 border border-[rgba(255,255,255,0.2)] rounded bg-[#050505] checked:bg-[#D4AF37] checked:border-[#D4AF37] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:ring-offset-1 focus:ring-offset-[#0B0B0B]"
        {...props} 
      />
      <svg className="absolute w-3 h-3 text-[#050505] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <label className="text-sm font-medium text-zinc-300 cursor-pointer select-none">{label}</label>
  </div>
));
CheckboxInput.displayName = 'CheckboxInput';
