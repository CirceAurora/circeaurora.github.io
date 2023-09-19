import { TokenizerAndRendererExtension } from "marked";

const extension: TokenizerAndRendererExtension = {
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
        const emoji = token.raw.match(/([\w\d\._-]+)/)![0];
        return `<img class="emoji" src="/emojis/${emoji}" alt="${emoji}">`;
    }
}

export default extension;
