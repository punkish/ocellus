/* generated: __buildDate__ */

import { initializeMap } from './mapping/index.js';

function setLoglevel(hostname) {
    return hostname === 'localhost' 
        ? 'INFO'
        : 'ERROR';
}

// set loglevel to 'INFO' on local development machine and to 'ERROR' on prod
log.level = log[setLoglevel(window.location.hostname)];

export { initializeMap }