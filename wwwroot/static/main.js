
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

function time2hms(time) {
    s = Math.round((time % 1) * 60);
    m = parseInt(time % 60);
    h = parseInt(time / 60 % 24);
    hms = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    return hms;
}

paths = new Object();  // 存放path，{线路: [["M0 0 100 100", ...], ["反方向", ...]]}
stations = new Object();  // 存放站名，{线路: [["站1", "站2", "..."], ...]}


var xhr_map = new XMLHttpRequest();
xhr_map.open("GET", "static/map.xml", false);
xhr_map.send();
root = xhr_map.responseXML.getElementsByTagName("sw")[0];  // 根节点

xml_paths = new Array();
for (var i = 0; i < root.childElementCount; i++) {
    line = root.children[i];
    line_id = line.getAttribute("i")
    line_name = line.getAttribute("lb");
    line_color = "#" + line.getAttribute("lc").slice(2);  // 线路颜色

    // 画路径，存paths，stations
    // 环线
    if (line.getAttribute("loop") === "true") {
        line_child_count = line.childElementCount + 1;
    }
    // 非环线
    else {
        line_child_count = line.childElementCount;
    }

    paths[line_name] = new Array();
    paths[line_name].push(new Array());
    paths[line_name].push(new Array());
    stations[line_name] = new Array();
    stations[line_name].push(new Array());
    stations[line_name].push(new Array());

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
        xml_paths.push(`<path stroke="${line_color}" fill="none" d="${d}"></path>`)
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
    // TODO：画站
    for (var j = 0; j < line.childElementCount; j++) {
        if (line.children[j].getAttribute("st") === "true") {
            stations[line_name][0].push(line.children[j].getAttribute("lb"));
            stations[line_name][1].unshift(line.children[j].getAttribute("lb"));
        }
    }


}

console.log(stations);
console.log(paths);

// 算小车位置

var xhr_sche_wd = new XMLHttpRequest();
xhr_sche_wd.open("GET", "static/schedule_weekday.json", false);
xhr_sche_wd.send();
sche_wd = JSON.parse(xhr_sche_wd.responseText);

var xhr_sche_we = new XMLHttpRequest();
xhr_sche_we.open("GET", "static/schedule_weekend.json", false);
xhr_sche_we.send();
sche_we = JSON.parse(xhr_sche_we.responseText);

now_minute = 0;

console.log(sche_wd);

function get_now_minute(){
    now = new Date()
    return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60 + now.getMilliseconds() / 60000;
}

function start_set_time(begin_minute, show_minute, speed){
    window.setInterval(`set_time(${begin_minute}, ${show_minute}, ${speed})`, 50);
}

function set_time(begin_minute, start_minute, speed){
    time_now = get_now_minute();
    time_offset = time_now - start_minute;
    show_minute_now = begin_minute + time_offset * speed;
    window.now_minute = show_minute_now;
    time = time2hms(show_minute_now);
    time_p = document.getElementById('time');
    time_p.innerText = time;
}
// 画车动画
function draw_trains(begin_minute, end_minute, speed, day) {
    transparency_second = 0.5;
    xml_polygons = new Array();

    if (day === 'wd'){
        sche = sche_wd;
    }
    else if (day === 'we') {
        sche = sche_we;
    }
    else {
        sche = sche_wd;
    }

    for (line_name in sche) {
        direct_index = -1;
        for (direct in sche[line_name]) {
            direct_index += 1;
            console.log(direct_index, direct);
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
                xml_polygon = `<polygon id="T_${train_num}" points="0,0 9,0 3,6 -9,6 -9,0" stroke-width="2" fill="grey" stroke="#790000">${xml_animates.join('')}</polygon>`;
                xml_polygons.push(xml_polygon);
            }
        }
    }

    //svg = document.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'svg');
    //svg.innerHTML = xml_paths.join('') + xml_polygons.join('');

    svg = d3.selectAll("#svg");
    svg.html(xml_paths.join('') + xml_polygons.join(''));

    start_set_time(begin_minute, get_now_minute(), speed);

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