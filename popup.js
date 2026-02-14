// X Theme Customizer - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
    const CONFIG = {
        storageKey: 'xThemeCustomizer'
    };

    const extensionToggle = document.getElementById('extensionEnabled');
    const statusText = document.getElementById('statusText');
    const themeText = document.getElementById('themeText');
    const openSettingsBtn = document.getElementById('openSettings');
    const colorControls = document.getElementById('colorControls');
    const lightnessSlider = document.getElementById('lightnessSlider');
    const lightnessValue = document.getElementById('lightnessValue');
    const colorPicker = document.getElementById('colorPicker');
    const colorPreview = document.getElementById('colorPreview');
    const resetButton = document.getElementById('resetButton');

    // Color conversion utilities
    const colorUtils = {
        hexToHSL(hex) {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                    case g: h = ((b - r) / d + 2) / 6; break;
                    case b: h = ((r - g) / d + 4) / 6; break;
                }
            }

            return {
                h: Math.round(h * 360),
                s: Math.round(s * 100),
                l: Math.round(l * 100)
            };
        }
    };

    // Load current settings
    async function loadSettings() {
        return new Promise(resolve => {
            chrome.storage.local.get([CONFIG.storageKey], result => {
                resolve(result[CONFIG.storageKey] || {
                    enabled: false,
                    customBackgroundColor: '#000000',
                    lightnessValue: 0,
                    appliedTheme: 'dark',
                    timestamp: Date.now()
                });
            });
        });
    }

    // Save settings
    async function saveSettings(data) {
        return new Promise(resolve => {
            chrome.storage.local.set({ [CONFIG.storageKey]: data }, resolve);
        });
    }

    // Update UI
    function updateUI(settings) {
        extensionToggle.checked = settings.enabled;
        statusText.textContent = settings.enabled ? 'Enabled' : 'Disabled';
        statusText.style.color = settings.enabled ? '#00ba7c' : '#8b98a5';
        themeText.textContent = settings.appliedTheme ?
            settings.appliedTheme.charAt(0).toUpperCase() + settings.appliedTheme.slice(1) :
            'N/A';

        // Show/hide color controls
        colorControls.style.display = settings.enabled ? 'block' : 'none';

        // Update control values
        if (lightnessSlider) {
            lightnessSlider.value = settings.lightnessValue;
            lightnessValue.textContent = settings.lightnessValue;
        }
        if (colorPicker) {
            colorPicker.value = settings.customBackgroundColor;
            colorPreview.style.background = settings.customBackgroundColor;
        }
    }

    // Initialize
    const settings = await loadSettings();
    updateUI(settings);

    // Toggle extension
    extensionToggle.addEventListener('change', async (e) => {
        settings.enabled = e.target.checked;
        settings.timestamp = Date.now();
        await saveSettings(settings);
        updateUI(settings);
        // No reload - storage listener will update automatically
    });

    // Debounce helper
    function debounce(fn, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // Debounced save - storage listener will auto-update theme
    const debouncedSave = debounce(() => saveSettings(settings), 150);

    // Lightness slider
    lightnessSlider.addEventListener('input', (e) => {
        const lightness = parseInt(e.target.value);
        lightnessValue.textContent = lightness;

        settings.lightnessValue = lightness;
        settings.timestamp = Date.now();

        // Debounced save - storage listener will update automatically
        debouncedSave();
    });

    // Color picker
    colorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        colorPreview.style.background = color;

        settings.customBackgroundColor = color;
        settings.lightnessValue = colorUtils.hexToHSL(color).l;
        lightnessSlider.value = settings.lightnessValue;
        lightnessValue.textContent = settings.lightnessValue;
        settings.timestamp = Date.now();

        // Debounced save - storage listener will update automatically
        debouncedSave();
    });

    // Reset button
    resetButton.addEventListener('click', async () => {
        const theme = settings.appliedTheme || 'dark';
        const defaultColor = theme === 'light' ? '#FFFFFF' : (theme === 'dim' ? '#15202B' : '#000000');
        const lightness = theme === 'light' ? 100 : (theme === 'dim' ? 13 : 0);

        colorPicker.value = defaultColor;
        lightnessSlider.value = lightness;
        lightnessValue.textContent = lightness;
        colorPreview.style.background = defaultColor;

        settings.customBackgroundColor = defaultColor;
        settings.lightnessValue = lightness;
        settings.timestamp = Date.now();
        await saveSettings(settings);
        // Storage listener handles the update
    });

    // Open settings page
    openSettingsBtn.addEventListener('click', () => {
        chrome.tabs.query({ url: ['https://x.com/settings/display', 'https://twitter.com/settings/display'] }, tabs => {
            if (tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { active: true });
                chrome.windows.update(tabs[0].windowId, { focused: true });
            } else {
                chrome.tabs.create({ url: 'https://x.com/settings/display' });
            }
            window.close();
        });
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes[CONFIG.storageKey]) {
            updateUI(changes[CONFIG.storageKey].newValue);
        }
    });
});
