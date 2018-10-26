(() => {
    'use strict';

    const { Int64, UInt64 } = require('../types/uint64');
    const { Int128, UInt128 } = require('../types/uint128');
    const ObjectId = require('../types/objectid/index');
    const { Binary } = require('../types/binary');
    const { DATA_TYPE, TYPE_HEADER } = require('../lib/constants');

    // result = headerBuffer + contentBuffer
    // contentBuffer = typeBuffer + dataBuffer
    function deserialize(buffer) {
        let anchor = 0;
        ({ anchor } = __deserializeHeader(buffer, anchor));
        let content = null;
        ({ anchor, value: content } = __deserializeContent(buffer, anchor));
        if (content === undefined) {
            throw new TypeError('Data error!');
        }
        return content;
    }
    module.exports = deserialize;

    function __deserializeHeader(buffer, start) {
        let length = 0;
        let end = start + length;
        const [major, minor] = new Uint8Array(buffer, start, length);
        return { anchor: end, value: { major, minor } };
    }

    function __deserializeContent(buffer, start) {
        let type = undefined;
        ({ anchor: start, value: type } = __deserializeType(buffer, start));
        let data = undefined;
        ({ anchor: start, value: data } = __deserializeData(type, buffer, start));
        return { anchor: start, value: data };
    }

    function __deserializeType(buffer, start) {
        let length = 2;
        let end = start + length;
        let type = undefined;
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

    function __deserializeNull(start) {
        let end = start;
        return { anchor: end, value: null };
    }

    function __deserializeBoolean(type, start) {
        let end = start;
        let data = (type === DATA_TYPE.TRUE) ? true : false;
        return { anchor: end, value: data };
    }

    function __deserializeInt32(buffer, start) {
        let end = start + 4;
        let dataView = new DataView(buffer);
        let data = dataView.getInt32(start, true);
        return { anchor: end, value: data };
    }

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

    function __deserializeDouble(buffer, start) {
        let end = start + 8;
        let dataView = new DataView(buffer);
        let data = dataView.getFloat64(start, true);
        return { anchor: end, value: data };
    }

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

    function __deserializeArray(buffer, start) {
        let dataView = new DataView(buffer);
        let length = dataView.getUint32(start, true);
        start += 4;
        let end = start + length;
        let data = [];
        while (start < end) {
            let subType = undefined;
            ({ anchor: start, value: subType } = __deserializeType(buffer, start));
            let subData = undefined;
            ({ anchor: start, value: subData } = __deserializeData(subType, buffer, start));
            data.push(subData);
        }
        return { anchor: end, value: data };
    }

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
            
            let subType = undefined;
            ({ anchor: start, value: subType } = __deserializeType(buffer, start));
            let subData = undefined;
            ({ anchor: start, value: subData } = __deserializeData(subType, buffer, start));
            data.push(subData);
            end = start;
        }
        return { anchor: end, value: data };
    }

    function __deserializeObject(buffer, start) {
        let dataView = new DataView(buffer);
        let length = dataView.getUint32(start, true);
        start += 4;
        let end = start + length;
        let data = {};
        while (start < end) {
            let subType = undefined;
            ({ anchor: start, value: subType } = __deserializeType(buffer, start));
            let subKey = undefined;
            ({ anchor: start, value: subKey } = __deserializeShortString(buffer, start));
            let subData = undefined;
            ({ anchor: start, value: subData } = __deserializeData(subType, buffer, start));
            data[subKey] = subData;
        }
        return { anchor: end, value: data };
    }

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

            let subType = undefined;
            ({ anchor: start, value: subType } = __deserializeType(buffer, start));
            let subKey = undefined;
            ({ anchor: start, value: subKey } = __deserializeShortString(buffer, start));
            let subData = undefined;
            ({ anchor: start, value: subData } = __deserializeData(subType, buffer, start));
            data[subKey] = subData;
            end = start;
        }
        return { anchor: end, value: data };
    }

    function __deserializeDate(buffer, start) {
        let end = start + 8;
        let dataView = new DataView(buffer);
        let data = new Date(dataView.getFloat64(start, true));
        return { anchor: end, value: data };
    }

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
