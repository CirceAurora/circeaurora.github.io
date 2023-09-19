import { TokenizerAndRendererExtension } from "marked";

const extension: TokenizerAndRendererExtension = {
    name: 'emoji-block',
    level: 'block',
    start(src): number | undefined {
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
        return `<div>${token.raw.match(/([\w\d\._-]+)/g)!.map(emoji => `<img src="/emojis/${emoji}" alt="${emoji}">`).join('')}</div>\n`;
    }
}

export default extension;
