import React from 'react';

interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button width in px */
    width?: number;
    /** Button height in px */
    height?: number;
    /** Border radius in px */
    radius?: number;
    /** Edge thickness of the glass refraction zone */
    edgeSize?: number;
    /** Edge refraction intensity (0-1) */
    intensity?: number;
    /** Specular rim thickness relative to size (0-1) */
    specularWidth?: number;
    /** feDisplacementMap scale - how much the background refracts */
    displacement?: number;
    /** Gaussian blur applied to the background */
    blur?: number;
    /** Saturation applied to the displaced result */
    saturation?: number;
    /** Brightness boost on the backdrop-filter (1 = normal) */
    brightness?: number;
    /** Background tint color of the glass */
    glassColor?: string;
    /** Scale multiplier on hover */
    hoverScale?: number;
    /** Displacement scale on hover */
    hoverDisplacement?: number;
    /** Blur amount on hover */
    hoverBlur?: number;
    /** Duration of hover animation in seconds */
    hoverDuration?: number;
    /** Disable all GSAP animations */
    disableAnimation?: boolean;
    /** Supersampling quality for the displacement map (default 2, higher = smoother) */
    quality?: number;
}
declare const LiquidGlassButton: React.ForwardRefExoticComponent<LiquidGlassButtonProps & React.RefAttributes<HTMLButtonElement>>;

interface MapOptions {
    width: number;
    height: number;
    radius?: number;
    edgeSize?: number;
    intensity?: number;
    specularWidth?: number;
    /** Supersampling multiplier for the displacement map (default: 2). Higher = smoother gradients. */
    quality?: number;
}
declare function generateGlassMaps(opts: MapOptions): Promise<{
    displacement: string;
    specular: string;
}>;
declare function getCachedGlassMaps(opts: MapOptions): {
    displacement: string;
    specular: string;
} | null;
declare function revokeGlassMaps(maps: {
    displacement: string;
    specular: string;
}): void;

declare function cn(...classes: (string | undefined | null | false)[]): string;

export { LiquidGlassButton, type LiquidGlassButtonProps, type MapOptions, cn, generateGlassMaps, getCachedGlassMaps, revokeGlassMaps };
