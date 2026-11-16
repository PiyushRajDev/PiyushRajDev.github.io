import { HeroSection } from "@/components/sections/HeroSection";
import {
  AboutSection,
  ContactSection,
  ProjectsSection,
} from "@/components/sections/PortfolioSections";

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="portfolio-document">
        <AboutSection />
        <ProjectsSection />
        <ContactSection />
      </div>
    </>
  );
}
