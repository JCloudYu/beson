/**
 * Author: JCloudYu
 * Create: 2018/10/30
 **/

//@export=helper
const __HAS_NODE_BUFFER = (typeof Buffer !== "undefined");
const __DATA_TYPE = Object.freeze({
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
const __TYPE_HEADER = Object.freeze({
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










function __ReadBuffer(input){
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
function __MergeArrayBuffers(...array_buffers) {
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
function __HexToBuffer(inputStr, length = null){
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

function __UTF8Encode(str){
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
function __UTF8Decode(buffer){
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

function __BitwiseNot(input){
	input = ReadBuffer(input);
	if( input === null ){
		throw new TypeError("Given input must be an ArrayBuffer!");
	}
	
	const buffer = new Uint8Array(input);
	for( let off = 0; off < buffer.length; off++ ){
		buffer[off] = ~buffer[off];
	}
}
function __BitwiseAnd(a, b){
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
function __BitwiseOr(a, b){
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
function __BitwiseXor(a, b){
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
function __BitwiseIsZero(input){
	const buff = new Uint8Array(ReadBuffer(input));
	let isZero = true;
	for( let i = 0; i < buff.length; i++ ){
		isZero = isZero && (buff[i] === 0);
	}
	return isZero;
}

function ____COPY_BYTES(target, source, length, source_start=0, target_start=0) {
	for(let i=0; i<length; i++) {
		target[target_start+i] = source[source_start+i];
	}
}
function _____SET_BINARY_BUFFER(array_buffer){
	if( !(array_buffer instanceof ArrayBuffer) ){
		throw new TypeError("Given input must be an ArrayBuffer!");
	}
	
	this._ab = array_buffer;
	this._ba = new Uint8Array(this._ab);
	return this;
}




// region [ Little Endian Operations ]
function __BufferFromHexStrLE(inputStr, size = null){
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
function __BufferFromBinStrLE(inputStr, size = null){
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
function __DumpHexStringLE(input){
	let val = new Uint8Array(ReadBuffer(input));
	
	let str = '';
	for( let i = val.length - 1; i >= 0; i-- ){
		let value = val[i].toString(16);
		str += `${ value.length === 1 ? '0' : '' }${ value }`;
	}
	return str;
}
function __DumpBinaryStringLE(input){
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
function __BitwiseCompareLE(a, b){
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
function __BitwiseRightShiftLE(value, shift, padding = 0){
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
function __BitwiseLeftShiftLE(value, shift, padding = 0){
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
function __BitwiseIsNegativeLE(input){
	const buff = new Uint8Array(ReadBuffer(input));
	return ((buff[buff.length - 1] & 0x80) !== 0)
}



// region [ Little Endian exclusive functions ]
function __BufferFromIntStrLE(inputStr, size = null){
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
function __DumpIntStringLE(input, unsigned = false){
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
function __BitwiseMultiplicationLE(multiplier, multiplicand){
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
function __BitwiseAdditionLE(addend_a, addend_b){
	let a = new Uint8Array(ReadBuffer(addend_a));
	let b = new Uint8Array(ReadBuffer(addend_b));
	
	let carriage = 0;
	for( let i = 0; i < a.length; i++ ){
		carriage += a[i] + (b[i] || 0);
		a[i] = carriage;
		carriage = (carriage / 256) | 0;
	}
}
function __BitwiseSubtractionLE(minuend, subtrahend){
	const a = new Uint8Array(ReadBuffer(minuend));
	const b = new Uint8Array(ReadBuffer(subtrahend));
	const negB = new Uint8Array(b);
	BitwiseTwoComplimentLE(negB);
	BitwiseAdditionLE(a, negB);
}
function __BitwiseDivisionLE(dividend, divisor, unsigned = false, remainder_buff = null){
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
function __BitwiseTwoComplimentLE(input){
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
function __BufferFromHexStrBE(inputStr, size = 0){
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
function __BufferFromBinStrBE(inputStr, size = null){
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
function __DumpHexStringBE(input){
	let val = new Uint8Array(ReadBuffer(input));
	
	const length = val.length;
	let str = '';
	for( let i = 0; i < length; i++ ){
		let value = val[i].toString(16);
		str += `${ value.length === 1 ? '0' : '' }${ value }`;
	}
	return str;
}
function __DumpBinaryStringBE(input){
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
function __BitwiseIsNegativeBE(input){
	const buff = new Uint8Array(ReadBuffer(input));
	return ((buff[0] & 0x80) !== 0)
}
function __BitwiseCompareBE(a, b){
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
function __BitwiseRightShiftBE(value, shift, padding = 0){
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
function __BitwiseLeftShiftBE(value, shift, padding = 0){
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
//@endexport

export const HAS_NODE_BUFFER ＝ __HAS_NODE_BUFFER;
export const DATA_TYPE = __DATA_TYPE;
export const TYPE_HEADER = __TYPE_HEADER;
export const ReadBuffer = __ReadBuffer;
export const MergeArrayBuffers = __MergeArrayBuffers;
export const HexToBuffer = __HexToBuffer;
export const UTF8Encode = __UTF8Encode;
export const UTF8Decode = __UTF8Decode
export const BitwiseNot = __BitwiseNot;
export const BitwiseAnd = __BitwiseAnd;
export const BitwiseOr = __BitwiseOr;
export const BitwiseXor = __BitwiseXor;
export const BitwiseIsZero = __BitwiseIsZero;
export const __COPY_BYTES = ____COPY_BYTES;
export const ___SET_BINARY_BUFFER = _____SET_BINARY_BUFFER;
export const BufferFromHexStrLE = __BufferFromHexStrLE;
export const BufferFromBinStrLE = __BufferFromBinStrLE;
export const DumpHexStringLE = __DumpHexStringLE;
export const DumpBinaryStringLE = __DumpBinaryStringLE;
export const BitwiseCompareLE = __BitwiseCompareLE;
export const BitwiseRightShiftLE = __BitwiseRightShiftLE;
export const BitwiseLeftShiftLE = __BitwiseLeftShiftLE;
export const BitwiseIsNegativeLE = __BitwiseIsNegativeLE;
export const BufferFromIntStrLE = __BufferFromIntStrLE;
export const DumpIntStringLE = __DumpIntStringLE;
export const BitwiseMultiplicationLE = __BitwiseMultiplicationLE;
export const BitwiseAdditionLE = __BitwiseAdditionLE;
export const BitwiseSubtractionLE = __BitwiseSubtractionLE;
export const BitwiseDivisionLE = __BitwiseDivisionLE;
export const BitwiseTwoComplimentLE = __BitwiseTwoComplimentLE;
export const BufferFromHexStrBE = __BufferFromHexStrBE;
export const BufferFromBinStrBE = __BufferFromBinStrBE;
export const DumpHexStringBE = __DumpHexStringBE;
export const DumpBinaryStringBE = __DumpBinaryStringBE;
export const BitwiseIsNegativeBE = __BitwiseIsNegativeBE;
export const BitwiseCompareBE = __BitwiseCompareBE;
export const BitwiseRightShiftBE = __BitwiseRightShiftBE;
export const BitwiseLeftShiftBE = __BitwiseLeftShiftBE;
