/**
*	Author: JCloudYu
*	Create: 2018/12/18
**/
import {
	RandomBytes,
	GetEnvHostName,
	Uint8ArrayFromHex,
	DumpHexString,
	DumpBinaryString
} from "../helper/misc.esm.js";
import {fnv1a24 as FNV1A24} from "../helper/hash.esm.js";



const PID			= (new Uint16Array(RandomBytes(2)))[0];
const MACHINE_ID	= FNV1A24(GetEnvHostName());






let SEQ_NUMBER = (new Uint32Array(RandomBytes(4)))[0];
const _PROPS = new WeakMap();
export class ObjectId {
	constructor(id=null) {
		// region [ Default Constructor ]
		if ( id === null || typeof id === 'number' ) {
			this._dv = ___GEN_OBJECT_ID(id);
			return;
		}
		// endregion
		
		// region [ Copy Constructor ]
		if ( id instanceof ObjectId ) {
			const OTHER	 = _PROPS.get(id);
			this._dv = new DataView(OTHER._dv.buffer.slice(0));
			return;
		}
		// endregion
		
		// region [ Cast other type or error... ]
		const RAW_ID = ___CAST_OBJECT_ID(id);
		if ( RAW_ID === null ) {
			throw new TypeError(
				'Argument passed in must be either a buffer, a number, a date object, a binary string of 12 bytes or a hex string with 24 characters.'
			);
		}
		
		this._dv = new DataView(RAW_ID);
		// endregion
	}
	toString(bits=16) {
		switch(bits) {
			case 2:
				return DumpBinaryString(this._dv.buffer);
				
			case 16:
			default:
				return DumpHexString(this._dv.buffer);
		}
	}
	toJSON() {
		return this.toString(16);
	}
	
	static Generate(id=null) {
		return new ObjectId(id);
	}
}






function ___GEN_OBJECT_ID(initTime=null) {
	const time	= initTime || ((Date.now()/1000)|0);
	const pid	= PID;
	const inc	= (SEQ_NUMBER=(SEQ_NUMBER+1) % 0xffffff);



	const buffer = new DataView(new ArrayBuffer(12));
	// region [ Fill in the id information ]
	// Fill in the info in reversed order to prevent byte-wise assignments
	buffer.setUint32(8, inc, false);		// [9-11] seq
	buffer.setUint16(7, pid, false);		// [7-8] pid
	buffer.setUint32(3, MACHINE_ID, false);	// [4-6] machine id
	buffer.setUint32(0, time, false);		// [0-3] epoch time
	// endregion
	
	
	
	return buffer;
}
function ___CAST_OBJECT_ID(candidate) {
	if ( candidate instanceof ArrayBuffer ) {
		if ( candidate.byteLength >= 12 ) {
			return candidate.slice(0, 12);
		}
		
		return null;
	}
	else
	if ( ArrayBuffer.isView(candidate) ) {
		if ( candidate.byteLength >= 12 ) {
			return candidate.buffer.slice(0, 12);
		}
		
		return null;
	}
	
	
	
	const type = typeof candidate;
	if ( type === "string" ) {
		if ( candidate.substring(0, 2) !== "0x" ) {
			candidate = "0x" + candidate;
		}
	
		if ( candidate.length !== 26 ) {
			return null;
		}
		
		return Uint8ArrayFromHex(candidate).buffer;
	}
	
	if ( candidate instanceof Date ) {
		candidate = candidate.getTime();
	}
	if ( candidate === null || type === "number" ) {
		return ___GEN_OBJECT_ID(candidate);
	}
	
	return null;
}
