import type { Colordx } from "@colordx/core";
import { colordx, extend } from "@colordx/core";
import names from "@colordx/core/plugins/names";

extend([names]);

export type ProcessedColor = {
  name: string;
  instance: Colordx;
  hue: number | null;
  saturation: number;
  lightness: number;
  chroma: number;
};

export function processColorSet(colorObject: Record<string, string>, nameIsColor = false): ProcessedColor[] {
  return Object.entries(colorObject).flatMap(([name, value]) => {
    const instance = colordx(nameIsColor ? name : value);
    if (!instance.isValid()) return [];

    const hsl = instance.toHsl();
    const oklch = instance.toOklch();
    let effectiveSortHue: number | null = null;
    if (hsl.s > 0) effectiveSortHue = Number.isNaN(hsl.h) ? 0 : hsl.h;

    return {
      name,
      instance,
      hue: effectiveSortHue,
      saturation: hsl.s,
      lightness: hsl.l,
      chroma: oklch.c,
    };
  });
}
