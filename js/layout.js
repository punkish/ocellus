/**
 * Layout state manager.
 *
 * Consolidates all photogrid layout logic that was previously
 * scattered across listeners.js (flipLayoutToPg, flipLayoutToDefault,
 * adjustGridSize, cycleTheme, cycleThemeAspect, toggleLayoutMenu)
 * and rendered inline inside renderPage() in renderers.js.
 *
 * This module has no imports from listeners.js or renderers.js,
 * so it introduces no new circular dependencies.
 *
 * Public API consumed by listeners.js:
 *   flipLayoutToPg, flipLayoutToDefault, fadeOutChartsContainer,
 *   adjustGridSize, cycleTheme, cycleThemeAspect, toggleLayoutMenu,
 *   resetLayoutMenuTimer, applyLayoutAfterRender
 *
 * Public constants consumed by renderers.js and querier.js:
 *   (none — class manipulation is handled entirely here)
 */

import { $, $$ }          from './base.js';
import { globals }        from './globals.js';
import { syncLayoutState } from './url-manager.js';

// ---------------------------------------------------------------------------
// Derived CSS class lists — built once from globals so the
// arrays in listeners.js / renderers.js are no longer hardcoded.
// Previously the same eight-item list appeared three times in the
// codebase; any new theme or size only needs to be added to globals.
// ---------------------------------------------------------------------------

const COLUMN_CLASSES = Object.values(globals.figureSize)
    .map(s => `columns-${s}`);

const THEME_CLASSES = globals.themes.map(t => `theme-${t}`);

// Union of all classes that must be cleared before
// applying a new layout configuration.
const ALL_LAYOUT_CLASSES = [
    'layout-pg',
    ...COLUMN_CLASSES,
    ...THEME_CLASSES
];

// Module-level handle for the layout-menu auto-close timer
let layoutMenuTimer = null;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Reads the current photogrid image size from the hidden
 * form input. Falls back to 50 (the minimum) if the element is
 * absent or its value cannot be parsed.
 * @returns {number} Image size in pixels
 */
const getCurrentImgSize = () => {
    const el = $('input[name=img]');
    return el ? (parseInt(el.value, 10) || 50) : 50;
};

/**
 * Strips all layout and theme classes from #grid-images
 * so a clean class configuration can be applied. Returns the
 * element (or null) for immediate chaining.
 * @returns {Element|null}
 */
function resetGridClasses() {
    const gridImages = $('#grid-images');

    if (gridImages) {
        gridImages.classList.remove(...ALL_LAYOUT_CLASSES);
    }

    return gridImages;
}

// ---------------------------------------------------------------------------
// Layout menu
// ---------------------------------------------------------------------------

/**
 * Resets and restarts the inactivity timer that will
 * auto-close the layout settings gear-menu. Any interactive
 * action inside the menu (size adjust, theme cycle) calls this
 * to keep the menu open while the user is still engaging with it.
 */
function resetLayoutMenuTimer() {
    clearTimeout(layoutMenuTimer);
    layoutMenuTimer = setTimeout(
        toggleLayoutMenu,
        globals.layoutMenuAutoCloseMs
    );
}

/**
 * Toggles the layout settings gear-menu open or closed.
 * The theme-aspect widget is only shown when the menu is expanded;
 * it is hidden again on collapse (or auto-close).
 */
function toggleLayoutMenu() {
    const layoutEl    = $('#layout');
    if (!layoutEl) return;

    // const aspectWidget = $('#theme-aspect-widget');
    
    const isCollapsed  = layoutEl.classList.contains('layout-collapsed');

    clearTimeout(layoutMenuTimer);

    if (isCollapsed) {
        layoutEl.classList.remove('layout-collapsed');

        // if (aspectWidget) {
        //     aspectWidget.classList.remove('noblock');
        // }

        resetLayoutMenuTimer();
    }
    else {
        layoutEl.classList.add('layout-collapsed');

        // if (aspectWidget) {
        //     aspectWidget.classList.add('noblock');
        // }
    }
}

// ---------------------------------------------------------------------------
// Charts container
// ---------------------------------------------------------------------------

/**
 * Fades out the charts container using a CSS opacity
 * transition, then sets it to display:none via the 'noblock'
 * class once the transition completes. Used when switching to
 * photogrid mode, where charts are hidden to save screen space.
 *
 * The transitionend listener is added once and self-removes to
 * avoid stacking up handlers across multiple toggle cycles.
 */
function fadeOutChartsContainer() {
    const chartsContainer = $('#charts-container');

    if (!chartsContainer) return;

    // Ensure the element is visible so the transition
    // has a visible start state
    chartsContainer.classList.remove('noblock');

    // Force a layout reflow; without this, removing
    // 'noblock' and adding 'fade-out' in the same tick can be
    // batched by the browser and the transition won't fire
    void chartsContainer.offsetWidth;
    chartsContainer.classList.add('fade-out');

    function handleTransitionEnd(e) {

        // Guard against sibling/child transitions
        // bubbling up to this listener
        if (e.propertyName === 'opacity') {
            chartsContainer.classList.add('noblock');
            chartsContainer.removeEventListener(
                'transitionend',
                handleTransitionEnd
            );
        }
    }

    chartsContainer.addEventListener(
        'transitionend',
        handleTransitionEnd
    );
}

/**
 * Hides the charts container immediately when switching
 * to photogrid layout.
 */
function fadeOutChartsContainerOrig() {
    const chartsContainer = $('#charts-container');
    if (!chartsContainer) return;

    // Hide immediately for cleaner photogrid view
    chartsContainer.classList.add('noblock');
}`fa`

// ---------------------------------------------------------------------------
// Layout flip helpers (client-side, no re-fetch)
// ---------------------------------------------------------------------------

/**
 * Applies the photogrid layout to #grid-images without
 * triggering a new server request. Sets CSS custom properties
 * for image size and column gap, adds layout-pg and the active
 * theme class, and shows the photogrid control widgets.
 * @param {number} imgSize - Image size in pixels
 */
function flipLayoutToPg(imgSize) {
    const gridImages = resetGridClasses();

    if (gridImages) {
        gridImages.style.setProperty('--image-size', `${imgSize}px`);
        gridImages.style.setProperty('--column-gap', '2px');
        gridImages.classList.add('layout-pg');
        gridImages.classList.add(`theme-${globals.results.activeTheme}`);
    }

    fadeOutChartsContainer();
    const sizeWidget = $('#gridsize-widget');

    if (sizeWidget) {
        sizeWidget.classList.remove('noblock');
    }

    const themeWidget = $('#theme-widget');

    if (themeWidget) {
        themeWidget.classList.remove('noblock');
    }

    const sizeDisplay = $('#gridsize-display');

    if (sizeDisplay) {
        sizeDisplay.innerText = `${imgSize}px`;
    }

    const layoutToggle = $('input[name=layout-toggle]');

    if (layoutToggle) {
        layoutToggle.checked = true;
    }
}

/**
 * Restores the default column-based grid layout without
 * triggering a new server request. Removes photogrid-specific
 * classes and custom properties, hides the photogrid widgets,
 * and restores chart visibility.
 */
function flipLayoutToDefault() {

    const gridImages = resetGridClasses();

    if (gridImages) {
        gridImages.style.removeProperty('--image-size');
        gridImages.style.removeProperty('--column-gap');

        // The default layout uses columns-250 (normal
        // figure size). figureSize.normal === 250.
        gridImages.classList.add('columns-250');
    }

    const chartsContainer = $('#charts-container');

    if (chartsContainer) {
        chartsContainer.classList.remove('noblock', 'fade-out');
    }

    const sizeWidget = $('#gridsize-widget');

    if (sizeWidget) {
        sizeWidget.classList.add('noblock');
    }

    const themeWidget = $('#theme-widget');

    if (themeWidget) {
        themeWidget.classList.add('noblock');
    }

    const layoutToggle = $('input[name=layout-toggle]');

    if (layoutToggle) {
        layoutToggle.checked = false;
    }
}

// export function flipLayoutToDefault() {

//     const gridImages = resetGridClasses();

//     if (gridImages) {
//         gridImages.style.removeProperty('--image-size');
//         gridImages.style.removeProperty('--column-gap');
//         gridImages.classList.add('columns-250');
//     }

//     // Show charts when returning to default layout
//     const chartsContainer = $('#charts-container');

//     if (chartsContainer) {
//         chartsContainer.classList.remove('noblock', 'fade-out');
//     }

//     // ... rest of code
// }

// ---------------------------------------------------------------------------
// Grid size and theme
// ---------------------------------------------------------------------------

/**
 * Adjusts the photogrid image size by delta pixels,
 * clamped between 50 and 100 px. Updates the CSS custom property
 * and display label immediately without re-fetching results.
 * @param {number} delta - Pixels to add (positive) or subtract
 */
function adjustGridSize(delta) {
    resetLayoutMenuTimer();
    let newSize = getCurrentImgSize() + delta;

    // Clamp to the supported photogrid size range
    if (newSize < 50) newSize = 50;
    if (newSize > 100) newSize = 100;
    const gridImages = $('#grid-images');

    if (gridImages) {
        gridImages.style.setProperty(
            '--image-size', `${newSize}px`
        );
    }

    const sizeDisplay = $('#gridsize-display');

    if (sizeDisplay) {
        sizeDisplay.innerText = `${newSize}px`;
    }

    syncLayoutState(true, newSize);
}

/**
 * Advances to the next theme in globals.themes, wrapping
 * around at the end. Updates the button label and the CSS class on
 * #grid-images (only when layout-pg is active), then syncs the URL.
 */
function cycleTheme() {
    resetLayoutMenuTimer();
    let currentIndex = globals.themes.indexOf(globals.results.activeTheme);

    // Guard: if activeTheme somehow isn't in the list,
    // start from the beginning
    if (currentIndex === -1) currentIndex = 0;

    const nextIndex = (currentIndex + 1) % globals.themes.length;
    const nextTheme = globals.themes[nextIndex];
    globals.results.activeTheme = nextTheme;

    const themeCycleBtn = $('#theme-cycle');

    if (themeCycleBtn) {
        themeCycleBtn.innerText = `theme: ${nextTheme}`;
    }

    const gridImages = $('#grid-images');

    if (
        gridImages &&
        gridImages.classList.contains('layout-pg')
    ) {
        gridImages.classList.remove(...THEME_CLASSES);
        gridImages.classList.add(`theme-${nextTheme}`);
    }

    syncLayoutState(true, getCurrentImgSize());
}

/**
 * Toggles between 'default' and 'square' aspect ratio
 * modes for the photogrid by toggling a CSS class on #grid-images.
 */
function cycleThemeAspect() {
    resetLayoutMenuTimer();

    globals.results.activeThemeAspect =
        globals.results.activeThemeAspect === 'default'
            ? 'square'
            : 'default';

    const btn = $('#theme-aspect-cycle');

    if (btn) {
        btn.innerText =
            `aspect: ${globals.results.activeThemeAspect}`;
    }

    const gridImages = $('#grid-images');

    if (gridImages) {
        gridImages.classList.toggle(
            'theme-aspect-square',
            globals.results.activeThemeAspect === 'square'
        );
    }
}

// ---------------------------------------------------------------------------
// After-render layout application (called by renderers.js)
// ---------------------------------------------------------------------------

/**
 * Applies layout classes and widget visibility after a
 * server response has been rendered into #grid-images. This
 * replaces the duplicated layout-manipulation code that was
 * previously inline in renderPage() in renderers.js.
 *
 * When layout is 'pg', keeps charts visible long enough for
 * eCharts to draw them, then fades them out afterward via
 * fadeOutChartsContainer().
 *
 * @param {string} layout     - 'pg' or 'normal'
 * @param {number} figureSize - Image size in pixels
 */
function applyLayoutAfterRender(layout, figureSize) {

    const gridImages      = resetGridClasses();
    const chartsContainer = $('#charts-container');
    const isPg            = layout === 'pg';

    if (isPg) {

        if (gridImages) {
            gridImages.style.setProperty(
                '--image-size', `${figureSize}px`
            );
            gridImages.style.setProperty('--column-gap', '2px');
            gridImages.classList.add('layout-pg');
            gridImages.classList.add(
                `theme-${globals.results.activeTheme}`
            );
        }

        // eCharts requires the container to be visible
        // while it initialises the SVG canvas, so we can't hide
        // the charts section until after the charts have rendered
        if (chartsContainer) {
            chartsContainer.classList.remove('noblock', 'fade-out');
        }

        const sizeWidget = $('#gridsize-widget');
        if (sizeWidget) sizeWidget.classList.remove('noblock');

        const themeWidget = $('#theme-widget');

        if (themeWidget) {
            themeWidget.classList.remove('noblock');
            $('#layout')?.classList.remove('hidden');
        }

        const themeCycleBtn = $('#theme-cycle');

        if (themeCycleBtn) {
            themeCycleBtn.innerText =
                `theme: ${globals.results.activeTheme}`;
        }

        const sizeDisplay = $('#gridsize-display');

        if (sizeDisplay) {
            sizeDisplay.innerText = `${figureSize}px`;
        }

        globals.results.photogridLoaded = true;
    }
    else {

        if (gridImages) {
            gridImages.style.removeProperty('--image-size');
            gridImages.style.removeProperty('--column-gap');
            gridImages.classList.add(`columns-${figureSize}`);
        }

        if (chartsContainer) {
            chartsContainer.classList.remove('noblock', 'fade-out');
        }

        const sizeWidget = $('#gridsize-widget');
        if (sizeWidget) sizeWidget.classList.add('noblock');

        const themeWidget = $('#theme-widget');

        if (themeWidget) {
            themeWidget.classList.add('noblock');
            $('#layout')?.classList.add('hidden');
        }

        globals.results.photogridLoaded = false;
    }
}

export { resetLayoutMenuTimer, toggleLayoutMenu, fadeOutChartsContainer, flipLayoutToPg, flipLayoutToDefault, adjustGridSize, cycleTheme, cycleThemeAspect, applyLayoutAfterRender }