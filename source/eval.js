//execute arbitrary js code in a relatively safe environment

/*global require, exports*/
/*global Blob, Worker, setTimeout, clearTimeout*/

var workerCode = require('./codeWorker');

exports.eval = (function () {

var blob = new Blob( [workerCode], { type : 'application/javascript' } ),
    codeUrl = window.URL.createObjectURL( blob );

return function ( code, arg, cb ) {
    if ( arguments.length === 2 ) {
        cb  = arg;
        arg = null;
    }

    var worker = new Worker( codeUrl ),
        timeout;

    worker.onmessage = function ( evt ) {
        console.log( evt, 'eval worker.onmessage' );

        var type = evt.data.event;

        if ( type === 'start' ) {
            start();
        }
        else {
            finish( null, evt.data );
        }
    };

    worker.onerror = function ( error ) {
        console.warn( error, 'eval worker.onerror' );
        finish( error.message );
    };

    //and it all boils down to this...
    worker.postMessage({
        code : code,
        arg  : arg
    });
    //so fucking cool.

    function start () {
        if ( timeout ) {
            return;
        }

        timeout = window.setTimeout(function () {
            finish( 'Maximum execution time exceeded' );
        }, 500 );
    }

    function finish ( err, result ) {
        clearTimeout( timeout );
        worker.terminate();

        if ( cb && cb.call ) {
            cb( err, result );
        }
        else {
            console.warn( 'eval did not get callback' );
        }
    }
};

}());

exports.prettyEval = function ( code, arg, cb ) {
    if ( arguments.length === 2 ) {
        cb  = arg;
        arg = null;
    }

    code = code.replace( /^>/, '' );

    return exports.eval( code, arg, finish );

    function finish ( err, answerObj ) {
        if ( err ) {
            cb( err );
        }
        else {
            cb( dressUpAnswer(answerObj) );
        }
    }

    function dressUpAnswer ( answerObj ) {
        console.log( answerObj, 'eval answerObj' );
        var answer = answerObj.answer,
            log = answerObj.log,
            result;

        if ( answer === undefined ) {
            return 'Malformed output from web-worker. If you weren\'t just ' +
                'fooling around trying to break me, raise an issue or contact ' +
                'Zirak';
        }

        result = snipAndCodify( answer );

        if ( log && log.length ) {
            result += ' Logged: ' + snipAndCodify( log );
        }

        return result;
    }

    function snipAndCodify ( str ) {
        var ret;

        if ( str.length > 400 ) {
            ret = '`' + str.slice(0, 400) + '` (snip)';
        }
        else {
            ret = '`' + str +'`';
        }

        return ret;
    }
};
