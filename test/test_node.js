(() => {
    'use strict';

    const stringifyObject = require('stringify-object');
    const { Serialize, Deserialize } = require('../beson');
    const { ObjectId, Binary, Int64, UInt64, Int128, UInt128 } = require('../beson');

    process.stdout.write('* Testing Null:               ');
    {
        const ANSWER = null;
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER === TEST);
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing FALSE:              ');
    {
        const ANSWER = false;
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER === TEST);
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing TRUE:               ');
    {
        const ANSWER = true;
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER === TEST);
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing Int32:              ');
    {
        const ANSWER = 2147483647;
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER === TEST);
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing Int64 - max:        ');
    {
        const ANSWER = Int64.from(Int64.MAX);
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER.toString() === TEST.toString());
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing Int64 - min:        ');
    {
        const ANSWER = Int64.from(Int64.MIN);
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER.toString() === TEST.toString());
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing Int128 - max:       ');
    {
        const ANSWER = Int128.from(Int128.MAX);
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER.toString() === TEST.toString());
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing Int128 - min:       ');
    {
        const ANSWER = Int128.from(Int128.MIN);
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER.toString() === TEST.toString());
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing UInt64 - max:       ');
    {
        const ANSWER = UInt64.from(UInt64.MAX);
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER.toString() === TEST.toString());
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing UInt128 - max:      ');
    {
        const ANSWER = UInt128.from(UInt128.MAX);
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER.toString() === TEST.toString());
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing Double:             ');
    {
        const ANSWER = Math.PI;
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER.toString() === TEST.toString());
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing String:             ');
    {
        const ANSWER = 'Hello World!!!!';
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER === TEST);
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing Array:              ');
    {
        const ANSWER = [true, 2147483647, Math.PI, { aaa: 2147483647, bbb: Math.PI }, [false, 'Hello World', new Date(1539838676247), Int128.from(Int128.MAX)]];
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (stringifyObject(ANSWER) === stringifyObject(TEST));
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing Array - stream1:    ');
    {
        const OPTIONS = { streaming_array: true };
        const ANSWER = [true, 2147483647, Math.PI, { aaa: 2147483647, bbb: Math.PI }, [false, 'Hello World', new Date(1539838676247), Int128.from(Int128.MAX)]];
        const TEST = Deserialize(Serialize(ANSWER, OPTIONS));
        let passed = (stringifyObject(ANSWER) === stringifyObject(TEST));
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    // append some data in the end
    process.stdout.write('* Testing Array - stream2:    ');
    {
        const OPTIONS = { streaming_array: true };
        const ANSWER = [true, 2147483647, Math.PI, { aaa: 2147483647, bbb: Math.PI }, [false, 'Hello World', new Date(1539838676247), Int128.from(Int128.MAX)]];
        const TEST = Deserialize(__arrayBufferConcat([Serialize(ANSWER, OPTIONS), new Uint8Array([123, 45, 67, 89]).buffer]));
        let passed = (stringifyObject(ANSWER) === stringifyObject(TEST));
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing Object:             ');
    {
        const ANSWER = {
            z: {
                c: 'aaa',
                b: false,
                a: 123
            },
            b: 123,
            a: new Date(1539838676247),
            _: Int128.from(Int128.MAX),
            PI: Math.PI,
            array: ['aaa', true, 123]
        };
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (stringifyObject(ANSWER) === stringifyObject(TEST));
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing Object - sort:      ');
    {
        const OPTIONS = { sort_key: true };
        const SOURCE1 = {
            z: {
                c: 'aaa',
                b: false,
                a: 123
            },
            b: 123,
            a: new Date(1539838676247),
            _: Int128.from(Int128.MAX),
            PI: Math.PI,
            array: ['aaa', true, 123]
        };
        const SOURCE2 = {
            z: {
                c: 'aaa',
                b: false,
                a: 123
            },
            PI: Math.PI,
            array: ['aaa', true, 123],
            a: new Date(1539838676247),
            _: Int128.from(Int128.MAX),
            b: 123
        };
        const TEST1 = Deserialize(Serialize(SOURCE1, OPTIONS));
        const TEST2 = Deserialize(Serialize(SOURCE2, OPTIONS));
        let passed = (stringifyObject(TEST1) === stringifyObject(TEST2));
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing Object - stream1:   ');
    {
        const OPTIONS = { streaming_object: true };
        const ANSWER = {
            z: {
                c: 'aaa',
                b: false,
                a: 123
            },
            b: 123,
            a: new Date(1539838676247),
            _: Int128.from(Int128.MAX),
            PI: Math.PI,
            array: ['aaa', true, 123]
        };
        const TEST = Deserialize(Serialize(ANSWER, OPTIONS));
        let passed = (stringifyObject(ANSWER) === stringifyObject(TEST));
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    // append some data in the end
    process.stdout.write('* Testing Object - stream2:   ');
    {
        const OPTIONS = { streaming_object: true };
        const ANSWER = {
            z: {
                c: 'aaa',
                b: false,
                a: 123
            },
            b: 123,
            a: new Date(1539838676247),
            _: Int128.from(Int128.MAX),
            PI: Math.PI,
            array: ['aaa', true, 123]
        };
        const TEST = Deserialize(__arrayBufferConcat([Serialize(ANSWER, OPTIONS), new Uint8Array([123, 45, 67, 89]).buffer]));
        let passed = (stringifyObject(ANSWER) === stringifyObject(TEST));
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing Date:               ');
    {
        const ANSWER = new Date(1539838676247);
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER.getTime() === TEST.getTime());
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing ObjectId:           ');
    {
        const ANSWER = new ObjectId(123);
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER.toString() === TEST.toString());
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    process.stdout.write('* Testing Binary:             ');
    {
        const ANSWER = Binary.from(Serialize(new ObjectId()));
        const TEST = Deserialize(Serialize(ANSWER));
        let passed = (ANSWER.toString() === TEST.toString());
        if (passed) {
            process.stdout.write('passed!\n');
        }
        else {
            process.stdout.write('failed!\n');
        }
    }

    function __arrayBufferConcat(arrays) {
        let totalLength = 0;
        for (const arr of arrays) {
            totalLength += arr.byteLength;
        }
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const arr of arrays) {
            result.set(new Uint8Array(arr), offset);
            offset += arr.byteLength;
        }
        return result.buffer;
    }
})();
