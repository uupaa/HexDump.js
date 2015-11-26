# HexDump.js [![Build Status](https://travis-ci.org/uupaa/HexDump.js.svg)](https://travis-ci.org/uupaa/HexDump.js)

[![npm](https://nodei.co/npm/uupaa.hexdump.js.svg?downloads=true&stars=true)](https://nodei.co/npm/uupaa.hexdump.js/)

Hex dump

This module made of [WebModule](https://github.com/uupaa/WebModule).

## Documentation
- [Spec](https://github.com/uupaa/HexDump.js/wiki/)
- [API Spec](https://github.com/uupaa/HexDump.js/wiki/HexDump)

## Browser, NW.js and Electron

```js
<script src="<module-dir>/lib/WebModule.js"></script>
<script src="<module-dir>/lib/HexDump.js"></script>
<script>
TypedArray.dump([1,2,3], {
    begin: 0,
    end:   3,
    style: {
        values1: { css: "color:red",  values: [0xEA, 0xE6, 0xAA, 0xB0] },
        values2: { css: "color:blue", values: [0x5E, 0x46, 0x43, 0x2C] },
        range1:  { css: "color:green", begin: 8, end: 10 },
        range2:  { css: "color:pink", begin: 20 },
        valuesWithRange0x50: { css: "color:blue", begin: 23, values: [0x50] },
        valuesWithRange0x51: { css: "color:blue", begin: 23, values: [0x51] },
        valuesWithRange0x52: { css: "color:blue", begin: 23, values: [0x52] },
    }
});
</script>
```

## WebWorkers

```js
importScripts("<module-dir>lib/WebModule.js");
importScripts("<module-dir>lib/HexDump.js");

TypedArray.dump([1,2,3], {
    begin: 0,
    end:   3,
    style: {
        values1: { css: "color:red",  values: [0xEA, 0xE6, 0xAA, 0xB0] },
        values2: { css: "color:blue", values: [0x5E, 0x46, 0x43, 0x2C] },
        range1:  { css: "color:green", begin: 8, end: 10 },
        range2:  { css: "color:pink", begin: 20 },
        valuesWithRange0x50: { css: "color:blue", begin: 23, values: [0x50] },
        valuesWithRange0x51: { css: "color:blue", begin: 23, values: [0x51] },
        valuesWithRange0x52: { css: "color:blue", begin: 23, values: [0x52] },
    }
});
```

## Node.js

```js
require("<module-dir>lib/WebModule.js");
require("<module-dir>lib/HexDump.js");

TypedArray.dump([1,2,3], {
    begin: 0,
    end:   3,
    style: {
        values1: { css: "color:red",  values: [0xEA, 0xE6, 0xAA, 0xB0] },
        values2: { css: "color:blue", values: [0x5E, 0x46, 0x43, 0x2C] },
        range1:  { css: "color:green", begin: 8, end: 10 },
        range2:  { css: "color:pink", begin: 20 },
        valuesWithRange0x50: { css: "color:blue", begin: 23, values: [0x50] },
        valuesWithRange0x51: { css: "color:blue", begin: 23, values: [0x51] },
        valuesWithRange0x52: { css: "color:blue", begin: 23, values: [0x52] },
    }
});
```

