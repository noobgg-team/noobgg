import HeroSection from "@/components/landing/hero-section";
import GamesSection from "@/components/landing/games-section";
import FeaturesSection from "@/components/landing/features-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import StatsSection from "@/components/landing/stats-section";
import CTASection from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <GamesSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <CTASection />
    </main>
  );
}
