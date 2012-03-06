var fs = require( 'fs' ),
	http = require( 'http' ),
	querystring = require( 'querystring' );

//some file IO done synchronously because I'm a fat lazy bastard
var build = {
	mainFolder : './source/',
	outputName : 'master.js',

	allTogetherNow : [],
	filesAdded : 0,
	totalFiles : 0,

	tempFile : null,
	totalSize : 0,
	outputSize : 0,

	endCallback : function () {
		build.print( '\nbuilding ' + this.outputName + ' complete' );
		build.print( 'total size of all files (pre-build): ' + this.totalSize );
		build.print( 'final file size: ' + this.outputSize );
	},
	filterer : function () { return true; },

	start : function ( names, filterer, end ) {
		filterer = filterer || function(){return true;};
		if ( end ) {
			this.endCallback = end;
		}

		this.totalFiles = names.length;
		names.forEach(function ( path, idx ) {
			this.add( this.mainFolder + path, idx );
		}, this );
	},

	add : function ( path, idx ) {
		if ( !this.filterer(path) ) {
			build.print( 'rejected ' + path );
			return;
		}

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
		build.print( 'adding ' + filePath );
		//add the file contents as the idx'th item, pushing everything there and
		// after it to the right
		var that = this;
		fs.readFile( filePath, 'utf8', function ( err, data ) {
			if ( err ) {
				throw err;
			}
			that.allTogetherNow.splice( idx, 0, data );

			that.filesAdded++;

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
		if ( this.filesAdded >= this.totalFiles ) {
			this.minify();
		}
	},

	minify : function () {
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

		var that = this;
		var req = http.request( opts, function ( resp ) {
			resp.setEncoding( 'utf8' );
			resp.on( 'data', write );
			resp.on( 'end', function () {
				that.minifyFinish( writeStream );
			});
		});

		req.end( querystring.stringify(data) );

		var writeStream = fs.createWriteStream(
			this.outputName,
			{flags : 'w', encoding : 'utf8'}
		);

		function write ( data ) {
			writeStream.write( data );
			build.outputSize += data.length;
		}
	},

	minifyFinish : function ( writeStream ) {
		writeStream.end();
		build.print( 'minifying complete\n' );

		this.endCallback();
	},

	print : function ( out, overrideVerbose ) {
		if ( !this.verbose || overrideVerbose ) {
			console.log( out );
		}
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
			fileName.indexOf( '.js' ) > -1 &&
			//no backup files
			fileName.indexOf( '~' ) === -1 &&
			fileName.indexOf( '#' ) !== 0
		);
	}
);
