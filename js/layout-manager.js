import { $, $$ } from './base.js';

function updateLayoutHashState(isPg, imgSize, pushHistory = true) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    if (isPg) {
        params.set('layout', 'pg');
        params.set('img', imgSize.toString());
    } else {
        params.delete('layout');
        params.delete('img');
    }

    const hashStr = params.toString();
    const newHash = hashStr ? `#${hashStr}` : '';

    if (window.location.hash !== newHash) {
        if (pushHistory) {
            window.history.pushState(null, '', window.location.pathname + window.location.search + newHash);
        } else {
            window.history.replaceState(null, '', window.location.pathname + window.location.search + newHash);
        }
    }
}

function applyLayoutState(isPg, imgSize) {
    const toggle = $('#layout-toggle');
    const sizeWidget = $('#size-widget');
    
    if (toggle) {
        toggle.checked = isPg;
    }

    if (isPg) {
        document.body.classList.add('photogrid-mode');
        document.body.style.setProperty('--pg-img-size', `${imgSize}px`);
        if (sizeWidget) {
            sizeWidget.classList.remove('hidden');
        }
    } else {
        document.body.classList.remove('photogrid-mode');
        if (sizeWidget) {
            sizeWidget.classList.add('hidden');
        }
    }
}

export function initLayoutManager() {
    // 1. Initial parse on page load
    const parsedHash = new URLSearchParams(window.location.hash.substring(1));
    const isPg = parsedHash.get('layout') === 'pg';
    let imgSize = parseInt(parsedHash.get('img'), 10) || 50;
    
    if (imgSize < 25) imgSize = 25;
    if (imgSize > 100) imgSize = 100;

    applyLayoutState(isPg, imgSize);
    updateLayoutHashState(isPg, imgSize, false);

    // 2. Setup event listeners
    const toggle = $('#layout-toggle');
    if (toggle) {
        toggle.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const currentHashParams = new URLSearchParams(window.location.hash.substring(1));
            let currentSize = parseInt(currentHashParams.get('img'), 10) || 50;
            
            applyLayoutState(isChecked, currentSize);
            updateLayoutHashState(isChecked, currentSize, true);
        });
    }

    const plusBtn = $('#size-plus');
    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            const currentHashParams = new URLSearchParams(window.location.hash.substring(1));
            let currentSize = parseInt(currentHashParams.get('img'), 10) || 50;
            currentSize = Math.min(currentSize + 25, 100);
            
            applyLayoutState(true, currentSize);
            updateLayoutHashState(true, currentSize, true);
        });
    }

    const minusBtn = $('#size-minus');
    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            const currentHashParams = new URLSearchParams(window.location.hash.substring(1));
            let currentSize = parseInt(currentHashParams.get('img'), 10) || 50;
            currentSize = Math.max(currentSize - 25, 25);
            
            applyLayoutState(true, currentSize);
            updateLayoutHashState(true, currentSize, true);
        });
    }

    // 3. Listen for window popstate / hashchange to synchronize state on back/forward
    window.addEventListener('hashchange', () => {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const activePg = hashParams.get('layout') === 'pg';
        let activeSize = parseInt(hashParams.get('img'), 10) || 50;
        
        if (activeSize < 25) activeSize = 25;
        if (activeSize > 100) activeSize = 100;

        applyLayoutState(activePg, activeSize);
    });
}
