"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Dock,
  Heading,
  Icon,
  LocationPill,
  ProgressDots,
  Tab,
  Text,
} from "@/design-system/components";
import { colors, layout, radii, typography } from "@/design-system/tokens";
import { icons } from "@/design-system/assets";
import { figmaNodes } from "@/design-system/figma/nodes";
import styles from "./showcase.module.css";

const colorSwatches = [
  { name: "bg.cream", value: colors.bg.cream },
  { name: "bg.white", value: colors.bg.white },
  { name: "bg.menu", value: colors.bg.menu },
  { name: "bg.ecosystem", value: colors.bg.ecosystem },
  { name: "text.primary", value: colors.text.primary },
  { name: "text.muted", value: colors.text.muted },
  { name: "ui.dock", value: colors.ui.dock },
  { name: "ui.pill", value: colors.ui.pill },
  { name: "ui.cardBorder", value: colors.ui.cardBorder },
  { name: "ui.progressTrack", value: colors.ui.progressTrack },
  { name: "ui.progressFill", value: colors.ui.progressFill },
];

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [activePill, setActivePill] = useState(0);
  const [activeDot, setActiveDot] = useState(1);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Heading variant="section" as="h1">
          Utopia UI Kit
        </Heading>
        <Text variant="sm" muted>
          Design tokens & components from Figma · {figmaNodes.mobilePage}
        </Text>
      </header>

      {/* Colors */}
      <section className={styles.section}>
        <Heading variant="card" as="h2">
          Colors
        </Heading>
        <div className={styles.swatches}>
          {colorSwatches.map((swatch) => (
            <div key={swatch.name} className={styles.swatch}>
              <div
                className={styles.swatchColor}
                style={{ background: swatch.value }}
              />
              <Text variant="caption">{swatch.name}</Text>
              <Text variant="caption" muted>
                {swatch.value}
              </Text>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className={styles.section}>
        <Heading variant="card" as="h2">
          Typography
        </Heading>
        <div className={styles.stack}>
          <div>
            <Text variant="caption" muted>
              displayHero · {typography.fontSize.xl}
            </Text>
            <Heading variant="hero" as="p">
              Where luxury meets nature
            </Heading>
          </div>
          <div>
            <Text variant="caption" muted>
              displaySection · {typography.fontSize["2xl"]}
            </Text>
            <Heading variant="section" as="p">
              The Ecosystem
            </Heading>
          </div>
          <div>
            <Text variant="caption" muted>
              bodyBase · {typography.fontSize.base}
            </Text>
            <Text variant="base">
              A private world of curated experiences, designed for those who
              seek the extraordinary.
            </Text>
          </div>
          <div>
            <Text variant="caption" muted>
              bodyMd · {typography.fontSize.md}
            </Text>
            <Text variant="md">Explore destinations</Text>
          </div>
          <div>
            <Text variant="caption" muted>
              caption · {typography.fontSize.xs}
            </Text>
            <Text variant="caption" muted>
              Coming soon · 2026
            </Text>
          </div>
        </div>
      </section>

      {/* Layout tokens */}
      <section className={styles.section}>
        <Heading variant="card" as="h2">
          Layout & Radius
        </Heading>
        <div className={styles.tokenGrid}>
          <Token label="Mobile width" value={`${layout.mobileWidth}px`} />
          <Token label="Desktop width" value={`${layout.desktopWidth}px`} />
          <Token label="Section padding" value={`${layout.sectionPaddingY}px`} />
          <Token label="Dock height" value={`${layout.dockHeight}px`} />
          <Token label="Radius sm" value={radii.sm} />
          <Token label="Radius md" value={radii.md} />
          <Token label="Radius pill" value={radii.pill} />
        </div>
      </section>

      {/* Icons */}
      <section className={styles.section}>
        <Heading variant="card" as="h2">
          Icons
        </Heading>
        <div className={styles.iconGrid}>
          {(Object.keys(icons) as (keyof typeof icons)[]).map((name) => (
            <div key={name} className={styles.iconCell}>
              <Icon name={name} size={32} alt={name} />
              <Text variant="caption">{name}</Text>
            </div>
          ))}
        </div>
      </section>

      {/* Components */}
      <section className={styles.section}>
        <Heading variant="card" as="h2">
          Components
        </Heading>

        <div className={styles.componentBlock}>
          <Text variant="caption" muted>
            Button
          </Text>
          <div className={styles.row}>
            <Button variant="primary">Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </div>

        <div className={styles.componentBlock}>
          <Text variant="caption" muted>
            LocationPill
          </Text>
          <div className={styles.row}>
            {["Maldives", "Bali", "Santorini"].map((loc, i) => (
              <LocationPill
                key={loc}
                label={loc}
                active={activePill === i}
                onClick={() => setActivePill(i)}
              />
            ))}
          </div>
        </div>

        <div className={styles.componentBlock}>
          <Text variant="caption" muted>
            Tab (on dark)
          </Text>
          <div className={styles.darkSurface}>
            {["Overview", "Amenities", "Gallery"].map((label, i) => (
              <Tab
                key={label}
                label={label}
                active={activeTab === i}
                onClick={() => setActiveTab(i)}
              />
            ))}
          </div>
        </div>

        <div className={styles.componentBlock}>
          <Text variant="caption" muted>
            ProgressDots
          </Text>
          <ProgressDots total={5} current={activeDot} />
          <div className={styles.row}>
            <Button size="sm" variant="outline" onClick={() => setActiveDot((d) => Math.max(0, d - 1))}>
              Prev
            </Button>
            <Button size="sm" variant="outline" onClick={() => setActiveDot((d) => Math.min(4, d + 1))}>
              Next
            </Button>
          </div>
        </div>

        <div className={styles.componentBlock}>
          <Text variant="caption" muted>
            Card
          </Text>
          <div className={styles.row}>
            <Card variant="default" className={styles.cardDemo}>
              <Text variant="sm">Default card</Text>
            </Card>
            <Card variant="hero" />
            <Card variant="opening" className={styles.cardDemo}>
              <Text variant="sm">Opening card</Text>
            </Card>
          </div>
        </div>

        <div className={styles.componentBlock}>
          <Text variant="caption" muted>
            Dock
          </Text>
          <Dock
            items={[
              { id: "home", label: "Home", icon: "homeMark", active: true },
              { id: "dest", label: "Destinations", icon: "chevronDark" },
              { id: "menu", label: "Menu" },
            ]}
          />
        </div>
      </section>

      {/* Figma mapping */}
      <section className={styles.section}>
        <Heading variant="card" as="h2">
          Figma → Component Map
        </Heading>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Section</th>
              <th>Mobile</th>
              <th>Desktop</th>
              <th>React Component</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(figmaNodes.sections).map(([name, ids]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>
                  <code>{ids.mobile}</code>
                </td>
                <td>
                  <code>{ids.desktop}</code>
                </td>
                <td>
                  <code>{sectionComponentMap[name] ?? "TBD"}</code>
                </td>
              </tr>
            ))}
            {Object.entries(figmaNodes.chrome).map(([name, id]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>
                  <code>{id}</code>
                </td>
                <td>
                  <code>{chromeComponentMap[name] ?? "TBD"}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Token({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.token}>
      <Text variant="caption" muted>
        {label}
      </Text>
      <Text variant="sm">{value}</Text>
    </div>
  );
}

const sectionComponentMap: Record<string, string> = {
  hero: "HeroSection",
  heroState: "HeroSection (state)",
  ecosystem: "EcosystemSection",
  opening: "OpeningSection",
  days: "DaysSection",
  footer: "FooterSection",
};

const chromeComponentMap: Record<string, string> = {
  menu: "SiteMenu",
  dock: "SiteDock",
  nav: "SiteNav",
};
