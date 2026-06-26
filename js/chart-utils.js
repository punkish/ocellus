/**
 * Chart utility functions.
 *
 * Provides helpers for sizing chart containers responsively and
 * formatting axis labels for eCharts visualizations.
 */

/**
 * Sizes a chart container to fit within the charts
 * panel, respecting padding and responsive breakpoints.
 * Sets display, width, and centering styles.
 *
 * @param {Element} chart - The chart container element
 * @returns {Element} The styled chart element
 */
function getChartContainer(chart) {

    const chartContainer = document.getElementById('charts');
    const padding = 50;
    let width = 960;

    // Responsive: shrink width if container is smaller
    // than default
    // https://stackoverflow.com/a/4787561/183692
    if (chartContainer.offsetWidth < width) {
        width = chartContainer.offsetWidth - (2 * padding);
    }

    chart.style.display = 'block';
    chart.style.width = `${width}px`;
    chart.style.textAlign = 'center';
    chart.style.margin = '0 auto';

    return chart;
}

/**
 * Formats y-axis values for readability: values under
 * 1K are left as-is, values 1K–1M are shown as K, and values
 * 1M+ are shown as M.
 *
 * Intended for use as eCharts yAxis.axisLabel.formatter.
 *
 * @param {number} value - The axis value
 * @param {number} index - The axis index (unused)
 * @returns {string|number}
 */
function yAxisFormatter(value, index) {

    if (value < 1000) {
        return value;
    }
    else if (value >= 1000 && value < 1000000) {
        return `${value / 1000}K`;
    }
    else if (value >= 1000000 && value < 10000000) {
        return `${value / 1000000}M`;
    }
}

export { getChartContainer, yAxisFormatter };
