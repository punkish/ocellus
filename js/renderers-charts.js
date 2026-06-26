/**
 * Renders yearly-counts bar chart using eCharts.
 *
 * Shows aggregated metrics (treatments, images, species, journals)
 * by year across the entire search result set.
 */

import { getChartContainer, yAxisFormatter }
    from './chart-utils.js';
import { globals } from './globals.js';

/**
 * Renders the yearly-counts bar chart showing how many
 * treatments, images, species, and journals are represented in
 * each year of data.
 *
 * @param {{
 *   yearlyCounts: Array<{ year: number, num_of_treatments:
 *     number, num_of_images: number, num_of_species: number,
 *     num_of_journals: number }>,
 *   totals: { treatments: number, images: number, species:
 *     number, journals: number }
 * }} opts
 */
const renderYearlyCounts = ({ yearlyCounts, totals }) => {

    const chart = getChartContainer(
        document.querySelector('#yearlyCounts')
    );

    chart.innerHTML = '';

    const resource = 'Images';
    const { years, series } = createData(resource, yearlyCounts);
    const chartOptions = getOptions('Treatments', years, series);

    const viz = document.createElement('div');
    viz.style.width = '100%';
    viz.style.height = '200px';
    viz.classList.add('viz');
    chart.appendChild(viz);

    globals.charts.yearlyCounts = echarts.init(viz);
    globals.charts.yearlyCounts.setOption(chartOptions);

    const treatmentsTotal = totals.treatments;
    const imagesTotal = totals.images;
    const speciesTotals = totals.species;
    const journalsTotals = totals.journals;

    const yrs = chartOptions.xAxis[0].data;
    const num_of_years = yrs[yrs.length - 1] - yrs[0];

    const str = createCaptionStr({
        resource,
        imagesTotal,
        treatmentsTotal,
        speciesTotals,
        journalsTotals,
        num_of_years
    });

    const caption = document.createElement('div');
    caption.style.width = '100%';
    caption.classList.add('caption');
    chart.appendChild(caption);
    caption.innerHTML = str;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a human-readable caption for the yearly-counts
 * chart. Shows aggregated totals and the number of years spanned
 * by the data.
 *
 * @param {{
 *   resource: string, imagesTotal: number,
 *   treatmentsTotal: number, speciesTotals: number,
 *   journalsTotals: number, num_of_years: number
 * }} opts
 * @returns {string} HTML-formatted caption
 */
function createCaptionStr({
    resource,
    imagesTotal,
    treatmentsTotal,
    speciesTotals,
    journalsTotals,
    num_of_years
}) {

    let str = resource === 'Treatments'
        ? `with <span>${imagesTotal}</span> images, and`
        : `in <span>${treatmentsTotal}</span> treatments of`;

    str += ` <span>${speciesTotals}</span> species from `
         + `<span>${journalsTotals}</span> journals`;

    if (num_of_years) {
        str += ` over <span>${num_of_years}</span> years`;
    }

    return str;
}

/**
 * Extracts years and constructs bar-chart series from
 * yearlyCounts data. Each series represents treatments, images,
 * species, or journals.
 *
 * @param {string} resource - Resource type (Treatments or Images)
 * @param {Array}  yearlyCounts - Yearly aggregates
 * @returns {{
 *   years: number[], series: Array<{ name: string,
 *     type: string, data: number[] }>
 * }}
 */
function createData(resource, yearlyCounts) {

    const years = [];
    const series = [];

    if (resource === 'Treatments' || resource === 'Images') {

        series.push({
            name:      'Treatments',
            type:      'bar',
            emphasis:  { focus: 'series' },
            data:      yearlyCounts.map(d =>
                d.num_of_treatments
            )
        });

        series.push({
            name:      'Images',
            type:      'bar',
            emphasis:  { focus: 'series' },
            data:      yearlyCounts.map(d =>
                d.num_of_images
            )
        });

        series.push({
            name:      'Species',
            type:      'bar',
            emphasis:  { focus: 'series' },
            data:      yearlyCounts.map(d =>
                d.num_of_species
            )
        });

        series.push({
            name:      'Journals',
            type:      'bar',
            emphasis:  { focus: 'series' },
            data:      yearlyCounts.map(d =>
                d.num_of_journals
            )
        });

        yearlyCounts.forEach(d => years.push(d.year));
    }
    else {

        series.push({
            name:      resource,
            type:      'bar',
            emphasis:  { focus: 'series' },
            data:      yearlyCounts.map(d =>
                d[`num_of_${resource.toLowerCase()}`]
            )
        });

        yearlyCounts.forEach(d => years.push(d.year));
    }

    return { years, series };
}

/**
 * Builds eCharts option object for the yearly-counts
 * bar chart. Includes legend, tooltip, grid, axes, and series
 * configuration.
 *
 * @param {string} resource - Resource type (used for legend title)
 * @param {number[]} years  - X-axis year labels
 * @param {Array}   series  - Series data array
 * @returns {Object} eCharts options object
 */
function getOptions(resource, years, series) {

    return {

        legend: {
            left:              65,
            top:               60,
            orient:            'horizontal',
            borderWidth:       1,
            borderRadius:      5,
            borderColor:       '#444',
            backgroundColor:   '#fff'
        },

        tooltip: {
            trigger:      'axis',
            axisPointer: {
                type:      'cross',
                label:     { precision: '0' }
            },
            formatter:    `<div class="leg">
    year {b}
    <hr>
    <div class="dot b"></div>{a0}: {c0}<br/>
    <div class="dot g"></div>{a1}: {c1}<br/>
    <div class="dot y"></div>{a2}: {c2}<br/>
    <div class="dot r"></div>{a3}: {c3}
</div>`
        },

        grid: {
            left:         '3%',
            right:        '4%',
            bottom:       '3%',
            containLabel: true
        },

        xAxis: [
            {
                type:      'category',
                splitLine: { show: false },
                data:      years
            }
        ],

        yAxis: [
            {
                type:      'value',
                axisLabel: { formatter: yAxisFormatter }
            }
        ],

        series
    };
}

export { renderYearlyCounts };
