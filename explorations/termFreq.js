const termFreqWithDygraphs = (ctx, width, height, series, term, termFreq) => {
    const dygraphOpts = {
        width,
        height,
        logscale: true,
        labels: Object.values(series)
    };

    const data = termFreq.map(e => [ e.journalYear, e.total, e.withImages ]);
    
    Dygraph.onDOMready(function onDOMready() {
        const g = new Dygraph(
            ctx,
            data,
            dygraphOpts
        );
    });
}



const pluginLegendBackground = {
	id: 'legendBackground',
	beforeDraw({legend}) {
		// avoid useless drawing of the legend before the rectangle is drawn
		this._draw = legend.draw;
		legend.draw = ()=>null;
	},

	beforeUpdate({legend}) {
		legend.topChanged = false;
	},

    //beforeUpdate: ({legend}) => legend.topChanged = false,

	afterDraw({legend}, args, opts) {
		const {
			options: {labels: {padding}},
			legendHitBoxes,
			ctx
		} = legend;

		let {top, bottom, left, right} = legendHitBoxes.reduce(
			({top, bottom, left, right}, {top: t, height: h, left: l, width: w})=>
				({
					top: Math.min(top, t),
					bottom: Math.max(bottom, t+h),
					left: Math.min(left, l),
					right: Math.max(right, l+w)
				}), {top: 1/0, bottom: 0, left: 1/0, right: 0})

		if(top < bottom && left < right) {
			top -= padding.top ?? padding;
			bottom += padding.bottom ?? padding;
			left -= padding.left ?? padding;
			right += padding.right ?? padding;

			const borderWidth = opts.borderWidth ?? 0;
			let deltaX = 0, deltaY = 0;

			if (left - borderWidth <= 0) {
				deltaX = -left + borderWidth;
			}
			else if (right + borderWidth >= legend.chart.width) {
				deltaX = legend.chart.width - (right + borderWidth);
			}

			if (top - borderWidth < 0) {
				deltaY = - top + borderWidth;
			}

			if (bottom + borderWidth > legend.chart.height) {
				deltaY = legend.chart.height - bottom - borderWidth;
			}

			if (deltaX !== 0 || deltaY !== 0) {
				left += deltaX;
				right += deltaX;
				legendHitBoxes.forEach(lb => lb.left += deltaX)
				legend.left += deltaX;
			}

			if (deltaX !== 0 || deltaY !== 0) {
				top += deltaY;
				bottom += deltaY;

				if(!legend.topChanged){
					legend.top += deltaY;
					legend.topChanged = true;
				}
			}

			left -= Math.floor(borderWidth/2);
			right += Math.floor(borderWidth/2);
			top -= Math.floor(borderWidth/2);
			bottom += Math.floor(borderWidth/2);

			ctx.save();
			ctx.fillStyle = opts.color ?? 'transparent';
			ctx.lineWidth = opts.borderWidth ?? 0;
			ctx.strokeStyle = opts.borderColor ?? 'black';
			// ctx.fillRect(left, top, right - left, bottom - top);
			// ctx.strokeRect(left, top, right - left, bottom - top);
            ctx.beginPath();
            ctx.roundRect(left, top, right - left, bottom - top, 5);
            ctx.stroke();
            ctx.fill();
			ctx.restore();
		}
        
		legend.draw = this._draw;
		delete this._draw;
		legend._draw();
	}
};

Chart.register(pluginLegendBackground);

const termFreqWithChartjs = (ctx, width, height, series, term, termFreq) => {
    const colors = {
        red: 'rgba(255, 0, 0, 0.6)',
        lightRed: 'rgba(255, 0, 0, 0.1)',
        blue: 'rgba(0, 0, 255, 0.6)',
        lightBlue: 'rgba(0, 0, 255, 0.1)',
        black: 'rgba(0, 0, 0, 0.4)'
    }
    
    // series "total"
    const total = {
        label: series.y1,
        data: termFreq.map(e => e.total),
        borderColor: colors.red,
        borderWidth: 1,
        backgroundColor: colors.lightRed,
        pointStyle: 'circle',
        pointRadius: 3,
        pointBorderColor: 'red'
    };

    const withImages = {
        label: series.y2,
        data: termFreq.map(e => e.withImages),
        borderColor: colors.blue,
        borderWidth: 1,
        backgroundColor: colors.lightBlue,
        pointStyle: 'circle',
        pointRadius: 3,
        pointBorderColor: 'blue'
    };

    // for config details, see
    // https://stackoverflow.com/a/76636677/183692
    const config = {
        type: 'line',
        data: {
            labels: termFreq.map(e => e.journalYear),
            datasets: [ total, withImages ]
        },
        plugins: [{legendBackground: pluginLegendBackground}],
        options: {
            interaction: {
                intersect: false,
                mode: 'x',
            },
            animation: false,
            responsive: true,
            scales: {
                x: {
                    display: true,
                },
                y: {
                    display: true,
                    type: 'logarithmic',
                    grid: {
                      
                        // minor ticks not visible
                        tickColor: (data) => data.tick.major ? 'silver' : '',
                      
                        //lineWidth: (data) => data.tick.major ? 2 : 1,
                      
                        color: (data) => data.tick.major ? colors.black : 'silver',
                    },
                    border: {
                      
                        // dash line for grid lines
                        // (unexpected position for this option here)
                        //dash: (data) => data.tick.major ? null : [5, 1]
                    },
                    min: 1,
                  
                    // this eliminates tick values like 15 or 150 and only keeps
                    // those of the form n*10^m with n, m one digit integers
                    // this might not be necessary
                    // afterBuildTicks: (ax) => {
                    //     ax.ticks = ax.ticks.filter(({value}) => {
                    //         const r = value / Math.pow(10, Math.floor(Math.log10(value)+1e-5));
                    //         return Math.abs(r - Math.round(r)) < 1e-5
                    //     })
                    // },
                    afterBuildTicks: function(ax) {

                        // fraction of the previous major tick value,
                        // use 1 to have 8 minor ticks between two major ones,
                        // which is the usual
                        const minorTickSteps = 0.5;
                        
                        ax.ticks = ax.ticks
                            .filter(({ major }) => major)
                            .flatMap(({ value, major, significand }, i, a) => {
                                if (i === 0) {
                                    return [{ value, major, significand }]
                                } 
                                else {
                                    const { value: prevValue } = a[i - 1];
                                    const h = Math.abs(minorTickSteps * prevValue);
                                    const aMinor = [];
                                    let minorValue = prevValue + h;

                                    while (minorValue < value) {
                                        aMinor.push({
                                            value: minorValue,
                                            major: false,
                                            significand: minorValue //prevValue
                                        });

                                        minorValue += h;
                                    }

                                    return [
                                        ...aMinor, 
                                        { value, major, significand }
                                    ];
                                }
                            }
                        );
                    },
                    ticks: {
                        callback: function (value, index, ticks) {
                            if (value === 1000000) return "1M";
                            if (value === 100000) return "100K";
                            if (value === 10000) return "10K";
                            if (value === 1000) return "1K";
                            if (value === 100) return "100";
                            if (value === 10) return "10";
                            if (value === 1) return "1";
                            return '';
                        },
                        autoSkip: true
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `occurrence of '${term}' in text by year`,
                },
                legend: {
                    display: true,
                    position: 'chartArea',
                    labels: {
                        usePointStyle: true,
                    },
                    backgroundColor: 'rgba(0, 0, 255, 1)'
                },
                legendBackground:{
					color: 'rgba(255,255,255)',
					borderWidth: 1,
					borderColor: 'black'
				},
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }
            }
        }
    };

    let canvas = document.getElementById('termFreq');

    if (canvas) {
        termFreqChart.destroy();
        termFreqChart = new Chart(canvas, config);
    }
    else {
        canvas = document.createElement('canvas');
        canvas.id = "termFreq";
        canvas.width = width;
        canvas.height = height;
        ctx.appendChild(canvas);
        termFreqChart = new Chart(canvas, config);
    }
}