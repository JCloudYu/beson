/**
 * Project: beson
 * File: beson.js
 * Author: JCloudYu
 * Create Date: Sep. 02, 2018 
 */
(()=>{
    'use strict';

    const Serialize = require('./lib/serializer');
    const Deserialize = require('./lib/deserializer');
    
    module.exports = {
        Serialize,
        Deserialize
    };
})();
