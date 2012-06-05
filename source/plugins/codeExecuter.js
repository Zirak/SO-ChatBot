(function () {

var workerCode = atob('dmFyIGdsb2JhbCA9IHRoaXM7IC8qIENvdWxkIHBvc3NpYmx5IGNyZWF0ZSBzb21lIGhlbHBlciBmdW5jdGlvbnMgaGVyZSBzbyB0aGV5IGFyZSBhbHdheXMgYXZhaWxhYmxlIHdoZW4gZXhlY3V0aW5nIGNvZGUgaW4gY2hhdD8qLyAvKiBNb3N0IGV4dHJhIGZ1bmN0aW9ucyBjb3VsZCBiZSBwb3NzaWJseSB1bnNhZmUgKi8gdmFyIHdsID0geyAic2VsZiI6IDEsICJvbm1lc3NhZ2UiOiAxLCAicG9zdE1lc3NhZ2UiOiAxLCAiZ2xvYmFsIjogMSwgIndsIjogMSwgImV2YWwiOiAxLCAiQXJyYXkiOiAxLCAiQm9vbGVhbiI6IDEsICJEYXRlIjogMSwgIkZ1bmN0aW9uIjogMSwgIk51bWJlciIgOiAxLCAiT2JqZWN0IjogMSwgIlJlZ0V4cCI6IDEsICJTdHJpbmciOiAxLCAiRXJyb3IiOiAxLCAiRXZhbEVycm9yIjogMSwgIlJhbmdlRXJyb3IiOiAxLCAiUmVmZXJlbmNlRXJyb3IiOiAxLCAiU3ludGF4RXJyb3IiOiAxLCAiVHlwZUVycm9yIjogMSwgIlVSSUVycm9yIjogMSwgImRlY29kZVVSSSI6IDEsICJkZWNvZGVVUklDb21wb25lbnQiOiAxLCAiZW5jb2RlVVJJIjogMSwgImVuY29kZVVSSUNvbXBvbmVudCI6IDEsICJpc0Zpbml0ZSI6IDEsICJpc05hTiI6IDEsICJwYXJzZUZsb2F0IjogMSwgInBhcnNlSW50IjogMSwgIkluZmluaXR5IjogMSwgIkpTT04iOiAxLCAiTWF0aCI6IDEsICJOYU4iOiAxLCAidW5kZWZpbmVkIjogMSB9OyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyggZ2xvYmFsICkuZm9yRWFjaCggZnVuY3Rpb24oIHByb3AgKSB7IGlmKCAhd2wuaGFzT3duUHJvcGVydHkoIHByb3AgKSApIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBnbG9iYWwsIHByb3AsIHsgZ2V0IDogZnVuY3Rpb24oKSB7IHRocm93ICJTZWN1cml0eSBFeGNlcHRpb246IGNhbm5vdCBhY2Nlc3MgIitwcm9wOyByZXR1cm4gMTsgfSwgY29uZmlndXJhYmxlIDogZmFsc2UgfSk7IH0gfSk7IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKCBnbG9iYWwuX19wcm90b19fICkuZm9yRWFjaCggZnVuY3Rpb24oIHByb3AgKSB7IGlmKCAhd2wuaGFzT3duUHJvcGVydHkoIHByb3AgKSApIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBnbG9iYWwuX19wcm90b19fLCBwcm9wLCB7IGdldCA6IGZ1bmN0aW9uKCkgeyB0aHJvdyAiU2VjdXJpdHkgRXhjZXB0aW9uOiBjYW5ub3QgYWNjZXNzICIrcHJvcDsgcmV0dXJuIDE7IH0sIGNvbmZpZ3VyYWJsZSA6IGZhbHNlIH0pOyB9IH0pOyBPYmplY3QuZGVmaW5lUHJvcGVydHkoIEFycmF5LnByb3RvdHlwZSwgImpvaW4iLCB7IHdyaXRhYmxlOiBmYWxzZSwgY29uZmlndXJhYmxlOiBmYWxzZSwgZW51bXJhYmxlOiBmYWxzZSwgdmFsdWU6IGZ1bmN0aW9uKG9sZCl7IHJldHVybiBmdW5jdGlvbihhcmcpeyBpZiggdGhpcy5sZW5ndGggPiA1MDAgfHwgKGFyZyAmJiBhcmcubGVuZ3RoID4gNTAwICkgKSB7IHRocm93ICJFeGNlcHRpb246IHRvbyBtYW55IGl0ZW1zIjsgfSByZXR1cm4gb2xkLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTsgfTsgfShBcnJheS5wcm90b3R5cGUuam9pbikgfSk7IChmdW5jdGlvbigpeyB2YXIgY3ZhbHVlcyA9IFtdOyB2YXIgY29uc29sZSA9IHsgbG9nOiBmdW5jdGlvbigpeyBjdmFsdWVzID0gY3ZhbHVlcy5jb25jYXQoIFtdLnNsaWNlLmNhbGwoIGFyZ3VtZW50cyApICk7IH0gfTsgZnVuY3Rpb24gb2JqVG9SZXN1bHQoIG9iaiApIHsgdmFyIHJlc3VsdCA9IG9iajsgc3dpdGNoKCB0eXBlb2YgcmVzdWx0ICkgeyBjYXNlICJzdHJpbmciOiByZXR1cm4gJyInICsgcmVzdWx0ICsgJyInOyBicmVhazsgY2FzZSAibnVtYmVyIjogY2FzZSAiYm9vbGVhbiI6IGNhc2UgInVuZGVmaW5lZCI6IGNhc2UgIm51bGwiOiBjYXNlICJmdW5jdGlvbiI6IHJldHVybiByZXN1bHQgKyAiIjsgYnJlYWs7IGNhc2UgIm9iamVjdCI6IGlmKCAhcmVzdWx0ICkgeyByZXR1cm4gIm51bGwiOyB9IGVsc2UgaWYoIHJlc3VsdC5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0IHx8IHJlc3VsdC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgKSB7IHZhciB0eXBlID0gKHt9KS50b1N0cmluZy5jYWxsKCByZXN1bHQgKTsgdmFyIHN0cmluZ2lmaWVkOyB0cnkgeyBzdHJpbmdpZmllZCA9IEpTT04uc3RyaW5naWZ5KHJlc3VsdCk7IH0gY2F0Y2goZSkgeyByZXR1cm4gIiIrZTsgfSByZXR1cm4gdHlwZSArICIgIiArIHN0cmluZ2lmaWVkOyB9IGVsc2UgeyByZXR1cm4gKHt9KS50b1N0cmluZy5jYWxsKCByZXN1bHQgKTsgfSBicmVhazsgfSB9IG9ubWVzc2FnZSA9IGZ1bmN0aW9uKCBldmVudCApIHsgInVzZSBzdHJpY3QiOyB2YXIgY29kZSA9IGV2ZW50LmRhdGEuY29kZTsgdmFyIHJlc3VsdDsgdHJ5IHsgcmVzdWx0ID0gZXZhbCggJyJ1c2Ugc3RyaWN0IjtcbicrY29kZSApOyB9IGNhdGNoKGUpIHsgcG9zdE1lc3NhZ2UoIGUudG9TdHJpbmcoKSApOyByZXR1cm47IH0gcmVzdWx0ID0gb2JqVG9SZXN1bHQoIHJlc3VsdCApOyBpZiggY3ZhbHVlcyAmJiBjdmFsdWVzLmxlbmd0aCApIHsgcmVzdWx0ID0gcmVzdWx0ICsgY3ZhbHVlcy5tYXAoIGZ1bmN0aW9uKCB2YWx1ZSwgaW5kZXggKSB7IHJldHVybiAiXG5Mb2dnZWQgIisoaW5kZXgrMSkrIjoiICsgb2JqVG9SZXN1bHQodmFsdWUpOyB9KS5qb2luKCIiKTsgfSBwb3N0TWVzc2FnZSggKCIiK3Jlc3VsdCkuc3Vic3RyKDAsNDAwKSApOyB9OyB9KSgpOw==');
var BlobBuilder = window.WebKitBlobBuilder,
    blobBuilder = new BlobBuilder(),
    URL = window.webkitURL,
    blob, workerURL;

blobBuilder.append(workerCode);
blob = blobBuilder.getBlob("text/javascript");
workerURL = URL.createObjectURL( blob );

function makeWorkerExecuteSomeCode( code, callback ) {
    var timeout;

    code = (code + "").replace(/[^\u0000-\u00FF]/g, "");
    var worker = new Worker( workerURL );

    worker.addEventListener( "message", function(event) {
        clearTimeout(timeout);
        callback( event.data );
        worker.terminate();
    });

    worker.postMessage({
        code: code
    });

    timeout = window.setTimeout( function() {
        callback( "Maximum execution time exceeded" );
        worker.terminate();
    }, 50 );
}

bot.listen(
    /^\>(.+)$/,
    function ( msg ) {
        var maxLen = 400;

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
