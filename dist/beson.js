(()=>{"use strict";
const writable=true, configurable=true, enumerable=false;
const ___IS_LITTLE_ENDIAN = (new Uint8Array(Uint16Array.from([0x1234])))[0] === 0x34;
if ( !___IS_LITTLE_ENDIAN ) {
	throw new Error( "Beson only supports little endian environment!" )
}

const HAS_NODE_BUFFER = (typeof Buffer !== "undefined");
const DATA_TYPE = Object.freeze({
	NULL:			1,
	
	FALSE:			2,
	TRUE:			3,

	STRING:			4,
	
	INT8:			5,
	INT16:			6,
	INT32:			7,
	INT64:			8,
	INT128:			9,
	INT256:			10,
	INT512:			11,
//	INTVAR:			12,

	UINT8:			13,
	UINT16:			14,
	UINT32:			15,
	UINT64:			16,
	UINT128:		17,
	UINT256:		18,
	UINT512:		19,
//	UINTVAR:		20,
	
	
	FLOAT32:		21,
	FLOAT64:		22,
	
	ARRAY:			23,
	SET:			24,
	
	OBJECT:			25,
	MAP:			26,
	
	ARRAY_BUFFER:	27,
	INT8_ARRAY:		28,
	UINT8_ARRAY:	29,
	INT16_ARRAY:	30,
	UINT16_ARRAY:	31,
	INT32_ARRAY:	32,
	UINT32_ARRAY:	33,
	FLOAT32_ARRAY:	34,
	FLOAT64_ARRAY:	35,
	DATA_VIEW:		36,
	SPECIAL_BUFFER:	37,
	
	DATE:			38,
	REGEX:			39,
	
	END:			99,
	BINARIZABLE:   100,
});
const TYPE_HEADER = Object.freeze({
	END:			0x00,

	NULL:			0x10,
	
	FALSE:			0x20,
	TRUE:			0x21,
	
	STRING:			0x30,
	
	INT8:			0x40,
	INT16:			0x41,
	INT32:			0x42,
	INT64:			0x43,
	INT128:			0x44,
	INT256:			0x45,
	INT512:			0x46,
//	INTVAR:			0x4F,
	
	UINT8:			0x50,
	UINT16:			0x51,
	UINT32:			0x52,
	UINT64:			0x53,
	UINT128:		0x54,
	UINT256:		0x55,
	UINT512:		0x56,
//	UINTVAR:		0x5F,
	
	FLOAT32:		0x60,
	FLOAT64:		0x61,
	
	ARRAY:			0x70,
	SET:			0x71,
	
	OBJECT:			0x80,
	MAP:			0x81,
	
	ARRAY_BUFFER:	0x90,
	INT8_ARRAY:		0x91,
	UINT8_ARRAY:	0x92,
	INT16_ARRAY:	0x93,
	UINT16_ARRAY:	0x94,
	INT32_ARRAY:	0x95,
	UINT32_ARRAY:	0x96,
	FLOAT32_ARRAY:	0x97,
	FLOAT64_ARRAY:	0x98,
	DATA_VIEW:		0x9E,
	SPECIAL_BUFFER:	0x9F,
	
	DATE:			0xA0,
	REGEX:			0xA1
});


const HEX_FORMAT_CHECKER = /^0x([0-9a-fA-F]{2})+$/;
const BIN_FORMAT_CHECKER = /^0b([01]{8})+$/;
const INT_FORMAT_CHECKER = /^[+-]?\d+$/;
const DECIMAL_STEPPER = new Uint8Array([0x00, 0xCA, 0x9A, 0x3B]);	// 1000000000 ( 0x3B9ACA00 )

const HEX_MAP_INVERSE = {
	0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
	a: 10, b: 11, c: 12, d: 13, e: 14, f: 15,
	A: 10, B: 11, C: 12, D: 13, E: 14, F: 15
};










function ReadBuffer(input){
	if( HAS_NODE_BUFFER ){
		if( input instanceof Buffer ){
			let buff = Buffer.alloc(input.length);
			input.copy(buff, 0);
			return buff.buffer;
		}
	}
	if( ArrayBuffer.isView(input) ){
		return input.buffer;
	}
	if( input instanceof ArrayBuffer ){
		return input;
	}
	return null;
}
function MergeArrayBuffers(...array_buffers) {
	if ( Array.isArray(array_buffers[0]) ) {
		array_buffers = array_buffers[0];
	}
	
	let totalLength = 0;
	for( let ab of array_buffers ) {
		totalLength += ab.byteLength;
	}
	
	
	// NOTE: Copy all data
	const newInst = new Uint8Array(totalLength);
	let offset = 0;
	for( let ab of array_buffers ){
		newInst.set(new Uint8Array(ab), offset);
		offset += ab.byteLength;
	}
	
	return newInst.buffer;
}
function HexToBuffer(inputStr, length = null){
	if( !HEX_FORMAT_CHECKER.test(inputStr) ){
		throw new SyntaxError("Given hex string is not a valid hex string!");
	}
	
	inputStr = inputStr.slice(2);
	if( inputStr.length % 2 === 1 ){ inputStr = '0' + inputStr; }
	let buffer = new Uint8Array(inputStr.length / 2);
	for( let pointer = 0; pointer < buffer.length; pointer++ ){
		let offset = pointer * 2;
		buffer[pointer] = HEX_MAP_INVERSE[inputStr[offset + 1]] | (HEX_MAP_INVERSE[inputStr[offset]] << 4);
	}
	return buffer.buffer;
}

function UTF8Encode(str){
	let codePoints = [];
	for( let i = 0; i < str.length; i++ ){
		let codePoint = str.codePointAt(i);
		// 1-byte sequence
		if( (codePoint & 0xffffff80) === 0 ){
			codePoints.push(codePoint);
		}
		// 2-byte sequence
		else if( (codePoint & 0xfffff800) === 0 ){
			codePoints.push(
				0xc0 | (0x1f & (codePoint >> 6)),
				0x80 | (0x3f & codePoint)
			);
		}
		// 3-byte sequence
		else if( (codePoint & 0xffff0000) === 0 ){
			codePoints.push(
				0xe0 | (0x0f & (codePoint >> 12)),
				0x80 | (0x3f & (codePoint >> 6)),
				0x80 | (0x3f & codePoint)
			);
		}
		// 4-byte sequence
		else if( (codePoint & 0xffe00000) === 0 ){
			codePoints.push(
				0xf0 | (0x07 & (codePoint >> 18)),
				0x80 | (0x3f & (codePoint >> 12)),
				0x80 | (0x3f & (codePoint >> 6)),
				0x80 | (0x3f & codePoint)
			);
		}
		
		if( codePoint > 0xffff ){
			i++;
		}
	}
	return new Uint8Array(codePoints).buffer;
}
function UTF8Decode(buffer){
	let uint8 = new Uint8Array(buffer);
	let codePoints = [];
	for( let i = 0; i < uint8.length; i++ ){
		let codePoint = uint8[i] & 0xff;
		
		// 1-byte sequence (0 ~ 127)
		if( (codePoint & 0x80) === 0 ){
			codePoints.push(codePoint);
		}
		// 2-byte sequence (192 ~ 223)
		else if( (codePoint & 0xe0) === 0xc0 ){
			codePoint = ((0x1f & uint8[i]) << 6) | (0x3f & uint8[i + 1]);
			codePoints.push(codePoint);
			i += 1;
		}
		// 3-byte sequence (224 ~ 239)
		else if( (codePoint & 0xf0) === 0xe0 ){
			codePoint = ((0x0f & uint8[i]) << 12)
				| ((0x3f & uint8[i + 1]) << 6)
				| (0x3f & uint8[i + 2]);
			codePoints.push(codePoint);
			i += 2;
		}
		// 4-byte sequence (249 ~ )
		else if( (codePoint & 0xF8) === 0xF0 ){
			codePoint = ((0x07 & uint8[i]) << 18)
				| ((0x3f & uint8[i + 1]) << 12)
				| ((0x3f & uint8[i + 2]) << 6)
				| (0x3f & uint8[i + 3]);
			codePoints.push(codePoint);
			i += 3;
		}
	}
	return String.fromCodePoint(...codePoints);
}

function BitwiseNot(input){
	input = ReadBuffer(input);
	if( input === null ){
		throw new TypeError("Given input must be an ArrayBuffer!");
	}
	
	const buffer = new Uint8Array(input);
	for( let off = 0; off < buffer.length; off++ ){
		buffer[off] = ~buffer[off];
	}
}
function BitwiseAnd(a, b){
	a = ReadBuffer(a);
	b = ReadBuffer(b);
	
	if( a === null || b === null ){
		throw new TypeError("Given inputs must be ArrayBuffers!");
	}
	
	const bufferA = new Uint8Array(input);
	const bufferB = new Uint8Array(input);
	for( let off = 0; off < bufferA.length; off++ ){
		bufferA[off] = bufferA[off] & (bufferB[off] || 0);
	}
}
function BitwiseOr(a, b){
	a = ReadBuffer(a);
	b = ReadBuffer(b);
	
	if( a === null || b === null ){
		throw new TypeError("Given inputs must be ArrayBuffers!");
	}
	
	const bufferA = new Uint8Array(input);
	const bufferB = new Uint8Array(input);
	for( let off = 0; off < bufferA.length; off++ ){
		bufferA[off] = bufferA[off] | (bufferB[off] || 0);
	}
}
function BitwiseXor(a, b){
	a = ReadBuffer(a);
	b = ReadBuffer(b);
	
	if( a === null || b === null ){
		throw new TypeError("Given inputs must be ArrayBuffers!");
	}
	
	const bufferA = new Uint8Array(input);
	const bufferB = new Uint8Array(input);
	for( let off = 0; off < bufferA.length; off++ ){
		bufferA[off] = bufferA[off] ^ (bufferB[off] || 0);
	}
}
function BitwiseIsZero(input){
	const buff = new Uint8Array(ReadBuffer(input));
	let isZero = true;
	for( let i = 0; i < buff.length; i++ ){
		isZero = isZero && (buff[i] === 0);
	}
	return isZero;
}

function __COPY_BYTES(target, source, length, source_start=0, target_start=0) {
	for(let i=0; i<length; i++) {
		target[target_start+i] = source[source_start+i];
	}
}
function ___SET_BINARY_BUFFER(array_buffer){
	if( !(array_buffer instanceof ArrayBuffer) ){
		throw new TypeError("Given input must be an ArrayBuffer!");
	}
	
	this._ab = array_buffer;
	this._ba = new Uint8Array(this._ab);
	return this;
}




// region [ Little Endian Operations ]
function BufferFromHexStrLE(inputStr, size = null){
	if( !HEX_FORMAT_CHECKER.test(inputStr) ){
		throw new SyntaxError("Given hex string is not a valid hex string!");
	}
	
	
	inputStr = inputStr.slice(2);
	if( inputStr.length % 2 === 1 ){ inputStr = '0' + inputStr; }
	let inputLen = Math.floor(inputStr.length / 2);
	
	if( arguments.length <= 1 ){
		size = inputLen;
	}
	else if( size < 0 ){
		throw new RangeError("Given buffer size should greater than or equal to 0!");
	}
	
	
	
	let buffer = new Uint8Array(size);
	for( let pointer = 0; pointer < inputLen; pointer++ ){
		let offset = (inputLen - pointer - 1) * 2;
		buffer[pointer] = HEX_MAP_INVERSE[inputStr[offset + 1]] | (HEX_MAP_INVERSE[inputStr[offset]] << 4);
	}
	return buffer;
}
function BufferFromBinStrLE(inputStr, size = null){
	if( !BIN_FORMAT_CHECKER.test(inputStr) ){
		throw new SyntaxError("Given hex string is not a valid hex string!");
	}
	
	
	inputStr = inputStr.slice(2);
	let inputLen = Math.floor(inputStr.length / 8);
	
	if( arguments.length <= 1 ){
		size = inputLen;
	}
	else if( size < 0 ){
		throw new RangeError("Given buffer size should greater than or equal to 0!");
	}
	
	
	
	let buffer = new Uint8Array(size);
	for( let pointer = 0; pointer < inputLen; pointer++ ){
		let offset = (inputLen - pointer - 1) * 8;
		buffer[pointer] = Number.parseInt(inputStr.substring(offset, offset + 8), 2);
	}
	return buffer;
}
function DumpHexStringLE(input){
	let val = new Uint8Array(ReadBuffer(input));
	
	let str = '';
	for( let i = val.length - 1; i >= 0; i-- ){
		let value = val[i].toString(16);
		str += `${ value.length === 1 ? '0' : '' }${ value }`;
	}
	return str;
}
function DumpBinaryStringLE(input){
	let val = new Uint8Array(ReadBuffer(input));
	
	let str = '';
	for( let i = val.length - 1; i >= 0; i-- ){
		let value = val[i];
		for( let s = 0; s < 8; s++ ){
			str += ((value << s) & 0x80) ? '1' : '0';
		}
	}
	return str;
}
function BitwiseCompareLE(a, b){
	a = ReadBuffer(a);
	b = ReadBuffer(b);
	if( a === null || b === null ){
		throw new TypeError("Given inputs must be ArrayBuffers!");
	}
	
	
	// NOTE: Compare nothing...
	if( a.byteLength === 0 && b.byteLength === 0 ){ return 0; }
	
	
	let A = new Uint8Array(a);
	let B = new Uint8Array(b);
	
	let valA, valB;
	for( let i = Math.max(A.length, B.length); i >= 0; i-- ){
		valA = A[i] || 0;
		valB = B[i] || 0;
		if( valA === valB ){
			continue;
		}
		
		return valA > valB ? 1 : -1;
	}
	
	return 0;
}
function BitwiseRightShiftLE(value, shift, padding = 0){
	if( typeof shift !== "number" ){
		throw new TypeError("Shift bits number must be a number");
	}
	
	value = ReadBuffer(value);
	if( value === null ){
		throw new TypeError("Given value must be an ArrayBuffer!");
	}
	
	
	
	const buffer = new Uint8Array(value);
	if( shift > 0 ){
		padding = padding ? 0xFF : 0x00;
		if( shift >= buffer.byteLength * 8 ){
			buffer.fill(padding);
		}
		else{
			const OFFSET = (shift / 8) | 0;
			const REAL_SHIFT = shift % 8;
			const REAL_SHIFT_I = 8 - REAL_SHIFT;
			const HI_MASK = REAL_SHIFT ? ___GEN_8BITS_MASK(REAL_SHIFT) : 0;
			const LOOP_END = buffer.byteLength - OFFSET;
			
			for( let off = 0; off < LOOP_END; off++ ){
				let shift = off + OFFSET;
				
				if( REAL_SHIFT === 0 ){
					buffer[off] = buffer[shift];
				}
				else{
					let shiftVal = buffer[shift];
					let next = (shift >= buffer.byteLength - 1) ? padding : buffer[shift + 1];
					buffer[off] = (shiftVal >>> REAL_SHIFT) | ((next & HI_MASK) << REAL_SHIFT_I);
				}
			}
			
			for( let off = LOOP_END; off < buffer.byteLength; off++ ){
				buffer[off] = padding;
			}
		}
	}
}
function BitwiseLeftShiftLE(value, shift, padding = 0){
	if( typeof shift !== "number" ){
		throw new TypeError("Shift bits must be a number!");
	}
	
	value = ReadBuffer(value);
	if( value === null ){
		throw new TypeError("Given value must be an ArrayBuffer!");
	}
	
	
	
	const buffer = new Uint8Array(value);
	if( shift > 0 ){
		padding = padding ? 0xFF : 0x00;
		if( shift >= buffer.byteLength * 8 ){
			buffer.fill(padding);
		}
		else{
			const OFFSET = (shift / 8) | 0;
			const REAL_SHIFT = shift % 8;
			const REAL_SHIFT_I = 8 - REAL_SHIFT;
			const LO_MASK = REAL_SHIFT ? (___GEN_8BITS_MASK(REAL_SHIFT) << REAL_SHIFT_I) : 0;
			
			
			for( let off = buffer.byteLength - 1; off >= OFFSET; off-- ){
				let shift = off - OFFSET;
				
				if( REAL_SHIFT === 0 ){
					buffer[off] = buffer[shift];
				}
				else{
					let shiftVal = buffer[shift];
					let next = (shift <= 0) ? padding : buffer[shift - 1];
					buffer[off] = (shiftVal << REAL_SHIFT) | ((next & LO_MASK) >> REAL_SHIFT_I);
				}
			}
			
			buffer.fill(padding, 0, OFFSET);
		}
	}
}
function BitwiseIsNegativeLE(input){
	const buff = new Uint8Array(ReadBuffer(input));
	return ((buff[buff.length - 1] & 0x80) !== 0)
}



// region [ Little Endian exclusive functions ]
function BufferFromIntStrLE(inputStr, size = null){
	if( !INT_FORMAT_CHECKER.test(inputStr) ){
		throw new SyntaxError("Given hex string is not a valid hex string!");
	}
	
	
	let negative = false;
	if( inputStr[0] === "-" ){
		negative = true;
		inputStr = inputStr.substring(1);
	}
	else if( inputStr[0] === "+" ){
		inputStr = inputStr.substring(1);
	}
	
	
	let force_size = true;
	let inputLen = Math.ceil(Math.ceil(inputStr.length * Math.log2(10)) / 8);
	if( arguments.length <= 1 ){
		force_size = false;
		size = inputLen;
	}
	else if( size < 0 ){
		throw new RangeError("Given buffer size should greater than or equal to 0!");
	}
	
	
	
	const inputs = [];
	while( inputStr.length > 0 ){
		let anchor = inputStr.length - 9;
		inputs.push(Number.parseInt(inputStr.substring(anchor), 10));
		inputStr = inputStr.substring(0, anchor);
	}
	inputs.reverse();
	
	
	const buffer = new Uint8Array(size);
	const part = new Uint32Array(1);
	for( let i = 0; i < inputs.length; i++ ){
		part[0] = inputs[i];
		BitwiseMultiplicationLE(buffer, DECIMAL_STEPPER);
		BitwiseAdditionLE(buffer, part);
	}
	
	
	// NOTE: In case that the highest bit is 1 ( the size is not efficient to represent the value )
	let _result = buffer;
	if( !force_size ){
		let real_len = size - 1;
		while( (real_len > 0) && ((buffer[real_len] & 0xFF) === 0) ){ real_len--; }
		if( (buffer[real_len] & 0x80) !== 0 ){
			real_len++;
		}
		_result = (real_len === size) ? buffer : buffer.slice(0, real_len + 1);
	}
	
	
	if( negative ){
		BitwiseTwoComplimentLE(_result);
	}
	
	return _result;
}
function DumpIntStringLE(input, unsigned = false){
	let is_negative = false;
	
	const value = new Uint8Array(ReadBuffer(input).slice(0));
	if( !unsigned && BitwiseIsNegativeLE(value) ){
		BitwiseTwoComplimentLE(value);
		is_negative = true;
	}
	
	
	
	let result = '';
	const remainder = new Uint8Array(value.length);
	const stepper = new Uint8Array(value.length);
	stepper[0] = 100;
	
	BitwiseDivisionLE(value, stepper, true, remainder);
	while( !BitwiseIsZero(value) ){
		let part = remainder[0].toString(10);
		result = ((part.length === 1) ? `0${ part }` : part) + result;
		BitwiseDivisionLE(value, stepper, true, remainder);
	}
	
	return (is_negative ? '-' : '') + remainder[0].toString(10) + result;
}
function BitwiseMultiplicationLE(multiplier, multiplicand){
	const a = new Uint8Array(ReadBuffer(multiplier));
	const b = new Uint8Array(ReadBuffer(multiplicand));
	const res = new Uint8Array(a.length);
	
	let carriage = 0;
	for( let i = 0; i < res.length; i++ ){
		for( let j = 0; j <= i; j++ ){
			carriage += a[j] * (b[i - j] || 0)
		}
		res[i] = carriage;
		carriage = (carriage / 256) | 0;
	}
	
	a.set(res);
}
function BitwiseAdditionLE(addend_a, addend_b){
	let a = new Uint8Array(ReadBuffer(addend_a));
	let b = new Uint8Array(ReadBuffer(addend_b));
	
	let carriage = 0;
	for( let i = 0; i < a.length; i++ ){
		carriage += a[i] + (b[i] || 0);
		a[i] = carriage;
		carriage = (carriage / 256) | 0;
	}
}
function BitwiseSubtractionLE(minuend, subtrahend){
	const a = new Uint8Array(ReadBuffer(minuend));
	const b = new Uint8Array(ReadBuffer(subtrahend));
	const negB = new Uint8Array(b);
	BitwiseTwoComplimentLE(negB);
	BitwiseAdditionLE(a, negB);
}
function BitwiseDivisionLE(dividend, divisor, unsigned = false, remainder_buff = null){
	const raw_a = new Uint8Array(ReadBuffer(dividend));
	const raw_b = new Uint8Array(ReadBuffer(divisor));
	
	const a = raw_a;
	const b = new Uint8Array(a.length);
	b.set(raw_b);
	
	if( BitwiseIsZero(b) ){
		throw new TypeError("Dividing zero is not allowed!");
	}
	
	
	
	let neg_dividend = 0x00, neg_divisor = 0x00;
	if( !unsigned ){
		neg_dividend = BitwiseIsNegativeLE(a) ? 0x01 : 0x00;
		if( neg_dividend ){
			BitwiseTwoComplimentLE(a);
		}
		
		neg_divisor = BitwiseIsNegativeLE(b) ? 0x01 : 0x00;
		if( neg_divisor ){
			BitwiseTwoComplimentLE(b);
		}
	}
	
	
	
	const remainder = new Uint8Array((remainder_buff !== null) ? ReadBuffer(remainder_buff) : a.length);
	remainder.set(a);
	
	const quotient = a;
	quotient.fill(0);
	
	if( BitwiseCompareLE(remainder, b) >= 0 ){
		let _remainder = remainder.slice(0);
		let _divisor = b;
		
		// region [ Align divisor and remainder ]
		let d_padding = 0, r_padding = 0, count = _remainder.length * 8;
		while( count-- > 0 ){
			if( (_remainder[_remainder.length - 1] & 0x80) !== 0 ){
				break;
			}
			
			BitwiseLeftShiftLE(_remainder, 1);
			r_padding++;
		}
		
		_remainder = remainder;
		count = _divisor.length * 8;
		while( count-- > 0 ){
			if( (_divisor[_divisor.length - 1] & 0x80) !== 0 ){
				break;
			}
			BitwiseLeftShiftLE(_divisor, 1);
			d_padding++;
		}
		
		BitwiseRightShiftLE(_divisor, r_padding);
		// endregion
		
		// region [ Calc division ]
		count = d_padding - r_padding + 1;
		while( count-- > 0 ){
			if( BitwiseCompareLE(_remainder, _divisor) >= 0 ){
				BitwiseSubtractionLE(_remainder, _divisor);
				quotient[0] = quotient[0] | 0x01;
			}
			
			if( count > 0 ){
				BitwiseLeftShiftLE(quotient, 1);
				BitwiseRightShiftLE(_divisor, 1);
			}
		}
		// endregion
	}
	
	
	
	
	
	
	if( neg_divisor ^ neg_dividend ){
		BitwiseTwoComplimentLE(quotient);
	}
	
	return remainder;
}
function BitwiseTwoComplimentLE(input){
	input = ReadBuffer(input);
	if( input === null ){
		throw new TypeError("Given input must be an ArrayBuffer!");
	}
	
	const buffer = new Uint8Array(input);
	let carriage = 1;
	for( let off = 0; off < buffer.length; off++ ){
		carriage += ((~buffer[off] >>> 0) & 0xFF);
		buffer[off] = carriage;
		carriage = (carriage / 256) | 0;
	}
}
// endregion
// endregion

// region [ Big Endian Operations ]
function BufferFromHexStrBE(inputStr, size = 0){
	if( !HEX_FORMAT_CHECKER.test(inputStr) ){
		throw new SyntaxError("Given hex string is not a valid hex string!");
	}
	
	
	inputStr = inputStr.slice(2);
	if( inputStr.length % 2 === 1 ){ inputStr = '0' + inputStr; }
	
	if( arguments.length <= 1 ){
		size = Math.floor(inputStr.length / 2);
	}
	else if( size < 0 ){
		throw new RangeError("Given buffer size should greater than or equal to 0!");
	}
	
	
	
	let buffer = new Uint8Array(size);
	for( let pointer = 0; pointer < buffer.length; pointer++ ){
		let offset = pointer * 2;
		buffer[pointer] = HEX_MAP_INVERSE[inputStr[offset + 1]] | (HEX_MAP_INVERSE[inputStr[offset]] << 4);
	}
	return buffer;
}
function BufferFromBinStrBE(inputStr, size = null){
	if( !BIN_FORMAT_CHECKER.test(inputStr) ){
		throw new SyntaxError("Given hex string is not a valid hex string!");
	}
	
	
	inputStr = inputStr.slice(2);
	if( arguments.length <= 1 ){
		size = Math.floor(inputStr.length / 8);
	}
	else if( size < 0 ){
		throw new RangeError("Given buffer size should greater than or equal to 0!");
	}
	
	
	
	let buffer = new Uint8Array(size);
	for( let pointer = 0; pointer < buffer.length; pointer++ ){
		let offset = pointer * 8;
		buffer[pointer] = Number.parseInt(inputStr.substring(offset, offset + 8), 2);
	}
	return buffer;
}
function DumpHexStringBE(input){
	let val = new Uint8Array(ReadBuffer(input));
	
	const length = val.length;
	let str = '';
	for( let i = 0; i < length; i++ ){
		let value = val[i].toString(16);
		str += `${ value.length === 1 ? '0' : '' }${ value }`;
	}
	return str;
}
function DumpBinaryStringBE(input){
	let val = new Uint8Array(ReadBuffer(input));
	
	const length = val.length;
	let str = '';
	for( let i = 0; i < length; i++ ){
		let value = val[i];
		for( let s = 0; s < 8; s++ ){
			str += ((value << s) & 0x80) ? '1' : '0';
		}
	}
	return str;
}
function BitwiseIsNegativeBE(input){
	const buff = new Uint8Array(ReadBuffer(input));
	return ((buff[0] & 0x80) !== 0)
}
function BitwiseCompareBE(a, b){
	a = ReadBuffer(a);
	b = ReadBuffer(b);
	if( a === null || b === null ){
		throw new TypeError("Given inputs must be ArrayBuffers!");
	}
	
	
	// NOTE: Compare nothing...
	if( a.byteLength === 0 && b.byteLength === 0 ){ return 0; }
	
	
	let A = new Uint8Array(a);
	let B = new Uint8Array(b);
	
	let valA, valB, max = Math.max(A.length, B.length);
	for( let i = 0; i < max; i++ ){
		valA = A[i] || 0;
		valB = B[i] || 0;
		if( valA === valB ){
			continue;
		}
		
		return valA > valB ? 1 : -1;
	}
	return 0;
}
function BitwiseRightShiftBE(value, shift, padding = 0){
	if( typeof shift !== "number" ){
		throw new TypeError("Shift bits number must be a number");
	}
	
	value = ReadBuffer(value);
	if( value === null ){
		throw new TypeError("Given value must be an ArrayBuffer!");
	}
	
	
	
	const buffer = new Uint8Array(value);
	if( shift > 0 ){
		padding = padding ? 0xFF : 0x00;
		if( shift >= buffer.byteLength * 8 ){
			for( let off = 0; off < buffer.length; off++ ){
				buffer.fill(padding);
			}
		}
		else{
			const OFFSET = (shift / 8) | 0;
			const REAL_SHIFT = shift % 8;
			const REAL_SHIFT_I = 8 - REAL_SHIFT;
			const HI_MASK = REAL_SHIFT ? ___GEN_8BITS_MASK(REAL_SHIFT) : 0;
			
			for( let off = (buffer.byteLength - 1); off >= OFFSET; off-- ){
				let shift = off - OFFSET;
				
				if( REAL_SHIFT === 0 ){
					buffer[off] = buffer[shift];
				}
				else{
					let shiftVal = buffer[shift];
					let next = (shift === 0) ? padding : buffer[shift - 1];
					buffer[off] = (shiftVal >>> REAL_SHIFT) | ((next & HI_MASK) << REAL_SHIFT_I);
				}
			}
			
			for( let off = OFFSET - 1; off >= 0; off-- ){
				buffer[off] = padding;
			}
		}
	}
}
function BitwiseLeftShiftBE(value, shift, padding = 0){
	if( typeof shift !== "number" ){
		throw new TypeError("Shift bits must be a number!");
	}
	
	value = ReadBuffer(value);
	if( value === null ){
		throw new TypeError("Given value must be an ArrayBuffer!");
	}
	
	
	
	const buffer = new Uint8Array(value);
	if( shift > 0 ){
		padding = padding ? 0xFF : 0x00;
		if( shift >= buffer.byteLength * 8 ){
			for( let off = 0; off < buffer.length; off++ ){
				buffer.fill(padding);
			}
		}
		else{
			const OFFSET = (shift / 8) | 0;
			const LAST_OFFSET = buffer.byteLength - OFFSET;
			const REAL_SHIFT = shift % 8;
			const REAL_SHIFT_I = 8 - REAL_SHIFT;
			const LO_MASK = REAL_SHIFT ? (___GEN_8BITS_MASK(REAL_SHIFT) << REAL_SHIFT_I) : 0;
			
			
			for( let off = 0; off < LAST_OFFSET; off++ ){
				let shift = off + OFFSET;
				
				if( REAL_SHIFT === 0 ){
					buffer[off] = buffer[shift];
				}
				else{
					let shiftVal = buffer[shift];
					let next = shift >= (buffer.byteLength - 1) ? padding : buffer[shift + 1];
					buffer[off] = (shiftVal << REAL_SHIFT) | ((next & LO_MASK) >> REAL_SHIFT_I);
				}
			}
			
			for( let off = LAST_OFFSET; off < buffer.byteLength; off++ ){
				buffer[off] = padding;
			}
		}
	}
}
// endregion






/**
 * Generate a 8-bits mask
 * @param {Number} BITS
 * @private
 **/
function ___GEN_8BITS_MASK(BITS){
	if( BITS > 8 ) return 0xFF;
	if( BITS < 0 ) return 0;
	
	let val = 0;
	while( BITS-- > 0 ){
		val = ((val << 1) | 1) >>> 0;
	}
	return val;
}

const DEFAULT_AB  = new ArrayBuffer(0);
const DEFAULT_BA  = new Uint8Array(DEFAULT_AB);



class BinaryData {
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

class BinaryInt extends BinaryData {
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
		return BitwiseCompareLE(this._ab, val._ab);
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

class Binary extends BinaryData {
	clone() {
		return Binary.FromArrayBuffer(this._ab.slice(0));
	}
	slice(begin, end) {
		const args = Array.prototype.slice.call(arguments, 0);
		return Binary.FromArrayBuffer(this._ab.slice(...args));
	}
	cut(begin, end) {
		const args = Array.prototype.slice.call(arguments, 0);
		return ___SET_BINARY_BUFFER.call(this, this._ab.slice(...args));
	}
	append(...segments) {
		const buffers = [this._ab];
		for ( let seg of segments ) {
			const buff = ReadBuffer(seg);
			if ( buff === null ){
				throw new TypeError("Some of the given segments cannot be converted into ArrayBuffer!");
			}
			
			buffers.push(buff);
		}
		
		return ___SET_BINARY_BUFFER.call(this, MergeArrayBuffers(buffers));
	}
	set(array, offset) {
		const args = Array.prototype.slice.call(arguments, 0);
		this._ba.set(...args);
		return this;
	}
	resize(length) {
		if ( typeof length !== "number" ) {
			throw new TypeError( "Given argument should be a number!" );
		}
		
		if ( length < 0 ) {
			throw new TypeError( "length should be equal to or greater than zero!" );
		}
		
		
		
		
		// NOTE: Do nothing if the length is not changed
		if ( length === this._ab.byteLength ) { return this; }
		
		// NOTE: Shrink data size
		if ( length < this._ab.byteLength ) {
			return ___SET_BINARY_BUFFER.call(this, this._ab.slice(0, length));
		}
		
		// NOTE: Expand data size
		const buff = new Uint8Array(length);
		buff.set(this._ba, 0);
		return ___SET_BINARY_BUFFER.call(this, buff.buffer);
	}
	
	
	
	lshift(bits, padding=0) {
		BitwiseLeftShiftBE(this._ab, bits, padding);
		return this;
	}
	rshift(bits, padding=0) {
		BitwiseRightShiftBE(this._ab, bits, padding);
		return this;
	}
	not() {
		BitwiseNot(this._ab);
		return this;
	}
	compare(value) {
		return BitwiseCompareBE(this._ab, value);
	}
	
	
	
	static create(length) {
		return new Binary(length);
	}
	static from(...args) {
		const inst = new Binary();
		if ( args.length === 0 ) { return inst; }
		
		
		
		let array_buffers;
		if ( args.length === 1 ) {
			if ( typeof args[0] === "string" ) {
				let hexString = args[0];
				if ( hexString.substring(0, 2) !== "0x" ) {
					hexString = "0x" + hexString;
				}
				
				array_buffers = [ HexToBuffer(hexString) ];
			}
			else {
				array_buffers = [ args[0] ];
			}
		}
		else {
			array_buffers = args
		}
		
		return inst.append(array_buffers);
	}
}

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

class UInt32 extends BinarySmallNumber {
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

class UInt8 extends BinarySmallNumber {
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

class UInt64 extends BinaryInt {
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

class Int64 extends BinaryInt {
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

class UInt512 extends BinaryInt {
	constructor(value=0) {
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(64));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	
	
	static from(value=0) {
		return new UInt512(value);
	}
	static get ZERO() {
		return new UInt512();
	}
	static get MAX() {
		return new UInt512([
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF
		]);
	}
}

class Int512 extends BinaryInt  {
	constructor(value=0){
		super();
		___SET_BINARY_BUFFER.call(this, new ArrayBuffer(64));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	get isSignedInt() { return true; }
	
	
	
	static from(value=0) {
		return new Int512(value);
	}
	static get ZERO() {
		return new Int512();
	}
	static get MAX() {
		return new Int512([
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F,
		]);
	}
	static get MIN() {
		return new Int512([
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
		]);
	}
}

const SEQUENCE_END = (new Uint8Array([0x00]).buffer);

function Serialize(data) {
	const chunks = [];
	SerializeData(data, (chunk)=>{
		chunks.push(chunk);
	});
	return MergeArrayBuffers(chunks);
}
function SerializeData(data, data_cb) {
	const type = __serializeType(data, data_cb);
	__serializeTypeData(type, data, data_cb);
}



function __serializeType(data, data_cb) {
	if ( data === null ) {
		data_cb(Uint8Array.from([TYPE_HEADER.NULL]).buffer);
		return DATA_TYPE.NULL;
	}
	
	const data_type = typeof data;
	if ( data_type === 'boolean') {
		data_cb(Uint8Array.from([data ? TYPE_HEADER.TRUE : TYPE_HEADER.FALSE]).buffer);
		return data ? DATA_TYPE.TRUE : DATA_TYPE.FALSE;
	}
	if ( data_type === "number" ) {
		data_cb(Uint8Array.from([TYPE_HEADER.FLOAT64]).buffer);
		return DATA_TYPE.FLOAT64;
	}
	if ( data_type === "string" ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.STRING ]).buffer);
		return DATA_TYPE.STRING;
	}
	
	if (Array.isArray(data)) {
		data_cb(Uint8Array.from([ TYPE_HEADER.ARRAY ]).buffer);
		return DATA_TYPE.ARRAY;
	}
	
	if ( data instanceof Int8 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.INT8 ]).buffer);
		return DATA_TYPE.INT8;
	}
	if ( data instanceof UInt8 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.UINT8 ]).buffer);
		return DATA_TYPE.UINT8;
	}
	if ( data instanceof Int16 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.INT16 ]).buffer);
		return DATA_TYPE.INT16;
	}
	if ( data instanceof UInt16 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.UINT16 ]).buffer);
		return DATA_TYPE.UINT16;
	}
	if ( data instanceof Int32 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.INT32 ]).buffer);
		return DATA_TYPE.INT32;
	}
	if ( data instanceof UInt32 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.UINT32 ]).buffer);
		return DATA_TYPE.UINT32;
	}
	if ( data instanceof Int64 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.INT64 ]).buffer);
		return DATA_TYPE.INT64;
	}
	if ( data instanceof UInt64 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.UINT64 ]).buffer);
		return DATA_TYPE.UINT64;
	}
	if ( data instanceof Int128 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.INT128 ]).buffer);
		return DATA_TYPE.INT128;
	}
	if ( data instanceof UInt128 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.UINT128 ]).buffer);
		return DATA_TYPE.UINT128;
	}
	if ( data instanceof Int256 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.INT256 ]).buffer);
		return DATA_TYPE.INT256;
	}
	if ( data instanceof UInt256 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.UINT256 ]).buffer);
		return DATA_TYPE.UINT256;
	}
	if ( data instanceof Int512 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.INT512 ]).buffer);
		return DATA_TYPE.INT512;
	}
	if ( data instanceof UInt512 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.UINT512 ]).buffer);
		return DATA_TYPE.UINT512;
	}
	if ( data instanceof Float32 ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.FLOAT32 ]).buffer);
		return DATA_TYPE.FLOAT32;
	}
	
	if (data instanceof Date) {
		data_cb(Uint8Array.from([ TYPE_HEADER.DATE ]).buffer);
		return DATA_TYPE.DATE;
	}
	if (data instanceof RegExp) {
		data_cb(Uint8Array.from([ TYPE_HEADER.REGEX ]).buffer);
		return DATA_TYPE.REGEX;
	}
	if (data instanceof Map) {
		data_cb(Uint8Array.from([ TYPE_HEADER.MAP ]).buffer);
		return DATA_TYPE.MAP;
	}
	if (data instanceof Set) {
		data_cb(Uint8Array.from([ TYPE_HEADER.SET ]).buffer);
		return DATA_TYPE.SET;
	}
	
	if ( data instanceof ArrayBuffer) {
		data_cb(Uint8Array.from([ TYPE_HEADER.ARRAY_BUFFER ]).buffer);
		return DATA_TYPE.ARRAY_BUFFER;
	}
	if ( data instanceof DataView) {
		data_cb(Uint8Array.from([ TYPE_HEADER.DATA_VIEW ]).buffer);
		return DATA_TYPE.DATA_VIEW;
	}
	// NOTE: This line must be prior to Uint8Array since NodeJS Buffer is defined to be inheritance of Uint8Array
	if ( HAS_NODE_BUFFER && data instanceof Buffer ) {
		data_cb(Uint8Array.from([ TYPE_HEADER.SPECIAL_BUFFER ]).buffer);
		return DATA_TYPE.SPECIAL_BUFFER;
	}
	if ( data instanceof Uint8Array) {
		data_cb(Uint8Array.from([ TYPE_HEADER.UINT8_ARRAY ]).buffer);
		return DATA_TYPE.UINT8_ARRAY;
	}
	if ( data instanceof Int8Array) {
		data_cb(Uint8Array.from([ TYPE_HEADER.INT8_ARRAY ]).buffer);
		return DATA_TYPE.INT8_ARRAY;
	}
	if ( data instanceof Uint16Array) {
		data_cb(Uint8Array.from([ TYPE_HEADER.UINT16_ARRAY ]).buffer);
		return DATA_TYPE.UINT16_ARRAY;
	}
	if ( data instanceof Int16Array) {
		data_cb(Uint8Array.from([ TYPE_HEADER.INT16_ARRAY ]).buffer);
		return DATA_TYPE.INT16_ARRAY;
	}
	if ( data instanceof Uint32Array) {
		data_cb(Uint8Array.from([ TYPE_HEADER.UINT32_ARRAY ]).buffer);
		return DATA_TYPE.UINT32_ARRAY;
	}
	if ( data instanceof Int32Array) {
		data_cb(Uint8Array.from([ TYPE_HEADER.INT32_ARRAY ]).buffer);
		return DATA_TYPE.INT32_ARRAY;
	}
	if ( data instanceof Float32Array) {
		data_cb(Uint8Array.from([ TYPE_HEADER.FLOAT32_ARRAY ]).buffer);
		return DATA_TYPE.FLOAT32_ARRAY;
	}
	if ( data instanceof Float64Array) {
		data_cb(Uint8Array.from([ TYPE_HEADER.FLOAT64_ARRAY ]).buffer);
		return DATA_TYPE.FLOAT64_ARRAY;
	}
	
	if (data_type === 'object') {
		if ( typeof data.toBytes === "function" ) {
			data_cb(Uint8Array.from([ TYPE_HEADER.UINT8_ARRAY ]).buffer);
			return DATA_TYPE.BINARIZABLE;
		}
	
		data_cb(Uint8Array.from([ TYPE_HEADER.OBJECT ]).buffer);
		return DATA_TYPE.OBJECT;
	}
	
	
	
	const error = new TypeError( "Given data cannot be serialized as beson!" );
	error.detail = data;
	
	throw error;
}
function __serializeTypeData(type, data, data_cb) {
	if (type === DATA_TYPE.NULL || type === DATA_TYPE.FALSE || type === DATA_TYPE.TRUE) {
		// null and boolean has no data payload
		return;
	}
	
	if ( BinaryData.isBinaryData(data) ) {
		data_cb(data._ab);
		return;
	}
	
	if ( type === DATA_TYPE.FLOAT64 ) {
		const buff = new Float64Array([data]);
		data_cb(buff.buffer);
		return;
	}
	
	if ( type === DATA_TYPE.STRING ) {
		const dataBuffer = UTF8Encode(data);
		const lengthData = new Uint32Array([dataBuffer.byteLength]);
		data_cb(lengthData.buffer);
		data_cb(dataBuffer);
		return;
	}
	
	if ( type === DATA_TYPE.DATE ) {
		const dateData = new Float64Array([data.getTime()]);
		data_cb(dateData.buffer);
		return;
	}
	
	if ( type === DATA_TYPE.SPECIAL_BUFFER ) {
		const buff = new Uint8Array(data.length);
		buff.set(data);
		
		const lengthData = new Uint32Array([buff.length]);
		data_cb(lengthData);
		data_cb(buff.buffer);
		return;
	}
	
	if ( type === DATA_TYPE.BINARIZABLE ) {
		const raw_data = data.toBytes();
		if ( !(raw_data instanceof Uint8Array) ) {
			throw new TypeError( "Beson binary interface `toBytes` must return Uint8Array instance!" )
		}
		
		const lengthData = new Uint32Array([raw_data.length]);
		data_cb(lengthData);
		data_cb(raw_data.buffer);
		return;
	}
	
	if ( data instanceof ArrayBuffer ) {
		const lengthData = new Uint32Array([data.byteLength]);
		data_cb(lengthData);
		data_cb(data);
		return;
	}
	
	if ( ArrayBuffer.isView(data) ) {
		const buffer = data.buffer;
		const lengthData = new Uint32Array([buffer.byteLength]);
		data_cb(lengthData);
		data_cb(buffer);
		return;
	}
	
	if ( type === DATA_TYPE.REGEX ) {
		const sourceBuffer = UTF8Encode(data.source);
		if ( sourceBuffer.byteLength > 65535 ) {
			throw new RangeError( "Beson can only accept regex with source string not longer than 65535 bytes!" );
		}
		
		
		const flagBuffer = UTF8Encode(data.flags);
		if ( flagBuffer.byteLength > 255 ) {
			throw new RangeError( "Beson can only accept regex with flag string not longer than 255 bytes!" );
		}
		
		data_cb(Uint16Array.from([sourceBuffer.byteLength]).buffer);
		data_cb(sourceBuffer);
		
		data_cb(Uint8Array.from([flagBuffer.byteLength]).buffer);
		data_cb(flagBuffer);
		return;
	}
	
	if (type === DATA_TYPE.ARRAY || type === DATA_TYPE.SET) {
		return __serializeArrayAndSet(data, data_cb);
	}
	
	if (type === DATA_TYPE.OBJECT) {
		return __serializeObject(data, data_cb);
	}
	
	if (type === DATA_TYPE.MAP) {
		return __serializeMap(data, data_cb);
	}
}

function __serializeArrayAndSet(array, data_cb) {
	for ( let data of array ) {
		if ( data === undefined ) { data = null; }
		const type = __serializeType(data, data_cb);
		__serializeTypeData(type, data, data_cb);
	}
	data_cb(SEQUENCE_END);
}
function __serializeShortString(data, data_cb) {
	const buffer = UTF8Encode(data);
	if ( buffer.byteLength > 65535 ) {
		throw new RangeError("Given key cannot be larger than 65565 bytes!");
	}
	
	const length_data = Uint16Array.from([buffer.byteLength]).buffer;
	data_cb(length_data);
	data_cb(buffer);
}
function __serializeObject(object, data_cb) {
	for ( let key in object ) {
		const data = object[key];
		if ( data === undefined ) continue;
		
		const type = __serializeType(data, data_cb);
		__serializeShortString(`${key}`, data_cb);
		__serializeTypeData(type, data, data_cb);
	}
	data_cb(SEQUENCE_END);
}
function __serializeMap(map, data_cb) {
	for ( let [key, data] of map ) {
		if ( data === undefined ) continue;
		
		if ( Object(key) === key ) {
			console.error( "You're serializing a Map that contains object key!" );
		}
		const key_type = __serializeType(key, data_cb);
		__serializeTypeData(key_type, key, data_cb);
		
		const data_type = __serializeType(data, data_cb);
		__serializeTypeData(data_type, data, data_cb);
	}
	data_cb(SEQUENCE_END);
}

const _PRIVATES = new WeakMap();
class Serializer {
	constructor() {
		const parts = [];
		_PRIVATES.set(this, {
			parts:parts,
			data_cb:(chunk)=>{
				parts.push(chunk);
			}
		});
	}
	write(data) {
		const that = _PRIVATES.get(this);
		SerializeData(data, that.data_cb);
		return this;
	}
	get size() {
		const {parts} = _PRIVATES.get(this);
		let length=0;
		for(const part of parts) {
			length += part.byteLength;
		}
		return length;
	}
	get buffer() {
		return MergeArrayBuffers(_PRIVATES.get(this).parts);
	}
	
	
	
	static init() {
		return new Serializer();
	}
}

function Deserialize(buffer, throw_if_error=false) {
	buffer = new Uint8Array(buffer);

	const result = DeserializeBuffer(buffer, 0);
	if ( result ) {
		return result.value;
	}
	else {
		if ( throw_if_error ) {
			throw new TypeError( "Input data is not encoded in beson format!" );
		}
		
		return undefined;
	}
}

function DeserializeBuffer(buffer, anchor=0) {
	if ( HAS_NODE_BUFFER ) {
		if ( buffer instanceof Buffer ) {
			let buff = Buffer.alloc(buffer.length);
			buffer.copy(buff, 0);
			buffer = buff.buffer;
		}
	}
	
	return __deserializeContent(buffer, anchor);
}



function __deserializeContent(buffer, start) {
	const result = __deserializeType(buffer, start);
	if ( !result ) { return result; }
	
	return __deserializeTypeData(result.value, buffer, result.anchor);
}
function __deserializeType(buffer, start) {
	if ( buffer.length < start+1 ) {
		return false;
	}
	
	const type_val = buffer[start];
	let type = null;
	for ( const type_name in TYPE_HEADER ) {
		const header_val = TYPE_HEADER[type_name];
		if ( type_val !== header_val ) continue;
		
		type = DATA_TYPE[type_name];
	}
	
	if ( !type ) {
		return undefined;
	}
	
	return {anchor:start+1, value:type};
}
function __deserializeTypeData(type, buffer, start) {
	if (type === DATA_TYPE.NULL) {
		return {anchor:start, value:null};
	}
	if (type === DATA_TYPE.TRUE) {
		return {anchor:start, value:true};
	}
	if (type === DATA_TYPE.FALSE) {
		return {anchor:start, value:false};
	}
	if (type === DATA_TYPE.INT8) {
		return __deserializeInt8(buffer, start);
	}
	if (type === DATA_TYPE.INT16) {
		return __deserializeInt16(buffer, start);
	}
	if (type === DATA_TYPE.INT32) {
		return __deserializeInt32(buffer, start);
	}
	if (type === DATA_TYPE.INT64) {
		return __deserializeInt64(buffer, start);
	}
	if (type === DATA_TYPE.INT128) {
		return __deserializeInt128(buffer, start);
	}
	if (type === DATA_TYPE.INT256) {
		return __deserializeInt256(buffer, start);
	}
	if (type === DATA_TYPE.INT512) {
		return __deserializeInt512(buffer, start);
	}
	if (type === DATA_TYPE.UINT8) {
		return __deserializeUInt8(buffer, start);
	}
	if (type === DATA_TYPE.UINT16) {
		return __deserializeUInt16(buffer, start);
	}
	if (type === DATA_TYPE.UINT32) {
		return __deserializeUInt32(buffer, start);
	}
	if (type === DATA_TYPE.UINT64) {
		return __deserializeUInt64(buffer, start);
	}
	if (type === DATA_TYPE.UINT128) {
		return __deserializeUInt128(buffer, start);
	}
	if (type === DATA_TYPE.UINT256) {
		return __deserializeUInt256(buffer, start);
	}
	if (type === DATA_TYPE.UINT512) {
		return __deserializeUInt512(buffer, start);
	}
	if (type === DATA_TYPE.FLOAT32) {
		return __deserializeFloat32(buffer, start);
	}
	if (type === DATA_TYPE.FLOAT64) {
		return __deserializeFloat64(buffer, start);
	}
	if (type === DATA_TYPE.STRING) {
		return __deserializeString(buffer, start);
	}
	if (type === DATA_TYPE.DATE) {
		return __deserializeDate(buffer, start);
	}
	if (type === DATA_TYPE.ARRAY_BUFFER) {
		return __deserializeArrayBuffer(buffer, start);
	}
	if (type === DATA_TYPE.DATA_VIEW) {
		const result = __deserializeArrayBuffer(buffer, start);
		if ( !result ) return result;
		
		result.value = new DataView(result.value);
		return result;
	}
	if (type === DATA_TYPE.UINT8_ARRAY) {
		const result = __deserializeArrayBuffer(buffer, start);
		if ( !result ) return result;
		
		result.value = new Uint8Array(result.value);
		return result;
	}
	if (type === DATA_TYPE.INT8_ARRAY) {
		const result = __deserializeArrayBuffer(buffer, start);
		if ( !result ) return result;
		
		result.value = new Int8Array(result.value);
		return result;
	}
	if (type === DATA_TYPE.UINT16_ARRAY) {
		const result = __deserializeArrayBuffer(buffer, start);
		if ( !result ) return result;
		
		result.value = new Uint16Array(result.value);
		return result;
	}
	if (type === DATA_TYPE.INT16_ARRAY) {
		const result = __deserializeArrayBuffer(buffer, start);
		if ( !result ) return result;
		
		result.value = new Int16Array(result.value);
		return result;
	}
	if (type === DATA_TYPE.UINT32_ARRAY) {
		const result = __deserializeArrayBuffer(buffer, start);
		if ( !result ) return result;
		
		result.value = new Uint32Array(result.value);
		return result;
	}
	if (type === DATA_TYPE.INT32_ARRAY) {
		const result = __deserializeArrayBuffer(buffer, start);
		if ( !result ) return result;
		
		result.value = new Int32Array(result.value);
		return result;
	}
	if (type === DATA_TYPE.FLOAT32_ARRAY) {
		const result = __deserializeArrayBuffer(buffer, start);
		if ( !result ) return result;
		
		result.value = new Float32Array(result.value);
		return result;
	}
	if (type === DATA_TYPE.FLOAT64_ARRAY) {
		const result = __deserializeArrayBuffer(buffer, start);
		if ( !result ) return result;
		
		result.value = new Float64Array(result.value);
		return result;
	}
	if (type === DATA_TYPE.SPECIAL_BUFFER) {
		const result = __deserializeArrayBuffer(buffer, start);
		if ( !result ) return result;
		
		result.value = HAS_NODE_BUFFER ? Buffer.from(result.value) : new Uint8Array(result.value);
		return result;
	}
	if (type === DATA_TYPE.ARRAY) {
		return __deserializeArray(buffer, start);
	}
	if (type === DATA_TYPE.OBJECT) {
		return __deserializeObject(buffer, start);
	}
	if (type === DATA_TYPE.SET) {
		return __deserializeSet(buffer, start);
	}
	if (type === DATA_TYPE.MAP) {
		return __deserializeMap(buffer, start);
	}
	if (type === DATA_TYPE.REGEX) {
		return __deserializeRegExp(buffer, start);
	}
	
	
	
	return undefined;
}

function __deserializeInt8(buffer, start) {
	const len = 1;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = Int8.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeUInt8(buffer, start) {
	const len = 1;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = UInt8.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeInt16(buffer, start) {
	const len = 2;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = Int16.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeUInt16(buffer, start) {
	const len = 2;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = UInt16.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeInt32(buffer, start) {
	const len = 4;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = Int32.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeUInt32(buffer, start) {
	const len = 4;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = UInt32.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeInt64(buffer, start) {
	const len = 8;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = Int64.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeUInt64(buffer, start) {
	const len = 8;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = UInt64.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeInt128(buffer, start) {
	const len = 16;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = Int128.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeUInt128(buffer, start) {
	const len = 16;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = UInt128.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeInt256(buffer, start) {
	const len = 32;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = Int256.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeUInt256(buffer, start) {
	const len = 32;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = UInt256.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeInt512(buffer, start) {
	const len = 64;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = Int512.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeUInt512(buffer, start) {
	const len = 64;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = UInt512.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeFloat32(buffer, start) {
	const len = 4;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = Float32.ZERO;
	__COPY_BYTES(val._ba, buffer, len, start);
	return { anchor:start+len, value:val };
}
function __deserializeFloat64(buffer, start) {
	const len = 8;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = new Float64Array(buffer.slice(start, start+len).buffer);
	return { anchor:start+len, value:val[0] };
}
function __deserializeString(buffer, start) {
	let len = 4;
	if ( buffer.length < start + len ) {
		return false;
	}
	const len_buff = new Uint32Array(buffer.slice(start, start+len).buffer);
	start += len;
	
	
	
	len = len_buff[0];
	if ( buffer.length < start + len ) {
		return false;
	}
	const bytes = new Uint8Array(buffer.slice(start, start+len).buffer);
	start += len;
	
	return {anchor:start, value:UTF8Decode(bytes.buffer)};
}
function __deserializeDate(buffer, start) {
	const len = 8;
	if ( buffer.length < start + len ) {
		return false;
	}

	
	const val = new Float64Array(buffer.slice(start, start+len).buffer);
	return { anchor:start+len, value:new Date(val[0]) };
}
function __deserializeShortString(buffer, start) {
	let len = 2;
	if ( buffer.length < start + len ) {
		return false;
	}
	const len_buff = new Uint16Array(buffer.slice(start, start+len).buffer);
	start += len;
	
	
	
	len = len_buff[0];
	if ( buffer.length < start + len ) {
		return false;
	}
	const bytes = new Uint8Array(buffer.slice(start, start+len).buffer);
	start += len;
	
	return {anchor:start, value:UTF8Decode(bytes.buffer)};
}
function __deserializeArrayBuffer(buffer, start) {
	let len = 4;
	if ( buffer.length < start + len ) {
		return false;
	}
	const len_buff = new Uint32Array(buffer.slice(start, start+len).buffer);
	start += len;
	
	
	
	len = len_buff[0];
	if ( buffer.length < start + len ) {
		return false;
	}
	const value = buffer.slice(start, start+len).buffer;
	start += len;
	
	return {anchor:start, value:value};
}
function __deserializeRegExp(buffer, start) {
	let len = 2;
	if ( buffer.length < start + len ) {
		return false;
	}
	const source_len_buff = new Uint16Array(buffer.slice(start, start+len).buffer);
	start += len;
	
	
	len = source_len_buff[0];
	if ( buffer.length < start + len ) {
		return false;
	}
	const source_buff = buffer.slice(start, start+len).buffer;
	start += len;
	
	
	
	
	
	
	len = 1;
	if ( buffer.length < start + len ) {
		return false;
	}
	const flags_len_buff = buffer[start];
	start += len;
	
	
	len = flags_len_buff;
	if ( buffer.length < start + len ) {
		return false;
	}
	const flag_buff = buffer.slice(start, start+len).buffer;
	start += len;
	
	
	
	return {anchor:start, value:new RegExp(UTF8Decode(source_buff), UTF8Decode(flag_buff))};
}



function __deserializeArray(buffer, start) {
	const array_data = [];
	while(start < buffer.byteLength) {
		let result = __deserializeType(buffer, start);
		if ( !result ) return result;
		
		
		start = result.anchor;
		const type = result.value;
		if ( type === DATA_TYPE.END ) { break; }
		
		result = __deserializeTypeData(type, buffer, start);
		if ( !result ) return result;
		
		start = result.anchor;
		array_data.push(result.value);
	}
	return { anchor:start, value:array_data };
}
function __deserializeSet(buffer, start) {
	const set_data = new Set();
	while(start < buffer.byteLength) {
		let result = __deserializeType(buffer, start);
		if ( !result ) return result;
		start = result.anchor;
		const type = result.value;
		if ( type === DATA_TYPE.END ) { break; }
		
		
		result = __deserializeTypeData(type, buffer, start);
		if ( !result ) return result;
		start = result.anchor;
		set_data.add(result.value);
	}
	return { anchor:start, value:set_data };
}
function __deserializeObject(buffer, start) {
	const object_data = {};
	while(start < buffer.byteLength) {
		let result = __deserializeType(buffer, start);
		if ( !result ) return result;
		
		
		
		start = result.anchor;
		const type = result.value;
		if ( type === DATA_TYPE.END ) { break; }
		
		
		
		result = __deserializeShortString(buffer, start);
		if ( !result ) return result;
		
		
		
		start = result.anchor;
		const key = result.value;
		result = __deserializeTypeData(type, buffer, start);
		if ( !result ) return result;
		
		
		
		start = result.anchor;
		object_data[key] = result.value;
	}
	return { anchor:start, value:object_data };
}
function __deserializeMap(buffer, start) {
	const map_data = new Map();
	while(start < buffer.byteLength) {
		let result = __deserializeType(buffer, start);
		if ( !result ) return result;
		start = result.anchor;
		const key_type = result.value;
		if ( key_type === DATA_TYPE.END ) { break; }
		
		
		result = __deserializeTypeData(key_type, buffer, start);
		if ( !result ) return result;
		start = result.anchor;
		const key = result.value;
		
		
		
		result = __deserializeType(buffer, start);
		if ( !result ) return result;
		start = result.anchor;
		const data_type = result.value;
		if ( data_type === DATA_TYPE.END ) { break; }
		
		
		result = __deserializeTypeData(data_type, buffer, start);
		if ( !result ) return result;
		start = result.anchor;
		map_data.set(key, result.value);
	}
	return { anchor:start, value:map_data };
}

const EMPTY_BUFFER = new Uint8Array(new ArrayBuffer(0));
class Deserializer {
	constructor() {
		_PRIVATES.set(this, { buffer:EMPTY_BUFFER });
		
		this.throw_if_error = false;
	}
	read() {
		const that = _PRIVATES.get(this);
		const result = DeserializeBuffer(that.buffer);
		
		if ( result === undefined ) {
			if ( this.throw_if_error ) {
				throw new TypeError( "Data stored in Deserializer is not encoded in valid beson format" );
			}
			
			return undefined;
		}
		else
		if ( result === false ) {
			return undefined;
		}
		else {
			const {anchor, value} = result;
			that.buffer = that.buffer.slice(anchor);
			return value;
		}
	}
	append(input_buffer) {
		if ( ArrayBuffer.isView(input_buffer) ) {
			input_buffer = input_buffer.buffer;
		}
		
		if ( !(input_buffer instanceof ArrayBuffer) ) {
			throw new TypeError( "Given buffer is not an ArrayBuffer!" );
		}
	
		const that = _PRIVATES.get(this);
		that.buffer = new Uint8Array(MergeArrayBuffers(that.buffer.buffer, input_buffer));
		
		
		
		return this;
	}
	get size() {
		return _PRIVATES.get(this).buffer.length;
	}
	get buffer() {
		return _PRIVATES.get(this).buffer.slice(0).buffer;
	}
	
	
	
	static init(input_buffer=null) {
		const deserializer = new Deserializer();
		if ( input_buffer === null ) {
			input_buffer = EMPTY_BUFFER
		}
		
		deserializer.append(input_buffer);
		
		return deserializer;
	}
}

window.beson = {
    Int8,  Int16,  Int32,  Int64,  Int128,  Int256,  Int512,  IntVar,
	UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, UInt512, UIntVar,
    Float32,    
    Deserialize, DeserializeBuffer,Deserializer,
    Serialize, Serializer,
    UTF8Encode, UTF8Decode, BitwiseCompareLE
};

})(window);