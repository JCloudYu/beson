/**
 *	Author: JCloudYu
 *	Create: 2019/02/06
**/
import fs from "fs";
import path from "path";
import os from "os";

(async()=>{
	const __dirname = path.dirname((import.meta.url).substring(os.platform()==="win32"?8:7));
	
	const TEST_SCRIPTS = process.argv.slice(2);
	
	const root_group = __CREATE_GROUP();
	let current_scope = root_group;
	
	global.test_group	= __ADD_TEST_GROUP;
	global.unit_test	= __ADD_UNIT_TEST;
	
	
	
	// region [ Load all modules ended with .test.js ]
	try {
		if ( TEST_SCRIPTS.length === 0 ) {
			const TEST_PATH = `${__dirname}/tests`;
			const dir_list = fs.readdirSync(TEST_PATH, {withFileTypes:true});
			for(const fInfo of dir_list) {
				const fPath = `${TEST_PATH}/${fInfo.name}`;
				if ( !fInfo.isFile() ) continue;
				if ( fPath.substr(-8) !== ".test.js" && fPath.substr(-9) !== ".test.mjs" ) continue;

				await import( fPath );
			}
		}
		else {
			for ( const SCRIPT of TEST_SCRIPTS ) {
				const SCRIPT_PATH = path.resolve(`${__dirname}`, SCRIPT);
				await import( SCRIPT_PATH );
			}
		}
	}
	catch(e) {
		throw e;
	}
	// endregion
	
	// region [ Run tests ]
	await __RUN_TEST_GROUP(root_group);
	await __PRINT_RESULT(root_group);
	// endregion
	
	// region [ Internal Helper Functions ]
	async function __RUN_TEST_GROUP(group) {
		current_scope = group;
		if ( group.parent !== null ) {
			try {
				await group.group_op();
			}
			catch(e) {
				group.error = e;
				return (group.passed = false);
			}
		}
		
		
		
		let group_passed = true;
		for( const test of group.tests ) {
			await __RUN_UNIT_TEST(test);
			group_passed = group_passed && test.passed;
		}
		
		for( const sub_group of group.child_groups ) {
			await __RUN_TEST_GROUP(sub_group);
			group_passed = group_passed && sub_group.passed;
		}
		
		return (group.passed = group_passed);
	}
	async function __RUN_UNIT_TEST(test) {
		current_scope = test;
		try {
			await test.test_op();
			test.passed = true;
		}
		catch(e) {
			test.error = e;
			test.passed = false;
		}
		
		return test.passed;
	}
	async function __PRINT_RESULT(group) {
		if ( group.parent !== null ) {
			const prefix = group.passed ? "\u001b[92m\u2714 " : "\u001b[91m\u2718 ";
			const indent = __INDENT(group.level);
			let error_msg = '';
			if (group.error) {
				error_msg = `\u001b[93m( ${group.error} )\u001b[39m`;
			}
			
			console.log(`${indent}${prefix}${group.message}\u001b[39m ${error_msg}`);
			if (group.error) {
				console.error(group.error);
			}
		}
		
		for(const test of group.tests) {
			const prefix = test.passed ? "\u001b[92m\u2714 " : "\u001b[91m\u2718 ";
			const indent = __INDENT(test.level);
			let error_msg = '';
			if (test.error) {
				error_msg = `\u001b[93m( ${test.error} )\u001b[39m`;
			}
			
			console.log(`${indent}${prefix}${test.message}\u001b[39m ${error_msg}`);
			if (test.error) {
				console.error(test.error);
			}
		}
		
		for(const sub_group of group.child_groups) {
			await __PRINT_RESULT(sub_group);
		}
	}
	
	function __ADD_TEST_GROUP(message, group_op) {
		if ( typeof group_op !== "function" ) {
			throw new SyntaxError( "The second argument of `test_group` must be a function!" );
		}
	
		if ( current_scope.type !== 'group' ) {
			throw new SyntaxError( "`test_group` can only be invoked within another `test_group` call!" );
		}
		
		if ( current_scope.level >= 4 ) {
			throw new RangeError( "Maximum nested level has been reached!" );
		}
		
		
		
		const group = __CREATE_GROUP();
		group.message	= message;
		group.group_op	= group_op;
		group.level		= current_scope.level+1;
		group.parent	= current_scope;
		current_scope.child_groups.push(group);
	}
	function __ADD_UNIT_TEST( message, test_op ) {
		if ( typeof test_op !== "function" ) {
			throw new SyntaxError( "The second argument of `unit_test` must be a function!" );
		}
	
		if ( current_scope.type !== 'group' ) {
			throw new SyntaxError( "`unit_test` can only be invoked within a `test_group` call!" );
		}
	
		const test = __CREATE_TEST();
		test.message = message;
		test.test_op = test_op;
		test.level	 = current_scope.level+1;
		test.parent	 = current_scope;
		current_scope.tests.push(test);
	}
	function __INDENT(step=0) {
		let indent = '';
		for(let i=0; i<step; i++) {
			indent += '    ';
		}
		return indent;
	}
	function __CREATE_GROUP() {
		return Object.assign(
			Object.create(null),
			{
				type: 'group',
				message: null,
				group_op: null,
				parent: null,
				level: -1,
				tests: [],
				child_groups: [],
				passed: true,
				error: null
			}
		);
	}
	function __CREATE_TEST() {
		return Object.assign(
			Object.create(null),
			{
				type: 'test',
				level: -1,
				message: null,
				test_op: null,
				parent: null,
				passed: true,
				error: null
			}
		);
	}
	// endregion
})().catch((e)=>{throw e;});
