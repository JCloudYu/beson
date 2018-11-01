(() => {
    'use strict';

    const { Int64, UInt64 } = require('../types/uint64');
    const { Int128, UInt128 } = require('../types/uint128');
    const ObjectId = require('../types/objectid/index');
    const { Binary } = require('../types/binary');
    const { DATA_TYPE, TYPE_HEADER } = require('./constants');

    /**
     * Deserialize ArrayBuffer
     * - result = headerBuffer + contentBuffer
     * - contentBuffer = typeBuffer + dataBuffer
     * @param {ArrayBuffer} buffer
     * @returns {any}
     */
    function deserialize(buffer) {
        let anchor = 0;
        ({ anchor } = __deserializeHeader(buffer, anchor));
        let content;
        ({ anchor, value: content } = __deserializeContent(buffer, anchor));
        if (content === undefined) {
            throw new TypeError('Wrong data format');
        }
        return content;
    }
    module.exports = deserialize;

    /**
     * Deserialize header (it is empty now)
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: undefined}}
     * @private
     */
    function __deserializeHeader(buffer, start) {
        let length = 0;
        let end = start + length;
        let data;
        return { anchor: end, value: data };
    }
    
    /**
     * Deserialize content
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: any}}
     * @private
     */
    function __deserializeContent(buffer, start) {
        let type, data;
        ({ anchor: start, value: type } = __deserializeType(buffer, start));
        ({ anchor: start, value: data } = __deserializeData(type, buffer, start));
        return { anchor: start, value: data };
    }

    /**
     * Deserialize type
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: string}} anchor: byteOffset
     * @private
     */
    function __deserializeType(buffer, start) {
        let length = 2;
        let end = start + length;
        let type;
        let typeData = new Uint16Array(buffer, start, 1);
        Object.entries(TYPE_HEADER).forEach(([headerKey, headerVal]) => {
            let headerData = new Uint16Array(headerVal);
            if (typeData[0] === headerData[0]) {
                type = headerKey.toLowerCase();
                return;
            }
        });
        return { anchor: end, value: type };
    }

    /**
     * Deserialize data
     * @param {string} type
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: any}} anchor: byteOffset
     * @private
     */
    function __deserializeData(type, buffer, start) {
        let result = {};
        if (type === DATA_TYPE.NULL) {
            result = __deserializeNull(start);
        }
        else if (type === DATA_TYPE.FALSE || type === DATA_TYPE.TRUE) {
            result = __deserializeBoolean(type, start);
        }
        else if (type === DATA_TYPE.INT32) {
            result = __deserializeInt32(buffer, start);
        }
        else if (type === DATA_TYPE.INT64) {
            result = __deserializeInt64(buffer, start);
        }
        else if (type === DATA_TYPE.INT128) {
            result = __deserializeInt128(buffer, start);
        }
        else if (type === DATA_TYPE.UINT64) {
            result = __deserializeUInt64(buffer, start);
        }
        else if (type === DATA_TYPE.UINT128) {
            result = __deserializeUInt128(buffer, start);
        }
        else if (type === DATA_TYPE.DOUBLE) {
            result = __deserializeDouble(buffer, start);
        }
        else if (type === DATA_TYPE.STRING) {
            result = __deserializeString(buffer, start);
        }
        else if (type === DATA_TYPE.ARRAY) {
            result = __deserializeArray(buffer, start);
        }
        else if (type === DATA_TYPE.ARRAY_START) {
            result = __deserializeArrayStreaming(buffer, start);
        }
        else if (type === DATA_TYPE.OBJECT) {
            result = __deserializeObject(buffer, start);
        }
        else if (type === DATA_TYPE.OBJECT_START) {
            result = __deserializeObjectStreaming(buffer, start);
        }
        else if (type === DATA_TYPE.DATE) {
            result = __deserializeDate(buffer, start);
        }
        else if (type === DATA_TYPE.OBJECTID) {
            result = __deserializeObjectId(buffer, start);
        }
        else if (type === DATA_TYPE.BINARY) {
            result = __deserializeBinary(buffer, start);
        }
        return { anchor: result.anchor, value: result.value };
    }

    /**
     * Deserialize null data
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: null}} anchor: byteOffset
     * @private
     */
    function __deserializeNull(start) {
        let end = start;
        return { anchor: end, value: null };
    }

    /**
     * Deserialize boolean data
     * @param {string} type
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: boolean}} anchor: byteOffset
     * @private
     */
    function __deserializeBoolean(type, start) {
        let end = start;
        let data = (type === DATA_TYPE.TRUE) ? true : false;
        return { anchor: end, value: data };
    }

    /**
     * Deserialize Int32 data
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: Int32}} anchor: byteOffset
     * @private
     */
    function __deserializeInt32(buffer, start) {
        let end = start + 4;
        let dataView = new DataView(buffer);
        let data = dataView.getInt32(start, true);
        return { anchor: end, value: data };
    }

    /**
     * Deserialize Int64 data
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: Int64}} anchor: byteOffset
     * @private
     */
    function __deserializeInt64(buffer, start) {
        let step = 4;
        let length = 2;
        let end = start + (step * length);
        let dataView = new DataView(buffer);
        let dataArray = [];
        for (let i = start; i < end; i += step) {
            dataArray.push(dataView.getUint32(i, true));
        }
        let data = new Int64(dataArray);
        return { anchor: end, value: data };
    }

    /**
     * Deserialize Int128 data
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: Int128}} anchor: byteOffset
     * @private
     */
    function __deserializeInt128(buffer, start) {
        let step = 4;
        let length = 4;
        let end = start + (step * length);
        let dataView = new DataView(buffer);
        let dataArray = [];
        for (let i = start; i < end; i += step) {
            dataArray.push(dataView.getUint32(i, true));
        }
        let data = new Int128(dataArray);
        return { anchor: end, value: data };
    }

    /**
     * Deserialize UInt64 data
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: UInt64}} anchor: byteOffset
     * @private
     */
    function __deserializeUInt64(buffer, start) {
        let step = 4;
        let length = 2;
        let end = start + (step * length);
        let dataView = new DataView(buffer);
        let dataArray = [];
        for (let i = start; i < end; i += step) {
            dataArray.push(dataView.getUint32(i, true));
        }
        let data = new UInt64(dataArray);
        return { anchor: end, value: data };
    }

    /**
     * Deserialize UInt128 data
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: UInt128}} anchor: byteOffset
     * @private
     */
    function __deserializeUInt128(buffer, start) {
        let step = 4;
        let length = 4;
        let end = start + (step * length);
        let dataView = new DataView(buffer);
        let dataArray = [];
        for (let i = start; i < end; i += step) {
            dataArray.push(dataView.getUint32(i, true));
        }
        let data = new UInt128(dataArray);
        return { anchor: end, value: data };
    }

    /**
     * Deserialize double data
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: number}} anchor: byteOffset, value: double
     * @private
     */
    function __deserializeDouble(buffer, start) {
        let end = start + 8;
        let dataView = new DataView(buffer);
        let data = dataView.getFloat64(start, true);
        return { anchor: end, value: data };
    }

    /**
     * Deserialize string data
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: string}} anchor: byteOffset, value: 32-bits length string
     * @private
     */
    function __deserializeString(buffer, start) {
        let step = 2;
        let dataView = new DataView(buffer);
        let length = dataView.getUint32(start, true);
        start += 4;
        let end = start + length;
        let dataArray = [];
        for (let i = start; i < end; i += step) {
            dataArray.push(dataView.getUint16(i, true));
        }
        let data = String.fromCharCode(...dataArray);
        return { anchor: end, value: data };
    }

    /**
     * Deserialize short string data
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: string}} anchor: byteOffset, value: 16-bits length string
     * @private
     */
    function __deserializeShortString(buffer, start) {
        let step = 2;
        let dataView = new DataView(buffer);
        let length = dataView.getUint16(start, true);
        start += 2;
        let end = start + length;
        let dataArray = [];
        for (let i = start; i < end; i += step) {
            dataArray.push(dataView.getUint16(i, true));
        }
        let data = String.fromCharCode(...dataArray);
        return { anchor: end, value: data };
    }

    /**
     * Deserialize array data
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: any[]}} anchor: byteOffset
     * @private
     */
    function __deserializeArray(buffer, start) {
        let dataView = new DataView(buffer);
        let length = dataView.getUint32(start, true);
        start += 4;
        let end = start + length;
        let data = [];
        while (start < end) {
            let subType, subData;
            ({ anchor: start, value: subType } = __deserializeType(buffer, start));
            ({ anchor: start, value: subData } = __deserializeData(subType, buffer, start));
            data.push(subData);
        }
        return { anchor: end, value: data };
    }

    /**
     * Deserialize array data (use streaming)
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: any[]}} anchor: byteOffset
     * @private
     */
    function __deserializeArrayStreaming(buffer, start) {
        let end = start;
        let dataView = new DataView(buffer);
        let endData = new Uint16Array(TYPE_HEADER.ARRAY_END);
        let data = [];
        while (start < buffer.byteLength) {
            let tmpType = dataView.getUint16(start, true);
            if (tmpType === endData[0]) {
                end += 2;
                break;
            }
            
            let subType, subData;
            ({ anchor: start, value: subType } = __deserializeType(buffer, start));
            ({ anchor: start, value: subData } = __deserializeData(subType, buffer, start));
            data.push(subData);
            end = start;
        }
        return { anchor: end, value: data };
    }

    /**
     * Deserialize object data
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: {}}} anchor: byteOffset
     * @private
     */
    function __deserializeObject(buffer, start) {
        let dataView = new DataView(buffer);
        let length = dataView.getUint32(start, true);
        start += 4;
        let end = start + length;
        let data = {};
        while (start < end) {
            let subType, subKey, subData;
            ({ anchor: start, value: subType } = __deserializeType(buffer, start));
            ({ anchor: start, value: subKey } = __deserializeShortString(buffer, start));
            ({ anchor: start, value: subData } = __deserializeData(subType, buffer, start));
            data[subKey] = subData;
        }
        return { anchor: end, value: data };
    }

    /**
     * Deserialize object data (use streaming)
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: {}}} anchor: byteOffset
     * @private
     */
    function __deserializeObjectStreaming(buffer, start) {
        let end = start;
        let dataView = new DataView(buffer);
        let endData = new Uint16Array(TYPE_HEADER.OBJECT_END);
        let data = {};
        while (start < buffer.byteLength) {
            let tmpType = dataView.getUint16(start, true);
            if (tmpType === endData[0]) {
                end += 2;
                break;
            }

            let subType, subKey, subData;
            ({ anchor: start, value: subType } = __deserializeType(buffer, start));
            ({ anchor: start, value: subKey } = __deserializeShortString(buffer, start));
            ({ anchor: start, value: subData } = __deserializeData(subType, buffer, start));
            data[subKey] = subData;
            end = start;
        }
        return { anchor: end, value: data };
    }

    /**
     * Deserialize date data
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: Date}} anchor: byteOffset
     * @private
     */
    function __deserializeDate(buffer, start) {
        let end = start + 8;
        let dataView = new DataView(buffer);
        let data = new Date(dataView.getFloat64(start, true));
        return { anchor: end, value: data };
    }

    /**
     * Deserialize ObjectId data
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: ObjectId}} anchor: byteOffset
     * @private
     */
    function __deserializeObjectId(buffer, start) {
        let step = 1;
        let length = 12;
        let end = start + length;
        let dataView = new DataView(buffer);
        let dataArray = [];
        for (let i = start; i < end; i += step) {
            dataArray.push(dataView.getUint8(i, true));
        }
        let data = new ObjectId(Uint8Array.from(dataArray).buffer);
        return { anchor: end, value: data };
    }

    /**
     * Deserialize Binary data
     * @param {ArrayBuffer} buffer
     * @param {number} start - byteOffset
     * @returns {{anchor: number, value: Binary}} anchor: byteOffset
     * @private
     */
    function __deserializeBinary(buffer, start) {
        let step = 1;
        let dataView = new DataView(buffer);
        let length = dataView.getUint32(start, true);
        start += 4;
        let end = start + length;
        let dataArray = [];
        for (let i = start; i < end; i += step) {
            dataArray.push(dataView.getUint8(i, true));
        }
        let data = Binary.from(Uint8Array.from(dataArray).buffer);
        return { anchor: end, value: data };
    }
})();
