/**
 * Author: JCloudYu
 * Create: 2018/09/24
**/
((exports)=>{
	"use strict";
	
	const _previous_uint64 = exports.UInt128;
	const _previous_int64  = exports.Int128;
	
	// region [ Detect NodeJS Buffer implementation ]
	let BUFFER = null;
	if ( typeof Buffer !== "undefined" ) {
		BUFFER = Buffer;
	}
	// endregion
	
	// region [ Internal constants ]
	const MAGIC_STRING_UNSIGNED = "\u0000\u0018\u0004";
	const MAGIC_STRING_SIGNED	= "\u0000\u0018\u0005";
	const SERIALIZE_UNSIGNED  = 0;
	const SERIALIZE_SIGNED	  = 1;
	
	const OVERFLOW32_MAX  = (0xFFFFFFFF >>> 0) + 1;
	const INTEGER_FORMAT  = /^[+-]?[0-9]+$/;
	const HEX_FORMAT	  = /^0x[0-9A-Fa-f]+$/;
	const BIN_FORMAT	  = /^0b[01]+$/;
	const DECIMAL_STEPPER = new Uint32Array([0x3B9ACA00, 0x00000000]);	// 1000000000
	
	const SERIALIZE_MAP   = "0123456789abcdefghijklmnopqrstuvwxyz-_ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
	const SERIALIZE_MAP_R = {};
	for( let i=0; i<SERIALIZE_MAP.length; i++ ) { SERIALIZE_MAP_R[SERIALIZE_MAP[i]] = i; }
	// endregion
	
	
	
	class UInt128 {
		/**
		 * UInt128 Constructor
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		**/
		constructor(value=0){
			this.value  = value;
		}
		
		/**
		 * Perform bit-wise right shift operation and return the result
		 * @param {Number} bits shift distance
		 * @returns {UInt128}
		**/
		rshift(bits) {
			const newVal = UInt128.from(this);
			___RIGHT_SHIFT_UNSIGNED(newVal._ta, bits);
			return newVal;
		}
		
		/**
		 * Perform bit-wise left shift operation and return the result
		 * @param {Number} bits shift distance
		 * @returns {UInt128}
		**/
		lshift(bits) {
			const newVal = UInt128.from(this);
			___LEFT_SHIFT(newVal._ta, bits);
			return newVal;
		}
		
		/**
		 * Perform bit-wise not operation and return the result
		 * @returns {UInt128}
		**/
		not() {
			const newVal = UInt128.from(this);
			___NOT(newVal._ta);
			return newVal;
		}
		
		/**
		 * Perform bit-wise or operation with the given value and return the result
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {UInt128}
		**/
		or(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid UInt128 representation!" );
			}
			
			
			const newVal = new UInt128(this);
			___OR(newVal._ta, val);
			return newVal;
		}
		
		/**
		 * Perform bit-wise and operation with the given value and return the result
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {UInt128}
		**/
		and(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid UInt128 representation!" );
			}
			
			
			const newVal = new UInt128(this);
			___AND(newVal._ta, val);
			return newVal;
		}
		
		/**
		 * Perform bit-wise xor operation with the given value and return the result
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {UInt128}
		**/
		xor(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid UInt128 representation!" );
			}
			
			
			const newVal = new UInt128(this);
			___XOR(newVal._ta, val);
			return newVal;
		}
		
		/**
		 * Add the instance with given value (UInt128 + value) and return the result
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {UInt128}
		**/
		add(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid UInt128 representation!" );
			}
			
			const newVal = new UInt128(this);
			___ADD(newVal._ta, val);
			return newVal;
		}
		
		/**
		 * Sub the instance with given value (UInt128 - value) and return the result
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {UInt128}
		**/
		sub(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid UInt128 format!" );
			}
			
			const newVal = new UInt128(this);
			___SUB(newVal._ta, val);
			return newVal;
		}
		
		/**
		 * Multiply the instance with given value (UInt128 * value) and return the result
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {UInt128}
		**/
		multiply(value) {
			return this.mul(value);
		}
		
		/**
		 * Multiply the instance with given value (UInt128 * value) and return the result
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {UInt128}
		**/
		mul(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid UInt128 format!" );
			}
			
			const newVal = new UInt128(this);
			___MULTIPLY(newVal._ta, val);
			return newVal;
		}
		
		/**
		 * Divide the instance with given value (UInt128 / value) and return the result
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {UInt128}
		**/
		divide(value) {
			return this.div(value);
		}
		
		/**
		 * Divide the instance with given value (UInt128 / value) and return the result
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {UInt128}
		**/
		div(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid UInt128 format!" );
			}
			
			return new UInt128(___DIVIDE(this._ta.slice(0), val));
		}
		
		/**
		 * Divide the instance with given value (UInt128 / value) and return the modulo
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {UInt128}
		**/
		modulo(value) {
			return this.mod(value);
		}
		
		/**
		 * Divide the instance with given value (UInt128 / value) and return the modulo
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {UInt128}
		**/
		mod(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid UInt128 format!" );
			}
			
			const newVal = UInt128.from(this);
			___DIVIDE(newVal._ta, val);
			return newVal;
		}
		
		/**
		 * Compare the instance with given value
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {number} returns 1 if UInt32 > value, -1 if UInt32 < value, 0 otherwise
		**/
		compare(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid UInt128 representation!" );
			}
			
			return ___COMPARE(this._ta, val);
		}
		
		/**
		 * A short hand function that tells whether the instance equals zero
		 * @returns {boolean}
		**/
		isZero() {
			return ___IS_ZERO(this._ta);
		}
		
		/**
		 * Serialize the instance
		 * @returns {string}
		**/
		serialize() {
			return ___SERIALIZE(this._ta, SERIALIZE_UNSIGNED);
		}
		
		/**
		 * Render the instance into printable string representation
		 * @param {number} bits The representation format
		 * @returns {string}
		**/
		toString(bits=10) {
			switch( bits ) {
				case 2:
					return ___TO_BINARY_STRING(this._ta);
				case 10:
					return ___TO_DECIMAL_STRING(this._ta);
				case 16:
					return ___TO_HEX_STRING(this._ta);
				default:
					throw new TypeError( "Unexpected representation type" )
			}
		}
		
		/**
		 * @alias UInt128.serialize
		**/
		toJSON() {
			return this.serialize();
		}
		
		/**
		 * (Binarization Protocol)
		 * Return binary representation of this instance
		 * @return {ArrayBuffer}
		**/
		toBytes(len=null) {
			const buff = this._ta.buffer;
			return buff.slice(0, len === null ? buff.byteLength : len);
		}
		
		/**
		 * (NumberBinarization Protocol)
		 * Return whether the given instance is signed or unsigned
		 * @returns {boolean}
		**/
		isSigned() { return false; }
		
		set value(val) {
			const _val = ___UNPACK(val);
			if ( _val === null ) {
				throw new TypeError( "Given value is not a valid UInt128 representation!" );
			}
			
			this._ta = _val.slice(0);
		}
		
		/**
		 * Deserialize a serialized data and return the corresponding UInt128 instance
		 * @param {string} serialized_str The serialized UInt128 data
		 * @returns {UInt128}
		**/
		static deserialize(serialized_str) {
			if ( serialized_str.length !== 16 && serialized_str.slice(0, 3) !== MAGIC_STRING_UNSIGNED ) {
				throw new TypeError( "The input serialized string is invalid!" );
			}
		
			const recovered = ___DESERIALIZE(serialized_str);
			return UInt128.from(recovered.buffer);
		}
		
		/**
		 * Instantiate a UInt128 base on input value
		 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {UInt128}
		**/
		static from(value=0) {
			return new UInt128(value);
		}
		
		
		/**
		 * Return an UInt128 instance with value 0
		 * @returns {UInt128}
		**/
		static get ZERO() {
			return new UInt128();
		}
		
		/**
		 * Return an UInt128 instance with value 0xFFFFFFFFFFFFFFFF
		 * @returns {UInt128}
		**/
		static get MAX() {
			return new UInt128([0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF]);
		}
		
		/**
		 * Revert to previous version...
		 * @returns {UInt128}
		**/
		static noConflict() {
			if ( _previous_uint64 ) {
				exports.UInt128 = _previous_uint64;
			}
			return exports.UInt128;
		}
	}
	exports.UInt128 = UInt128;
	
	class Int128 {
		/**
		 * Int128 Constructor
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		**/
		constructor(value=0){
			this.value  = value;
		}
		
		/**
		 * Perform bit-wise right shift operation and return the result
		 * @param {Number} bits shift distance
		 * @returns {Int128}
		**/
		rshift(bits) {
			const newVal = Int128.from(this);
			___RIGHT_SHIFT_SIGNED(newVal._ta, bits);
			return newVal;
		}
		
		/**
		 * Perform bit-wise left shift operation and return the result
		 * @param {Number} bits shift distance
		 * @returns {Int128}
		**/
		lshift(bits) {
			const newVal = Int128.from(this);
			___LEFT_SHIFT(newVal._ta, bits);
			return newVal;
		}
		
		/**
		 * Perform bit-wise not operation and return the result
		 * @returns {Int128}
		**/
		not() {
			const newVal = Int128.from(this);
			___NOT(newVal._ta);
			return newVal;
		}
		
		/**
		 * Perform bit-wise or operation with the given value and return the result
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {Int128}
		**/
		or(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid Int128 representation!" );
			}
			
			
			const newVal = new Int128(this);
			___OR(newVal._ta, val);
			return newVal;
		}
		
		/**
		 * Perform bit-wise and operation with the given value and return the result
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {Int128}
		**/
		and(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid Int128 representation!" );
			}
			
			
			const newVal = new Int128(this);
			___AND(newVal._ta, val);
			return newVal;
		}
		
		/**
		 * Perform bit-wise xor operation with the given value and return the result
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {Int128}
		**/
		xor(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid Int128 representation!" );
			}
			
			
			const newVal = new Int128(this);
			___XOR(newVal._ta, val);
			return newVal;
		}
		
		/**
		 * Return the absolute value of the instance
		 * @return {Int128}
		**/
		abs() {
			const newVal = new Int128(this);
			if ( ___IS_NEGATIVE(newVal._ta) ) {
				___TWO_S_COMPLIMENT(newVal._ta);
			}
			
			return newVal;
		}
		
		/**
		 * Add the instance with given value (Int128 + value) and return the result
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {Int128}
		**/
		add(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid Int128 representation!" );
			}
			
			const newVal = new Int128(this);
			___ADD(newVal._ta, val);
			return newVal;
		}
		
		/**
		 * Sub the instance with given value (Int128 - value) and return the result
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {Int128}
		**/
		sub(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid Int128 format!" );
			}
			
			const newVal = new Int128(this);
			___SUB(newVal._ta, val);
			return newVal;
		}
		
		/**
		 * Multiply the instance with given value (Int128 * value) and return the result
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {Int128}
		**/
		multiply(value) {
			return this.mul(value);
		}
		
		/**
		 * Multiply the instance with given value (Int128 * value) and return the result
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {Int128}
		**/
		mul(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid Int128 format!" );
			}
			
			const newVal = new Int128(this);
			___MULTIPLY(newVal._ta, val);
			return newVal;
		}
		
		/**
		 * Divide the instance with given value (Int128 / value) and return the result
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {Int128}
		**/
		divide(value) {
			return this.div(value);
		}
		
		/**
		 * Divide the instance with given value (Int128 / value) and return the result
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {Int128}
		**/
		div(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid Int128 format!" );
			}
			
			let neg_self  = ___IS_NEGATIVE(this._ta) ? 1 : 0;
			let self = this._ta.slice(0);
			if ( neg_self ) {
				___TWO_S_COMPLIMENT(self);
			}
			
			let neg_input = ___IS_NEGATIVE(val) ? 1 : 0;
			let input = val.slice(0);
			if ( neg_input ) {
				___TWO_S_COMPLIMENT(input);
			}
			
			let quotient = ___DIVIDE(self, input);
			if ( neg_input ^ neg_self ) {
				___TWO_S_COMPLIMENT(quotient);
			}
			
			return new Int128(quotient);
		}
		
		/**
		 * Divide the instance with given value (Int128 / value) and return the modulo
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {Int128}
		**/
		modulo(value) {
			return this.mod(value);
		}
		
		/**
		 * Divide the instance with given value (Int128 / value) and return the modulo
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {Int128}
		**/
		mod(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid Int128 format!" );
			}
			
			let neg_self  = ___IS_NEGATIVE(this._ta) ? 1 : 0;
			let self = this._ta.slice(0);
			if ( neg_self ) {
				___TWO_S_COMPLIMENT(self);
			}
			
			let neg_input = ___IS_NEGATIVE(val) ? 1 : 0;
			let input = val.slice(0);
			if ( neg_input ) {
				___TWO_S_COMPLIMENT(input);
			}
			
			___DIVIDE(self, input);
			if ( neg_self ) {
				___TWO_S_COMPLIMENT(self);
			}
			
			return Int128.from(self);
		}
		
		/**
		 * Compare the instance with given value
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {number} returns 1 if UInt32 > value, -1 if UInt32 < value, 0 otherwise
		**/
		compare(value) {
			const val = ___UNPACK(value);
			if ( val === null ) {
				throw new TypeError( "Given value is not a valid Int128 representation!" );
			}
			
			return ___COMPARE(this._ta, val);
		}
		
		/**
		 * A short hand function that tells whether the instance equals zero
		 * @returns {boolean}
		**/
		isZero() {
			return ___IS_ZERO(this._ta);
		}
		
		/**
		 * A short hand function that tells whether the instance is negative
		 * @returns {boolean}
		**/
		isNegative() {
			return ___IS_NEGATIVE(this._ta);
		}
		
		/**
		 * Serialize the instance
		 * @returns {string}
		**/
		serialize() {
			return ___SERIALIZE(this._ta, SERIALIZE_SIGNED);
		}
		
		/**
		 * Render the instance into printable string representation
		 * @param {number} bits The representation format
		 * @returns {string}
		**/
		toString(bits=10) {
			switch( bits ) {
				case 2:
					return ___TO_BINARY_STRING(this._ta);
				case 10:
					return ___TO_DECIMAL_STRING_SIGNED(this._ta);
				case 16:
					return ___TO_HEX_STRING(this._ta);
				default:
					throw new TypeError( "Unexpected representation type" )
			}
		}
		
		/**
		 * @alias Int128.serialize
		**/
		toJSON() {
			return this.serialize();
		}
		
		/**
		 * (Binarization Protocol)
		 * Return binary representation of this instance
		 * @return {ArrayBuffer}
		**/
		toBytes(len=null) {
			const buff = this._ta.buffer;
			return buff.slice(0, len === null ? buff.byteLength : len);
		}
		
		/**
		 * (NumberBinarization Protocol)
		 * Return whether the given instance is signed or unsigned
		 * @returns {boolean}
		**/
		isSigned() { return true; }
		
		
		set value(val) {
			const _val = ___UNPACK(val);
			if ( _val === null ) {
				throw new TypeError( "Given value is not a valid Int128 representation!" );
			}
			
			this._ta = _val.slice(0);
		}
		
		
		/**
		 * Deserialize a serialized data and return the corresponding Int128 instance
		 * @param {string} serialized_str The serialized Int128 data
		 * @returns {Int128}
		**/
		static deserialize(serialized_str) {
			if ( serialized_str.length !== 16 && serialized_str.slice(0, 3) !== MAGIC_STRING_SIGNED ) {
				throw new TypeError( "The input serialized string is invalid!" );
			}
			
			const recovered = ___DESERIALIZE(serialized_str);
			return Int128.from(recovered);
		}
		
		/**
		 * Instantiate a Int128 base on input value
		 * @param {String|Number|Int128|Uint8Array|Uint16Array|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
		 * @returns {Int128}
		**/
		static from(value=0) {
			return new Int128(value);
		}
		
		
		/**
		 * Return an Int128 instance with value 0
		 * @returns {Int128}
		**/
		static get ZERO() {
			return new Int128();
		}
		
		/**
		 * Return an Int128 instance with value 0xFFFFFFFFFFFFFFFF
		 * @returns {Int128}
		**/
		static get MAX() {
			return new Int128([0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0x7FFFFFFF]);
		}
		
		/**
		 * Return an Int128 instance with value 0xFFFFFFFFFFFFFFFF
		 * @returns {Int128}
		**/
		static get MIN() {
			return new Int128([0x00000000, 0x00000000, 0x00000000, 0x80000000]);
		}
		
		/**
		 * Revert to previous version...
		 * @returns {Int128}
		**/
		static noConflict() {
			if ( _previous_int64 ) {
				exports.Int128 = _previous_int64;
			}
			return exports.Int128;
		}
	}
	exports.Int128 = Int128;
	
	
	
	// region [ Helper functions for binary operations ]
	/**
	 * Generate serialized data from given data
	 * @param {Uint32Array} data
	 * @param {number} type
	 * @returns {string}
	 * @private
	**/
	function ___SERIALIZE(data, type = SERIALIZE_UNSIGNED) {
		const dataBuff = new Uint8Array(data.buffer);
		const TAIL_COUNT = Math.ceil(dataBuff.byteLength/2);
		const TAIL_BYTES = new Uint8Array(TAIL_COUNT);
		
		let serialized = type === SERIALIZE_UNSIGNED ? MAGIC_STRING_UNSIGNED : MAGIC_STRING_SIGNED;
		serialized += String.fromCodePoint(TAIL_COUNT + dataBuff.byteLength);
		
		
		for(let i=0; i<dataBuff.length; i++) {
			const TAIL_POS	= (i/2)|0;
			const SHIFT		= (i % 2) ? 0 : 2;
			serialized += SERIALIZE_MAP[dataBuff[i] >>> 2];
			TAIL_BYTES[TAIL_POS] = TAIL_BYTES[TAIL_POS] + ((dataBuff[i] & 0x03) << SHIFT);
		}
		
		for( let tail of TAIL_BYTES ) {
			serialized += SERIALIZE_MAP[tail];
		}
		
		return serialized;
	}
	
	/**
	 * Deserialize given UInt128 / Int128 serialized data back into Uint32Array
	 * @param {string} data
	 * @returns {Uint32Array}
	 * @private
	**/
	function ___DESERIALIZE(data) {
		const RAW_DATA = data.substring(4);
		const INPUT_DATA_LEN = data.codePointAt(3);
		const DATA_LENGTH = Math.ceil(INPUT_DATA_LEN/3) * 2;
		const recovered = new Uint8Array(DATA_LENGTH);
		
		for( let i=0; i<DATA_LENGTH; i++ ) {
			const TAIL_POS	= DATA_LENGTH + ((i/2)|0);
			const SHIFT		= (i % 2) ? 0 : 2;
			recovered[i] = (SERIALIZE_MAP_R[RAW_DATA[i]] << 2) |
						   ((SERIALIZE_MAP_R[RAW_DATA[TAIL_POS]] >> SHIFT) & 0x03);
		}
		
		return new Uint32Array(recovered.buffer);
	}

	/**
	 * A mutable operation that perform bitwise and between two UInt128 value
	 * @param {Uint32Array} a
	 * @param {Uint32Array} b
	 * @private
	**/
	function ___AND(a, b) {
		for( let i=0; i<a.length; i++ ) {
			a[i] = a[i] & b[i];
		}
	}
	
	/**
	 * A mutable operation that perform bitwise or between two UInt128 value
	 * @param {Uint32Array} a
	 * @param {Uint32Array} b
	 * @private
	**/
	function ___OR(a, b) {
		for( let i=0; i<a.length; i++ ) {
			a[i] = a[i] | b[i];
		}
	}
	
	/**
	 * A mutable operation that perform bitwise or between two UInt128 value
	 * @param {Uint32Array} a
	 * @param {Uint32Array} b
	 * @private
	**/
	function ___XOR(a, b) {
		for( let i=0; i<a.length; i++ ) {
			a[i] = a[i] ^ b[i];
		}
	}
	
	/**
	 * A mutable operation that perform bitwise not to the given UInt128 value
	 * @param {Uint32Array} value
	 * @private
	**/
	function ___NOT(value) {
		for( let i=0; i<value.length; i++ ) {
			value[i] = (~value[i]);
		}
	}
	
	/**
	 * A mutable operation that perform bitwise two's compliment to the given UInt128 value
	 * @param {Uint32Array} value
	 * @private
	**/
	function ___TWO_S_COMPLIMENT(value) {
		let overflow = 1;
		for( let i=0; i<value.length; i++ ) {
			overflow = ((~value[i])>>>0) + overflow;
			value[i] = overflow % OVERFLOW32_MAX;
			overflow = (overflow / OVERFLOW32_MAX)|0;
		}
	}

	/**
	 * A mutable operation that shifts the bits right using zero padded scheme
	 * Note that this function is mutable...
	 * @param {Uint32Array} value
	 * @param {Number} BITS
	 * @private
	**/
	function ___RIGHT_SHIFT_UNSIGNED(value, BITS) {
		if ( typeof BITS !== "number" ) {
			throw new TypeError( "Shift bits number must be a number" );
		}
	
		const MAX_BITS	= value.byteLength * 8;
		if ( BITS >= MAX_BITS ) {
			value.fill(0);
			return;
		}
		
		
		
		const SKIPPED_QWORDS  = (BITS / 32)>>>0;
		const REAL_SHIFT_BITS = BITS % 32;
		const LEFT_OVER_BITS  = 32 - REAL_SHIFT_BITS;
		const LOWER_MASK	  = (0xFFFFFFFF >>> LEFT_OVER_BITS);
		const ENDPOINT = value.length - SKIPPED_QWORDS;
		for( let i=0; i<ENDPOINT; i++) {
			const SRC_IDX = i + SKIPPED_QWORDS;
			value[i] = value[SRC_IDX] >>>  REAL_SHIFT_BITS;
			
			if ( LEFT_OVER_BITS < 32 && SRC_IDX + 1 < value.length ) {
				value[i] =  value[i] | ((value[SRC_IDX+1] & LOWER_MASK) << LEFT_OVER_BITS);
			}
		}
		
		for ( let i=value.length; i >= ENDPOINT; i-- ) {
			value[i] = 0;
		}
	}

	/**
	 * A mutable operation that shifts the bits right.
	 * Note that this function is mutable...
	 * @param {Uint32Array} value
	 * @param {Number} BITS
	 * @private
	**/
	function ___RIGHT_SHIFT_SIGNED(value, BITS) {
		if ( typeof BITS !== "number" ) {
			throw new TypeError( "Shift bits number must be a number" );
		}
		
		const negative = (value[value.length-1] & 0x80000000) !== 0;
	
		const MAX_BITS	= value.byteLength * 8;
		if ( BITS >= MAX_BITS ) {
			value.fill(negative ? 0xFFFFFFFF : 0);
			return;
		}
		
		
		
		const SKIPPED_QWORDS  = (BITS / 32)>>>0;
		const REAL_SHIFT_BITS = BITS % 32;
		const LEFT_OVER_BITS  = 32 - REAL_SHIFT_BITS;
		const LOWER_MASK	  = (0xFFFFFFFF >>> LEFT_OVER_BITS);
		
		const ENDPOINT = value.length - SKIPPED_QWORDS;
		for( let i=0; i<ENDPOINT; i++) {
			const SRC_IDX = i + SKIPPED_QWORDS;
			value[i] = value[SRC_IDX] >>>  REAL_SHIFT_BITS;
			
			if ( LEFT_OVER_BITS < 32 ) {
				if ( SRC_IDX + 1 < value.length ) {
					value[i] =  value[i] | ((value[SRC_IDX+1] & LOWER_MASK) << LEFT_OVER_BITS);
				}
				else
				if ( negative ) {
					value[i] =  value[i] | (LOWER_MASK<<LEFT_OVER_BITS);
				}
			}
		}
		
		for ( let i=value.length; i >= ENDPOINT; i-- ) {
			value[i] = negative ? 0xFFFFFFFF : 0;
		}
	}
	
	/**
	 * A mutable operation that shifts the bits left.
	 * Note that this function is mutable...
	 * @param {Uint32Array} value
	 * @param {Number} BITS
	 * @private
	**/
	function ___LEFT_SHIFT(value, BITS) {
		if ( typeof BITS !== "number" ) {
			throw new TypeError( "Shift bits number must be a number" );
		}
	
		const MAX_BITS	= value.byteLength * 8;
		if ( BITS >= MAX_BITS ) {
			value.fill(0);
			return;
		}
		
		
		
		const SKIPPED_QWORDS  = (BITS / 32)>>>0;
		const REAL_SHIFT_BITS = BITS % 32;
		const LEFT_OVER_BITS  = 32 - REAL_SHIFT_BITS;
		const LOWER_MASK	  = (0xFFFFFFFF >>> LEFT_OVER_BITS) << LEFT_OVER_BITS;
		for( let i=value.length-1; i >= SKIPPED_QWORDS; i-- ) {
			const SRC_IDX = i-SKIPPED_QWORDS;
			value[i] = value[SRC_IDX] << REAL_SHIFT_BITS;
			if ( LEFT_OVER_BITS < 32 && SRC_IDX-1 >= 0 ) {
				value[i] = value[i] | ((value[SRC_IDX-1] & LOWER_MASK) >>> LEFT_OVER_BITS);
			}
		}
		
		for ( let i=0; i < SKIPPED_QWORDS; i++ ) {
			value[i] = 0;
		}
	}
	// endregion
	
	// region [ Helper functions for arithmetic operations ]
	/**
	 * Perform UInt128 a + b and write the result back to a
	 * @param {Uint32Array} a
	 * @param {Uint32Array} b
	 * @private
	**/
	function ___ADD(a, b) {
		let overflow = 0;
		for( let i=0; i<a.length; i++ ) {
			overflow = b[i] + a[i] + overflow;
			a[i] = overflow % OVERFLOW32_MAX;
			overflow = (overflow / OVERFLOW32_MAX)|0;
		}
	}
	
	/**
	 * Perform UInt128 a * b and write the result back to a
	 * @param {Uint32Array} a
	 * @param {Uint32Array} b
	 * @private
	**/
	function ___MULTIPLY(a, b) {
		let FINAL = new Uint16Array(a.buffer);
		let A = new Uint16Array(a.buffer.slice(0));
		let B = new Uint16Array(b.buffer);
		
		let overflow = 0;
		for ( let i=0; i<8; i++ ) {
			let val = overflow;
			for ( let j=i; j>=0; j-- ) {
				val += A[j] * B[i-j];
			}
			overflow = val >>> 16;
			FINAL[i] = val;
		}
	}
	
	/**
	 * Perform UInt128 a / b and write the remainder back to a and return quotient back
	 * @param {Uint32Array} a
	 * @param {Uint32Array} b
	 * @return {Uint32Array}
	 * @private
	**/
	function ___DIVIDE(a, b) {
		if ( ___IS_ZERO(b) ) {
			throw new TypeError( "Dividing zero prohibited!" );
		}
	
		const quotient	= new Uint32Array(a.length);
		if ( ___COMPARE(a, b) < 0 ) {
			return quotient;
		}
		
		
		
		let remainder = a.slice(0);
		let divider	  = b.slice(0);
		// region [ Align divider and remainder ]
		let d_padding = 0, r_padding = 0, count = 128;
		while( count-- > 0 ) {
			if ( (remainder[remainder.length-1] & 0x80000000) !== 0 ) {
				break;
			}
			
			___LEFT_SHIFT(remainder, 1);
			r_padding++;
		}
		remainder = a;
		
		count = 128;
		while( count-- > 0 ) {
			if ( (divider[divider.length-1] & 0x80000000) !== 0 ) {
				break;
			}
			___LEFT_SHIFT(divider, 1);
			d_padding++;
		}
		___RIGHT_SHIFT_UNSIGNED(divider, r_padding);
		// endregion
		
		// region [ Calc division ]
		count = d_padding - r_padding + 1;
		while( count-- > 0 ) {
			if ( ___COMPARE(remainder, divider) >= 0 ) {
				___SUB(remainder, divider);
				quotient[0] = quotient[0] | 0x01;
			}
			
			if ( count > 0 ) {
				___LEFT_SHIFT(quotient, 1);
				___RIGHT_SHIFT_UNSIGNED(divider, 1);
			}
		}
		// endregion
		return quotient;
	}
	
	/**
	 * Perform UInt128 a + b and write the result back to a
	 * @param {Uint32Array} a
	 * @param {Uint32Array} b
	 * @private
	**/
	function ___SUB(a, b) {
		let B = b.slice(0);
		___TWO_S_COMPLIMENT(B);
		___ADD(a, B);
	}
	// endregion
	
	// region [ Helper functions for comparison ]
	/**
	 * Check if given val is zero
	 * @param {Uint32Array} val
	 * @return {boolean}
	 * @private
	**/
	function ___IS_ZERO(val) {
		let zero = true;
		for( let v of val ) {
			zero = zero && (v===0);
		}
		return zero;
	}
	
	/**
	 * Check if the given value is negative
	 * @param {Uint32Array} val
	 * @returns {boolean}
	 * @private
	**/
	function ___IS_NEGATIVE(val) {
		return (val[val.length-1] & 0x80000000) !== 0;
	}
	
	/**
	 * Compare two UInt128 values return -1 if a < b, 1 if a > b, 0 otherwise
	 * @param {Uint32Array} a
	 * @param {Uint32Array} b
	 * @return {Number}
	 * @private
	**/
	function ___COMPARE(a, b) {
		for ( let i=a.length-1; i>=0; i-- ) {
			if ( a[i] < b[i] ) {
				return -1;
			}
			else if ( a[i] > b[i] ) {
				return 1;
			}
		}
		
		return 0;
	}
	// endregion
	
	// region [ Miscellaneous helper functions ]
	/**
	 * Get raw Uint32Array values converted from source value
	 * @param {String|Number|UInt128|Uint8Array|Uint16Array|Uint32Array|ArrayBuffer|Number[]} value
	 * @returns {Uint32Array}
	 * @private
	**/
	function ___UNPACK(value=0) {
		if ( (value instanceof Int128) || (value instanceof UInt128) ) {
            return value._ta;
        }
		if ( value instanceof Uint32Array ) {
			const array = new Uint32Array(4);
			for( let i=0; i<array.length; i++ ) {
				array[i] = value[i] || 0;
			}
			return array;
		}
		if ( value instanceof Uint16Array ) {
			const val = new Uint32Array(value.buffer);
			const array = new Uint32Array(4);
			for( let i=0; i<array.length; i++ ) {
				array[i] = val[i] || 0;
			}
			return array;
		}
		if ( value instanceof Uint8Array ) {
			const val = new Uint32Array(value.buffer);
			const array = new Uint32Array(4);
			for( let i=0; i<array.length; i++ ) {
				array[i] = val[i] || 0;
			}
			return array;
		}
		if ( value instanceof ArrayBuffer ) {
			const val = new Uint32Array(value);
			const array = new Uint32Array(4);
			for( let i=0; i<array.length; i++ ) {
				array[i] = val[i] || 0;
			}
			return array;
		}
		if ( BUFFER && value instanceof BUFFER ) {
			const buff	= new ArrayBuffer(16);
			const uint8 = new Uint8Array(buff);
			for ( let i=0; i<16; i++ ) {
				uint8[i] = buff[i]||0;
			}
			
			return new Uint32Array(buff);
		}
		
		// UInt128 represented with UInt32 values, little-endian
		if ( Array.isArray(value) ) {
			return new Uint32Array(value);
		}
		
		// TODO: We can establish a type conversion protocol in the future
		if ( Object(value) === value && value.toBytes ) {
			return new Uint32Array(value.toBytes(16));
		}
		
		const type = typeof value;
		const u32  = new Uint32Array(4);
		switch( type ) {
			case "number":
				___PARSE_NUMBER(u32, value);
				break;
			
			case "string":
			{
				value = value.trim();
				
				if ( INTEGER_FORMAT.test(value) ) {
					___PARSE_INT_STRING(u32, value);
				}
				else
				if ( HEX_FORMAT.test(value) ) {
					___PARSE_HEX_STRING(u32, value);
				}
				else
				if ( BIN_FORMAT.test(value) ) {
					___PARSE_BIN_STRING(u32, value);
				}
				else {
					return null;
				}
				break;
			}
			
			default:
				return null;
		}
		
		return u32;
	}
	
	/**
	 * Parse js number and write the parsed result into buff
	 * @param {Uint32Array} buff
	 * @param {number} value
	 * @private
	**/
	function ___PARSE_NUMBER(buff, value) {
		let negate = value < 0;
		if ( negate ) {
			value = Math.abs(value);
		}
		
		buff.fill(0);
		value = Math.floor(value);
		buff[0] = value % OVERFLOW32_MAX;
		value = Math.floor(value / OVERFLOW32_MAX);
		buff[1] = value % OVERFLOW32_MAX;
		
		if ( negate ) {
			___TWO_S_COMPLIMENT(buff);
		}
	}
	
	/**
	 * Parse js number and write the parsed result into buff
	 * @param {Uint32Array} buff
	 * @param {number} value
	 * @private
	**/
	function ___PARSE_NUMBER_UNSIGNED(buff, value) {
		buff.fill(0);
		value = Math.floor(value);
		buff[0] = value % OVERFLOW32_MAX;
		value = Math.floor(value / OVERFLOW32_MAX);
		buff[1] = value % OVERFLOW32_MAX;
	}
	
	/**
	 * Parse integer formatted string and write the parsed result into buff
	 * @param {Uint32Array} buff
	 * @param {string} value
	 * @private
	**/
	function ___PARSE_INT_STRING(buff, value) {
		let temp = new Uint32Array(4);
		let negative = ['-', '+'].indexOf(value[0]);
		if ( negative >= 0 ) {
			value = value.substring(1);
			negative = 1-negative;
		}
		else {
			negative = 0;
		}
		
		
		let STEPPER = temp.slice(0);
		for( let i=0; i<STEPPER.length; i++ ) {
			STEPPER[i] = DECIMAL_STEPPER[i] || 0;
		}
		
		buff.fill(0);
		let increase = 0;
		while( value.length  > 0 ) {
			let int = parseInt(value.substring(value.length - 9, value.length), 10);
			
			___PARSE_NUMBER_UNSIGNED(temp, int);
			for ( let i=0; i<increase; i++ ) {
				___MULTIPLY(temp, STEPPER);
			}
			___ADD(buff, temp);
			
			value = value.substring(0, value.length - 9);
			increase++;
		}
		
		if ( negative ) {
			___TWO_S_COMPLIMENT(buff);
		}
	}
	
	/**
	 * Parse hex formatted string and write the parsed result into buff
	 * @param {Uint32Array} buff
	 * @param {string} value
	 * @private
	**/
	function ___PARSE_HEX_STRING(buff, value) {
		value = value.substring(2);
		for(let i=0; i<buff.length; i++) {
			buff[i] = ( value.length <= 0 ) ? 0 : parseInt(value.substring(value.length - 8, value.length), 16);
			value = value.substring(0, value.length - 8);
		}
	}
	
	/**
	 * Parse binary formatted string and write the parsed result into buff
	 * @param {Uint32Array} buff
	 * @param {string} value
	 * @private
	**/
	function ___PARSE_BIN_STRING(buff, value) {
		value = value.substring(2);
		for(let i=0; i<buff.length; i++) {
			buff[i] = value.length <= 0 ? 0 : parseInt(value.substring(value.length - 32, value.length), 2);
			value = value.substring(0, value.length - 32);
		}
	}
	
	/**
	 * Return binary representation of the given UInt128 number
	 * @param {Uint32Array} val
	 * @return {String}
	 * @private
	**/
	function ___TO_BINARY_STRING(val) {
		const UPPER_BYTE = val.length - 1, BOUNDARY = val.byteLength * 8;
		let str = '', copy = val.slice(0);
		for ( let i=0; i<BOUNDARY; i++ ) {
			str += (copy[UPPER_BYTE] & 0x80000000) ? '1' : '0';
			___LEFT_SHIFT(copy, 1);
		}
		return str;
	}
	
	/**
	 * Return hex representation of the given UInt128 number
	 * @return {String}
	 * @private
	**/
	function ___TO_HEX_STRING(val) {
		const BOUNDARY = val.length-1;
		let str = '', padding_flag = false;
		for ( let i=BOUNDARY; i>=0; i-- ) {
			if ( val[i] !== 0 ) {
				if ( !padding_flag ) {
					str += val[i].toString(16);
				}
				else {
					str += ___PADDING_ZERO(val[i].toString(16), 8);
				}
				
				padding_flag = padding_flag || true;
			}
			else {
				if ( padding_flag ) {
					str += ___PADDING_ZERO(val[i].toString(16), 8);
				}
			}
		}
		
		return str;
	}
	
	/**
	 * Return decimal representation of the given UInt128 number
	 * @return {String}
	 * @private
	**/
	function ___TO_DECIMAL_STRING(val) {
		let output = [];
		
		let STEPPER = val.slice(0);
		for( let i=0; i<STEPPER.length; i++ ) {
			STEPPER[i] = DECIMAL_STEPPER[i] || 0;
		}
		
		let remain	= val.slice(0);
		while ( !___IS_ZERO(remain) ) {
			let quotient = ___DIVIDE(remain, STEPPER);
			output.unshift(remain[0].toString(10));
			remain = quotient;
		}
		
		if ( output.length === 0 ) {
			return '0';
		}
		else {
			let o = output.shift();
			for(let comp of output) {
				o += ___PADDING_ZERO(comp, 9);
			}
			
			return o;
		}
	}
	
	/**
	 * Return decimal representation of the given UInt128 number
	 * @return {String}
	 * @private
	**/
	function ___TO_DECIMAL_STRING_SIGNED(val) {
		let output = [];
		
		let STEPPER = val.slice(0);
		for( let i=0; i<STEPPER.length; i++ ) {
			STEPPER[i] = DECIMAL_STEPPER[i] || 0;
		}
		
		let negative = ___IS_NEGATIVE(val);
		let remain = val.slice(0);
		if ( negative ) { ___TWO_S_COMPLIMENT(remain); }
		while ( !___IS_ZERO(remain) ) {
			let quotient = ___DIVIDE(remain, STEPPER);
			output.unshift(remain[0].toString(10));
			remain = quotient;
		}
		
		if ( output.length === 0 ) {
			return '0';
		}
		else {
			let o = (negative ? '-' : '') + output.shift();
			for(let comp of output) {
				o += ___PADDING_ZERO(comp, 9);
			}
			
			return o;
		}
	}
	
	/**
	 * Add padding zeros to the given string data
	 * @param {string} data
	 * @param {number} length
	 * @private
	**/
	function ___PADDING_ZERO(data, length=8) {
		let padding = length - data.length;
		let padded = '';
		while(padding-- > 0) {
			padded += '0';
		}
		
		return padded + data;
	}
	// endregion
})((typeof window !== "undefined") ? window : (typeof module !== "undefined" ? module.exports : {}));
