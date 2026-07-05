"use client";

import { useState } from "react";
import { Heading, Icon } from "@/design-system/components";
import { footerDestinations } from "@/lib/data";
import styles from "./destinations-nav.module.css";

type Category = keyof typeof footerDestinations;

type DestinationsNavProps = {
  idPrefix?: string;
  defaultOpen?: Category | null;
};

export function DestinationsNav({
  idPrefix = "dest",
  defaultOpen = null,
}: DestinationsNavProps) {
  const [openCategory, setOpenCategory] = useState<Category | null>(defaultOpen);

  const categories = Object.keys(footerDestinations) as Category[];

  const toggleCategory = (category: Category) => {
    setOpenCategory((current) => (current === category ? null : category));
  };

  return (
    <div className={styles.list}>
      {categories.map((category) => {
        const isOpen = openCategory === category;
        const items = footerDestinations[category];

        return (
          <div
            key={category}
            className={[styles.group, isOpen ? styles.groupOpen : ""]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={styles.groupInner}>
              <button
                type="button"
                className={styles.categoryRow}
                onClick={() => toggleCategory(category)}
                aria-expanded={isOpen}
                aria-controls={`${idPrefix}-${category}`}
              >
                <Heading variant="section" as="span" className={styles.label}>
                  {category}
                </Heading>
                <Icon
                  name="chevronDark"
                  size={12}
                  alt=""
                  className={[
                    styles.chevron,
                    isOpen ? styles.chevronOpen : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              </button>

              <ul
                id={`${idPrefix}-${category}`}
                className={styles.properties}
                aria-hidden={!isOpen}
              >
                {items.map((item) => (
                  <li key={item.label}>
                    {"active" in item && item.active ? (
                      <a
                        href="#"
                        className={[styles.property, styles.propertyActive]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className={styles.property}>{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
