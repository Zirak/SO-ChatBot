var fs = require( 'fs' ),
	http = require( 'http' ),
	querystring = require( 'querystring' );

//until I figure out how to do it asynchronously, file IO unfortunately
// has to be done synchronously
var build = {
	mainFolder : './source/',
	outputName : process.argv[2] || 'master.js',
	tempName : 'buildtmp.tmp',

	tempFile : null,
	totalSize : 0,
	outputSize : 0,

	endCallback : function () {
		console.log( '\nbuilding ' + this.outputName + ' complete' );
		console.log( 'total size of all files (pre-build): ' + this.totalSize );
		console.log( 'final file size: ' + this.outputSize );
	},
	filterer : function () { return true; },

	start : function ( names, filterer, end ) {
		filterer = filterer || function(){return true;};
		if ( end ) {
			this.endCallback = end;
		}

		this.tempFile = fs.openSync( this.tempName, 'w' );

		names.forEach(function ( path ) {
			this.add( this.mainFolder + path );
		}, this );

		this.minify();
	},

	add : function ( path ) {
		if ( !this.filterer(path) ) {
			console.log( 'rejected ' + path );
			return;
		}

		var stat = fs.statSync( path );
		if ( stat.isDirectory() ) {
			this.addDirectory( path );
		}
		else if ( stat.isFile() ) {
			this.totalSize += stat.size;
			this.addFile( path );
		}
	},

	addFile : function ( filePath ) {
		console.log( 'adding ' + filePath );
		fs.writeSync(
			this.tempFile,
			fs.readFileSync( filePath, 'utf8'),
			null
		);
	},

	addDirectory : function ( dirPath ) {
		var files = fs.readdirSync( dirPath );
		files.forEach(function ( subpath ) {
			this.add( dirPath + subpath );
		}, this);
	},

	minify : function () {
		console.log( '\nminifying everything...' );
		var opts = {
			host : 'marijnhaverbeke.nl',
			path : '/uglifyjs',
			method : 'POST',
			headers : {
				'Content-Type' : 'application/x-www-form-urlencoded'
			}
		};
		var data = {
			'js_code' : fs.readFileSync( this.tempName, 'utf8' ),
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
		console.log( 'minifying complete\n' );
		console.log( 'removing temp build file...' );

		var that = this;
		fs.unlink( that.tempName, function ( err ) {
			if ( err ) {
				throw err;
			}

			that.endCallback();
		});
	}
};

//array of files/folders, relative to build.mainFolder,
// which is by default ./source/
var toMinify = [
	//'IO.js',
	'bot.js',
	'commands.js',
	'listeners.js',
	'plugins/'
];
build.start(
	toMinify,
	//don't
	function ( fileName ) {
		return fileName.indexOf( '~' ) === -1 &&
			fileName.indexOf( '#' ) !== 0;
	}
);