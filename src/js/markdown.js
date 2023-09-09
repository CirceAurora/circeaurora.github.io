const { markedHighlight } = require('marked-highlight');
const hljs = require('highlight.js');
const path = require('path')
const fs = require('fs/promises')

module.exports = async (marked) => {
    const extensions = (await fs.readdir(path.join(__dirname, "markdown"))).map(file => require(`./markdown/${file}`));

    marked.use(markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        }
    }), {
        renderer: {
            heading(text, level, raw) {
                return raw;
            }
        },
        extensions
    });
}
