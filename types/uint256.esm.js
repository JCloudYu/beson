/**
* Author: JCloudYu
* Create: 2018/09/24
**/
import {BinarizedInt} from "./core-interfaces.esm.js";



export class UInt256 extends BinarizedInt {
	/**
	 * UInt256 Constructor
	 * @param {String|Number|Number[]|BinarizedData} value
	**/
	constructor(value=0) {
		super();
		this.__set_ab(new ArrayBuffer(32));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	
	
	/**
	 * Instantiate a UInt256 base on input value
	 * @param {String|Number|Number[]|BinarizedData} value
	 * @returns {UInt256}
	**/
	static From(value=0) {
		return new UInt256(value);
	}
	
	/**
	 * Return an UInt256 instance with value 0
	 * @returns {UInt256}
	**/
	static get ZERO() {
		return new UInt256();
	}
	
	/**
	 * Return an UInt256 instance with value 0xFFFFFFFFFFFFFFFF
	 * @returns {UInt256}
	**/
	static get MAX() {
		return new UInt256([
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF
		]);
	}
}
export class Int256 extends BinarizedInt  {
	/**
	 * Int256 Constructor
	 * @param {String|Number|Number[]|BinarizedData} value
	**/
	constructor(value=0){
		super();
		this.__set_ab(new ArrayBuffer(32));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	get isSignedInt() { return true; }
	
	
	
	/**
	 * Instantiate a Int256 base on input value
	 * @param {String|Number|Number[]|BinarizedData} value
	 * @returns {Int256}
	**/
	static From(value=0) {
		return new Int256(value);
	}
	
	/**
	 * Return an Int256 instance with value 0
	 * @returns {Int256}
	**/
	static get ZERO() {
		return new Int256();
	}
	
	/**
	 * Return an Int256 instance with value 0xFFFFFFFFFFFFFFFF
	 * @returns {Int256}
	**/
	static get MAX() {
		return new Int256([
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F,
		]);
	}
	
	/**
	 * Return an Int256 instance with value 0xFFFFFFFFFFFFFFFF
	 * @returns {Int256}
	**/
	static get MIN() {
		return new Int256([
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
		]);
	}
}
