<script lang="ts">
    import type { ProcessedColor } from "./data/colorSets";

    let { color, useNameForBg, onCopy } = $props<{
        color: ProcessedColor;
        useNameForBg: boolean;
        onCopy: (text: string, success: boolean, message: string, x: number, y: number) => void;
    }>();

    // Threshold of 0.179 is the standard W3C point where
    // black vs white text yields equal contrast ratios.
    // Above this, black text is better. Below, white text is better.
    function isLight(c: ProcessedColor) {
        return c.luminance > 0.179;
    }

    function handleCopy(type: "name" | "hex", text: string, e: MouseEvent) {
        e.stopPropagation();
        let message = type === "name" ? `Copied "${text}"!` : `Copied ${text}!`;
        onCopy(text, true, message, e.clientX, e.clientY);
    }

    function handleItemClick(e: MouseEvent) {
        handleCopy("hex", color.instance.toHex(), e);
    }
</script>

<li class="color-item {isLight(color) ? 'light-bg' : 'dark-bg'}" style="background-color: {useNameForBg ? color.name : color.instance.toHex()}">
    <button type="button" class="item-bg-btn" aria-label="Copy {color.name} hex code" onclick={handleItemClick}></button>

    <div class="color-info">
        <button type="button" class="color-name color-swatch-action text-btn" onclick={(e) => handleCopy("name", color.name, e)}>
            {color.name}
        </button>
    </div>

    <button type="button" class="color-copy-group color-swatch-action icon-btn" onclick={(e) => handleCopy("hex", color.instance.toHex(), e)} aria-label="Copy Hex Code">
        <span class="color-hex">{color.instance.toHex()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon">
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
        padding: 10px 15px;
        border-radius: 4px;
        transition:
            transform 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;
        will-change: transform;
    }

    .item-bg-btn {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        cursor: pointer;
        z-index: 0;
    }

    .color-item:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .copy-icon {
        width: 24px;
        height: 24px;
        pointer-events: none;
        margin-left: 4px;
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
    }

    .color-swatch-action {
        pointer-events: auto;
        cursor: pointer;
        padding: 0 6px;
        border-radius: 4px;
        transition: background-color 0.2s ease-in-out;
        white-space: nowrap;
        display: flex;
        align-items: center;
        height: 24px;
        z-index: 1;
    }

    .color-swatch-action:hover {
        background-color: var(--color-item-text-hover-bg);
    }

    .color-copy-group {
        transition:
            max-width 0.4s ease-in-out,
            opacity 0.3s ease-in-out,
            margin-left 0.4s ease-in-out;
        overflow: hidden;
        opacity: 0;
        max-width: 0;
        margin-left: 0;
        display: flex;
        align-items: center;
        z-index: 1;
    }

    .color-item:hover .color-copy-group {
        opacity: 1;
        max-width: 12em;
        margin-left: 1ch;
    }

    .color-copy-group:hover {
        background-color: var(--color-item-text-hover-bg);
    }
</style>
