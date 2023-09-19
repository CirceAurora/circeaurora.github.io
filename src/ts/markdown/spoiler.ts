import { TokenizerAndRendererExtension } from "marked";

const extension: TokenizerAndRendererExtension = {
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
        const content = token.raw.match(/\|\|.+?\|\|/)![0];
        return `${content.substring(0, content.length - 2).substring(2)}`
    }
}

export default extension;
