import { HeroV2 } from "@/features/landing/components/HeroV2";
import { Navbar } from "@/features/landing/components/Navbar";
import { FeaturesBento } from "@/features/landing/components/sections/FeaturesBento";
import { IntegrationsCarousel } from "@/features/landing/components/sections/IntegrationsCarousel";
import { AgentWorkflow } from "@/features/landing/components/sections/AgentWorkflow";
import { Testimonials } from "@/features/landing/components/sections/Testimonials";
import { PricingCards } from "@/features/landing/components/sections/PricingCards";
import { FAQAccordion } from "@/features/landing/components/sections/FAQAccordion";
import { ContactForm } from "@/features/landing/components/sections/ContactForm";
import { Footer } from "@/features/landing/components/sections/Footer";

export default function Page() {
  return (
    <main className="relative bg-[#050505] min-h-screen overflow-hidden text-white w-full">
      <Navbar />
      
      {/* 100vh Hero Section */}
      <HeroV2 />
      
      {/* Scrollable Sections */}
      <div className="relative z-10 bg-[#050505]">
        <div id="features"><FeaturesBento /></div>
        <div id="workflow"><AgentWorkflow /></div>
        <IntegrationsCarousel />
        <Testimonials />
        <div id="pricing"><PricingCards /></div>
        <FAQAccordion />
        <ContactForm />
        <Footer />
      </div>
    </main>
  );
}
