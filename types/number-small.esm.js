/**
*	Author: JCloudYu
*	Create: 2018/12/04
**/
import {ReadBuffer, ___SET_BINARY_BUFFER} from "../helper.esm.js";
import {BinaryData, BinaryInt} from "./_core-types.esm.js";


//@export=BinarySmallNumber
const MIN_INT8	 = -128;
const MAX_INT8	 =  127;
const MAX_UINT8  =  0xFF;
const MIN_INT16	 = -32768;
const MAX_INT16	 =  32767;
const MAX_UINT16 =  0xFFFF;
const MIN_INT32	 = -2147483648;
const MAX_INT32	 =  2147483647;
const MAX_UINT32 =  0xFFFFFFFF;
const MAX_FLT32_SAFE_INT = 0x4B7FFFFF;
const MIN_FLT32_SAFE_INT = 0xCB7FFFFF;
const MAX_FLT32 = new Uint8Array([0xFF, 0xFF, 0x7F, 0x7F]);	// 0x7F7FFFFF
const MIN_FLT32 = new Uint8Array([0xFF, 0xFF, 0x7F, 0x80]); // 0x807FFFFF
const NAN_FLT23 = new Uint8Array([0xFF, 0xFF, 0xFF, 0x7F]); // 0x7FFFFFFF
const POS_INF_FLT32 = new Uint8Array([0x00, 0x00, 0x80, 0x7F]); // 0x7F800000
const NEG_INF_FLT32 = new Uint8Array([0x00, 0x00, 0x80, 0xFF]); // 0xFF800000



class BinarySmallNumber extends BinaryInt {
	[Symbol.toPrimitive](hint) {
		return (hint === 'string') ? `${this._ta[0]}` : this._ta[0];
	}
	
	toString(bits=10) {
		if ( bits === 10 ) {
			return this._ta[0].toString();
		}
		
		return super.toString(bits);
	}
}
//@endexport

//@export=__UInt32
class __UInt32 extends BinarySmallNumber {
	constructor(value=0){
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(4));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	__set_value(val) {
		if ( typeof val === "number" ) {
			this._ta[0] = val;
			return;
		}
		
		
		
		let _val = null;
		if ( BinaryData.isBinaryData(val) ) {
			_val = val._ab;
		}
		else {
			_val = ReadBuffer(val);
		}
		
		if ( _val === null ) {
			throw new TypeError( "Given value cannot be casted into ArrayBuffer!" );
		}
		
		
		
		const buff = new Uint32Array(_val.slice(0, 1));
		this._ta[0] = buff[0];
	}
	
	
	
	static from(value=0) {
		return new UInt32(value);
	}
	static get ZERO() {
		return new UInt32(0);
	}
	static get MAX() {
		return new UInt32(MAX_UINT32);
	}
}
//@endexport
//@export=Int32
class Int32 extends BinarySmallNumber {
	constructor(value=0){
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(4));
		this._ta = new Int32Array(this._ab);
		
		this.__set_value(value);
	}
	
	get isSignedInt() { return true; }
	__set_value(val) {
		if ( typeof val === "number" ) {
			this._ta[0] = val;
			return;
		}
		
		
		
		let _val = null;
		if ( BinaryData.isBinaryData(val) ) {
			_val = val._ab;
		}
		else {
			_val = ReadBuffer(val);
		}
		
		if ( _val === null ) {
			throw new TypeError( "Given value cannot be casted into ArrayBuffer!" );
		}
		
		
		
		const buff = new Int32Array(_val.slice(0, 1));
		this._ta[0] = buff[0];
	}
	
	
	
	static from(value=0) {
		return new Int32(value);
	}
	static get ZERO() {
		return new Int32(0);
	}
	static get MAX() {
		return new Int32(MAX_INT32);
	}
	static get MIN() {
		return new Int32(MIN_INT32);
	}
}
//@endexport
//@export=UInt16
class UInt16 extends BinarySmallNumber {
	constructor(value=0){
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(2));
		this._ta = new Uint16Array(this._ab);
		
		this.__set_value(value);
	}
	
	get isSignedInt() { return false; }
	__set_value(val) {
		if ( typeof val === "number" ) {
			this._ta[0] = val;
			return;
		}
		
		
		
		let _val = null;
		if ( BinaryData.isBinaryData(val) ) {
			_val = val._ab;
		}
		else {
			_val = ReadBuffer(val);
		}
		
		if ( _val === null ) {
			throw new TypeError( "Given value cannot be casted into ArrayBuffer!" );
		}
		
		
		
		const buff = new Uint16Array(_val.slice(0, 1));
		this._ta[0] = buff[0];
	}
	
	
	
	static from(value=0) {
		return new UInt16(value);
	}
	static get ZERO() {
		return new UInt16(0);
	}
	static get MAX() {
		return new UInt16(MAX_UINT16);
	}
}
//@endexport
//@export=Int16
class Int16 extends BinarySmallNumber {
	constructor(value=0){
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(2));
		this._ta = new Int16Array(this._ab);
		
		this.__set_value(value);
	}
	
	get isSignedInt() { return true; }
	__set_value(val) {
		if ( typeof val === "number" ) {
			this._ta[0] = val;
			return;
		}
		
		
		
		let _val = null;
		if ( BinaryData.isBinaryData(val) ) {
			_val = val._ab;
		}
		else {
			_val = ReadBuffer(val);
		}
		
		if ( _val === null ) {
			throw new TypeError( "Given value cannot be casted into ArrayBuffer!" );
		}
		
		
		
		const buff = new Int16Array(_val.slice(0, 1));
		this._ta[0] = buff[0];
	}
	
	
	
	static from(value=0) {
		return new Int16(value);
	}
	static get ZERO() {
		return new Int16(0);
	}
	static get MAX() {
		return new Int16(MAX_INT16);
	}
	static get MIN() {
		return new Int16(MIN_INT16);
	}
}
//@endexport
//@export=UInt8
class __UInt8 extends BinarySmallNumber {
	constructor(value=0){
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(1));
		this._ta = this._ba = new Uint8Array(this._ab);
		
		this.__set_value(value);
	}
	
	get isSignedInt() { return false; }
	__set_value(val) {
		if ( typeof val === "number" ) {
			this._ta[0] = val;
			return;
		}
		
		
		
		let _val = null;
		if ( BinaryData.isBinaryData(val) ) {
			_val = val._ab;
		}
		else {
			_val = ReadBuffer(val);
		}
		
		if ( _val === null ) {
			throw new TypeError( "Given value cannot be casted into ArrayBuffer!" );
		}
		
		
		
		const buff = new Uint8Array(_val.slice(0, 1));
		this._ta[0] = buff[0];
	}
	
	
	
	static from(value=0) {
		return new UInt8(value);
	}
	static get ZERO() {
		return new UInt8(0);
	}
	static get MAX() {
		return new UInt8(MAX_UINT8);
	}
}
//@endexport
//@export=Int8
class Int8 extends BinarySmallNumber {
	constructor(value=0){
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(1));
		this._ta = new Int8Array(this._ab);
		
		this.__set_value(value);
	}
	
	get isSignedInt() { return true; }
	__set_value(val) {
		if ( typeof val === "number" ) {
			this._ta[0] = val;
			return;
		}
		
		
		
		let _val = null;
		if ( BinaryData.isBinaryData(val) ) {
			_val = val._ab;
		}
		else {
			_val = ReadBuffer(val);
		}
		
		if ( _val === null ) {
			throw new TypeError( "Given value cannot be casted into ArrayBuffer!" );
		}
		
		
		
		const buff = new Int8Array(_val.slice(0, 1));
		this._ta[0] = buff[0];
	}
	
	
	
	static from(value=0) {
		return new Int8(value);
	}
	static get ZERO() {
		return new Int8(0);
	}
	static get MAX() {
		return new Int8(MAX_INT8);
	}
	static get MIN() {
		return new Int8(MIN_INT8);
	}
}
//＠endexport
//@export=Float32
class Float32 extends BinarySmallNumber {
	constructor(value=0){
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(4));
		this._ta = new Float32Array(this._ab);
		this.__set_value(value);
	}
	
	get isSignedInt() { return true; }
	__set_value(val) {
		if ( typeof val === "number" ) {
			this._ta[0] = val;
			return;
		}
		
		
		
		let _val = null;
		if ( BinaryData.isBinaryData(val) ) {
			_val = val._ab;
		}
		else {
			_val = ReadBuffer(val);
		}
		
		if ( _val === null ) {
			throw new TypeError( "Given value cannot be casted into ArrayBuffer!" );
		}
		
		
		
		const buff = new Float32Array(_val.slice(0, 4));
		this._ta[0] = buff[0];
	}
	
	
	
	static from(value=0) {
		return new Float32(value);
	}
	static get ZERO() {
		return new Float32(0);
	}
	static get NaN() {
		return new Float32(NAN_FLT23);
	}
	static get MAX_INFINITY() {
		return new Float32(POS_INF_FLT32);
	}
	static get MIN_INFINITY() {
		return new Float32(NEG_INF_FLT32);
	}
	static get MAX_INT() {
		return new Float32(MAX_FLT32_SAFE_INT);
	}
	static get MIN_INT() {
		return new Float32(MIN_FLT32_SAFE_INT);
	}
	static get MAX() {
		return new Float32(MAX_FLT32);
	}
	static get MIN() {
		return new Float32(MIN_FLT32);
	}
}
//@endexport


export {UInt32};
export {Int32};
export {Int16};
export {UInt8};
export {Int8};
export {Float32};
