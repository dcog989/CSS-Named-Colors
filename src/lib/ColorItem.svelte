<script lang="ts">
    import type { ProcessedColor } from "./data/colorSets";

    let { color, useNameForBg, onCopy } = $props<{
        color: ProcessedColor;
        useNameForBg: boolean;
        onCopy: (text: string, success: boolean, message: string, x: number, y: number) => void;
    }>();

    function isLight(c: ProcessedColor) {
        return c.luminance > 0.5;
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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<li class="color-item {isLight(color) ? 'light-bg' : 'dark-bg'}" style="background-color: {useNameForBg ? color.name : color.instance.toHex()}" onclick={handleItemClick}>
    <div class="color-info">
        <span class="color-name color-swatch-action" role="button" tabindex="0" onclick={(e) => handleCopy("name", color.name, e)}>
            {color.name}
        </span>
    </div>
    <div class="color-copy-group color-swatch-action" role="button" tabindex="0" onclick={(e) => handleCopy("hex", color.instance.toHex(), e)}>
        <span class="color-hex">{color.instance.toHex()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
    </div>
</li>

<style>
    .color-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 15px;
        border-radius: 4px;
        transition:
            transform 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;
        cursor: default;
        will-change: transform;
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
    }

    .color-swatch-action {
        cursor: pointer;
        padding: 0 6px;
        border-radius: 4px;
        transition: background-color 0.2s ease-in-out;
        white-space: nowrap;
        display: flex;
        align-items: center;
        height: 24px;
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
