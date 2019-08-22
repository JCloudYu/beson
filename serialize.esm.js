import {HAS_NODE_BUFFER, DATA_TYPE, TYPE_HEADER, UTF8Encode} from "./helper.esm.js";
import {
	Int8, Int16, Int32, Int64, Int128,
	UInt8, UInt16, UInt32, UInt64, UInt128,
	Binary, UInt256, UInt512, Int256, Int512,
	UIntVar, IntVar, Float32
} from "./beson-types.esm.js";



export function Serialize(data) {
	let contentBuffers = __serializeContent(data);
	return __arrayBufferConcat(contentBuffers);
}

function __serializeContent(data) {
	let type = __getType(data);
	let typeBuffer	= __serializeType(type);
	let dataBuffers = __serializeData(type, data);
	return [typeBuffer, ...dataBuffers];
}
function __getType(data) {
	let type = typeof data;
	if (data === null) {
		type = DATA_TYPE.NULL;
	}
	else if (type === 'boolean') {
		type = (data) ? DATA_TYPE.TRUE : DATA_TYPE.FALSE;
	}
	else if ( type === "number" ) {
		type = DATA_TYPE.FLOAT64;
	}
	else if ( data instanceof Int8 ) {
		type = DATA_TYPE.INT8;
	}
	else if ( data instanceof UInt8 ) {
		type = DATA_TYPE.UINT8;
	}
	else if ( data instanceof Int16 ) {
		type = DATA_TYPE.INT16;
	}
	else if ( data instanceof UInt16 ) {
		type = DATA_TYPE.UINT16;
	}
	else if ( data instanceof Int32 ) {
		type = DATA_TYPE.INT32;
	}
	else if ( data instanceof UInt32 ) {
		type = DATA_TYPE.UINT32;
	}
	else if ( data instanceof Int64 ) {
		type = DATA_TYPE.INT64;
	}
	else if ( data instanceof UInt64 ) {
		type = DATA_TYPE.UINT64;
	}
	else if ( data instanceof Int256 ) {
		type = DATA_TYPE.INT256;
	}
	else if ( data instanceof UInt256 ) {
		type = DATA_TYPE.UINT256;
	}
	else if ( data instanceof Int512 ) {
		type = DATA_TYPE.INT512;
	}
	else if ( data instanceof UInt512 ) {
		type = DATA_TYPE.UINT512;
	}
	else if ( data instanceof Int128 ) {
		type = DATA_TYPE.INT128;
	}
	else if ( data instanceof UInt128 ) {
		type = DATA_TYPE.UINT128;
	}
	else if ( data instanceof IntVar ) {
		type = DATA_TYPE.INTVAR;
	}
	else if ( data instanceof UIntVar ) {
		type = DATA_TYPE.UINTVAR;
	}
	else if ( data instanceof Float32 ) {
		type = DATA_TYPE.FLOAT32;
	}
	else if (type === 'string') {
		type = DATA_TYPE.STRING;
	}
	else if (Array.isArray(data)) {
		type = DATA_TYPE.ARRAY;
	}
	else if (data instanceof Date) {
		type = DATA_TYPE.DATE;
	}
	else if (data instanceof Binary) {
		type = DATA_TYPE.BINARY;
	}
	else if ( data instanceof ArrayBuffer) {
		type = DATA_TYPE.ARRAY_BUFFER;
	}
	else if ( data instanceof DataView) {
		type = DATA_TYPE.DATA_VIEW;
	}
	// NOTE: This line must be prior to Uint8Array since NodeJS Buffer is defined to be inheritance of Uint8Array
	else if ( HAS_NODE_BUFFER && data instanceof Buffer ) {
		type = DATA_TYPE.SPECIAL_BUFFER;
	}
	else if ( data instanceof Uint8Array) {
		type = DATA_TYPE.UINT8_ARRAY;
	}
	else if ( data instanceof Int8Array) {
		type = DATA_TYPE.INT8_ARRAY;
	}
	else if ( data instanceof Uint16Array) {
		type = DATA_TYPE.UINT16_ARRAY;
	}
	else if ( data instanceof Int16Array) {
		type = DATA_TYPE.INT16_ARRAY;
	}
	else if ( data instanceof Uint32Array) {
		type = DATA_TYPE.UINT32_ARRAY;
	}
	else if ( data instanceof Int32Array) {
		type = DATA_TYPE.INT32_ARRAY;
	}
	else if ( data instanceof Float32Array) {
		type = DATA_TYPE.FLOAT32_ARRAY;
	}
	else if ( data instanceof Float64Array) {
		type = DATA_TYPE.FLOAT64_ARRAY;
	}
	else if (type === 'object') {
		type = DATA_TYPE.OBJECT;
	}
	return type;
}
function __serializeType(type) {
	let typeHeader = (type) ? TYPE_HEADER[type.toUpperCase()] : [];
	let typeData = new Uint8Array(typeHeader);
	return typeData.buffer;
}
function __serializeData(type, data) {
	let buffers = [];
	if (type === DATA_TYPE.NULL) {
		buffers = __serializeNull();
	}
	else if (type === DATA_TYPE.FALSE || type === DATA_TYPE.TRUE) {
		buffers = __serializeBoolean();
	}
	else if (type === DATA_TYPE.UINT8) {
		buffers = [data._ab];
	}
	else if (type === DATA_TYPE.UINT16) {
		buffers = [data._ab];
	}
	else if (type === DATA_TYPE.UINT32) {
		buffers = [data._ab];
	}
	else if (type === DATA_TYPE.INT8) {
		buffers = [data._ab];
	}
	else if (type === DATA_TYPE.INT16) {
		buffers = [data._ab];
	}
	else if (type === DATA_TYPE.INT32) {
		buffers = [data._ab];
	}
	else if (type === DATA_TYPE.INT64) {
		buffers = __serializeInt64(data);
	}
	else if (type === DATA_TYPE.INT128) {
		buffers = __serializeInt128(data);
	}
	else if (type === DATA_TYPE.INT256) {
		buffers = __serializeInt256(data);
	}
	else if (type === DATA_TYPE.INT512) {
		buffers = __serializeInt512(data);
	}
	else if (type === DATA_TYPE.INTVAR) {
		buffers = __serializeIntVar(data);
	}
	else if (type === DATA_TYPE.UINT64) {
		buffers = __serializeUInt64(data);
	}
	else if (type === DATA_TYPE.UINT128) {
		buffers = __serializeUInt128(data);
	}
	else if (type === DATA_TYPE.UINT256) {
		buffers = __serializeUInt256(data);
	}
	else if (type === DATA_TYPE.UINT512) {
		buffers = __serializeUInt512(data);
	}
	else if (type === DATA_TYPE.UINTVAR) {
		buffers = __serializeUIntVar(data);
	}
	else if (type === DATA_TYPE.FLOAT32) {
		buffers = __serializeFloat32(data);
	}
	else if (type === DATA_TYPE.FLOAT64) {
		buffers = __serializeFloat64(data);
	}
	else if (type === DATA_TYPE.STRING) {
		buffers = __serializeString(data);
	}
	else if (type === DATA_TYPE.ARRAY) {
		buffers = __serializeArray(data);
	}
	else if (type === DATA_TYPE.ARRAY_START) {
		buffers = __serializeArrayStreaming(data);
	}
	else if (type === DATA_TYPE.OBJECT) {
		buffers = __serializeObject(data);
	}
	else if (type === DATA_TYPE.OBJECT_START) {
		buffers = __serializeObjectStreaming(data);
	}
	else if (type === DATA_TYPE.DATE) {
		buffers = __serializeDate(data);
	}
	else if (type === DATA_TYPE.OBJECTID) {
		buffers = __serializeObjectId(data);
	}
	else if (type === DATA_TYPE.BINARY) {
		buffers = __serializeArrayBuffer(data.toBytes());
	}
	else if (type === DATA_TYPE.ARRAY_BUFFER) {
		buffers = __serializeArrayBuffer(data);
	}
	else if (type === DATA_TYPE.DATA_VIEW) {
		buffers = __serializeArrayBuffer(data.buffer);
	}
	else if (type === DATA_TYPE.UINT8_ARRAY) {
		buffers = __serializeArrayBuffer(data.buffer);
	}
	else if (type === DATA_TYPE.INT8_ARRAY) {
		buffers = __serializeArrayBuffer(data.buffer);
	}
	else if (type === DATA_TYPE.UINT16_ARRAY) {
		buffers = __serializeArrayBuffer(data.buffer);
	}
	else if (type === DATA_TYPE.INT16_ARRAY) {
		buffers = __serializeArrayBuffer(data.buffer);
	}
	else if (type === DATA_TYPE.UINT32_ARRAY) {
		buffers = __serializeArrayBuffer(data.buffer);
	}
	else if (type === DATA_TYPE.INT32_ARRAY) {
		buffers = __serializeArrayBuffer(data.buffer);
	}
	else if (type === DATA_TYPE.FLOAT32_ARRAY) {
		buffers = __serializeArrayBuffer(data.buffer);
	}
	else if (type === DATA_TYPE.FLOAT64_ARRAY) {
		buffers = __serializeArrayBuffer(data.buffer);
	}
	else if (HAS_NODE_BUFFER && type === DATA_TYPE.SPECIAL_BUFFER) {
		let buff = Buffer.alloc(data.length);
		data.copy(buff, 0);
		buffers = __serializeArrayBuffer(buff.buffer);
	}
	
	return buffers;
}
function __serializeNull() {
	return [];
}
function __serializeBoolean() {
	return [];
}
function __serializeInt64(data) {
	return [data.toBytes().buffer];
}
function __serializeInt128(data) {
	return [data.toBytes().buffer];
}
function __serializeInt256(data) {
	return [data.toBytes().buffer];
}
function __serializeInt512(data) {
	return [data.toBytes().buffer];
}
function __serializeIntVar(data) {
	if ( data.size > 127 ) {
		throw new Error( "Cannot support IntVar whose size is greater than 127 bytes" );
	}

	const size = new Uint8Array([data.size]);
	return [size.buffer, data.toBytes().buffer];
}
function __serializeUInt64(data) {
	return [data.toBytes().buffer];
}
function __serializeUInt128(data) {
	return [data.toBytes().buffer];
}
function __serializeUInt256(data) {
	return [data.toBytes().buffer];
}
function __serializeUInt512(data) {
	return [data.toBytes().buffer];
}
function __serializeUIntVar(data) {
	if ( data.size > 127 ) {
		throw new Error( "Cannot support UIntVar whose size is greater than 127 bytes" );
	}

	const size = new Uint8Array([data.size]);
	return [size.buffer, data.toBytes().buffer];
}
function __serializeFloat32(data) {
	let contentData = new Float32Array([data]);
	return [contentData.buffer];
}
function __serializeFloat64(data) {
	let contentData = new Float64Array([data]);
	return [contentData.buffer];
}
function __serializeString(data) {
	let dataBuffer = UTF8Encode(data);
	let length = dataBuffer.byteLength;
	let lengthData = new Uint32Array([length]);
	return [lengthData.buffer, dataBuffer];
}
function __serializeShortString(data) {
	let dataBuffer = UTF8Encode(data);
	let length = dataBuffer.byteLength;
	let lengthData = new Uint16Array([length]);
	return [lengthData.buffer, dataBuffer];
}
function __serializeArray(data) {
	let dataBuffers = [];
	// ignore undefined value
	for (let key in data) {
		let subData = data[key];
		let subType = __getType(subData);
		let subTypeBuffer = __serializeType(subType);
		let subDataBuffers = __serializeData(subType, subData);
		dataBuffers.push(subTypeBuffer, ...subDataBuffers);
	}
	let length = __getLengthByArrayBuffers(dataBuffers);
	let lengthData = new Uint32Array([length]);
	return [lengthData.buffer, ...dataBuffers];
}
function __serializeArrayStreaming(data) {
	let dataBuffers = [];
	// ignore undefined value
	for (let key in data) {
		let subData = data[key];
		let subType = __getType(subData);
		let subTypeBuffer = __serializeType(subType);
		let subDataBuffers = __serializeData(subType, subData);
		dataBuffers.push(subTypeBuffer, ...subDataBuffers);
	}
	return [...dataBuffers, TYPE_HEADER.ARRAY_END];
}
function __serializeObject(data) {
	let dataBuffers = [];
	for (let key of Object.keys(data)) {
		let subData = data[key];
		
		// ignore undefined value
		if (subData === undefined) continue;

		let subType = __getType(subData);
		let subTypeBuffer = __serializeType(subType);
		let keyBuffers = __serializeShortString(key);
		let subDataBuffers = __serializeData(subType, subData);
		dataBuffers.push(subTypeBuffer, ...keyBuffers, ...subDataBuffers);
	}
	let length = __getLengthByArrayBuffers(dataBuffers);
	let lengthData = new Uint32Array([length]);
	return [lengthData.buffer, ...dataBuffers];
}
function __serializeObjectStreaming(data) {
	let dataBuffers = [];
	
	for (let key of Object.keys(data)) {
		let subData = data[key];
		
		// ignore undefined value
		if (subData === undefined) continue;

		let subType = __getType(subData);
		let subTypeBuffer = __serializeType(subType);
		let keyBuffers = __serializeShortString(key);
		let subDataBuffers = __serializeData(subType, subData);
		dataBuffers.push(subTypeBuffer, ...keyBuffers, ...subDataBuffers);
	}
	return [...dataBuffers, TYPE_HEADER.OBJECT_END];
}
function __serializeDate(data) {
	let contentData = new Float64Array([data.getTime()]);
	return [contentData.buffer];
}
function __serializeObjectId(data) {
	return [data._ab];
}
function __serializeArrayBuffer(data) {
	let length = data.byteLength;
	let lengthData = new Uint32Array([length]);
	return [lengthData.buffer, data];
}
function __getLengthByArrayBuffers(data) {
	let length = 0;
	for (let key in data) {
		length += data[key].byteLength;
	}
	return length;
}
function __arrayBufferConcat(buffers) {
	let totalLength = 0;
	for (const buffer of buffers) {
		totalLength += buffer.byteLength;
	}
	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const buffer of buffers) {
		result.set(new Uint8Array(buffer), offset);
		offset += buffer.byteLength;
	}
	return result.buffer;
}
