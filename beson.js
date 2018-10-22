/**
 * Project: beson
 * File: beson.js
 * Author: JCloudYu
 * Create Date: Sep. 02, 2018 
 */
(()=>{
    'use strict';

    const Serialize			= require('./lib/serializer');
    const Deserialize		= require('./lib/deserializer');
    const {UInt64, Int64}	= require( './types/uint64' );
    const {UInt128, Int128}	= require( './types/uint64' );
    
    module.exports = {
    	UInt64,
		Int64,
		UInt128,
		Int128,
		
        Serialize,
        Deserialize
    };
})();
