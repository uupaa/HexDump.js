(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("HexDump", function moduleClosure(global) {
"use strict";

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
var ENABLE_CONSOLE_STYLE = (IN_BROWSER && /Chrome/.test(global["navigator"]["userAgent"])) || IN_EL;
var DUMP_HEADER = {
        4: "ADDR          0        1        2        3\n" +
           "------ -------- -------- -------- --------\n",
        2: "ADDR      0    1    2    3    4    5    6    7\n" +
           "------ ---- ---- ---- ---- ---- ---- ---- ----\n",
        1: "ADDR    0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F\n" +
           "------ -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --\n"
    };

// --- class / interfaces ----------------------------------
function HexDump(source,    // @arg TypedArray|Array - [0x00, 0x41, 0x53, 0x43, 0x49, 0x49, 0xff, ...]
                 options) { // @arg Object = null - { begin, end, style }
                            // @options.begin UINT32 = 0 - begin address
                            // @options.end   UINT32 = source.length - end address
                            // @options.style Object = null - { tag: { css: "color:red", values: [0x00, ...] }, ... }
//{@dev
    if (!global["BENCHMARK"]) {
        if (arguments.length >= 3 || (options && typeof options !== "object")) {
            throw new TypeError("BAD_ARGUMENTS");
        }
        $valid($type(source,  "TypedArray|Array"), HexDump, "source");
        $valid($type(options, "Object|omit"),      HexDump, "options");
        $valid($keys(options, "begin|end|style"),  HexDump, "options");
        if (options) {
            $valid($type(options.begin, "UINT32|omit"), HexDump, "options.begin");
            $valid($type(options.end,   "UINT32|omit"), HexDump, "options.end");
            $valid($type(options.style, "Object|omit"), HexDump, "options.style");
        }
    }
//}@dev

    options = options || {};

    var begin    = options["begin"]  || 0;
    var end      = options["end"]    || source.length;
    var style    = options["style"]  || null;
    var unitSize = Array.isArray(source) ? 1 : source.byteLength / source.length; // 4,2,1
    var css      = [];
    var result   = [];
    var digit    = { 10: { 1: 3, 2: 5, 4: 10 }, 2: { 1: 8, 2: 16, 4: 32 } };
    var maxDigit = { 16: 16, 10: 8, 2: 8 };
    var padding  = { 10: "        ", 2: "0000000000000000000000000000000" };
    var ascii    = [];
    var consoleStyles = [];

    if (ENABLE_CONSOLE_STYLE && style) {
        for (var tag in style) {
            if ("values" in style[tag]) {
                //  style: {
                //      foo: { values: [0xFF, 0xFF, 0xFF], css: "color:red" }
                //  }
                _seriesOfElements(css, source, style[tag]["begin"] || 0,
                                               style[tag]["end"]   || source.length,
                                               style[tag]["values"],
                                               style[tag]["css"]);
            } else {
                //  style: {
                //      foo: { begin: 0, end: 4, css: "color:red" }
                //  }
                _range(css, source, style[tag]["begin"] || 0,
                                    style[tag]["end"]   || source.length,
                                    style[tag]["css"]);
            }
        }
    }

    result.push(DUMP_HEADER[unitSize], _getHexAddress(begin), " ");

    for (var i = begin, iz = Math.min(end, source.length), x = 0; i < iz; ++i, x += unitSize) {
        if (i !== begin) {
            if ( x % 16 === 0 ) {
                // make ADDRESS
                if (unitSize === 1) { // add ascii dump
                    result.push(" ", ascii.join(""));
                    ascii.length = 0;
                }
                result.push("\n", _getHexAddress(i));
            }
            result.push(" ");
        }
        var v = source[i];
        var marked = false;

        if (ENABLE_CONSOLE_STYLE) {
            if (css[i]) {
                marked = true;
                result.push("%c");
                consoleStyles.push(css[i]);
            }
        }
        result.push( ("0000000" + v.toString(16)).slice(-(unitSize * 2)) );
        if (marked) {
            result.push("%c");
            consoleStyles.push("color:black");
        }

        if (unitSize === 1) { // make ascii code
            if (v >= 32 && v <= 126) {
                ascii.push(String.fromCharCode(v));
            } else {
                ascii.push(".");
            }
        }
    }
    if (unitSize === 1 && String.prototype.repeat) { // dump to remaind ascii code
        var padLength = (16 - ascii.length) * 3 + 1;
        console.log.apply(console, [result.join("") + " ".repeat(padLength) + ascii.join("")].concat(consoleStyles));
        return;
    }
    console.log.apply(console, [result.join("")].concat(consoleStyles));

    function _getHexAddress(i) {
        return (0x1000000 + i).toString(16).slice(-6);
    }

    function _seriesOfElements(result, source, begin, end, values, cssText) {
        for (var i = begin, iz = end; i < iz; ++i) {
            if (source[i] === values[0]) {
                // --- find the series of elements ---
                for (var x = 0, xz = values.length; x < xz; ++x) {
                    if (source[i + x] !== values[x]) {
                        break;
                    }
                }
                if (x >= xz) { // matched
                    // --- apply css text string ---
                    for (var x = 0, xz = values.length; x < xz; ++x) {
                        result[i + x] = cssText;
                    }
                }
            }
        }
    }
    function _range(result, source, begin, end, cssText) {
        for (var i = 0, iz = source.length; i < iz; ++i) {
            if (i >= begin && i < end) {
                // --- apply css text string ---
                result[i] = cssText;
            }
        }
    }
}

HexDump["repository"] = "https://github.com/uupaa/HexDump.js";

// --- implements ------------------------------------------

return HexDump; // return entity

});

