import { marked } from 'marked';
import { encode } from 'html-entities';

import resource from './resource.js';
import markdown from './markdown.js';

async function parseQuotes() {
    const quotesFile = (await resource('quotes.txt')).toString();;
    const quotes: { content: string, type: string, cite?: string }[] = [];
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
            quotes.at(-1)!.content = quotes.at(-1)!.content.trim();
            quotes.at(-1)!.cite = line.substring(4);
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

        quotes.at(-1)!.content += line + '\n';
    }

    return quotes;
}

export default async () => {
    await markdown();

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
