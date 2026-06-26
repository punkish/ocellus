/**
 * Renders a term-frequency chart showing how often a
 * search term appears in treatments by year, with and without
 * associated images.
 */

import { getChartContainer, yAxisFormatter }
    from './chart-utils.js';
import { globals } from './globals.js';

/**
 * Initialises and renders a term-frequency line chart
 * using eCharts. Two lines: one for all occurrences, one for
 * occurrences with images.
 *
 * The chart uses a logarithmic y-axis to handle the wide range
 * of frequencies. Null values (0 frequency) are omitted to keep
 * the chart clean.
 *
 * @param {string}  term     - The search term being visualized
 * @param {Array}   termFreq - Array of { journalYear, total,
 *                              withImages } objects
 */
const renderTermFreq = (term, termFreq) => {

    const chart = getChartContainer(
        document.querySelector('#termFreq')
    );

    chart.innerHTML = '';

    const chartOptions = {

        legend: {
            left:              55,
            top:               60,
            orient:            'vertical',
            borderWidth:       1,
            borderRadius:      5,
            borderColor:       'silver',
            backgroundColor:   '#fff'
        },

        tooltip: {
            trigger:   'axis',
            formatter: `<div class="leg">
    year {b}
    <hr>
    {a0}: {c0}<br/>
    {a1}: {c1}
</div>`
        },

        grid: {
            left:         '3%',
            right:        '4%',
            bottom:       '3%',
            containLabel: true
        },

        xAxis: {
            type:       'category',
            splitLine:  { show: false },
            data:       termFreq.map(e => e.journalYear)
        },

        yAxis: {
            type:            'log',
            minorSplitLine:  { show: true },
            axisLabel:       { formatter: yAxisFormatter }
        },

        series: [
            {
                name:  'all',
                type:  'line',
                data:  termFreq.map(e =>
                    e.total == 0 ? null : e.total
                ),
                color: '#f00',
                lineStyle: { color: '#f00', width: 1 }
            },
            {
                name:  'with images',
                type:  'line',
                data:  termFreq.map(e =>
                    e.withImages == 0 ? null : e.withImages
                ),
                color: '#00f',
                lineStyle: { color: '#00f', width: 1 }
            }
        ]
    };

    const viz = document.createElement('div');
    viz.style.width = '100%';
    viz.style.height = '150px';
    viz.classList.add('viz');
    chart.appendChild(viz);

    globals.charts.termFreq = echarts.init(viz);
    globals.charts.termFreq.setOption(chartOptions);

    const caption = document.createElement('div');
    caption.style.width = '100%';
    caption.classList.add('caption');
    chart.appendChild(caption);

    caption.innerHTML =
        `occurrence of <span>${term}</span> in the text `
      + `by year`;
};

export { renderTermFreq };
