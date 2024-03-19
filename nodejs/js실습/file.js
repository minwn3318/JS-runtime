const fs = require("fs");

//fs.mkdir("HelloWolrd!!");

console.log("hello!!");

// node:internal/validators:455
//     throw new ERR_INVALID_ARG_TYPE(name, 'Function', value);
//     ^

// TypeError [ERR_INVALID_ARG_TYPE]: The "cb" argument must be of type function. Received undefined
//     at makeCallback (node:fs:187:3)
//     at Object.mkdir (node:fs:1346:14)
//     at Object.<anonymous> (C:\Users\minwn\OneDrive\바탕 화면\jsblock\JS-runtime\nodejs\js실습\file.js:3:4)
//     at Module._compile (node:internal/modules/cjs/loader:1376:14)
//     at Module._extensions..js (node:internal/modules/cjs/loader:1435:10)
//     at Module.load (node:internal/modules/cjs/loader:1207:32)
//     at Module._load (node:internal/modules/cjs/loader:1023:12)
//     at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:135:12)
//     at node:internal/main/run_main_module:28:49 {
//   code: 'ERR_INVALID_ARG_TYPE'
// }