function convert_cobweb_tree_to_draw_tree(cobweb_tree) {
    const draw_tree_node = {
        "name": "TESTE",
        "probilities": cobweb_tree.probilities,
        "children": null
    };

    if (cobweb_tree.children.length > 0) {
        draw_tree_node.children = [];

        for (let i in cobweb_tree.children) {
            draw_tree_node.children[i] = convert_cobweb_tree_to_draw_tree(cobweb_tree.children[i]);
        }
    }

    return draw_tree_node;
}

function draw(root) {
    // const map_name_to_short = generate_column_shorts_name(headers);

    var margin = {
        top: 20,
        right: 120,
        bottom: 20,
        left: 120
    },
    width = 960 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

    var i = 0,
        duration = 750,
        rectW = 295,
        rectH = Object.keys(root.probilities).length * 16;
        depth_value = Object.keys(root.probilities).length * 25;

    var tree = d3.layout.tree().nodeSize([310, rectH - 10]);
    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
        return [d.x + rectW / 2, d.y + rectH / 2];
    });
    
    var svg = d3.select("#body").append("svg").attr("width", '100%').attr("height", '100%')
        .call(zm = d3.behavior.zoom().scaleExtent([1,3]).on("zoom", redraw)).append("g")
        .attr("transform", "translate(" + 350 + "," + 20 + ")");
    
    //necessary so that zoom knows where to zoom and unzoom from
    zm.translate([350, 20]);
    
    root.x0 = 0;
    root.y0 = height / 2;
    
    update(root);
    
    function update(source) {
    
        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);
    
        // Normalize for fixed-depth.
        nodes.forEach(function (d) {
            d.y = d.depth * depth_value;
        });
    
        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) {
            return d.id || (d.id = ++i);
        });
    
        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
            return "translate(" + source.x0 + "," + source.y0 + ")";
        });
    
        nodeEnter.append("rect")
            .attr("width", rectW)
            .attr("height", rectH)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .style("fill", function (d) {
            return d._children ? "lightsteelblue" : "#fff";
        });

        const f = nodeEnter.append("foreignObject")
            .attr("width", rectW)
            .attr("height", rectH)
        const div = f.append('xhtml:div')
            .html(function (e) {
                html = '<div style="padding: 2px;">';
                for (let i in e.probilities) { 

                    html += `<p style="margin: 0; font-size: 12px;">P(${i.replace('|', ' | ')}) = ${e.probilities[i].toFixed(2)}</p>`
                }
                html += '</div>';
                return html;
            });
        
        // nodeEnter.append("text")
        //     .attr("x", rectW / 2)
        //     .attr("y", rectH / 2)
        //     .attr("dy", ".35em")
        //     .attr("text-anchor", "middle")
        //     .text(function (d) {
        //     return d.name;
        // });
    
        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    
        nodeUpdate.select("rect")
            .attr("width", rectW)
            .attr("height", rectH)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .style("fill", function (d) {
            return d._children ? "lightsteelblue" : "#fff";
        });
    
        nodeUpdate.select("text")
            .style("fill-opacity", 1);
    
        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
            return "translate(" + source.x + "," + source.y + ")";
        })
            .remove();
    
        nodeExit.select("rect")
            .attr("width", rectW)
            .attr("height", rectH)
        //.attr("width", bbox.getBBox().width)""
        //.attr("height", bbox.getBBox().height)
        .attr("stroke", "black")
            .attr("stroke-width", 1);
    
        nodeExit.select("text");
    
        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function (d) {
            return d.target.id;
        });
    
        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("x", rectW / 2)
            .attr("y", rectH / 2)
            .attr("d", function (d) {
            var o = {
                x: source.x0,
                y: source.y0
            };
            return diagonal({
                source: o,
                target: o
            });
        });
    
        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);
    
        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
            var o = {
                x: source.x,
                y: source.y
            };
            return diagonal({
                source: o,
                target: o
            });
        })
            .remove();
    
        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }
    
    //Redraw for zoom
    function redraw() {
    //console.log("here", d3.event.translate, d3.event.scale);
    svg.attr("transform",
        "translate(" + d3.event.translate + ")"
        + " scale(" + d3.event.scale + ")");
    }

}

function generate_column_shorts_name(names) {
    let shorts = [];
    let map_name_to_short = {};
    for (let i in names) {

        let position = 0;
        let count = 0;

        while (true) {
            if (position < names[i].length) 
                position++;
            else
                count++;

            let short = names[i].substring(0, position) + (count > 0 ? count : '');

            let pass = false;
            for (let j in names) {
                if (names[i] === names[j]) continue;

                if (names[j].startsWith(short)) {
                    pass = true;
                    break;
                }
            }

            if (pass) continue;

            if (shorts.indexOf(short) === -1) {
                shorts.push(short);
                map_name_to_short[names[i]] = short;

                break;
            }
        }
    }

    return map_name_to_short;
}
