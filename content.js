// X Theme Customizer - Content Script
// Injects custom background color controls into X.com display settings
// AND applies background colors to all X.com pages

(function () {
    'use strict';

    console.log('[X Theme Customizer] Extension loaded');

    // Configuration
    const CONFIG = {
        storageKey: 'xThemeCustomizer',
        cssVarName: '--color-background',
        defaultColors: {
            dark: '0 0% 0%',
            light: '0 0% 100%',
            dim: '210 34% 13%'
        }
    };

    // Storage helper
    const storage = {
        async get() {
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
        },
        async set(data) {
            return new Promise(resolve => {
                chrome.storage.local.set({ [CONFIG.storageKey]: data }, resolve);
            });
        }
    };

    // Color conversion utilities
    const colorUtils = {
        hexToHSL(hex) {
            // Convert hex to RGB
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
        },

        hslToString(h, s, l) {
            return `${h} ${s}% ${l}%`;
        },

        adjustLightness(hex, lightness) {
            const hsl = this.hexToHSL(hex);
            return this.hslToString(hsl.h, hsl.s, lightness);
        }
    };

    // Get current theme
    function getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    // Apply custom background color and lightness using CSS overrides (safe approach)
    function applyBackgroundColor(lightnessValue, customColor = null) {
        const currentTheme = getCurrentTheme();

        let targetRGB;
        let hslString;

        if (customColor) {
            // Use custom color from color picker
            const rgb = hexToRgb(customColor);
            // Override lightness while preserving the custom color's hue/saturation
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            targetRGB = hslToRgb(hsl.h, hsl.s, lightnessValue);
            hslString = `${hsl.h} ${hsl.s}% ${lightnessValue}%`;
        } else {
            // Get the base hue/saturation for each theme
            const themeDefaults = {
                dark: { h: 0, s: 0 },      // Pure black/white
                light: { h: 0, s: 0 },     // Pure black/white
                dim: { h: 210, s: 34 }     // Blue-ish
            };
            const baseColor = themeDefaults[currentTheme] || themeDefaults.dark;
            targetRGB = hslToRgb(baseColor.h, baseColor.s, lightnessValue);
            hslString = `${baseColor.h} ${baseColor.s}% ${lightnessValue}%`;
        }

        const rgbString = `rgb(${targetRGB.r}, ${targetRGB.g}, ${targetRGB.b})`;

        // Create/update our override stylesheet (safer than modifying React's stylesheet)
        let styleEl = document.getElementById('x-theme-customizer-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'x-theme-customizer-styles';
            document.head.appendChild(styleEl);
        }

        // Override body and .r-kemksi backgrounds with !important
        const cssContent = `
      /* CSS Variables */
      :root[data-theme="${currentTheme}"] {
        --color-background: ${hslString} !important;
        --background: ${hslString} !important;
      }
      
      /* Direct overrides */
      body {
        background-color: ${rgbString} !important;
      }
      
      .r-kemksi {
        background-color: ${rgbString} !important;
      }
    `;

        styleEl.textContent = cssContent;
        console.log(`[X Theme Customizer] Applied theme: ${rgbString}`);
    }


    // Helper: Convert HSL to RGB object
    function hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;

        let r = 0, g = 0, b = 0;
        if (h >= 0 && h < 60) {
            r = c; g = x; b = 0;
        } else if (h >= 60 && h < 120) {
            r = x; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0; g = c; b = x;
        } else if (h >= 180 && h < 240) {
            r = 0; g = x; b = c;
        } else if (h >= 240 && h < 300) {
            r = x; g = 0; b = c;
        } else if (h >= 300 && h < 360) {
            r = c; g = 0; b = x;
        }

        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    // Helper: Convert hex to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    // Helper: Convert RGB to HSL
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
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


    // Remove custom styles
    function removeCustomStyles() {
        const styleEl = document.getElementById('x-theme-customizer-styles');
        if (styleEl) {
            styleEl.remove();
        }
    }

    // Listen for storage changes to update theme live (preserves scroll position!)
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes.xThemeCustomizer) {
            const newSettings = changes.xThemeCustomizer.newValue;
            if (newSettings && newSettings.enabled) {
                // Pass both lightness and custom color
                applyBackgroundColor(newSettings.lightnessValue, newSettings.customBackgroundColor);
            } else {
                removeCustomStyles();
            }
        }
    });

    // Inject UI controls
    function injectControls() {
        // Wait for the background section to load
        const checkInterval = setInterval(() => {
            // Look for the Background heading
            const headings = document.querySelectorAll('[dir] h2, [dir] div');
            let backgroundSection = null;

            for (const heading of headings) {
                if (heading.textContent && heading.textContent.trim() === 'Background') {
                    backgroundSection = heading.parentElement;
                    break;
                }
            }

            if (!backgroundSection || document.getElementById('x-theme-customizer-container')) {
                return;
            }

            clearInterval(checkInterval);

            // Create custom controls container
            const container = document.createElement('div');
            container.id = 'x-theme-customizer-container';
            container.className = 'x-theme-customizer';

            container.innerHTML = `
        <div class="x-theme-header">
          <h3 class="x-theme-title">Custom Background Color</h3>
          <label class="x-theme-toggle">
            <input type="checkbox" id="x-theme-enable">
            <span>Enable Custom Color</span>
          </label>
        </div>
        <div class="x-theme-controls" style="display: none;">
          <div class="x-theme-control-group">
            <label class="x-theme-label">
              <span>Lightness</span>
              <span class="x-theme-value" id="x-lightness-value">0</span>
            </label>
            <input type="range" id="x-lightness-slider" min="0" max="100" value="0" class="x-theme-slider">
          </div>
          <div class="x-theme-control-group">
            <label class="x-theme-label">
              <span>Custom Color</span>
              <span class="x-theme-color-preview" id="x-color-preview" style="background: #000000;"></span>
            </label>
            <input type="color" id="x-color-picker" value="#000000" class="x-theme-color-picker">
          </div>
          <button id="x-theme-reset" class="x-theme-reset-btn">Reset to Default</button>
        </div>
      `;

            // Insert after the Background section
            backgroundSection.appendChild(container);

            // Set up event listeners
            setupEventListeners();

            // Load saved settings
            loadSettings();

            console.log('[X Theme Customizer] Controls injected');
        }, 500);

        // Clear interval after 10 seconds if not found
        setTimeout(() => clearInterval(checkInterval), 10000);
    }

    // Setup event listeners
    function setupEventListeners() {
        const enableCheck = document.getElementById('x-theme-enable');
        const lightnessSlider = document.getElementById('x-lightness-slider');
        const colorPicker = document.getElementById('x-color-picker');
        const resetBtn = document.getElementById('x-theme-reset');
        const controls = document.querySelector('.x-theme-controls');

        if (!enableCheck) return;

        // Enable/disable custom theme
        enableCheck.addEventListener('change', async (e) => {
            const enabled = e.target.checked;
            controls.style.display = enabled ? 'block' : 'none';

            const settings = await storage.get();
            settings.enabled = enabled;
            settings.timestamp = Date.now();
            await storage.set(settings);

            if (enabled) {
                applySettings(settings);
            } else {
                removeCustomStyles();
            }
        });

        // Lightness slider
        lightnessSlider.addEventListener('input', async (e) => {
            const lightness = parseInt(e.target.value);
            document.getElementById('x-lightness-value').textContent = lightness;

            const settings = await storage.get();
            settings.lightnessValue = lightness;
            settings.timestamp = Date.now();
            await storage.set(settings);

            if (settings.enabled) {
                applySettings(settings);
            }
        });

        // Color picker
        colorPicker.addEventListener('input', async (e) => {
            const color = e.target.value;
            document.getElementById('x-color-preview').style.background = color;

            const settings = await storage.get();
            settings.customBackgroundColor = color;
            settings.lightnessValue = colorUtils.hexToHSL(color).l;
            lightnessSlider.value = settings.lightnessValue;
            document.getElementById('x-lightness-value').textContent = settings.lightnessValue;
            settings.timestamp = Date.now();
            await storage.set(settings);

            if (settings.enabled) {
                applySettings(settings);
            }
        });

        // Reset button
        resetBtn.addEventListener('click', async () => {
            const theme = getCurrentTheme();
            const defaultColor = theme === 'light' ? '#FFFFFF' : (theme === 'dim' ? '#15202B' : '#000000');
            const lightness = theme === 'light' ? 100 : (theme === 'dim' ? 13 : 0);

            colorPicker.value = defaultColor;
            lightnessSlider.value = lightness;
            document.getElementById('x-lightness-value').textContent = lightness;
            document.getElementById('x-color-preview').style.background = defaultColor;

            const settings = await storage.get();
            settings.customBackgroundColor = defaultColor;
            settings.lightnessValue = lightness;
            settings.appliedTheme = theme;
            settings.timestamp = Date.now();
            await storage.set(settings);

            if (settings.enabled) {
                applySettings(settings);
            }
        });
    }

    // Apply settings
    function applySettings(settings) {
        if (!settings.enabled) {
            removeCustomStyles();
            return;
        }

        // Pass both lightness and custom color
        applyBackgroundColor(settings.lightnessValue, settings.customBackgroundColor);
    }

    // Load saved settings
    async function loadSettings() {
        const settings = await storage.get();
        const enableCheck = document.getElementById('x-theme-enable');
        const lightnessSlider = document.getElementById('x-lightness-slider');
        const colorPicker = document.getElementById('x-color-picker');
        const controls = document.querySelector('.x-theme-controls');

        if (!enableCheck) return;

        enableCheck.checked = settings.enabled;
        controls.style.display = settings.enabled ? 'block' : 'none';
        lightnessSlider.value = settings.lightnessValue;
        document.getElementById('x-lightness-value').textContent = settings.lightnessValue;
        colorPicker.value = settings.customBackgroundColor;
        document.getElementById('x-color-preview').style.background = settings.customBackgroundColor;

        if (settings.enabled) {
            applySettings(settings);
        }
    }

    // Initialize
    function init() {
        // Check if we're on the settings page
        if (window.location.href.includes('/settings/display')) {
            injectControls();
        }

        // Also apply saved settings on any X.com page
        storage.get().then(settings => {
            if (settings.enabled) {
                applySettings(settings);
            }
        });
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
