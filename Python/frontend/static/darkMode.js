// Function to apply the dark mode CSS
function applyDarkModeCSS() {
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    const css = `
        .leaflet-layer,
        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out,
        .leaflet-control-attribution {
            filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
    `;
    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    style.id = 'darkModeCSS'; // Add an ID to the style element
    head.appendChild(style);
}

// Function to remove the dark mode CSS
function removeDarkModeCSS() {
    const darkModeStyle = document.getElementById('darkModeCSS');
    if (darkModeStyle) {
        darkModeStyle.remove();
    }
}

var darkModeToggle = document.getElementById('darkModeToggle');
var body = document.body;
var isDarkMode = localStorage.getItem('darkMode');

if (isDarkMode === 'true') {
    body.classList.add('dark-mode');
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeToggle.innerHTML = 'dark_mode';
    applyDarkModeCSS(); // Apply the dark mode CSS
}

darkModeToggle.addEventListener('click', function() {
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
        document.documentElement.setAttribute('data-theme', 'light');
        darkModeToggle.innerHTML = 'light_mode';
        removeDarkModeCSS(); // Remove the dark mode CSS
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.innerHTML = 'dark_mode';
        applyDarkModeCSS(); // Apply the dark mode CSS
    }
});

darkModeToggle.style.cursor = 'pointer';
