<script lang="ts">
import ColorItem from "./ColorItem.svelte";
import { processColorSet } from "./data/processor";
import { exportColors } from "./exportFormats";
import { formatColor } from "./formatColor";

const { title, id, rawData, useNameAsBg, sortOrder, searchTerm, colorFormat, onCopy } = $props<{
  title: string;
  id: string;
  rawData: Record<string, string>;
  useNameAsBg: boolean;
  sortOrder: string;
  searchTerm: string;
  colorFormat: string;
  onCopy: (text: string, message: string, x: number, y: number) => void;
}>();

const formatLabel = $derived(colorFormat.toUpperCase());

// Process data once (props are static)
const processedData = $derived(processColorSet(rawData, useNameAsBg));

// Filter & Sort Logic using derived state
const finalData = $derived.by(() => {
  let data = [...processedData];

  // 1. Filter
  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    data = data.filter((c) => c.name.toLowerCase().includes(q) || c.instance.toHex().toLowerCase().includes(q));
  }

  // 2. Sort
  data.sort((a, b) => {
    if (sortOrder === "lightness") return b.lightness - a.lightness;
    if (sortOrder === "chroma") return b.chroma - a.chroma;
    if (sortOrder === "hue") {
      if (a.hue === null && b.hue === null) return a.lightness - b.lightness;
      if (a.hue === null) return 1;
      if (b.hue === null) return -1;

      if (a.hue !== b.hue) return a.hue - b.hue;
      if (a.lightness !== b.lightness) return a.lightness - b.lightness;
      return a.saturation - b.saturation;
    }
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });
  return data;
});

function copySetNames(e: MouseEvent) {
  const text = finalData.map((c) => `${c.name}  ${formatColor(c.instance, colorFormat)}`).join("\n");
  onCopy(text, `Copied ${finalData.length} names!`, e.clientX, e.clientY);
}

let exportSelect = $state<HTMLSelectElement | undefined>();

function handleExport(e: Event) {
  const target = e.target as HTMLSelectElement;
  const format = target.value;
  if (!format) return;
  target.value = "";

  const result = exportColors(finalData, format, colorFormat, title);
  if (!result) return;

  if (!exportSelect) return;
  const rect = exportSelect.getBoundingClientRect();
  onCopy(result.text, `Copied as ${result.label}!`, rect.left + rect.width / 2, rect.top);
}
</script>

{#if finalData.length > 0}
  <div class="page-container">
    <fieldset>
      <legend>
        {title}
        <span class="legend-actions">
          |
          <button type="button" class="legend-copy-action text-btn" onclick={copySetNames}>Copy Names</button>
          |
          <label for="exportSelect">Copy {formatLabel} Values as:</label>
          <select id="exportSelect" bind:this={exportSelect} onchange={handleExport} class="export-select">
            <option value="">—</option>
            <option value="css">CSS</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="less">Less</option>
            <option value="scss">SCSS</option>
            <option value="tailwind">Tailwind</option>
            <option value="text">Text</option>
          </select>
        </span>
      </legend>

      <ul class="color-list" {id}>
        {#each finalData as color (color.name)}
          <ColorItem {color} useNameForBg={useNameAsBg} {colorFormat} {formatLabel} {onCopy} />
        {/each}
      </ul>
    </fieldset>
  </div>
{/if}

<style>
.page-container {
  content-visibility: auto;
  contain-intrinsic-size: 1000px;
  max-width: 1280px;
  margin: 0 auto 20px;
  padding: clamp(6px, 1.5vw, 10px) clamp(8px, 2vw, 20px) clamp(12px, 2vw, 20px);
  background-color: var(--page-bg-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px var(--page-shadow-color);
}

fieldset {
  border: 1px solid var(--fieldset-border-color);
  border-radius: 4px;
  padding: clamp(8px, 1.5vw, 15px);
  margin: 0;
}

legend {
  font-size: clamp(1em, 2.5vw, 1.2em);
  font-weight: 600;
  color: var(--legend-text-color);
  padding: 0 10px;
  margin-left: 5px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.legend-actions {
  font-size: 0.8em;
  font-weight: normal;
  margin-left: 5px;
  color: var(--select-focus-border-color);
  white-space: normal;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.legend-copy-action {
  transition: transform 0.2s ease-in-out;
  display: inline-block;
}

.legend-copy-action:hover {
  text-decoration: underline;
  color: var(--header-color);
  transform: scale(1.05);
}

.export-select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--select-border-color);
  background-color: var(--select-bg-color);
  color: var(--select-text-color);
  font-size: inherit;
  cursor: pointer;
  vertical-align: middle;
}

.export-select:focus {
  outline: none;
  border-color: var(--select-focus-border-color);
  box-shadow: 0 0 0 2px var(--select-focus-shadow-color);
}

.color-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(245px, 100%), 1fr));
  grid-auto-rows: max-content;
  gap: clamp(8px, 1.5vw, 15px);
  align-content: start;
}
</style>
