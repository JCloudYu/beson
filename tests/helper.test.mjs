/**
 *	Author: JCloudYu
 *	Create: 2019/03/25
**/
import * as Helper from "../helper.esm.js"
import assert from "assert";
import {DumpHexStringLE, DumpIntStringLE, DumpBinaryStringLE} from "../helper.esm.js";


test_group( "Get buffer from string", ()=>{
	test_group( "From hex string", ()=>{
		unit_test( "BufferFromHexStrBE( '0x12345678' )", ()=>{
			const GROUND_TRUTH = [0x12, 0x34, 0x56, 0x78];
			const buffer = Helper.BufferFromHexStrBE("0x12345678");
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		
		unit_test( "BufferFromHexStrBE( '0x12345678', 2 )", ()=>{
			const GROUND_TRUTH = [0x12, 0x34];
			const buffer = Helper.BufferFromHexStrBE("0x12345678", 2);
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		
		unit_test( "BufferFromHexStrLE( '0x12345678' )", ()=>{
			const GROUND_TRUTH = [0x78, 0x56, 0x34, 0x12];
			const buffer = Helper.BufferFromHexStrLE("0x12345678");
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		
		unit_test( "BufferFromHexStrLE( '0x12345678', 2 )", ()=>{
			const GROUND_TRUTH = [0x78, 0x56];
			const buffer = Helper.BufferFromHexStrLE("0x12345678", 2);
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
	});
	test_group( "From binary string", ()=>{
		unit_test( "BufferFromBinStrBE( '0b00010010001101000101011001111000' )", ()=>{
			const GROUND_TRUTH = [0x12, 0x34, 0x56, 0x78];
			const buffer = Helper.BufferFromBinStrBE("0b00010010001101000101011001111000");
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		
		unit_test( "BufferFromBinStrBE( '0b00010010001101000101011001111000', 2 )", ()=>{
			const GROUND_TRUTH = [0x12, 0x34];
			const buffer = Helper.BufferFromBinStrBE("0b00010010001101000101011001111000", 2);
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		
		unit_test( "BufferFromBinStrLE( '0b00010010001101000101011001111000' )", ()=>{
			const GROUND_TRUTH = [0x78, 0x56, 0x34, 0x12];
			const buffer = Helper.BufferFromBinStrLE("0b00010010001101000101011001111000");
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		
		unit_test( "BufferFromBinStrLE( '0b00010010001101000101011001111000', 2 )", ()=>{
			const GROUND_TRUTH = [0x78, 0x56];
			const buffer = Helper.BufferFromBinStrLE("0b00010010001101000101011001111000", 2);
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
	});
	test_group( "From integer string", ()=>{
		unit_test( "BufferFromIntStr( '10986060915047421560' )", ()=>{
			// Additional bytes will be allocated => Math.ceil(Math.ceil(length*log2(10))/8) ~ 9 bytes
			const GROUND_TRUTH = [0x78, 0x56, 0x34, 0x12, 0x32, 0x54, 0x76, 0x98, 0x00];
			const buffer = Helper.BufferFromIntStrLE( "10986060915047421560" );
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		unit_test( "BufferFromIntStr( '10986060915047421560', 8 )", ()=>{
			const GROUND_TRUTH = [0x78, 0x56, 0x34, 0x12, 0x32, 0x54, 0x76, 0x98];
			const buffer = Helper.BufferFromIntStrLE( "10986060915047421560", 8 );
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		unit_test( "BufferFromIntStr( '10986060915047421560', 4 )", ()=>{
			const GROUND_TRUTH = [0x78, 0x56, 0x34, 0x12];
			const buffer = Helper.BufferFromIntStrLE( "10986060915047421560", 4 );
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		unit_test( "BufferFromIntStr( '-1' )", ()=>{
			const GROUND_TRUTH = [0xFF];
			const buffer = Helper.BufferFromIntStrLE( "-1" );
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		unit_test( "BufferFromIntStr( '-1', 8 )", ()=>{
			const GROUND_TRUTH = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF];
			const buffer = Helper.BufferFromIntStrLE( "-1", 8 );
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		unit_test( "BufferFromIntStr( '-1', 4 )", ()=>{
			const GROUND_TRUTH = [0xFF, 0xFF, 0xFF, 0xFF];
			const buffer = Helper.BufferFromIntStrLE( "-1", 4 );
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		unit_test( "BufferFromIntStr( '-5846253917192820027' )", ()=>{
			// Additional bytes will be allocated => Math.ceil(Math.ceil(length*log2(10))/8) ~ 8 bytes
			const GROUND_TRUTH = [0xC5, 0x6A, 0xFC, 0x7E, 0x09, 0xEF, 0xDD, 0xAE];
			const buffer = Helper.BufferFromIntStrLE( "-5846253917192820027" );
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		unit_test( "BufferFromIntStr( '-5846253917192820027', 8 )", ()=>{
			const GROUND_TRUTH = [0xC5, 0x6A, 0xFC, 0x7E, 0x09, 0xEF, 0xDD, 0xAE];
			const buffer = Helper.BufferFromIntStrLE( "-5846253917192820027", 8 );
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
		unit_test( "BufferFromIntStr( '-5846253917192820027', 4 )", ()=>{
			const GROUND_TRUTH = [0xC5, 0x6A, 0xFC, 0x7E];
			const buffer = Helper.BufferFromIntStrLE( "-5846253917192820027", 4 );
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
	});
	
	test_group( "Bitwise arithmetic operations", ()=>{
		test_group( "BitwiseDivision( '6230889068961739280', '134526798' )", ()=>{
			const A = Helper.BufferFromIntStrLE('6230889068961739280', 8);
			const B = Helper.BufferFromIntStrLE('134526798', 8);
			const R = Helper.BitwiseDivisionLE(A, B);
			
			unit_test( "Quotient  is 0x0000000AC8B69F48 ( 46317084488 )", ()=>{
				const GROUND_TRUTH_Q = [0x48, 0x9F, 0xB6, 0xC8, 0x0A, 0x00, 0x00, 0x00];
				
				assert(A.length === GROUND_TRUTH_Q.length);
				for ( let i=0; i<GROUND_TRUTH_Q.length; i++ ) {
					assert( A[i] === GROUND_TRUTH_Q[i] );
				}
			});
			
			unit_test( "Remainder is 0x0000000005B33220 ( 95629856 )", ()=>{
				const GROUND_TRUTH_R = [0x20, 0x32, 0xB3, 0x05, 0x00, 0x00, 0x00, 0x00];
				assert(R.length === GROUND_TRUTH_R.length);
				for ( let i=0; i<GROUND_TRUTH_R.length; i++ ) {
					assert( R[i] === GROUND_TRUTH_R[i] );
				}
			});
		});
		test_group( "BitwiseDivision( '6230889068961739280', '-134526798' )", ()=>{
			const A = Helper.BufferFromIntStrLE('6230889068961739280', 8);
			const B = Helper.BufferFromIntStrLE('-134526798', 8);
			const R = Helper.BitwiseDivisionLE(A, B);
			
			unit_test( "Quotient  is 0xFFFFFFF5374960B8 ( -46317084488 )", ()=>{
				const GROUND_TRUTH_Q = [0xB8, 0x60, 0x49, 0x37, 0xF5, 0xFF, 0xFF, 0xFF];
				
				assert(A.length === GROUND_TRUTH_Q.length);
				for ( let i=0; i<GROUND_TRUTH_Q.length; i++ ) {
					assert( A[i] === GROUND_TRUTH_Q[i] );
				}
			});
			
			unit_test( "Remainder is 0x0000000005B33220 ( 95629856 )", ()=>{
				const GROUND_TRUTH_R = [0x20, 0x32, 0xB3, 0x05, 0x00, 0x00, 0x00, 0x00];
				assert(R.length === GROUND_TRUTH_R.length);
				for ( let i=0; i<GROUND_TRUTH_R.length; i++ ) {
					assert( R[i] === GROUND_TRUTH_R[i] );
				}
			});
		});
		test_group( "BitwiseDivision( '-6230889068961739280', '134526798' )", ()=>{
			const A = Helper.BufferFromIntStrLE('-6230889068961739280', 8);
			const B = Helper.BufferFromIntStrLE('134526798', 8);
			const R = Helper.BitwiseDivisionLE(A, B);
			
			unit_test( "Quotient  is 0xFFFFFFF5374960B8 ( -46317084488 )", ()=>{
				const GROUND_TRUTH_Q = [0xB8, 0x60, 0x49, 0x37, 0xF5, 0xFF, 0xFF, 0xFF];
				
				assert(A.length === GROUND_TRUTH_Q.length);
				for ( let i=0; i<GROUND_TRUTH_Q.length; i++ ) {
					assert( A[i] === GROUND_TRUTH_Q[i] );
				}
			});
			
			unit_test( "Remainder is 0x0000000005B33220 ( 95629856 )", ()=>{
				const GROUND_TRUTH_R = [0x20, 0x32, 0xB3, 0x05, 0x00, 0x00, 0x00, 0x00];
				assert(R.length === GROUND_TRUTH_R.length);
				for ( let i=0; i<GROUND_TRUTH_R.length; i++ ) {
					assert( R[i] === GROUND_TRUTH_R[i] );
				}
			});
		});
		test_group( "BitwiseDivision( '-6230889068961739280', '-134526798' )", ()=>{
			const A = Helper.BufferFromIntStrLE('-6230889068961739280', 8);
			const B = Helper.BufferFromIntStrLE('-134526798', 8);
			const R = Helper.BitwiseDivisionLE(A, B);
			
			unit_test( "Quotient  is 0x0000000AC8B69F48 ( 46317084488 )", ()=>{
				const GROUND_TRUTH_Q = [0x48, 0x9F, 0xB6, 0xC8, 0x0A, 0x00, 0x00, 0x00];
				
				assert(A.length === GROUND_TRUTH_Q.length);
				for ( let i=0; i<GROUND_TRUTH_Q.length; i++ ) {
					assert( A[i] === GROUND_TRUTH_Q[i] );
				}
			});
			
			unit_test( "Remainder is 0x0000000005B33220 ( 95629856 )", ()=>{
				const GROUND_TRUTH_R = [0x20, 0x32, 0xB3, 0x05, 0x00, 0x00, 0x00, 0x00];
				assert(R.length === GROUND_TRUTH_R.length);
				for ( let i=0; i<GROUND_TRUTH_R.length; i++ ) {
					assert( R[i] === GROUND_TRUTH_R[i] );
				}
			});
		});
	});
	
	test_group( "Bitwise bit operations", ()=>{
		unit_test( "BitwiseTwoCompliment(new Uint8Array([0x01, 0x00, 0x00, 0x00, 0x00]))", ()=>{
			const GROUND_TRUTH = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF];
			const buffer = new Uint8Array([0x01, 0x00, 0x00, 0x00, 0x00]);
			Helper.BitwiseTwoComplimentLE(buffer);
			
			assert(GROUND_TRUTH.length === buffer.length);
			for ( let i=0; i<GROUND_TRUTH.length; i++ ) {
				assert( buffer[i] === GROUND_TRUTH[i] );
			}
		});
	});
});
