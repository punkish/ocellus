import { getChartContainer, yAxisFormatter } from './chart-utils.js';
import { globals } from './globals.js';

const renderTermFreq = (term, termFreq) => {
    const chart = getChartContainer(document.querySelector('#termFreq'));
    chart.innerHTML = '';
    
    const series = {
        x: "journal year",
        y1: "all",
        y2: "with images"
    }

    const chartOptions = {
        legend: {
            left: 55,
            top: 60,
            orient: 'vertical',
            borderWidth: 1,
            borderRadius: 5,
            borderColor: 'silver',
            backgroundColor: '#fff'
        },
        // title: {
        //     text: `occurrence of “${term}” in the text by year`,
        //     left: 'center',
        //     top: '10',
        //     textStyle: {
        //         fontFamily: 'sans-serif',
        //         fontSize: '10px',
        //         fontWeight: '400'
        //     }
        // },
        tooltip: {
            trigger: 'axis',
            formatter: `<div class="leg">
    year {b}
    <hr>
    {a0}: {c0}<br/>
    {a1}: {c1}
</div>`
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            //name: series.x,
            splitLine: { show: false },
            data: termFreq.map(e => e.journalYear)
        },
        
        yAxis: {
            type: 'log',
            //name: 'y',
            minorSplitLine: {
                show: true
            },
            axisLabel: {
                formatter: yAxisFormatter
            }
        },
        series: [
            {
                name: series.y1,
                type: 'line',
                data: termFreq.map(e => e.total == 0 ? null : e.total),
                color: '#f00',
                lineStyle: {
                    color: '#f00',
                    width: 1
                }
            },
            {
                name: series.y2,
                type: 'line',
                data: termFreq.map(e => e.withImages == 0 ? null : e.withImages),
                color: '#00f',
                lineStyle: {
                    color: '#00f',
                    width: 1
                }
            }
        ]
    };

    const viz = document.createElement('div');
    viz.style.width = `100%`;
    viz.style.height = '150px';
    viz.classList.add('viz');
    chart.appendChild(viz);
    globals.charts.termFreq = echarts.init(viz);
    globals.charts.termFreq.setOption(chartOptions);

    const caption = document.createElement('div');
    caption.style.width = `100%`;
    caption.classList.add('caption');
    chart.appendChild(caption);
    caption.innerHTML = `occurrence of <span>${term}</span> in the text by year`;
}

export { renderTermFreq }