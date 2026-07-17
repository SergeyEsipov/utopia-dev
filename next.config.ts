import type { NextConfig } from "next";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Auto-detect the machine's current LAN IPv4 addresses so devices on the same
// network can reach the dev server's HMR/_next resources without editing this
// file every time the network (and thus the machine's IP) changes. Restart the
// dev server after switching networks so this re-evaluates.
function localNetworkOrigins(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const addrs of Object.values(interfaces)) {
    for (const addr of addrs ?? []) {
      if (addr.family === "IPv4" && !addr.internal) ips.push(addr.address);
    }
  }
  return ips;
}

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    ...localNetworkOrigins(),
    // Broad private-range fallbacks (home / office / phone-hotspot subnets).
    "192.168.*",
    "172.20.*",
    "10.*",
  ],
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
