var browserify = require('browserify'),
    uglify = require('uglify-js'),

    fs = require('fs'),
    path = require('path');

// yer a wizard Caprica
var wizard = browserify({
    basedir: 'source',
    paths: ['.', './source', './static']
});

wizard.add('util.js');
wizard.add('bot.js');

var plugins = getJSFiles('source/plugins'),
    pluginLoaderPath = '_plugin-loader.js';

fs.writeFileSync('source/' + pluginLoaderPath, generatePluginLoader(plugins));
wizard.add(pluginLoaderPath);

console.log('Bundling...');
wizard.bundle((err, buff) => {
    if (err) {
        console.error('Oh noes!');
        console.error(err);
        return;
    }

    console.log('writing master.js...');
    fs.writeFile('master.js', buff, function () {
        console.log('wrote master.js');
    });

    console.log('minifying...');
    var minified = uglify.minify(buff.toString('utf8'), { fromString: true });
    console.log('Minified. Writing master.min.js...');
    fs.writeFile('master.min.js', minified.code, () => {
        console.log('wrote master.min.js');
    });

    fs.unlink('source/' + pluginLoaderPath);
});

function getJSFiles(dirPath) {
    var fullPath = path.resolve(dirPath);

    var paths = fs.readdirSync(fullPath)
        .filter(file => file.endsWith('.js') || file.endsWith('.json'))
        .map(file => path.resolve(fullPath, file));

    paths.forEach(p => console.log('\t', p));
    return paths;
}

function generatePluginLoader(plugins) {
    var loaders = plugins.map(
        plugin => `require("plugins/${path.basename(plugin)}")(bot);`
    ).join('\n');

    return `module.exports = function (bot) {
${loaders}
};`;
}
