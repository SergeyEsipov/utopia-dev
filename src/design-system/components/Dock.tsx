"use client";

import { Icon } from "./Icon";
import { GlassSurface, glassPresets } from "@/design-system/liquid-glass";
import styles from "./components.module.css";

export interface DockItem {
  id: string;
  label: string;
  icon?: "homeMark" | "chevronDark";
  active?: boolean;
  href?: string;
}

export interface DockProps {
  items: DockItem[];
  onItemClick?: (id: string) => void;
  className?: string;
}

export function Dock({ items, onItemClick, className = "" }: DockProps) {
  return (
    <nav
      className={[styles.dock, className].filter(Boolean).join(" ")}
      aria-label="Main navigation"
    >
      {items.map((item) => (
        <GlassSurface
          key={item.id}
          preset={
            item.active
              ? { ...glassPresets.dock, background: "rgba(255, 255, 255, 0.95)" }
              : "dock"
          }
          height={32}
          radius={160}
          className={[
            styles.dockItem,
            item.active ? styles.dockItemActive : "",
          ]
            .filter(Boolean)
            .join(" ")}
          contentClassName={styles.dockItemContent}
          onClick={() => onItemClick?.(item.id)}
          aria-current={item.active ? "page" : undefined}
        >
          {item.icon && <Icon name={item.icon} size={16} alt="" />}
          <span>{item.label}</span>
        </GlassSurface>
      ))}
    </nav>
  );
}
