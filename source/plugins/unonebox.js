module.exports = function (bot) {
"use strict";

var memoryKey = 'unonebox-state',
    unboxInterval = 90 * 1000; //1.5 minutes

var unonebox = {
    // because people are bad at reading instructions, accept a wide range of
    // values for the command
    enablers  : Object.TruthMap( ['yes','on','true','start','1','enable'] ),
    disablers : Object.TruthMap( ['no','off','false','stop','0','disable'] ),

    command : function unoneboxCommand ( args ) {
        var state = args.toLowerCase(),
            save = false,
            reply;

        if ( !state ) {
            bot.log( '/unonebox getting state' );
            reply = 'Functionality is ' +
                bot.memory.get( memoryKey, 'disabled' );
        }
        else if ( this.enablers[state] ) {
            bot.log( '/unonebox enabling' );
            this.enable();
            reply = 'un-onebox enabled';
            save = true;
        }
        else if ( this.disablers[state] ) {
            bot.log( '/unonebox disabling' );
            this.disable();
            reply = 'un-onebox disabled';
            save = true;
        }
        else {
            bot.log( '/unonebox invalid input' );
            reply = 'That didn\'t make much sense. Please use `on` or `off` ' +
                'to toggle the command';
        }

        if ( save ) {
            bot.memory.save( memoryKey );
        }

        args.reply( reply );
    },

    enable : function () {
        bot.IO.register( 'input', this.unbox );
        bot.memory.set( memoryKey, 'enabled' );
    },

    disable : function () {
        bot.IO.unregister( 'input', this.unbox );
        bot.memory.set( memoryKey, 'disabled' );
    },

    unbox : function ( msgObj ) {
        // We only operate on our own messages.
        if ( msgObj.user_id !== bot.adapter.user_id ) {
            return;
        }

        var frag = document.createElement( 'div' );
        frag.innerHTML = msgObj.content;
        // do not un-onebox youtube videos and quotes
        var link = frag.querySelector( '.onebox:not(.ob-youtube):not(.ob-message):not(.ob-wikipedia) a' );

        // No onebox, no un-oneboxing.
        // ugly fix for quoted messages as well.
        // TODO - think of a better solution for this.
        if ( !link || link.parentNode.parentNode.classList.contains('quote') ) {
            return;
        }

        bot.log( msgObj, '/unonebox found matching message' );

        setTimeout(function () {
            unonebox.actuallyUnbox( msgObj.message_id, link.href );
        }, unboxInterval );
    },

    actuallyUnbox : function ( msgId, href ) {
        bot.IO.xhr({
            url: '/messages/' + msgId,
            data: fkey({
                text: href + ' ... '
            }),
            method: 'POST',

            complete : function (resp, xhr) {
                bot.log( xhr, '/unonebox done unboxing' );
                // TODO
                // error checking
            }
        });
    }
};

if ( bot.memory.get(memoryKey, 'disabled') === 'enabled' ) {
    bot.log( 'enabling unonebox' );
    unonebox.enable();
}

bot.addCommand({
    name: 'unonebox',
    fun: unonebox.command,
    thisArg : unonebox,

    permissions: {
        del: 'NONE'
    },
    description: 'Get/toggle the unonebox listener. ' +
        '`/unonebox [on|off]x`'
});

};
