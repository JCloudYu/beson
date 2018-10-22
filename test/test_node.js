(() => {
    'use strict';

    const { serialize, deserialize } = require('../beson');
    const { Int64, UInt64 } = require('../types/uint64');
    const { Int128, UInt128 } = require('../types/uint128');
    const ObjectId = require('../types/objectid/index');

    console.log('* Null:');
    console.log(Buffer.from(serialize(null)));
    console.log('* False:');
    console.log(Buffer.from(serialize(false)));
    console.log('* True:');
    console.log(Buffer.from(serialize(true)));
    console.log('* Int32:');
    console.log(Buffer.from(serialize(2147483647)));                                // 0x7fffffff
    console.log('* Int64:');
    console.log(Buffer.from(serialize(Int64.from(Number.MAX_SAFE_INTEGER))));       // 0x001fffffffffffff
    console.log(Buffer.from(serialize(Int64.from(Number.MIN_SAFE_INTEGER))));       // 0xffe0000000000001
    console.log('* Int128:');
    console.log(Buffer.from(serialize(Int128.from(Int128.MAX))));                   // 0x7fffffffffffffffffffffffffffffff
    console.log(Buffer.from(serialize(Int128.from(Int128.MIN))));                   // 0x80000000000000000000000000000000
    console.log('* UInt64:');
    console.log(Buffer.from(serialize(UInt64.from(Number.MAX_SAFE_INTEGER))));      // 0x001fffffffffffff
    console.log('* UInt128:');
    console.log(Buffer.from(serialize(UInt128.from(UInt128.MAX))));                 // 0xffffffffffffffffffffffffffffffff
    console.log('* Double:');
    console.log(Buffer.from(serialize(Math.PI)));                                   // 0x400921fb54442d18
    console.log('* String:');
    console.log(Buffer.from(serialize('hello world')));
    console.log('* Array:');
    console.log(Buffer.from(serialize([true, 2147483647, Math.PI])));               // length: 17, content: [0x0101, 0x7fffffff, 0x400921fb54442d18]
    console.log('* Object:');
    console.log(Buffer.from(serialize({ a: true, b: 2147483647, c: Math.PI })));
    console.log('* Date:');
    console.log(Buffer.from(serialize(new Date(1539838676247))));                   // 0x4276685898d17000
    console.log('* ObjectId:');
    let objectId = new ObjectId(123);
    console.log(objectId);
    console.log(Buffer.from(serialize(objectId)));
})();
