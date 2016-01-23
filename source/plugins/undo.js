module.exports = function (bot) {
var undo = {
    ids : [],

    command : function ( args, cb ) {
        bot.log( args, '/undo input' );

        // /undo id0 id1 id2
        if ( args.indexOf(' ') > -1 ) {
            this.removeMultiple( args.split(' '), finish );
            return;
        }

        //yucky
        if ( args[0] === '~' ) {
            this.byLookback( args.slice(1), finish );
        }
        else if ( args[0] === '*' || args[0] === 'x' ) {
            this.byPrevious( args.slice(1), finish );
        }
        else if ( /^:?\d+$/.test(args) ) {
            this.remove( args.replace(/^:/, ''), finish );
        }
        else if ( !args.content ) {
            if ( this.ids.length ) {
                this.remove( this.ids[this.ids.length-1], finish );
            }
            else {
                finish( 'I haven\'t said a thing!' );
            }
        }
        else {
            finish( 'I\'m not sure how to handle that, see `/help undo`' );
        }

        function finish ( ans ) {
            if ( cb ) {
                cb( ans );
            }
            else {
                args.reply( ans );
            }
        }
    },

    removeMultiple : function ( ids, cb ) {
        ids.forEach(function ( id ) {
            this.remove( id, cb );
        }, this );
    },

    byLookback : function ( input, cb ) {
        var amount = Number( input.replace('~', '') );

        bot.log( input, amount, this.ids.length - amount, '/undo byLookback' );
        if ( !amount || amount > this.ids.length ) {
            cb( 'I can\'t quite see that far back without my glasses' );
            return;
        }

        this.remove( this.ids[this.ids.length - amount], cb );
    },

    byPrevious : function ( input, cb ) {
        var amount = Number( input );

        if ( !amount ) {
            cb( 'Yeah, no' );
            return;
        }

        return this.removeMultiple( this.ids.slice(-input), cb );
    },

    remove : function ( id, cb ) {
        console.log( id, '/undo remove' );

        //yes, this is quite terrible.
        var index = this.ids.indexOf(id);
        if (index > -1) {
            this.ids.splice(index, 1);
        }

        bot.IO.xhr({
            url   : '/messages/' + id + '/delete',
            data   : fkey(),
            method  : 'POST',
            complete : finish
        });

        function finish ( resp, xhr ) {
            if ( xhr.status === 409 ) {
                bot.log( xhr, '/undo remove finish 409' );
                undo.retry( id, cb, resp );
                return;
            }
            var msg;

            if ( resp === '"ok"' ) {
                //nothing to see here
                return;
            }
            else if ( /it is too late/i.test(resp) ) {
                msg = 'TimeError: Could not reach 88mph';
            }
            else if ( /only delete your own/i.test(resp) ) {
                //...I can't think of anything clever
                msg = 'I can only delete my own messages';
            }
            else {
                msg = 'I have no idea what happened: ' + resp;
            }

            cb( msg );
        }
    },
    retry : function ( id, cb, resp ) {
        //the response will be something like:
        // You can perform this action again in 4 seconds
        var match = /(\d+) seconds\s*$/i.exec( resp ),
            secs  = 4;

        if ( match && match[1] ) {
            secs = Number( match[1] );
        }

        setTimeout( this.remove.bind(this, id, cb), secs * 1000 );
    },

    update_id : function ( xhr ) {
        this.ids.push( JSON.parse(xhr.responseText).id );
    }
};

bot.IO.register( 'sendoutput', undo.update_id, undo );
bot.addCommand({
    name : 'undo',
    fun  : undo.command,
    thisArg : undo,
    permissions : {
        del : 'NONE',
        use : 'OWNER'
    },
    description : 'Undo (delete) specified or last message. ' +
        '`/undo [msgid0, msgid1, ...]` (omit for last message); ' +
        '`/undo xN` for last N; ' +
        '`/undo ~N` for the Nth message from the end'
});

};
