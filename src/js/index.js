const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
const path = require('path')
const fs = require('fs/promises');
const sass = require('sass');

const config = require('./config.js')
const quotes = require('./quotes.js')
const resource = require('./resource.js');
const gradient = require('./gradient.js')

module.exports = async function () {
    await resource('index.html')
        .then(async (r) => r.replaceFile('<!-- about -->', 'about.html'))
        .then(async (r) => r.replace('<!-- quotes -->', await quotes()))
        .then(async (r) => r.write('index.html'));

    await resource('index.scss')
        .then(async (r) => r.replaceAll('/* light background gradient */', 'background: linear-gradient(200deg, ' + (await gradient(true))
            .mix(config.colors.background.light.color, config.colors.background.light.ratio)
            .alpha(config.colors.background.alpha)
            .toString() + ');'))
        .then(async (r) => r.replaceAll('/* dark background gradient */', 'background: linear-gradient(200deg, ' + (await gradient(false))
            .mix(config.colors.background.dark.color, config.colors.background.dark.ratio)
            .alpha(config.colors.background.alpha)
            .toString() + ');'))
        .then(async (r) => r.replace('/* light border gradient */', 'background: linear-gradient(200deg, ' + (await gradient(true)).toString() + ') border-box;'))
        .then(async (r) => r.replace('/* dark border gradient */', 'background: linear-gradient(200deg, ' + (await gradient(false)).toString() + ') border-box;'))
        .then(async (r) => r.process(scss => sass.compileString(scss).css))
        .then(async (r) => r.process(async css => await postcss([autoprefixer({ grid: 'autoplace', overrideBrowserslist: 'last 4 version' })])
            .process(css, { from: undefined, to: undefined })
            .then(result => {
                result.warnings().forEach(warn => {
                    console.warn(warn.toString())
                })
                return result.css;
            })))
        .then(async (r) => r.write('index.css'));

    await fs.cp(path.join(__dirname, '..', 'static', '.'), path.join(__dirname, '..', '..', 'site'), { recursive: true, force: true });
}
