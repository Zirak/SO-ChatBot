"use strict";

var argParser = {
    create : function () {
        var ret = Object.create(this);

        ret.separator = ' ';
        ret.escape = '\\';
        ret.quote = '"';

        return ret;
    },

    parse : function (source) {
        this.source = source;
        this.pos = 0;

        var ret = [];

        while (!this.done()) {
            ret.push(this.nextArg());
        }

        return ret;
    },

    nextArg : function () {
        var endChar = this.separator;

        if (this.peek() === this.quote) {
            this.nextChar();
            endChar = this.quote;
        }

        return this.consumeUntil(endChar);
    },

    consumeUntil : function (endChar) {
        var char = this.nextChar(),
            escape = false,
            ret = '';

        while (char && char !== endChar) {
            if (char === this.escape && !escape) {
                escape = true;
            }
            else {
                ret += char;
            }

            char = this.nextChar();
        }

        return ret;
    },

    nextChar : function () {
        var ret = this.source[this.pos];
        this.pos += 1;
        return ret;
    },

    peek : function () {
        return this.source[this.pos];
    },

    done : function () {
        return this.pos >= this.source.length;
    }
};

module.exports = function () {
    return argParser.create();
};
