(() => {
    'use strict';

    const { Serialize, Deserialize } = require('../beson');
    const { Int64, UInt64 } = require('../types/uint64');
    const { Int128, UInt128 } = require('../types/uint128');
    const ObjectId = require('../types/objectid/index');
    const { Binary } = require('../types/binary');

    console.log('* Null:');
    console.log(Buffer.from(Serialize(null)));
    console.log('* False:');
    console.log(Buffer.from(Serialize(false)));
    console.log('* True:');
    console.log(Buffer.from(Serialize(true)));
    console.log('* Int32:');
    console.log(Buffer.from(Serialize(2147483647)));                                // 0x7fffffff
    console.log('* Int64:');
    console.log(Buffer.from(Serialize(Int64.from(Number.MAX_SAFE_INTEGER))));       // 0x001fffffffffffff
    console.log(Buffer.from(Serialize(Int64.from(Number.MIN_SAFE_INTEGER))));       // 0xffe0000000000001
    console.log('* Int128:');
    console.log(Buffer.from(Serialize(Int128.from(Int128.MAX))));                   // 0x7fffffffffffffffffffffffffffffff
    console.log(Buffer.from(Serialize(Int128.from(Int128.MIN))));                   // 0x80000000000000000000000000000000
    console.log('* UInt64:');
    console.log(Buffer.from(Serialize(UInt64.from(Number.MAX_SAFE_INTEGER))));      // 0x001fffffffffffff
    console.log('* UInt128:');
    console.log(Buffer.from(Serialize(UInt128.from(UInt128.MAX))));                 // 0xffffffffffffffffffffffffffffffff
    console.log('* Double:');
    console.log(Buffer.from(Serialize(Math.PI)));                                   // 0x400921fb54442d18
    console.log('* String:');
    console.log(Buffer.from(Serialize('hello world')));
    console.log('* Array:');
    console.log(Buffer.from(Serialize([true, 2147483647, Math.PI])));               // length: 17, content: [0x0101, 0x7fffffff, 0x400921fb54442d18]
    
    const Obj = {z:1234567};
    Obj.b = 1; Obj.a = false; Obj._ = "test"; Obj.PI = Math.PI;
    console.log('* Object - obj1:');
    const Obj1Buff = Buffer.from(Serialize(Obj));
    console.log(Obj1Buff);
    console.log('* Object - obj1 - sort-key:');
    const Obj1SortBuff = Buffer.from(Serialize(Obj, {sort_key:true}));
    console.log(Obj1SortBuff);
    
    const Obj2 = {PI:Math.PI};
    Obj2.z = 1234567; Obj2.a = false; Obj2._ = "test"; Obj2.b = 1;
    console.log('* Object - obj2:');
    const Obj2Buff = Buffer.from(Serialize(Obj2));
    console.log(Obj2Buff);
    console.log('* Object - obj1 - sort-key:');
    const Obj2SortBuff = Buffer.from(Serialize(Obj2, {sort_key:true}));
    console.log(Obj2SortBuff);
    
    
    console.log(`* Object - obj1 vs obj2 - not sorted: ${Obj1Buff.compare(Obj2Buff) === 0 ? "EQUAL": "NOT EQUAL"}`);
    console.log(`* Object - obj1 vs obj2 - sorted: ${Obj1SortBuff.compare(Obj2SortBuff) === 0 ? "EQUAL": "NOT EQUAL"}`);
    
    
    
    console.log('* Date:');
    console.log(Buffer.from(Serialize(new Date(1539838676247))));                   // 0x4276685898d17000
    console.log('* ObjectId:');
    let objectId = new ObjectId(123);
    console.log(objectId);
    console.log(Buffer.from(Serialize(objectId)));
    console.log('* Binary:');
    let buffer = Binary.from(Serialize(2147483647));
    console.log(Buffer.from(Serialize(buffer)));                                    // 0x7fffffff
    
    let buff1 = Binary.fromHex( "0x00000203" );
    let buff2 = Binary.alloc(2).set([0x02, 0x03]);
    console.log(buff1.toString(16));
    console.log(buff2.toString(16));
    console.log(buff1.compare(buff2, false));
    console.log(buff1.compare(buff2));
})();
