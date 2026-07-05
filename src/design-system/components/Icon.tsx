import Image from "next/image";
import { icons, type IconName } from "../assets";
import styles from "./components.module.css";

export interface IconProps {
  name: IconName;
  size?: number;
  alt?: string;
  className?: string;
}

export function Icon({ name, size = 24, alt = "", className = "" }: IconProps) {
  return (
    <Image
      src={icons[name]}
      alt={alt}
      width={size}
      height={size}
      className={[styles.icon, className].filter(Boolean).join(" ")}
    />
  );
}
