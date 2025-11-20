<script lang="ts">
    import ColorItem from "./ColorItem.svelte";
    import { processColorSet } from "./data/colorSets";

    let { title, id, rawData, useNameAsBg, sortOrder, onCopy } = $props<{
        title: string;
        id: string;
        rawData: Record<string, string>;
        useNameAsBg: boolean;
        sortOrder: string;
        onCopy: (text: string, success: boolean, message: string, x: number, y: number) => void;
    }>();

    let processedData = processColorSet(rawData, useNameAsBg);
    let isVisible = $state(false);

    // Sort Logic
    let sortedData = $derived.by(() => {
        if (!processedData) return [];
        const data = [...processedData];
        data.sort((a, b) => {
            if (sortOrder === "luminosity") return b.luminance - a.luminance;
            if (sortOrder === "hue") {
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

    function handleIntersect(node: HTMLElement) {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    isVisible = true;
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" }
        );

        observer.observe(node);
        return {
            destroy() {
                observer.disconnect();
            },
        };
    }

    function copySetNames(e: MouseEvent) {
        const text = sortedData.map((c) => c.name).join("\n");
        onCopy(text, true, `Copied ${sortedData.length} names!`, e.clientX, e.clientY);
    }

    function copySetCSS(e: MouseEvent) {
        const themeName = title
            .toLowerCase()
            .replace(/[\s/()]+/g, "-")
            .replace(/-$/, "")
            .replace(/--/g, "-");
        const properties = sortedData.map((c) => `    --${c.name.toLowerCase().replace(/[\s/]+/g, "-")}: ${c.instance.toHex()};`).join("\n");
        const text = `[data-theme="${themeName}"] {\n${properties}\n}`;
        onCopy(text, true, "Copied as CSS theme block!", e.clientX, e.clientY);
    }
</script>

<div class="page-container">
    <fieldset>
        <legend>
            {title}
            <span class="legend-actions">
                |
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <span class="legend-copy-action" onclick={copySetNames}> Copy Names </span>
                |
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <span class="legend-copy-action" onclick={copySetCSS}> Copy Hex Values </span>
            </span>
        </legend>

        <ul class="color-list" {id} use:handleIntersect>
            {#if isVisible}
                {#each sortedData as color (color.name)}
                    <ColorItem {color} useNameForBg={useNameAsBg} {onCopy} />
                {/each}
            {:else}
                <li style="height: 50px;">Loading...</li>
            {/if}
        </ul>
    </fieldset>
</div>

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
        cursor: pointer;
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
        gap: 15px;
        min-height: 100px;
    }
</style>
