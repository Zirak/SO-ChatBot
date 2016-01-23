module.exports = function (bot) {
"use strict";
//this and the history.js file are nearly identical, as they both manually have
// to grab and parse from the wikimedia API

var notFoundMsgs = [
    'No definition found.',
    'It means I aint got time to learn your $5 words.',
    'My pocket dictionary just isn\'t good enough for you.'
];
var wikiUrl = 'http://en.wiktionary.org';
//I wish regexps had the x flag...
/*
  ( ... )    # the category: alternative spelling, common missspelling, etc
   (of|for)  # alternative spelling of, aternative term for
  (.+?)\.?   # what this shit is an alternative of, sometimes followed by a dot
*/
var alternativeRe = /(alternative (spelling|term)|common misspelling|informal form|archaic spelling) (of|for) (.+?)\.?$/i;

//this object is not planned out well.
//I do not apologise. Except that I do. Sorry future me.
//btw, how did that trip to Iceland go? Awesome! Hope you (we?) had fun.
var define = {
    command : function defineCommand ( args, cb ) {
        var parts = args.parse(),
            definitionIndex = Number( parts.pop() ),
            definee = parts.join(' ');

        if ( !definitionIndex ) {
            definitionIndex = 0;
            definee = args.toString();
        }

        bot.log( args, definee, definitionIndex, '/define input' );
        var self = this;

        this.fetchDefinition( definee, definitionIndex, finish );

        function finish ( definition ) {
            bot.log( definition, '/define result' );
            var pageid = definition.pageid,
                res;

            if ( pageid < 0 ) {
                res = notFoundMsgs.random();
            }
            else {
                res = bot.adapter.link(
                    definition.name, wikiUrl + '/wiki?curid=' + pageid
                ) + ' ' + definition.text;
            }

            if ( definition.overflow ) {
                res = 'Index too large; showing last definition. ' + res;
            }

            if ( cb && cb.call ) {
                cb( res );
            }
            else {
                args.reply( res );
            }
        }
    },

    fetchDefinition : function ( term, definitionIndex, cb ) {
        var self = this;
        this.fetchData( term, gotData );

        function gotData ( resp ) {
            var query = resp.query,
                pageid = query.pageids[ 0 ],
                page = query.pages[ pageid ],
                html = page.extract;

            if ( pageid === '-1' ) {
                cb({
                    pageid : -1
                });

                return;
            }

            var root = document.createElement( 'body' );
            root.innerHTML = html; //forgive me...
            var definitions = self.extractDefinitions( root ),
                definition = definitions[0],
                overflow = false;

            bot.log( definitions, '/define got definitions' );

            // before fetching the actual definition, we first need to check for
            //alternatives.
            if ( definition.alternative ) {
                bot.log( definition.alternative, '/define found alternative' );
                self.fetchData( definition.alternative, gotData );
                return;
            }

            definition = definitions[ definitionIndex ];

            if ( !definition ) {
                definition = definitions[definitions.length - 1];
                overflow = true;
            }

            cb({
                name   : page.title,
                text   : definition.text,
                pageid : pageid,
                overflow : overflow
            });
        }
    },

    extractDefinitions : function ( root ) {
        /*
        Result of 42:
            <ol>
                <li>The cardinal number forty-two.</li>
            </ol>

        Result of plugin:
            <ol>
                <li>
                    <span class="use-with-mention">
                        Alternative spelling of
                        <i class="Latn mention" lang="en" xml:lang="en">
                            <a href="/wiki/plug-in#English" title="plug-in">
                                plug-in
                            </a>
                        </i>
                    </span>
                    .
                </li>
            </ol>

        Result of puling:
            <ol>
                <li>
                    <span class="use-with-mention">
                        Present participle of
                        <i class="Latn mention" lang="en" xml:lang="en">
                            <a href="/wiki/pule#English" title="pule">
                                pule
                            </a>
                        </i>
                    </span>
                    .
                </li>
            </ol>
        */
        var defList = root.getElementsByTagName( 'ol' )[ 0 ];
        console.log( defList, '/define definition list' );

        return Array.from( defList.children )
            .map( this.extractSingleDefinition, this );
    },

    extractSingleDefinition : function ( root ) {
        //before we start messing around with the element's innards, try and
        // find if it's an alternative of something else.
        var alternative = this.extractAlternative( root.textContent );

        //remove any quotations
        Array.from(root.children).forEach(function (child) {
            if (child.tagName === 'UL') {
                root.removeChild(child);
            }
        });

        var links = root.getElementsByTagName( 'a' );
        //be sure to replace links with formatted links.
        while ( links.length ) {
            replaceLink( links[0] );
        }

        return {
            alternative : alternative,
            text : root.textContent
        };

        function replaceLink ( link ) {
            var href = wikiUrl + link.getAttribute( 'href' ),
                textLink = bot.adapter.link( link.textContent, href ),

                textNode = document.createTextNode( textLink );

            link.parentNode.replaceChild( textNode, link );
        }
    },

    extractAlternative : function ( definitionText ) {
        return ( alternativeRe.exec(definitionText) || [] ).pop();
    },

    fetchData : function ( term, cb ) {
        var self = this;

        bot.IO.jsonp({
            url : 'http://en.wiktionary.org/w/api.php',
            jsonpName : 'callback',
            data : {
                action : 'query',
                titles : term,
                format : 'json',
                prop : 'extracts',
                indexpageids : true
            },
            fun : function ( resp ) {
                cb.call( self, resp );
            }
        });
    }
};

bot.addCommand({
    name : 'define',
    fun : define.command,
    thisArg : define,

    permissions : {
        del : 'NONE'
    },

    description : 'Fetches definition for a given word. `/define something`',
    async : true
});
};
