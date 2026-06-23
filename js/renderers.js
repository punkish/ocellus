/**
 * [claude] Rendering layer: takes API results and renders them
 * into page HTML. Also handles charts (term frequency, yearly
 * counts) and search-criteria summary.
 *
 * Changes from the original:
 *  - All layout manipulation code moved to layout.js, which now
 *    provides applyLayoutAfterRender()
 *  - Dead import of addListenersToPagerLinks removed (it was a
 *    no-op function that logged one line)
 *  - Layout class manipulation consolidated in one place with
 *    proper module structure
 *  - fadeOutChartsContainer() moved to layout.js
 */

import { $, $$ }          from './base.js';
import { globals }        from './globals.js';
import { renderYearlyCounts } from './renderers-charts.js';
import { renderTermFreq } from './renderer-termFreq.js';
import {
    niceNumbers, qs2form, formatDate, formatTime
} from './utils.js';
import {
    addListenersToFigDetails,
    addListenersToFigureTypes,
    addListenersToMapCarouselLink,
    toggleAdvSearch,
    lightUpTheBox
} from './listeners.js';
import { makeImage, makeTreatment } from './render-figures.js';
import { getCountOfResource } from './querier.js';
import { applyLayoutAfterRender } from './layout.js';

// ---------------------------------------------------------------------------
// Slider (carousel wrapper with optional map)
// ---------------------------------------------------------------------------

/**
 * [claude] Wraps a figure (image or treatment) in a carousel
 * container. If the record has geo data, adds a toggle button
 * and a map pane to the carousel.
 *
 * @param {{ resource: string, figureSize: number, rec: Object }}
 * @returns {string} HTML carousel element
 */
function makeSlider({ resource, figureSize, rec }) {

    const figure = resource === 'images'
        ? makeImage({ figureSize, rec })
        : makeTreatment({ figureSize, rec });

    const rsc = resource === 'images' ? 'image' : 'treatment';

    const uniqId = resource === 'images'
        ? `${rec.treatments_id}-${rec.images_id}`
        : rec.treatments_id;

    if (rec.loc || rec.convexHull) {
        return `
        <div class="carouselbox">
            <div class="buttons">
                <label class="toggle toggle-inline">
                    <span class="toggle-label">${rsc}</span>
                    <input class="toggle-checkbox"
                        type="checkbox"
                        data-loc=${JSON.stringify(rec.loc)}
                        data-convexhull=${
                            JSON.stringify(rec.convexHull)
                        }
                        data-id="${uniqId}">
                    <div class="toggle-switch toggle-round
                        toggle-small toggle-grey"></div>
                    <span class="toggle-label">map</span>
                </label>
            </div>

            <div class="slides">
                <div class="slide">
                    ${figure}
                </div>
                <div class="slide">
                    <div id="map-${uniqId}" class="map"></div>
                </div>
            </div>
        </div>`;
    }
    else {
        return `
        <div class="carouselbox">
            <div class="slides">
                <div class="slide current">
                    ${figure}
                </div>
            </div>
        </div>`;
    }
}

// ---------------------------------------------------------------------------
// Page rendering
// ---------------------------------------------------------------------------

/**
 * [claude] Renders a full results page: populates #grid-images
 * with figure sliders, updates charts (term frequency and yearly
 * counts), applies layout-specific CSS, and displays the search
 * criteria summary.
 *
 * Layout CSS class manipulation is now delegated to
 * applyLayoutAfterRender() in layout.js, keeping this function
 * focused on rendering rather than DOM manipulation.
 *
 * @param {{
 *   resource: string, layout: string, figureSize: number,
 *   slides: string[], qs: string, count: number, term?: string,
 *   termFreq?: Object[], yearlyCounts?: Object,
 *   prev: number, next: number, stored: Date, ttl: number,
 *   cacheHit: boolean
 * }} opts
 */
const renderPage = ({
    resource,
    layout,
    figureSize,
    slides,
    qs,
    count,
    term,
    termFreq,
    yearlyCounts,
    prev,
    next,
    stored,
    ttl,
    cacheHit
}) => {

    log.info(
        `- renderPage()\n`
      + `  - layout: ${layout}\n`
      + `  - figureSize: ${figureSize}px\n`
      + `  - figures: ${slides.length} slides\n`
      + `  - qs: ${qs}\n`
      + `  - count: ${count}\n`
      + `  - prev: ${prev}\n`
      + `  - next: ${next}\n`
      + `  - cacheHit: ${cacheHit}`
    );

    // [claude] Store total count in globals for access during
    // layout toggles (e.g. to estimate initial photogrid size)
    globals.results.totalCount = count;

    // [claude] Apply all layout-specific CSS classes and widget
    // visibility (delegated to layout.js to avoid duplication
    // with layout toggle handlers)
    applyLayoutAfterRender(layout, figureSize);

    // [claude] Render the grid of figure sliders
    if (slides.length) {
        $('#grid-images').innerHTML = slides.join('');
        addListenersToFigDetails();
        addListenersToFigureTypes();
        addListenersToMapCarouselLink();
    }
    else {
        $('#grid-images').innerHTML = '';
    }

    renderPager(qs, prev, next);
    $('#throbber').classList.add('nothrob');

    // [claude] Dispose and render term-frequency chart (if any)
    if (globals.charts.termFreq) {
        globals.charts.termFreq.dispose();
        $('#termFreq').style.visibility = 'hidden';
    }

    if (termFreq && termFreq.length) {
        renderTermFreq(term, termFreq);
        $('#termFreq').style.visibility = 'visible';
    }

    renderSearchCriteria(qs, count, stored, ttl, cacheHit);

    // [claude] Dispose and render yearly-counts chart (if any)
    if (globals.charts.yearlyCounts) {
        globals.charts.yearlyCounts.dispose();
        $('#yearlyCounts').style.visibility = 'hidden';
    }

    if (yearlyCounts) {
        renderYearlyCounts({
            yearlyCounts: yearlyCounts.yearlyCounts,
            totals:       yearlyCounts.totals
        });

        $('#yearlyCounts').style.visibility = 'visible';
    }

    if (termFreq || yearlyCounts) {
        $('#charts').style.visibility = 'visible';
    }

    // [claude] Collapse advanced-search panel if it was active
    // during the search
    const advSearchIsActive = $('input[name=searchtype]').checked;

    if (advSearchIsActive) {
        $('input[name=searchtype]').checked = false;
        toggleAdvSearch();
        qs2form(qs);
    }

    // [claude] Lightbox images if this is an image search
    if (resource === 'images') {
        lightUpTheBox();
    }
};

// ---------------------------------------------------------------------------
// Pager
// ---------------------------------------------------------------------------

/**
 * [claude] Renders prev/next pagination links in #pager based on
 * the current query string (with page number stripped).
 *
 * @param {string} qs   - Query string without leading '?'
 * @param {number} prev - Previous page number
 * @param {number} next - Next page number
 */
const renderPager = (qs, prev, next) => {

    log.info(
        `- renderPager()\n`
      + `  - qs: ${qs}\n`
      + `  - prev: ${prev}\n`
      + `  - next: ${next}`
    );

    const sp = new URLSearchParams(qs);
    sp.delete('page');

    $('#pager').innerHTML =
        `<a href="?${sp.toString()}&page=${prev}">prev</a> `
      + `<a href="?${sp.toString()}&page=${next}">next</a>`;

    $('#pager').classList.add('filled');
};

// ---------------------------------------------------------------------------
// Search criteria summary
// ---------------------------------------------------------------------------

/**
 * [claude] Regex to split camelCase identifiers into space-
 * separated lowercase words. Used to make filter names human-
 * readable in the criteria summary.
 * https://stackoverflow.com/a/54112355/183692
 *
 * @param {string} s - CamelCase string
 * @returns {string} Space-separated lowercase
 */
function SplitCamelCaseWithAbbreviations(s) {

    return s.split(/([A-Z][a-z]+)/)
        .filter(e => e)
        .map(e => e.toLowerCase())
        .join(' ');
}

/**
 * [claude] Renders a human-readable summary of the search query
 * criteria into the details summary for the charts section.
 *
 * Handles dates (eq, since, until, between), text filters, and
 * geolocation filters with special formatting for each type.
 *
 * @param {string}  qs       - Query string without leading '?'
 * @param {number}  count    - Total result count
 * @param {Date}    stored   - Cache entry timestamp
 * @param {number}  ttl      - Cache entry time-to-live ms
 * @param {boolean} cacheHit - Whether this was a cache hit
 */
function renderSearchCriteria(qs, count, stored, ttl, cacheHit) {

    log.info('- renderSearchCriteria()');

    const searchParams = new URLSearchParams(qs);
    let resource = searchParams.get('resource');

    const str = [];
    const dateCriteria = [];
    const nonDateCriteria = [];

    globals.params.notValidSearchCriteria
        .forEach(p => searchParams.delete(p));

    const tag1o = '<span class="crit-key">';
    const tag2o = '<span class="crit-val">';
    const tag3o = '<span class="crit-count">';
    const tagc  = '</span>';

    const dateKeys = {
        checkinTime:     'checked in',
        updateTime:      'updated',
        publicationDate: 'published'
    };

    if (!count) {
        count = 'Sorry, no';
    }
    else if (count < 10) {
        count = niceNumbers(count);
    }

    str.push(`${tag3o}${count}${tagc}`);

    if (count === 1) {
        resource = resource.slice(0, -1);
    }

    str.push(resource);

    searchParams.forEach((v, k) => {

        let criterion;
        let criterionIsDate = false;

        if (Object.keys(dateKeys).includes(k)) {

            criterionIsDate = true;

            const match = v.match(
                /(?<operator1>eq|since|until)?\((?<date>[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}|yesterday)\)|(?<operator2>between)?\((?<from>[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}|yesterday)\s*and\s*(?<to>[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}|yesterday)\)/
            );

            if (match) {

                criterion = `${tag1o}${dateKeys[k]}${tagc}`;

                if (match.groups.operator1) {

                    let verb;

                    if (match.groups.operator1 === 'since') {
                        verb = count === 1
                            ? 'has been'
                            : 'have been';
                    }
                    else {
                        verb = count === 1 ? 'was' : 'were';
                    }

                    str.push(verb);

                    if (match.groups.operator1 === 'eq') {
                        criterion += ' on';
                    }
                    else {
                        criterion +=
                            ` ${match.groups.operator1}`;
                    }

                    criterion +=
                        ` ${tag2o}${match.groups.date}${tagc}`;
                }
                else if (match.groups.operator2) {

                    criterion +=
                        ` ${tag2o}between${tagc} `
                      + `${tag2o}${match.groups.from}${tagc} and `
                      + `${tag2o}${match.groups.to}${tagc}`;
                }

                dateCriteria.push(criterion);
            }
        }
        else {

            criterionIsDate = false;

            const match = v.match(
                /(?<operator>\w+)\((?<term>[\w\s]+)\)/
            );

            if (match) {

                let { operator, term } = match.groups;

                if (operator === 'eq') {
                    operator = 'is';
                }

                criterion =
                    `${tag1o}${k}${tagc} `
                  + `${operator.replace(/_/, ' ')} `
                  + `${tag2o}${term}${tagc}`;
            }
            else {

                if (k === 'q') {
                    criterion =
                        `${tag1o}${v}${tagc} is in the text`;
                }
                else if (k === 'captionText') {
                    criterion =
                        `${tag1o}${v}${tagc} is in `
                      + `${tag1o}caption text${tagc}`;
                }
                else if (k === 'geolocation') {

                    const pattern =
                        `(?<operator>within)\\((radius:\\s*`
                      + `(?<radius>([+-]?([0-9]+)`
                      + `(.[0-9]+)?)),\\s*units:\\s*['\"]`
                      + `(?<units>kilometers|miles)['\"],\\s*`
                      + `lat:\\s*(?<lat>([+-]?([0-9]+)`
                      + `(.[0-9]+)?)),\\s*lng:\\s*`
                      + `(?<lng>([+-]?([0-9]+)(.[0-9]+)?)`
                      + `|min_lat:\\s*(?<min_lat>([+-]?`
                      + `([0-9]+)(.[0-9]+)?)),min_lng:\\s*`
                      + `(?<min_lng>([+-]?([0-9]+)`
                      + `(.[0-9]+)?)),max_lat:\\s*`
                      + `(?<max_lat>([+-]?([0-9]+)`
                      + `(.[0-9]+)?)),max_lng:\\s*`
                      + `(?<max_lng>([+-]?([0-9]+)`
                      + `(.[0-9]+)?))\\)`;

                    const re = new RegExp(pattern);
                    const m = v.match(re);

                    if (m) {

                        let {
                            operator, radius, units, lat, lng,
                            min_lat, min_lng, max_lat, max_lng
                        } = m.groups;

                        if (radius) {

                            lng = Number(lng).toFixed(2);
                            lat = Number(lat).toFixed(2);

                            criterion =
                                `${tag1o}location${tagc} is `
                              + `within ${tag2o}${radius}${tagc} `
                              + `${tag2o}${units}${tagc} of `
                              + `${tag2o}lat ${lat}${tagc} and `
                              + `${tag2o}lng ${lng}${tagc}`;
                        }
                        else {

                            min_lng = Number(min_lng)
                                .toFixed(2);
                            min_lat = Number(min_lat)
                                .toFixed(2);
                            max_lng = Number(max_lng)
                                .toFixed(2);
                            max_lat = Number(max_lat)
                                .toFixed(2);

                            criterion =
                                `${tag1o}location${tagc} is `
                              + `within a box with `
                              + `${tag1o}lower left corner`
                              + `${tagc} at ${tag2o}lat `
                              + `${min_lat}, lng ${min_lng}`
                              + `${tagc} and `
                              + `${tag1o}upper right corner`
                              + `${tagc} at ${tag2o}lat `
                              + `${max_lat}, lng ${max_lng}`
                              + `${tagc}`;
                        }
                    }
                }
                else {

                    k = SplitCamelCaseWithAbbreviations(k);
                    criterion =
                        `${tag1o}${k}${tagc} is `
                      + `${tag2o}${v}${tagc}`;
                }
            }

            nonDateCriteria.push(criterion);
        }
    });

    const criteria = [];

    if (dateCriteria.length) {
        criteria.push(...dateCriteria);
    }
    else {
        str.push('found');
    }

    if (nonDateCriteria.length) {
        str.push('where');
    }

    criteria.push(...nonDateCriteria);

    let criteriaStr;
    const len = criteria.length;

    if (len === 1) {
        criteriaStr = criteria[0];
    }
    else if (len === 2) {
        criteriaStr = `${criteria[0]} and ${criteria[1]}`;
    }
    else {
        criteriaStr =
            `${criteria.slice(0, len - 2).join(', ')}, `
          + `and ${criteria[len - 1]}`;
    }

    str.push(criteriaStr);

    if (cacheHit) {

        const storedDate = new Date(stored);
        const expires = new Date(stored + ttl) - new Date();

        str.push(
            `<span aria-label="cache hit, stored `
          + `${formatDate(storedDate)}, expires in `
          + `${formatTime(expires)}" data-html="true" `
          + `data-pop="top" data-pop-no-shadow `
          + `data-pop-arrow data-pop-multiline>💥</span>`
        );
    }

    $('details.charts summary').innerHTML = str.join(' ');
    $('#charts-container summary').style.visibility = 'visible';
}

// ---------------------------------------------------------------------------
// Sparkline (yearly counts)
// ---------------------------------------------------------------------------

/**
 * [claude] Generates one bar in the yearly-counts sparkline SVG.
 * @param {number} i              - Bar index (x position)
 * @param {number} height         - Bar height in px
 * @param {number} sparkHeight    - Total sparkline height
 * @param {number} barWidth       - Width of each bar
 * @param {string} tooltipText    - Hover text
 * @returns {string} SVG `<g>` element
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
 * [claude] Renders a sparkline (SVG bar chart) showing yearly
 * record counts, plus a text summary. Called on init and when
 * the resource toggle changes.
 *
 * https://css-tricks.com/how-to-make-charts-with-svg/
 *
 * @param {string}  resource      - 'images' or 'treatments'
 * @param {boolean} [validGeo=false] - Filter to geocoded only
 * @param {string}  [context='index'] - Usage context (for labeling)
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

    // [claude] Only render sparkline on wider screens to avoid
    // cramping mobile layouts
    if (document.body.clientWidth > 359) {

        text += `of <span>~${abbrevNum(species)}</span> `
            + `species in <span>~${abbrevNum(journals)}`
            + `</span> journals`;

        const barWidth = 3;
        const numOfRects = yc.length;
        const sparkWidth = barWidth * numOfRects;
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

            const year = yc[i].year;
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

/**
 * [claude] Abbreviates large numbers with K (thousands) or M
 * (millions) suffix for display in summaries.
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

export {
    makeSlider,
    renderPage,
    renderYearlyCountsSparkline
};
