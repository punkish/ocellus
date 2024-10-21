/* generated: __buildDate__ */
import { $, $$ } from './base.js';
import { globals } from './globals.js';
import { initializeMap } from './mapping/index.js';

function setLoglevel(hostname) {
    return hostname === 'localhost' 
        ? 'INFO'
        : 'ERROR';
}

const toggleModal = (e) => {
    const t = new URL(e.target.href).hash;
    const modals = $$('.modal');

    if (t.length > 0) {
        
        // first, let's close all open modals
        modals.forEach(m => {
            m.classList.add(...globals.hiddenClasses);
        });

        // now, let's open the targeted modal
        $(t).classList.remove(...globals.hiddenClasses);
    }

    // the 'close' button was clicked, so let's close all open modals
    else {
        modals.forEach(m => m.classList.add(...globals.hiddenClasses));
    }
}

// set loglevel to 'INFO' on local development machine and to 'ERROR' on prod
log.level = log[setLoglevel(window.location.hostname)];
$$('.modalToggle').forEach(el => el.addEventListener('click', toggleModal));

export { initializeMap }