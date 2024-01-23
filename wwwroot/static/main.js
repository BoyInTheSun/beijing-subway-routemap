

svg = document.getElementById("svg");


var xhr = new XMLHttpRequest();
xhr.open("GET", "static/map.xml", false);
xhr.send();
root = xhr.responseXML.getElementsByTagName("sw")[0];  // 根节点
for (var i = 0; i < root.childElementCount; i++) {
    line = root.children[i];
    line_id = line.getAttribute("i")
    line_name = line.getAttribute("lb");
    line_color = "#" + line.getAttribute("lc").slice(2);  // 线路颜色

    // 画路径
    // 环线
    if (line_id == "2" || line_id == "9") {
        line_child_count = line.childElementCount + 1;
    }
    // 非环线
    else {
        line_child_count = line.childElementCount;
    }
    d = `M ${line.children[0].getAttribute("x")} ${line.children[0].getAttribute("y")}`; // 下个起点
    for (var j = 1; j < line_child_count; j++) {
        start_p = line.children[j - 1];
        end_p = line.children[j % line.childElementCount];
        svg = d3.selectAll('#svg');

        if (start_p.getAttribute("arc")) {
            arc = start_p.getAttribute("arc").split(':');
            d_add = ` Q ${arc[0]} ${arc[1]} ${end_p.getAttribute("x")} ${end_p.getAttribute("y")}`;
        }
        else {
            d_add = ` L ${end_p.getAttribute("x")} ${end_p.getAttribute("y")}`;
        }
        d += d_add

        if (end_p.getAttribute("st") == "false") {
            continue
        }


        svg.append("path")
            .attr("stroke", line_color)
            .attr("fill", "none")
            .attr("d", d);

        d = `M ${end_p.getAttribute("x")} ${end_p.getAttribute("y")}`; // 下个起点

    }
    // TODO：画站

}

console.log();