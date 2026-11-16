import { HeroSection } from "@/components/sections/HeroSection";
import {
  AboutSection,
  ContactSection,
  ProjectsSection,
  SystemsSection,
  ThinkingSection,
} from "@/components/sections/PortfolioSections";

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="portfolio-document">
        <AboutSection />
        <ProjectsSection />
        <SystemsSection />
        <ThinkingSection />
        <ContactSection />
      </div>
    </>
  );
}
