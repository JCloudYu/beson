/**
 *	Author: JCloudYu
 *	Create: 2019/02/06
**/
(async()=>{
	let fs, path, dir, acquire;
	if ( typeof require === "undefined" ) {
		const {default:os} = await import( 'os' );
		({default:fs} = await import( 'fs' ));
		({default:path} = await import( 'path' ));
		
		const is_win = (os.platform().substring(0, 3) === "win");
		const [, script_path] = process.argv;
		dir = path.dirname(path.resolve(script_path));
		
		const __proto = `file://${is_win? "/" : ""}`;
		acquire = async function import_es_module(path, check_name=true) {
			if ( check_name && path.substr(-8) !== ".test.js" && path.substr(-9) !== ".test.mjs" ) return;
			return import( `${__proto}${path}` );
		};
	}
	else {
		fs	 = require( 'fs' );
		path = require( 'path' );
		dir	 = __dirname;
		
		acquire = async function import_module(path, check_name=true) {
			if ( check_name && path.substr(-8) !== ".test.js" ) return;
			return require( path );
		};
	}



	
	
	
	
	
	const MAX_TOTAL_LEVELS = 10;
	const MAX_NESTED_LEVEL = MAX_TOTAL_LEVELS - 1;
	
	const root_procedure = __CREATE_PROCEDURE();
	root_procedure.type = 'none';
	root_procedure.script = null;
	
	
	const procedure_id_map	= Object.create(null);
	const requested_proc	= [];
	let current_script		= null;
	let current_scope		= root_procedure;
	
	global.init_context  = __INIT_TEST_CONTEXT;
	global.test_group	 = __SCHEDULE_GROUP_PROCEDURE;
	global.unit_test	 = __SCHEDULE_TEST_PROCEDURE;
	global.run_procedure = __SCHEDULE_SILENT_PROCEDURE;
	
	
	
	// INFO: Load all modules ended with .test.js
	{
		try {
			const TEST_PATH = `${dir}/tests`;
			const dir_list = fs.readdirSync(TEST_PATH, {withFileTypes:true});
			for(const fInfo of dir_list) {
				const fPath = `${TEST_PATH}/${fInfo.name}`;
				if ( !fInfo.isFile() ) continue;
				
				await acquire( current_script=fPath );
			}
		}
		catch(e) {
			throw e;
		}
		
		for ( const procedure_id of process.argv.slice(2) ) {
			requested_proc.push(procedure_id);
		}
	}
	
	// region [ Run tests ]
	const selected_procedures = [];
	for( const id of requested_proc ) {
		const procedure = procedure_id_map[id];
		if ( !procedure ) continue;
		
		selected_procedures.push(procedure);
	}
	if ( requested_proc.length > 0 && selected_procedures.length === 0 ) {
		console.log("\u001b[91mNo matched procedures! Exiting...\u001b[39m");
		process.exit(0);
	}
	
	
	
	if ( selected_procedures.length === 0 ) {
		await __RUN_PROCEDURE(root_procedure);
		await __PRINT_RESULT(root_procedure);
	}
	else {
		for( const procedure of selected_procedures ) {
			await __RUN_PROCEDURE(procedure);
		}
		
		for( const procedure of selected_procedures ) {
			await __PRINT_RESULT(procedure);
		}
	}
	
	// endregion
	
	
	
	
	
	
	
	
	
	// region [ Internal Helper Functions ]
	async function __RUN_PROCEDURE(procedure) {
		current_scope = procedure;
		
		let group_passed = true;
		if ( procedure.parent !== null ) {
			let _start_time = Date.now();
			try {
				await procedure.operation();
				procedure.exec_time = Date.now() - _start_time;
			}
			catch(e) {
				procedure.error = e;
				procedure.passed = false;
				procedure.exec_time = Date.now() - _start_time;
				return;
			}
		}
		
		
		
		for( const _procedure of procedure.children ) {
			await __RUN_PROCEDURE(_procedure);
			group_passed = group_passed && _procedure.passed;
		}
		
		return (procedure.passed = group_passed);
	}
	async function __PRINT_RESULT(procedure) {
		if ( procedure.type === 'silent' ) return;
	
		if ( procedure.parent !== null ) {
			const color = procedure.passed ? "\u001b[92m" : "\u001b[91m";
			const prefix = procedure.passed ? "\u2714 " : "\u2718 ";
			const indent = __INDENT(procedure.level);
			const exec_time = (procedure.type === "test") ? ` ( \u001b[93m${procedure.exec_time/1000} s ${color})` : '';
			
			let error_msg = '';
			if (procedure.error) {
				error_msg = `\u001b[93m( ${procedure.error} )\u001b[39m`;
			}
			
			console.log(`${indent}${color}${prefix}${procedure.message}${exec_time}\u001b[39m ${error_msg}`);
			if (procedure.error) {
				console.error(procedure.error);
			}
		}
		
		for(const _procedure of procedure.children) {
			await __PRINT_RESULT(_procedure);
		}
	}
	
	
	
	function __INIT_TEST_CONTEXT(id, group_op) {
		if ( arguments.length < 2 ) {
			group_op = id;
			id = null;
		}
	
		if ( typeof group_op !== "function" ) {
			throw new SyntaxError( "The argument of `init_context` must be a function!" );
		}
	
		if ( current_scope.type !== 'none' ) {
			throw new SyntaxError( "`init_context can only be invoked once in the top most scope!`" );
		}
		
		if ( current_scope.level >= MAX_NESTED_LEVEL ) {
			throw new RangeError( "Maximum nested level has been reached!" );
		}
		
		
		
		const group = __CREATE_PROCEDURE();
		group.type = 'group';
		group.is_context = true;
		group.message = current_script;
		group.operation = group_op;
		group.level = current_scope.level+1;
		group.parent = current_scope;
		current_scope.children.push(group);
		
		if ( id !== null ) {
			procedure_id_map[id] = group;
		}
	}
	function __SCHEDULE_GROUP_PROCEDURE(message, group_op) {
		if ( typeof group_op !== "function" ) {
			throw new SyntaxError( "The second argument of `test_group` must be a function!" );
		}
	
		if ( current_scope.type === 'none' ) {
			throw new SyntaxError( "`init_context` must be invoked before `test_group` call!" );
		}
		else
		if ( current_scope.type !== 'group' ) {
			throw new SyntaxError( "`test_group` can only be invoked within another `test_group` call!" );
		}
		
		if ( current_scope.level >= MAX_NESTED_LEVEL ) {
			throw new RangeError( "Maximum nested level has been reached!" );
		}
		
		
		
		const group = __CREATE_PROCEDURE();
		group.type = 'group';
		group.message = message;
		group.operation = group_op;
		group.level = current_scope.level+1;
		group.parent = current_scope;
		current_scope.children.push(group);
	}
	function __SCHEDULE_TEST_PROCEDURE(message, test_op) {
		if ( typeof test_op !== "function" ) {
			throw new SyntaxError( "The second argument of `unit_test` must be a function!" );
		}
	
		if ( current_scope.type === 'none' ) {
			throw new SyntaxError( "`init_context` must be invoked before `unit_test` call!" );
		}
		else
		if ( current_scope.type !== 'group' ) {
			throw new SyntaxError( "`unit_test` can only be invoked within a `test_group` call!" );
		}
		
		
		
		const test = __CREATE_PROCEDURE();
		test.type = 'test';
		test.message = message;
		test.operation = test_op;
		test.level = current_scope.level+1;
		test.parent	= current_scope;
		current_scope.children.push(test);
	}
	function __SCHEDULE_SILENT_PROCEDURE(operation_op) {
		if ( typeof operation_op !== "function" ) {
			throw new SyntaxError( "The argument of `init_context` must be a function!" );
		}
	
		if ( current_scope.type === 'none' ) {
			throw new SyntaxError( "`init_context` must be invoked before `run_procedure` call!" );
		}
		else
		if ( current_scope.type !== 'group' ) {
			throw new SyntaxError( "`run_procedure` can only be invoked within another `run_procedure` call!" );
		}
		
		if ( current_scope.level >= MAX_NESTED_LEVEL ) {
			throw new RangeError( "Maximum nested level has been reached!" );
		}
		
		
		
		const group = __CREATE_PROCEDURE();
		group.type = 'silent';
		group.operation = operation_op;
		group.level = current_scope.level+1;
		group.parent = current_scope;
		current_scope.children.push(group);
	}
	
	
	
	function __INDENT(step=0) {
		let indent = '';
		for(let i=0; i<step; i++) {
			indent += '    ';
		}
		return indent;
	}
	function __CREATE_PROCEDURE() {
		return Object.assign(Object.create(null), {
			type: 'scheduled',
			level: -1,
			is_context: false,
			message: null,
			operation: null,
			children: [],
			
			parent: null,
			passed: true,
			error: null
		});
	}
	// endregion
})().catch((e)=>{throw e;});
