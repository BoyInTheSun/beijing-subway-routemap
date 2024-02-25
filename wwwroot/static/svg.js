function ab2c(a, b) {
    return Math.sqrt(a * a + b * b);
}

function ban_event(event) {
    event.preventDefault();
}

function svg_init_xy() {
    var div_svg = document.getElementById('div_svg');
    console.log(div_svg.style.top)
    div_svg.style.top = ((parseFloat(window.screen.height) - 1600) / 2 + 40) + 'px';
    div_svg.style.left = ((parseFloat(window.screen.width) - 2000) / 2 + 60) + 'px';
}

function svg_on_whell(event) {
    var div_svg = document.getElementById('div_svg');
    var zoom_now = parseFloat(div_svg.style.transform.slice(6, -1));
    var multiple = 1 + event.wheelDeltaY / 1200;
    div_svg.style.transform = `scale(${zoom_now * multiple})`;
    div_svg.style.left = (event.clientX + (parseFloat(div_svg.style.left) - event.clientX) * multiple) + 'px';
    div_svg.style.top = (event.clientY + (parseFloat(div_svg.style.top) - event.clientY) * multiple) + 'px';
}

function svg_on_down(event) {
    var div_svg = document.getElementById('div_svg');
    console.log('down', event)

    var div_left_start = parseFloat(div_svg.style.left);
    var div_top_start = parseFloat(div_svg.style.top);

    // move
    if (event.type === 'mousedown') {
        // mouse
        var mouse_x_start = event.clientX;
        var mouse_y_start = event.clientY;
    }
    else if (event.type === 'touchstart') {
        // touch
        var mouse_x_start = event.touches[0].clientX;
        var mouse_y_start = event.touches[0].clientY;
    }
    var touches_0_x_start;
    var touches_0_y_start;
    var touches_1_x_start;
    var touches_1_y_start;
    var left_start;
    var top_start;
    var zoom_start;
    var distance_start;

    function move(event) {
        var mouse_x_now;
        var mouse_y_now;
        console.log(event.type)
        if (event.type === 'mousemove') {
            // mouse
            mouse_x_now = event.clientX;
            mouse_y_now = event.clientY;
        }
        else if (event.type === 'touchmove') {
            if (event.touches.length === 1) {
                // single touch
                mouse_x_now = event.touches[0].clientX;
                mouse_y_now = event.touches[0].clientY;
            }
            else if (event.touches.length >= 1) {
                // dobule touch
                touches_0_x_start = event.touches[0].clientX;
                touches_0_y_start = event.touches[0].clientY;
                touches_1_x_start = event.touches[1].clientX;
                touches_1_y_start = event.touches[1].clientY;
                left_start = parseFloat(div_svg.style.left);
                top_start = parseFloat(div_svg.style.top);
                zoom_start = parseFloat(div_svg.style.transform.slice(6, -1));
                distance_start = ab2c(touches_0_x_start - touches_1_x_start, touches_0_y_start - touches_1_y_start);

                document.removeEventListener('mousemove', move);
                document.removeEventListener('touchmove', move);
                document.addEventListener('touchmove', zoom);

            }
        }
        div_svg.style.left = (div_left_start + mouse_x_now - mouse_x_start) + 'px';
        div_svg.style.top = (div_top_start + mouse_y_now - mouse_y_start) + 'px';

    }
    function zoom(event) {
        var touches_0_x_now = event.touches[0].clientX;
        var touches_0_y_now = event.touches[0].clientY;
        var touches_1_x_now = event.touches[1].clientX;
        var touches_1_y_now = event.touches[1].clientY;
        var distance_now = ab2c(touches_0_x_now - touches_1_x_now, touches_0_y_now - touches_1_y_now);
        var multiple = 1 + (distance_now - distance_start) / 300;
        div_svg.style.transform = `scale(${zoom_start * multiple})`;
        var x0 = (touches_0_x_now + touches_1_x_now) / 2;
        var y0 = (touches_0_y_now + touches_1_y_now) / 2;
        console.log(multiple, div_svg.style.left, x0, x0 + (parseFloat(div_svg.style.left) - x0) * multiple)

        div_svg.style.left = (x0 + (left_start - x0) * multiple) + 'px';
        div_svg.style.top = (y0 + (top_start - y0) * multiple) + 'px';
    }
    function stop(event) {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('touchmove', move);
        document.removeEventListener('mouseup', stop);
        document.removeEventListener('touchend', stop);
        document.removeEventListener('touchmove', zoom);
    }

    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move);
    document.addEventListener('mouseup', stop);
    document.addEventListener('touchend', stop);
}
var div_svg_parent = document.getElementById('div_svg_parent');

div_svg_parent.addEventListener('mousedown', svg_on_down);
div_svg_parent.addEventListener('touchstart', svg_on_down);
div_svg_parent.addEventListener('mousedown', svg_on_down);
div_svg_parent.addEventListener('wheel', svg_on_whell);


div_svg_parent.addEventListener('wheel', ban_event);
div_svg_parent.addEventListener('mousedown', ban_event);
div_svg_parent.addEventListener('touchstart', ban_event);
div_svg_parent.addEventListener('touchmove', ban_event);
