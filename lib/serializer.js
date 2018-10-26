(() => {
    'use strict';

    const { Int64, UInt64 } = require('../types/uint64');
    const { Int128, UInt128 } = require('../types/uint128');
    const ObjectId = require('../types/objectid/index');
    const { Binary } = require('../types/binary');
    const { DATA_TYPE, TYPE_HEADER } = require('../lib/constants');

    const DEFAULT_OPTIONS = {
        sort_key: false,
        streaming_array: false,
        streaming_object: false
    };

    // result = headerBuffer + contentBuffer
    // contentBuffer = typeBuffer + dataBuffer
    function serialize(data, options=DEFAULT_OPTIONS) {
        let headerBuffer = __serializeHeader();
        let contentBuffers = __serializeContent(data, options);
        return __arrayBufferConcat([headerBuffer, ...contentBuffers]);
    }
    module.exports = serialize;

    function __serializeHeader() {
        let headerData = new Uint8Array([]);
        return headerData.buffer;
    }

    function __serializeContent(data, options=DEFAULT_OPTIONS) {
        let type = __getType(data, options);
        let typeBuffer = __serializeType(type);
        let dataBuffers = __serializeData(type, data, options);
        return [typeBuffer, ...dataBuffers];
    }

    function __getType(data, options=DEFAULT_OPTIONS) {
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
        else if (type === 'number' && __isFloat(data)) {
            type = DATA_TYPE.DOUBLE;
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
        else if (type === 'string') {
            type = DATA_TYPE.STRING;
        }
        else if (Array.isArray(data)) {
            type = (options.streaming_array === true) ? DATA_TYPE.ARRAY_START : DATA_TYPE.ARRAY;
        }
        else if (data instanceof Date || __isDate(data)) {
            type = DATA_TYPE.DATE;
        }
        else if (data instanceof ObjectId) {
            type = DATA_TYPE.OBJECTID;
        }
        else if (data instanceof Binary) {
            type = DATA_TYPE.BINARY;
        }
        else if (type === 'object') {
            type = (options.streaming_object === true) ? DATA_TYPE.OBJECT_START : DATA_TYPE.OBJECT;
        }
        return type;
    }

    function __serializeType(type) {
        let typeHeader = (type) ? TYPE_HEADER[type.toUpperCase()] : [];
        let typeData = new Uint8Array(typeHeader);
        return typeData.buffer;
    }

    function __serializeData(type, data, options=DEFAULT_OPTIONS) {
        let buffers = [];
        if (type === DATA_TYPE.NULL) {
            buffers = __serializeNull();
        }
        else if (type === DATA_TYPE.FALSE || type === DATA_TYPE.TRUE) {
            buffers = __serializeBoolean();
        }
        else if (type === DATA_TYPE.INT32) {
            buffers = __serializeInt32(data);
        }
        else if (type === DATA_TYPE.INT64) {
            buffers = __serializeInt64(data);
        }
        else if (type === DATA_TYPE.INT128) {
            buffers = __serializeInt128(data);
        }
        else if (type === DATA_TYPE.UINT64) {
            buffers = __serializeUInt64(data);
        }
        else if (type === DATA_TYPE.UINT128) {
            buffers = __serializeUInt128(data);
        }
        else if (type === DATA_TYPE.DOUBLE) {
            buffers = __serializeDouble(data);
        }
        else if (type === DATA_TYPE.STRING) {
            buffers = __serializeString(data);
        }
        else if (type === DATA_TYPE.ARRAY) {
            buffers = __serializeArray(data, options);
        }
        else if (type === DATA_TYPE.ARRAY_START) {
            buffers = __serializeArrayStreaming(data, options);
        }
        else if (type === DATA_TYPE.OBJECT) {
            buffers = __serializeObject(data, options);
        }
        else if (type === DATA_TYPE.OBJECT_START) {
            buffers = __serializeObjectStreaming(data, options);
        }
        else if (type === DATA_TYPE.DATE) {
            buffers = __serializeDate(data);
        }
        else if (type === DATA_TYPE.OBJECTID) {
            buffers = __serializeObjectId(data);
        }
        else if (type === DATA_TYPE.BINARY) {
            buffers = __serializeBinary(data);
        }
        return buffers;
    }

    function __serializeNull() {
        return [];
    }

    function __serializeBoolean() {
        return [];
    }

    function __serializeInt32(data) {
        let contentData = new Int32Array([data]);
        return [contentData.buffer];
    }

    function __serializeInt64(data) {
        return [data.toBytes()];
    }

    function __serializeInt128(data) {
        return [data.toBytes()];
    }

    function __serializeUInt64(data) {
        return [data.toBytes()];
    }

    function __serializeUInt128(data) {
        return [data.toBytes()];
    }

    function __serializeDouble(data) {
        let contentData = new Float64Array([data]);
        return [contentData.buffer];
    }

    function __serializeString(data) {
        let contentData = new Uint16Array(data.length);
        for (let i = 0; i < data.length; i++) {
            contentData[i] = data.charCodeAt(i);
        }
        let length = contentData.buffer.byteLength;
        let lengthData = new Uint32Array([length]);
        return [lengthData.buffer, contentData.buffer];
    }

    function __serializeShortString(data) {
        let contentData = new Uint16Array(data.length);
        for (let i = 0; i < data.length; i++) {
            contentData[i] = data.charCodeAt(i);
        }
        let length = contentData.buffer.byteLength;
        let lengthData = new Uint16Array([length]);
        return [lengthData.buffer, contentData.buffer];
    }

    function __serializeArray(data, options=DEFAULT_OPTIONS) {
        let dataBuffers = [];
        // ignore undefined value
        for (let key in data) {
            let subData = data[key];
            let subType = __getType(subData, options);
            let subTypeBuffer = __serializeType(subType);
            let subDataBuffers = __serializeData(subType, subData, options);
            dataBuffers.push(subTypeBuffer, ...subDataBuffers);
        }
        let length = __getLengthByArrayBuffers(dataBuffers);
        let lengthData = new Uint32Array([length]);
        return [lengthData.buffer, ...dataBuffers];
    }

    function __serializeArrayStreaming(data, options=DEFAULT_OPTIONS) {
        let dataBuffers = [];
        // ignore undefined value
        for (let key in data) {
            let subData = data[key];
            let subType = __getType(subData, options);
            let subTypeBuffer = __serializeType(subType);
            let subDataBuffers = __serializeData(subType, subData, options);
            dataBuffers.push(subTypeBuffer, ...subDataBuffers);
        }
        return [...dataBuffers, TYPE_HEADER.ARRAY_END];
    }

    function __serializeObject(data, options=DEFAULT_OPTIONS) {
        let dataBuffers = [];
        let allKeys = (options.sort_key === true) ? Object.keys(data).sort() : Object.keys(data);
        // ignore undefined value
        for (let key of allKeys) {
            let subData = data[key];
            if (subData === undefined) continue;

            let subType = __getType(subData, options);
            let subTypeBuffer = __serializeType(subType);
            let keyBuffers = __serializeShortString(key);
            let subDataBuffers = __serializeData(subType, subData, options);
            dataBuffers.push(subTypeBuffer, ...keyBuffers, ...subDataBuffers);
        }
        let length = __getLengthByArrayBuffers(dataBuffers);
        let lengthData = new Uint32Array([length]);
        return [lengthData.buffer, ...dataBuffers];
    }

    function __serializeObjectStreaming(data, options=DEFAULT_OPTIONS) {
        let dataBuffers = [];
        let allKeys = (options.sort_key === true) ? Object.keys(data).sort() : Object.keys(data);
        // ignore undefined value
        for (let key of allKeys) {
            let subData = data[key];
            if (subData === undefined) continue;

            let subType = __getType(subData, options);
            let subTypeBuffer = __serializeType(subType);
            let keyBuffers = __serializeShortString(key);
            let subDataBuffers = __serializeData(subType, subData, options);
            dataBuffers.push(subTypeBuffer, ...keyBuffers, ...subDataBuffers);
        }
        return [...dataBuffers, TYPE_HEADER.OBJECT_END];
    }

    function __serializeDate(data) {
        let contentData = new Float64Array([data.getTime()]);
        return [contentData.buffer];
    }

    function __serializeObjectId(data) {
        let hexString = data.toString('hex');
        let hexDataArray = hexString.match(/[\da-f]{2}/gi).map((h) => {
            return parseInt(h, 16);
        });
        let contentData = new Uint8Array(hexDataArray);
        return [contentData.buffer];
    }

    function __serializeBinary(data) {
        let dataBuffer = data.toBytes();
        let length = dataBuffer.byteLength;
        let lengthData = new Uint32Array([length]);
        return [lengthData.buffer, dataBuffer];
    }

    function __getLengthByArrayBuffers(data) {
        let length = 0;
        for (let key in data) {
            length += data[key].byteLength;
        }
        return length;
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
    }

    function __isInt(n) {
        return (n % 1 === 0);
    }
    
    function __isFloat(n) {
        return (n % 1 !== 0);
    }

    function __isDate(d) {
        return (typeof d === 'object' && Object.prototype.toString.call(d) === '[object Date]');
    }
})();
