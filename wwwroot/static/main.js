
function hm2time(hm) {
    hm = hm.replace("(", "").replace("-", "");
    t = hm.split(":");
    h = t[0];
    m = t[1];
    time = parseInt(h) * 60 + parseInt(m);
    if (parseInt(h) <= 2) {
        time += 60 * 24;
    }
    return time;
}
function time2hm(time) {
    m = time % 60;
    h = (time - m) / 60 % 24;
    hm = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
    return hm;
}
function time2h_m_s(time) {
    s = Math.round((time % 1) * 60);
    m = parseInt(time % 60);
    h = parseInt(time / 60 % 24);
    return [h, m, s];
}
function time2hms(time) {
    [h, m, s] = time2h_m_s(time);
    hms = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    return hms;
}
function add(a, b) {
    return parseFloat(a) + parseFloat(b);
}

var svg_style = `<style>
    text {
        pointer-events: none;
    }
    path.line {
        pointer-events: none;
        fill: none;
        stroke-linejoin: bevel;
        stroke-linecap: round;
        stroke-width: 3;
    }
    text.station-name {
        fill: #000000;
        font-size: 12px;
    }
    text.line-name {
        text-anchor: middle;
        dominant-baseline: central;
        font-size: 12px;
        fill: #ffffff;
    }
    circle.station-normal {
        r: 3px;
        fill: #ffffff;
        stroke-width: 1px;
        stroke-linecap: round;
        stroke: #000000;
    }
    circle.station-transfer {
        r: 5px;
        fill: #ffffff;
        stroke-width: 1px;
        stroke-linecap: round;
        stroke: #000000;
    }
</style>
<symbol id="station-transfer">
    <circle cx="5.5" cy="5.5" r="5" stroke-width="1" stroke="black" fill="white" />
    <image xlink:href="/static/transfer.png" x="2.5" y="2.5" width="6" height="6" />
</symbol>`

var paths = new Object();  // 存放path，{线路: [["M0 0 100 100", ...], ["反方向", ...]]}
var stations = new Object();  // 存放站名，{线路: [["站1", "站2", "..."], ...]}
var stations_xy = new Object();  // 存放站名坐标，{线路: {"站1": ["x", "y"], "站2": ["x", "y"], ...}}
var ex_stations_xy = new Object();  // 存放换乘站坐标，{"站1": [["x0", "y0"], ["x1", "y1"]], "站2": [[...], [...], [...]], ...}
var close_stations = {  // TODO 需要体现站点关闭和虚拟换乘、某线路未开通站等
    '蓟门桥': '暂缓开通',
    '蓟门桥': '暂缓开通',
    '蓟门桥': '暂缓开通',
    '蓟门桥': '暂缓开通',
    '蓟门桥': '暂缓开通',
}


var xhr_map = new XMLHttpRequest();
xhr_map.open("GET", "data/map.xml", false);
xhr_map.send();
var root = xhr_map.responseXML.getElementsByTagName("sw")[0];  // 根节点
var line_colors = new Object();

//算path，station
var xml_paths = new Array();
var xml_stationnames = new Array();
var xml_stations = new Array();
var xml_linenames = new Array();

for (var i = 0; i < root.childElementCount; i++) {
    line = root.children[i];
    line_id = line.getAttribute("i")
    line_name = line.getAttribute("lb");
    line_color = "#" + line.getAttribute("lc").slice(2);  // 线路颜色
    line_colors[line_name] = line_color;

    // 算linename
    for (let lps of line.getAttribute("lp").split(';')) {
        if (!lps) continue;
        let lp = lps.split(',');
        xml_linenames.push(
            `<rect width="${lp[2]}" height="${lp[3]}" fill="${line_color}" x="${lp[0]}" y="${lp[1]}" />` +
            `<text class="line-name" x="${add(lp[0], parseFloat(lp[2]) / 2)}" y="${add(lp[1], parseFloat(lp[3]) / 2)}" >${line_name}</text>`
        );
    }



    // 环线
    if (line.getAttribute("loop") === "true") {
        line_child_count = line.childElementCount + 1;
    }
    // 非环线
    else {
        line_child_count = line.childElementCount;
    }

    paths[line_name] = new Array();
    paths[line_name].push(new Array());  // 正序
    paths[line_name].push(new Array());  // 倒序
    stations[line_name] = new Array();
    stations[line_name].push(new Array());  // 正序
    stations[line_name].push(new Array());  // 倒序
    stations_xy[line_name] = new Object();

    d = `M${line.children[0].getAttribute("x")},${line.children[0].getAttribute("y")}`; // 起点
    for (var j = 1; j < line_child_count; j++) {
        start_p = line.children[j - 1];
        end_p = line.children[j % line.childElementCount];

        if (start_p.getAttribute("arc")) {
            arc = start_p.getAttribute("arc").split(":");
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
        xml_paths.push(`<path class="line" stroke="${line_color}" d="${d}" />`)

        d = `M${end_p.getAttribute("x")},${end_p.getAttribute("y")}`; // 下个起点

    }
    // 计算反方向path，存到paths。
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
        for (var j = 0; j < ds.length; j++) {
            if (t1[j + 1] == "Q") {
                t1[j] = "Q";
                t1[j + 1] = "";
            }
            t.push(t1[j] + t2[j]);
        }
        paths[line_name][1].push(t.join(" "));
    }
    paths[line_name][1].reverse();
    // 算站
    for (var j = 0; j < line.childElementCount; j++) {
        if (line.children[j].getAttribute("st") === "true") {
            stations[line_name][0].push(line.children[j].getAttribute("lb"));
            stations[line_name][1].unshift(line.children[j].getAttribute("lb"));
            let x = line.children[j].getAttribute("x");
            let y = line.children[j].getAttribute("y");
            stations_xy[line_name][line.children[j].getAttribute("lb")] = [x, y];
            if (line.children[j].getAttribute("ex") === "true") {
                // 换乘车站
                if (!ex_stations_xy[line.children[j].getAttribute("lb")]) {
                    ex_stations_xy[line.children[j].getAttribute("lb")] = new Array();
                    // 画站名
                    xml_stationnames.push(`<text class="station-name" x="${add(x, line.children[j].getAttribute("rx"))}" y="${add(y, line.children[j].getAttribute("ry")) + 15}">${line.children[j].getAttribute("lb")}</text>`)
                }
                ex_stations_xy[line.children[j].getAttribute("lb")].push([x, y]);

            }
            else {
                // 普通车站

                // 画普通车站和站名
                xml_stations.push(`<circle class="station-normal" cx="${x}" cy="${y}" />`);
                xml_stationnames.push(`<text class="station-name" x="${add(x, line.children[j].getAttribute("rx"))}" y="${add(y, line.children[j].getAttribute("ry")) + 15}">${line.children[j].getAttribute("lb")}</text>`)
            }


        }
    }
}

// 画换乘站

for (let ex_station in ex_stations_xy) {
    let new_x = 0;
    let new_y = 0;
    let count = 0;
    for (let [x, y] of ex_stations_xy[ex_station]) {
        new_x += parseFloat(x);
        new_y += parseFloat(y);
        count += 1;
    }
    new_x /= count;
    new_y /= count;
    //xml_stations.push(`<circle class="station-transfer" cx="${new_x}" cy="${new_y}"></circle>`);
    xml_stations.push(`<use xlink:href="#station-transfer" x="${new_x - 5.5}" y="${new_y - 5.5}" />`);
}
//console.log(stations);
//console.log(paths);


var xhr_sche_wd = new XMLHttpRequest();
xhr_sche_wd.open("GET", "data/schedule_weekday.json", false);
xhr_sche_wd.send();
sche_wd = JSON.parse(xhr_sche_wd.responseText);

var xhr_sche_we = new XMLHttpRequest();
xhr_sche_we.open("GET", "data/schedule_weekend.json", false);
xhr_sche_we.send();
sche_we = JSON.parse(xhr_sche_we.responseText);

var now_minute;

//console.log(sche_wd);

//算最早最晚时间
var lines_most = new Object();
lines_most['earliest'] = new Object();
lines_most['latest'] = new Object();
for (let wde of ['wd', 'we']) {
    lines_most['earliest'][wde] = new Object();
    lines_most['latest'][wde] = new Object();
    let sche;
    if (wde == 'wd') sche = sche_wd;
    else sche = sche_we;
    for (let line in sche) {
        lines_most['earliest'][wde][line] = new Object();
        lines_most['latest'][wde][line] = new Object();
        for (let direct in sche[line]) {
            let earliest = hm2time('02:59'); //TODO 这里有个小问题，注意分和秒的精度区别，应该无伤大雅；
            let latest = hm2time('03:00');
            for (let train_num in sche[line][direct]) {

                if (hm2time(sche[line][direct][train_num][0][1]) < earliest) earliest = hm2time(sche[line][direct][train_num][0][1]);
                if (hm2time(sche[line][direct][train_num][sche[line][direct][train_num].length - 1][1]) > latest) latest = hm2time(sche[line][direct][train_num][sche[line][direct][train_num].length - 1][1]);
            }
            lines_most['earliest'][wde][line][direct] = earliest;
            lines_most['latest'][wde][line][direct] = latest;
        }
    }
}

function get_now_minute() {
    now = new Date()
    return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60 + now.getMilliseconds() / 60000;
}

time_interval_id = NaN;
function start_set_time(begin_minute, end_minute, show_minute, speed) {
    clearInterval(window.time_interval_id);
    window.time_interval_id = window.setInterval(`set_time(${begin_minute}, ${end_minute}, ${show_minute}, ${speed})`, 50);
}
function init_time() {
    if (window.time_interval_id) clearInterval(window.time_interval_id);
    time_p = document.getElementById('time');
    time_p.innerText = '--:--:--';
}
function set_time(begin_minute, end_minute, start_minute, speed) {
    time_now = get_now_minute();
    time_offset = time_now - start_minute;
    show_minute_now = begin_minute + time_offset * speed;
    if (show_minute_now > end_minute) {
        init_time();
        clearInterval(window.intervalId);
        return;
    }
    window.now_minute = show_minute_now;
    time = time2hms(show_minute_now);
    time_p = document.getElementById('time');
    time_p.innerText = time;
}

// 画地图，无车
function draw_map(is_hide_station, is_hide_linename, is_hide_stationname) {
    div_svg = d3.select('#div_svg');
    div_svg.html('');
    svg = div_svg.append('svg')
        .attr('width', 2000)
        .attr('height', 1600)
        .attr('xmlns', 'http://www.w3.org/2000/svg');
    var svg_html = '';
    svg_html += svg_style;
    svg_html += xml_paths.join('');
    if (!is_hide_station) svg_html += xml_stations.join('');
    if (!is_hide_linename) svg_html += xml_linenames.join('');
    if (!is_hide_stationname) svg_html += xml_stationnames.join('');
    svg.html(svg_html);
}


// 画车动画
function draw_trains(begin_minute, end_minute, speed, wde, is_lines, train_size, is_hide_linename, is_hide_stationname, is_hide_station) {
    transparency_second = 0.5;
    xml_polygons = new Array();

    if (wde === 'wd') {
        sche = sche_wd;
    }
    else if (wde === 'we') {
        sche = sche_we;
    }
    else {
        sche = sche_wd;
    }

    for (line_name in sche) {
        direct_index = -1;
        for (direct in sche[line_name]) {
            if (!is_lines[line_name][direct]) continue;  // 隐藏某线路的车
            direct_index += 1;
            for (train_num in sche[line_name][direct]) {
                xml_animates = new Array();
                // 淡入
                this_time_minute = hm2time(sche[line_name][direct][train_num][0][1]);
                if (end_minute <= this_time_minute) {
                    continue;
                }
                if (begin_minute <= this_time_minute) {
                    begin = parseInt((this_time_minute - begin_minute) * 60 / speed * 1000) + 'ms';
                    dur = parseInt((transparency_second) * 1000) + 'ms';
                    xml_animates.push(`<animate begin="${begin}" dur="${dur}" attributeName="opacity" values="0;1" repeatCount="1" />`);
                }

                for (var i = 0; i < sche[line_name][direct][train_num].length - 1; i++) {
                    this_station_name = sche[line_name][direct][train_num][i][0];
                    next_station_name = sche[line_name][direct][train_num][i + 1][0];
                    this_time = sche[line_name][direct][train_num][i][1];
                    next_time = sche[line_name][direct][train_num][i + 1][1];
                    is_pass = false;
                    is_close = false;
                    if (this_time.indexOf('(') !== -1) {
                        is_pass = true;
                    }
                    if (this_time.indexOf('-') !== -1) {
                        index = stations[line_name][direct_index].indexOf(this_station_name);
                        path = paths[line_name][direct_index][index].split(" ")[0];  // only Mx,y
                        is_close = true;
                    }
                    else {
                        index = stations[line_name][direct_index].indexOf(this_station_name);
                        path = paths[line_name][direct_index][index];
                    }
                    this_time_minute = hm2time(this_time);
                    next_time_minute = hm2time(next_time);

                    if (begin_minute > next_time_minute) {
                        continue;
                    }

                    begin = parseInt((this_time_minute - begin_minute) * 60 / speed * 1000) + 'ms';
                    dur = parseInt((next_time_minute - this_time_minute) * 60 / speed * 1000) + 'ms';
                    if (end_minute > next_time_minute) {
                        xml_animates.push(`<animateMotion begin="${begin}" dur="${dur}" rotate="auto" path="${path}" repeatCount="1" />`);
                    }
                    else {
                        end = parseInt((end_minute - begin_minute) * 60 / speed * 1000) + 'ms';
                        xml_animates.push(`<animateMotion begin="${begin}" dur="${dur}" end="${end}" rotate="auto" path="${path}" repeatCount="1" />`);
                        /*
                        // 别费劲了，polygon没有xy属性，就算有也算不出来角度，放弃吧
                        t = path.split(' ');
                        t = path.split(' ')[t.length - 1].split(',');
                        x = t[0];
                        if (x.charCodeAt(0) < 48 || x.charCodeAt(0) > 57) {
                            x = x.slice(1);
                        }
                        x = parseInt(x);
                        y = parseInt(t[1]);
                        xml_animates.push(`<set begin="${end}" attributeName="x" to="${x}"/>`);
                        xml_animates.push(`<set begin="${end}" attributeName="y" to="${y}"/>`);
                        */
                        break;
                    }

                }
                // 淡出
                begin = parseInt(((next_time_minute - begin_minute) * 60 / speed - transparency_second) * 1000) + 'ms';
                dur = parseInt((transparency_second) * 1000) + 'ms';
                if (begin_minute <= next_time_minute && end_minute >= next_time_minute) {
                    xml_animates.push(`<animate begin="${begin}" dur="${dur}" attributeName="opacity" values="1;0" repeatCount="1" />`)
                }
                var t = train_size;
                let points = `0,0 ${t * 3},0 ${t},${t * 2} -${t * 3},${t * 2} -${t * 3},0`;
                xml_polygon = `<polygon id="T_${train_num}" fill="${line_colors[line_name]}" points="${points}" stroke-width="${t / 2}" stroke="#000000">${xml_animates.join('')}</polygon>`;
                xml_polygons.push(xml_polygon);
            }
        }
    }

    //svg = document.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'svg');
    //svg.innerHTML = xml_paths.join('') + xml_polygons.join('');

    div_svg = d3.select('#div_svg');
    div_svg.html('');
    svg = div_svg.append('svg')
        .attr('width', 2000)
        .attr('height', 1600)
        .attr('xmlns', 'http://www.w3.org/2000/svg');

    var svg_html = '';
    svg_html += svg_style;
    svg_html += xml_paths.join('');
    if (!is_hide_station) svg_html += xml_stations.join('');
    if (!is_hide_linename) svg_html += xml_linenames.join('');
    if (!is_hide_stationname) svg_html += xml_stationnames.join('');
    svg_html += xml_polygons.join('');

    svg.html(svg_html);
    start_set_time(begin_minute, end_minute, get_now_minute(), speed);
}
//draw_trains(get_now_minute(), 4320, 30, 'we');
//draw_trains(1300, 1310, 600, 'we');
/*
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function test() {
    for (i = begin_minute; ; i++) {
        console.log(i);
        await sleep(1000);
    }
}
test;

async function write_animate() {

    for (var i = 296; i < 1500; i++) {
        update = update_by_minute[i];
        for (train_num in update) {
            dur = update[train_num][1];
            path = update[train_num][0];
            train = svg.append("polygon")
                .attr("id", "T_" + train_num + "_" + i.toString())
                .attr("points", "0,0 9,0 3,6 -9,6 -9,0")
                .attr("stroke-width", "2")
                .attr("fill", "grey")
                .attr("stroke", "#790000")
            train.append("animateMotion")
                .attr("begin", "0s")
                .attr("rotate", "auto")
                .attr("dur", dur.toString() + "s")
                .attr("repeatCount", "indefinite")
                .attr("path", path);
        }
        console.log(i);
        await sleep(1000);
    }
}
//write_animate();
*/
//console.log();