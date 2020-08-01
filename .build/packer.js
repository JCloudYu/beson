/**
 *	Author: ChenyChen, JCloudYu
 *	Create: 2020/01/29
 **/
(async()=>{
	"use strict";

	const START_SIG = "//@export";
	const START_SIG_LEN = START_SIG.length;
	const END_SIG = "//@endexport";
	const END_SIG_LEN = END_SIG.length;


	const fs = require('fs');
	const path = require('path');
	const stream = require('stream');
	const readline = require('readline');
	
	
	const _env_conf = {source_dirs: [], skipped_paths:[], tmpl: null, output: null};
	const working_root = process.cwd();
	
	
	// Read incoming arguments
	{
		const exec_args = process.argv.slice(2);
		const [tmpl_path, basic_dir] = exec_args.splice(exec_args.length-2);
		exec_args.reverse();
		
		
		
		if( !basic_dir ){
			console.error("Source directory is not assigned!");
			process.exit(1);
			return;
		}
		_env_conf.source_dirs.push(path.resolve(working_root, basic_dir));
		
		
		
		if( !tmpl_path ){
			console.error("Template script is not assigned!");
			process.exit(1);
			return;
		}
		_env_conf.tmpl = path.resolve(working_root, tmpl_path);

		
		
		while( exec_args.length > 0 ){
			const opt = exec_args.pop();
			switch( opt ){
				case "--dir":
				case "-d":{
					const dpath = exec_args.pop() || '';
					if( dpath ){
						_env_conf.source_dirs.push(path.resolve(working_root, dpath));
					}
					break;
				}
				
				case '--skip': {
					const tpath = exec_args.pop() || '';
					if ( tpath ) {
						_env_conf.skipped_paths.push(path.resolve(working_root, tpath));
					}
					break;
				}
				
				
				case "--output":
				case "-o":{
					const fpath = exec_args.pop() || '';
					if( fpath ){
						_env_conf.output = path.resolve(working_root, fpath);
					}
					break;
				}
				
				
				default:{
					console.error(`Unknown option \`${ opt }\``);
					process.exit(1);
					return;
				}
			}
		}
	}
	
	
	
	// Expose collected arguments
	const {tmpl, source_dirs, output, skipped_paths} = _env_conf;
	
	
	// Fetch template
	global.BuildTemplate = TemplateResolver;
	const template = (()=>{
		try{
			const script = require(tmpl);
			if( !(script instanceof TemplateResolver) ){
				console.error("Given tmpl is not a valid template descriptor!");
				process.exit(1);
				return null;
			}
			
			return script;
		} catch(e){
			if( e.code === 'ENOENT' ){
				console.error(`Template path \`${ tmpl }\` doesn't exist!`);
				process.exit(1);
				return null;
			}
			
			throw e;
		}
	})();
	
	
	
	// Check source directories
	{
		for( const dir_path of source_dirs ){
			try{
				const dir_stat = fs.statSync(dir_path);
				
				if( !dir_stat.isDirectory() ){
					console.error(`Source path \`${ dir_path }\` is not a directory!`);
					process.exit(1);
					return;
				}
			} catch(e){
				if( e.code === "ENOENT" ){
					console.error(`Source path \`${ dir_path }\` is not a directory!`);
					process.exit(1);
					return;
				}
				
				throw e;
			}
			
			
			
			try{
				fs.accessSync(dir_path, fs.constants.R_OK | fs.constants.X_OK);
			} catch(e){
				console.error(`Current user has no privilege to access directory \`${ dir_path }\`!`);
				process.exit(1);
				return;
			}
		}
	}
	
	
	
	// Create output stream
	const write_stream = (()=>{
		if( !output ) return process.stdout;
		
		try{
			return fs.createWriteStream(output, {mode: 0o644, flags: 'w'});
		} catch(e){
			return null;
		}
	})();
	if( !write_stream ){
		console.error(`Cannot create output stream to file \`${ output }\`!`);
		process.exit(1);
		return;
	}
	
	
	
	// Collect and parse all js script of the target folders
	const named_map = {}, unnamed_pool = [];
	for ( const dir_path of source_dirs ){
		const arrayFiles = ReadMainFolder(dir_path);

		for ( const file of arrayFiles ) {
			if ( skipped_paths.indexOf(file) >= 0 ) continue;
			
			console.error(`Parsing ${file}...`);
			await ParseFile(file, named_map, unnamed_pool);
		}
	}
	
	
	
	console.error(`\nRendering...`);
	// Output generated script base on template script
	{
		const {statics, dynamics} = template;
		
		await WriteToStream(write_stream, statics[0]);
		for( let i = 1; i < statics.length; i++ ){
			const dynamic_content = dynamics[i - 1];
			if( typeof dynamic_content !== "string" ) {
				await WriteToStream(write_stream, '' + dynamic_content);
				await WriteToStream(write_stream, statics[i]);
				continue;
			}
			
			
			if ( dynamic_content === "@unnamed" ) {
				for( const code_segment of unnamed_pool ){
					await WriteToStream(write_stream, code_segment);
				}
				
				await WriteToStream(write_stream, statics[i]);
				continue;
			}
			
			
			
			const important = dynamic_content[0] === '!';
			const optional = dynamic_content[0] === '?';
			const key = (important || optional) ? dynamic_content.substring(1) : dynamic_content;
			
			const seg_pool = named_map[key];
			if( seg_pool !== undefined ){
				for( const code_segment of seg_pool ) {
					await WriteToStream(write_stream, code_segment);
				}
			}
			else if( important ){
				console.error(`    Missing required named block \`${ key }\``);
				process.exit(1);
			}
			else{
				if( !optional ){
					console.error(`    Miss matching named block \`${ key }\``);
				}
				
				await WriteToStream(write_stream, '');
			}
			
			await WriteToStream(write_stream, statics[i]);
		}
		
		
		
		await CloseStream(write_stream);
	}
	
	
	
	function TemplateResolver(strings, ...dynamics) {
		if ( !(this instanceof TemplateResolver) ) {
			return new TemplateResolver(strings, ...dynamics);
		}
	
		this.statics = strings;
		this.dynamics = dynamics;
	}
	function WriteToStream(stream, data){
		return new Promise((resolve, reject)=>{
			stream.write(data, ()=>resolve(true));
		});
	}
	function CloseStream(stream){
		return new Promise((resolve, reject)=>stream.end(resolve));
	}
	function ReadMainFolder(folder, arrayFiles = [], arrayFolder = []) {
		fs.readdirSync(folder, {withFileTypes: true}).forEach(filename=>{
			if( filename.isDirectory() ){
				arrayFolder.push(path.join(folder, filename.name));
				return;
			}
			
			if ( filename.name.indexOf('.js') > 0 ) {
				arrayFiles.push(path.join(folder, filename.name));
			}
		});
		
		if( arrayFolder.length > 0 ){
			for (const foldername of arrayFolder) {
				if ( skipped_paths.indexOf(foldername) >= 0 ) continue;
				const temp = ReadMainFolder(foldername, arrayFiles);
				arrayFiles.concat(temp);
			}
		}
		
		return arrayFiles;
	}
	function GenerateLineReader(filePath) {
		const output = new stream.PassThrough({objectMode:true});
		const readInterface = readline.createInterface({
			input: fs.createReadStream(filePath),
		});
		readInterface.on("line", line => {
			output.write(line);
		});
		readInterface.on("close", () => {
			output.push(null);
		});
		
		return output;
	}
	async function ParseFile(filePath, named, unnamed){
		let idx1, idx2;
		let name_key=null;
		let collect_mode=false;
		let collect_buffer='';
		let line_count=0;
		let line_queue=[];
		
		const readInterface = GenerateLineReader(filePath);
		for await(const new_line of readInterface) {
			line_queue.push(new_line);
			ProcessLineQueue();
		}
		
		// Do remaining cleanup on boundary conditions
		if ( collect_mode && collect_buffer !== '' ) {
			console.error(`    Unterminated region detected!`);
			
			if ( name_key !== null ) {
				named[name_key] = named[name_key] || [];
				named[name_key].push(collect_buffer);
			}
			else {
				unnamed.push(collect_buffer);
			}
		}
		
		
		
		function ProcessLineQueue() {
			while(line_queue.length > 0) {
				let line = line_queue.shift();
				line_count++;
				
				
				// Search for //@export
				if ( !collect_mode ) {
					if ( (idx1 = line.indexOf(START_SIG)) < 0 ) continue;
					
					// Parse //@export=[key]
					collect_mode = true;
					if ( line[idx1+START_SIG_LEN] === '=' ) {
						name_key = line.substring(idx1+START_SIG_LEN+1).trim();
						
						// Purge key identifiers
						if (name_key[0] === '!' || name_key[0] === '@' || name_key === '?') {
							name_key = name_key.substring(1);
						}
					}
					
					// Ignore the whole line since that contents before //@export is defined to be discarded
					continue;
				}
				
				
				
				// Search for paired //@endexport
				const has_terminator = ((idx1 = line.indexOf(END_SIG)) >= 0);
				const has_starter = ((idx2 = line.indexOf(START_SIG)) >= 0);
				if ( !has_terminator || !has_terminator ) {
					collect_buffer += line + "\n";
					continue;
				}
				
				
				if ( has_starter ) {
					if ( !has_terminator || idx2 < idx1 ) {
						console.error(`    ${line_count}:\n    A paired //@endexport token must be presented before //@export token!`);
						process.exit(1);
						return;
					}
					
					// The token //@endexport is presented at right position!
					line_queue.push(line.substring(idx1+END_SIG_LEN));
					line_count--;
				}
				
				
				collect_buffer += line.substring(0, idx1);
				if ( name_key !== null ) {
					named[name_key] = named[name_key] || [];
					named[name_key].push(collect_buffer);
				}
				else {
					unnamed.push(collect_buffer);
				}
				
				
				// Clear state
				collect_mode = false;
				collect_buffer = '';
			}
		}
	}
})()
.catch((e)=>setTimeout(()=>{ console.error(e); throw e; }));
