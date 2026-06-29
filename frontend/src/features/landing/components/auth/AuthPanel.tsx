"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { OTPForm } from "./OTPForm";

export type AuthState = "login" | "signup" | "forgot" | "otp";

export function AuthPanel({ initialState = "login" }: { initialState?: AuthState }) {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // A premium glassmorphism container
  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      {/* Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37]/20 to-[#8A6A16]/20 rounded-[32px] blur-xl opacity-50"></div>
      
      {/* Main Glass Card */}
      <div className="relative bg-[rgba(11,11,11,0.6)] backdrop-blur-[40px] border border-[rgba(212,175,55,0.15)] rounded-[28px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
        
        {/* Animated Inner Content */}
        <AnimatePresence mode="wait" initial={false}>
          {authState === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 20, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <LoginForm onSwitch={setAuthState} />
            </motion.div>
          )}

          {authState === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <SignupForm onSwitch={setAuthState} />
            </motion.div>
          )}

          {authState === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <ForgotPasswordForm onSwitch={setAuthState} />
            </motion.div>
          )}

          {authState === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <OTPForm onSwitch={setAuthState} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
