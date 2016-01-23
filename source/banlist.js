/*global require, module*/

module.exports = function ( bot ) {
    var banlist = bot.memory.get( 'ban' );

    banlist.contains = function ( id ) {
        return this.hasOwnProperty( id );
    };

    banlist.add = function ( id ) {
        this[ id ] = { told : false };
        bot.memory.save( 'ban' );
    };

    banlist.remove = function ( id ) {
        if ( this.contains(id) ) {
            delete this[ id ];
            bot.memory.save( 'ban' );
        }
    };

    return banlist;
};
