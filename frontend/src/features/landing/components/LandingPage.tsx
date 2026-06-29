import dynamic from "next/dynamic";
import { Navbar } from "./Navbar/Navbar";
import { HeroSection } from "./Hero/HeroSection";

// Dynamically imported components
const TrustedBy = dynamic(() => import("./TrustedCompanies/TrustedBy").then(mod => mod.TrustedBy));
const EnterpriseStatistics = dynamic(() => import("./HeroStats/EnterpriseStatistics").then(mod => mod.EnterpriseStatistics));
const AgentShowcase = dynamic(() => import("./AgentShowcase/AgentShowcase").then(mod => mod.AgentShowcase));
const FeaturesSection = dynamic(() => import("./Features/FeaturesSection").then(mod => mod.FeaturesSection));
const ArchitectureSection = dynamic(() => import("./Architecture/ArchitectureSection").then(mod => mod.ArchitectureSection));
const WorkflowTimeline = dynamic(() => import("./Workflow/WorkflowTimeline").then(mod => mod.WorkflowTimeline));
const UseCasesSection = dynamic(() => import("./UseCases/UseCasesSection").then(mod => mod.UseCasesSection));
const MarketplacePreview = dynamic(() => import("./Marketplace/MarketplacePreview").then(mod => mod.MarketplacePreview));
const SecurityCompliance = dynamic(() => import("./Security/SecurityCompliance").then(mod => mod.SecurityCompliance));
const EnterpriseIntegrations = dynamic(() => import("./Integrations/EnterpriseIntegrations").then(mod => mod.EnterpriseIntegrations));
const PricingSection = dynamic(() => import("./Pricing/PricingSection").then(mod => mod.PricingSection));
const FAQSection = dynamic(() => import("./FAQ/FAQSection").then(mod => mod.FAQSection));
const CTASection = dynamic(() => import("./CTA/CTASection").then(mod => mod.CTASection));
const Footer = dynamic(() => import("./Footer/Footer").then(mod => mod.Footer));

export function LandingPage() {
  return (
    <main className="relative bg-background overflow-hidden selection:bg-primary/30 selection:text-primary-foreground">
      <Navbar />
      <HeroSection />
      
      {/* Below the fold - Lazy Loaded */}
      <TrustedBy />
      <EnterpriseStatistics />
      <AgentShowcase />
      <FeaturesSection />
      <ArchitectureSection />
      <WorkflowTimeline />
      <UseCasesSection />
      <MarketplacePreview />
      <SecurityCompliance />
      <EnterpriseIntegrations />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
