/****** Utility Array Prototype functions ******/
/* The following prototype functions are used for getting unique values from an array */

Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr; 
}


/****** CONSTANTS ******/
const width = 1000, 
      height = 600
      margin = {
          top: 100,
          bottom: 100,
          left: 100,
          right: 10,
      };
      
var numPoints = 200;
const slower = 1200, slow = 750, medium = 500, fast = 250;
var random = true; // true to get random points, false to get top points

// This is a list of possible columns that can be displayed on the axes
// Year is not included because every year is treated as a separate dataset
var integralColumns = ["world_rank", "national_rank", "quality_of_education", "alumni_employment", "quality_of_faculty", "publications", "influence", "citations", "patents", "score"];
var displayNames = 
{
    "world_rank":"World Rank",
    "national_rank":"National Rank",
    "quality_of_education":"Quality of Education",
    "alumni_employment":"Alumni Employment",
    "quality_of_faculty":"Quality of Faculty",
    "publications":"Publications",
    "influence":"Influence",
    "citations":"Citations",
    "patents":"Patents",
    "score":"Score"
};

// ******* Set Default Axes *******
var selectedXAxis = "quality_of_education";
var selectedYAxis = "world_rank";

var selectedYear = 2014;

// A function which is essentially the inverse of the mapping in the displayNames object
function getColumnNameFromDisplayName(displayName) {
    var name = "";
    integralColumns.forEach(function (d) {
        if (displayNames[d] == displayName) {
            name = d;
        }
    });
    return name;
}

// Mapping of countries to colors
// Random colors generated with a python script
var colors = {"USA":"#39BCBB","United Kingdom":"#DD71F4","Japan":"#E7E302","Switzerland":"#A2D3E7","Israel":"#7F8B1A","Canada":"#358968","France":"#ACE80A","Sweden":"#B1EAF1","South Korea":"#A501CD","Italy":"#1AA1B4","Germany":"#22C523","Netherlands":"#805FE9","Finland":"#4184C5","Norway":"#598C13","Australia":"#7A93ED","Denmark":"#E82160","Singapore":"#0EE3BC","Russia":"#A1828C","China":"#3DB0D6","Taiwan":"#DB39C7","Belgium":"#13F66A","South Africa":"#9478BE","Spain":"#BA8979","Brazil":"#AFDEE1","Hong Kong":"#0D4D0F","Ireland":"#80E40A","Austria":"#7C44C3","New Zealand":"#1992AB","Portugal":"#6514A9","Thailand":"#66F5A4","Czech Republic":"#9F3E5E","Malaysia":"#B4EB8E","India":"#BAF440","Greece":"#BCE6A8","Mexico":"#3DCE14","Hungary":"#AC8D15","Argentina":"#C81AD2","Turkey":"#90CCA7","Poland":"#5BD7F3","Saudi Arabia":"#DBBA9C","Chile":"#AFDD23","Iceland":"#54618A","Slovenia":"#D7BC41","Estonia":"#213B68","Lebanon":"#AB4CD9","Croatia":"#4B585E","Colombia":"#E908DB","Slovak Republic":"#D5987D","Iran":"#C0A222","Egypt":"#7CC137","Serbia":"#9BAEAB","Bulgaria":"#4AEE1F","Lithuania":"#595D46","Uganda":"#0ABC2B","United Arab Emirates":"#1B4354","Uruguay":"#52644F","Cyprus":"#A952B3","Romania":"#28352D","Puerto Rico":"#0C2060"};

// Generates random string of length characters
function generateKey(length) {
    var string = "";
    for (var i = 0; i < length; i++) {
        var alphabet = "abcdefghijklmnopqrstuvwxyz1234567890";
        string += alphabet[Math.floor(Math.random() * (alphabet.length - 1))];
    }
    return string;
}    
// Utility functions
function selectSubset(year, numPoints, random, data) {
    var subset = [];
    data.forEach(function(d) {
        if (d.year == year) subset.push(d);
    });
    
    var subset_copy = subset;
    console.log(subset_copy);
    if (random == true) {
        var randomSelection = [];
        for (var i = 0; i < numPoints; i++) {
            var index = Math.floor(Math.random() * (subset_copy.length - 1));
            randomSelection.push(subset_copy[index]);
            subset_copy.splice(index, 1);
        }
        console.log(randomSelection);
        return randomSelection;
    }
    else {
        var sequentialSelection = [];
        for (var i = 0; i < numPoints; i++) {
            sequentialSelection.push(subset_copy[i]);
            subset_copy.splice(i, 1);
        }
        return sequentialSelection;
    }
}

// Gets the countries represented in a subset of the data, used for creating the legend
function getRepresentedCountries(data) {
    var countries = [];
    data.forEach(function(d) {
        countries.push(d.country);
    });
    return countries.unique();
}

// Generates an object with ranges for every quantitative column
function generateRanges(data) {        
    // Object containing ranges for all integral columns
    var ranges = {};
    integralColumns.forEach(function(column) {
        ranges[column] = d3.extent(data, function(d) {return /*add plus to make sure the value is a number*/ +d[column];});
    });
    console.log(ranges);
    return ranges;
}

// Generates an object of range functions for each quantitative column
function generateScales(ranges) {
    // Object containing scales for all integral columns
    var scales = {};
    integralColumns.forEach(function(column) {
        var r = ranges[column];
        scales[column] = [
            d3.scaleLinear().domain(r).range([margin.left, width - margin.right]), // For the x axis
            d3.scaleLinear().domain(r).range([height - margin.bottom, margin.top]) // FOr the y axis
        ];
    });
    return scales;
}

// Returns a new copy of the data passed into the function with a key row added to the end
function addKeys(data){
    data.forEach(function(d) {
        d["key"] = generateKey(64); // Add new member called "key" to each object
    });
    return data;
}

// Key Function for databinding
function dataBindKeyFunc(d) {
    /* Likely not needed due to the nature of the visualization
       The old points transition to the position of the new points, and there are usually the same number of points 
       This means that index binding is sufficient.
       But in case a key function is needed, this will return the unique key that is bound to each row when the dataset is loaded. */
    return d.key;
}

var dataset = [];
function dataLoadedCallback(error, data) {
    dataset = addKeys(data);
    // Add keys to data
    onDataLoad();
}

// Event handlers
function onDataLoad() {
    var dataSubset = selectSubset(selectedYear, numPoints, random, dataset);
    
    // ******* Set Ranges *******
    var ranges = generateRanges(dataSubset);
    
    var scales = generateScales(ranges);
    
    // ******* Add data *******
    svg.selectAll("circle")
        .data(dataSubset, dataBindKeyFunc)
        .enter()
        .append("circle")
        .attr("cx", function(d) {return scales[selectedXAxis][0](d[selectedXAxis]);})
        .attr("cy", function(d) {return scales[selectedYAxis][1](d[selectedYAxis]);})
        .attr("r", 5)
        .attr("fill", function(d) {return colors[d.country];})
        .attr("fill-opacity", 0.0)
        .on("mouseover", function() {
            var thisElem = d3.select(this);
            var text = svg.append("text");
            text.attr("text-anchor", "start")
                .classed("hovertext", true)
                .attr("x", thisElem.attr("cx"))
                .attr("y", thisElem.attr("cy") - 15)
                .text(thisElem.datum().institution + ", " + thisElem.datum().country + ` (World Rank: ${thisElem.datum().world_rank})`)
                .attr("fill-opacity", 0.0)
                .transition()
                .duration(fast)
                .attr("fill-opacity", 1.0);
            if (text.node().getBBox().x + text.node().getBBox().width >= width) {
                text.attr("text-anchor", "end");
            }

            thisElem.transition()
                .duration("fast")
                .attr("r", 10);
        })
        .on("mouseout", function() {
            var thisElem = d3.select(this);
            svg.selectAll(".hovertext")
                .transition("text-disappear")
                .duration(fast)
                .attr("fill-opacity", 0.0)
                .remove()
            thisElem.transition("circle-shrink")
                .duration("fast")
                .attr("r", 5)
        })
        .transition()
        .duration(slow)
        .attr("fill-opacity", 0.8);

    svg.append("g")
        .attr("transform", `translate(0 ${height - margin.bottom})`)
        .call(d3.axisBottom(scales[selectedXAxis][0]));
    svg.append("g")
        .attr("transform", `translate(${margin.left} 0)`)
        .call(d3.axisLeft(scales[selectedYAxis][1]).ticks(5));

    var axisLabels = svg.append("g");
    axisLabels.append("text")
        .attr("text-anchor", "middle")
        .attr("x", (width / 2))
        .attr("y", height - (margin.bottom / 2))
        .attr("font-size", "26")
        .text(displayNames[selectedXAxis]);
    axisLabels.append("text")
        .attr("text-anchor", "middle")
        .attr("x", margin.left / 2)
        .attr("y", height / 2)
        .attr("transform", `rotate(-90 ${margin.left / 2} ${height / 2})`)
        .attr("font-size", "26")
        .text(displayNames[selectedYAxis]);
    axisLabels.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("font-size", "30")
        .text("College Data Comparison from " + selectedYear);

    buildLegend(dataSubset);
    
}

// Called whenever the data needs to be redrawn
function onRedraw(regenerateSubset) {
    // Modify selections and redisplay the data
    var dataSubset = [];
    if (regenerateSubset) {
        dataSubset = selectSubset(selectedYear, numPoints, random, dataset);
    }
    else {
        dataSubset = d3.selectAll("circle").data();
    }
    
    // ******* Set Ranges *******
    var ranges = generateRanges(dataSubset);
    
    var scales = generateScales(ranges);
    svg.selectAll("g").remove();
    
    svg.append("g")
        .attr("transform", `translate(0 ${height - margin.bottom})`)
        .call(d3.axisBottom(scales[selectedXAxis][0]));
    svg.append("g")
        .attr("transform", `translate(${margin.left} 0)`)
        .call(d3.axisLeft(scales[selectedYAxis][1]).ticks(5));

    var axisLabels = svg.append("g");
    axisLabels.append("text")
        .attr("text-anchor", "middle")
        .attr("x", (width / 2))
        .attr("y", height - (margin.bottom / 2))
        .attr("font-size", "26")
        .text(displayNames[selectedXAxis]);
    axisLabels.append("text")
        .attr("text-anchor", "middle")
        .attr("x", margin.left / 2)
        .attr("y", height / 2)
        .attr("transform", `rotate(-90 ${margin.left / 2} ${height / 2})`)
        .attr("font-size", "26")
        .text(displayNames[selectedYAxis]);
     axisLabels.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("font-size", "30")
        .text("College Data Comparison from " + selectedYear);
        
    if (regenerateSubset) {

        // Remove the exit selection
        svg.selectAll("circle")
            .data(dataSubset, dataBindKeyFunc)
            .exit()
            .attr("fill-opacity", 0.8)
            .transition("disappear")
            .duration(slow)
            .attr("fill-opacity", 0.0)
            .remove();

        // Append the enter selection
        svg.selectAll("circle")
            .data(dataSubset, dataBindKeyFunc)
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("fill", function(d) {return colors[d.country];})
            .attr("fill-opacity", 0.0)
            .attr("cx", function(d) {return scales[selectedXAxis][0](d[selectedXAxis]);})
            .attr("cy", function(d) {return scales[selectedYAxis][1](d[selectedYAxis]);})
                    .on("mouseover", function() {
                        var thisElem = d3.select(this);
                        var text = svg.append("text");
                        text.attr("text-anchor", "start")
                            .classed("hovertext", true)
                            .attr("x", thisElem.attr("cx"))
                            .attr("y", thisElem.attr("cy") - 15)
                            .text(thisElem.datum().institution + ", " + thisElem.datum().country + ` (World Rank: ${thisElem.datum().world_rank})`)
                            .attr("fill-opacity", 0.0)
                            .transition()
                            .duration(fast)
                            .attr("fill-opacity", 1.0);
                        if (text.node().getBBox().x + text.node().getBBox().width >= width) {
                            text.attr("text-anchor", "end");
                        }

                        thisElem.transition()
                            .duration("fast")
                            .attr("r", 10);
                    })
            .on("mouseout", function() {
                var thisElem = d3.select(this);
                svg.selectAll(".hovertext")
                    .transition("text-disappear")
                    .duration(fast)
                    .attr("fill-opacity", 0.0)
                    .remove();
                thisElem.transition("circle-shrink")
                    .duration("fast")
                    .attr("r", 5);
            })
            .transition("appear")
            .duration(slow)
            .attr("fill-opacity", 0.8);

        // Update everything
        svg.selectAll("circle").data(dataSubset, dataBindKeyFunc)
            .transition()
            .duration(slow)
            .attr("cx", function(d) {return scales[selectedXAxis][0](d[selectedXAxis]);})
            .attr("cy", function(d) {return scales[selectedYAxis][1](d[selectedYAxis]);});
    }
    else {
        svg.selectAll("circle").data(dataSubset, dataBindKeyFunc)
            .transition()
            .duration(slow)
            .attr("cx", function(d) {return scales[selectedXAxis][0](d[selectedXAxis]);})
            .attr("cy", function(d) {return scales[selectedYAxis][1](d[selectedYAxis]);});
    }

    updateLegend(dataSubset);
}

function buildLegend(dataSubset) {
    var margin = {
        "top": 20,
        "left": 10
    };

    var countries = getRepresentedCountries(dataSubset);
    // Transpose the countries array so it can be bound to circle and text elements in an svg
    console.log(countries);
    var countriesTransposed = [];
    countries.forEach(function(d) {countriesTransposed.push([d]);});

    var legendSvg = d3.select("#legend").append("svg")
        .attr("id", "legend-svg")
        .attr("width", 150)
        .attr("height", 1000);
    legendSvg.selectAll("circle")
        .data(countriesTransposed, function (d) { return d[0]; })
        .enter()
        .append("circle")
        .attr("cx", function(d, i) {return margin.left;})
        .attr("cy", function(d, i) {return margin.top + (15 * i);})
        .attr("r", 5)
        .attr("fill", function(d) { return colors[d];})
        .attr("fill-opacity", 0.0)
        .on("click", function(country) {
            d3.select(this).transition()
            .duration(fast)
            .attr("r", 10);
            svg.selectAll("circle").data(dataSubset, dataBindKeyFunc)
                .transition()
                .duration(slow)
                .attr("fill-opacity", function (row) {
                    if (row.country != country) {
                        return 0.0;
                    }
                    else { return 0.8; }
                })
                .transition("radius-reduce")
                .delay(slow)
                .duration(10)
                .attr("r", function (row) {
                    if (row.country != country) {
                        return 0;
                    }
                    else { return 5; }
                });
        })
        .on("focusout", function (country) {
            d3.select(this).transition()
            .duration(fast)
            .attr("r", 5);
            svg.selectAll("circle").data(dataSubset, dataBindKeyFunc)
                .attr("r", 5)
                .transition()
                .duration(slow)
                .attr("fill-opacity", function(row) {
                    return 0.8;
                });
        })
        .transition()
        .duration(slow)
        .attr("fill-opacity", 1.0);

    legendSvg.selectAll("text")
        .data(countriesTransposed, function (d) { return d[0]; })
        .enter()
        .append("text")
        .attr("text-anchor", "start")
        .attr("x", function(d, i) {return margin.left + 15;})
        .attr("y", function(d, i) {return margin.top + (15 * i) + 5;})
        .text(function(d) {return d;})
        .attr("fill-opacity", 0.0)
        .transition()
        .duration(slow)
        .attr("fill-opacity", 1.0);
}

function updateLegend(dataSubset) {
    var margin = {
        "top": 20,
        "left": 10
    };

    var countries = getRepresentedCountries(dataSubset);
    // Transpose the countries array so it can be bound to circle and text elements in an svg
    console.log(countries);
    var countriesTransposed = [];
    countries.forEach(function(d) {countriesTransposed.push([d]);});


    // Remove exit selection
    var legendSvg = d3.select("#legend-svg");
    legendSvg.selectAll("circle")
        .data(countriesTransposed, function(d) {return d[0];})
        .exit()
        .attr("fill-opacity", 1.0)
        .transition()
        .duration(slow)
        .attr("fill-opacity", 0.0)
        .remove();
    legendSvg.selectAll("text")
        .data(countriesTransposed, function(d) {return d[0];})
        .exit()
        .attr("fill-opacity", 1.0)
        .transition()
        .duration(slow)
        .attr("fill-opacity", 0.0)
        .remove();
    
    // Append enter selection
    legendSvg.selectAll("circle")
        .data(countriesTransposed, function (d) { return d[0]; })
        .enter()
        .append("circle")
        .attr("cx", function(d, i) {return margin.left;})
        .attr("cy", function(d, i) {return margin.top + (15 * i);})
        .attr("r", 5)
        .attr("fill", function(d) { return colors[d];})
        .attr("fill-opacity", 0.0)
    legendSvg.selectAll("text")
        .data(countriesTransposed, function (d) { return d[0]; })
        .enter()
        .append("text")
        .attr("text-anchor", "start")
        .attr("x", function(d, i) {return margin.left + 15;})
        .attr("y", function(d, i) {return margin.top + (15 * i) + 5;})
        .text(function(d) {return d;})
        .attr("fill-opacity", 0.0)

    // Reset order
    legendSvg.selectAll("circle")
        .data(countriesTransposed, function (d) { return d[0]; })
        .attr("cx", function(d, i) {return margin.left;})
        .attr("cy", function(d, i) {return margin.top + (15 * i);})
        .attr("r", 5)
        .attr("fill-opacity", 0.0)
        .on("click", function(country) {
            d3.select(this).transition()
                .duration(fast)
                .attr("r", 10);
            svg.selectAll("circle").data(dataSubset, dataBindKeyFunc)
                .transition()
                .duration(slow)
                .attr("fill-opacity", function(row) {
                    if (row.country != country) {
                        return 0.0;
                    }
                    else { return 0.8; }
                })
				.transition("radius-reduce")
                .delay(slow)
                .duration(10)
                .attr("r", function (row) {
                    if (row.country != country) {
                        return 0;
                    }
                    else { return 5; }
                });
        })
        .on("focusout", function (country) {
            d3.select(this).transition()
            .duration(fast)
            .attr("r", 5);
            svg.selectAll("circle").data(dataSubset, dataBindKeyFunc)
				.attr("r", 5)
                .transition()
                .duration(slow)
                .attr("fill-opacity", function(row) {
                    return 0.8;
                });
        })
        .transition()
        .duration(slow)
        .attr("fill-opacity", 1.0);
    legendSvg.selectAll("text")
        .data(countriesTransposed, function (d) { return d[0]; })
        .attr("text-anchor", "start")
        .attr("x", function(d, i) {return margin.left + 15;})
        .attr("y", function(d, i) {return margin.top + (15 * i) + 5;})
        .attr("fill-opacity", 0.0)
        .transition()
        .duration(slow)
        .attr("fill-opacity", 1.0);
}

var svg = d3.select("#vis-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("overflow", "visible");
    
// Add dropdown elements
var dropdownX = d3.select("#dropdownX");
var dropdownY = d3.select("#dropdownY");

integralColumns.forEach(function(d) {
   dropdownX.append("a")
        .on("click", function() {
            selectedXAxis = getColumnNameFromDisplayName(d3.select(this).text());
            d3.select("#dropdownButtonX").text(displayNames[selectedXAxis]);
            onRedraw(false);
        })
        .text(displayNames[d]);
    dropdownY.append("a")
        .on("click", function() {
            selectedYAxis = getColumnNameFromDisplayName(d3.select(this).text());
            d3.select("#dropdownButtonY").text(displayNames[selectedYAxis]);
            onRedraw(false);
        })
        .text(displayNames[d]);
});

// Set initial text of dropdown menus
d3.select("#dropdownButtonX").text(displayNames[selectedXAxis]);
d3.select("#dropdownButtonY").text(displayNames[selectedYAxis]);

// Set initial text of random toggle
d3.select("#toggle-random").text("Show Top " + numPoints);

d3.csv("cwurData.csv", dataLoadedCallback);
    
// Called by the toggle random button
function toggleRandom() {
    if (random) {
        random = !random;
        d3.select("#toggle-random").text("Show Random " + numPoints);
    }
    else {
        random = !random;
        d3.select("#toggle-random").text("Show Top " + numPoints);
    }
    onRedraw(true);
}    

function invertAxes() {
    var tmp = selectedXAxis;
    selectedXAxis = selectedYAxis;
    selectedYAxis = tmp;
    onRedraw(false);
}