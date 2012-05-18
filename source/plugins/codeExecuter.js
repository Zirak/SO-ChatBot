(function () {

var workerCode = atob('CnZhciBnbG9iYWwgPSB0aGlzOwoKLyogQ291bGQgcG9zc2libHkgY3JlYXRlIHNvbWUgaGVscGVyIGZ1bmN0aW9ucyBoZXJlIHNvIHRoZXkgYXJlIGFsd2F5cyBhdmFpbGFibGUgd2hlbiBleGVjdXRpbmcgY29kZSBpbiBjaGF0PyovCgovKiBNb3N0IGV4dHJhIGZ1bmN0aW9ucyBjb3VsZCBiZSBwb3NzaWJseSB1bnNhZmUgKi8KCnZhciB3bCA9IHsKICAgICJzZWxmIjogMSwKICAgICJvbm1lc3NhZ2UiOiAxLAogICAgInBvc3RNZXNzYWdlIjogMSwKICAgICJnbG9iYWwiOiAxLAogICAgIndsIjogMSwKICAgICJldmFsIjogMSwKICAgICJBcnJheSI6IDEsCiAgICAiQm9vbGVhbiI6IDEsCiAgICAiRGF0ZSI6IDEsCiAgICAiRnVuY3Rpb24iOiAxLAogICAgIk51bWJlciIgOiAxLAogICAgIk9iamVjdCI6IDEsCiAgICAiUmVnRXhwIjogMSwKICAgICJTdHJpbmciOiAxLAogICAgIkVycm9yIjogMSwKICAgICJFdmFsRXJyb3IiOiAxLAogICAgIlJhbmdlRXJyb3IiOiAxLAogICAgIlJlZmVyZW5jZUVycm9yIjogMSwKICAgICJTeW50YXhFcnJvciI6IDEsCiAgICAiVHlwZUVycm9yIjogMSwKICAgICJVUklFcnJvciI6IDEsCiAgICAiZGVjb2RlVVJJIjogMSwKICAgICJkZWNvZGVVUklDb21wb25lbnQiOiAxLAogICAgImVuY29kZVVSSSI6IDEsCiAgICAiZW5jb2RlVVJJQ29tcG9uZW50IjogMSwKICAgICJpc0Zpbml0ZSI6IDEsCiAgICAiaXNOYU4iOiAxLAogICAgInBhcnNlRmxvYXQiOiAxLAogICAgInBhcnNlSW50IjogMSwKICAgICJJbmZpbml0eSI6IDEsCiAgICAiSlNPTiI6IDEsCiAgICAiTWF0aCI6IDEsCiAgICAiTmFOIjogMSwKICAgICJ1bmRlZmluZWQiOiAxCn07CgpPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyggZ2xvYmFsICkuZm9yRWFjaCggZnVuY3Rpb24oIHByb3AgKSB7CiAgICBpZiggIXdsLmhhc093blByb3BlcnR5KCBwcm9wICkgKSB7CiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBnbG9iYWwsIHByb3AsIHsKICAgICAgICAgICAgZ2V0IDogZnVuY3Rpb24oKSB7CiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICJTZWN1cml0eSBFeGNlcHRpb246IGNhbm5vdCBhY2Nlc3MgIitwcm9wKTsKICAgICAgICAgICAgICAgIHJldHVybiAxOwogICAgICAgICAgICB9LCAKICAgICAgICAgICAgY29uZmlndXJhYmxlIDogZmFsc2UKICAgICAgICB9KTsgICAgCiAgICB9Cn0pOwoKT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoIGdsb2JhbC5fX3Byb3RvX18gKS5mb3JFYWNoKCBmdW5jdGlvbiggcHJvcCApIHsKICAgIGlmKCAhd2wuaGFzT3duUHJvcGVydHkoIHByb3AgKSApIHsKICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGdsb2JhbC5fX3Byb3RvX18sIHByb3AsIHsKICAgICAgICAgICAgZ2V0IDogZnVuY3Rpb24oKSB7CiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICJTZWN1cml0eSBFeGNlcHRpb246IGNhbm5vdCBhY2Nlc3MgIitwcm9wKTsKICAgICAgICAgICAgICAgIHJldHVybiAxOwogICAgICAgICAgICB9LCAKICAgICAgICAgICAgY29uZmlndXJhYmxlIDogZmFsc2UKICAgICAgICB9KTsgICAgCiAgICB9Cn0pOwoKCgoKb25tZXNzYWdlID0gZnVuY3Rpb24oIGV2ZW50ICkgewogICAgInVzZSBzdHJpY3QiOwogICAgdmFyIGNvZGUgPSBldmVudC5kYXRhLmNvZGU7CiAgICB2YXIgcmVzdWx0OwogICAgdHJ5IHsKICAgICAgICByZXN1bHQgPSBldmFsKCAnInVzZSBzdHJpY3QiO1xuJytjb2RlICk7CiAgICB9CiAgICBjYXRjaChlKXsKICAgICAgICByZXN1bHQgPSBlLnRvU3RyaW5nKCk7CiAgICB9CiAgICBwb3N0TWVzc2FnZSggIigiICsgdHlwZW9mIHJlc3VsdCArICIpIiArICIgIiArIHJlc3VsdCApOwp9Owo=');

var BlobBuilder = window.WebKitBlobBuilder,
    blobBuilder = new BlobBuilder(),
    URL = window.webkitURL,
    blob, workerURL;

blobBuilder.append(workerCode);
blob = blobBuilder.getBlob("text/javascript");
workerURL = URL.createObjectURL( blob );

function makeWorkerExecuteSomeCode( code, callback ) {
    var timeout;

    code = code + "";
    var worker = new Worker( workerURL );

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
