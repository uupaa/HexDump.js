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
           "------ -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- ---- ASCII ----- --- RULE ----\n"
    };

// --- class / interfaces ----------------------------------
function HexDump(source,    // @arg TypedArray|Array - [0x00, 0x41, 0x53, 0x43, 0x49, 0x49, 0xff, ...]
                 options) { // @arg Object = null - { title, begin, end, rule, fold }
                            // @options.title       String = "" - title
                            // @options.begin       UINT32 = 0 - specify the range to dump
                            // @options.end         UINT32 = source.length - specify the range to dump
                            // @options.fold        Boolean = false - fold the rule information
                            // @options.rule        Object = null - { tag: { style: "color:red", values: [0x00, ...] }, ... }
                            // @options.rule.being  UINT32         = 0 - specify the range to apply the rule
                            // @options.rule.end    UINT32         = source.length - specify the range to apply the rule
                            // @options.rule.values UINTArray      = null - [0x00, 0x01, ...]
                            // @options.rule.style  CSSStyleString = "" - "color:red"
//{@dev
    if (!global["BENCHMARK"]) {
        if (arguments.length >= 3 || (options && typeof options !== "object")) {
            throw new TypeError("BAD_ARGUMENTS");
        }
        $valid($type(source,  "TypedArray|Array"), HexDump, "source");
        $valid($type(options, "Object|omit"),      HexDump, "options");
        $valid($keys(options, "title|begin|end|rule|fold"), HexDump, "options");
        if (options) {
            $valid($type(options.title, "String|omit"), HexDump, "options.title");
            $valid($type(options.begin, "UINT32|omit"), HexDump, "options.begin");
            $valid($type(options.end,   "UINT32|omit"), HexDump, "options.end");
            $valid($type(options.rule,  "Object|omit"), HexDump, "options.rule");
            $valid($type(options.fold,  "Object|omit"), HexDump, "options.fold");
        }
    }
//}@dev

    options = options || {};

    var dumpTitle = options["title"] || "RULE";
    var dumpBegin = options["begin"] || 0;
    var dumpEnd   = options["end"]   || source.length;
    var dumpRule  = options["rule"]  || null;
    var dumpFold  = options["fold"]  || null;
    var unitSize  = Array.isArray(source) ? 1 : source.byteLength / source.length; // 4,2,1
    var ruleStyle     = [];
    var result    = [];
    var consoleStyles = [];
    var styleAndIndex = {}; // { style: styleIndex, ... }

    if (ENABLE_CONSOLE_STYLE && dumpRule) {
        console[dumpFold ? "groupCollapsed" : "group"](dumpTitle + ": " + source.byteLength + "bytes");
        var styleIndex = 1;
        for (var tag in dumpRule) {
            if ("values" in dumpRule[tag]) {
                //  rule: {
                //      foo: { values: [0xFF, 0xFF, 0xFF], style: "color:red" }
                //  }
                _seriesOfElements(ruleStyle, source, dumpRule[tag]["begin"] || 0,
                                                     dumpRule[tag]["end"]   || source.length,
                                                     dumpRule[tag]["values"],
                                                     dumpRule[tag]["style"]);
            } else {
                //  rule: {
                //      foo: { begin: 0, end: 4, style: "color:red" }
                //  }
                _range(ruleStyle, source, dumpRule[tag]["begin"] || 0,
                                          dumpRule[tag]["end"]   || source.length,
                                          dumpRule[tag]["style"]);
            }
            styleAndIndex[ dumpRule[tag]["style"] ] = styleIndex;
            console.log("%c [" + (styleIndex++) + "] " + tag, dumpRule[tag]["style"]);
        }
        console.groupEnd();
    }

    result.push(DUMP_HEADER[unitSize], _getHexAddress(dumpBegin), " ");

    var lineASCII = [];
    var lineCSS = [];

    for (var i = dumpBegin, iz = Math.min(dumpEnd, source.length), x = 0; i < iz; ++i, x += unitSize) {
        if (i !== dumpBegin) {
            if ( x % 16 === 0 ) {
                // make new line
                if (unitSize === 1) { // add line ascii dump
                    result.push(" ", lineASCII.join(""), " ", lineCSS.length ? "[" + lineCSS.sort().join("][") + "]" : "");
                    lineASCII.length = 0;
                    lineCSS.length = 0;
                }
                result.push("\n", _getHexAddress(i));
            }
            result.push(" ");
        }
        var v = source[i];
        var styling = false;

        if (ENABLE_CONSOLE_STYLE) {
            if (ruleStyle[i]) {
                styling = true;
                result.push("%c");
                consoleStyles.push(ruleStyle[i]);
            }
        }
        result.push( ("0000000" + v.toString(16)).slice(-(unitSize * 2)) );
        if (styling) {
            result.push("%c");
            consoleStyles.push("color:black");
        }

        if (unitSize === 1) { // make ascii code
            if (v >= 32 && v <= 126) {
                lineASCII.push(String.fromCharCode(v));
            } else {
                lineASCII.push(".");
            }

            var appliedCSSIndex = styleAndIndex[ruleStyle[i]] || 0;

            if (appliedCSSIndex) {
                if (lineCSS.indexOf(appliedCSSIndex) < 0) {
                    lineCSS.push(appliedCSSIndex);
                }
//              consoleStyles.push(ruleStyle[i]);
//              consoleStyles.push("color:black");
            }
        }
    }
    if (unitSize === 1 && String.prototype.repeat) { // dump to remaind ascii code
        var padLength = (16 - lineASCII.length) * 3 + 1;
        console.log.apply(console, [result.join("") + " ".repeat(padLength) + lineASCII.join("")].concat(consoleStyles));
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
                    // --- apply rule style text string ---
                    for (x = 0, xz = values.length; x < xz; ++x) {
                        result[i + x] = cssText;
                    }
                }
            }
        }
    }
    function _range(result, source, begin, end, cssText) {
        for (var i = 0, iz = source.length; i < iz; ++i) {
            if (i >= begin && i < end) {
                // --- apply rule style text string ---
                result[i] = cssText;
            }
        }
    }
}

HexDump["repository"] = "https://github.com/uupaa/HexDump.js";

// --- implements ------------------------------------------

return HexDump; // return entity

});

