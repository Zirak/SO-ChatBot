var fs = require( 'fs' ),
	path = require( 'path' ),
	http = require( 'http' ),
	querystring = require( 'querystring' );

//some file IO done synchronously because I'm a fat lazy bastard
var build = {
	mainFolder : './source/',
	outputName : 'master.js',

	allTogetherNow : [],
	totalFiles : 0,

	tempFile : null,
	totalSize : 0,
	outputSize : 0,

	start : function ( names, filterer, end ) {
		this.filterer = filterer || function () { return true; };
		this.endCallback = end || function () {
			build.print( '\nbuilding ' + this.outputName + ' complete' );
			build.print(
				'total size of all files (pre-build): ' + this.totalSize
			);
			build.print( 'final file size: ' + this.outputSize );
		};

		this.totalFiles = names.length;
		names.forEach(function ( path, idx ) {
			this.add( this.mainFolder + path, idx );
		}, this );
	},

	add : function ( path, idx ) {
		fs.stat( path, decide );

		var that = this;
		function decide ( err, stat ) {
			if ( err ) {
				throw err;
			}

			if ( stat.isDirectory() ) {
				that.addDirectory( path, idx );
			}
			else if ( stat.isFile() ) {
				that.totalSize += stat.size;
				that.addFile( path, idx );
			}
		}
	},

	addFile : function ( filePath, idx ) {
		if ( !this.filterer(filePath) ) {
			build.print( 'rejected ' + filePath );
			return;
		}

		build.print( 'adding ' + filePath );
		//add the file contents as the idx'th item, pushing everything there and
		// after it to the right
		var that = this;
		this.preprocessor( filePath, function ( data ) {
			that.allTogetherNow.splice( idx, 0, data );
			that.addComplete();
		});
	},

	addDirectory : function ( dirPath, idx ) {
		var that = this;
		fs.readdir( dirPath, function ( err, files ) {
			if ( err ) {
				throw err;
			}

			//-1 because the folder itself was included in the initial count
			that.totalFiles += files.length - 1;

			files.forEach(function ( subpath ) {
				that.add( dirPath + subpath, idx++ );
			});
		});
	},

	addComplete : function () {
		if ( this.allTogetherNow.length >= this.totalFiles ) {
			this.minify();
		}
	}
};

build.preprocessor = function ( filePath, cb ) {
	var lastIndex = 0, index,
		source,
		instruction = '//#build ';

	fs.readFile( filePath, 'utf8', function ( err, data ) {
		if ( err ) {
			throw err;
		}
		source = data;

		preprocess(function cont () {
			//this is the continuation function, which is called when either
			// the processor finished doing its job, or if the processor
			// skipped a match for any reason.
			// it sets the index for the next match to begin with, and
			// calls the preprocess function again. recursion ftw
			lastIndex = index + instruction.length;
			preprocess( cont );
		});
	});

	function preprocess ( next ) {
		index = source.indexOf( instruction, lastIndex );

		if ( index < 0 ) {
			finish();
			return;
		}

		//check to see if you're at the beginning of a line or at the beginning
		// of the file
		var offset, targetName = '';

		if ( index === 0 || source[index-1] === '\n' ) {
			offset = index + instruction.length;

			//capture the filename:
			//#build blah.js
			//       [-----]  <-- this part, everything until a newline or EOF
			while (
				source[offset] &&
				source[offset] !== '\n' && source[offset] !== '\r'
			) {
				targetName += source[ offset++ ];
			}

			//check to see if the file requested exists
			path.exists( targetName, function ( exists ) {
				if ( !exists ) {
					throw new Error(
						'Cannot #build unexisting file ' + targetName +
						' (in ' + filePath + ')'
					);
				}

				embedFile( targetName );
			});
		}
		else {
			next();
		}

		function embedFile ( targetName ) {
			fs.readFile( targetName, 'utf8', function ( err, data ) {
				if ( err ) {
					throw err;
				}

				//replace the comment with the file content
				//TODO: make this better
				//this seems INCREDIBLY inefficient, and should be replaced with
				// some better solution
				source =
					source.slice( 0, index ) +
					data +
					source.slice(
						index + instruction.length + targetName.length
					);
				next();
			});
		}
	}

	function finish () {
		cb( source );
	}
};

build.minify = function () {
	build.print( '\nminifying everything...' );

	var opts = {
		host : 'marijnhaverbeke.nl',
		path : '/uglifyjs',
		method : 'POST',
		headers : {
			'Content-Type' : 'application/x-www-form-urlencoded'
		}
	};
	var data = {
		//the semi-colon is to be sure no weird things will happen with
		// anonym-functions executing other anonym-functions...
		'js_code' : this.allTogetherNow.join( ';' ),
		'utf8' : true
	};

	var writeStream = fs.createWriteStream(
		this.outputName,
		{flags : 'w', encoding : 'utf8'}
	);

	var that = this;
	var req = http.request( opts, function ( resp ) {
		resp.setEncoding( 'utf8' );

		resp.on( 'data', write );

		resp.on( 'end', function () {
			build.print( 'minifying complete\n' );
			writeStream.end();

			that.endCallback();
		});
	});

	req.end( querystring.stringify(data) );

	function write ( data ) {
		writeStream.write( data );
		build.outputSize += data.length;
	}
};

build.print = function ( out, overrideVerbose ) {
	if ( !this.verbose || overrideVerbose ) {
		console.log( out );
	}
};

//array of files/folders, relative to build.mainFolder,
// which is by default ./source/
var blocks = [
	'bot.js',
	'commands.js',
	'listeners.js',
	'plugins/'
];
build.start(
	blocks,
	function ( fileName ) {
		return (
			//only .js files
			path.extname( fileName ) === '.js' &&
			//no backup files
			fileName.indexOf( '~' ) === -1 &&
			fileName.indexOf( '#' ) !== 0
		);
	}
);
