document.addEventListener('DOMContentLoaded', () => {
    if (typeof GoatColor === 'undefined') {
        console.error("GoatColorToolbox.js not loaded!");
        alert("Error: GoatColorToolbox.js library not found. Please ensure it's in the same directory.");
        return;
    }

    // --- DOM ELEMENT REFERENCES ---
    const copyNotificationElement = document.getElementById('copyNotification');
    const sortOrderSelect = document.getElementById('sortOrder');
    const themeSelector = document.getElementById('themeSelector');
    let notificationTimeout;

    // --- COLOR SET DEFINITIONS ---
    const powershellColors = { 'Black': '#000000', 'DarkBlue': '#000080', 'DarkGreen': '#008000', 'DarkCyan': '#008080', 'DarkRed': '#800000', 'DarkMagenta': '#800080', 'DarkYellow': '#808000', 'Gray': '#c0c0c0', 'DarkGray': '#808080', 'Blue': '#0000ff', 'Green': '#00ff00', 'Cyan': '#00ffff', 'Red': '#ff0000', 'Magenta': '#ff00ff', 'Yellow': '#ffff00', 'White': '#ffffff' };
    const tailwindColors = { 'slate': '#64748b', 'gray': '#6b7280', 'zinc': '#71717a', 'neutral': '#737373', 'stone': '#78716c', 'red': '#ef4444', 'orange': '#f97316', 'amber': '#f59e0b', 'yellow': '#eab308', 'lime': '#84cc16', 'green': '#22c55e', 'emerald': '#10b981', 'teal': '#14b8a6', 'cyan': '#06b6d4', 'sky': '#0ea5e9', 'blue': '#3b82f6', 'indigo': '#6366f1', 'violet': '#8b5cf6', 'purple': '#a855f7', 'fuchsia': '#d946ef', 'pink': '#ec4899', 'rose': '#f43f5e' };
    const tableau20Colors = { 'Blue': '#1f77b4', 'Orange': '#ff7f0e', 'Green': '#2ca02c', 'Red': '#d62728', 'Purple': '#9467bd', 'Brown': '#8c564b', 'Pink': '#e377c2', 'Gray': '#7f7f7f', 'Olive': '#bcbd22', 'Cyan': '#17becf', 'Light Blue': '#aec7e8', 'Light Orange': '#ffbb78', 'Light Green': '#98df8a', 'Light Red': '#ff9896', 'Light Purple': '#c5b0d5', 'Light Brown': '#c49c94', 'Light Pink': '#f7b6d2', 'Light Gray': '#c7c7c7', 'Light Olive': '#dbdb8d', 'Light Cyan': '#9edae5' };
    const resistorColors = { 'Black': '#000000', 'Brown': '#a52a2a', 'Red': '#ff0000', 'Orange': '#ffa500', 'Yellow': '#ffff00', 'Green': '#008000', 'Blue': '#0000ff', 'Violet': '#ee82ee', 'Gray': '#808080', 'White': '#ffffff', 'Gold': '#ffd700', 'Silver': '#c0c0c0' };

    function generateXtermColors() {
        const colors = {};
        const toHex = (n) => n.toString(16).padStart(2, '0');

        // Part 1: The 16 base ANSI colors (provided separately)
        const first16 = { 'color0': '#000000', 'color1': '#800000', 'color2': '#008000', 'color3': '#808000', 'color4': '#000080', 'color5': '#800080', 'color6': '#008080', 'color7': '#c0c0c0', 'color8': '#808080', 'color9': '#ff0000', 'color10': '#00ff00', 'color11': '#ffff00', 'color12': '#0000ff', 'color13': '#ff00ff', 'color14': '#00ffff', 'color15': '#ffffff' };

        // Part 2: The 6x6x6 color cube (216 colors)
        const levels = [0, 95, 135, 175, 215, 255];
        let i = 16;
        for (let r = 0; r < 6; r++) { for (let g = 0; g < 6; g++) { for (let b = 0; b < 6; b++) { colors[`color${i}`] = `#${toHex(levels[r])}${toHex(levels[g])}${toHex(levels[b])}`; i++; } } }

        // Part 3: The 24-step grayscale ramp
        for (let j = 0; j < 24; j++) { const gray = 8 + j * 10; colors[`color${i}`] = `#${toHex(gray)}${toHex(gray)}${toHex(gray)}`; i++; }

        return { ...first16, ...colors };
    }
    const xtermColors = generateXtermColors();

    const svgIconMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    const allColorData = {};

    // --- THEME LOGIC ---
    const applyTheme = (theme) => {
        if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
        else if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        else document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', theme);
        themeSelector.value = theme;
    };

    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'system';
        applyTheme(savedTheme);
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (themeSelector.value === 'system') applyTheme('system');
        });
    };

    // --- UI FEEDBACK & INTERACTION ---
    const showNotification = (message, isSuccess, event) => {
        copyNotificationElement.textContent = message;
        copyNotificationElement.style.top = `${event.clientY}px`;
        copyNotificationElement.style.left = `${event.clientX}px`;
        copyNotificationElement.style.backgroundColor = isSuccess ? '' : 'var(--notification-fail-bg-color, #E53935)';
        copyNotificationElement.classList.remove('hide');
        copyNotificationElement.classList.add('show');
        clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(() => {
            copyNotificationElement.classList.remove('show');
            copyNotificationElement.classList.add('hide');
        }, isSuccess ? 1500 : 2000);
    };

    async function handleLegendCopyClick(actionElement, mouseEvent) {
        const target = actionElement;
        const copyType = target.dataset.copyType;
        const listId = target.dataset.listId;
        const colorData = allColorData[listId];
        if (!colorData) return;

        let textToCopy = '';
        let successMessage = '';

        if (copyType === 'names') {
            textToCopy = colorData.map(c => c.name).join('\n');
            successMessage = `Copied ${colorData.length} names!`;
        } else if (copyType === 'hex') {
            const legend = document.getElementById(listId).closest('fieldset').querySelector('legend');
            const legendText = legend.firstChild.textContent.trim();
            const themeName = legendText.toLowerCase().replace(/[\s/()]+/g, '-').replace(/-$/, '').replace(/--/g, '-');
            const properties = colorData.map(c => `    --${c.name.toLowerCase().replace(/[\s/]+/g, '-')}: ${c.instance.toHex()};`).join('\n');
            textToCopy = `[data-theme="${themeName}"] {\n${properties}\n}`;
            successMessage = 'Copied as CSS theme block!';
        }

        if (textToCopy) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                showNotification(successMessage, true, mouseEvent);
            } catch (err) {
                console.error('Failed to copy legend data: ', err);
                showNotification('Copy failed!', false, mouseEvent);
            }
        }
    }

    // --- COLOR PROCESSING & RENDERING ---
    function processColorSet(colorObject, nameIsColor = false) {
        return Object.entries(colorObject).map(([name, value]) => {
            const instance = GoatColor(nameIsColor ? name : value);
            let hsl = { h: 0, s: 0, l: 0 }, luminance = 0, effectiveSortHue = -1;
            if (instance.isValid()) {
                hsl = instance.toHsl();
                luminance = instance.getRelativeLuminance();
                if (hsl.s > 0) effectiveSortHue = isNaN(hsl.h) ? 0 : hsl.h;
            }
            return { name, instance, hue: effectiveSortHue, saturation: hsl.s, lightness: hsl.l, luminance, effectiveHue: effectiveSortHue };
        });
    }

    function isColorLight(colorInstance) {
        if (!colorInstance?.isValid()) return true;
        return colorInstance.getRelativeLuminance() > 0.5;
    }

    function renderColorList(targetElement, colorsToRender, useNameForBg) {
        if (!targetElement) return;
        targetElement.innerHTML = '';
        const fragment = document.createDocumentFragment();
        colorsToRender.forEach(colorData => {
            const { name, instance } = colorData;
            const hexValue = instance.toHex();
            const listItem = document.createElement('li');

            listItem.className = 'color-item';
            listItem.style.backgroundColor = useNameForBg ? name : hexValue;
            listItem.classList.toggle('light-bg', isColorLight(instance));
            listItem.classList.toggle('dark-bg', !isColorLight(instance));
            listItem.innerHTML = `<div class="color-info"><span class="color-name color-swatch-action">${name}</span></div><div class="color-copy-group color-swatch-action"><span class="color-hex">${hexValue}</span>${svgIconMarkup}</div>`;
            fragment.appendChild(listItem);
        });
        targetElement.appendChild(fragment);
    }

    const sortFunctions = {
        name: (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }),
        luminosity: (a, b) => b.luminance - a.luminance,
        hue: (a, b) => {
            if (a.effectiveHue === -1 && b.effectiveHue === -1) return a.lightness - b.lightness;
            if (a.effectiveHue === -1) return 1;
            if (b.effectiveHue === -1) return -1;
            if (a.hue !== b.hue) return a.hue - b.hue;
            if (a.lightness !== b.lightness) return a.lightness - b.lightness;
            return a.saturation - b.saturation;
        }
    };

    function sortAndRenderList(listId, sortBy) {
        const colorArray = allColorData[listId];
        if (!colorArray) return;

        const element = document.getElementById(listId);
        const useNameForBg = (listId === 'colorList');

        if (element) {
            colorArray.sort(sortFunctions[sortBy]);
            renderColorList(element, colorArray, useNameForBg);
        }
    }

    function sortAndRenderAllLists() {
        const sortBy = sortOrderSelect.value;
        for (const listId in allColorData) {
            // Only sort and render lists that have already been processed
            if (allColorData[listId]) {
                sortAndRenderList(listId, sortBy);
            }
        }
    }

    function setupLegendActions() {
        document.querySelectorAll('fieldset legend').forEach(legend => {
            const listId = legend.parentElement.querySelector('.color-list')?.id;
            if (!listId) return;
            const actionsWrapper = document.createElement('span');
            actionsWrapper.className = 'legend-actions';
            actionsWrapper.innerHTML = `| <span class="legend-copy-action" data-copy-type="names" data-list-id="${listId}">Copy Names</span> | <span class="legend-copy-action" data-copy-type="hex" data-list-id="${listId}">Copy Hex Values</span>`;
            legend.appendChild(actionsWrapper);
        });
    }

    // --- INITIALIZATION ---
    const allColorSets = {
        colorList: { data: GoatColor.cssNamedColors, useNameAsBg: true },
        powershellColorList: { data: powershellColors },
        tailwindColorList: { data: tailwindColors },
        tableauColorList: { data: tableau20Colors },
        resistorColorList: { data: resistorColors },
        xtermColorList: { data: xtermColors }
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const listElement = entry.target;
                const listId = listElement.id;

                // Process this list only if it hasn't been processed yet
                if (!allColorData[listId]) {
                    const config = allColorSets[listId];
                    allColorData[listId] = processColorSet(config.data, config.useNameAsBg);
                    sortAndRenderList(listId, sortOrderSelect.value);
                }
                obs.unobserve(listElement); // Important: stop observing once it's loaded
            }
        });
    }, { rootMargin: "200px" }); // Start loading when a list is 200px from the viewport

    document.querySelectorAll('.color-list').forEach(list => observer.observe(list));

    initTheme();
    setupLegendActions();

    sortOrderSelect.addEventListener('change', sortAndRenderAllLists);
    themeSelector.addEventListener('change', () => applyTheme(themeSelector.value));

    document.body.addEventListener('click', (event) => {
        const target = event.target;
        const legendAction = target.closest('.legend-copy-action');
        const colorItem = target.closest('.color-item');

        if (legendAction) {
            handleLegendCopyClick(legendAction, event);
            return;
        }

        if (colorItem) {
            let textToCopy;
            let copyMessage;

            // If a specific action area is clicked, copy its content.
            const nameAction = target.closest('.color-name');
            const hexAction = target.closest('.color-copy-group');

            if (nameAction) {
                textToCopy = nameAction.textContent;
                copyMessage = `Copied "${textToCopy}"!`;
            } else if (hexAction) {
                const hexSpan = hexAction.querySelector('.color-hex');
                textToCopy = hexSpan.textContent;
                copyMessage = `Copied ${textToCopy}!`;
            } else {
                // Fallback for clicking the item background itself, default to hex.
                const hexSpan = colorItem.querySelector('.color-hex');
                if (hexSpan) {
                    textToCopy = hexSpan.textContent;
                    copyMessage = `Copied ${textToCopy}!`;
                }
            }

            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showNotification(copyMessage, true, event);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    showNotification('Copy failed!', false, event);
                });
            }
        }
    });
});