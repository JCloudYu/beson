/**
* Author: JCloudYu
* Create: 2018/09/24
**/
import {Binarized, BinarizedInt} from "./core-interfaces.esm.js";
import {BufferFromBinStrLE, BufferFromHexStrLE, BufferFromIntStrLE, ReadBuffer} from "../helper/misc.esm.js";



class BinarizedVariableInteger extends BinarizedInt {
	/**
	 * BinarizedVariableInteger Constructor
	 * @param {String|Number|Number[]|BinarizedData} value
	 * @param {Number} size
	**/
	constructor(value=0, size=null) {
		super();
		
		if ( size !== null ) {
			this.__set_ab(new ArrayBuffer(size));
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
			
			this.__set_ab(new ArrayBuffer(value.length));
			this._ba.set(value);
			this._ta = this._ba;
			return;
		}
		
		
		
		let buffer = ReadBuffer(value);
		if ( buffer !== null ) {
			this.__set_ab(new ArrayBuffer(buffer.byteLength));
			this._ba.set(new Uint8Array(buffer));
			this._ta = this._ba;
			return;
		}
		
		
		
		if ( Binarized.IsBinarized(value)) {
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
		this.__set_ab(new ArrayBuffer(size));
		this._ba.set(original);
		this._ta = this._ba;
	}
}



export class UIntVar extends BinarizedVariableInteger {
	/**
	 * Instantiate a UIntVar base on input value
	 * @param {String|Number|Number[]|BinarizedData} value
	 * @returns {UIntVar}
	**/
	static From(value=0) {
		return new UIntVar(value);
	}
	
	/**
	 * Return an UIntVar instance with value 0 represented by specific size of bytes
	 * @param {Number} size
	 * @returns {UIntVar}
	**/
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
	
	/**
	 * Return an UIntVar instance with MAX valid value represented by specific size of bytes
	 * @param {Number} size
	 * @returns {UIntVar}
	**/
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
export class IntVar extends BinarizedVariableInteger {
	get isSignedInt() { return true; }
	
	
	
	/**
	 * Instantiate a IntVar base on input value
	 * @param {String|Number|Number[]|BinarizedData} value
	 * @returns {IntVar}
	**/
	static From(value=0) {
		return new IntVar(value);
	}
	
	/**
	 * Return an IntVar instance with value 0 represented by specific size of bytes
	 * @param {Number} size
	 * @returns {IntVar}
	**/
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
	
	/**
	 * Return an IntVar instance with MAX valid value represented by specific size of bytes
	 * @param {Number} size
	 * @returns {IntVar}
	**/
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
	
	/**
	 * Return an IntVar instance with MIN valid value represented by specific size of bytes
	 * @param {Number} size
	 * @returns {IntVar}
	**/
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
