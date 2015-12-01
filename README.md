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
HexDump([1,2,3], {
    title: "Example",
    begin: 0,
    end:   3,
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
</script>
```

## WebWorkers

```js
importScripts("<module-dir>lib/WebModule.js");
importScripts("<module-dir>lib/HexDump.js");

...
```

## Node.js

```js
require("<module-dir>lib/WebModule.js");
require("<module-dir>lib/HexDump.js");

...
```

