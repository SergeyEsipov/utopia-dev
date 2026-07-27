"use client";

import { useState } from "react";
import { Heading, Icon } from "@/design-system/components";
import { mobileMenuCategories } from "@/lib/data";
import { triggerHaptic } from "@/lib/haptics";
import styles from "./destinations-nav.module.css";

type Category = keyof typeof mobileMenuCategories;

type DestinationsNavProps = {
  idPrefix?: string;
  defaultOpen?: Category | null;
  /** Staggered enter animation on first mobile menu open */
  stagger?: boolean;
  /** Staggered exit animation when the mobile menu closes */
  exiting?: boolean;
};

type DestinationGroupProps = {
  category: Category;
  categoryIndex: number;
  idPrefix: string;
  isOpen: boolean;
  onToggle: (category: Category) => void;
};

function DestinationGroup({
  category,
  categoryIndex,
  idPrefix,
  isOpen,
  onToggle,
}: DestinationGroupProps) {
  const items = mobileMenuCategories[category];

  return (
    <div
      className={[styles.group, isOpen ? styles.groupOpen : ""]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--dest-index": categoryIndex,
          "--dest-item-count": items.length,
        } as React.CSSProperties
      }
    >
      <div className={styles.groupInner}>
        <div className={styles.categoryReveal}>
          <button
            type="button"
            className={styles.categoryRow}
            onClick={() => onToggle(category)}
            aria-expanded={isOpen}
            aria-controls={`${idPrefix}-${category}`}
          >
            <Heading variant="section" as="span" className={styles.label}>
              {category}
            </Heading>
            <Icon name="chevronDark" size={12} alt="" className={styles.chevron} />
          </button>
        </div>

        <div className={styles.propertiesWrap}>
          <ul
            id={`${idPrefix}-${category}`}
            className={styles.properties}
            aria-hidden={!isOpen}
          >
            {items.map((item, itemIndex) => (
              <li
                key={item.label}
                style={{ "--dest-item-index": itemIndex } as React.CSSProperties}
              >
                {/* The featured destination keeps its highlighted styling but
                    has no page yet, so it is inert rather than a 404 link —
                    prototype `nav-menu__link--muted` with href="#". */}
                {"active" in item && item.active ? (
                  <span
                    className={[styles.property, styles.propertyActive]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {item.label}
                  </span>
                ) : (
                  <span className={styles.property}>{item.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function DestinationsNav({
  idPrefix = "dest",
  defaultOpen = null,
  stagger = false,
  exiting = false,
}: DestinationsNavProps) {
  const [openCategory, setOpenCategory] = useState<Category | null>(defaultOpen);

  const categories = Object.keys(mobileMenuCategories) as Category[];

  const toggleCategory = (category: Category) => {
    triggerHaptic("selection");
    setOpenCategory((current) => (current === category ? null : category));
  };

  return (
    <div
      className={[
        styles.list,
        stagger ? styles.listStagger : "",
        stagger ? styles.listStaggerActive : "",
        exiting ? styles.listExit : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {categories.map((category, index) => (
        <DestinationGroup
          key={category}
          category={category}
          categoryIndex={index}
          idPrefix={idPrefix}
          isOpen={openCategory === category}
          onToggle={toggleCategory}
        />
      ))}
    </div>
  );
}
