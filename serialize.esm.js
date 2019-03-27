import {HAS_NODE_BUFFER, DATA_TYPE, TYPE_HEADER} from "./constants.esm.js";
import {UTF8Encode} from "./helper.esm.js";
import {
	Int8, Int16, Int32, Int64, Int128,
	UInt8, UInt16, UInt32, UInt64, UInt128,
	Binary, ObjectId, UInt256, UInt512, Int256, Int512
} from "./types.esm.js";



/**
 * @class BESONSerializerOption
 * @property {Boolean} [BESONSerializerOption.sort_key=false]
 * @property {Boolean} [BESONSerializerOption.streaming_array=false]
 * @property {Boolean} [BESONSerializerOption.streaming_object=false]
**/

/** @type {BESONSerializerOption} */
const DEFAULT_OPTIONS = {
	sort_key: false,
	streaming_array: false,
	streaming_object: false
};

/**
 * Serialize any type data
 * - result = headerBuffer + contentBuffer
 * - contentBuffer = typeBuffer + dataBuffer
 * @param {*} data
 * @param {BESONSerializerOption} options
 * @returns {ArrayBuffer}
 */
export function serialize(data, options=DEFAULT_OPTIONS) {
	let contentBuffers = __serializeContent(data, options);
	return __arrayBufferConcat(contentBuffers);
}

/**
 * Serialize content
 * @param {*} data
 * @param {BESONSerializerOption} options
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeContent(data, options=DEFAULT_OPTIONS) {
	let type = __getType(data, options);
	let typeBuffer	= __serializeType(type, options);
	let dataBuffers = __serializeData(type, data, options);
	return [typeBuffer, ...dataBuffers];
}

/**
 * Get type by data
 * @param {*} data
 * @param {Object} options
 * @param {BESONSerializerOption} options
 * @returns {string}
 * @private
 */
function __getType(data, options) {
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
	else if (data instanceof Int64) {
		type = DATA_TYPE.INT64;
	}
	else if (data instanceof Int128) {
		type = DATA_TYPE.INT128;
	}
	else if (data instanceof UInt64) {
		type = DATA_TYPE.UINT64;
	}
	else if (data instanceof UInt128) {
		type = DATA_TYPE.UINT128;
	}
	else if (type === 'string') {
		type = DATA_TYPE.STRING;
	}
	else if (Array.isArray(data)) {
		type = (options.streaming_array === true) ? DATA_TYPE.ARRAY_START : DATA_TYPE.ARRAY;
	}
	else if (data instanceof Date) {
		type = DATA_TYPE.DATE;
	}
	else if (data instanceof ObjectId) {
		type = DATA_TYPE.OBJECTID;
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
		type = (options.streaming_object === true) ? DATA_TYPE.OBJECT_START : DATA_TYPE.OBJECT;
	}
	return type;
}

/**
 * Serialize type
 * @param {string} type
 * @param {BESONSerializerOption} options
 * @returns {ArrayBuffer}
 * @private
 */
function __serializeType(type, options) {
	let typeHeader = (type) ? TYPE_HEADER[type.toUpperCase()] : [];
	let typeData = new Uint8Array(typeHeader);
	return typeData.buffer;
}

/**
 * Serialize data
 * @param {string} type
 * @param {*} data
 * @param {BESONSerializerOption} options
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeData(type, data, options=DEFAULT_OPTIONS) {
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
	else if (type === DATA_TYPE.FLOAT64) {
		buffers = __serializeDouble(data);
	}
	else if (type === DATA_TYPE.STRING) {
		buffers = __serializeString(data);
	}
	else if (type === DATA_TYPE.ARRAY) {
		buffers = __serializeArray(data, options);
	}
	else if (type === DATA_TYPE.ARRAY_START) {
		buffers = __serializeArrayStreaming(data, options);
	}
	else if (type === DATA_TYPE.OBJECT) {
		buffers = __serializeObject(data, options);
	}
	else if (type === DATA_TYPE.OBJECT_START) {
		buffers = __serializeObjectStreaming(data, options);
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

/**
 * Serialize null data
 * @returns {[]}
 * @private
 */
function __serializeNull() {
	return [];
}

/**
 * Serialize boolean data
 * @returns {[]}
 * @private
 */
function __serializeBoolean() {
	return [];
}

/**
 * Serialize Int64 data
 * @param {Int64} data
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeInt64(data) {
	return [data.toBytes().buffer];
}

/**
 * Serialize Int128 data
 * @param {Int128} data
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeInt128(data) {
	return [data.toBytes().buffer];
}

/**
 * Serialize Int256 data
 * @param {Int256} data
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeInt256(data) {
	return [data.toBytes().buffer];
}

/**
 * Serialize Int512 data
 * @param {Int512} data
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeInt512(data) {
	return [data.toBytes().buffer];
}

/**
 * Serialize UInt64 data
 * @param {UInt64} data
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeUInt64(data) {
	return [data.toBytes().buffer];
}

/**
 * Serialize UInt128 data
 * @param {UInt128} data
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeUInt128(data) {
	return [data.toBytes().buffer];
}

/**
 * Serialize UInt256 data
 * @param {UInt256} data
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeUInt256(data) {
	return [data.toBytes().buffer];
}

/**
 * Serialize UInt512 data
 * @param {UInt512} data
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeUInt512(data) {
	return [data.toBytes().buffer];
}

/**
 * Serialize double data
 * @param {number} data - double number
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeDouble(data) {
	let contentData = new Float64Array([data]);
	return [contentData.buffer];
}

/**
 * Serialize string data (use UTF8 encode)
 * @param {string} data - 32-bits length string
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeString(data) {
	let dataBuffer = UTF8Encode(data);
	let length = dataBuffer.byteLength;
	let lengthData = new Uint32Array([length]);
	return [lengthData.buffer, dataBuffer];
}

/**
 * Serialize short string data (use UTF8 encode)
 * @param {string} data - 16-bits length string
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeShortString(data) {
	let dataBuffer = UTF8Encode(data);
	let length = dataBuffer.byteLength;
	let lengthData = new Uint16Array([length]);
	return [lengthData.buffer, dataBuffer];
}

/**
 * Serialize array data
 * @param {*[]} data
 * @param {Object} options
 * @param {boolean} options.sort_key
 * @param {boolean} options.streaming_array
 * @param {boolean} options.streaming_object
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeArray(data, options=DEFAULT_OPTIONS) {
	let dataBuffers = [];
	// ignore undefined value
	for (let key in data) {
		let subData = data[key];
		let subType = __getType(subData, options);
		let subTypeBuffer = __serializeType(subType);
		let subDataBuffers = __serializeData(subType, subData, options);
		dataBuffers.push(subTypeBuffer, ...subDataBuffers);
	}
	let length = __getLengthByArrayBuffers(dataBuffers);
	let lengthData = new Uint32Array([length]);
	return [lengthData.buffer, ...dataBuffers];
}

/**
 * Serialize array data (use streaming)
 * @param {*[]} data
 * @param {Object} options
 * @param {boolean} options.sort_key
 * @param {boolean} options.streaming_array
 * @param {boolean} options.streaming_object
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeArrayStreaming(data, options=DEFAULT_OPTIONS) {
	let dataBuffers = [];
	// ignore undefined value
	for (let key in data) {
		let subData = data[key];
		let subType = __getType(subData, options);
		let subTypeBuffer = __serializeType(subType);
		let subDataBuffers = __serializeData(subType, subData, options);
		dataBuffers.push(subTypeBuffer, ...subDataBuffers);
	}
	return [...dataBuffers, TYPE_HEADER.ARRAY_END];
}

/**
 * Serialize object data
 * @param {Object} data
 * @param {Object} options
 * @param {boolean} options.sort_key
 * @param {boolean} options.streaming_array
 * @param {boolean} options.streaming_object
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeObject(data, options=DEFAULT_OPTIONS) {
	let dataBuffers = [];
	let allKeys = (options.sort_key === true) ? Object.keys(data).sort() : Object.keys(data);
	// ignore undefined value
	for (let key of allKeys) {
		let subData = data[key];
		if (subData === undefined) continue;

		let subType = __getType(subData, options);
		let subTypeBuffer = __serializeType(subType);
		let keyBuffers = __serializeShortString(key);
		let subDataBuffers = __serializeData(subType, subData, options);
		dataBuffers.push(subTypeBuffer, ...keyBuffers, ...subDataBuffers);
	}
	let length = __getLengthByArrayBuffers(dataBuffers);
	let lengthData = new Uint32Array([length]);
	return [lengthData.buffer, ...dataBuffers];
}

/**
 * Serialize object data (use streaming)
 * @param {Object} data
 * @param {Object} options
 * @param {boolean} options.sort_key
 * @param {boolean} options.streaming_array
 * @param {boolean} options.streaming_object
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeObjectStreaming(data, options=DEFAULT_OPTIONS) {
	let dataBuffers = [];
	let allKeys = (options.sort_key === true) ? Object.keys(data).sort() : Object.keys(data);
	// ignore undefined value
	for (let key of allKeys) {
		let subData = data[key];
		if (subData === undefined) continue;

		let subType = __getType(subData, options);
		let subTypeBuffer = __serializeType(subType);
		let keyBuffers = __serializeShortString(key);
		let subDataBuffers = __serializeData(subType, subData, options);
		dataBuffers.push(subTypeBuffer, ...keyBuffers, ...subDataBuffers);
	}
	return [...dataBuffers, TYPE_HEADER.OBJECT_END];
}

/**
 * Serialize date data
 * @param {Date} data
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeDate(data) {
	let contentData = new Float64Array([data.getTime()]);
	return [contentData.buffer];
}

/**
 * Serialize ObjectId data
 * @param {ObjectId} data
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeObjectId(data) {
	return [data._ab];
}

/**
 * Serialize ArrayBuffer Object
 * @param {ArrayBuffer} data
 * @returns {ArrayBuffer[]}
 * @private
 */
function __serializeArrayBuffer(data) {
	let length = data.byteLength;
	let lengthData = new Uint32Array([length]);
	return [lengthData.buffer, data];
}

/**
 * Get length of ArrayBufer[]
 * @param {ArrayBuffer[]} data
 * @returns {number}
 * @private
 */
function __getLengthByArrayBuffers(data) {
	let length = 0;
	for (let key in data) {
		length += data[key].byteLength;
	}
	return length;
}

/**
 * Concat ArrayBuffer[] (based on http://exploringjs.com/es6/ch_typed-arrays.html#_concatenating-typed-arrays)
 * @param {ArrayBuffer[]} buffers
 * @returns {ArrayBuffer}
 * @private
 */
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
