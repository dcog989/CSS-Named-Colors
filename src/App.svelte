<script lang="ts">
    import { onMount } from "svelte";
    import ColorSet from "./lib/ColorSet.svelte";
    import Toast from "./lib/Toast.svelte";
    import { ALL_SETS } from "./lib/data/colorSets";

    let sortOrder = $state("name");
    let theme = $state("system");

    // Toast State
    let toastMessage = $state("");
    let toastVisible = $state(false);
    let toastSuccess = $state(true);
    let toastX = $state(0);
    let toastY = $state(0);
    let toastTimeout: ReturnType<typeof setTimeout>;

    function updateTheme(newTheme: string) {
        theme = newTheme;
        localStorage.setItem("theme", newTheme);

        if (newTheme === "light") document.documentElement.setAttribute("data-theme", "light");
        else if (newTheme === "dark") document.documentElement.setAttribute("data-theme", "dark");
        else document.documentElement.removeAttribute("data-theme");
    }

    onMount(() => {
        const savedTheme = localStorage.getItem("theme") || "system";
        updateTheme(savedTheme);

        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
            if (theme === "system") updateTheme("system");
        });
    });

    function handleCopy(text: string, success: boolean, message: string, x: number, y: number) {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                toastMessage = message;
                toastSuccess = true;
                showToast(x, y);
            })
            .catch((err) => {
                console.error(err);
                toastMessage = "Copy failed!";
                toastSuccess = false;
                showToast(x, y);
            });
    }

    function showToast(x: number, y: number) {
        toastX = x;
        toastY = y;
        toastVisible = true;
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(
            () => {
                toastVisible = false;
            },
            toastSuccess ? 1500 : 2000
        );
    }
</script>

<header>
    <h1>Color Sets</h1>
    <div class="controls-container">
        <label for="sortOrder">Sort all by:</label>
        <select id="sortOrder" bind:value={sortOrder}>
            <option value="name">Name</option>
            <option value="hue">Hue</option>
            <option value="luminosity">Luminosity</option>
        </select>
        <label for="themeSelector">Theme:</label>
        <select id="themeSelector" value={theme} onchange={(e) => updateTheme(e.currentTarget.value)}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </div>
</header>

<main>
    {#each ALL_SETS as set (set.id)}
        <ColorSet title={set.title} id={set.id} rawData={set.data} useNameAsBg={set.useNameAsBg} {sortOrder} onCopy={handleCopy} />
    {/each}
</main>

<Toast message={toastMessage} visible={toastVisible} success={toastSuccess} x={toastX} y={toastY} />

<style>
    header {
        align-items: center;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        margin: 10px auto 30px;
        max-width: 1280px;
        position: sticky;
        top: 0;
        z-index: 1000;
        background-color: var(--header-bg-color);
        padding: 10px 20px;
        box-shadow: 0 4px 12px var(--page-shadow-color);
        transition: background-color 0.3s;
    }

    header h1 {
        color: var(--header-color);
        font-family: "Source Code Pro", Consolas, "Courier New", Courier, monospace;
        letter-spacing: 4px;
        margin: 0;
        font-size: 1.8em;
    }

    .controls-container {
        display: flex;
        align-items: center;
    }

    .controls-container label {
        margin-right: 10px;
        font-size: 0.9em;
    }

    .controls-container select + label {
        margin-left: 20px;
    }

    .controls-container select {
        padding: 8px 12px;
        border-radius: 4px;
        border: 1px solid var(--select-border-color);
        background-color: var(--select-bg-color);
        color: var(--select-text-color);
        font-size: 0.9em;
        cursor: pointer;
    }

    .controls-container select:focus {
        outline: none;
        border-color: var(--select-focus-border-color);
        box-shadow: 0 0 0 2px var(--select-focus-shadow-color);
    }
</style>
