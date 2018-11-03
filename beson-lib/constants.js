(() => {
    'use strict';

    let exportObj = {
        DATA_TYPE: {
            NULL:           'null',
            FALSE:          'false',
            TRUE:           'true',
            INT32:          'int32',
            INT64:          'int64',
            INT128:         'int128',
            UINT64:         'uint64',
            UINT128:        'uint128',
            DOUBLE:         'double',
            STRING:         'string',
            ARRAY:          'array',
            ARRAY_START:    'array_start',
            ARRAY_END:      'array_end',
            OBJECT:         'object',
            OBJECT_START:   'object_start',
            OBJECT_END:     'object_end',
            DATE:           'date',
            OBJECTID:       'objectid',
            BINARY:         'binary'
        },
        TYPE_HEADER: {
            NULL:           [0x00, 0x00],
            FALSE:          [0x01, 0x00],
            TRUE:           [0x01, 0x01],
            INT32:          [0x02, 0x00],
            INT64:          [0x02, 0x01],
            INT128:         [0x02, 0x02],
            UINT64:         [0x03, 0x01],
            UINT128:        [0x03, 0x02],
            DOUBLE:         [0x04, 0x00],
            STRING:         [0x05, 0x00],
            ARRAY:          [0x06, 0x00],
            ARRAY_START:    [0x07, 0x00],
            ARRAY_END:      [0x08, 0x00],
            OBJECT:         [0x09, 0x00],
            OBJECT_START:   [0x0a, 0x00],
            OBJECT_END:     [0x0b, 0x00],
            DATE:           [0x0c, 0x00],
            OBJECTID:       [0x0d, 0x00],
            BINARY:         [0x0e, 0x00]
        }
    };

    // convert to ArrayBuffer
    const BUFFER_LIST = ['TYPE_HEADER'];
    for (let key in exportObj) {
        if (BUFFER_LIST.indexOf(key) === -1) continue;
        for (let key2 in exportObj[key]) {
            exportObj[key][key2] = Uint8Array.from(exportObj[key][key2]).buffer;
        }
    }
    module.exports = exportObj;
})();