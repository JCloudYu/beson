(() => {
    'use strict';

    module.exports = {
        DATA_TYPE: {
            NULL: 'null',
            FALSE: 'false',
            TRUE: 'true',
            INT32: 'int32',
            INT64: 'int64',
            INT128: 'int128',
            UINT64: 'uint64',
            UINT128: 'uint128',
            DOUBLE: 'double',
            STRING: 'string',
            ARRAY: 'array',
            OBJECT: 'object',
            DATE: 'date'
        },
        TYPE_HEADER: {
            NULL: [0x00],
            FALSE: [0x01],
            TRUE: [0x01],
            INT32: [0x02, 0x00],
            INT64: [0x02, 0x01],
            INT128: [0x02, 0x02],
            UINT64: [0x03, 0x01],
            UINT128: [0x03, 0x02],
            DOUBLE: [0x04],
            STRING: [0x05],
            ARRAY: [0x06],
            ARRAY_START: [0x07],
            ARRAY_END: [0x08],
            OBJECT: [0x09],
            OBJECT_START: [0x0a],
            OBJECT_END: [0x0b],
            DATE: [0x0c]
        },
        TYPE_CONTENT: {
            NULL: [],
            FALSE: [0x00],
            TRUE: [0x01],
        }
    };
})();
