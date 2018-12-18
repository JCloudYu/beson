/**
 *	Author: JCloudYu
 *	Create: 2018/12/18
**/
import {ExtractBuffer} from "./misc.js";

// See http://www.isthe.com/chongo/tech/comp/fnv/#FNV-param for the definition of these parameters;
const FNV_PRIME_HIGH = 0x0100, FNV_PRIME_LOW = 0x0193;				// 16777619 0x01000193
const OFFSET_BASIS	 = 0x811C9DC5;

/**
 * Implementation of the FNV-1a hash for a 32-bit hash value
 * Algorithm can be found here:
 * 		http://www.isthe.com/chongo/tech/comp/fnv/#FNV-1a
 * @param {ArrayBuffer} input
 * @private
**/
export function fnv1a32(input){
	let octets = new Uint8Array(ExtractBuffer(input));
	
	const HASH_RESULT = Uint32Array.from([OFFSET_BASIS]);
	const RESULT_PROC = new Uint16Array(HASH_RESULT.buffer);
	for( let i = 0; i < octets.length; i += 1 ) {
		HASH_RESULT[0] = HASH_RESULT[0] ^ octets[i];
		
		let hash_low = RESULT_PROC[0], hash_high = RESULT_PROC[1];
		
		RESULT_PROC[0] = hash_low * FNV_PRIME_LOW;
		RESULT_PROC[1] = hash_low * FNV_PRIME_HIGH + hash_high * FNV_PRIME_LOW + (RESULT_PROC[0]>>>16);
	}
	return HASH_RESULT[0];
}

/**
 * Implements FNV-1a to generate 32-bit hash, then uses xor-folding to convert to a 24-bit hash.
 * See here for more info:
 * 		http://www.isthe.com/chongo/tech/comp/fnv/#xor-fold
 * @private
**/
export function fnv1a24(input){
	const _32bit = fnv1a32(input);
	const base = _32bit & 0xFFFFFF;
	const top = (_32bit >>> 24) & 0xFF;
	return (base ^ top) & 0xFFFFFF;
}
