import {HAS_NODE_BUFFER, DATA_TYPE, TYPE_HEADER, UTF8Encode, MergeArrayBuffers} from "./helper.esm.js";
import {
	Int8, Int16, Int32, Int64, Int128,
	UInt8, UInt16, UInt32, UInt64, UInt128,
	UInt256, UInt512, Int256, Int512, Float32, BinaryData
} from "./beson-types.esm.js";


//@export=serialize
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
//@endexport


export {Serialize};
export {SerializeData};
