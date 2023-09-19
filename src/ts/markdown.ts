import { TokenizerAndRendererExtension, marked } from "marked";
import fs from "fs/promises";
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import path from 'path'

export default async () => {
    const extensions: TokenizerAndRendererExtension[] = await Promise.all((await fs.readdir(path.join(__dirname, "markdown"))).map(async file => (await import(`./markdown/${file}`)).default));

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
