"use client";

import React, { useRef, useState, useEffect } from "react";
import { AuthState } from "./AuthPanel";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OTPForm({ onSwitch }: { onSwitch: (state: AuthState) => void }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1]; // Take only last char
    }
    
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newOtp.every((digit) => digit !== "")) {
      // Simulate validation success
      setTimeout(() => setIsSuccess(true), 500);
      
      // Auto redirect to login after success
      setTimeout(() => {
        onSwitch("login");
      }, 2500);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col w-full">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col w-full"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-sm text-[#B7B7B7]">We sent a 6-digit verification code.</p>
            </div>

            <div className="flex justify-center gap-2 mb-8">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-bold bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
              ))}
            </div>

            <div className="text-center mt-4">
              <button
                onClick={() => onSwitch("login")}
                className="inline-flex items-center text-sm text-[#B7B7B7] hover:text-[#F7D774] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="w-20 h-20 text-[#D4AF37] mb-6" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Verified</h2>
            <p className="text-[#B7B7B7]">Redirecting you to login...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
