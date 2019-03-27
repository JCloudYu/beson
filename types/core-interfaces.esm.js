/**
 *	Author: JCloudYu
 *	Create: 2018/12/04
**/
import {
	BitwiseAdditionLE,
	BitwiseAnd,
	BitwiseCompareLE,
	BitwiseDivisionLE,
	BitwiseIsZero,
	BitwiseLeftShiftLE,
	BitwiseMultiplicationLE,
	BitwiseNot,
	BitwiseOr,
	BitwiseRightShiftLE,
	BitwiseSubtractionLE,
	BitwiseTwoComplimentLE,
	BitwiseXor,
	BufferFromBinStrLE,
	BufferFromHexStrLE, BufferFromIntStrLE,
	DumpBinaryStringLE,
	DumpHexStringLE,
	DumpIntStringLE, ReadBuffer
} from "../helper/misc.esm.js";

const DEFAULT_AB  = new ArrayBuffer(0);
const DEFAULT_BA  = new Uint8Array(DEFAULT_AB);

/**
 *	@typedef {
 *		Buffer|
 *		Uint8ClampedArray|Uint8Array|Int8Array|
 *		Uint16Array|Int16Array|
 *		Uint32Array|Int32Array|
 *		Float32Array|Float64Array
 *	} TypedArray
**/

/**
 *	@typedef {
 *		TypedArray|DataView|ArrayBuffer|Binarized|BinarizedInt
 * 	} BinarizedData
**/

export class Binarized {
	/**
	 * Create a BinaryData Object that will contain specific size of data
	 *
	 * @param {Number} length
	**/
	constructor(length=0) {
		if ( arguments.length === 0 ) {
			this._ab = DEFAULT_AB;
			this._ba = DEFAULT_BA;
		}
		
		
		
		if ( typeof length !== "number" || length < 0 ) {
			throw new TypeError( "Given length must be an integer that is equal or greater than 0!" );
		}
	
		this._ab = new ArrayBuffer(length);
		this._ba = new Uint8Array(this._ab);
	}
	
	/**
	 * Return a copy of the contained binary data and resize the data into specific size
	 *
	 * @param {Number} [size=null]
	 * @returns {Uint8Array}
	**/
	toBytes(size=null) {
		if ( arguments.length <= 0 || size === null ) {
			return this._ba.slice(0);
		}
		
		if ( typeof size !== "number" || size < 0 ) {
			throw new Error( "Given size argument must be a number greater than zero!" );
		}
	
		if ( this._ba.length === size ) {
			return this._ba.slice(0);
		}
		
		if ( this._ab.length > size ) {
			return this._ba.slice(0, size);
		}
		
		
		const buffer = new Uint8Array(size);
		buffer.set(this._ba);
		return buffer;
	}
	
	/**
	 * Dumps the contained binary data into specific representation
	 *
	 * @param {Number} bits
	 * @returns {String}
	**/
	toString(bits=16) {
		switch(bits) {
			case 2:
				return DumpBinaryStringLE(this._ab);
				
			case 16:
				return DumpHexStringLE(this._ab);
				
			default:
				throw new RangeError( "Binarized.toString only supports binary & hex representation!" );
		}
	}
	
	/**
	 * Set the array buffer
	 * @param {ArrayBuffer} array_buffer
	**/
	__set_ab(array_buffer) {
		if ( !(array_buffer instanceof ArrayBuffer) ) {
			throw new TypeError( "Given input must be an ArrayBuffer!" );
		}
		
		this._ab = array_buffer;
		this._ba = new Uint8Array(this._ab);
		return this;
	}
	
	/**
	 * Returns the size of the carried data
	 * @return {number}
	**/
	get size() {
		return this._ab.byteLength;
	}
	
	[Symbol.toPrimitive](hint) {
		return this.toString(16);
	}
	
	
	
	/**
	 * Detect whether the given object implements the Binarized interface or not
	 *
	 * @returns {Boolean}
	**/
	static IsBinarized(input){
		if ( Object(input) !== input ) {
			return false;
		}
		
		let check = true;
		check = check && (input._ab instanceof ArrayBuffer);
		check = check && (input._ba instanceof Uint8Array);
		check = check && (typeof input.toBytes === "function");
		return check;
	}
}
export class BinarizedInt extends Binarized {
	constructor() {
		super();
		this._ta = this._ba;
	}
	
	
	
	// region [ Arithmetic Operators ]
	/**
	 * Perform bit-wise right shift operation and return the result
	 * @param {Number} bits shift distance
	 * @returns {UInt64}
	**/
	rshift(bits) {
		const newVal = this.constructor.From(this);
		const padding = this.isPositive ? 0x00 : 0xFF;
		BitwiseRightShiftLE(newVal._ab, bits, padding);
		return newVal;
	}
	
	/**
	 * Perform bit-wise left shift operation and return the result
	 * @param {Number} bits shift distance
	 * @returns {UInt64}
	**/
	lshift(bits) {
		const newVal = this.constructor.From(this);
		BitwiseLeftShiftLE(newVal._ab, bits, 0x00);
		return newVal;
	}
	
	/**
	 * Perform bit-wise not operation and return the result
	 * @returns {UInt64}
	**/
	not() {
		const newVal = this.constructor.From(this);
		BitwiseNot(newVal._ab);
		return newVal;
	}
	
	/**
	 * Perform bit-wise or operation with the given value and return the result
	 * @param {String|Number|UInt64|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
	 * @returns {UInt64}
	**/
	or(value) {
		const newVal = this.constructor.From(this);
		const val = this.constructor.From(value);
		BitwiseOr(newVal._ab, val._ab);
		return newVal;
	}
	
	/**
	 * Perform bit-wise and operation with the given value and return the result
	 * @param {String|Number|UInt64|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
	 * @returns {UInt64}
	**/
	and(value) {
		const newVal = this.constructor.From(this);
		const val = this.constructor.From(value);
		BitwiseAnd(newVal._ab, val._ab);
		return newVal;
	}
	
	/**
	 * Perform bit-wise xor operation with the given value and return the result
	 * @param {String|Number|UInt64|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
	 * @returns {UInt64}
	**/
	xor(value) {
		const newVal = this.constructor.From(this);
		const val = this.constructor.From(value);
		BitwiseXor(newVal._ab, val._ab);
		return newVal;
	}
	
	/**
	 * Add the instance with given value (UInt64 + value) and return the result
	 * @param {String|Number|UInt64|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
	 * @returns {UInt64}
	**/
	add(value) {
		const newVal = this.constructor.From(this);
		const val = this.constructor.From(value);
		BitwiseAdditionLE(newVal._ab, val._ab);
		return newVal;
	}
	
	/**
	 * Sub the instance with given value (UInt64 - value) and return the result
	 * @param {String|Number|UInt64|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
	 * @returns {UInt64}
	**/
	sub(value) {
		const newVal = this.constructor.From(this);
		const val = this.constructor.From(value);
		BitwiseSubtractionLE(newVal._ab, val._ab);
		return newVal;
	}
	
	/**
	 * Multiply the instance with given value (UInt64 * value) and return the result
	 * @param {String|Number|UInt64|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
	 * @returns {UInt64}
	**/
	multipliedBy(value) {
		return this.mul(value);
	}
	
	/**
	 * Multiply the instance with given value (UInt64 * value) and return the result
	 * @param {String|Number|UInt64|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
	 * @returns {UInt64}
	**/
	mul(value) {
		const newVal = this.constructor.From(this);
		const val = this.constructor.From(value);
		BitwiseMultiplicationLE(newVal._ab, val._ab);
		return newVal;
	}
	
	/**
	 * Divide the instance with given value (UInt64 / value) and return the result
	 * @param {String|Number|UInt64|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
	 * @returns {UInt64}
	**/
	dividedBy(value) {
		return this.div(value);
	}
	
	/**
	 * Divide the instance with given value (UInt64 / value) and return the result
	 * @param {String|Number|UInt64|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
	 * @returns {UInt64}
	**/
	div(value) {
		const newVal = this.constructor.From(this);
		const val = this.constructor.From(value);
		BitwiseDivisionLE(newVal._ab, val._ab, !this.isSignedInt);
		return newVal;
	}
	
	/**
	 * Divide the instance with given value (UInt64 / value) and return the modulo
	 * @param {String|Number|UInt64|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
	 * @returns {UInt64}
	**/
	modulo(value) {
		return this.mod(value);
	}
	
	/**
	 * Divide the instance with given value (UInt64 / value) and return the modulo
	 * @param {String|Number|UInt64|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
	 * @returns {UInt64}
	**/
	mod(value) {
		const newVal = this.constructor.From(this);
		const val = this.constructor.From(value);
		
		const result = BitwiseDivisionLE(newVal._ab, val._ab, !this.isSignedInt);
		newVal._ba.set(result);
		
		return newVal;
	}
	
	/**
	 * Compare the instance with given value
	 * @param {String|Number|UInt64|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
	 * @returns {number} returns 1 if UInt32 > value, -1 if UInt32 < value, 0 otherwise
	**/
	compare(value) {
		const val = this.constructor.From(value);
		return BitwiseCompareLE(this._ab, val._ab);
	}
	
	/**
	 * A short hand function that tells whether the instance equals zero
	 * @returns {boolean}
	**/
	isZero() {
		return BitwiseIsZero(this._ab);
	}
	// endregion
	
	
	
	/**
	 * Return a copy of the contained binary data and resize the data into specific size
	 *
	 * @param {Number} [size=null]
	 * @returns {Uint8Array}
	**/
	toBytes(size=null) {
		if ( arguments.length <= 0 || size === null ) {
			return this._ba.slice(0);
		}
		
		if ( typeof size !== "number" || size < 0 ) {
			throw new Error( "Given size argument must be a number greater than zero!" );
		}
	
		if ( this._ba.length === size ) {
			return this._ba.slice(0);
		}
		
		if ( this._ba.length > size ) {
			return this._ba.slice(0, size);
		}
		
		
		
		const fill	 = this.isPositive ? 0 : 0xFF;
		const buffer = new Uint8Array(size);
		buffer.fill(fill, this._ba.length, buffer.length).set(this._ba);
		return buffer;
	}
	
	/**
	 * Dumps the contained binary data into specific representation
	 *
	 * @param {Number} bits
	 * @returns {String}
	**/
	toString(bits=10) {
		switch(bits) {
			case 10:
				return DumpIntStringLE(this._ab);
				
			case 2:
			case 16:
				return super.toString(bits);
				
			default:
				throw new RangeError( "Binarized.toString only supports binary & hex representation!" );
		}
	}
	
	/**
	 * Set the stored data with value
	 * @param {String|Number|Number[]|BinarizedData} val
	**/
	__set_value(val) {
		const type = typeof val;
		if ( type === "number" ) {
			let do_negate = false;
			val = Math.floor(val);
			if ( val < 0 ) {
				do_negate = true;
				val = Math.abs(val);
			}
			
			for(let i=0; i<this._ba.length; i++) {
				this._ba[i] = val % 256;
				val = Math.floor(val/256);
			}
			
			if ( do_negate ) {
				BitwiseTwoComplimentLE(this._ab);
			}
			
			return;
		}
		
		
		
		if ( type === "string" ) {
			val = val.trim();
		
			let buffer;
			const prefix = val.substring(0, 2);
			if ( prefix === "0x" ) {
				buffer = BufferFromHexStrLE(val, this.size);
			}
			else
			if ( prefix === "0b" ) {
				buffer = BufferFromBinStrLE(val, this.size);
			}
			else {
				buffer = BufferFromIntStrLE(val, this.size);
			}
			
			this._ba.set(buffer);
			return;
		}
		
		
		
		if ( Array.isArray(val) ) {
			for(let i=0; i<val.length; i++) {
				if ( typeof val[i] !== "number" ) {
					throw new Error( "Given array should contains only numbers" );
				}
			}
			
			this._ba.set(val);
			return;
		}
		
		
		
		const buffer = ReadBuffer(val);
		if ( buffer ) {
			this._ba.set(new Uint8Array(buffer));
			return;
		}
		
		
		if ( Binarized.IsBinarized(val) ) {
			this._ba.set(val.toBytes(this.size));
			return;
		}
		
		throw new TypeError( "Given value cannot be casted into ArrayBuffer!" );
	}
	
	/**
	 * @property-get value
	 * @param {String|Number|Number[]|BinarizedData} val
	**/
	set value(val) {
		this.__set_value(val);
	}
	
	/** @type {boolean} */
	get isSignedInt() {
		return false;
	}
	
	get isPositive() {
		if ( !this.isSignedInt ) {
			return true;
		}
		
		const last_byte = this._ba[this._ba.length-1];
		return (last_byte & 0x80) === 0;
	}
	
	[Symbol.toPrimitive](hint) {
		const str = this.toString(10);
		if( hint === 'string' ){
			return str;
		}
		return +str;
	}
	
	
	
	/**
	 * Detect whether the given object implements the BinarizedInt interface or not
	 *
	 * @returns {Boolean}
	**/
	static IsBinarizedInt(input) {
		if ( !Binarized.IsBinarized(input) ) {
			return false;
		}
		
		const present = !!Object.getOwnPropertyDescriptor(input, 'isSignedInt');
		const inherit = !!Object.getOwnPropertyDescriptor(input.constructor.prototype, 'isSignedInt');
		return present || inherit;
	}
}
