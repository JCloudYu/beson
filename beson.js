/**
 * Project: beson
 * File: beson.js
 * Author: JCloudYu
 * Create Date: Sep. 02, 2018 
 */
(()=>{
    'use strict';

    const Serialize			  = require('./lib/serializer');
    const Deserialize		  = require('./lib/deserializer');
    const { Binary }          = require('./types/binary');
    const { UInt64, Int64 }	  = require('./types/uint64');
    const { UInt128, Int128 } = require('./types/uint128');
    
    module.exports = {
        Binary,
        UInt64,
		Int64,
		UInt128,
		Int128,
		
        Serialize,
        Deserialize
    };
})();
