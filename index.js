const fs = require('fs/promises');
const { marked } = require('marked');
const { markedHighlight } = require('marked-highlight');
const hljs = require('highlight.js');
const chroma = require('chroma-js')

const flagSeperator = "#FFFFFF80"

async function main() {
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
        extensions: [{
            name: 'emoji-block',
            level: 'block',
            start(src) {
                return src.match(/(^|\n)(?::[\w\d\._-]+\.(?:png|jpg|jpeg|webp|gif):[^\S\n]*){1,}(?:\n|$)/)?.index;
            },
            tokenizer(src) {
                const match = src.match(/^(?::[\w\d\._-]+\.(?:png|jpg|jpeg|webp|gif):[^\S\n]*){1,}(?:\n|$)/);

                if (match) {
                    return {
                        type: 'emoji-block',
                        raw: match[0]
                    };
                }
            },
            renderer(token) {
                return `<div>${token.raw.match(/([\w\d\._-]+)/g).map(emoji => `<img src="/emojis/${emoji}" alt="${emoji}">`).join('')}</div>\n`;
            }
        }, {
            name: 'emoji-inline',
            level: 'inline',
            start(src) {
                return src.match(/:[\w\d\._-]+\.(?:png|jpg|jpeg|webp|gif):/)?.index;
            },
            tokenizer(src) {
                const match = src.match(/^:[\w\d\._-]+\.(?:png|jpg|jpeg|webp|gif):/);

                if (match) {
                    return {
                        type: 'emoji-inline',
                        raw: match[0]
                    };
                }
            },
            renderer(token) {
                const emoji = token.raw.match(/([\w\d\._-]+)/)[0];
                return `<img src="/emojis/${emoji}" alt="${emoji}">`;
            }
        }, {
            name: 'spoiler',
            level: 'inline',
            start(src) {
                return src.match(/\|\|.+?\|\|/)?.index;
            },
            tokenizer(src) {
                const match = src.match(/^\|\|.+?\|\|/);

                if (match) {
                    return {
                        type: 'spoiler',
                        raw: match[0]
                    };
                }
            },
            renderer(token) {
                const content = token.raw.match(/\|\|.+?\|\|/)[0];
                return `${content.substring(0, content.length - 2).substring(2)}`
            }
        }]
    });

    try {
        const quotesFile = (await fs.readFile('quotes.txt', { encoding: 'utf8' }));
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

        let quotesHtml = '';

        quotes.forEach(quote => {
            quotesHtml += '<blockquote><div><div>';

            switch (quote.type) {
                case 'md':
                    quotesHtml += marked.parse(quote.content);
                    break;
                case 'html':
                    quotesHtml += quote.content;
                    break;
            }

            quotesHtml += '<cite>'
            quotesHtml += quote.cite;
            quotesHtml += '</cite></div></div></blockquote>';
        });

        const aboutFile = (await fs.readFile('about.html', { encoding: 'utf8' }));
        const htmlFile = (await fs.readFile('index.html', { encoding: 'utf8' }))
            .replace('<!-- about -->', aboutFile)
            .replace('<!-- quotes -->', quotesHtml);

        await fs.mkdir('site');
        await fs.writeFile('site/index.html', htmlFile);
    } catch (err) {
        throw err;
    }

    try {
        const flags = (await fs.readFile('color-list.txt', { encoding: 'utf8' })).split(/\n{2,}/g).map(s => s.split("\n").filter(s => !s.startsWith("##") && s.trim() !== ""));
        const trueFlagLength = flags.length * 3 + 1;

        let borderGradient = '';
        let backgroundGradient = '';

        flags.forEach((flag, flagIndex) => {
            const trueFlagIndex = flagIndex * 3;

            const start = 100 * (trueFlagIndex) / (trueFlagLength);
            const end = 100 * (trueFlagIndex + 1) / (trueFlagLength);

            borderGradient += `, rgba(${chroma(flagSeperator).rgba()}) ${start}% ${end}%`
            backgroundGradient += `, rgba(${chroma.mix(flagSeperator, 'white', 0.6, 'rgb').alpha(0.6).rgba()}) ${start}% ${end}%`;

            flag.forEach((segment, segmentIndex) => {
                const start = 100 * ((trueFlagIndex + 1) * flag.length + segmentIndex * 2) / (trueFlagLength) / flag.length;
                const end = 100 * ((trueFlagIndex + 1) * flag.length + segmentIndex * 2 + 2) / (trueFlagLength) / flag.length;

                borderGradient += `, rgba(${chroma(segment).rgba()}) ${start}% ${end}%`;
                backgroundGradient += `, rgba(${chroma.mix(segment, 'white', 0.6, 'rgb').alpha(0.6).rgba()}) ${start}% ${end}%`;
            });
        });

        const cssFile = (await fs.readFile('index.css', { encoding: 'utf8' }))
            .replaceAll('/* border gradient */', borderGradient.substring(2))
            .replaceAll('/* background gradient */', backgroundGradient.substring(2))

        await fs.writeFile('site/index.css', cssFile);
    } catch (err) {
        throw err;
    }

    try {
        await fs.cp('emojis', 'site/emojis', { recursive: true });
        await fs.cp('images', 'site/images', { recursive: true });
    } catch (err) {
        throw err;
    }
}

main();
