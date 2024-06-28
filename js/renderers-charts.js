import { $, $$ } from './base.js';
import { getChartContainer, yAxisFormatter } from './chart-utils.js';
import { globals } from './globals.js';
import { toggleModal } from './listeners.js';

function renderDashboard(obj) {
    const { yearlyCounts, totals } = obj;
    
    // There are years when image extraction didn't take place (this is 
    // different from when images extraction took place but no images may 
    // have been found). We need to add an entry for images for these years
    // so the chart looks ok.
    // 
    // treatmentsCount.yearly.forEach(t => {
    //     const tyear = t.year;

    //     const indImg = imagesCount.yearly.findIndex(i => i.year === tyear);
        
    //     if (indImg === -1) {
    //         imagesCount.yearly.push({
    //             year: tyear,
    //             num_of_records: 0
    //         })
    //     }

    //     const indMtc = materialCitationsCount.yearly.findIndex(i => i.year === tyear);
        
    //     if (indMtc === -1) {
    //         materialCitationsCount.yearly.push({
    //             year: tyear,
    //             num_of_records: 0
    //         })
    //     }
    // });
    
    // imagesCount.yearly.sort((a, b) => {
    //     return a.year - b.year
    // });

    // materialCitationsCount.yearly.sort((a, b) => {
    //     return a.year - b.year
    // });

    

    // create charts container that will be reused for each chart withing
    const chartsContainer = document.getElementById('dashboardCharts');
    const main = document.getElementsByTagName('form')[0];
    const { width, height, padding } = getChartContainer(main);

    // const resources = [
    //     'Treatments',
    //     'Images',
    //     'Species',
    //     'Journals'
    // ];

    // resources.forEach(resource => {
    //     const { years, series } = createData(resource, yearlyCounts);
    //     const options = getOptions(resource, years, series);
        
    //     createDashboardChart({
    //         resource,
    //         chartsContainer,
    //         // yearlyCounts,
    //         totals,
    //         options,
    //         chartsWidth,
    //         chartsPadding
    //     });
    // })
    
    const resource = 'Treatments';
    const { years, series } = createData(resource, yearlyCounts);
    const options = getOptions(resource, years, series);

    createDashboardChart({
        resource,
        chartsContainer,
        totals,
        options,
        width,
        padding
    });
    
    // const svg = document.querySelector('#sparkBox');
    // svg.addEventListener('click', toggleModal);
    

    // renderYearlyCountsDb(speciesCount, 'Species');
    // renderYearlyCountsDb(journalsCount, 'Journals');
}

const renderYearlyCounts = ({ yearlyCounts, totals }) => {
    const chart = getChartContainer(document.querySelector('#yearlyCounts'));
    chart.innerHTML = '';
    
    const resource = 'Images';
    const { years, series } = createData(resource, yearlyCounts);
    const chartOptions = getOptions('Treatments', years, series);

    const viz = document.createElement('div');
    viz.style.width = `100%`;
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
}

/*
function createDashboardChart({
    resource,
    chartsContainer, 
    totals, 
    options,
    width,
    padding,
    //searchCriteriaStr,
    cacheHitExplosion
}) {
    const chart = document.createElement('div');
    chartsContainer.appendChild(chart);
    chart.classList.add('chart');

    const viz = document.createElement('div');
    // viz.style.display = 'block';
    const numOfCharts = 1;
    let vizWidth = Math.floor(
        (width - (2 * padding)) / numOfCharts
    );
    
    // if (vizWidth > 255) {
    //     vizWidth = 255;
    // }

    viz.style.width = `${vizWidth}px`;
    viz.style.height = '200px';
    viz.classList.add('viz');
    
    chart.appendChild(viz);

    globals[`${resource}_chart`] = echarts.init(viz);
    globals[`${resource}_chart`].setOption(options);

    const caption = document.createElement('div');
    caption.style.width = `${vizWidth}px`;
    caption.classList.add('caption');
    chart.appendChild(caption);

    const treatmentsTotal = totals.treatments;
    const imagesTotal = totals.images;
    //const materialCitationsTotal = totals.materialCitations;
    const speciesTotals = totals.species;
    const journalsTotals = totals.journals;

    const years = options.xAxis[0].data;
    const num_of_years = years[years.length - 1] - years[0];

    const str = createCaptionStr({ 
        resource,
        imagesTotal, 
        treatmentsTotal, 
        speciesTotals,
        journalsTotals,
        num_of_years,
        cacheHitExplosion,
        chart: 'dashboard'
    });

    caption.innerHTML = str;
}
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

    str += ` <span>${speciesTotals}</span> species from <span>${journalsTotals}</span> journals`;

    if (num_of_years) {
        str += ` over <span>${num_of_years}</span> years`;
    }

    return str;
}

/**
 * returns { years[], series[] }
 */
function createData(resource, yearlyCounts) {
    const years = [];
    const series = [];
    
    if (resource === 'Treatments' || resource === 'Images') {
        series.push({
            name: 'Treatments',
            type: 'bar',
            emphasis: {
                focus: 'series'
            },
            data: yearlyCounts.map(d => d.num_of_treatments)
        });

        // series.push({
        //     name: 'Material Citations',
        //     type: 'bar',
        //     emphasis: {
        //         focus: 'series'
        //     },
        //     data: yearlyCounts.map(d => d.num_of_materialCitations)
        // });

        series.push({
            name: 'Images',
            type: 'bar',
            emphasis: {
                focus: 'series'
            },
            data: yearlyCounts.map(d => d.num_of_images)
        });

        series.push({
            name: 'Species',
            type: 'bar',
            emphasis: {
                focus: 'series'
            },
            data: yearlyCounts.map(d => d.num_of_species)
        });

        series.push({
            name: 'Journals',
            type: 'bar',
            emphasis: {
                focus: 'series'
            },
            data: yearlyCounts.map(d => d.num_of_journals)
        });

        yearlyCounts.forEach(d => years.push(d.year));
    }
    else {
        series.push({
            name: resource,
            type: 'bar',
            emphasis: {
                focus: 'series'
            },
            data: yearlyCounts
                .map(d => d[`num_of_${resource.toLowerCase()}`])
        });

        yearlyCounts.forEach(d => years.push(d.year))
    }

    return { years, series }
}

/**
 * returns options{}
 */
function getOptions(resource, years, series) {
    const options = {
        legend: {
            left: 65,
            top: 60,
            orient: 'horizontal',
            borderWidth: 1,
            borderRadius: 5,
            borderColor: '#444',
            backgroundColor: '#fff'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    precision: '0'
                }
            },
            formatter: `<div class="leg">
    year {b}
    <hr>
    <div class="dot b"></div>{a0}: {c0}<br/>
    <div class="dot g"></div>{a1}: {c1}<br/>
    <div class="dot y"></div>{a2}: {c2}<br/>
    <div class="dot r"></div>{a3}: {c3}
</div>`
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                splitLine: { show: false },
                data: years
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    formatter: yAxisFormatter
                }
            }
        ],
        series
    };

    // if (resource === 'Treatments') {
    //     options.legend = {
    //         left: 65,
    //         top: 60,
    //         orient: 'horizontal',
    //         borderWidth: 1,
    //         borderRadius: 5,
    //         borderColor: '#444',
    //         backgroundColor: '#fff'
    //     };
    // }

    return options;
}

export { renderDashboard, renderYearlyCounts }