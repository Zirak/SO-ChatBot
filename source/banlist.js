bot.banlist = bot.memory.get( 'ban' );
bot.banlist.contains = function ( id ) {
    return this.hasOwnProperty( id );
};
bot.banlist.add = function ( id ) {
    this[ id ] = { told : false };
    bot.memory.save( 'ban' );
};
bot.banlist.remove = function ( id ) {
    if ( this.contains(id) ) {
        delete this[ id ];
        bot.memory.save( 'ban' );
    }
};
