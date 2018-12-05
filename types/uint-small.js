/**
 *	Author: JCloudYu
 *	Create: 2018/12/04
**/
((exports)=>{
	"use strict";
	
	const MIN_INT8	 = -128;
	const MAX_INT8	 =  127;
	const MAX_UINT8  =  0xFF;
	const MIN_INT16	 = -32768;
	const MAX_INT16	 =  32767;
	const MAX_UINT16 =  0xFFFF;
	const MIN_INT32	 = -2147483648;
	const MAX_INT32	 =  2147483647;
	const MAX_UINT32 =  0xFFFFFFFF;
	
	const {ExtractBuffer} = require( '../lib/misc' );
	const {BinarizedInt} = require( './core-interfaces' );
	
	exports.UInt32	= class UInt32 extends BinarizedInt {
		/**
		 * UInt32 Constructor
		 * @param {String|Number|{toBytes:Function}|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		**/
		constructor(value=0){
			super();
			this._ab = new ArrayBuffer(4);
			this._ba = new Uint8Array(this._ab);
			this._ta = new Uint32Array(this._ab);
			
			this.value = value;
		}
		
		/**
		 * Render the instance into printable string representation
		 * @param {number} bits The representation format
		 * @returns {string}
		**/
		toString(bits=10) {
			if ( bits === 10 ) {
				return this._ba[0].toString();
			}
			
			return super.toString(bits);
		}
		
		get isSignedInt() { return false; }
		set value(val) {
			const ta = new Uint32Array(1);
			if ( typeof val === "number" ) {
				this._ta[0] = val;
				return;
			}
			
			const _val = ExtractBuffer(val);
			if ( _val === null ) {
				throw new TypeError( "Given value is not a valid UInt32 representation!" );
			}
			
			const buff = new Uint32Array(_val.slice(0, 1));
			this._ta[0] = buff[0];
		}
		
		
		/**
		 * Instantiate a UInt32 base on input value
		 * @param {String|Number|UInt32|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {UInt32}
		**/
		static from(value=0) {
			return new UInt32(value);
		}
		
		
		
		/**
		 * Return a maximum UInt32 value
		 * @returns {UInt32}
		**/
		static get MAX() {
			return new UInt32(MAX_UINT32);
		}
	};
	exports.Int32	= class Int32 extends BinarizedInt {
		/**
		 * Int32 Constructor
		 * @param {String|Number|{toBytes:Function}|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		**/
		constructor(value=0){
			super();
			this._ab = new ArrayBuffer(4);
			this._ba = new Uint8Array(this._ab);
			this._ta = new Int32Array(this._ab);
			
			this.value = value;
		}
		
		/**
		 * Render the instance into printable string representation
		 * @param {number} bits The representation format
		 * @returns {string}
		**/
		toString(bits=10) {
			if ( bits === 10 ) {
				return this._ba[0].toString();
			}
			
			return super.toString(bits);
		}
		
		get isSignedInt() { return true; }
		
		set value(val) {
			const ta = new Int32Array(1);
			if ( typeof val === "number" ) {
				this._ta[0] = val;
				return;
			}
			
			const _val = ExtractBuffer(val);
			if ( _val === null ) {
				throw new TypeError( "Given value is not a valid UInt32 representation!" );
			}
			
			const buff = new Int32Array(_val.slice(0, 1));
			this._ta[0] = buff[0];
		}
		
		/**
		 * Instantiate a Int32 base on input value
		 * @param {String|Number|UInt32|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {Int32}
		**/
		static from(value=0) {
			return new Int32(value);
		}
		
		
		
		/**
		 * Return a maximum Int32 value
		 * @returns {Int32}
		**/
		static get MAX() {
			return new Int32(MAX_INT32);
		}
		
		/**
		 * Return a minimum Int32 value
		 * @returns {Int32}
		**/
		static get MIN() {
			return new Int32(MIN_INT32);
		}
	};
	
	exports.UInt16	= class UInt16 extends BinarizedInt {
		/**
		 * UInt16 Constructor
		 * @param {String|Number|{toBytes:Function}|Uint8Array|Uint16Array|Uint16Array|ArrayBuffer|Number[]} value
		**/
		constructor(value=0){
			super();
			this._ab = new ArrayBuffer(2);
			this._ba = new Uint8Array(this._ab);
			this._ta = new Uint16Array(this._ab);
			
			this.value = value;
		}
		
		/**
		 * Render the instance into printable string representation
		 * @param {number} bits The representation format
		 * @returns {string}
		**/
		toString(bits=10) {
			if ( bits === 10 ) {
				return this._ba[0].toString();
			}
			
			return super.toString(bits);
		}
		
		get isSignedInt() { return false; }
		
		set value(val) {
			const ta = new Uint16Array(1);
			if ( typeof val === "number" ) {
				this._ta[0] = val;
				return;
			}
			
			const _val = ExtractBuffer(val);
			if ( _val === null ) {
				throw new TypeError( "Given value is not a valid UInt16 representation!" );
			}
			
			const buff = new Uint16Array(_val.slice(0, 1));
			this._ta[0] = buff[0];
		}
		
		/**
		 * Instantiate a UInt16 base on input value
		 * @param {String|Number|UInt16|Uint8Array|Uint16Array|Uint16Array|ArrayBuffer|Number[]} value
		 * @returns {UInt16}
		**/
		static from(value=0) {
			return new UInt16(value);
		}
		
		
		
		/**
		 * Return a maximum UInt16 value
		 * @returns {UInt16}
		**/
		static get MAX() {
			return new UInt16(MAX_UINT16);
		}
	};
	exports.Int16	= class Int16 extends BinarizedInt {
		/**
		 * Int16 Constructor
		 * @param {String|Number|{toBytes:Function}|Uint8Array|Uint16Array|Uint16Array|ArrayBuffer|Number[]} value
		**/
		constructor(value=0){
			super();
			this._ab = new ArrayBuffer(2);
			this._ba = new Uint8Array(this._ab);
			this._ta = new Int16Array(this._ab);
			
			this.value = value;
		}
		
		/**
		 * Render the instance into printable string representation
		 * @param {number} bits The representation format
		 * @returns {string}
		**/
		toString(bits=10) {
			if ( bits === 10 ) {
				return this._ba[0].toString();
			}
			
			return super.toString(bits);
		}
		
		get isSignedInt() { return true; }
		
		set value(val) {
			const ta = new Int16Array(1);
			if ( typeof val === "number" ) {
				this._ta[0] = val;
				return;
			}
			
			const _val = ExtractBuffer(val);
			if ( _val === null ) {
				throw new TypeError( "Given value is not a valid UInt16 representation!" );
			}
			
			const buff = new Int16Array(_val.slice(0, 1));
			this._ta[0] = buff[0];
		}
		
		/**
		 * Instantiate a Int16 base on input value
		 * @param {String|Number|UInt16|Uint8Array|Uint16Array|Uint16Array|ArrayBuffer|Number[]} value
		 * @returns {Int16}
		**/
		static from(value=0) {
			return new Int16(value);
		}
		
		
		
		/**
		 * Return a maximum Int16 value
		 * @returns {Int16}
		**/
		static get MAX() {
			return new Int16(MAX_INT16);
		}
		
		/**
		 * Return a minimum Int16 value
		 * @returns {Int16}
		**/
		static get MIN() {
			return new Int16(MIN_INT16);
		}
	};
	
	exports.UInt8	= class UInt8 extends BinarizedInt {
		/**
		 * UInt8 Constructor
		 * @param {String|Number|{toBytes:Function}|Uint8Array|Uint16Array|Uint8Array|ArrayBuffer|Number[]} value
		**/
		constructor(value=0){
			super();
			this._ab = new ArrayBuffer(1);
			this._ta = this._ba = new Uint8Array(this._ab);
			
			this.value = value;
		}
		
		/**
		 * Render the instance into printable string representation
		 * @param {number} bits The representation format
		 * @returns {string}
		**/
		toString(bits=10) {
			if ( bits === 10 ) {
				return this._ba[0].toString();
			}
			
			return super.toString(bits);
		}
		
		get isSignedInt() { return false; }
		
		set value(val) {
			const ta = new Uint8Array(1);
			if ( typeof val === "number" ) {
				this._ta[0] = val;
				return;
			}
			
			const _val = ExtractBuffer(val);
			if ( _val === null ) {
				throw new TypeError( "Given value is not a valid UInt8 representation!" );
			}
			
			const buff = new Uint8Array(_val.slice(0, 1));
			this._ta[0] = buff[0];
		}
		
		/**
		 * Instantiate a UInt8 base on input value
		 * @param {String|Number|UInt8|Uint8Array|Uint16Array|Uint8Array|ArrayBuffer|Number[]} value
		 * @returns {UInt8}
		**/
		static from(value=0) {
			return new UInt8(value);
		}
		
		
		
		/**
		 * Return a maximum UInt8 value
		 * @returns {UInt8}
		**/
		static get MAX() {
			return new UInt8(MAX_UINT8);
		}
	};
	exports.Int8	= class Int8 extends BinarizedInt {
		/**
		 * Int8 Constructor
		 * @param {String|Number|{toBytes:Function}|Uint8Array|Uint16Array|Uint8Array|ArrayBuffer|Number[]} value
		**/
		constructor(value=0){
			super();
			this._ab = new ArrayBuffer(1);
			this._ba = new Uint8Array(this._ab);
			this._ta = new Int8Array(this._ab);
			
			this.value = value;
		}
		
		/**
		 * Render the instance into printable string representation
		 * @param {number} bits The representation format
		 * @returns {string}
		**/
		toString(bits=10) {
			if ( bits === 10 ) {
				return this._ba[0].toString();
			}
			
			return super.toString(bits);
		}
		
		get isSignedInt() { return true; }
		
		set value(val) {
			if ( typeof val === "number" ) {
				this._ta[0] = val;
				return;
			}
			
			const _val = ExtractBuffer(val);
			if ( _val === null ) {
				throw new TypeError( "Given value is not a valid UInt8 representation!" );
			}
			
			const buff = new Int8Array(_val.slice(0, 1));
			this._ta[0] = buff[0];
		}
		
		/**
		 * Instantiate a Int8 base on input value
		 * @param {String|Number|UInt8|Uint8Array|Uint16Array|Uint8Array|ArrayBuffer|Number[]} value
		 * @returns {Int8}
		**/
		static from(value=0) {
			return new Int8(value);
		}
		
		
		
		/**
		 * Return a maximum Int8 value
		 * @returns {Int8}
		**/
		static get MAX() {
			return new Int8(MAX_INT8);
		}
		
		/**
		 * Return a minimum Int8 value
		 * @returns {Int8}
		**/
		static get MIN() {
			return new Int8(MIN_INT8);
		}
	};
})((typeof window !== "undefined") ? window : (typeof module !== "undefined" ? module.exports : {}));

