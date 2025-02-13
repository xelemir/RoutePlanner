function makeMap(theme) {
    if (map.isStyleLoaded()) {
        map.setConfigProperty('basemap', 'lightPreset', theme);
    } else {
        map.on('style.load', () => {
            map.setConfigProperty('basemap', 'lightPreset', theme);
        });
        // For whatever reason, the style.load event sometimes doesn't fire
        // That's why we also listen for the load event
        map.on('load', () => {
            map.setConfigProperty('basemap', 'lightPreset', theme);
        });
    }
}

function detectDarkMode() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        makeMap('night');
        localStorage.setItem('darkMode', 'true');
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        makeMap('day');
        localStorage.setItem('darkMode', 'false');
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    detectDarkMode();
});

window.onload = () => {
    detectDarkMode();
};