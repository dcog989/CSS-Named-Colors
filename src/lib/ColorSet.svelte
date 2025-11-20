<script lang="ts">
    import ColorItem from "./ColorItem.svelte";
    import { processColorSet } from "./data/colorSets";

    let { title, id, rawData, useNameAsBg, sortOrder, searchTerm, onCopy } = $props<{
        title: string;
        id: string;
        rawData: Record<string, string>;
        useNameAsBg: boolean;
        sortOrder: string;
        searchTerm: string;
        onCopy: (text: string, success: boolean, message: string, x: number, y: number) => void;
    }>();

    // Process data once
    let processedData = processColorSet(rawData, useNameAsBg);

    // Filter & Sort Logic using derived state
    let finalData = $derived.by(() => {
        if (!processedData) return [];

        let data = [...processedData];

        // 1. Filter
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            data = data.filter((c) => c.name.toLowerCase().includes(q) || c.instance.toHex().toLowerCase().includes(q));
        }

        // 2. Sort
        data.sort((a, b) => {
            if (sortOrder === "luminosity") return b.luminance - a.luminance;
            if (sortOrder === "hue") {
                // Handle grayscale/achromatic colors first in hue sort
                if (a.effectiveHue === -1 && b.effectiveHue === -1) return a.lightness - b.lightness;
                if (a.effectiveHue === -1) return 1;
                if (b.effectiveHue === -1) return -1;

                if (a.hue !== b.hue) return a.hue - b.hue;
                if (a.lightness !== b.lightness) return a.lightness - b.lightness;
                return a.saturation - b.saturation;
            }
            return a.name.localeCompare(b.name, undefined, { numeric: true });
        });
        return data;
    });

    function copySetNames(e: MouseEvent) {
        const text = finalData.map((c) => c.name).join("\n");
        onCopy(text, true, `Copied ${finalData.length} names!`, e.clientX, e.clientY);
    }

    function copySetCSS(e: MouseEvent) {
        const themeName = title
            .toLowerCase()
            .replace(/[\s/()]+/g, "-")
            .replace(/-$/, "")
            .replace(/--/g, "-");
        const properties = finalData.map((c) => `    --${c.name.toLowerCase().replace(/[\s/]+/g, "-")}: ${c.instance.toHex()};`).join("\n");
        const text = `[data-theme="${themeName}"] {\n${properties}\n}`;
        onCopy(text, true, "Copied as CSS theme block!", e.clientX, e.clientY);
    }
</script>

{#if finalData.length > 0}
    <div class="page-container">
        <fieldset>
            <legend>
                {title}
                <span class="legend-actions">
                    |
                    <button type="button" class="legend-copy-action text-btn" onclick={copySetNames}> Copy Names </button>
                    |
                    <button type="button" class="legend-copy-action text-btn" onclick={copySetCSS}> Copy Hex Values </button>
                </span>
            </legend>

            <ul class="color-list" {id}>
                <!-- Manual lazy loading removed to fix Cumulative Layout Shift (CLS) -->
                <!-- Browser rendering for this amount of data is performant enough -->
                {#each finalData as color (color.name)}
                    <ColorItem {color} useNameForBg={useNameAsBg} {onCopy} />
                {/each}
            </ul>
        </fieldset>
    </div>
{/if}

<style>
    .page-container {
        max-width: 1280px;
        margin: 0 auto 20px;
        padding: 10px 20px 20px;
        background-color: var(--page-bg-color);
        border-radius: 4px;
        box-shadow: 0 4px 12px var(--page-shadow-color);
        transition: background-color 0.3s;
    }

    fieldset {
        border: 1px solid var(--fieldset-border-color);
        border-radius: 4px;
        padding: 15px;
        margin: 0;
    }

    legend {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--legend-text-color);
        padding: 0 10px;
        margin-left: 5px;
        display: flex;
        align-items: center;
    }

    .legend-actions {
        font-size: 0.8em;
        font-weight: normal;
        margin-left: 15px;
        color: var(--select-focus-border-color);
        white-space: nowrap;
    }

    .legend-copy-action {
        transition:
            color 0.2s,
            transform 0.2s ease-in-out;
        display: inline-block;
    }

    .legend-copy-action:hover {
        text-decoration: underline;
        color: var(--header-color);
        transform: scale(1.05);
    }

    .color-list {
        list-style: none;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
        grid-auto-rows: max-content;
        gap: 15px;
        /* min-height removed to allow container to shrink to a single row */
        align-content: start;
    }
</style>
