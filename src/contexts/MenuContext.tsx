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

export type DesktopMenuPanel = "destinations" | "experiences";

type MenuContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Desktop nav dropdown panel (Figma 1:3227 / 1:3271); null when closed */
  desktopPanel: DesktopMenuPanel | null;
  toggleDesktopPanel: (panel: DesktopMenuPanel) => void;
  closeDesktopPanel: () => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [desktopPanel, setDesktopPanel] = useState<DesktopMenuPanel | null>(
    null,
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  const toggleDesktopPanel = useCallback((panel: DesktopMenuPanel) => {
    setDesktopPanel((current) => (current === panel ? null : panel));
  }, []);
  const closeDesktopPanel = useCallback(() => setDesktopPanel(null), []);

  // Close every menu surface on navigation, otherwise the root-level provider
  // keeps isOpen=true and the next page re-opens the overlay (e.g. after
  // browser back/forward) with the scroll lock stuck on.
  const pathname = usePathname();
  useEffect(() => {
    // Intentional reset on navigation. These no-op unless a menu was actually
    // open during the route change, so the flagged "cascading render" is rare
    // and desired (the alternative is a menu stuck open after back/forward).
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsOpen(false);
    setDesktopPanel(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isOpen);

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      desktopPanel,
      toggleDesktopPanel,
      closeDesktopPanel,
    }),
    [
      isOpen,
      open,
      close,
      toggle,
      desktopPanel,
      toggleDesktopPanel,
      closeDesktopPanel,
    ],
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
