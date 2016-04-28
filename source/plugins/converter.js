'use strict';

var defs = require('static/qtyDefinitions'),
    SuggestionDictionary = require('suggestionDict').SuggestionDictionary;

var UNITS = defs.UNITS,
    BASE_UNITS = defs.BASE_UNITS,

    UNITY = defs.UNITY,
    UNITY_ARRAY = defs.UNITY_ARRAY,

    SIGNATURE_VECTOR = defs.SIGNATURE_VECTOR,

    QTY_STRING = defs.QTY_STRING,
    QTY_STRING_REGEX = defs.QTY_STRING_REGEX,
    TOP_REGEX = defs.TOP_REGEX,
    BOTTOM_REGEX = defs.BOTTOM_REGEX,

    UNIT_VALUES = defs.UNIT_VALUES,
    UNIT_MAP = defs.UNIT_MAP,
    PREFIX_VALUES = defs.PREFIX_VALUES,
    PREFIX_MAP = defs.PREFIX_MAP,
    OUTPUT_MAP = defs.OUTPUT_MAP,

    UNIT_MATCH_REGEX = defs.UNIT_MATCH_REGEX,
    UNIT_TEST_REGEX = defs.UNIT_TEST_REGEX;

var suggestionDict = new SuggestionDictionary(2);
suggestionDict.build(Object.keys(UNIT_MAP).filter(function (key) {
    return key.length > 1;
}));

module.exports = function (bot) {
    'use strict';

    function convert(args) {
        bot.log(args, '/convert input');
        if (args.toLowerCase() === 'list') {
            return args.stringifyGiantArray(Qty.getUnits());
        }

        // Trust me on this.
        var re = new RegExp('^(' + QTY_STRING + ') (?:(?:to|in) )?(' + QTY_STRING + ')$');
        var parts = re.exec(args);
        if (!parts) {
            console.log('wtf');
            return 'You have confused me greatly, see `/help convert`.';
        }

        bot.log(parts[1], '=>', parts[5], '/convert parsed');

        try {
            // And on this as well.
            var origin = Qty(parts[1]),
                dest = Qty(parts[5]);

            return origin.to(dest).toString(4);
        }
        catch (e) {
            console.error('/convert error', e);
            return e.message;
        }
    }

    bot.addCommand({
        name: 'convert',
        fun: convert,
        permissions: {
            del: 'NONE'
        },
        description: 'Converts several units and currencies, case sensitive. '+
            '`/convert <num><unit> [to|in <unit>]` ' +
            'Pass in list for supported units `/convert list`'
    });
};

// From here on on it's a slightly altered Qty:
// https://github.com/gentooboontoo/js-quantities
/*
Copyright © 2006-2007 Kevin C. Olbrich
Copyright © 2010-2013 LIM SAS (http://lim.eu) - Julien Sanchez

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function Qty(initValue, initUnits) {
    if (!(isQty(this))) {
        return new Qty(initValue, initUnits);
    }

    this.scalar = null;
    this.baseScalar = null;
    this.signature = null;
    this.numerator = UNITY_ARRAY;
    this.denominator = UNITY_ARRAY;

    if (isDefinitionObject(initValue)) {
        this.scalar = initValue.scalar;
        this.numerator = (initValue.numerator && initValue.numerator.length !== 0) ? initValue.numerator : UNITY_ARRAY;
        this.denominator = (initValue.denominator && initValue.denominator.length !== 0) ? initValue.denominator : UNITY_ARRAY;
    }
    else if (initUnits) {
        parse.call(this, initUnits);
        this.scalar = initValue;
    }
    else {
        parse.call(this, initValue);
    }

    // math with temperatures is very limited
    if (this.denominator.join('*').indexOf('temp') >= 0) {
        throw new Error('Cannot divide with temperatures');
    }
    if (this.numerator.join('*').indexOf('temp') >= 0) {
        if (this.numerator.length > 1) {
            throw new Error('Cannot multiply by temperatures');
        }
        if (!isUnityArray(this.denominator)) {
            throw new Error('Cannot divide with temperatures');
        }
    }

    this.initValue = initValue;

    if (this.isBase()) {
        this.baseScalar = this.scalar;
        this.signature = unitSignature.call(this);
    }
    else {
        var base = this.toBase();
        this.baseScalar = base.scalar;
        this.signature = base.signature;
    }

    if (this.isTemperature() && this.baseScalar < 0) {
        throw new Error('Temperatures must not be less than absolute zero');
    }
}

Qty.getUnits = function() {
    var i;
    var units = [];
    var unitKeys = Object.keys(UNITS);
    for (i = 0; i < unitKeys.length; i += 1) {
        if (['', 'prefix'].indexOf(UNITS[unitKeys[i]][2]) === -1) {
            units.push(unitKeys[i].substr(1, unitKeys[i].length - 2));
        }
    }

    return units.sort(function(a, b) {
        if (a.toLowerCase() < b.toLowerCase()) {
            return -1;
        }
        if (a.toLowerCase() > b.toLowerCase()) {
            return 1;
        }
        return 0;
    });
};

/*
  calculates the unit signature id for use in comparing compatible units and simplification
  the signature is based on a simple classification of units and is based on the following publication

  Novak, G.S., Jr. 'Conversion of units of measurement', IEEE Transactions on Software Engineering,
  21(8), Aug 1995, pp.651-661
  doi://10.1109/32.403789
  http://ieeexplore.ieee.org/Xplore/login.jsp?url=/iel1/32/9079/00403789.pdf?isnumber=9079&prod=JNL&arnumber=403789&arSt=651&ared=661&arAuthor=Novak%2C+G.S.%2C+Jr.
*/
var unitSignature = function() {
    if (this.signature) {
        return this.signature;
    }
    var vector = unitSignatureVector.call(this);
    for (var i = 0; i < vector.length; i += 1) {
        vector[i] *= Math.pow(20, i);
    }

    return vector.reduce(function(previous, current) {
        return previous + current;
    }, 0);
};

// calculates the unit signature vector used by unit_signature
var unitSignatureVector = function() {
    if (!this.isBase()) {
        return unitSignatureVector.call(this.toBase());
    }

    var vector = new Array(SIGNATURE_VECTOR.length);
    for (var i = 0; i < vector.length; i += 1) {
        vector[i] = 0;
    }
    var r, n;
    for (var j = 0; j < this.numerator.length; j += 1) {
        if ((r = UNITS[this.numerator[j]])) {
            n = SIGNATURE_VECTOR.indexOf(r[2]);
            if (n >= 0) {
                vector[n] = vector[n] + 1;
            }
        }
    }

    for (var k = 0; k < this.denominator.length; k += 1) {
        if ((r = UNITS[this.denominator[k]])) {
            n = SIGNATURE_VECTOR.indexOf(r[2]);
            if (n >= 0) {
                vector[n] = vector[n] - 1;
            }
        }
    }
    return vector;
};

/* parse a string into a unit object.
 * Typical formats like :
 * '5.6 kg*m/s^2'
 * '5.6 kg*m*s^-2'
 * '5.6 kilogram*meter*second^-2'
 * '2.2 kPa'
 * '37 degC'
 * '1'  -- creates a unitless constant with value 1
 * 'GPa'  -- creates a unit with scalar 1 with units 'GPa'
 * 6'4'  -- recognized as 6 feet + 4 inches
 * 8 lbs 8 oz -- recognized as 8 lbs + 8 ounces
 */
var parse = function(val) {
    if (!isString(val)) {
        val = val.toString();
    }
    val = val.trim();

    var result = QTY_STRING_REGEX.exec(val);
    if (!result) {
        throw new Error(val + ': Quantity not recognized');
    }

    var scalarMatch = result[1];
    if (scalarMatch) {
        // Allow whitespaces between sign and scalar for loose parsing
        scalarMatch = scalarMatch.replace(/\s/g, '');
        this.scalar = parseFloat(scalarMatch);

        // zirak: Handle Infinity inputs and the like
        if (!isFinite(this.scalar)) {
            throw new Error('Number too large: ' + scalarMatch);
        }
    }
    else {
        this.scalar = 1;
    }
    var top = result[2];
    var bottom = result[3];

    var n, x, nx;
    // TODO DRY me
    while ((result = TOP_REGEX.exec(top))) {
        n = parseFloat(result[2]);
        if (isNaN(n)) {
            // Prevents infinite loops
            throw new Error('Unit exponent is not a number');
        }
        // Disallow unrecognized unit even if exponent is 0
        if (n === 0 && !UNIT_TEST_REGEX.test(result[1])) {
            throw createUnrecognizedUnitError(result[1]);
        }
        x = result[1] + ' ';
        nx = '';
        for (var i = 0; i < Math.abs(n) ; i += 1) {
            nx += x;
        }
        if (n >= 0) {
            top = top.replace(result[0], nx);
        }
        else {
            bottom = bottom ? bottom + nx : nx;
            top = top.replace(result[0], '');
        }
    }

    while ((result = BOTTOM_REGEX.exec(bottom))) {
        n = parseFloat(result[2]);
        if (isNaN(n)) {
            // Prevents infinite loops
            throw new Error('Unit exponent is not a number');
        }
        // Disallow unrecognized unit even if exponent is 0
        if (n === 0 && !UNIT_TEST_REGEX.test(result[1])) {
            throw createUnrecognizedUnitError(result[1]);
        }
        x = result[1] + ' ';
        nx = '';
        for (var j = 0; j < n ; j += 1) {
            nx += x;
        }

        bottom = bottom.replace(result[0], nx);
    }

    if (top) {
        this.numerator = parseUnits(top.trim());
    }
    if (bottom) {
        this.denominator = parseUnits(bottom.trim());
    }

};

function throwIncompatibleUnits() {
    throw new Error('Incompatible units');
}
function createUnrecognizedUnitError(unit) {
    var msg = 'Unit ' + unit + ' not recognized.',
        suggestions = suggestionDict.search(unit);

    if (suggestions.length) {
        var imTired = suggestions.groupBy(function (suggestion) {
            return UNITS[UNIT_MAP[suggestion]][2];
        });
        var goAway = Object.keys(imTired).map(function (kind) {
            return '* {0}: {1}'.supplant(kind, imTired[kind].join(', '));
        });

        msg += ' Did you mean:\n' + goAway.join('\n');
    }

    return new Error(msg);
}

Qty.prototype = {
    constructor: Qty,

    isUnitless: function() {
        return isUnityArray(this.numerator) && isUnityArray(this.denominator);
    },

    isCompatible: function(other) {
        if (isString(other)) {
            return this.isCompatible(Qty(other));
        }

        if (!(isQty(other))) {
            return false;
        }

        if (other.signature !== undefined) {
            return this.signature === other.signature;
        }
        else {
            return false;
        }
    },

    isInverse: function(other) {
        return this.inverse().isCompatible(other);
    },

    isBase: function() {
        if (this._isBase !== undefined) {
            return this._isBase;
        }
        if (this.isDegrees() && this.numerator[0].match(/<(kelvin|temp-K)>/)) {
            this._isBase = true;
            return this._isBase;
        }

        this.numerator.concat(this.denominator).forEach(function(item) {
            if (item !== UNITY && BASE_UNITS.indexOf(item) === -1) {
                this._isBase = false;
            }
        }, this);
        if (this._isBase === false) {
            return this._isBase;
        }
        this._isBase = true;
        return this._isBase;
    },

    toBase: function() {
        if (this.isBase()) {
            return this;
        }

        if (this.isTemperature()) {
            return toTempK(this);
        }

        return toBaseUnits(this.numerator, this.denominator).mul(this.scalar);
    },

    units: function() {
        if (this._units !== undefined) {
            return this._units;
        }

        var numIsUnity = isUnityArray(this.numerator),
            denIsUnity = isUnityArray(this.denominator);
        if (numIsUnity && denIsUnity) {
            this._units = '';
            return this._units;
        }

        var numUnits = stringifyUnits(this.numerator),
            denUnits = stringifyUnits(this.denominator);
        this._units = numUnits + (denIsUnity ? '' : ('/' + denUnits));
        return this._units;
    },

    toPrec: function(precQuantity) {
        if (isString(precQuantity)) {
            precQuantity = Qty(precQuantity);
        }
        if (isNumber(precQuantity)) {
            precQuantity = Qty(precQuantity + ' ' + this.units());
        }

        if (!this.isUnitless()) {
            precQuantity = precQuantity.to(this.units());
        }
        else if (!precQuantity.isUnitless()) {
            throwIncompatibleUnits();
        }

        if (precQuantity.scalar === 0) {
            throw new Error('Divide by zero');
        }

        var precRoundedResult = mulSafe(Math.round(this.scalar / precQuantity.scalar),
                                        precQuantity.scalar);

        return Qty(precRoundedResult + this.units());
    },

    toString: function(targetUnitsOrMaxDecimalsOrPrec, maxDecimals) {
        var targetUnits;
        if (isNumber(targetUnitsOrMaxDecimalsOrPrec)) {
            targetUnits = this.units();
            maxDecimals = targetUnitsOrMaxDecimalsOrPrec;
        }
        else if (isString(targetUnitsOrMaxDecimalsOrPrec)) {
            targetUnits = targetUnitsOrMaxDecimalsOrPrec;
        }
        else if (isQty(targetUnitsOrMaxDecimalsOrPrec)) {
            return this.toPrec(targetUnitsOrMaxDecimalsOrPrec).toString(maxDecimals);
        }

        var out = this.to(targetUnits);

        var outScalar = maxDecimals !== undefined ? round(out.scalar, maxDecimals) : out.scalar;
        out = (outScalar + ' ' + out.units()).trim();
        return out;
    },

    inverse: function() {
        if (this.isTemperature()) {
            throw new Error('Cannot divide with temperatures');
        }
        if (this.scalar === 0) {
            throw new Error('Divide by zero');
        }
        return Qty({
            scalar: 1 / this.scalar,
            numerator: this.denominator,
            denominator: this.numerator
        });
    },

    isDegrees: function() {
        return (this.signature === null || this.signature === 400) &&
            this.numerator.length === 1 &&
            isUnityArray(this.denominator) &&
            (this.numerator[0].match(/<temp-[CFRK]>/) || this.numerator[0].match(/<(kelvin|celsius|rankine|fahrenheit)>/));
    },

    isTemperature: function() {
        return this.isDegrees() && this.numerator[0].match(/<temp-[CFRK]>/);
    },

    to: function(other) {
        var target;

        if (!other) {
            return this;
        }

        if (!isString(other)) {
            return this.to(other.units());
        }

        target = Qty(other);
        if (target.units() === this.units()) {
            return this;
        }

        if (!this.isCompatible(target)) {
            if (this.isInverse(target)) {
                target = this.inverse().to(other);
            }
            else {
                throw new Error('Cannot convert ' + stuff(this) + ' to ' + stuff(target) + '.');
            }
        }
        else if (target.isTemperature()) {
            target = toTemp(this, target);
        }
        else if (target.isDegrees()) {
            target = toDegrees(this, target);
        }
        else {
            var q = divSafe(this.baseScalar, target.baseScalar);
            target = Qty({
                scalar: q,
                numerator: target.numerator,
                denominator: target.denominator
            });
        }

        return target;

        // zirak: I give up. It's really late. Or early. I don't know. I want
        // to cry.
        function stuff(qty) {
            var up, down;

            up = singularStuff(qty.numerator);

            if (isUnityArray(qty.denominator)) {
                return up;
            }

            down = singularStuff(qty.denominator);

            return up + '/' + down;

            function singularStuff(thingy) {
                return thingy.length === 1 ?
                    thingy[0] :
                    '(' + thingy.join('*') + ')';
            }
        }
    },

    mul: function(other) {
        if (isNumber(other)) {
            return Qty({
                scalar: mulSafe(this.scalar, other),
                numerator: this.numerator,
                denominator: this.denominator
            });
        }
        else if (isString(other)) {
            other = Qty(other);
        }

        if ((this.isTemperature() || other.isTemperature()) && !(this.isUnitless() || other.isUnitless())) {
            throw new Error('Cannot multiply by temperatures');
        }

        var op1 = this;
        var op2 = other;

        if (op1.isCompatible(op2) && op1.signature !== 400) {
            op2 = op2.to(op1);
        }
        var numden = cleanTerms(op1.numerator.concat(op2.numerator), op1.denominator.concat(op2.denominator));

        return Qty({
            scalar: mulSafe(op1.scalar, op2.scalar),
            numerator: numden[0],
            denominator: numden[1]
        });
    }
};

function toBaseUnits (numerator, denominator) {
    var num = [];
    var den = [];
    var q = 1;
    var unit;
    for (var i = 0; i < numerator.length; i += 1) {
        unit = numerator[i];
        if (PREFIX_VALUES[unit]) {
            q = mulSafe(q, PREFIX_VALUES[unit]);
        }
        else if (UNIT_VALUES[unit]) {
            q *= UNIT_VALUES[unit].scalar;

            if (UNIT_VALUES[unit].numerator) {
                num.push(UNIT_VALUES[unit].numerator);
            }
            if (UNIT_VALUES[unit].denominator) {
                den.push(UNIT_VALUES[unit].denominator);
            }
        }
    }
    for (var j = 0; j < denominator.length; j += 1) {
        unit = denominator[j];
        if (PREFIX_VALUES[unit]) {
            q /= PREFIX_VALUES[unit];
        }
        else if (UNIT_VALUES[unit]) {
            q /= UNIT_VALUES[unit].scalar;

            if (UNIT_VALUES[unit].numerator) {
                den.push(UNIT_VALUES[unit].numerator);
            }
            if (UNIT_VALUES[unit].denominator) {
                num.push(UNIT_VALUES[unit].denominator);
            }
        }
    }

    num = num.reduce(function(a, b) {
        return a.concat(b);
    }, []);
    den = den.reduce(function(a, b) {
        return a.concat(b);
    }, []);

    return Qty({
        scalar: q,
        numerator: num,
        denominator: den
    });
}

function parseUnits(units) {
    var unitMatch, normalizedUnits = [];
    if (!UNIT_TEST_REGEX.test(units)) {
        throw createUnrecognizedUnitError(units);
    }

    while ((unitMatch = UNIT_MATCH_REGEX.exec(units))) {
        normalizedUnits.push(unitMatch.slice(1));

    }
    normalizedUnits = normalizedUnits.map(function(item) {
        return PREFIX_MAP[item[0]] ? [PREFIX_MAP[item[0]], UNIT_MAP[item[1]]] : [UNIT_MAP[item[1]]];
    });

    normalizedUnits = normalizedUnits.reduce(function(a, b) {
        return a.concat(b);
    }, []);
    normalizedUnits = normalizedUnits.filter(function(item) {
        return item;
    });

    return normalizedUnits;
}

function stringifyUnits(units) {
    var stringified;

    var isUnity = isUnityArray(units);
    if (isUnity) {
        stringified = '1';
    }
    else {
        stringified = simplify(getOutputNames(units)).join('*');
    }

    return stringified;
}

function getOutputNames(units) {
    var unitNames = [], token, tokenNext;
    for (var i = 0; i < units.length; i += 1) {
        token = units[i];
        tokenNext = units[i + 1];
        if (PREFIX_VALUES[token]) {
            unitNames.push(OUTPUT_MAP[token] + OUTPUT_MAP[tokenNext]);
            i += 1;
        }
        else {
            unitNames.push(OUTPUT_MAP[token]);
        }
    }
    return unitNames;
}

function simplify (units) {
    var unitCounts = units.reduce(function(acc, unit) {
        var unitCounter = acc[unit];
        if (!unitCounter) {
            acc.push(unitCounter = acc[unit] = [unit, 0]);
        }

        unitCounter[1] += 1;

        return acc;
    }, []);

    return unitCounts.map(function(unitCount) {
        return unitCount[0] + (unitCount[1] > 1 ? unitCount[1] : '');
    });
}

function isUnityArray(arr) {
    return arr.length === 1 && arr[0] === UNITY_ARRAY[0];
}

function round(val, decimals) {
    return Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function toDegrees(src, dst) {
    var srcDegK = toDegK(src);
    var dstUnits = dst.units();
    var dstScalar;

    if (dstUnits === 'degK') {
        dstScalar = srcDegK.scalar;
    }
    else if (dstUnits === 'degC') {
        dstScalar = srcDegK.scalar ;
    }
    else if (dstUnits === 'degF') {
        dstScalar = srcDegK.scalar * 9 / 5;
    }
    else if (dstUnits === 'degR') {
        dstScalar = srcDegK.scalar * 9 / 5;
    }
    else {
        throw new Error('Unknown type for degree conversion to: ' + dstUnits);
    }

    return Qty({
        scalar: dstScalar,
        numerator: dst.numerator,
        denominator: dst.denominator
    });
}

function toDegK(qty) {
    var units = qty.units();
    var q;
    if (units.match(/(deg)[CFRK]/)) {
        q = qty.baseScalar;
    }
    else if (units === 'tempK') {
        q = qty.scalar;
    }
    else if (units === 'tempC') {
        q = qty.scalar;
    }
    else if (units === 'tempF') {
        q = qty.scalar * 5 / 9;
    }
    else if (units === 'tempR') {
        q = qty.scalar * 5 / 9;
    }
    else {
        throw new Error('Unknown type for temp conversion from: ' + units);
    }

    return Qty({
        scalar: q,
        numerator: ['<kelvin>'],
        denominator: UNITY_ARRAY
    });
}

function toTemp(src, dst) {
    var dstUnits = dst.units();
    var dstScalar;

    if (dstUnits === 'tempK') {
        dstScalar = src.baseScalar;
    }
    else if (dstUnits === 'tempC') {
        dstScalar = src.baseScalar - 273.15;
    }
    else if (dstUnits === 'tempF') {
        dstScalar = (src.baseScalar * 9 / 5) - 459.67;
    }
    else if (dstUnits === 'tempR') {
        dstScalar = src.baseScalar * 9 / 5;
    }
    else {
        throw new Error('Unknown type for temp conversion to: ' + dstUnits);
    }

    return Qty({
        scalar: dstScalar,
        numerator: dst.numerator,
        denominator: dst.denominator
    });
}

function toTempK(qty) {
    var units = qty.units();
    var q;
    if (units.match(/(deg)[CFRK]/)) {
        q = qty.baseScalar;
    }
    else if (units === 'tempK') {
        q = qty.scalar;
    }
    else if (units === 'tempC') {
        q = qty.scalar + 273.15;
    }
    else if (units === 'tempF') {
        q = (qty.scalar + 459.67) * 5 / 9;
    }
    else if (units === 'tempR') {
        q = qty.scalar * 5 / 9;
    }
    else {
        throw new Error('Unknown type for temp conversion from: ' + units);
    }

    return Qty({
        scalar: q,
        numerator: ['<temp-K>'],
        denominator: UNITY_ARRAY
    });
}

function mulSafe() {
    var result = 1, decimals = 0;
    for (var i = 0; i < arguments.length; i += 1) {
        var arg = arguments[i];
        decimals = decimals + getFractional(arg);
        result *= arg;
    }

    return decimals !== 0 ? round(result, decimals) : result;
}

function divSafe(num, den) {
    if (den === 0) {
        throw new Error('Divide by zero');
    }

    var factor = Math.pow(10, getFractional(den));
    var invDen = factor / (factor * den);

    return mulSafe(num, invDen);
}

function getFractional(num) {
    // Check for NaNs or Infinities
    if (!isFinite(num)) {
        return 0;
    }

    // Faster than parsing strings
    // http://jsperf.com/count-decimals/2
    var count = 0;
    while (num % 1 !== 0) {
        num *= 10;
        count += 1;
    }
    return count;
}

Qty.mulSafe = mulSafe;
Qty.divSafe = divSafe;

function cleanTerms(num, den) {
    num = num.filter(function(val) {
        return val !== UNITY;
    });
    den = den.filter(function(val) {
        return val !== UNITY;
    });

    var combined = {};

    var k;
    for (var i = 0; i < num.length; i += 1) {
        if (PREFIX_VALUES[num[i]]) {
            k = [num[i], num[i + 1]];
            i += 1;
        }
        else {
            k = num[i];
        }
        if (k && k !== UNITY) {
            if (combined[k]) {
                combined[k][0] += 1;
            }
            else {
                combined[k] = [1, k];
            }
        }
    }

    for (var j = 0; j < den.length; j += 1) {
        if (PREFIX_VALUES[den[j]]) {
            k = [den[j], den[j + 1]];
            j += 1;
        }
        else {
            k = den[j];
        }
        if (k && k !== UNITY) {
            if (combined[k]) {
                combined[k][0] -= 1;
            }
            else {
                combined[k] = [-1, k];
            }
        }
    }

    num = [];
    den = [];

    for (var prop in combined) {
        if (combined.hasOwnProperty(prop)) {
            var item = combined[prop];
            var n;
            if (item[0] > 0) {
                for (n = 0; n < item[0]; n += 1) {
                    num.push(item[1]);
                }
            }
            else if (item[0] < 0) {
                for (n = 0; n < -item[0]; n += 1) {
                    den.push(item[1]);
                }
            }
        }
    }

    if (num.length === 0) {
        num = UNITY_ARRAY;
    }
    if (den.length === 0) {
        den = UNITY_ARRAY;
    }

    // Flatten
    num = num.reduce(function(a, b) {
        return a.concat(b);
    }, []);
    den = den.reduce(function(a, b) {
        return a.concat(b);
    }, []);

    return [num, den];
}

function isString(value) {
    return typeof value === 'string' || value instanceof String;
}

/*
 * Prefer stricter Number.isFinite if currently supported.
 * To be dropped when ES6 is finalized. Obsolete browsers will
 * have to use ES6 polyfills.
 */
var isFinite = Number.isFinite || window.isFinite;
function isNumber(value) {
    // Number.isFinite allows not to consider NaN or '1' as numbers
    return isFinite(value);
}

function isQty(value) {
    return value instanceof Qty;
}

function isDefinitionObject(value) {
    return value && typeof value === 'object' && value.hasOwnProperty('scalar');
}

Qty.version = '1.6.2';
