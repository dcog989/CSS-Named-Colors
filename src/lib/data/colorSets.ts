import GoatColor, { CSS_NAMED_COLORS } from "../utils/GoatColor";

export type ColorSetEntry = {
    name: string;
    value: string;
};

export type ProcessedColor = {
    name: string;
    instance: ReturnType<typeof GoatColor>;
    hue: number;
    saturation: number;
    lightness: number;
    luminance: number;
    effectiveHue: number;
};

export const powershellColors = {
    Black: "#000000",
    DarkBlue: "#000080",
    DarkGreen: "#008000",
    DarkCyan: "#008080",
    DarkRed: "#800000",
    DarkMagenta: "#800080",
    DarkYellow: "#808000",
    Gray: "#c0c0c0",
    DarkGray: "#808080",
    Blue: "#0000ff",
    Green: "#00ff00",
    Cyan: "#00ffff",
    Red: "#ff0000",
    Magenta: "#ff00ff",
    Yellow: "#ffff00",
    White: "#ffffff",
};

export const tailwindColors = {
    slate: "#64748b",
    gray: "#6b7280",
    zinc: "#71717a",
    neutral: "#737373",
    stone: "#78716c",
    red: "#ef4444",
    orange: "#f97316",
    amber: "#f59e0b",
    yellow: "#eab308",
    lime: "#84cc16",
    green: "#22c55e",
    emerald: "#10b981",
    teal: "#14b8a6",
    cyan: "#06b6d4",
    sky: "#0ea5e9",
    blue: "#3b82f6",
    indigo: "#6366f1",
    violet: "#8b5cf6",
    purple: "#a855f7",
    fuchsia: "#d946ef",
    pink: "#ec4899",
    rose: "#f43f5e",
};

export const tableau20Colors = {
    Blue: "#1f77b4",
    Orange: "#ff7f0e",
    Green: "#2ca02c",
    Red: "#d62728",
    Purple: "#9467bd",
    Brown: "#8c564b",
    Pink: "#e377c2",
    Gray: "#7f7f7f",
    Olive: "#bcbd22",
    Cyan: "#17becf",
    "Light Blue": "#aec7e8",
    "Light Orange": "#ffbb78",
    "Light Green": "#98df8a",
    "Light Red": "#ff9896",
    "Light Purple": "#c5b0d5",
    "Light Brown": "#c49c94",
    "Light Pink": "#f7b6d2",
    "Light Gray": "#c7c7c7",
    "Light Olive": "#dbdb8d",
    "Light Cyan": "#9edae5",
};

export const resistorColors = {
    Black: "#000000",
    Brown: "#a52a2a",
    Red: "#ff0000",
    Orange: "#ffa500",
    Yellow: "#ffff00",
    Green: "#008000",
    Blue: "#0000ff",
    Violet: "#ee82ee",
    Gray: "#808080",
    White: "#ffffff",
    Gold: "#ffd700",
    Silver: "#c0c0c0",
};

function generateXtermColors(): Record<string, string> {
    const colors: Record<string, string> = {};
    const toHex = (n: number) => n.toString(16).padStart(2, "0");

    const first16: Record<string, string> = {
        color0: "#000000", color1: "#800000", color2: "#008000", color3: "#808000",
        color4: "#000080", color5: "#800080", color6: "#008080", color7: "#c0c0c0",
        color8: "#808080", color9: "#ff0000", color10: "#00ff00", color11: "#ffff00",
        color12: "#0000ff", color13: "#ff00ff", color14: "#00ffff", color15: "#ffffff",
    };

    const levels = [0, 95, 135, 175, 215, 255];
    let i = 16;
    for (let r = 0; r < 6; r++) {
        for (let g = 0; g < 6; g++) {
            for (let b = 0; b < 6; b++) {
                colors[`color${i}`] = `#${toHex(levels[r])}${toHex(levels[g])}${toHex(levels[b])}`;
                i++;
            }
        }
    }

    for (let j = 0; j < 24; j++) {
        const gray = 8 + j * 10;
        colors[`color${i}`] = `#${toHex(gray)}${toHex(gray)}${toHex(gray)}`;
        i++;
    }

    return { ...first16, ...colors };
}

export const xtermColors = generateXtermColors();

export function processColorSet(
    colorObject: Record<string, string>,
    nameIsColor = false
): ProcessedColor[] {
    return Object.entries(colorObject).map(([name, value]) => {
        const instance = GoatColor(nameIsColor ? name : value);
        let hsl = { h: 0, s: 0, l: 0 };
        let luminance = 0;
        let effectiveSortHue = -1;

        if (instance.isValid()) {
            hsl = instance.toHsl();
            luminance = instance.getRelativeLuminance();
            if (hsl.s > 0) effectiveSortHue = isNaN(hsl.h) ? 0 : hsl.h;
        }

        return {
            name,
            instance,
            hue: effectiveSortHue,
            saturation: hsl.s,
            lightness: hsl.l,
            luminance,
            effectiveHue: effectiveSortHue,
        };
    });
}

export const ALL_SETS = [
    { id: 'colorList', title: 'CSS Named Colors', data: CSS_NAMED_COLORS, useNameAsBg: true },
    { id: 'powershellColorList', title: 'Windows Terminal / PowerShell', data: powershellColors, useNameAsBg: false },
    { id: 'tailwindColorList', title: 'Tailwind CSS Default Colors (500)', data: tailwindColors, useNameAsBg: false },
    { id: 'tableauColorList', title: 'Tableau 20', data: tableau20Colors, useNameAsBg: false },
    { id: 'resistorColorList', title: 'Resistor Color Code', data: resistorColors, useNameAsBg: false },
    { id: 'xtermColorList', title: 'xterm-256', data: xtermColors, useNameAsBg: false },
];