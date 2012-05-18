(function () {

function makeWorkerExecuteSomeCode( code, callback ) {
    var timeout;

    code = code + "";
    var worker = new Worker( 'codeWorker.js' );

    worker.addEventListener( "message", function(event) {
        clearTimeout(timeout);
        callback( event.data );
    });

    worker.postMessage({
        code: code
    });

    timeout = window.setTimeout( function() {
        callback( "Maximum execution time exceeded" );
        worker.terminate();
    }, 1000 );
}

bot.listen(
	/^\>(.+)$/,
	function ( msg ) {
		var maxLen = 1024;

		makeWorkerExecuteSomeCode( msg.matches[1], finish );

		function finish ( answer ) {
			if ( answer.length > maxLen ) {
				answer = '(snipped)' + answer.slice( 0, maxLen );
			}

			msg.directreply( answer );
		}
	}
);

}());
