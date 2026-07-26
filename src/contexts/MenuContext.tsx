"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type MenuContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  // Close the menu on navigation, otherwise the root-level provider keeps
  // isOpen=true and the next page re-opens the overlay (e.g. after browser
  // back/forward) with the scroll lock stuck on.
  const pathname = usePathname();
  useEffect(() => {
    // Intentional reset on navigation. A no-op unless the menu was actually
    // open during the route change, so the flagged "cascading render" is rare
    // and desired (the alternative is a menu stuck open after back/forward).
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isOpen);

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within MenuProvider");
  }
  return context;
}
