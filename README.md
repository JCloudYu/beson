# BESON - Binary Extended JSON #
Beson library is an es6 compatible library that allows users to encode and transfer javascript data with binary format. Beson library is similar to BSON format used in mongodb. The major difference between beson and bson is that beson allows primitive data to be encoded directly. Beson is designed to transfer or store data in a binary format, not specialized for database storage.


## How to use ##
### For Browser ###
Just use the following es6 module import statement.
```html
<script type='module'>
    import {Serialize, Deserialize} from "https://cdn.jsdelivr.net/gh/jcloudyu/beson/beson.esm.js";
    ...
</script>
```

### For NodeJS ###
Beson contains two different versions, 0.9.X and 1.x or greater. Beson@1.x is completely written in es module and 0.9 is written using CommonJS modules.

#### CommonJS Module (beson@0.9.x) ####
You can simply use the following statement in NodesJS to use beson.
```javascript
const { Deserialize, Serialize } = require('beson');
...
```
#### Run Unit Test ####
```
node --experimental-modules --loader ./.loader.mjs unit-test.mjs
```
#### ES Module ( beson@1.x ) ####
Since that the module is completely written in es module, NodeJS requires more steps to make beson work! NodeJS requires [ESM Resolve Hook](https://nodejs.org/api/esm.html#esm_resolve_hook) to load modules ended with .esm.js. This repo contains the predefined [loader script](https://github.com/JCloudYu/beson/blob/master/_supportive/loader.mjs) for NodeJS developers who doesn't want to write one...

Assume you have have the following [loader script](https://github.com/JCloudYu/beson/blob/master/_supportive/loader.mjs) and store at "\[PATH\]/loader.mjs"
```javascript
// This file is to provide simple straitforawrd logic that makes
// NodeJS process modules ended with .js. Using this loader the 
// modules ended with .esm.js will be treated as es modules.
import path from 'path';
import process from 'process';

const BaseURL = new URL("file://");
BaseURL.pathname = `${process.cwd()}/`;

export function resolve(specifier, parentModuleURL, defaultResolve) {
	if (specifier.substr(-7) === ".esm.js") {
		return {
			url: new URL(specifier, parentModuleURL||BaseURL).href,
			format: 'esm'
		};
	}
	
	return defaultResolve(specifier, parentModuleURL);
}
```

And you have to use the following command line options to execute your script.
```bash
node --experimental-modules --loader [PATH]/loader.mjs [PATH TO YOUR VERY OWN SCRIPT]
```

Once you're prepared to run the script, you can use the following statement to use beson.
```javascript
import {Deserialize, Serialize} from "beson";
...
```


## Basic Usage ##
Beson is shipped with Serialize and Deserialize apis for developers who wants to encode and decode data.

### Serialize ###
Just call ```Serialize``` with any data you want to encode, and an ArrayBuffer object contains the encoded data is returned...
```javascript
import { Serialize } from 'beson';

// Encode primitive data
let buf_null = Serialize(null);                                 // null
let buf_bool = Serialize(false);                                // boolean
let buf_num  = Serialize(123456);                               // js number (double)
let buf_num2 = Serialize(Math.PI);                              // js number (double)
let buf_str  = Serialize('Hello World');                        // string ( encoded in UTF8 )

// Encode objects
let buf_date = Serialize(new Date());                           // Date
let buf_obj  = Serialize({                                      // Arbitrary object
    a:1, b:2, c:3, d:false, "5":"string"
});
let buf_arry = Serialize([                                      // Arbitrary array
    null, 1, false, Math.E, 'HI', [ 1, 2, 3 ]
]);

let buf_ab   = Serialize(new ArrayBuffer(24));                  // ArrayBuffer
let buf_ta1  = Serialize(new Uint8Array(24));                   // UInt8Array
let buf_ta2  = Serialize(new Uint16Array(24));                  // UInt16Array
let buf_ta3  = Serialize(new Uint32Array(24));                  // UInt32Array
let buf_ta4  = Serialize(new Int8Array(24));                    // Int8Array
let buf_ta5  = Serialize(new Int16Array(24));                   // Int16Array
let buf_ta6  = Serialize(new Int32Array(24));                   // Int32Array
let buf_ta7  = Serialize(new Float32Array(24));                 // Float32Array
let buf_ta8  = Serialize(new Float64Array(24));                 // Float64Array
let buf_dv   = Serialize(new DataView(new ArrayBuffer(30)));    // DataView Object
```

#### Deserialize ####
Just call ```Deserialize``` with any beson encoded ArrayBuffer data, the corresponding value is returned...
```javascript
import { Deserialize } from "beson";

// Do the encode...
let buf = Serialize('Hello World');
let data = Deserialize(buf);
console.log(data); // Hello World
```


## Some Extended Usage ##
Beson also provides other types that for developers who want to specifically controls the data they want to encode, such as uint32 or uint64. Following list are types that are provided by beson. ( These types can be found in Beson exports )

```javascript
Int32 / UInt32
Int64 / UInt64
Int128 / UInt128
ObjectId
Binary
```

## Friendly Reminders ##
- This library is released under ISC license, and currently this library is still under development. So... use at your own risk!!!
- We're currently focusing on improving beson@1.x. So there may be some inconsistent behaviors between v0.9 and v1.x. When you encounter something awkward, don't hesitate to give us feed back, we'll fix the problem right away! 
