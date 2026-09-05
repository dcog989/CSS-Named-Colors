import type { ProcessedColor } from "./data/processor";
import { formatColor } from "./formatColor";

function toVarName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s/()]+/g, "-")
    .replace(/-$/, "")
    .replace(/--/g, "-");
}

export function exportColors(
  colors: ProcessedColor[],
  format: string,
  colorFormat: string,
  title: string,
): { text: string; label: string } | null {
  switch (format) {
    case "css": {
      const themeName = toVarName(title);
      const properties = colors
        .map((c) => `    --${toVarName(c.name)}: ${formatColor(c.instance, colorFormat)};`)
        .join("\n");
      return { text: `[data-theme="${themeName}"] {\n${properties}\n}`, label: "CSS theme block" };
    }
    case "json": {
      const obj: Record<string, string> = {};
      for (const c of colors) {
        obj[c.name] = formatColor(c.instance, colorFormat);
      }
      return { text: JSON.stringify(obj, null, 2), label: "JSON" };
    }
    case "scss":
      return {
        text: colors.map((c) => `$${toVarName(c.name)}: ${formatColor(c.instance, colorFormat)};`).join("\n"),
        label: "SCSS",
      };
    case "csv": {
      const header = "name,value";
      const rows = colors.map((c) => `${c.name},${formatColor(c.instance, colorFormat)}`).join("\n");
      return { text: `${header}\n${rows}`, label: "CSV" };
    }
    case "tailwind": {
      const entries = colors.map((c) => `  '${c.name}': '${formatColor(c.instance, colorFormat)}'`).join(",\n");
      return { text: `{\n${entries}\n}`, label: "Tailwind config" };
    }
    case "less":
      return {
        text: colors.map((c) => `@${toVarName(c.name)}: ${formatColor(c.instance, colorFormat)};`).join("\n"),
        label: "Less",
      };
    case "text":
      return {
        text: colors.map((c) => `${c.name}  ${formatColor(c.instance, colorFormat)}`).join("\n"),
        label: "text",
      };
    default:
      return null;
  }
}
