export const HeroSkeleton = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 transition-opacity duration-1000">
      <div className="w-64 h-64 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
      <div className="absolute w-48 h-48 border border-[#4F8CFF]/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
      <div className="absolute w-32 h-32 bg-[#4F8CFF]/5 rounded-full blur-3xl animate-pulse" />
    </div>
  );
};
