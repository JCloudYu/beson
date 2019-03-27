/**
* Author: JCloudYu
* Create: 2018/09/24
**/
import {BinarizedInt} from "./core-interfaces.esm.js";



export class UInt128 extends BinarizedInt {
	/**
	 * UInt128 Constructor
	 * @param {String|Number|Number[]|BinarizedData} value
	**/
	constructor(value=0) {
		super();
		this.__set_ab(new ArrayBuffer(16));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	
	
	/**
	 * Instantiate a UInt128 base on input value
	 * @param {String|Number|Number[]|BinarizedData} value
	 * @returns {UInt128}
	**/
	static From(value=0) {
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
		return new UInt128([
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF
		]);
	}
}
export class Int128 extends BinarizedInt  {
	/**
	 * Int128 Constructor
	 * @param {String|Number|Number[]|BinarizedData} value
	**/
	constructor(value=0){
		super();
		this.__set_ab(new ArrayBuffer(16));
		this._ta = new Uint32Array(this._ab);
		
		this.__set_value(value);
	}
	
	get isSignedInt() { return true; }
	
	
	
	/**
	 * Instantiate a Int128 base on input value
	 * @param {String|Number|Number[]|BinarizedData} value
	 * @returns {Int128}
	**/
	static From(value=0) {
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
		return new Int128([
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x7F,
		]);
	}
	
	/**
	 * Return an Int128 instance with value 0xFFFFFFFFFFFFFFFF
	 * @returns {Int128}
	**/
	static get MIN() {
		return new Int128([
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80,
		]);
	}
}
