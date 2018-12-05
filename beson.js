/**
 * Project: beson
 * File: beson.js
 * Author: JCloudYu
 * Create Date: Sep. 02, 2018 
 */
(()=>{
    'use strict';

    const { Serialize, Deserialize } = require( './beson-lib' );
    const BesonType = require( './types' );
    const { UInt8, UInt16, UInt32, Int8, Int16, Int32, UInt64, Int64, UInt128, Int128, ObjectId, Binary } = BesonType;
    const {
    	ExtractBuffer,
    	DumpBinaryString,
    	DumpHexString,
    	UTF8Encode,
    	UTF8Decode
    } = require( './lib/misc' );
    
    
    
    module.exports = {
    	BesonType,
    
        ObjectId,
        Binary,
        UInt8,
        Int8,
        UInt16,
        Int16,
        UInt32,
        Int32,
        UInt64,
        Int64,
        UInt128,
        Int128,
        
        Serialize,
        Deserialize,
        Helper: {
            ExtractBuffer,
            DumpBinaryString,
            DumpHexString,
            UTF8Encode,
            UTF8Decode
        }
    };
})();
