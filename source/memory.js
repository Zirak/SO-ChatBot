//a place to hang your coat and remember the past. provides an abstraction over
// localStorage or whatever data-storage will be used in the future.

/*global localStorage, setTimeout, clearTimeout*/
/*global require, module*/

module.exports = {
    saveInterval : 900000, //15(min) * 60(sec/min) * 1000(ms/sec) = 900000(ms)

    data : {},

    get : function ( name, defaultVal ) {
        if ( !this.data[name] ) {
            this.set( name, defaultVal || {} );
        }

        return this.data[ name ];
    },

    set : function ( name, val ) {
        this.data[ name ] = val;
    },

    loadAll : function () {
        var self = this;

        Object.iterate( localStorage, function ( key, val ) {
            if ( key.startsWith('bot_') ) {
                console.log( key, val );
                self.set( key.replace(/^bot_/, ''), JSON.parse(val) );
            }
        });
    },

    save : function ( name ) {
        if ( name ) {
            localStorage[ 'bot_' + name ] = JSON.stringify( this.data[name] );
            return;
        }

        var self = this;
        Object.keys( this.data ).forEach(function ( name ) {
            self.save( name );
        });

        this.saveLoop();
    },

    saveLoop : function () {
        clearTimeout( this.saveIntervalId );
        //XXX this makes no sense
        setTimeout( this.saveLoop.bind(this), this.saveInterval );
    }
};
