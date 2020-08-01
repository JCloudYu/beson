/**
* Author: JCloudYu
* Create: 2018/09/24
**/
import {BinaryData, BinaryInt} from "src/types/_core-types.esm.js";
import {BufferFromBinStrLE, BufferFromHexStrLE, BufferFromIntStrLE, ReadBuffer, ___SET_BINARY_BUFFER} from "src/helper.esm.js";


//@export=BinaryVariableLengthInt
class BinaryVariableLengthInt extends BinaryInt {
	constructor(value=0, size=null) {
		super();
		
		if ( size !== null ) {
			___SET_BINARY_BUFFER.call(this, new ArrayBuffer(size));
			this._ta = this._ba;
			
			this.__set_value(value);
			return;
		}
		
		
		
		if ( Array.isArray(value) ) {
			for(let i=0; i<value.length; i++) {
				if ( typeof value[i] !== "number" ) {
					throw new Error( "Given array should contains only numbers" );
				}
			}
			
			___SET_BINARY_BUFFER.call(this, new ArrayBuffer(value.length));
			this._ba.set(value);
			this._ta = this._ba;
			return;
		}
		
		
		
		let buffer = ReadBuffer(value);
		if ( buffer !== null ) {
			___SET_BINARY_BUFFER.call(this, new ArrayBuffer(buffer.byteLength));
			this._ba.set(new Uint8Array(buffer));
			this._ta = this._ba;
			return;
		}
		
		
		
		if ( BinaryData.isBinaryData(value)) {
			this._ta = this._ba = value.toBytes();
			this._ab = this._ba.buffer;
			return;
		}
		
		
		
		let type = typeof value;
		if ( type === "number" ) {
			type = "string";
			value = Math.floor(value).toString(10);
		}
		
		if ( type === "string" ) {
			value = value.trim();
		
			let buffer;
			const prefix = value.substring(0, 2);
			if ( prefix === "0x" ) {
				buffer = BufferFromHexStrLE(value);
			}
			else
			if ( prefix === "0b" ) {
				buffer = BufferFromBinStrLE(value);
			}
			else {
				buffer = BufferFromIntStrLE(value);
			}
			
			this._ta = this._ba = buffer;
			this._ab = buffer.buffer;
			return;
		}
		
		throw new TypeError( "Given value cannot be casted into ArrayBuffer!" );
	}
	resize(size) {
		if ( size === this.size ) return;
	
		
		let original = this._ba;
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(size));
		this._ba.set(original);
		this._ta = this._ba;
	}
}

class UIntVar extends BinaryVariableLengthInt {
	static from(value=0) {
		return new UIntVar(value);
	}
	static ZERO(size) {
		if ( typeof size !== "number" && size <= 0 ) {
			throw new Error( "Given size must be a number greater than zero!" );
		}
	
		let input = [];
		for(let i=0; i<size; i++) {
			input.push(0);
		}
		
		return new UIntVar(input);
	}
	static MAX(size) {
		if ( typeof size !== "number" && size <= 0 ) {
			throw new Error( "Given size must be a number greater than zero!" );
		}
	
		let input = [];
		for(let i=0; i<size; i++) {
			input.push(0xFF);
		}
		
		return new UIntVar(input);
	}
}

class IntVar extends BinaryVariableLengthInt {
	get isSignedInt() { return true; }
	
	
	
	static from(value=0) {
		return new IntVar(value);
	}
	static ZERO(size) {
		if ( typeof size !== "number" && size <= 0 ) {
			throw new Error( "Given size must be a number greater than zero!" );
		}
	
		let input = [];
		for(let i=0; i<size; i++) {
			input.push(0);
		}
		
		return new IntVar(input);
	}
	static MAX(size) {
		if ( typeof size !== "number" && size <= 0 ) {
			throw new Error( "Given size must be a number greater than zero!" );
		}
	
		let input = [];
		for(let i=0; i<size-1; i++) {
			input.push(0xFF);
		}
		input[size-1] = 0x7F;
		
		return new IntVar(input);
	}
	static MIN(size) {
		if ( typeof size !== "number" && size <= 0 ) {
			throw new Error( "Given size must be a number greater than zero!" );
		}
	
		let input = [];
		for(let i=0; i<size-1; i++) {
			input.push(0);
		}
		input[size-1] = 0x80;
		
		return new IntVar(input);
	}
}
//@endexport

export {UIntVar, IntVar};
