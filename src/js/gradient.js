const chroma = require('chroma-js');

const resource = require('./resource.js');
const config = require('./config.js')

const colors = resource('color-list.txt').then(file => file.toString().split(/\n{2,}/g)
    .map(s => s.split("\n")
        .filter(s => !s.startsWith("##") && s.trim() !== "")));

class Gradient {
    constructor(flags, separator, ratio) {
        const trueRatio = ratio + 1;
        const segments = (flags.length * trueRatio) + 1 + (config.colors.padding * 2);
        const separatorChroma = chroma(separator);

        this.gradient = [];

        function segment(index, size, func) {
            const start = 100 * (index) / (segments);
            const end = 100 * (index + size) / (segments);

            func(start, end, end - start);
        }

        flags.forEach((flag, flagIndex) => {
            const segmentIndex = flagIndex * trueRatio + config.colors.padding;

            segment(segmentIndex, 1, (start, end) => {
                this.gradient.push({ color: separatorChroma, start, end });
            })

            segment(segmentIndex + 1, trueRatio - 1, (start, end, length) => {
                flag.forEach((color, colorIndex) => {
                    const colorStart = start + length * colorIndex / flag.length
                    const colorEnd = start + length * (colorIndex + 1) / flag.length

                    this.gradient.push({ color: chroma(color), start: colorStart, end: colorEnd });
                });
            })
        });

        segment(flags.length * trueRatio, 1 + config.colors.padding, (start, end) => {
            this.gradient.push({ color: separatorChroma, start, end });
        })
    }

    mix(color, ratio) {
        this.gradient = this.gradient.map(segment => {
            return {
                ...segment,
                color: chroma.mix(segment.color, chroma(color), ratio, config.colors.background.mode)
            };
        });

        return this;
    }

    alpha(multiplier) {
        this.gradient = this.gradient.map(segment => {
            return {
                ...segment,
                color: segment.color.alpha(segment.color.alpha() * multiplier)
            };
        });

        return this;
    }

    toString() {
        return this.gradient.map((segment) => `rgba(${segment.color.rgba()}) ${segment.start}% ${segment.end}%`).join(', ');
    }
}

module.exports = async (isLight) => {
    return new Gradient(await colors, isLight ? config.colors.separator.light : config.colors.separator.dark, config.colors.ratio);
}
