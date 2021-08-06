import {HAS_NODE_BUFFER, DATA_TYPE, TYPE_HEADER, UTF8Decode, __COPY_BYTES} from "src/helper.esm.js";
import {
	Int8, Int16, Int32, Int64, Int128,
	UInt8, UInt16, UInt32, UInt64, UInt128,
	Int256, Int512, UInt256, UInt512, Float32
} from "src/beson-types.esm.js";

//@export=deserialize
function Deserialize(buffer, throw_if_error=false) {
	let buff;
	if ( buffer instanceof ArrayBuffer ) {
		buff = new Uint8Array(buffer);
	}
	else 
	if ( buffer instanceof Uint8Array ) {
		buff = buffer;
	}
	else {
		throw new TypeError("Given input must be an ArrayBuffer or an Uint8Array");
	}

	

	const result = DeserializeBuffer(buff, 0);
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
//@endexport

export {Deserialize};
export {DeserializeBuffer};
