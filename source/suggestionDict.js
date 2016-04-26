// a Trie suggestion dictionary, made by Esailija (small fixes by God)
// http://stackoverflow.com/users/995876/esailija
// used in the "command not found" message to show you closest commands

function TrieNode() {
    this.word = null;
    this.children = {};
}

TrieNode.prototype.add = function(word) {
    var node = this, char;

    for (var i = 0; i < word.length; i += 1) {
        char = word.charAt(i);
        if (!(char in node.children)) {
            node.children[char] = new TrieNode();
        }

        node = node.children[char];
    }

    node.word = word;
};

TrieNode.prototype.del = function(word, i) {
    i = i || 0;
    var node = this;
    var char = word[i];
    i += 1;

    // recursively delete all trie nodes that are left empty after removing
    // the command from the leaf
    var child = node.children[char];
    if (child) {
        child.del(word, i);

        if (!Object.keys(child.children).length && child.word === null) {
            delete node.children[char];
        }
    }

    if (node.word === word) {
        node.word = null;
    }
};

// Having a small maxCost will increase performance greatly, experiment with
// values of 1-3
function SuggestionDictionary (maxCost) {
    if (!(this instanceof SuggestionDictionary)) {
        throw new TypeError('Illegal function call');
    }

    maxCost = Number(maxCost);

    if (isNaN(maxCost) || maxCost < 1) {
        throw new TypeError('maxCost must be an integer > 1 ');
    }

    this.maxCost = maxCost;
    this.trie = new TrieNode();
}

SuggestionDictionary.prototype = {
    constructor: SuggestionDictionary,

    build: function (words) {
        if (!Array.isArray(words)) {
            throw new TypeError('Cannot build a dictionary from '+words);
        }

        this.trie = new TrieNode();

        words.forEach(function (word) {
            this.trie.add(word);
        }, this);
    },

    __sortfn: function (a, b) {
        return a[1] - b[1];
    },

    search: function (word) {
        word = word.valueOf();
        var r;

        if (typeof word !== 'string') {
            throw new TypeError('Cannot search ' + word);
        }
        if (this.trie === undefined) {
            throw new TypeError('Cannot search, dictionary isn\'t built yet');
        }

        r = search(word, this.maxCost, this.trie);
        // r will be array of arrays:
        // ["word", cost], ["word2", cost2], ["word3", cost3] , ..

        // Sort the results in order of least cost
        r.sort(this.__sortfn);


        return r.map(function (subarr) {
            return subarr[0];
        });
    }
};

function range(x, y) {
    var r = [], i, l, start;

    if (y === undefined) {
        start = 0;
        l = x;
    }
    else {
        start = x;
        l = y-start;
    }

    for (i = 0; i < l; i += 1) {
        r[i] = start;
        start += 1;
    }

    return r;

}

function search(word, maxCost, trie) {
    var results = [],
        currentRow = range(word.length + 1);


    Object.keys(trie.children).forEach(function (letter) {
        searchRecursive(
        trie.children[letter], letter, word,
        currentRow, results, maxCost);
    });

    return results;
}


function searchRecursive(node, letter, word, previousRow, results, maxCost) {
    var columns = word.length + 1,
        currentRow = [previousRow[0] + 1],
        i, insertCost, deleteCost, replaceCost, last;

    for (i = 1; i < columns; i += 1) {

        insertCost = currentRow[i-1] + 1;
        deleteCost = previousRow[i] + 1;

        if (word.charAt(i-1) !== letter) {
            replaceCost = previousRow[i-1]+1;

        }
        else {
            replaceCost = previousRow[i-1];
        }

        currentRow.push(Math.min(insertCost, deleteCost, replaceCost));
    }

    last = currentRow[currentRow.length-1];
    if (last <= maxCost && node.word !== null) {
        results.push([node.word, last]);
    }

    if (Math.min.apply(Math, currentRow) <= maxCost) {
        Object.keys(node.children).forEach(function (letter) {
            searchRecursive(
            node.children[letter], letter, word,
            currentRow, results, maxCost);
        });
    }
}

exports.SuggestionDictionary = SuggestionDictionary;
