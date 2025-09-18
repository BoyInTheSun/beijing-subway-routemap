
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
    <image xlink:href="static/transfer.png" x="2.5" y="2.5" width="6" height="6" />
</symbol>
`

var paths = new Object();  // 存放path，{线路: [["M0 0 100 100", ...], ["反方向", ...]]}
var stations = new Object();  // 存放站名，{线路: [["站1", "站2", "..."], ...]}
var stations_xy = new Object();  // 存放站名坐标，{线路: {"站1": ["x", "y"], "站2": ["x", "y"], ...}}
var ex_stations_xy = new Object();  // 存放换乘站坐标，{"站1": [["x0", "y0"], ["x1", "y1"]], "站2": [[...], [...], [...]], ...}
var close_stations = {  // TODO 需要体现站点关闭和虚拟换乘、某线路未开通站等
    '木樨地': '虚拟换乘',
    '大钟寺': '虚拟换乘',
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
    line_nicknames = new Array();
    for (let slb of line.getAttribute("slb").split(',')) {
        if (!isNaN(Number(slb))) line_nicknames.push(slb + '号线');
        else line_nicknames.push(slb + '线');
    }

    // 画linename
    for (let [i, lps] of line.getAttribute("lp").split(';').entries()) {
        if (!lps) continue;
        let lp = lps.split(',');
        xml_linenames.push(
            `<rect width="${lp[2]}" height="${lp[3]}" fill="${line_color}" x="${lp[0]}" y="${lp[1]}" />` +
            `<text class="line-name" x="${add(lp[0], parseFloat(lp[2]) / 2)}" y="${add(lp[1], parseFloat(lp[3]) / 2)}" >${line_nicknames[i]}</text>`
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
        if (!(start_p.getAttribute("lb") == '工人体育场' && end_p.getAttribute("lb") == '十里河')){
            // TODO: 17号线贯通后删除判断
            xml_paths.push(`<path class="line" stroke="${line_color}" d="${d}" />`);
        }

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

// 首都机场线特殊处理
paths['首都机场线'][1] = [
    paths['首都机场线'][0][3],
    paths['首都机场线'][0][4],
    paths['首都机场线'][1][3],
    paths['首都机场线'][1][4],
];
paths['首都机场线'][0].pop();
stations['首都机场线'][0] = ['北新桥', '东直门', '三元桥', '3号航站楼', '2号航站楼'];
stations['首都机场线'][1] = ['3号航站楼', '2号航站楼', '三元桥', '东直门', '北新桥'];


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


// 画车symbol
var train_size = 3;
var t = train_size;
//let points = `0,0 ${t * 3},0 ${t},${t * 2} -${t * 3},${t * 2} -${t * 3},0`;
var points = `${t},0 ${t * 7},0 ${t * 5},${t * 2} ${t},${t * 2}`;
var xml_symbol = `<symbol id="train" X="-${t * 4}" refX="${t * 4}"><polygon class="train" points="${points}" stroke-width="${t / 2}" stroke="#000000" /></symbol>`;

var xml_g_paths = '<g id="g_paths">' + xml_paths.join('') + '</g>';
var xml_g_stationnames = '<g id="g_stationnames">' + xml_stationnames.join('') + '</g>';
var xml_g_stations = '<g id="g_stations">' + xml_stations.join('') + '</g>';
var xml_g_linenames = '<g id="g_linenames">' + xml_linenames.join('') + '</g>';
var xml_g_symbols = '<g id="g_symbols">' + xml_symbol + '</g>';

var svg = d3.select('#div_svg').append('svg')
    .attr('width', 2000)
    .attr('height', 1500)
    .attr('xmlns', 'http://www.w3.org/2000/svg');
var svg_html = '';
svg_html += svg_style;
svg_html += xml_g_paths;
svg_html += xml_g_stationnames;
svg_html += xml_g_stations;
svg_html += xml_g_linenames;
svg_html += xml_g_symbols;
svg_html += '<g id="g_trains"></g>';
svg.html(svg_html);
// 请求时刻表
// TODO: 改并行？
var sche_wde = new Object();
var sche_trains_wde = new Object();
/*
var xhr_sche_wd = new XMLHttpRequest();
xhr_sche_wd.open("GET", "data/schedule_weekday.json", false);
xhr_sche_wd.send();
sche_wde['wd'] = JSON.parse(xhr_sche_wd.responseText);
var xhr_sche_we = new XMLHttpRequest();
xhr_sche_we.open("GET", "data/schedule_weekend.json", false);
xhr_sche_we.send();
sche_wde['we'] = JSON.parse(xhr_sche_we.responseText);
*/
var xhr_sche = new XMLHttpRequest();
xhr_sche.open("GET", "data/schedule.json", false);
xhr_sche.send();
sche_ = JSON.parse(xhr_sche.responseText);
sche_wde['wd'] = sche_["工作日"];
sche_wde['we'] = sche_["双休日"];

sche_trains_wde['wd'] = new Object();
var sche_trains_wd = new Object();
for (let line in sche_wde['wd']) {
    for (let direct in sche_wde['wd'][line]) {
        sche_trains_wde['wd'] = Object.assign(sche_trains_wde['wd'], sche_wde['wd'][line][direct]);
    }
}

sche_trains_wde['we'] = new Object();
for (let line in sche_wde['we']) {
    for (let direct in sche_wde['we'][line]) {
        sche_trains_wde['we'] = Object.assign(sche_trains_wde['we'], sche_wde['we'][line][direct]);
    }
}

// 算开始和结束运营时间
var start_trains_wde = new Object();
var end_trains_wde = new Object();
for (let wde of ['wd', 'we']) {
    start_trains_wde[wde] = new Object();
    end_trains_wde[wde] = new Object();
    for (let h = 0; h <= 23; h++) {
        start_trains_wde[wde][h] = new Object();
        end_trains_wde[wde][h] = new Object();
        for (let m = 0; m <= 59; m++) {
            start_trains_wde[wde][h][m] = new Array();
            end_trains_wde[wde][h][m] = new Array();
        }
    }
}
for (let wde of ['wd', 'we']) {
    for (let train_num in sche_trains_wde[wde]) {
        let start_time = sche_trains_wde[wde][train_num][0][1];
        let end_time = sche_trains_wde[wde][train_num][sche_trains_wde[wde][train_num].length - 1][1];
        start_time = start_time.replace('(', '').replace('-', '');
        end_time = end_time.replace('(', '').replace('-', '');
        let [start_h, start_m] = start_time.split(':');
        let [end_h, end_m] = end_time.split(':');
        start_h = parseInt(start_h);
        start_m = parseInt(start_m);
        end_h = parseInt(end_h);
        end_m = parseInt(end_m);
        start_trains_wde[wde][start_h][start_m].push(train_num);
        end_trains_wde[wde][end_h][end_m].push(train_num);
    }
}



var now_minute;

//console.log(sche_wd);

//算最早最晚时间
var lines_most = new Object();
lines_most['earliest'] = new Object();
lines_most['latest'] = new Object();
for (let wde of ['wd', 'we']) {
    lines_most['earliest'][wde] = new Object();
    lines_most['latest'][wde] = new Object();
    let sche = sche_wde[wde];
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

var time_interval_id_set_time;
function start_set_time(begin_minute, end_minute, reality_minute, speed, wde) {
    clearInterval(window.time_interval_id_set_time);
    init_count_trains(Math.floor(begin_minute / 60), Math.floor(begin_minute % 60), wde);
    window.time_interval_id_set_time = window.setInterval(`set_time(${begin_minute}, ${end_minute}, ${reality_minute}, ${speed}, "${wde}")`, 50);
}
function stop_set_time() {
    if (window.time_interval_id_set_time) clearInterval(window.time_interval_id_set_time);
    document.getElementById('time').innerText = '--:--:--';
    document.getElementById('count_train').innerText = '?';
}
function set_time(begin_minute, end_minute, reality_minute, speed, wde) {
    var time_now = get_now_minute();
    var time_offset = time_now - reality_minute;
    var show_minute_past = window.now_minute;
    var show_minute_now = begin_minute + time_offset * speed;

    if (show_minute_now > end_minute) {
        stop_set_time();
        return;
    }
    window.now_minute = show_minute_now;
    // 更新时间框
    document.getElementById('time').innerText = time2hms(show_minute_now);
    // 更新运行列车数量
    var show_minute_past_floor = Math.floor(show_minute_past);
    var show_minute_now_floor = Math.floor(show_minute_now);
    if (show_minute_now_floor > show_minute_past_floor)
        update_count_trains(show_minute_past_floor, show_minute_now_floor, wde);

}

// 画地图，无车
function draw_map() {
    d3.select('#g_trains').html('');
}


// 画车动画
function draw_trains(begin_minute, end_minute, speed, wde, is_lines) {
    var transparency_second;
    if (speed > 60) transparency_second = 30 / speed;
    else transparency_second = 0.5;

    xml_polygons = new Array();
    var sche = sche_wde[wde];
    for (line_name in sche) {
        for (direct in sche[line_name]) {
            if (!is_lines[line_name][direct]) continue;  // 隐藏某线路的车
            train_0 = Object.keys(sche[line_name][direct])[0];
            index_0 = stations[line_name][0].indexOf(sche[line_name][direct][train_0][0][0]);
            index_1 = stations[line_name][0].indexOf(sche[line_name][direct][train_0][1][0]);
            if (index_1 - index_0 > 0) direct_index = 0;
            else direct_index = 1;
            if (line_name == '首都机场线') {  // 首都机场线特殊处理
                if (sche[line_name][direct][train_0][0][0] == '北新桥') direct_index = 0;
                else direct_index = 1;
            }
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
                        // 也未必，可以用use标签！
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
                //var t = train_size;
                //let points = `0,0 ${t * 3},0 ${t},${t * 2} -${t * 3},${t * 2} -${t * 3},0`;
                //xml_polygon = `<polygon id="T_${train_num}" fill="${line_colors[line_name]}" points="${points}" stroke-width="${t / 2}" stroke="#000000">${xml_animates.join('')}</polygon>`;
                xml_polygon = `<use id="T_${train_num}" xlink:href="#train" fill="${line_colors[line_name]}">${xml_animates.join('')}</use>`;
                xml_polygons.push(xml_polygon);
            }
        }
    }

    //svg = document.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'svg');
    //svg.innerHTML = xml_paths.join('') + xml_polygons.join('');
    d3.select('#g_trains').html('');
    // TODO 只能靠这样重载动画
    var svg_html = d3.select('#div_svg').html();
    d3.select('#div_svg').html('');
    d3.select('#div_svg').html(svg_html);
    d3.select('#g_trains').html(xml_polygons.join(''));
    start_set_time(begin_minute, end_minute, get_now_minute(), speed, wde);
}


var count_trains;

function init_count_trains(hour, minute, wde) {
    window.count_trains = new Object();
    window.count_trains['wait'] = new Array();
    window.count_trains['running'] = new Array();
    window.count_trains['done'] = new Array();
    var start_trains = start_trains_wde[wde];
    var end_trains = end_trains_wde[wde];
    var train_nums = Object.keys(sche_trains_wde[wde]);
    if (hour <= 2) hour += 24;
    for (let i = hour; i >= 0; i--) {
        h = i % 24;
        for (let m = (i == hour ? minute : 59); m >= 0; m--) {
            for (let train_num of end_trains[h][m]) {
                window.count_trains['done'].push(train_num);
            }
            for (let train_num of start_trains[h][m]) {
                if (window.count_trains['done'].indexOf(train_num) == -1) {
                    window.count_trains['running'].push(train_num);
                }
            }
        }
    }
    for (let train_num of train_nums) {
        if (window.count_trains['done'].indexOf(train_num) == -1 && window.count_trains['running'].indexOf(train_num) == -1) {
            window.count_trains['wait'].push(train_num);
        }
    }
    document.getElementById('count_train').innerText = window.count_trains['running'].length;
}
function update_count_trains(past_minute, now_minute, wde) {
    var start_trains = start_trains_wde[wde];
    var end_trains = end_trains_wde[wde];
    for (let t = past_minute; t <= now_minute; t++) {
        var hour = Math.floor(t / 60);
        var minute = Math.floor(t % 60);
        for (let train_num of end_trains[hour][minute]) {
            window.count_trains['running'].splice(window.count_trains['running'].indexOf(train_num), 1);
            window.count_trains['done'].push(train_num);
        }
        for (let train_num of start_trains[hour][minute]) {
            window.count_trains['wait'].splice(window.count_trains['wait'].indexOf(train_num), 1);
            window.count_trains['running'].push(train_num);
        }
    }
    document.getElementById('count_train').innerText = window.count_trains['running'].length;
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