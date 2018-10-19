/**
 * Project: beson
 * File: beson.js
 * Author: JCloudYu
 * Create Date: Sep. 02, 2018 
 */
(()=>{
    'use strict';

    const serialize = require('./lib/serializer');
    const deserialize = require('./lib/deserializer');
    
    module.exports = {
        serialize,
        deserialize
    };
})();
