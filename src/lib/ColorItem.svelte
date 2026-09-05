<script lang="ts">
import type { ProcessedColor } from "./data/processor";
import { formatColor } from "./formatColor";

const { color, useNameForBg, colorFormat, formatLabel, onCopy } = $props<{
  color: ProcessedColor;
  useNameForBg: boolean;
  colorFormat: string;
  formatLabel: string;
  onCopy: (text: string, message: string, x: number, y: number) => void;
}>();

const formatted = $derived(formatColor(color.instance, colorFormat));
const bgColor = $derived(useNameForBg ? color.name : color.instance.toHex());
const isLight = $derived(color.instance.isLight());
const copyBg = $derived(isLight ? color.instance.darken(0.15).toHex() : color.instance.lighten(0.15).toHex());

function handleCopy(type: "name" | "value", text: string, e: MouseEvent) {
  e.stopPropagation();
  const message = type === "name" ? `Copied "${text}"!` : `Copied ${text}!`;
  onCopy(text, message, e.clientX, e.clientY);
}
</script>

<li class="color-item {isLight ? 'light-bg' : 'dark-bg'}" style="background-color: {bgColor}">
  <button
    type="button"
    class="item-bg"
    aria-label="Copy {formatLabel}"
    onclick={(e) => handleCopy('value', formatted, e)}
  ></button>
  <div class="color-info">
    <button
      type="button"
      class="color-name color-swatch-action text-btn"
      onclick={(e) => handleCopy('name', color.name, e)}
    >
      {color.name}
    </button>
  </div>

  <button
    type="button"
    class="color-copy-group color-swatch-action icon-btn"
    onclick={(e) => handleCopy('value', formatted, e)}
    aria-label="Copy {formatLabel}"
    style="background-color: {copyBg}"
  >
    <span class="color-value">{formatted}</span>
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="copy-icon"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  </button>
</li>

<style>
.color-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(6px, 1.2vw, 10px) clamp(8px, 1.5vw, 15px);
  border-radius: 4px;
  transition: transform 0.2s ease-in-out;
}

.item-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}

@media (hover: hover) {
  .color-item:hover {
    transform: scale(1.02);
  }
}

.copy-icon {
  width: 24px;
  height: 24px;
  pointer-events: none;
  margin-left: 4px;
}

@media (max-width: 480px) {
  .copy-icon {
    width: 18px;
    height: 18px;
  }
  .color-value {
    font-size: 0.85em;
  }
  .color-info {
    font-size: 0.85em;
  }
}

.color-item.light-bg {
  color: var(--color-item-light-text);
}

.color-item.dark-bg {
  color: var(--color-item-dark-text);
}

.color-item.dark-bg .copy-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.color-item.light-bg .copy-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.color-info {
  flex-grow: 1;
  font-family: "Source Code Pro", Consolas, "Courier New", Courier, monospace;
  font-size: 0.95em;
  display: flex;
  align-items: center;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
  min-width: 0;
}

.color-swatch-action {
  pointer-events: auto;
  cursor: pointer;
  padding: 0 6px;
  border-radius: 4px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  height: 24px;
  z-index: 1;
  min-width: 0;
}

.color-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.color-swatch-action:hover {
  background-color: var(--color-item-text-hover-bg);
}

.color-copy-group {
  position: absolute;
  right: clamp(8px, 1.5vw, 15px);
  top: 50%;
  translate: 0 -50%;
  transition: opacity 0.3s ease-in-out;
  display: flex;
  align-items: center;
  z-index: 1;
  pointer-events: none;
  border-radius: 4px;
}

@media (hover: hover) {
  .color-copy-group {
    opacity: 0;
  }

  .color-item:hover .color-copy-group {
    opacity: 1;
    pointer-events: auto;
  }
}

@media (hover: none) {
  .color-copy-group {
    opacity: 1;
    pointer-events: auto;
  }
}

.color-copy-group:hover {
  background-color: var(--color-item-text-hover-bg);
}
</style>
