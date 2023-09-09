const { marked } = require('marked');
const path = require('path');
const fs = require('fs/promises');
const {encode} = require('html-entities');

const resource = require('./resource.js');
const markdown = require('./markdown.js');

async function parseQuotes() {
    const quotesFile = (await resource('quotes.txt')).toString();;
    const quotes = [];
    const seperator = '----------------';

    const flags = {
        read: false,
        start: false,
    }

    for (const line of quotesFile.split('\n')) {
        if (flags.read === false && line.startsWith(seperator)) {
            quotes.push({ content: '', type: line.substring(seperator.length) || 'md' });
            flags.read = true;
            continue;
        }

        if (flags.read === true && line.startsWith('=-- ')) {
            quotes.at(-1).content = quotes.at(-1).content.trim();
            quotes.at(-1).cite = line.substring(4);
            flags.read = false;
            flags.start = true;
            continue;
        }

        if (flags.read === false) {
            continue;
        }

        if (line.trim() === '') {
            if (!flags.start) {
                continue;
            }
        }

        flags.start = true;

        quotes.at(-1).content += line + '\n';
    }

    return quotes;
}

module.exports = async () => {
    await markdown(marked);

    return (await parseQuotes()).reduce((html, quote) => {
        let output = '<blockquote><div><div>';

        switch (quote.type) {
            case 'md':
                output += marked.parse(quote.content);
                break;
            case 'html':
                output += quote.content;
                break;
        }

        output += '<cite>'
        output += encode(quote.cite);
        output += '</cite></div></div></blockquote>';

        return html + output;
    }, '');
}
