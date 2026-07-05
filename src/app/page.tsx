import { SiteNav } from "@/components/layout/SiteNav";
import { SiteDock } from "@/components/layout/SiteDock";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { HeroSection } from "@/components/sections/HeroSection";
import { EcosystemSection } from "@/components/sections/EcosystemSection";
import { OpeningSection } from "@/components/sections/OpeningSection";
import { DaysSection } from "@/components/sections/DaysSection";
import { FooterSection } from "@/components/sections/FooterSection";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main className={styles.page}>
        <HeroSection />
        <EcosystemSection />
        <OpeningSection />
        <DaysSection />
        <FooterSection />
      </main>
      <SiteMenu />
      <SiteDock />
    </>
  );
}
