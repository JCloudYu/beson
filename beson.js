/**
 * Project: beson
 * File: beson.js
 * Author: JCloudYu
 * Create Date: Sep. 02, 2018 
 */
(()=>{
    'use strict';

    const { Serialize, Deserialize } = require( './beson-lib' );
    const ObjectId					 = require( './types/objectid' );
    const { Binary }				 = require( './types/binary' );
    const { UInt64, Int64 }			 = require( './types/uint64' );
    const { UInt128, Int128 }		 = require( './types/uint128' );
    
    const { ExtractBuffer }			 = require( './lib/misc' );
    
    
    
    module.exports = {
        ObjectId,
        Binary,
        UInt64,
        Int64,
        UInt128,
        Int128,
        
        Serialize,
        Deserialize,
        Helper: {
        	ExtractBuffer
        }
    };
})();
