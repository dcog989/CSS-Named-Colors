document.addEventListener('DOMContentLoaded', () => {
    if (typeof GoatColor === 'undefined') {
        console.error("GoatColorToolbox.js not loaded!");
        alert("Error: GoatColorToolbox.js library not found. Please ensure it's in the same directory.");
        return;
    }

    const colorListElement = document.getElementById('colorList');
    const copyNotificationElement = document.getElementById('copyNotification');
    const sortOrderSelect = document.getElementById('sortOrder');
    const themeSelector = document.getElementById('themeSelector');
    let notificationTimeout;
    let processedColors = [];

    const svgIconMarkup = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>`;

    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', theme);
        themeSelector.value = theme;
    };

    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'system';
        applyTheme(savedTheme);

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (themeSelector.value === 'system') {
                applyTheme('system');
            }
        });
    };

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

    const handleListClick = (event) => {
        const target = event.target;
        if (target.matches('.color-name') || target.matches('.color-hex')) {
            const textToCopy = target.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showNotification(`Copied "${textToCopy}"!`, true, event);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showNotification('Copy failed!', false, event);
            });
        }
    };


    function isColorLight(colorInstance) {
        if (!colorInstance || !colorInstance.isValid()) {
            console.warn(`Invalid color instance passed to isColorLight. Defaulting to light.`);
            return true;
        }
        return colorInstance.getRelativeLuminance() > 0.5;
    }

    function renderColorList(colorsToRender) {
        colorListElement.innerHTML = '';
        const fragment = document.createDocumentFragment();

        colorsToRender.forEach(colorData => {
            const { name, instance } = colorData;
            const hexValue = instance.toHex();

            const listItem = document.createElement('li');
            listItem.className = 'color-item';
            listItem.style.backgroundColor = name;
            listItem.classList.toggle('light-bg', isColorLight(instance));
            listItem.classList.toggle('dark-bg', !isColorLight(instance));

            const infoDiv = document.createElement('div');
            infoDiv.className = 'color-info';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'color-name';
            nameSpan.textContent = name;

            const hexSpan = document.createElement('span');
            hexSpan.className = 'color-hex';
            hexSpan.textContent = hexValue;

            infoDiv.appendChild(nameSpan);
            infoDiv.appendChild(hexSpan);
            listItem.appendChild(infoDiv);
            listItem.insertAdjacentHTML('beforeend', svgIconMarkup);

            fragment.appendChild(listItem);
        });
        colorListElement.appendChild(fragment);
    }

    function sortAndRender() {
        const sortBy = sortOrderSelect.value;

        if (sortBy === 'name') {
            processedColors.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'hue') {
            processedColors.sort((a, b) => {
                if (a.effectiveHue === -1 && b.effectiveHue === -1) {
                    return a.lightness - b.lightness;
                }
                if (a.effectiveHue === -1) return -1;
                if (b.effectiveHue === -1) return 1;

                if (a.hue !== b.hue) {
                    return a.hue - b.hue;
                }
                if (a.lightness !== b.lightness) {
                    return a.lightness - b.lightness;
                }
                return a.saturation - b.saturation;
            });
        } else if (sortBy === 'luminosity') {
            processedColors.sort((a, b) => b.luminance - a.luminance);
        }
        renderColorList(processedColors);
    }

    processedColors = Object.keys(GoatColor.cssNamedColors).map(name => {
        const instance = GoatColor(name);
        let hsl = { h: 0, s: 0, l: 0 };
        let luminance = 0;
        let effectiveSortHue = -1;

        if (instance.isValid()) {
            hsl = instance.toHsl();
            luminance = instance.getRelativeLuminance();
            if (hsl.s > 0) {
                effectiveSortHue = isNaN(hsl.h) ? 0 : hsl.h;
            }
        }

        return {
            name: name,
            instance: instance,
            hue: effectiveSortHue,
            saturation: hsl.s,
            lightness: hsl.l,
            luminance: luminance,
            effectiveHue: effectiveSortHue
        };
    });

    sortOrderSelect.addEventListener('change', sortAndRender);
    themeSelector.addEventListener('change', () => applyTheme(themeSelector.value));
    colorListElement.addEventListener('click', handleListClick);

    initTheme();
    sortAndRender();
});