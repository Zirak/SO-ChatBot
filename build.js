var fs = require( 'fs' ),
	path = require( 'path' );

//some file IO done synchronously because I'm a fat lazy bastard
var build = {
	outputName : 'master.js',
	outputMin  : 'master.min.js',

	doMinify : true,

	allTogetherNow : [],
	totalFiles : 0,
	filesAdded : 0,

	tempFile : null,
	totalSize : 0,
	outputSize : 0,

	start : function ( names, filterer, end, minEnd ) {
		if ( !Array.isArray(names) ) {
			names = [ names ];
		}
		this.filterer = filterer || function () { return true; };

		this.endCallback = end || function () {
			build.print( '\nbuilding ' + this.outputName + ' complete' );

			if ( !this.doMinify ) {
				build.print( 'not running minifier' );
			}

			build.print(
				'total size of all files (pre-build): ' + this.totalSize
			);
			build.print( 'final file size: ' + this.outputSize );
		};

		this.minEndCallback = minEnd || function ( name, size ) {
			build.print( '\nminifying to ' + name + ' complete' );
			build.print( 'final minified size: ' + size );
		};

		this.totalFiles = names.length;
		names.forEach(function ( path, idx ) {
			this.add( path, this.allTogetherNow, idx );
		}, this );
	},

	add : function ( path, filesArray, idx ) {
		fs.stat( path, branch );

		var that = this;
		function branch ( err, stat ) {
			if ( err ) {
				throw err;
			}

			if ( stat.isDirectory() ) {
				that.addDirectory( path, filesArray, idx );
			}
			else if ( stat.isFile() ) {
				that.totalSize += stat.size;
				that.addFile( path, filesArray, idx );
			}
		}
	},

	addFile : function ( filePath, filesArray, idx ) {
		if ( !this.filterer(filePath) ) {
			build.print( colour.red('- ' + filePath) );
			this.totalFiles--;
			return;
		}

		build.print( colour.green('+ ' + filePath) );
		//add the file contents as the idx'th item, pushing everything there
		// and after it to the right
		var that = this;
		preprocessor( filePath, function ( data ) {
			filesArray[ idx ] = data;
			that.filesAdded++;
			that.addComplete();
		});
	},

	addDirectory : function ( dirPath, filesArray, idx ) {
		var that = this;
		//add a trailing slash if it's not already included
		if ( dirPath.lastIndexOf('/') !== dirPath.length-1 ) {
			dirPath += '/';
		}

		fs.readdir( dirPath, function ( err, files ) {
			if ( err ) {
				throw err;
			}

			//-1 because the folder itself was included in the initial count
			that.totalFiles += files.length - 1;
			var arr = filesArray[ idx ] = [];

			files.forEach( add );

			function add ( subpath, idx ) {
				that.add( dirPath + subpath, arr, idx );
			}
		});
	},

	write : function ( finalCode ) {
		var that = this;
		this.outputSize = finalCode.length;

		fs.writeFile( this.outputName, finalCode, 'utf8', function ( err ) {
			if ( err ) {
				throw err;
			}

			that.endCallback();
		});
	},

	addComplete : function () {
		if ( this.filesAdded >= this.totalFiles ) {
			build.print( 'all files added' );
			var code = this.buildFinalCodeString();

			this.write( code );

			if ( this.doMinify ) {
				minify( code, this.minEndCallback );
			}
			code = null;
		}
	},

	buildFinalCodeString : function () {
		return concat( this.allTogetherNow );

		function concat ( filesArray ) {
			return filesArray.map( push ).join( '\n;\n' );
		}

		function push ( suspect ) {
			//we're dealing with a directory
			if ( Array.isArray(suspect) ) {
				return concat( suspect );
			}

			//a regular file
			return suspect;
		}
	}
};

var minify = function ( code, callback, outName ) {
	outName = outName || 'master.min.js';
	build.print( '\nminifying...' );

	var min;
	try {
		min = require( 'uglify-js2' )
			.minify( code, { fromString : true } ).code;
	}
	catch ( e ) {
		console.error( e.toString() );
		return;
	}

	fs.writeFile( outName, min, finish );

	function finish ( err ) {
		if ( err ) {
			throw err;
		}
		callback( outName, min.length );
	}
};

var preprocessor = (function () {

var preprocessor = {
	lastIndex : 0,
	index : 0,
	instruction : '//#build ',
	source : '',
	filePath : '',

	exec : function ( filePath, cb ) {
		this.endCallback = cb;
		this.filePath = filePath;

		var that = this;
		fs.readFile( filePath, 'utf8', function ( err, data ) {
			if ( err ) {
				throw err;
			}
			that.source = data;
			that.preprocess();
		});
	},

	preprocess : function () {
		this.index = this.source.indexOf( this.instruction, this.lastIndex );

		if ( this.index < 0 ) {
			this.endCallback( this.source );
			return;
		}

		//check to see if you're at the beginning of a line or at the beginning
		// of the file
		var targetName, targetPath;

		if (
			this.index === 0 || this.source[this.index-1] === '\n'
		) {
			targetName = this.fetchFilename();
			targetPath = path.resolve(
				path.dirname( this.filePath ), targetName
			);

			this.readTarget( targetPath, targetName );
		}
		//nothing to do here, moving along
		else {
			this.continuation();
		}
	},

	embedFile : function ( targetPath, name ) {
		var that = this;

		fs.readFile( targetPath, 'utf8', function ( err, data ) {
			if ( err ) {
				throw err;
			}
			build.print( colour.blue('# ' + targetPath) );

			//replace the comment with the file content
			//TODO: make this better
			//this seems INCREDIBLY inefficient, and should be replaced with
			// some better solution
			that.source =
				that.source.slice( 0, that.index ) +
				data +
				that.source.slice(
					that.index + that.instruction.length + name.length
				);

			that.continuation();
		});
	},

	readTarget : function ( targetPath, name ) {
		var that = this;
		//check to see if the file requested exists
		fs.exists( targetPath, function ( exists ) {
			if ( !exists ) {
				throw new Error(
					'Cannot #build unexisting file ' + targetPath +
						' (in ' + this.filePath + ')'
				);
			}

			that.embedFile( targetPath, name );
		});
	},

	fetchFilename : function () {
		var ret = '',
			offset = this.index + this.instruction.length;

		//capture the filename:
		//#build blah.js
		//       [-----]  <-- this part, everything until a newline or EOF
		while (
			this.source[offset] &&
			this.source[offset] !== '\n' &&
			this.source[offset] !== '\r'
		) {
			ret += this.source[ offset++ ];
		}

		return ret;
	},

	continuation : function () {
		//this is the continuation function, which is called when either
		// the processor finished doing its job, or if the processor
		// skipped a match for any reason.
		// it sets the index for the next match to begin with, and
		// calls the preprocess function again. recursion ftw
		this.lastIndex = this.index + this.instruction.length;
		this.preprocess();
	}
};

return function () {
	var processor = Object.create( preprocessor );
	return processor.exec.apply( processor, arguments );
};
}());

build.print = function ( out, overrideVerbose ) {
	if ( !this.verbose || overrideVerbose ) {
		console.log( out );
	}
};

if ( process.argv.indexOf('no-min') > -1 ) {
	build.doMinify = false;
}

var files = [
	'./source/IO.js',
	'./source/util.js',
	'./source/bot.js',
	'./source/adapter.js',
	'./source/users.js',
	'./source/personality.js',
	'./source/plugins/'
];
function filter ( fileName ) {
	return (
		//only .js files
		path.extname( fileName ) === '.js' &&
			//no web-workers
			fileName.indexOf( 'Worker' ) === -1 &&
			//no backup files
			fileName.indexOf( '~' ) === -1 &&
			fileName.indexOf( '#' ) !== 0 );
}

build.start( files, filter );

var colour = {
	reg : '\033[0m',
	red : function ( str ) {
		return '\033[31m' + str + this.reg;
	},
	green : function ( str ) {
		return '\033[32m' + str + this.reg;
	},
	blue : function ( str ) {
		return '\033[34m' + str + this.reg;
	},
	purp : function ( str ) {
		return '\033[35m' + str + this.reg;
	}
};
