/**
 * Sparkline renderer: fetches yearly resource counts
 * and renders the SVG bar-chart + summary text in #sparkBox.
 *
 * Extracted from renderers.js to break a circular dependency:
 *
 *   renderers.js → querier.js → renderers.js   (cycle)
 *
 * renderers.js needed getCountOfResource() from querier.js only
 * to support renderYearlyCountsSparkline(). Moving that function
 * here means renderers.js no longer imports querier.js at all,
 * eliminating the cycle.
 *
 * Callers previously imported renderYearlyCountsSparkline from
 * renderers.js; they now import it from this module instead:
 *   - listeners.js  (toggleResource handler)
 *   - ocellus.js    (init — no-search landing page)
 *   - ocellus-maps.js (maps page init)
 *
 * Public API
 * ----------
 *   renderYearlyCountsSparkline(resource, validGeo, context)
 */

import { $ }                 from './base.js';
import { getCountOfResource } from './querier.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Generates one bar in the yearly-counts sparkline SVG.
 * @param {number} i           - Bar index (x position)
 * @param {number} height      - Bar height in px
 * @param {number} sparkHeight - Total sparkline height in px
 * @param {number} barWidth    - Width of each bar in px
 * @param {string} tooltipText - Hover text shown by showTooltip()
 * @returns {string} SVG <g> element string
 */
function svgFrag(i, height, sparkHeight, barWidth, tooltipText) {

    return `
    <g class="sparkBar"
       transform="translate(${i * barWidth},0)">
        <rect width="${barWidth}" height="${height}"
            y="${sparkHeight - height}"
            onmouseover="showTooltip(evt, '${tooltipText}');"
            onmouseout="hideTooltip();"></rect>
    </g>`;
}

/**
 * Abbreviates large numbers with K (thousands) or M
 * (millions) suffix for display in the sparkline summary.
 * @param {number} num
 * @returns {string|number}
 */
function abbrevNum(num) {

    if (num > 999) {
        num = num < 999999
            ? `${Math.round(num / 1000, 0)}K`
            : `${Math.round(num / 1000000, 2)}M`;
    }

    return num;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Renders a sparkline (SVG bar chart) showing yearly
 * record counts alongside a text summary of total image/treatment/
 * species/journal counts. Called on init and when the resource
 * toggle changes.
 *
 * https://css-tricks.com/how-to-make-charts-with-svg/
 *
 * @param {string}  resource         - 'images' or 'treatments'
 * @param {boolean} [validGeo=false] - Filter to geocoded records
 *                                     only (used on maps page)
 * @param {string}  [context='index'] - 'index' or 'maps'; affects
 *                                      the summary label wording
 */
async function renderYearlyCountsSparkline(
    resource,
    validGeo = false,
    context = 'index'
) {

    log.info(
        `- renderYearlyCountsSparkline()\n`
      + `  - resource: ${resource}\n`
      + `  - validGeo: ${validGeo}\n`
      + `  - context: ${context}`
    );

    const getYearlyCounts = true;

    const yearlyCounts = await getCountOfResource(
        resource, getYearlyCounts, validGeo
    );

    let {
        images, treatments, species, journals
    } = yearlyCounts.totals;

    const yc = yearlyCounts.yearlyCounts;

    let totalCount = resource === 'images'
        ? images
        : treatments;

    let text = (context === 'maps')
        ? `<span>~${abbrevNum(totalCount)}</span> `
        + `geocoded ${resource} `
        : `<span>~${abbrevNum(totalCount)}</span> `
        + `${resource} `;

    text += (resource === 'images')
        ? `from <span>~${abbrevNum(treatments)}</span> `
        + `treatments `
        : `<span>~${abbrevNum(images)}</span> images, `;

    // Only render the SVG sparkline on wider screens to
    // avoid cramping mobile layouts
    if (document.body.clientWidth > 359) {

        text += `of <span>~${abbrevNum(species)}</span> `
            + `species in <span>~${abbrevNum(journals)}`
            + `</span> journals`;

        const barWidth    = 3;
        const numOfRects  = yc.length;
        const sparkWidth  = barWidth * numOfRects;
        const sparkHeight = 40;
        const heightRatio = sparkHeight / totalCount;

        let svg = `<svg id="svgSpark" version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            class="sparkChart"
            height="${sparkHeight}"
            width="${sparkWidth}"
            aria-labelledby="title"
            role="img">`;

        for (let i = 0; i < numOfRects; i++) {

            const year  = yc[i].year;
            const count = yc[i][`num_of_${resource}`];
            const tooltipText =
                `${count} ${resource} from ${year}`;
            const height = count * heightRatio;

            svg += svgFrag(
                i, height, sparkHeight, barWidth, tooltipText
            );
        }

        svg += '</svg>';

        const sparkChart = $('#sparkChart');
        sparkChart.innerHTML = svg;
    }

    const sparkText = $('#sparkText');
    sparkText.innerHTML = text;
}

export { renderYearlyCountsSparkline };
