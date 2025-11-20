/** Goat Color Toolbox - TypeScript Port */

const SRGB_TO_XYZ_MATRIX = [
    [0.4123907993, 0.3575843394, 0.1804807884],
    [0.2126390059, 0.7151686788, 0.0721923154],
    [0.0193308187, 0.1191947798, 0.9505321522],
];
const XYZ_TO_SRGB_MATRIX = [
    [3.240969942, -1.5373831776, -0.4986107603],
    [-0.9692436363, 1.8759675015, 0.0415550574],
    [0.0556300797, -0.2039769589, 1.0569715142],
];
const OKLAB_XYZ_TO_LMS_MATRIX = [
    [0.8189330101, 0.3618667424, -0.1288597137],
    [0.0329845436, 0.9293118715, 0.0361456387],
    [0.0482003018, 0.2643662691, 0.633851707],
];
const OKLAB_LMS_P_TO_LAB_MATRIX = [
    [0.2104542553, 0.793617785, -0.0040720468],
    [1.9779984951, -2.428592205, 0.4505937099],
    [0.0259040371, 0.7827717662, -0.808675766],
];
const OKLAB_LAB_TO_LMS_P_MATRIX = [
    [0.99999999845051981432, 0.39633777736240243769, 0.21580375730249306069],
    [1.00000000838056630002, -0.10556134579289659905, -0.06385417279300911922],
    [1.00000005467234261899, -0.08948417752909546082, -1.2914855480408174125],
];
const OKLAB_LMS_CUBED_TO_XYZ_MATRIX = [
    [1.226879878071479, -0.5578149965684922, 0.2813910501598616],
    [-0.04057575003935402, 1.112286829376436, -0.07171107933708207],
    [-0.07637293665230801, -0.4214933235444953, 1.586161639400282],
];

export const ALPHA_STYLE_HINT_PERCENT = "percent";
export const ALPHA_STYLE_HINT_NUMBER = "number";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

const isPercentage = (str: string | number) => typeof str === "string" && str.endsWith("%");

function parseCssNumber(value: string | number, maxIfPercent = 255) {
    const strValue = String(value);
    if (isPercentage(strValue)) {
        return clamp((parseFloat(strValue) / 100) * maxIfPercent, 0, maxIfPercent);
    }
    return clamp(parseFloat(strValue), 0, maxIfPercent);
}

function parseHue(value: string | number) {
    const strValue = String(value).toLowerCase().trim();
    const numValue = parseFloat(strValue);
    if (isNaN(numValue)) return 0;

    const unitsPart = strValue.replace(/[\d.+\-eE]/g, "").trim().toLowerCase();
    let degreesValue;

    if (unitsPart === "deg" || unitsPart === "°" || unitsPart === "") {
        degreesValue = numValue;
    } else if (unitsPart === "rad") {
        degreesValue = (numValue * 180) / Math.PI;
    } else if (unitsPart === "grad") {
        degreesValue = numValue * 0.9;
    } else if (unitsPart === "turn") {
        degreesValue = numValue * 360;
    } else {
        return 0;
    }
    let normalizedHue = degreesValue % 360;
    if (normalizedHue < 0) normalizedHue += 360;
    return Object.is(normalizedHue, -0) ? 0 : normalizedHue;
}

function parseHslPercentage(value: string | number) {
    const strValue = String(value).trim();
    if (!isPercentage(strValue)) throw new Error("Invalid HSL saturation/lightness value: '%' unit is required.");
    const percValue = parseFloat(strValue);
    if (isNaN(percValue)) throw new Error("Invalid HSL saturation/lightness percentage value: Not a number before '%'.");
    return clamp(percValue, 0, 100);
}

function parseAlpha(value: string | number | null | undefined) {
    if (value == null) return { value: 1, styleHint: null };
    const strValue = String(value).trim();
    if (strValue === "") return { value: 1, styleHint: null };
    if (isPercentage(strValue)) {
        return { value: clamp(parseFloat(strValue), 0, 100) / 100, styleHint: ALPHA_STYLE_HINT_PERCENT };
    }
    return { value: clamp(parseFloat(strValue), 0, 1), styleHint: ALPHA_STYLE_HINT_NUMBER };
}

function toHexPart(value: number) {
    return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0");
}
function srgbToLinear(c: number) {
    const cn = c / 255;
    return cn <= 0.04045 ? cn / 12.92 : Math.pow((cn + 0.055) / 1.055, 2.4);
}
function linearToSrgb(clin: number) {
    const cs = clin <= 0.0031308 ? 12.92 * clin : 1.055 * Math.pow(clin, 1 / 2.4) - 0.055;
    return Math.round(clamp(cs, 0, 1) * 255);
}
function multiplyMatrix(matrix: number[][], vector: number[]) {
    return [matrix[0][0] * vector[0] + matrix[0][1] * vector[1] + matrix[0][2] * vector[2], matrix[1][0] * vector[0] + matrix[1][1] * vector[1] + matrix[1][2] * vector[2], matrix[2][0] * vector[0] + matrix[2][1] * vector[1] + matrix[2][2] * vector[2]];
}
function hslToRgb(h: number, s: number, l: number) {
    h = (((h % 360) + 360) % 360) / 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    if (s === 0) {
        const gray = Math.round(l * 255);
        return { r: gray, g: gray, b: gray };
    }
    const hueToRgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return { r: Math.round(hueToRgb(p, q, h + 1 / 3) * 255), g: Math.round(hueToRgb(p, q, h) * 255), b: Math.round(hueToRgb(p, q, h - 1 / 3) * 255) };
}

const CSS_RGB_REGEX = /^rgba?\(\s*([+\-\d.%]+)\s+([+\-\d.%]+)\s+([+\-\d.%]+)\s*(?:[\/\s]\s*([+\-\d.%]+)\s*)?\)$/i;
const CSS_RGB_LEGACY_REGEX = /^rgba?\(\s*([+\-\d.%]+)\s*,\s*([+\-\d.%]+)\s*,\s*([+\-\d.%]+)\s*(?:,\s*([+\-\d.%]+)\s*)?\)$/i;
const CSS_HSL_REGEX = /^hsla?\(\s*([+\-\d.%a-z°]+)\s+([+\-\d.%]+)\s+([+\-\d.%]+)\s*(?:[\/\s]\s*([+\-\d.%]+)\s*)?\)$/i;
const CSS_HSL_LEGACY_REGEX = /^hsla?\(\s*([+\-\d.%a-z°]+)\s*,\s*([+\-\d.%]+)\s*,\s*([+\-\d.%]+)\s*(?:,\s*([+\-\d.%]+)\s*)?\)$/i;
const CSS_HEX_REGEX = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})?$|^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i;
const CSS_HEX_LEGACY_NUM_REGEX = /^0x(?:([a-f\d]{2}))?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
const CSS_OKLCH_REGEX = /^oklch\(\s*([+\-\d.%]+)\s+([+\-\d.%]+)\s+([+\-\d.%a-z°]+)\s*(?:[\/\s]\s*([+\-\d.%]+)\s*)?\)$/i;

export const CSS_NAMED_COLORS: Record<string, string> = {
    aliceblue: "#f0f8ff", antiquewhite: "#faebd7", aqua: "#00ffff", aquamarine: "#7fffd4", azure: "#f0ffff", beige: "#f5f5dc", bisque: "#ffe4c4", black: "#000000", blanchedalmond: "#ffebcd", blue: "#0000ff", blueviolet: "#8a2be2", brown: "#a52a2a", burlywood: "#deb887", cadetblue: "#5f9ea0", chartreuse: "#7fff00", chocolate: "#d2691e", coral: "#ff7f50", cornflowerblue: "#6495ed", cornsilk: "#fff8dc", crimson: "#dc143c", cyan: "#00ffff", darkblue: "#00008b", darkcyan: "#008b8b", darkgoldenrod: "#b8860b", darkgray: "#a9a9a9", darkgreen: "#006400", darkgrey: "#a9a9a9", darkkhaki: "#bdb76b", darkmagenta: "#8b008b", darkolivegreen: "#556b2f", darkorange: "#ff8c00", darkorchid: "#9932cc", darkred: "#8b0000", darksalmon: "#e9967a", darkseagreen: "#8fbc8f", darkslateblue: "#483d8b", darkslategray: "#2f4f4f", darkslategrey: "#2f4f4f", darkturquoise: "#00ced1", darkviolet: "#9400d3", deeppink: "#ff1493", deepskyblue: "#00bfff", dimgray: "#696969", dimgrey: "#696969", dodgerblue: "#1e90ff", firebrick: "#b22222", floralwhite: "#fffaf0", forestgreen: "#228b22", fuchsia: "#ff00ff", gainsboro: "#dcdcdc", ghostwhite: "#f8f8ff", gold: "#ffd700", goldenrod: "#daa520", gray: "#808080", green: "#008000", greenyellow: "#adff2f", grey: "#808080", honeydew: "#f0fff0", hotpink: "#ff69b4", indianred: "#cd5c5c", indigo: "#4b0082", ivory: "#fffff0", khaki: "#f0e68c", lavender: "#e6e6fa", lavenderblush: "#fff0f5", lawngreen: "#7cfc00", lemonchiffon: "#fffacd", lightblue: "#add8e6", lightcoral: "#f08080", lightcyan: "#e0ffff", lightgoldenrodyellow: "#fafad2", lightgray: "#d3d3d3", lightgreen: "#90ee90", lightgrey: "#d3d3d3", lightpink: "#ffb6c1", lightsalmon: "#ffa07a", lightseagreen: "#20b2aa", lightskyblue: "#87cefa", lightslategray: "#778899", lightslategrey: "#778899", lightsteelblue: "#b0c4de", lightyellow: "#ffffe0", lime: "#00ff00", limegreen: "#32cd32", linen: "#faf0e6", magenta: "#ff00ff", maroon: "#800000", mediumaquamarine: "#66cdaa", mediumblue: "#0000cd", mediumorchid: "#ba55d3", mediumpurple: "#9370db", mediumseagreen: "#3cb371", mediumslateblue: "#7b68ee", mediumspringgreen: "#00fa9a", mediumturquoise: "#48d1cc", mediumvioletred: "#c71585", midnightblue: "#191970", mintcream: "#f5fffa", mistyrose: "#ffe4e1", moccasin: "#ffe4b5", navajowhite: "#ffdead", navy: "#000080", oldlace: "#fdf5e6", olive: "#808000", olivedrab: "#6b8e23", orange: "#ffa500", orangered: "#ff4500", orchid: "#da70d6", palegoldenrod: "#eee8aa", palegreen: "#98fb98", paleturquoise: "#afeeee", palevioletred: "#db7093", papayawhip: "#ffefd5", peachpuff: "#ffdab9", peru: "#cd853f", pink: "#ffc0cb", plum: "#dda0dd", powderblue: "#b0e0e6", purple: "#800080", rebeccapurple: "#663399", red: "#ff0000", rosybrown: "#bc8f8f", royalblue: "#4169e1", saddlebrown: "#8b4513", salmon: "#fa8072", sandybrown: "#f4a460", seagreen: "#2e8b57", seashell: "#fff5ee", sienna: "#a0522d", silver: "#c0c0c0", skyblue: "#87ceeb", slateblue: "#6a5acd", slategray: "#708090", slategrey: "#708090", snow: "#fffafa", springgreen: "#00ff7f", steelblue: "#4682b4", tan: "#d2b48c", teal: "#008080", thistle: "#d8bfd8", tomato: "#ff6347", transparent: "#00000000", turquoise: "#40e0d0", violet: "#ee82ee", wheat: "#f5deb3", white: "#ffffff", whitesmoke: "#f5f5f5", yellow: "#ffff00", yellowgreen: "#9acd32"
};

export class GoatColorInternal {
    r = 0;
    g = 0;
    b = 0;
    a = 1;
    input: string | null | undefined;
    valid = false;
    error: string | null = null;
    _alphaInputStyleHint: string | null = null;

    constructor(colorInput: string | null | undefined) {
        this.input = colorInput;
        this._parse(colorInput);
    }

    _parse(rawInput: string | null | undefined) {
        this.valid = false;
        this.error = null;

        if (rawInput == null) {
            this.error = "Input color is null or undefined.";
            return;
        }
        if (typeof rawInput !== "string") {
            this.error = `Invalid input type: Expected string, got ${typeof rawInput}.`;
            return;
        }

        let str = rawInput.trim();
        if (str === "") {
            this.error = "Input color string is empty.";
            return;
        }

        const lowerStr = str.toLowerCase();
        if (CSS_NAMED_COLORS.hasOwnProperty(lowerStr)) {
            str = CSS_NAMED_COLORS[lowerStr];
        }

        let match;
        let alphaInfo;

        // Try Hex
        match = str.match(CSS_HEX_REGEX);
        if (match) {
            try {
                if (match[5] !== undefined) {
                    this.r = parseInt(match[5], 16);
                    this.g = parseInt(match[6], 16);
                    this.b = parseInt(match[7], 16);
                    if (match[8]) {
                        this.a = parseInt(match[8], 16) / 255;
                        this._alphaInputStyleHint = ALPHA_STYLE_HINT_NUMBER;
                    } else {
                        this.a = 1;
                    }
                } else {
                    this.r = parseInt(match[1] + match[1], 16);
                    this.g = parseInt(match[2] + match[2], 16);
                    this.b = parseInt(match[3] + match[3], 16);
                    if (match[4]) {
                        this.a = parseInt(match[4] + match[4], 16) / 255;
                        this._alphaInputStyleHint = ALPHA_STYLE_HINT_NUMBER;
                    } else {
                        this.a = 1;
                    }
                }
                if (isNaN(this.r) || isNaN(this.g) || isNaN(this.b)) throw new Error("Invalid character in hex string.");
                this.valid = true;
                return;
            } catch (e: any) {
                this.error = `Invalid Hex format: ${e.message || 'Parsing failed'}`;
                this.valid = false;
                return;
            }
        }

        // Try 0x Hex
        match = str.match(CSS_HEX_LEGACY_NUM_REGEX);
        if (match) {
            try {
                if (match[1] !== undefined) {
                    this.a = parseInt(match[1], 16) / 255;
                    this.r = parseInt(match[2], 16);
                    this.g = parseInt(match[3], 16);
                    this.b = parseInt(match[4], 16);
                    this._alphaInputStyleHint = ALPHA_STYLE_HINT_NUMBER;
                } else {
                    this.r = parseInt(match[2], 16);
                    this.g = parseInt(match[3], 16);
                    this.b = parseInt(match[4], 16);
                    this.a = 1;
                }
                if (isNaN(this.r) || isNaN(this.g) || isNaN(this.b) || isNaN(this.a)) throw new Error("Invalid character in 0x hex string.");
                this.valid = true;
                return;
            } catch (e: any) {
                this.error = `Invalid 0x Hex format: ${e.message || 'Parsing failed'}`;
                this.valid = false;
                return;
            }
        }

        // Try OKLCH
        match = str.match(CSS_OKLCH_REGEX);
        if (match) {
            try {
                const parseOklchLightness = (v: string) => {
                    const n = parseFloat(v);
                    if (isNaN(n)) throw new Error("Invalid OKLCH Lightness value.");
                    return isPercentage(v) ? clamp(n, 0, 100) : clamp(n * 100, 0, 100);
                };
                const parseOklchChroma = (v: string) => {
                    const n = parseFloat(v);
                    if (isNaN(n)) throw new Error("Invalid OKLCH Chroma value.");
                    if (isPercentage(v)) {
                        return clamp((parseFloat(v) / 100) * 0.4, 0, Infinity);
                    }
                    return clamp(n, 0, Infinity);
                };

                const l_val = parseOklchLightness(match[1]);
                const c_val = parseOklchChroma(match[2]);
                const h_val = parseHue(match[3]);
                alphaInfo = parseAlpha(match[4]);
                this.a = alphaInfo.value;
                this._alphaInputStyleHint = alphaInfo.styleHint;

                const L_oklab_norm = l_val / 100.0;
                const C_oklch_val = c_val;
                const H_rad = (h_val * Math.PI) / 180.0;

                const a_oklab_comp = C_oklch_val * Math.cos(H_rad);
                const b_oklab_comp = C_oklch_val * Math.sin(H_rad);

                const [l_p, m_p, s_p] = multiplyMatrix(OKLAB_LAB_TO_LMS_P_MATRIX, [L_oklab_norm, a_oklab_comp, b_oklab_comp]);
                const [x, y, z] = multiplyMatrix(OKLAB_LMS_CUBED_TO_XYZ_MATRIX, [Math.pow(l_p, 3), Math.pow(m_p, 3), Math.pow(s_p, 3)]);
                const [r_lin, g_lin, b_lin] = multiplyMatrix(XYZ_TO_SRGB_MATRIX, [x, y, z]);

                this.r = linearToSrgb(r_lin);
                this.g = linearToSrgb(g_lin);
                this.b = linearToSrgb(b_lin);

                if (isNaN(this.r) || isNaN(this.g) || isNaN(this.b) || isNaN(this.a)) {
                    throw new Error("OKLCH to RGB conversion resulted in non-finite component values.");
                }
                this.valid = true;
                return;
            } catch (e: any) {
                this.error = `Invalid OKLCH format: ${e.message || 'Parsing failed'}`;
                this.valid = false;
                return;
            }
        }

        // Try HSL
        match = str.match(CSS_HSL_REGEX) || str.match(CSS_HSL_LEGACY_REGEX);
        if (match) {
            try {
                const { r, g, b } = hslToRgb(parseHue(match[1]), parseHslPercentage(match[2]), parseHslPercentage(match[3]));
                this.r = r;
                this.g = g;
                this.b = b;
                alphaInfo = parseAlpha(match[4]);
                this.a = alphaInfo.value;
                this._alphaInputStyleHint = alphaInfo.styleHint;

                if (isNaN(this.r) || isNaN(this.g) || isNaN(this.b) || isNaN(this.a)) {
                    throw new Error("HSL to RGB conversion resulted in non-finite component values.");
                }
                this.valid = true;
                return;
            } catch (e: any) {
                this.error = `Invalid HSL format: ${e.message || 'Parsing failed'}`;
                this.valid = false;
                return;
            }
        }

        // Try RGB
        match = str.match(CSS_RGB_REGEX) || str.match(CSS_RGB_LEGACY_REGEX);
        if (match) {
            try {
                this.r = parseCssNumber(match[1]);
                this.g = parseCssNumber(match[2]);
                this.b = parseCssNumber(match[3]);
                alphaInfo = parseAlpha(match[4]);
                this.a = alphaInfo.value;
                this._alphaInputStyleHint = alphaInfo.styleHint;
                if (isNaN(this.r) || isNaN(this.g) || isNaN(this.b) || isNaN(this.a)) {
                    throw new Error("One or more RGB(A) components are not valid numbers.");
                }
                this.valid = true;
                return;
            } catch (e: any) {
                this.error = `Invalid RGB format: ${e.message || 'Parsing failed'}`;
                this.valid = false;
                return;
            }
        }

        if (!this.valid) {
            this.error = this.error || `Unrecognized color format: "${rawInput}"`;
        }
    }

    isValid() {
        return this.valid;
    }

    toHex() {
        if (!this.valid) return this.error || "Invalid Color";
        return `#${toHexPart(this.r)}${toHexPart(this.g)}${toHexPart(this.b)}`;
    }

    toHsl() {
        if (!this.valid) return { h: 0, s: 0, l: 0 };
        const rN = this.r / 255, gN = this.g / 255, bN = this.b / 255;
        const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
        let h = 0, s, l = (max + min) / 2;

        if (max === min) {
            s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case rN: h = (gN - bN) / d + (gN < bN ? 6 : 0); break;
                case gN: h = (bN - rN) / d + 2; break;
                case bN: h = (rN - gN) / d + 4; break;
            }
            h /= 6;
        }
        let finalH = h * 360;
        finalH = Object.is(finalH, -0) ? 0 : finalH;
        return { h: finalH, s: s * 100, l: l * 100 };
    }

    getRelativeLuminance() {
        if (!this.valid) return 0;
        const r_lin = srgbToLinear(this.r);
        const g_lin = srgbToLinear(this.g);
        const b_lin = srgbToLinear(this.b);
        return SRGB_TO_XYZ_MATRIX[1][0] * r_lin + SRGB_TO_XYZ_MATRIX[1][1] * g_lin + SRGB_TO_XYZ_MATRIX[1][2] * b_lin;
    }
}

export default function GoatColor(colorInput: string | null | undefined) {
    return new GoatColorInternal(colorInput);
}