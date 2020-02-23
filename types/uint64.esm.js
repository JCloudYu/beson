/**
* Author: JCloudYu
* Create: 2018/09/24
**/
import {BinaryInt} from "./_core-types.esm.js";
import {___SET_BINARY_BUFFER} from "../helper.esm.js";


//@export=UInt64
class __UInt64 extends BinaryInt {
	constructor(value=0){
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(8));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	
	
	static from(value=0) {
		return new UInt64(value);
	}
	static get ZERO() {
		return new UInt64();
	}
	static get MAX() {
		const val = new UInt64();
		val._ta[0] = 0xFFFFFFFF;
		val._ta[1] = 0xFFFFFFFF;
		
		return val;
	}
}
//@endexport
//@export=Int64
class __Int64 extends BinaryInt {
	constructor(value=0){
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(8));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	get isSignedInt() { return true; }
	
	
	
	static from(value=0) {
		return new Int64(value);
	}
	static get ZERO() {
		return new Int64();
	}
	static get MAX() {
		const val = new Int64();
		val._ta[1] = 0x7FFFFFFF;
		val._ta[0] = 0xFFFFFFFF;
		return val;
	}
	static get MIN() {
		const val = new Int64();
		val._ta[1] = 0x80000000;
		val._ta[0] = 0x00000000;
		return val;
	}
}
//@endexport

export const UInt64 = __UInt64;
export const Int64 = __Int64;
