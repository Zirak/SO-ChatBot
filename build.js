var fs = require( 'fs' ),
	http = require( 'http' ),
	querystring = require( 'querystring' );

//until I figure out how to do it asynchronously, file IO unfortunately
// has to be done synchronously
var mainFolder = './source/',
	outputFileName = process.argv[2] || 'master.js', tempName = 'buildTemp',
	tempFile = fs.openSync( tempName, 'w' );

console.log( 'file opened, beginning to write' );

//array of files/folders, relative to mainFolder
[
	//'IO.js',
	'bot.js',
	'commands.js',
	'listeners.js',
	'plugins/'
].forEach(function ( path ) {
	path = mainFolder + path;

	var stat = fs.statSync( path );
	if ( stat.isDirectory() ) {
		addDirectory( path );
	}
	else if ( stat.isFile() ) {
		addFile( path );
	}
});
minifyOutput();

function end () {
	console.log( 'building of ' + outputFileName + ' complete' );
}

function minifyOutput () {
	console.log( 'minifying everything...' );
	var opts = {
		host : 'marijnhaverbeke.nl',
		path : '/uglifyjs',
		method : 'POST',
		headers : {
			'Content-Type' : 'application/x-www-form-urlencoded'
		}
	};
	var data = {
		'js_code' : fs.readFileSync( tempName, 'utf8' ),
		'utf8' : true
	};

	var req = http.request( opts, function ( resp ) {
		resp.setEncoding( 'utf8' );
		resp.on( 'data', write );
		resp.on( 'end', wrapUp );
	});

	req.end( querystring.stringify(data) );

	var writeStream = fs.createWriteStream(
		outputFileName,
		{flags : 'w', encoding : 'utf8'}
	);

	function write ( data ) {
		writeStream.write( data );
	}
	function wrapUp () {
		writeStream.end();
		console.log( 'minifying complete' );
		console.log( 'removing temp build file...' );
		fs.unlink( tempName, function ( err ) {
			if ( err ) {
				throw err;
			}

			end();
		});
	}
}

function addFile ( path ) {
	console.log( 'adding ' + path );
	fs.writeSync(
		tempFile,
		fs.readFileSync(path, 'utf8'),
		null
	);
}

function addDirectory ( path ) {
	var files = fs.readdirSync( path );
	files.forEach(function ( subpath ) {
		addFile( path + subpath );
	});
}