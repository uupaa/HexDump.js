var ModuleTestHexDump = (function(global) {

global["BENCHMARK"] = false;

var test = new Test("HexDump", {
        disable:    false, // disable all tests.
        browser:    true,  // enable browser test.
        worker:     true,  // enable worker test.
        node:       true,  // enable node test.
        nw:         true,  // enable nw.js test.
        el:         true,  // enable electron (render process) test.
        button:     true,  // show button.
        both:       true,  // test the primary and secondary modules.
        ignoreError:false, // ignore error.
        callback:   function() {
        },
        errorback:  function(error) {
            console.error(error.message);
        }
    }).add([
        testHexDump_dumpRadix,
        testHexDump_dumpStyle,
        testHexDump_dumpOverflow,
    ]);

if (IN_BROWSER || IN_NW || IN_EL) {
    test.add([
        // Browser, NW.js and Electron test
    ]);
} else if (IN_WORKER) {
    test.add([
        // WebWorkers test
    ]);
} else if (IN_NODE) {
    test.add([
        // Node.js test
    ]);
}

// --- test cases ------------------------------------------
function testHexDump_dumpRadix(test, pass, miss) {
    var src8  = _makeRndomValue(60).map(function(v) { return v & 0xff });
    var src16 = _makeRndomValue(60).map(function(v) { return v & 0xffff });
    var src32 = _makeRndomValue(60).map(function(v) { return v & 0xffffffff });

    HexDump(new Uint8Array(src8));
    HexDump(new Uint16Array(src16));
    HexDump(new Uint32Array(src32));

    test.done(pass());
}

function _makeRndomValue(length) {
    var result = [];
    var random = new Random();
    for (var i = 0, iz = length; i < iz; ++i) {
        result.push( random.next() );
    }
    return result;
}

function testHexDump_dumpStyle(test, pass, miss) {
    var src8 = _makeRndomValue(60).map(function(v) { return v & 0xff });

    HexDump(new Uint8Array(src8), {
        title: "testHexDump_dumpStyle",
        rule: {
            values1: { style: "color:red",  values: [0xEA, 0xE6, 0xAA, 0xB0] },
            values2: { style: "color:blue", values: [0x5E, 0x46, 0x43, 0x2C] },
            range1:  { style: "color:green", begin: 8, end: 10 },
            range2:  { style: "background-color:yellow", begin: 0x23 },
            valuesWithRange0x50: { bold: true, style: "color:blue", begin: 0x1a, values: [0x50] },
            valuesWithRange0x51: { bold: true, style: "color:blue", begin: 0x1a, values: [0x51] },
            valuesWithRange0x52: { bold: true, style: "color:blue", begin: 0x1a, values: [0x52] },
        }
    });

    test.done(pass());
}

function testHexDump_dumpOverflow(test, pass, miss) {
    try {
        HexDump([1,2,3], {
            title: "testHexDump_dumpOverflow",
            begin: 0,
            end: 1000
        });
        test.done(pass());
    } catch (error) {
        test.done(miss());
    }
}

return test.run();

})(GLOBAL);

