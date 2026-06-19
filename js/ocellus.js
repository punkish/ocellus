/* generated: __buildDate__ */
import { $ } from './base.js';
import { updateSearchPlaceHolder, qs2form, form2qs } from './utils.js';
import { getResource } from './querier.js';
import { addListeners, showTooltip, hideTooltip } from './listeners.js';
import { initAdvSearch } from './adv-search.js';
import { initializeMap } from './mapping/index.js';
import { renderYearlyCountsSparkline } from './renderers.js';

function init() {
    const loc = new URL(location);

    if (loc.hash) {
        const hashParams = new URLSearchParams(loc.hash.substring(1));
        const layout = hashParams.get('layout');
        const img = hashParams.get('img');
        if (layout) {
            const layoutInput = $('input[name=layout]');
            if (layoutInput) {
                layoutInput.value = layout;
            }
            const layoutToggle = $('input[name=layout-toggle]');
            if (layoutToggle) {
                layoutToggle.checked = (layout === 'pg');
            }
        }
        if (img) {
            const imgInput = $('input[name=img]');
            if (imgInput) {
                imgInput.value = img;
            }
        }
    }

    if (loc.search) {
        log.info(`- locSearch: ${loc.search.substring(1)}`);
        qs2form(loc.search.substring(1));

        // create the queryString from the form so all the form fields such 
        // as page and size are also included properly
        const queryString = form2qs();
        getResource(queryString);
    }
    else {
        const resource = 'images';
        updateSearchPlaceHolder(resource);
        renderYearlyCountsSparkline(resource);
    }

    addListeners();
    initAdvSearch();
}

export { 
    init, 
    showTooltip, 
    hideTooltip, 
    initializeMap
}