(() => {
    'use strict';

    const stringifyObject = require( 'stringify-object' );
    const { Serialize, Deserialize } = require('../beson');
    const { ObjectId, Binary, Int64, UInt64, Int128, UInt128 } = require('../beson');
	
    const assert = require( 'assert' );
    describe( 'Serialize and Deserialize testing', () => {
        describe( 'deserialize data is equal to origin data', () => {
            it('Null', () => {
                let origin = null;
                let test = Deserialize(Serialize(origin));
                assert(test === origin);
            });
            
            it('False', () => {
                let origin = false;
                let test = Deserialize(Serialize(origin));
                assert(test === origin);
            });

            it('True', () => {
                let origin = true;
                let test = Deserialize(Serialize(origin));
                assert(test === origin);
            });

            it('Int32', () => {
                let origin = 2147483647;
                let test = Deserialize(Serialize(origin));
                assert(test === origin);
            });

            it('Int64 (positive number)', () => {
                let origin = Int64.from(Int64.MAX);
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('Int64 (negative number)', () => {
                let origin = Int64.from(Int64.MIN);
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('Int128 (positive number)', () => {
                let origin = Int128.from(Int128.MAX);
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('Int128 (negative number)', () => {
                let origin = Int128.from(Int128.MIN);
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('UInt64', () => {
                let origin = UInt64.from(UInt64.MAX);
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('UInt128', () => {
                let origin = UInt128.from(UInt128.MAX);
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('Double', () => {
                let origin = Math.PI;
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('String', () => {
                let origin = 'Hello World!!!';
                let test = Deserialize(Serialize(origin));
                assert(test === origin);
            });

            it('Array', () => {
                let origin = [true, 2147483647, Math.PI, { aaa: 2147483647, bbb: Math.PI }, [false, 'Hello World', new Date(1539838676247), Int128.from(Int128.MAX)]];
                let test = Deserialize(Serialize(origin));
                assert(stringifyObject(test) === stringifyObject(origin));
            });

            it('Array (streaming)', () => {
                let origin = [true, 2147483647, Math.PI, { aaa: 2147483647, bbb: Math.PI }, [false, 'Hello World', new Date(1539838676247), Int128.from(Int128.MAX)]];
                let test = Deserialize(Serialize(origin, { streaming_array: true }));
                assert(stringifyObject(test) === stringifyObject(origin));
            });

            it('Array (streaming + append binary origin)', () => {
                let origin = [true, 2147483647, Math.PI, { aaa: 2147483647, bbb: Math.PI }, [false, 'Hello World', new Date(1539838676247), Int128.from(Int128.MAX)]];
                let buffer = Serialize(origin, { streaming_array: true });
                let test = Deserialize(__arrayBufferConcat([buffer, new Uint8Array([123, 45, 67, 89]).buffer]));
                assert(stringifyObject(test) === stringifyObject(origin));
            });

            it('Object', () => {
                let origin = {
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
                let test = Deserialize(Serialize(origin));
                assert(stringifyObject(test) === stringifyObject(origin));
            });

            it('Object (sort key)', () => {
                const origin1 = {
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
                const origin2 = {
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
                const test1 = Deserialize(Serialize(origin1, { sort_key: true }));
                const test2 = Deserialize(Serialize(origin2, { sort_key: true }));
                assert(stringifyObject(test1) === stringifyObject(test2));
            });

            it('Object (streaming)', () => {
                let origin = {
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
                const test = Deserialize(Serialize(origin, { streaming_object: true }));
                assert(stringifyObject(test) === stringifyObject(origin));
            });

            it('Object (streaming + append binary origin)', () => {
                let origin = {
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
                let buffer = Serialize(origin, { streaming_object: true });
                let test = Deserialize(__arrayBufferConcat([buffer, new Uint8Array([123, 45, 67, 89]).buffer]));
                assert(stringifyObject(test) === stringifyObject(origin));
            });

            it('Date', () => {
                let origin = new Date(1539838676247);
                let test = Deserialize(Serialize(origin));
                assert(test.getTime() === origin.getTime());
            });

            it('ObjectId', () => {
                let origin = new ObjectId();
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });

            it('Binary', () => {
                let origin = Binary.from(Serialize(new ObjectId()));
                let test = Deserialize(Serialize(origin));
                assert(test.toString() === origin.toString());
            });
        });
    });

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
