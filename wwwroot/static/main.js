
function hm2time(hm) {
    t = hm.split(':');
    h = t[0];
    m = t[1];
    time = parseInt(h) * 60 + parseInt(m)
    if (parseInt(h) <= 2) {
        time += 60 * 24;
    }
    return time;
}
function time2hm(time) {
    m = time % 60;
    h = (time - m) / 60 % 24;
    hm = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    return hm;
}


paths = Object();  // 存放path，{线路: [['M0 0 100 100', ...], ['反方向', ...]}}

svg = d3.selectAll('#svg');

var xhr_map = new XMLHttpRequest();
xhr_map.open("GET", "static/map.xml", false);
xhr_map.send();
root = xhr_map.responseXML.getElementsByTagName("sw")[0];  // 根节点

var xhr_sche_wd = new XMLHttpRequest();
xhr_sche_wd.open("GET", "static/schedule_weekday.json", false);
xhr_sche_wd.send();
sche_wd = JSON.parse(xhr_sche_wd.responseText);

var xhr_sche_we = new XMLHttpRequest();
xhr_sche_we.open("GET", "static/schedule_weekend.json", false);
xhr_sche_we.send();
sche_we = JSON.parse(xhr_sche_we.responseText);

for (var i = 0; i < root.childElementCount; i++) {
    line = root.children[i];
    line_id = line.getAttribute("i")
    line_name = line.getAttribute("lb");
    line_color = "#" + line.getAttribute("lc").slice(2);  // 线路颜色

    // 画路径，存path
    // 环线
    if (line.getAttribute("loop") == "true") {
        line_child_count = line.childElementCount + 1;
    }
    // 非环线
    else {
        line_child_count = line.childElementCount;
    }

    paths[line_name] = Array();
    paths[line_name].push(Array());
    paths[line_name].push(Array());

    d = `M${line.children[0].getAttribute("x")},${line.children[0].getAttribute("y")}`; // 起点
    for (var j = 1; j < line_child_count; j++) {
        start_p = line.children[j - 1];
        end_p = line.children[j % line.childElementCount];

        if (start_p.getAttribute("arc")) {
            arc = start_p.getAttribute("arc").split(':');
            d_add = ` Q${arc[0]},${arc[1]} ${end_p.getAttribute("x")},${end_p.getAttribute("y")}`;
        }
        else {
            d_add = ` L${end_p.getAttribute("x")},${end_p.getAttribute("y")}`;
        }
        d += d_add

        if (end_p.getAttribute("st") == "false") {
            continue
        }

        paths[line_name][0].push(d);
        svg.append("path")
            .attr("stroke", line_color)
            .attr("fill", "none")
            .attr("d", d);

        d = `M${end_p.getAttribute("x")},${end_p.getAttribute("y")}`; // 下个起点

    }
    // 计算反方向path，存到paths。如果弃用svg的path而使用css的offset-path，这一步就没用了。
    for (each of paths[line_name][0]) {
        ds = each.slice(1).split(" ");
        t1 = new Array();
        t2 = new Array();
        for (var j = 0; j < ds.length; j++) {
            if (ds[j].charCodeAt(0) >= 48 && ds[j].charCodeAt(0) <= 57) {
                t1.push("");
                t2.push(ds[j]);
            }
            else {
                t1.push(ds[j][0]);
                t2.push(ds[j].slice(1));
            }
        }
        t1.push("M");
        t1.reverse();
        t2.reverse();
        t = new Array();
        for (var j = 0; j < ds.length - 1; j++) {
            if (t1[j + 1] == "Q"){
                t1[j] = "Q";
                t1[j + 1] = "";
            }
            t.push(t1[j] + t2[j]);
        }

        paths[line_name][1].push(t.join(" "));
    }
    // TODO：画站


}

console.log(paths);

// 画车
console.log(sche_wd);

for (line_name in sche_wd){
    for (direct in sche_wd[line_name]){
        for (train_num in sche_wd[line_name][direct]){
            svg.append("polygon")
                .attr("id", train_num)
                .attr("points", "0,0 9,0 3,6 -9,6 -9,0")
                .attr("stroke-width", "2")
                .attr("stroke", "#790000");
        }

    }
}


console.log();