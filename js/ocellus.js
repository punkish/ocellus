/* generated: __buildDate__ */

import { loadBookmarkedWebSite, loadBlankWebSite, updateUrl } from './main.js';
import { showTooltip, hideTooltip } from './listeners.js';

// set loglevel to 'INFO' on local development machine and to 'ERROR' on prod
const loglevel = window.location.hostname === 'localhost' 
    ? 'INFO'
    : 'ERROR';

log.level = log[loglevel];

const init = () => {
    const loc = new URL(location);

    if (loc.search) {
        const qs = loc.search.substring(1);
        loadBookmarkedWebSite(qs);
    }
    else {
        loadBlankWebSite();
    }
}


export { init, showTooltip, hideTooltip }