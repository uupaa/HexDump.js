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
                            // @options.rule.values UINTArray      = null  - [0x00, 0x01, ...]
                            // @options.rule.style  CSSStyleString = ""    - "background-color:yellow"
                            // @options.rule.bold   Boolean        = false - apply "font-weight:bold" style
//{@dev
    if (!global["BENCHMARK"]) {
        if (arguments.length >= 3 || (options && typeof options !== "object")) {
            throw new TypeError("BAD_ARGUMENTS");
        }
        $valid($type(source,  "TypedArray|Array"), HexDump, "source");
        $valid($type(options, "Object|omit"),      HexDump, "options");
        $valid($keys(options, "title|begin|end|fold|rule"), HexDump, "options");
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
    var result    = [];
    var tagMap    = []; // [ 0:[tag, ...], 1:[tag, ...], ... ]
    var tagIndexMap = {}; // { tag: index, ... }
    var consoleStyles = [];

    if (ENABLE_CONSOLE_STYLE && dumpRule) {
        console[dumpFold ? "groupCollapsed" : "group"](dumpTitle + ": " + source.length + " bytes");
        _tagging(source, dumpRule, tagIndexMap, tagMap);
        console.groupEnd();
    }

    result.push(DUMP_HEADER[unitSize], _getHexAddress(dumpBegin), " ");

    var asciiDump = [];  // ascii dump of each line
    var tagIndexes = []; // tag indexes at each line

    for (var i = dumpBegin, iz = Math.min(dumpEnd, source.length), x = 0; i < iz; ++i, x += unitSize) {
        if (i !== dumpBegin) {
            if ( x % 16 === 0 ) {
                // make new line
                if (unitSize === 1) {
                    // add ascii and tag
                    result.push(" ", asciiDump.join(""),
                                " ", tagIndexes.length ? "[" + tagIndexes.sort().join("][") + "]" : "");
                    asciiDump.length  = 0;
                    tagIndexes.length = 0;
                }
                result.push("\n", _getHexAddress(i));
            }
            result.push(" ");
        }
        var v = source[i];
        var hasTag = ENABLE_CONSOLE_STYLE && !!tagMap[i];

        if (hasTag) {
            result.push("%c");
            consoleStyles.push( _getConsoleStyle(dumpRule, tagMap[i]) );
        }
        result.push( ("0000000" + v.toString(16)).slice(-(unitSize * 2)) );
        if (hasTag) {
            result.push("%c");
            consoleStyles.push("");
        }

        if (unitSize === 1) {
            asciiDump.push( (v >= 32 && v <= 126) ? String.fromCharCode(v) : "." );

            if (Array.isArray(tagMap[i])) {
                _addTagIndex(tagIndexes, tagMap[i], tagIndexMap);
            }
        }
    }

    if (unitSize === 1 && String.prototype.repeat) {
        var padLength = (16 - asciiDump.length) * 3 + 1;
        var remainRule = "";
        if (tagIndexes.length) {
            remainRule = " ".repeat(16 - asciiDump.length + 1) + "[" + tagIndexes.sort().join("][") + "]";
        }
        console.log.apply(console, [result.join("") + " ".repeat(padLength) + asciiDump.join("") + remainRule].concat(consoleStyles));
        return;
    }
    console.log.apply(console, [result.join("")].concat(consoleStyles));
}

HexDump["repository"] = "https://github.com/uupaa/HexDump.js";

// --- implements ------------------------------------------
function _getHexAddress(i) {
    return (0x1000000 + i).toString(16).slice(-6);
}

function _addTagIndex(tagIndexes, tags, tagIndexMap) {
    for (var i = 0, iz = tags.length; i < iz; ++i) {
        var tag   = tags[i];
        var index = tagIndexMap[tag];
        var pos   = tagIndexes.indexOf(index);
        if (pos < 0) {
            tagIndexes.push(index);
        }
    }
}

function _getConsoleStyle(dumpRule, tags) {
    var style = [];
    for (var i = 0, iz = tags.length; i < iz; ++i) {
        var tag = tags[i];

        style.push( dumpRule[tag]["style"] );
        if (dumpRule[tag]["bold"]) {
            style.push("font-weight:bold");
        }
    }
    return style.join(";");
}

function _tagging(source, dumpRule, tagIndexMap, tagMap) {
    var tagIndex = 1;

    for (var tag in dumpRule) { // { rule: { tag, ... } }
        tagIndexMap[tag] = tagIndex;

        if ("values" in dumpRule[tag]) { // match range and values
            //  rule: {
            //      foo: { values: [0xFF, 0xFF, 0xFF], style: "color:red" }
            //  }
            _seriesOfElements(tagMap, tag, source, dumpRule[tag]["begin"] || 0,
                                                   dumpRule[tag]["end"]   || source.length,
                                                   dumpRule[tag]["values"]);
        } else { // match range
            //  rule: {
            //      foo: { begin: 0, end: 4, style: "color:red" }
            //  }
            _range(tagMap, tag, source, dumpRule[tag]["begin"] || 0,
                                        dumpRule[tag]["end"]   || source.length);
        }
        if (dumpRule[tag]["bold"]) {
            console.log("%c [" + tagIndex + "] " + tag, dumpRule[tag]["style"] + ";font-weight:bold");
        } else {
            console.log("%c [" + tagIndex + "] " + tag, dumpRule[tag]["style"]);
        }
        tagIndex++;
    }
}

function _seriesOfElements(tagMap, tag, source, begin, end, values) {
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
                    if (!tagMap[i + x]) {
                        tagMap[i + x] = [];
                    }
                    tagMap[i + x].push(tag);
                }
            }
        }
    }
}

function _range(tagMap, tag, source, begin, end) {
    for (var i = 0, iz = source.length; i < iz; ++i) {
        if (i >= begin && i < end) {
            // --- apply rule style text string ---
            if (!tagMap[i]) {
                tagMap[i] = [];
            }
            tagMap[i].push(tag);
        }
    }
}

return HexDump; // return entity

});

