import { GuestGuard } from '@/features/auth/components/Guards';
import { AICoreScene } from '@/features/landing/components/scene/AICoreScene';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Reuse the 3D scene in the background but very subtle */}
          <div className="absolute inset-0 opacity-40">
            <AICoreScene />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505] backdrop-blur-[2px]"></div>
        </div>

        {/* Auth Content */}
        <div className="relative z-10 w-full p-4">
          {children}
        </div>
      </div>
    </GuestGuard>
  );
}
