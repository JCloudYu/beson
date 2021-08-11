/**
* Author: JCloudYu
* Create: 2018/09/24
**/
import {BinaryInt} from "src/types/_core-types.esm.js";
import {___SET_BINARY_BUFFER} from "src/helper.esm.js";


//@export=UInt256
class UInt256 extends BinaryInt {
	constructor(value=0) {
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(32));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	
	
	static from(value=0) {
		return new UInt256(value);
	}
	static get ZERO() {
		return new UInt256();
	}
	static get MAX() {
		return new UInt256([
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF
		]);
	}
}

class Int256 extends BinaryInt  {
	constructor(value=0){
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(32));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	get isSignedInt() { return true; }
	
	
	
	static from(value=0) {
		return new Int256(value);
	}
	static get ZERO() {
		return new Int256();
	}
	static get MAX() {
		return new Int256([
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F,
		]);
	}
	static get MIN() {
		return new Int256([
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
		]);
	}
}
//@endexport


export {UInt256, Int256};