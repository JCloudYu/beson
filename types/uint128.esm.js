/**
* Author: JCloudYu
* Create: 2018/09/24
**/
import {BinaryInt} from "./_core-types.esm.js";
import {___SET_BINARY_BUFFER} from "../helper.esm.js";


//@export=UInt128
class UInt128 extends BinaryInt {
	constructor(value=0) {
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(16));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	
	
	static from(value=0) {
		return new UInt128(value);
	}
	static get ZERO() {
		return new UInt128();
	}
	static get MAX() {
		return new UInt128([
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF
		]);
	}
}

class Int128 extends BinaryInt  {
	constructor(value=0){
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(16));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	get isSignedInt() { return true; }
	
	
	
	static from(value=0) {
		return new Int128(value);
	}
	static get ZERO() {
		return new Int128();
	}
	static get MAX() {
		return new Int128([
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F,
		]);
	}
	static get MIN() {
		return new Int128([
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
		]);
	}
}
//@endexport

export {UInt128};
export {Int128}; 
