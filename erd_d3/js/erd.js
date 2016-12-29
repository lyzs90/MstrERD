var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var padding = {x: 50, y: 20};

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("data.json", function(error, graph) {
  if (error) throw error;

  var nodes = graph.nodes
  , links = graph.links
  , scale = 1
  , focus;

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("r", 5)
    .attr("fill", function(d) { return color(d.group); })
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
    .on('click', connectedNodes) //Added code
    .on('mouseover', function (d) {
        coordinates = d3.mouse(this);
        d3.select("#tooltip")
            .style("left", coordinates[0] + padding.x + "px")
            .style("top", coordinates[1] + padding.y + "px")
            .select("#info")
            .text(d.props);
        d3.select("#tooltip")
            .style("left", coordinates[0] + padding.x + "px")
            .style("top", coordinates[1] + padding.y + "px")
            .select("#label")
            .text(d.id);
        d3.select("#tooltip").classed("hidden", false);
    })
    .on("mouseout", function() {
        d3.select("#tooltip").classed("hidden", true);
    })

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  //---Insert-------

//Toggle stores whether the highlighting is on
var toggle = 0;

//Create an array logging what is connected to what
var linkedByIndex = {};
for (i = 0; i < graph.nodes.length; i++) {
    linkedByIndex[i + "," + i] = 1;
};
graph.links.forEach(function (d) {
    linkedByIndex[d.source.index + "," + d.target.index] = 1;
});

//This function looks up whether a pair are neighbours
function neighboring(a, b) {
    return linkedByIndex[a.index + "," + b.index];
}

function connectedNodes() {

    if (toggle == 0) {
        //Reduce the opacity of all but the neighbouring nodes
        d = d3.select(this).node().__data__;
        node.style("opacity", function (o) {
            return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
        });

        link.style("opacity", function (o) {
            return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
        });
        node.attr("r", 20)
        //Reduce the op

        toggle = 1;
    } else {
        //Put them back to opacity=1
        node.style("opacity", 1);
        link.style("opacity", 1);
        toggle = 0;
        node.attr("r", 5)
    }

}

//---End Insert---
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}


function findNode(){
    // cache DOM
    var userInput = document.getElementById("targetNode");
    var allNodes = document.querySelectorAll('circle');

    for (var i=0; i < allNodes.length; i++) {
        if (allNodes[i].__data__.id === userInput.value) {
            var theNode = d3.select(allNodes[i]);
            theNode.attr("r", 20)
            .dispatch('click');
        } else {
            searchProps(allNodes[i].__data__.props, userInput.value);
        }
    }

    function searchProps(arr, target) {
        for (var j=0; j < arr.length; j++) {
            if (arr[j] === target) {
                var theNode = d3.select(allNodes[i]);
                theNode.attr("r", 20)
                .dispatch('click');
            }
        }
    }
}

(function($){
   $("#targetNode").keyup(function(event){
       if(event.which == 13){
            findNode();
       }
    });
})(jQuery);
