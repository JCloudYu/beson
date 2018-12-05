/**
 *	Author: JCloudYu
 *	Create: 2018/12/05
**/
(()=>{
	"use strict";
	
	const {Binarized, BinarizedInt} = require( './core-interfaces' );
	const {UInt32, Int32, UInt16, Int16, UInt8, Int8} = require( './uint-small' );
	const {UInt64, Int64} = require( './uint64' );
	const {UInt128, Int128} = require( './uint128' );
	const {Binary} = require( './binary' );
	const {ObjectId} = require( './objectid' );
	
	module.exports = {
		Binarized, BinarizedInt,
		UInt32, Int32, UInt16, Int16, UInt8, Int8,
		UInt64, Int64,
		UInt128, Int128,
		Binary,
		ObjectId
	};
})();
