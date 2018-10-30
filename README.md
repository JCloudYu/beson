# BESON - Binary Extended JSON #

## For user ##

### How to use ###

#### Serialize ####

```javascript
const { Serialize } = require('beson');
const { ObjectId, Binary, Int64, UInt64, Int128, UInt128 } = require('beson');

let buf1 = Serialize(null);                             // null
let buf2 = Serialize(false);                            // boolean
let buf3 = Serialize(123456);                           // Int32 value
let buf4 = Serialize(Int64.from(Int64.MAX));            // Int64 value
let buf5 = Serialize(Int128.from(Int128.MAX));          // Int128 value
let buf6 = Serialize(UInt64.from(UInt64.MAX));          // UInt64
let buf7 = Serialize(UInt128.from(UInt128.MAX));        // UInt128
let buf8 = Serialize(Math.PI);                          // double
let buf9 = Serialize('Hello World');                    // string
let buf10 = Serialize(new Date(1539838676247));         // Date
let buf11 = Serialize(new ObjectId(123));               // ObjectId

let bin = Binary.from(Serialize(123456));
let buf12 = Serialize(bin);                             // Binary

let arr = [123, true, 'Hello World'];
let buf13 = Serialize(arr);                             // array
let buf14 = Serialize(arr, { streaming_array: true });  // array (streaming)

let obj = { k1: 123, k2: true, k3: 'Hello World' };
let buf15 = Serialize(obj);                             // Object
let buf16 = Serialize(obj, { sort_key: true });         // Object (sort key)
let buf17 = Serialize(obj, { streaming_object: true }); // Object (streaming)
```

#### Deserialize ####

```javascript
const { Deserialize } = require('beson');
let buf = Serialize('Hello World');
let data = Deserialize(buf);
console.log(data);                                      // Hello World
```

## For maintainer ##

### Install project ###

* Clone project:
    > git clone \<project-url\>

* Install dependency package:
    > npm install

### Build and Run ###

#### Run test_node ####

* Use npm:
    > npm run test_node

#### Run test_mocha ####

* Install mocha globally:
    > npm install -g mocha

* Use npm:
    > npm run test_mocha
