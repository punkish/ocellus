/*
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────┐                                                                │
│ │close │                                                                │
│ └──────┘                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │┌───────────────────────────────────────────────────────────────────┐│ │
│ ││                                                                   ││ │
│ ││                                                                   ││ │
│ ││                                                                   ││ │
│ ││                           Yearly Counts (viz)                     ││ │
│ ││                                                                   ││ │
│ ││                                                                   ││ │
│ ││                                                                   ││ │
│ ││                                                                   ││ │
│ │└───────────────────────────────────────────────────────────────────┘│ │
│ │┌───────────────────────────────────────────────────────────────────┐│ │
│ ││                       Yearly Counts Caption                       ││ │
│ │└───────────────────────────────────────────────────────────────────┘│ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │┌───────────────────────────────────────────────────────────────────┐│ │
│ ││                                                                   ││ │
│ ││                                                                   ││ │
│ ││                                                                   ││ │
│ ││                          Term Frequency (viz)                     ││ │
│ ││                                                                   ││ │
│ ││                                                                   ││ │
│ ││                                                                   ││ │
│ ││                                                                   ││ │
│ │└───────────────────────────────────────────────────────────────────┘│ │
│ │┌───────────────────────────────────────────────────────────────────┐│ │
│ ││                      Term Frequency Caption                       ││ │
│ │└───────────────────────────────────────────────────────────────────┘│ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
*/
function getChartContainer(chart) {
    const chartContainer = document.getElementById('charts');
    const padding = 50;
    let width = 960;
    const height = 200;

    // How to find the width of a div using vanilla JavaScript?
    // https://stackoverflow.com/a/4787561/183692
    //
    if (chartContainer.offsetWidth < width) {
        width = chartContainer.offsetWidth - (2 * padding);
    }

    chart.style.display = 'block';
    chart.style.width = `${width}px`;
    //chart.style.height = `${height}px`;
    chart.style.textAlign = 'center';
    chart.style.margin = '0 auto';

    return chart;
}

function yAxisFormatter(value, index) {
    if (value < 1000) {
        return value;
    }

    // gte than 1K and lt 1M
    else if (value >= 1000 && value < 1000000) {
        return `${value / 1000}K`;
    }

    // gte 1M and lt 10M
    else if (value >= 1000000 && value < 10000000) {
        return `${value / 1000000}M`;
    }
}

export { getChartContainer, yAxisFormatter }