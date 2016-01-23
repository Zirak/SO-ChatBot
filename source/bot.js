/*global require*/
"use strict";

var SuggestionDictionary = require('./suggestionDict').SuggestionDictionary;
var IO = require('./IO');

var bot = window.bot = {
    IO : IO,

    Command : require('./Command').Command,
    CommunityCommand : require('./Command').CommunityCommand,
    Message : require('./Message').Message,

    commands : {}, //will be filled as needed
    commandDictionary: new SuggestionDictionary( 3 ),
    listeners : [],
    info : {
        invoked   : 0,
        learned   : 0,
        forgotten : 0,
        start     : new Date()
    },
    users : {}, //defined in users.js
    config: {}, //defined in config.js

    parseMessage : function ( msgObj ) {
        if ( !this.validateMessage(msgObj) ) {
            bot.log( msgObj, 'parseMessage invalid' );
            return;
        }

        var msg = this.prepareMessage( msgObj ),
            id = msg.get( 'user_id' );
        bot.log( msg, 'parseMessage valid' );

        if ( this.banlist.contains(id) ) {
            bot.log( msgObj, 'parseMessage banned' );

            //tell the user he's banned only if he hasn't already been told
            if ( !this.banlist[id].told ) {
                msg.reply( 'You iz in mindjail' );
                this.banlist[ id ].told = true;
            }
            return;
        }

        try {
            //it wants to execute some code
            if ( /^c?>/.test(msg) ) {
                this.prettyEval( msg.toString(), msg.directreply.bind(msg) );
            }
            //or maybe some other action.
            else {
                this.invokeAction( msg );
            }
        }
        catch ( e ) {
            var err = 'Could not process input. Error: ' + e.message;

            if ( e.lineNumber ) {
                err += ' on line ' + e.lineNumber;
            }
            //column isn't part of ordinary errors, it's set in custom ones
            if ( e.column ) {
                err += ' on column ' + e.column;
            }

            msg.directreply( err );
            //make sure we have it somewhere
            console.error( e.stack );
        }
        finally {
            this.info.invoked += 1;
        }
    },

    //this conditionally calls execCommand or callListeners, depending on what
    // the input. if the input begins with a command name, it's assumed to be a
    // command. otherwise, it tries matching against the listener.
    invokeAction : function ( msg ) {
        var possibleName = msg.trim().replace( /^\/\s*/, '' ).split( ' ' )[ 0 ],
            cmd = this.getCommand( possibleName ),

            //this is the best name I could come up with
            //messages beginning with / want to specifically invoke a command
            coolnessFlag = msg.startsWith('/') ? !cmd.error : true;

        if ( !cmd.error ) {
            this.execCommand( cmd, msg );
        }
        else if ( coolnessFlag ) {
            coolnessFlag = this.callListeners( msg );
        }

        //nothing to see here, move along
        if ( coolnessFlag ) {
            return;
        }

        msg.reply( this.giveUpMessage(cmd.guesses) );
    },

    giveUpMessage : function ( guesses ) {
        //man, I can't believe it worked...room full of nachos for me
        var errMsg = 'That didn\'t make much sense.';
        if ( guesses && guesses.length ) {
            errMsg += ' Maybe you meant: ' + guesses.join( ', ' );
        }
        //mmmm....nachos
        else {
            errMsg += ' Use the `!!/help` command to learn more.';
        }
        //wait a minute, these aren't nachos. these are bear cubs.
        return errMsg;
        //good mama bear...nice mama bear...tasty mama be---
    },

    execCommand : function ( cmd, msg ) {
        bot.log( cmd, 'execCommand calling' );

        if ( !cmd.canUse(msg.get('user_id')) ) {
            msg.reply([
                'You do not have permission to use the command ' + cmd.name,
                "I'm afraid I can't let you do that, " + msg.get('user_name')
            ].random());
            return;
        }

        var args = this.Message(
            msg.replace( /^\/\s*/, '' ).slice( cmd.name.length ).trim(),
            msg.get()
        ),
            //it always amazed me how, in dynamic systems, the trigger of the
            // actions is always a small, nearly unidentifiable line
            //this line right here activates a command
            res = cmd.exec( args );

        if ( res ) {
            msg.reply( res );
        }
    },

    prepareMessage : function ( msgObj ) {
        msgObj = this.adapter.transform( msgObj );

        //decode markdown and html entities.
        var msg = IO.htmlToMarkdown( msgObj.content ); //#150
        msg = IO.decodehtmlEntities( msg );

        //fixes issues #87 and #90 globally
        msg = msg.replace( /\u200b|\u200c/g, '' );

        return this.Message(
            msg.slice( this.config.pattern.length ).trim(),
            msgObj );
    },

    validateMessage : function ( msgObj ) {
        var msg = msgObj.content.trim();

        //a bit js bot specific...make sure it isn't just !!! all round. #139
        if ( this.config.pattern === '!!' && (/^!!!+$/).test(msg) ) {
            console.log('special skip');
            return false;
        }

        //make sure we don't process our own messages,
        return msgObj.user_id !== bot.adapter.user_id &&
            //make sure we don't process Feeds
            msgObj.user_id > 0 &&
            //and the message begins with the invocation pattern
            msg.startsWith( this.config.pattern );
    },

    addCommand : function ( cmd ) {
        if ( !cmd.exec || !cmd.del ) {
            cmd = this.Command( cmd );
        }

        this.commands[ cmd.name ] = cmd;
        this.commandDictionary.trie.add( cmd.name );
    },

    //gee, I wonder what this will return?
    commandExists : function ( cmdName ) {
        return this.commands.hasOwnProperty( cmdName );
    },

    //if a command named cmdName exists, it returns that command object
    //otherwise, it returns an object with an error message property
    getCommand : function ( cmdName ) {
        var lowerName = cmdName.toLowerCase();

        if ( this.commandExists(lowerName) ) {
            return this.commands[ lowerName ];
        }

        //not found, onto error reporting
        //set the error margin according to the length
        this.commandDictionary.maxCost = Math.floor( cmdName.length / 5 + 1 );

        var msg = 'Command ' + cmdName + ' does not exist.',
            //find commands resembling the one the user entered
            guesses = this.commandDictionary.search( cmdName );

        //resembling command(s) found, add them to the error message
        if ( guesses.length ) {
            msg += ' Did you mean: ' + guesses.join( ', ' );
        }

        return { error : msg, guesses : guesses };
    },

    //the function women think is lacking in men
    listen : function ( regex, fun, thisArg ) {
        if ( Array.isArray(regex) ) {
            regex.forEach(function ( reg ) {
                this.listen( reg, fun, thisArg );
            }, this);
        }
        else {
            this.listeners.push({
                pattern : regex,
                fun : fun,
                thisArg: thisArg
            });
        }
    },

    callListeners : function ( msg ) {
        function callListener ( listener ) {
            var match = msg.exec( listener.pattern ), resp;

            if ( match ) {
                resp = listener.fun.call( listener.thisArg, msg );

                bot.log( match, resp );
                if ( resp ) {
                    msg.reply( resp );
                }
                return resp !== false;
            }
            return false;
        }

        return this.listeners.some( callListener );
    },

    isOwner: function ( usrid ) {
        var user = this.users[ usrid ];
        return user && ( user.is_owner || user.is_moderator );
    },

    log: console.log.bind(console),

    stop : function () {
        this.stopped = this.adapter.out.stopped = true;
    },
    continue : function () {
        this.stopped = false;
    },

    devMode : false,
    activateDevMode : function ( pattern ) {
        this.devMode = true;
        this.config.pattern = pattern || 'beer!';
        if ( IO.events.userjoin ) {
            IO.events.userjoin.length = 0;
        }
        this.validateMessage = function ( msgObj ) {
            return msgObj.content.trim().startsWith( this.config.pattern );
        };
    }
};

bot.adapter = require('./adapter');
bot.adapter.init();
IO.register( 'output', bot.adapter.out.send, bot.adapter.out );

bot.users = require('./users')(bot);
bot.users.loadUsers();

bot.memory = require('./memory');
bot.memory.loadAll();
window.addEventListener( 'beforeunload', function () { bot.memory.save(); } );

bot.config = require('./config')(bot);

bot.banlist = require('./banlist')(bot);

var argParser = require('./parseCommandArgs')();
bot.parseCommandArgs = argParser.parse.bind(argParser);

bot.parseMacro = require('./parseMacro').parseMacro;
bot.personality = require('./personality')(bot);

bot.eval = require('./eval').eval;
bot.prettyEval = require('./eval').prettyEval;

require('./commands')(bot);
require('./listeners')(bot);

require('./_plugin-loader')(bot);

IO.register( 'input', bot.parseMessage, bot );
