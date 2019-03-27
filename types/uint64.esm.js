/**
* Author: JCloudYu
* Create: 2018/09/24
**/
import {BinarizedInt} from "./core-interfaces.esm.js";



export class UInt64 extends BinarizedInt {
	/**
	 * UInt64 Constructor
	 * @param {String|Number|Number[]|BinarizedData} value
	**/
	constructor(value=0){
		super();
		this.__set_ab(new ArrayBuffer(8));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	
	
	/**
	 * Instantiate a UInt64 base on input value
	 * @param {String|Number|Number[]|BinarizedData} value
	 * @returns {UInt64}
	**/
	static From(value=0) {
		return new UInt64(value);
	}
	
	/**
	 * Return an UInt64 instance with value 0
	 * @returns {UInt64}
	**/
	static get ZERO() {
		return new UInt64();
	}
	
	/**
	 * Return an UInt64 instance with value 0xFFFFFFFFFFFFFFFF
	 * @returns {UInt64}
	**/
	static get MAX() {
		const val = new UInt64();
		val._ta[0] = 0xFFFFFFFF;
		val._ta[1] = 0xFFFFFFFF;
		
		return val;
	}
}
export class Int64 extends BinarizedInt {
	/**
	 * Int64 Constructor
	 * @param {String|Number|Number[]|BinarizedData} value
	**/
	constructor(value=0){
		super();
		this.__set_ab(new ArrayBuffer(8));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	get isSignedInt() { return true; }
	
	
	
	/**
	 * Instantiate a Int64 base on input value
	 * @param {String|Number|Number[]|BinarizedData} value
	 * @returns {Int64}
	**/
	static From(value=0) {
		return new Int64(value);
	}
	
	/**
	 * Return an Int64 instance with value 0
	 * @returns {Int64}
	**/
	static get ZERO() {
		return new Int64();
	}
	
	/**
	 * Return an Int64 instance with value 0xFFFFFFFFFFFFFFFF
	 * @returns {Int64}
	**/
	static get MAX() {
		const val = new Int64();
		val._ta[1] = 0x7FFFFFFF;
		val._ta[0] = 0xFFFFFFFF;
		return val;
	}
	
	/**
	 * Return an Int64 instance with value 0xFFFFFFFFFFFFFFFF
	 * @returns {Int64}
	**/
	static get MIN() {
		const val = new Int64();
		val._ta[1] = 0x80000000;
		val._ta[0] = 0x00000000;
		return val;
	}
}
