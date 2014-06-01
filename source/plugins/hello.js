(function () {
    var input = new RegExp('hello[\\.!?]?(?:\\s@[\\S]+)?$'),
        output = "Is is me you're looking for?";

    function hello ( msgObj ) {
        var text = msgObj.content.toLowerCase(),
            res = input.exec( text );

        if ( res ) {
            bot.adapter.out.add( output, msgObj.room_id );
        };
    };

    IO.register( 'input', hello );
})();
