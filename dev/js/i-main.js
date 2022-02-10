//import { $, $$ } from './i-utils.js';
import * as listeners from './i-listeners.js';
import * as common from './i-common.js';

/**
 * @function init
 * @description This is where it all starts.
 */
const init = () => {
    listeners.addDefaultListeners();
    common.fillForm();
}

export { init }