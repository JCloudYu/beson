(() => {
    'use strict';

    const { Int64, UInt64 } = require('../types/uint64');
    const { Int128, UInt128 } = require('../types/uint128');
    const { DATA_TYPE, DATA_HEADER } = require('../lib/constants');

    function serialize(data) {
        let type = __getType(data);
        let buffer = __encode(type, data);
        return (Array.isArray(buffer)) ? __arrayBufferConcat(buffer) : null;
    }
    module.exports = serialize;

    function __getType(data) {
        let type = typeof data;
        if (data === null) {
            type = DATA_TYPE.NULL;
        }
        else if (type === 'boolean') {
            type = (data) ? DATA_TYPE.TRUE : DATA_TYPE.FALSE;
        }
        else if (type === 'number' && __isInt(data)) {
            type = DATA_TYPE.INT32;
        }
        else if (data instanceof Int64) {
            type = DATA_TYPE.INT64;
        }
        else if (data instanceof Int128) {
            type = DATA_TYPE.INT128;
        }
        else if (data instanceof UInt64) {
            type = DATA_TYPE.UINT64;
        }
        else if (data instanceof UInt128) {
            type = DATA_TYPE.UINT128;
        }
        else if (type === 'number' && __isFloat(data)) {
            type = DATA_TYPE.DOUBLE;
        }
        else if (type === 'string') {
            type = DATA_TYPE.STRING;
        }
        else if (Array.isArray(data)) {
            type = DATA_TYPE.ARRAY;
        }
        else if (data instanceof Date || __isDate(data)) {
            type = DATA_TYPE.DATE;
        }
        else if (type === 'object') {
            type = DATA_TYPE.OBJECT;
        }
        return type;
    }

    function __encode(type, data) {
        let buffer = [];
        if (type === DATA_TYPE.NULL) {
            buffer = __serializeNull();
        }
        else if (type === DATA_TYPE.FALSE || type === DATA_TYPE.TRUE) {
            buffer = __serializeBoolean(type);
        }
        else if (type === DATA_TYPE.INT32) {
            buffer = __serializeInt32(data);
        }
        else if (type === DATA_TYPE.INT64) {
            buffer = __serializeInt64(data);
        }
        else if (type === DATA_TYPE.INT128) {
            buffer = __serializeInt128(data);
        }
        else if (type === DATA_TYPE.UINT64) {
            buffer = __serializeUInt64(data);
        }
        else if (type === DATA_TYPE.UINT128) {
            buffer = __serializeUInt128(data);
        }
        else if (type === DATA_TYPE.DOUBLE) {
            buffer = __serializeDouble(data);
        }
        else if (type === DATA_TYPE.STRING) {
            buffer = __serializeString(data);
        }
        else if (type === DATA_TYPE.ARRAY) {
            buffer = __serializeArray(data);
        }
        else if (type === DATA_TYPE.DATE) {
            buffer = __serializeDate(data);
        }
        else if (type === DATA_TYPE.OBJECT) {
            buffer = __serializeObject(data);
        }
        return buffer;
    }

    // based on http://exploringjs.com/es6/ch_typed-arrays.html#_concatenating-typed-arrays
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
    };

    function __serializeNull() {
        return [new Uint8Array(DATA_HEADER.NULL)];
    }

    function __serializeBoolean(type) {
        let headerArray = DATA_HEADER[type.toUpperCase()];
        let dataHeader = new Uint8Array(headerArray);
        return [dataHeader.buffer];
    }

    function __serializeInt32(data) {
        let dataHeader = new Uint8Array(DATA_HEADER.INT32);
        let dataContent = new Int32Array([data]);
        return [dataHeader.buffer, dataContent.buffer];
    }

    function __serializeInt64(data) {
        let dataHeader = new Uint8Array(DATA_HEADER.INT64);
        let dataContent = new Uint8Array(data.toBytes());
        return [dataHeader.buffer, dataContent.buffer];
    }

    function __serializeInt128(data) {
        let dataHeader = new Uint8Array(DATA_HEADER.INT128);
        let dataContent = new Uint8Array(data.toBytes());
        return [dataHeader.buffer, dataContent.buffer];
    }

    function __serializeUInt64(data) {
        let dataHeader = new Uint8Array(DATA_HEADER.UINT64);
        let dataContent = new Uint8Array(data.toBytes());
        return [dataHeader.buffer, dataContent.buffer];
    }

    function __serializeUInt128(data) {
        let dataHeader = new Uint8Array(DATA_HEADER.UINT128);
        let dataContent = new Uint8Array(data.toBytes());
        return [dataHeader.buffer, dataContent.buffer];
    }

    function __serializeDouble(data) {
        let dataHeader = new Uint8Array(DATA_HEADER.DOUBLE);
        let dataContent = new Float64Array([data]);
        return [dataHeader.buffer, dataContent.buffer];
    }

    function __serializeString(data) {
        let dataHeader = new Uint8Array(DATA_HEADER.STRING);
        let dataContent = new Uint16Array(data.length);
        for (let i = 0; i < data.length; i++) {
            dataContent[i] = data.charCodeAt(i);                     // fromCharCode
        }
        let dataLength = new Uint32Array([dataContent.buffer.byteLength]);
        return [dataHeader.buffer, dataLength.buffer, dataContent.buffer];
    }

    function __serializeArray(data) {
        let dataHeader = new Uint8Array(DATA_HEADER.ARRAY);

        // ignore undefined value
        let contents = [];
        for (let key in data) {
            let val = data[key];
            contents.push(serialize(val));
        }
        let dataContentBuffer = __arrayBufferConcat(contents);

        let dataLength = new Uint32Array([dataContentBuffer.byteLength]);
        return [dataHeader.buffer, dataLength.buffer, dataContentBuffer];
    }

    function __serializeObject(data) {
        let dataHeader = new Uint8Array(DATA_HEADER.OBJECT);

        // ignore undefined value
        let contents = [];
        for (let key in data) {
            if (!data.hasOwnProperty(key)) continue;

            let val = data[key];
            let type = __getType(val);
            let valType = new Uint8Array(DATA_HEADER[type.toUpperCase()]);
            let keyBuffer = serialize(key);
            let keyLength = new Uint16Array([keyBuffer.byteLength]);
            let valBuffer = serialize(val);

            // type, keyLength, key, val
            contents.push(...[valType.buffer, keyLength.buffer, keyBuffer, valBuffer]);
        }
        let dataContentBuffer = __arrayBufferConcat(contents);

        let dataLength = new Uint32Array([dataContentBuffer.byteLength]);
        return [dataHeader.buffer, dataLength.buffer, dataContentBuffer];
    }

    function __serializeDate(data) {
        let dataHeader = new Uint8Array(DATA_HEADER.DATE);
        let dataContent = new Float64Array([data]);
        return [dataHeader.buffer, dataContent.buffer];
    }

    function __isInt(n) {
        return (Number(n) === n && n % 1 === 0);
    }
    
    function __isFloat(n) {
        return (Number(n) === n && n % 1 !== 0);
    }

    function __isDate(d) {
        return (typeof d === 'object' && Object.prototype.toString.call(d) === '[object Date]');
    };
})();
