type SetModule = {
  id: string;
  title: string;
  useNameAsBg: boolean;
  colors: Record<string, string>;
};

export type SetManifestEntry = {
  id: string;
  title: string;
  useNameAsBg: boolean;
  /** Override the derived JSON filename for convention-breaking names. */
  file?: string;
};

export const SET_MANIFEST: SetManifestEntry[] = [
  { id: "bootstrapList", title: "Bootstrap", useNameAsBg: false },
  { id: "catppuccinFrappe", title: "Catppuccin Frappé", useNameAsBg: false },
  { id: "catppuccinLatte", title: "Catppuccin Latte", useNameAsBg: false },
  { id: "catppuccinMacchiato", title: "Catppuccin Macchiato", useNameAsBg: false },
  { id: "catppuccinMocha", title: "Catppuccin Mocha", useNameAsBg: false },
  { id: "colorList", title: "CSS Named Colors", useNameAsBg: true, file: "css-named-colors" },
  { id: "draculaList", title: "Dracula", useNameAsBg: false },
  { id: "farrow-ball", title: "Farrow & Ball", useNameAsBg: false },
  { id: "primerList", title: "GitHub Primer", useNameAsBg: false, file: "github-primer" },
  { id: "gruvboxList", title: "Gruvbox", useNameAsBg: false },
  { id: "materialList", title: "Material Design", useNameAsBg: false, file: "material-design" },
  { id: "nordList", title: "Nord", useNameAsBg: false },
  { id: "oneDarkList", title: "One Dark", useNameAsBg: false },
  { id: "oneLightList", title: "One Light", useNameAsBg: false },
  { id: "pantone-uncoated", title: "Pantone Uncoated", useNameAsBg: false },
  { id: "pantone", title: "Pantone Coated", useNameAsBg: false },
  { id: "ral-classic", title: "RAL Classic", useNameAsBg: false },
  { id: "resistorColorList", title: "Resistor Color Code", useNameAsBg: false, file: "resistor-color-code" },
  { id: "solarizedList", title: "Solarized", useNameAsBg: false },
  { id: "tableauColorList", title: "Tableau 20", useNameAsBg: false, file: "tableau-20" },
  { id: "tailwindColorList", title: "Tailwind CSS v4", useNameAsBg: false, file: "tailwind-v4" },
  { id: "tokyoNightList", title: "Tokyo Night", useNameAsBg: false },
  { id: "powershellColorList", title: "Windows Terminal", useNameAsBg: false, file: "windows-terminal" },
  { id: "xtermColorList", title: "xterm-256", useNameAsBg: false, file: "xterm-256" },
].sort((a, b) => a.title.localeCompare(b.title));

const setLoaders = import.meta.glob<SetModule>("./sets/*.json", {
  eager: false,
  import: "default",
});

const lookup = new Map(SET_MANIFEST.map((e) => [e.id, e]));

function idToFilename(id: string, fileOverride?: string): string {
  if (fileOverride) return fileOverride;
  // kebab-case IDs pass through
  if (id.includes("-")) return id;
  // Strip 'List' suffix and convert camelCase → kebab-case
  const base = id.endsWith("List") ? id.slice(0, -4) : id;
  return base.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

const loadedData = new Map<string, Record<string, string>>();

export async function loadSetData(id: string): Promise<Record<string, string> | null> {
  const cached = loadedData.get(id);
  if (cached) return cached;

  const entry = lookup.get(id);
  if (!entry) return null;

  const file = idToFilename(id, entry.file);
  const key = `./sets/${file}.json`;
  const loader = setLoaders[key];
  if (!loader) return null;

  const mod = await loader();
  if (!mod?.colors) return null;

  loadedData.set(id, mod.colors);
  return mod.colors;
}
