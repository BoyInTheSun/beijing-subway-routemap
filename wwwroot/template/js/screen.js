
function adjustToFreezeWidth(rootSvg) {
    var windowWidth = $(window).width();
 
    var viewBoxVal = rootSvg.getAttribute("viewBox");
    var viewBoxWidth = viewBoxVal.split(",")[2];
    var viewBoxHeight = viewBoxVal.split(",")[3];
    rootSvg.removeAttribute("width");
    rootSvg.removeAttribute("height");
 
    var setWidth = windowWidth;
    var setHeight = (setWidth * viewBoxHeight) / viewBoxWidth;
    rootSvg.setAttribute("width", setWidth);
    rootSvg.setAttribute("height", setHeight);
}
 
function adjustToNone(rootSvg) {
 
    var viewBoxVal = rootSvg.getAttribute("viewBox");
    var viewBoxWidth = viewBoxVal.split(",")[2];
    var viewBoxHeight = viewBoxVal.split(",")[3];
    rootSvg.removeAttribute("width");
    rootSvg.removeAttribute("height");
 
    rootSvg.setAttribute("width", viewBoxWidth);
    rootSvg.setAttribute("height", viewBoxHeight);
 
}
 
function adjustToFreezeHeight(rootSvg) {
 
    var windowHeight = $(window).height();
 
    var viewBoxVal = rootSvg.getAttribute("viewBox");
    var viewBoxWidth = viewBoxVal.split(",")[2];
    var viewBoxHeight = viewBoxVal.split(",")[3];
    rootSvg.removeAttribute("width");
    rootSvg.removeAttribute("height");
 
    var setHeight = windowHeight;
    var setWidth = (setHeight * viewBoxWidth)/viewBoxHeight;
    rootSvg.setAttribute("width", setWidth);
    rootSvg.setAttribute("height", setHeight);
}
 
function adjustToFreezeAll() {
 
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    
    rootSvg.removeAttribute("width");
    rootSvg.removeAttribute("height");
 
    rootSvg.setAttribute("width", windowWidth);
    rootSvg.setAttribute("height", windowHeight);
 
}