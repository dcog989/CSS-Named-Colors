import type { Colordx } from "@colordx/core";

export function formatColor(instance: Colordx, format: string): string {
  switch (format) {
    case "rgb":
      return instance.toRgbString();
    case "hsl":
      return instance.toHslString(0);
    case "oklch": {
      const { l, c, h } = instance.toOklch(3);
      return `oklch(${l} ${c} ${Math.round(h)})`;
    }
    default:
      return instance.toHex();
  }
}
