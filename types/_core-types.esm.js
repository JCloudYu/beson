/**
 *	Author: JCloudYu
 *	Create: 2018/12/04
**/
import {
	BitwiseAdditionLE,
	BitwiseAnd, BitwiseCompareBE,
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
	BufferFromHexStrLE, BufferFromIntStrLE, DumpBinaryStringBE,
	DumpBinaryStringLE, DumpHexStringBE,
	DumpHexStringLE,
	DumpIntStringLE, ReadBuffer,
} from "../helper.esm.js";

const DEFAULT_AB  = new ArrayBuffer(0);
const DEFAULT_BA  = new Uint8Array(DEFAULT_AB);



export class BinaryData {
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
	
	toBytes(size=null) {
		if (size === null) { return this._ba.slice(0); }
		
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
	toString(bits=16) {
		switch(bits) {
			case 2:
				return DumpBinaryStringBE(this._ab);
				
			case 16:
				return DumpHexStringBE(this._ab);
				
			default:
				throw new RangeError( "BinaryData.toString only supports binary & hex representation!" );
		}
	}
	compare(inst) {
		return this.compareBE(inst);
	}
	compareLE(inst) {
		return BitwiseCompareLE(this._ab, inst);
	}
	compareBE(inst) {
		return BitwiseCompareBE(this._ab, inst);
	}
	
	get size() {
		return this._ab.byteLength;
	}
	[Symbol.toPrimitive](hint) {
		return this.toString(16);
	}
	
	
	
	static isBinaryData(input){
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
export class BinaryInt extends BinaryData {
	constructor() {
		super();
		this._ta = this._ba;
	}
	
	rshift(bits) {
		const newVal = this.constructor.from(this);
		const padding = this.isPositive ? 0x00 : 0xFF;
		BitwiseRightShiftLE(newVal._ab, bits, padding);
		return newVal;
	}
	lshift(bits) {
		const newVal = this.constructor.from(this);
		BitwiseLeftShiftLE(newVal._ab, bits, 0x00);
		return newVal;
	}
	not() {
		const newVal = this.constructor.from(this);
		BitwiseNot(newVal._ab);
		return newVal;
	}
	or(value) {
		const newVal = this.constructor.from(this);
		const val = this.constructor.from(value);
		BitwiseOr(newVal._ab, val._ab);
		return newVal;
	}
	and(value) {
		const newVal = this.constructor.from(this);
		const val = this.constructor.from(value);
		BitwiseAnd(newVal._ab, val._ab);
		return newVal;
	}
	xor(value) {
		const newVal = this.constructor.from(this);
		const val = this.constructor.from(value);
		BitwiseXor(newVal._ab, val._ab);
		return newVal;
	}
	
	add(value) {
		const newVal = this.constructor.from(this);
		const val = this.constructor.from(value);
		BitwiseAdditionLE(newVal._ab, val._ab);
		return newVal;
	}
	sub(value) {
		const newVal = this.constructor.from(this);
		const val = this.constructor.from(value);
		BitwiseSubtractionLE(newVal._ab, val._ab);
		return newVal;
	}
	multipliedBy(value) {
		return this.mul(value);
	}
	mul(value) {
		const newVal = this.constructor.from(this);
		const val = this.constructor.from(value);
		BitwiseMultiplicationLE(newVal._ab, val._ab);
		return newVal;
	}
	dividedBy(value) {
		return this.div(value);
	}
	div(value) {
		const newVal = this.constructor.from(this);
		const val = this.constructor.from(value);
		BitwiseDivisionLE(newVal._ab, val._ab, !this.isSignedInt);
		return newVal;
	}
	modulo(value) {
		return this.mod(value);
	}
	mod(value) {
		const newVal = this.constructor.from(this);
		const val = this.constructor.from(value);
		
		const result = BitwiseDivisionLE(newVal._ab, val._ab, !this.isSignedInt);
		newVal._ba.set(result);
		
		return newVal;
	}
	
	compare(value) {
		const val = this.constructor.from(value);
		return this.compareLE(this._ab, val._ab);
	}
	isZero() {
		return BitwiseIsZero(this._ab);
	}
	
	toBytes(size=null) {
		if ( size === null ) {
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
	toString(bits=10) {
		switch(bits) {
			case 10:
				return DumpIntStringLE(this._ab, !this.isSignedInt);
				
			case 2:
				return DumpBinaryStringLE(this._ab);
				
			case 16:
				return DumpHexStringLE(this._ab);
				
			default:
				throw new RangeError( "BinaryData.toString only supports binary & hex representation!" );
		}
	}
	
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
		
		
		if ( BinaryData.isBinaryData(val) ) {
			this._ba.set(val.toBytes(this.size));
			return;
		}
		
		throw new TypeError( "Given value cannot be casted into ArrayBuffer!" );
	}
	set value(val) {
		this.__set_value(val);
	}
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
	
	
	
	static isBinaryInt(input) {
		if ( !BinaryData.isBinaryData(input) ) {
			return false;
		}
		
		const present = !!Object.getOwnPropertyDescriptor(input, 'isSignedInt');
		const inherit = !!Object.getOwnPropertyDescriptor(input.constructor.prototype, 'isSignedInt');
		return present || inherit;
	}
}
