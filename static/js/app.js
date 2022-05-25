function init() {
    /* Initialize the dashboard with data from sample id 940 */
    // Grab a reference to the dropdown select element
    let selector = d3.select('#selDataset');

    // Use the list of sample names to populate the select options
    d3.json('static/data/samples.json').then((data) => {
        let sampleNames = data.names;
        sampleNames.forEach((name) => {
            selector
                .append('option')
                .text(name)
                .property('value', name);
        });

        // Use the first sample from the list to build the initial plots
        let firstSample = sampleNames[0];
        buildCharts(firstSample);
        buildMetadata(firstSample);
    });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
    /* Fetch data each time a new sample is selected from the dropdown menu */
    buildMetadata(newSample);
    buildCharts(newSample);
}

// Demographics Panel
function buildMetadata(sample) {
    /* Matches metadata for the parameter sample and appends the data to the
       demographic panel */
    d3.json('static/data/samples.json').then((data) => {
        let metadata = data.metadata;
        // Filter the data for the object with the desired sample number. Note
        // that the id on metadata objects is a integer, so sample will be
        // parsed as an integer before filtering.
        sample = parseInt(sample);
        let resultArray = metadata.filter((sampleObj) => sampleObj.id === sample);
        let result = resultArray[0];
        // Use d3 to select the panel with id of `#sample-metadata`
        let demographicInfoPanel = d3.select('#sample-metadata');
        // First clear the inner html of the demographic info panel
        demographicInfoPanel.html('');

        // Append the info to the panel
        Object.entries(result).forEach(([key, value]) => {
            demographicInfoPanel.append('h6').text(`${key.toUpperCase()}: ${value}`);
        });
    });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
    /* Builds bar, bubble, and gauge charts for currently selected sample id */
    // 2. Use d3.json to load and retrieve the samples.json file
    d3.json('static/data/samples.json').then((data) => {
        // 3. Create a variable that holds the samples array.
        let samples = data.samples;
        // 4. Create a variable that filters the samples for the object with the
        // desired sample number. Note that here the id on samples objects is a
        // string thus parsing sample to an integer is not needed
        let resultArray = samples.filter((sampleObj) => sampleObj.id === sample);

        //  5. Create a variable that holds the first sample in the array.
        let result = resultArray[0];

        // 6. Create variables that hold the otu_ids, otu_labels, and
        // sample_values.
        let otuIDs = result.otu_ids;
        let otuLabels = result.otu_labels;
        let sampleValues = result.sample_values;

        // 7. Create the yticks for the bar chart.
        // Hint: Get the top 10 otu_ids and map them in descending order
        //  so the otu_ids with the most bacteria are last.

        let yticks = otuIDs.map((id) => `OTU ${id}`).slice(0, 10).reverse();

        otuLabels.slice(0, 10).reverse();

        // ---------------------------------------------------------------------
        // Bar Chart

        // 8. Create the trace for the bar chart.
        let barData = [{
            type: 'bar',
            x: sampleValues.slice(0, 10).reverse(),
            y: yticks,
            hovertext: otuLabels,
            marker: {
                color: '#499195'
            },
            orientation: 'h'
        }];

        // 9. Create the layout for the bar chart.
        let barLayout = {
            title: {
                text: 'Top 10 Bacteria Cultures Found'
            },
            width: 400
        };
        // 10. Use Plotly to plot the data with the layout.
        Plotly.newPlot('bar', barData, barLayout);

        // ---------------------------------------------------------------------
        // Bubble Chart

        // 1. Create the trace for the bubble chart.
        // Add breaks between each label so that the labels are stacked
        otuLabels = otuLabels.map((bac) => bac.split(';'));
        otuLabels = otuLabels.map((bac) => bac.join('<br>'));

        var bubbleData = [{
            type: 'scatter',
            x: otuIDs,
            y: sampleValues,
            text: otuLabels,
            mode: 'markers',
            marker: {
                size: sampleValues,
                color: otuIDs,
                colorscale: [
                    [0, 'rgb(0,0,255)'],
                    [1, 'rgb(0,255,0)']
                ]
            }
        }];

        // 2. Create the layout for the bubble chart.
        var bubbleLayout = {
            title: {
                text: 'Bacteria Cultures Per Sample'
            },
            xaxis: {
                title: 'OTU ID'
            },
            width: 1200,
            // margin: {
            //     autoexpand: true
            // },
            hovermode: 'closest'
        };

        // 3. Use Plotly to plot the data with the layout.
        Plotly.newPlot('bubble', bubbleData, bubbleLayout);

        // ---------------------------------------------------------------------
        // Gauge Chart

        // 1. Create a variable that filters the metadata array for the object with the desired sample number.
        let metadata = data.metadata;
        // Filter the data for the object with the desired sample number. Note
        // that the id on metadata objects is a integer, so sample will be
        // parsed as an integer before filtering.
        sample = parseInt(sample);
        let resultMdArray = metadata.filter((sampleObj) => sampleObj.id === sample);

        // 2. Create a variable that holds the first sample in the metadata array.
        let resultMd = resultMdArray[0];

        // 3. Create a variable that holds the washing frequency.
        let washFreq = parseFloat(resultMd.wfreq)

        // 4. Create the trace for the gauge chart.
        let gaugeData = [{
            type: 'indicator',
            value: washFreq,
            mode: 'gauge+number',
            title: {
                text: 'Belly Button Washing Frequency<br><sup>Scrubs per Week</sup>'
            },
            gauge: {
                axis: {
                    range: [0, 10],
                    tick0: 0,
                    dtick: 2,
                },
                bar: {
                    color: '#000000'
                },
                steps: [{
                        range: [0, 2],
                        color: 'red'
                    },
                    {
                        range: [2, 4],
                        color: 'orange'
                    },
                    {
                        range: [4, 6],
                        color: 'yellow'
                    },
                    {
                        range: [6, 8],
                        color: '#82d43b'
                    },
                    {
                        range: [8, 10],
                        color: 'green'
                    }
                ]
            }
        }];

        // 5. Create the layout for the gauge chart.
        let gaugeLayout = {
            width: 350,
            height: 400,
        };

        // 6. Use Plotly to plot the gauge data and layout.
        Plotly.newPlot('gauge', gaugeData, gaugeLayout);
    });
}