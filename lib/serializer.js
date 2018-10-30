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
    
    /**
     * Serialize any type data
     * - result = headerBuffer + contentBuffer
     * - contentBuffer = typeBuffer + dataBuffer
     * @param {*} data
     * @param {Object} options
     * @param {boolean} options.sort_key
     * @param {boolean} options.streaming_array
     * @param {boolean} options.streaming_object
     * @returns {ArrayBuffer}
     */
    function serialize(data, options=DEFAULT_OPTIONS) {
        let headerBuffer = __serializeHeader();
        let contentBuffers = __serializeContent(data, options);
        return __arrayBufferConcat([headerBuffer, ...contentBuffers]);
    }
    module.exports = serialize;

    /**
     * Serialize header (it is empty now)
     * @returns {ArrayBuffer}
     * @private
     */
    function __serializeHeader() {
        let headerData = new Uint8Array([]);
        return headerData.buffer;
    }

    /**
     * Serialize content
     * @param {*} data
     * @param {Object} options
     * @param {boolean} options.sort_key
     * @param {boolean} options.streaming_array
     * @param {boolean} options.streaming_object
     * @returns {ArrayBuffer[]}
     * @private
     */
    function __serializeContent(data, options=DEFAULT_OPTIONS) {
        let type = __getType(data, options);
        let typeBuffer = __serializeType(type);
        let dataBuffers = __serializeData(type, data, options);
        return [typeBuffer, ...dataBuffers];
    }

    /**
     * Get type by data
     * @param {*} data 
     * @param {Object} options
     * @param {boolean} options.sort_key
     * @param {boolean} options.streaming_array
     * @param {boolean} options.streaming_object
     * @returns {string}
     * @private
     */
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

    /**
     * Serialize type
     * @param {string} type
     * @returns {ArrayBuffer}
     * @private
     */
    function __serializeType(type) {
        let typeHeader = (type) ? TYPE_HEADER[type.toUpperCase()] : [];
        let typeData = new Uint8Array(typeHeader);
        return typeData.buffer;
    }

    /**
     * Serialize data
     * @param {string} type
     * @param {*} data
     * @param {Object} options
     * @param {boolean} options.sort_key
     * @param {boolean} options.streaming_array
     * @param {boolean} options.streaming_object
     * @returns {ArrayBuffer[]}
     * @private
     */
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

    /**
     * Serialize null data
     * @returns {[]}
     * @private
     */
    function __serializeNull() {
        return [];
    }

    /**
     * Serialize boolean data
     * @returns {[]}
     * @private
     */
    function __serializeBoolean() {
        return [];
    }

    /**
     * Serialize Int32 data
     * @param {Int32} data
     * @returns {ArrayBuffer[]}
     * @private
     */
    function __serializeInt32(data) {
        let contentData = new Int32Array([data]);
        return [contentData.buffer];
    }

    /**
     * Serialize Int64 data
     * @param {Int64} data
     * @returns {ArrayBuffer[]}
     * @private
     */
    function __serializeInt64(data) {
        return [data.toBytes()];
    }

    /**
     * Serialize Int128 data
     * @param {Int128} data
     * @returns {ArrayBuffer[]}
     * @private
     */
    function __serializeInt128(data) {
        return [data.toBytes()];
    }

    /**
     * Serialize UInt64 data
     * @param {UInt64} data
     * @returns {ArrayBuffer[]}
     * @private
     */
    function __serializeUInt64(data) {
        return [data.toBytes()];
    }

    /**
     * Serialize UInt128 data
     * @param {UInt128} data
     * @returns {ArrayBuffer[]}
     * @private
     */
    function __serializeUInt128(data) {
        return [data.toBytes()];
    }

    /**
     * Serialize double data
     * @param {number} data - double number
     * @returns {ArrayBuffer[]}
     * @private
     */
    function __serializeDouble(data) {
        let contentData = new Float64Array([data]);
        return [contentData.buffer];
    }

    /**
     * Serialize string data
     * @param {string} data - 32-bits length string
     * @returns {ArrayBuffer[]}
     * @private
     */
    function __serializeString(data) {
        let contentData = new Uint16Array(data.length);
        for (let i = 0; i < data.length; i++) {
            contentData[i] = data.charCodeAt(i);
        }
        let length = contentData.buffer.byteLength;
        let lengthData = new Uint32Array([length]);
        return [lengthData.buffer, contentData.buffer];
    }

    /**
     * Serialize short string data
     * @param {string} data - 16-bits length string
     * @returns {ArrayBuffer[]}
     * @private
     */
    function __serializeShortString(data) {
        let contentData = new Uint16Array(data.length);
        for (let i = 0; i < data.length; i++) {
            contentData[i] = data.charCodeAt(i);
        }
        let length = contentData.buffer.byteLength;
        let lengthData = new Uint16Array([length]);
        return [lengthData.buffer, contentData.buffer];
    }

    /**
     * Serialize array data
     * @param {any[]} data
     * @param {Object} options
     * @param {boolean} options.sort_key
     * @param {boolean} options.streaming_array
     * @param {boolean} options.streaming_object
     * @returns {ArrayBuffer[]}
     * @private
     */
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

    /**
     * Serialize array data (use streaming)
     * @param {any[]} data
     * @param {Object} options
     * @param {boolean} options.sort_key
     * @param {boolean} options.streaming_array
     * @param {boolean} options.streaming_object
     * @returns {ArrayBuffer[]}
     * @private
     */
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

    /**
     * Serialize object data
     * @param {Object} data
     * @param {Object} options
     * @param {boolean} options.sort_key
     * @param {boolean} options.streaming_array
     * @param {boolean} options.streaming_object
     * @returns {ArrayBuffer[]}
     * @private
     */
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

    /**
     * Serialize object data (use streaming)
     * @param {Object} data
     * @param {Object} options
     * @param {boolean} options.sort_key
     * @param {boolean} options.streaming_array
     * @param {boolean} options.streaming_object
     * @returns {ArrayBuffer[]}
     * @private
     */
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

    /**
     * Serialize date data
     * @param {Date} data
     * @returns {ArrayBuffer[]}
     * @private
     */
    function __serializeDate(data) {
        let contentData = new Float64Array([data.getTime()]);
        return [contentData.buffer];
    }

    /**
     * Serialize ObjectId data
     * @param {ObjectId} data
     * @returns {ArrayBuffer[]}
     * @private
     */
    function __serializeObjectId(data) {
        let hexString = data.toString('hex');
        let hexDataArray = hexString.match(/[\da-f]{2}/gi).map((h) => {
            return parseInt(h, 16);
        });
        let contentData = new Uint8Array(hexDataArray);
        return [contentData.buffer];
    }

    /**
     * Serialize Binary data
     * @param {Binary} data
     * @returns {ArrayBuffer[]}
     * @private
     */
    function __serializeBinary(data) {
        let dataBuffer = data.toBytes();
        let length = dataBuffer.byteLength;
        let lengthData = new Uint32Array([length]);
        return [lengthData.buffer, dataBuffer];
    }

    /**
     * Get length of ArrayBufer[]
     * @param {ArrayBuffer[]} data
     * @returns {number}
     * @private
     */
    function __getLengthByArrayBuffers(data) {
        let length = 0;
        for (let key in data) {
            length += data[key].byteLength;
        }
        return length;
    }

    /**
     * Concat ArrayBuffer[] (based on http://exploringjs.com/es6/ch_typed-arrays.html#_concatenating-typed-arrays)
     * @param {ArrayBuffer[]} buffers
     * @returns {ArrayBuffer}
     * @private
     */
    function __arrayBufferConcat(buffers) {
        let totalLength = 0;
        for (const buffer of buffers) {
            totalLength += buffer.byteLength;
        }
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const buffer of buffers) {
            result.set(new Uint8Array(buffer), offset);
            offset += buffer.byteLength;
        }
        return result.buffer;
    }

    /**
     * Check it is Int number
     * @param {number} n
     * @returns {boolean}
     * @private
     */
    function __isInt(n) {
        return (n % 1 === 0);
    }
    
    /**
     * Check it is Float number
     * @param {number} n
     * @returns {boolean}
     * @private
     */
    function __isFloat(n) {
        return (n % 1 !== 0);
    }

    /**
     * Check it is Date object
     * @param {Object} d
     * @returns {boolean}
     * @private
     */
    function __isDate(d) {
        return (typeof d === 'object' && Object.prototype.toString.call(d) === '[object Date]');
    }
})();
