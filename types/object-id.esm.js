/**
*	Author: JCloudYu
*	Create: 2018/12/18
**/
import {
	ObtainBuffer, RandomBytes, DumpHexString, HexToBuffer
} from "../helper/misc.esm.js";

import {HAS_NODE_BUFFER} from "../constants.esm.js";
import {Binarized} from "./core-interfaces.esm.js";
import {fnv1a24 as FNV1A24} from "../helper/hash.esm.js";






const PID = (new Uint16Array(RandomBytes(2)))[0];
const MACHINE_ID = FNV1A24(___GET_ENV_HOSTNAME());






let SEQ_NUMBER = (new Uint32Array(RandomBytes(4)))[0];
export class ObjectId extends Binarized {
	/**
	 * @param {String|Number|null|TypedArray|ArrayBuffer|DataView|Binarized} id
	**/
	constructor(id=null) {
		super();
		
		if ( id instanceof Date ) { id = id.getTime(); }
		if ( id === null || typeof id === 'number' ) {
			this._set_ab(___GEN_OBJECT_ID(id));
			return;
		}
	
	
		
		this._set_ab(RandomBytes(12));

		// Convert from other binary sources
		let buffer = ObtainBuffer(id);
		if ( buffer !== null ) {
			const source = new Uint8Array(buffer);
			this._ba.set(source, 0);
			return;
		}
		
		// Convert from hex string
		const type = typeof id;
		if ( type === "string" ) {
			if ( id.substring(0, 2) !== "0x" ) {
				id = "0x" + id;
			}
			
			const source = new Uint8Array(HexToBuffer(id));
			this._ba.set(source, 0);
			return;
		}
		
		
		
		throw new TypeError(
			'Argument passed in must be either a buffer, a number, a date object, a binary string of 12 bytes or a hex string with 24 characters.'
		);
	}
	
	static Create(id=null) {
		return new ObjectId(id);
	}
}





/**
 * Generate an array buffer that contains random ObjectId
 * @param {Number} [initTime=null]
 * @return {ArrayBuffer}
 * @private
**/
function ___GEN_OBJECT_ID(initTime=null) {
	const time	= initTime || Math.floor(Date.now()/1000);
	const pid	= PID;
	const inc	= (SEQ_NUMBER=(SEQ_NUMBER+1) % 0xffffff);



	const buffer = new DataView(new ArrayBuffer(12));
	
	// NOTE: Fill in the id information
	// NOTE: Following statements' order should not be modified!
	buffer.setUint32(8, inc, false);		// [9-11] seq
	buffer.setUint16(7, pid, false);		// [7-8] pid
	buffer.setUint32(3, MACHINE_ID, false);	// [4-6] machine id
	buffer.setUint32(0, time, false);		// [0-3] epoch time
	
	return buffer.buffer;
}

/**
 * Get current execution environment's corresponding hostname string
 * @return {String}
 * @private
**/
function ___GET_ENV_HOSTNAME() {
	try {
		if ( HAS_NODE_BUFFER ) {
			return require( 'os' ).hostname;
		}
		else
		if ( typeof window !== "undefined" ) {
			return window.location.hostname;
		}
		else {
			throw new Error("");
		}
	}
	catch(e) {
		return 'unknown.' + DumpHexString(RandomBytes(32));
	}
}
