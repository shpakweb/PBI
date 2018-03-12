module powerbi.extensibility.visual {
    import LegendModule = powerbi.extensibility.utils.chart.legend;
    import ILegend = powerbi.extensibility.utils.chart.legend.ILegend;
    import LegendData = powerbi.extensibility.utils.chart.legend.LegendData;
    import LegendDataModule = powerbi.extensibility.utils.chart.legend.data;
    import LegendIcon = powerbi.extensibility.utils.chart.legend.LegendIcon;
    import legendProps = powerbi.extensibility.utils.chart.legend.legendProps;
    import legendPosition = powerbi.extensibility.utils.chart.legend.position;
    import createLegend = powerbi.extensibility.utils.chart.legend.createLegend;
    import LegendPosition = powerbi.extensibility.utils.chart.legend.LegendPosition;
    /**
     * Interface for BarCharts viewmodel.
     *
     * @interface
     * @property {LineChartItem[]} dataItems - Set of data points the visual will render.
     * @property {number} dataMax                 - Maximum data value in the set of data points.
     */
    interface LineChartViewModel {
        dataItems: LineChartItem[];
       // dataMax: number;
        settings: LineChartSettings;
    };

    /**
     * Interface for LineChart data points.
     *
     * @interface
     * @property {number} value             - Data value for point.
     * @property {string} category          - Corresponding category of data value.
     * @property {string} color             - Color corresponding to data point.
     * @property {ISelectionId} selectionId - Id assigned to data point for cross filtering
     *                                        and visual interaction.
     */
    interface LineChartPoint {
        category: string;
        value: PrimitiveValue;
        subject: any;
        level: any;
        color: string;
    };
    interface LineChartItem {
        values: LineChartPoint[];
        subject: any;
        color: string;
        selectionId: powerbi.visuals.ISelectionId;
    };
    
    /**
     * Interface for LineChart settings.
     *
     * @interface
     * @property {{show:boolean}} enableXaxis - Object property that allows axis to be enabled.
     * @property {{generalView.opacity:number}} Lines Opacity - Controls opacity of lines, values range between 10 (almost transparent) to 100 (fully opaque, default)
     * @property {{generalView.showHelpLink:boolean}} Show Help Button - When TRUE, the plot displays a button which launch a link to documentation.
     */
    interface LineChartSettings {
        enableXaxis: {
            show: boolean;
        };
        enableYaxis: {
            show: boolean;
        };
        enableLegends: {
            show: boolean;
            titleText: string;
            labelColor: string;
        };
        generalView: {
            opacity: number;
            showHelpLink: boolean;
        };
    }

    /**
     * Function that converts queried data into a view model that will be used by the visual.
     *
     * @function
     * @param {VisualUpdateOptions} options - Contains references to the size of the container
     *                                        and the dataView which contains all the data
     *                                        the visual had queried.
     * @param {IVisualHost} host            - Contains references to the host which contains services
     */
    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): LineChartViewModel {
        let dataViews = options.dataViews;
        let defaultSettings: LineChartSettings = {
            enableXaxis: {
                show: false,
            },
            enableYaxis: {
                show: false,
            },
            enableLegends: {
                show: true,
                titleText: "",
                labelColor: "black"
            },
            generalView: {
                opacity: 100,
                showHelpLink: false
            }
        };
        let viewModel: LineChartViewModel = {
            dataItems: [],
            settings: <LineChartSettings>{}
        };

        if (!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.categories
            || !dataViews[0].categorical.categories[0].source
            || !dataViews[0].categorical.values)
            return viewModel;

        let categorical = dataViews[0].categorical;
        let category = categorical.categories[0];
        let values = categorical.values;

        
        let lineChartItems: LineChartItem[] = [];
        let colorPalette: IColorPalette = host.colorPalette;
        let objects = dataViews[0].metadata.objects;
        let lineChartSettings: LineChartSettings = {
            enableXaxis: {
                show: getValue<boolean>(objects, 'enableXaxis', 'show', defaultSettings.enableXaxis.show),
            },
            enableYaxis: {
                show: getValue<boolean>(objects, 'enableYaxis', 'show', defaultSettings.enableYaxis.show),
            },
            enableLegends: {
                show: getValue<boolean>(objects, 'enableLabels', 'show', defaultSettings.enableLegends.show),
                titleText: '',
                labelColor: 'black'
            },
            generalView: {
                opacity: getValue<number>(objects, 'generalView', 'opacity', defaultSettings.generalView.opacity),
                showHelpLink: getValue<boolean>(objects, 'generalView', 'showHelpLink', defaultSettings.generalView.showHelpLink),
            }
        };

        if(dataViews[0].categorical.categories[0].values.length > 0) {
        for (let i = 0; i < values.length; i++) {
            let lineChartItem: LineChartPoint[] = [];
            let count = 0;
            while(!values[i].values[count]){
                count++;
            }
            let defaultColor: Fill = {
                solid: {
                    color: colorPalette.getColor(Math.random()*1000 + i + '').value
                    //<number>values[i].values[count]+ i*count +y
                }
            };
            for(let j = 0, len = values[i].values.length; j<len; j++) {
                let level:string;
                if(values[i].values[j] < 17)
                    level = "Присутній"
                else if(values[i].values[j] < 27)
                    level = "Спостерігач"
                else if(values[i].values[j] < 37)
                    level = "Новачок"
                else if(values[i].values[j] < 47)
                    level = "Учень"
                else if(values[i].values[j] < 57)
                    level = "Користувач"
                else if(values[i].values[j] < 67)
                    level = "Розумник"
                else if(values[i].values[j] < 77)
                    level = "Знавець"
                else if(values[i].values[j] < 87)
                    level = "Консультант"
                else
                    level = "Винахідник"
                lineChartItem.push({
                    category: category.values[j] + '',
                    value: values[i].values[j],
                    subject: values[i].source.groupName,
                    level: level,
                    color: getCategoricalObjectValue<Fill>(category, i, 'colorSelector', 'fill', defaultColor).solid.color,
                });
        }
        lineChartItems.push({
            values: lineChartItem,
            subject: values[i].source.groupName,
            color: getCategoricalObjectValue<Fill>(category, i, 'colorSelector', 'fill', defaultColor).solid.color,
            selectionId: host.createSelectionIdBuilder()
                .withCategory(category, i)
                .createSelectionId()
        });
    }
        return {
            dataItems: lineChartItems,
            settings: lineChartSettings,
        };
    }
}

    export class LineChart implements IVisual {
        private svg: d3.Selection<SVGElement>;
        private host: IVisualHost;
        private selectionManager: ISelectionManager;
        private lineChartContainer: d3.Selection<SVGElement>;
        private lineContainer: d3.Selection<SVGElement>;
        private legendSvg: d3.Selection<SVGElement>;
        private legends: d3.Selection<SVGElement>;
        private xAxis: d3.Selection<SVGElement>;
        private yAxis: d3.Selection<SVGElement>;
        private lineItem: LineChartItem[];
        private lineChartSettings: LineChartSettings;
        private tooltipServiceWrapper: ITooltipServiceWrapper;
        private locale: string;
        private helpLinkElement: Element;

        static Config = {
            xScalePadding: 0.1,
            solidOpacity: 1,
            transparentOpacity: 0.3,
            margins: {
                top: 0,
                right: 0,
                bottom: 25,
                left: 30,
            },
            legendsWidth: 180,
           //legendsHeight: 'auto',
            xAxisFontMultiplier: 0.04,
            yAxisFontMultiplier: 0.04,
        };

        /**
         * Creates instance of LineChart. This method is only called once.
         *
         * @constructor
         * @param {VisualConstructorOptions} options - Contains references to the element that will
         *                                             contain the visual and a reference to the host
         *                                             which contains services.
         */
        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
            this.tooltipServiceWrapper = createTooltipServiceWrapper(this.host.tooltipService, options.element);
            let svg = this.svg = d3.select(options.element)
                .append('svg')
                .classed('lineChart', true);
            let legendSvg = this.legendSvg = d3.select(options.element)
                .append('svg')
                .classed('legend', true)
                .attr('style','position:absolute;right:0;top:0');
            this.locale = options.host.locale;

            this.yAxis = svg.append('g')
            .classed('yAxis', true);

            this.lineContainer = svg.append('g')
                .classed('lineContainer', true)

            this.xAxis = svg.append('g')
                .classed('xAxis', true);
            
            this.helpLinkElement = this.createHelpLinkElement();
            options.element.appendChild(this.helpLinkElement);
        }

        /**
         * Updates the state of the visual. Every sequential databinding and resize will call update.
         *
         * @function
         * @param {VisualUpdateOptions} options - Contains references to the size of the container
         *                                        and the dataView which contains all the data
         *                                        the visual had queried.
         */
        public update(options: VisualUpdateOptions) {
            this.lineContainer.selectAll('circle[class^=dot]').remove();
            this.legendSvg.selectAll('.legend').remove();
            this.lineContainer.selectAll('.line').remove();
            this.legendSvg.selectAll('.legends3').remove();
            let viewModel: LineChartViewModel = visualTransform(options, this.host);

            if(viewModel.dataItems){

            let settings = this.lineChartSettings = viewModel.settings;
            this.lineItem = viewModel.dataItems;

            let width = options.viewport.width;
            let height = options.viewport.height;

            this.svg.attr({
                width: width,
                height: height
            });
            let margins = LineChart.Config.margins;
            height -= margins.bottom;
            // if (settings.enableXaxis.show) {
            //     let margins = LineChart.Config.margins;
            //     height -= margins.bottom;
            // }
            if (settings.enableYaxis.show) {
                width -= LineChart.Config.margins.left*3
            }
            if (settings.enableLegends.show) {
                this.legendSvg.attr({
                    'width': LineChart.Config.legendsWidth,
                    //'height': LineChart.Config.legendsHeight
                });
                width -= LineChart.Config.legendsWidth + 45 ;
            }
            if (settings.generalView.showHelpLink) {
                this.helpLinkElement.classList.remove("hidden");
            } else {
                this.helpLinkElement.classList.add("hidden");
            }

            this.xAxis.style({
                'font-size': d3.min([height, width]) * LineChart.Config.xAxisFontMultiplier,
            });
            this.yAxis.style({
                'font-size': d3.min([height, width]) * LineChart.Config.yAxisFontMultiplier,
            });

            let categories: any = viewModel.dataItems[0].values.length;
            let legendVals = [];
            let colorVals = [];
            for(let i=0, len = viewModel.dataItems.length; i<len; i++) {
                categories = Math.max(viewModel.dataItems[i].values.length, categories);
                legendVals.push(viewModel.dataItems[i].subject);
                colorVals.push(viewModel.dataItems[i].color);
            }
            var legendVals1 = d3.scale.ordinal()
            .domain(legendVals)
            .range(colorVals);

            var formatNumber = d3.format(".1f");
            let levels = ["Присутній","Спостерігач", "Новачок", "Учень", "Користувач", "Розумник", "Знавець", "Консультант", "Винахідник" ];
            let yScale = d3.scale.ordinal()
                .domain(levels.map(d => d))
                .rangePoints([height*0.9, 20]);

            let yLinear = d3.scale.linear()
                .domain([0, 100])
                .range([height-15, 10]);

            var legend3 = this.legendSvg.selectAll('.legend')
                .data(legendVals1.domain())
                .enter().append('g')
                .attr("class", "legends3")
                .attr("transform", function (d, i) {
                {
                    return "translate(0," + i * 24 + ")"
                }
            });
            legend3.append('rect')
            .attr("x", 0)
            .attr("y", 2)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function (d, i) {
            return colorVals[i]
            })
            legend3.append('text')
            .attr("x", 20)
            .attr("y", 12)
        .text(function (d, i) {
            return d
        })
            .attr("class", "textselected")
            .style("text-anchor", "start")
            .style("font-size",  12);
            let dateOptions = {
                month: 'long',
                day: 'numeric',
              };
            let xScale = d3.scale.ordinal()
                .domain(viewModel.dataItems[0].values.map(d => new Date(d.category).toLocaleString('uk',dateOptions)))
                .rangeRoundBands([0, width*0.94], 1 , 0.5 );
            let xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom');
            let yAxis = d3.svg.axis()
                .scale(yScale)
                .tickPadding(10)
                .tickSize(-width*0.88)	
                .orient('left');

            this.xAxis.attr('transform', 'translate(' + LineChart.Config.margins.left*3 + ', ' + height*0.95 + ')')
                .call(xAxis);
            this.xAxis.selectAll(".tick text").attr("transform", "rotate(-35)").attr("font-size", "12"); 
            this.yAxis.attr({
                'transform': 'translate(' + LineChart.Config.margins.left*4 + ' ,0)',
                })
                .call(yAxis).select(".domain").remove();
            this.yAxis.selectAll(".tick line").attr("stroke", "#ddd").attr("stroke-width", "1"); 
            this.yAxis.selectAll(".tick text").attr("x", 4).attr("dy", -4).attr("font-size", "13");
            let lines = this.lineContainer.selectAll('.line').data(viewModel.dataItems);
            
            lines.enter()
                .append('path')
                .classed('line', true);

            for(let i=0; i<viewModel.dataItems.length; i++) {

                let dotData = viewModel.dataItems[i].values.filter(item => item.value)
                let dots = this.lineContainer.selectAll('.dot'+ i).data(dotData);
                    dots.enter()
                    .append('circle')
                    .classed('dot' + i, true);
                
                    dots.attr({
                        cy: d => yScale(d.level),
                        cx: d => xScale(new Date(d.category).toLocaleString('uk',dateOptions)),
                        r: 3,
                        fill: viewModel.dataItems[i].color,
                        'fill-opacity': viewModel.settings.generalView.opacity / 100,
                        'transform': 'translate(' + LineChart.Config.margins.left*3.5 + ',0)'
                    });

                    dots.exit()
                    .remove();
                }
            
            lines.attr({
                d: function (d,i){
                    let count = 0; 
                    while(!d.values[count].value){
                        count++;
                    }
                    let points = "M" + xScale(new Date(d.values[count].category).toLocaleString('uk',dateOptions)) + "," + yScale(d.values[count].level);
                    for(let j=count+1; j<d.values.length; j++) { 
                        if(d.values[j].value){
                            points += "L" + xScale(new Date(d.values[j].category).toLocaleString('uk',dateOptions)) + "," + yScale(d.values[j].level);
                        }
                    }
                    return points
                },
                stroke: d => d.color,
                'style': 'stroke-width: 2',
                'fill': 'none',
                'fill-opacity': viewModel.settings.generalView.opacity / 100,
                'transform': 'translate(' + LineChart.Config.margins.left*3.5 + ',0)'
            });

            this.tooltipServiceWrapper.addTooltip(this.lineContainer.selectAll('circle[class^=dot]'),
                (tooltipEvent: TooltipEventArgs<number>) => this.getTooltipData(tooltipEvent.data),
                (tooltipEvent: TooltipEventArgs<number>) => null);

            let selectionManager = this.selectionManager;
            let allowInteractions = this.host.allowInteractions;

            // This must be an anonymous function instead of a lambda because
            // d3 uses 'this' as the reference to the element that was clicked.
            lines.on('click', function(d) {
				// Allow selection only if the visual is rendered in a view that supports interactivity (e.g. Report)
                if (allowInteractions) {
                    selectionManager.select(d.selectionId).then((ids: ISelectionId[]) => {
                        lines.attr({
                            'fill-opacity': ids.length > 0 ? LineChart.Config.transparentOpacity : LineChart.Config.solidOpacity
                        });

                        d3.select(this).attr({
                            'fill-opacity': LineChart.Config.solidOpacity
                        });
                    });

                    (<Event>d3.event).stopPropagation();
                }
            });

            lines.exit()
               .remove();
            }

        }

        /**
         * Enumerates through the objects defined in the capabilities and adds the properties to the format pane
         *
         * @function
         * @param {EnumerateVisualObjectInstancesOptions} options - Map of defined objects
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            let objectName = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];

            switch (objectName) {
                case 'enableXaxis':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.lineChartSettings.enableXaxis.show,
                        },
                        selector: null
                    });
                    break;
                    case 'enableYaxis':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.lineChartSettings.enableYaxis.show,
                        },
                        selector: null
                    });
                    break;
                case 'enableLegends':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            show: this.lineChartSettings.enableLegends.show,
                        },
                        selector: null
                    });
                    break;
                case 'colorSelector':
                    for (let lineItem of this.lineItem) {
                        objectEnumeration.push({
                            objectName: objectName,
                            displayName: lineItem.subject,
                            properties: {
                                fill: {
                                    solid: {
                                        color: lineItem.color
                                    }
                                }
                            },
                            selector: lineItem.selectionId.getSelector()
                        });
                    }
                    break;
                case 'generalView':
                    objectEnumeration.push({
                        objectName: objectName,
                        properties: {
                            opacity: this.lineChartSettings.generalView.opacity,
                            showHelpLink: this.lineChartSettings.generalView.showHelpLink
                        },
                        validValues: {
                            opacity: {
                                numberRange: {
                                    min: 10,
                                    max: 100
                                }
                            }
                        },
                        selector: null
                    });
                    break;
            };

            return objectEnumeration;
        }

        /**
         * Destroy runs when the visual is removed. Any cleanup that the visual needs to
         * do should be done here.
         *
         * @function
         */
        public destroy(): void {
            // Perform any cleanup tasks here
        }

        private getTooltipData(value: any): VisualTooltipDataItem[] {
            let language = getLocalizedString(this.locale, "LanguageKey");
            return [{
                displayName:  ' ' + value.subject.toString(),
                value: value.level.toString(),
                header: new Date(value.category).toLocaleDateString('en-GB') +" " + new Date(value.category).toLocaleTimeString('en-GB'),
                color: value.color
            }];
        }

        private createHelpLinkElement(): Element {
            let linkElement = document.createElement("a");
            linkElement.textContent = "?";
            linkElement.setAttribute("title", "Open documentation");
            linkElement.setAttribute("class", "helpLink");
            linkElement.addEventListener("click", () => {
                this.host.launchUrl("https://github.com/Microsoft/PowerBI-visuals/blob/master/Readme.md#developing-your-first-powerbi-visual");
            });
            return linkElement;
        };
    }
}
