import { InterpolationMode } from 'chroma-js';

const config: {
    colors: {
        ratio: number,
        padding: number,
        separator: {
            light: string,
            dark: string,
        },
        background: {
            mode: InterpolationMode,
            light: { color: string, ratio: number },
            dark: { color: string, ratio: number },
            alpha: number
        }
    }
} = {
    colors: {
        ratio: 4,
        padding: 2,
        separator: {
            light: '#00000030',
            dark: '#00000060',
        },
        background: {
            mode: 'rgb',
            light: {
                color: '#FFFFFF',
                ratio: 0.75
            },
            dark: {
                color: '#000000',
                ratio: 0.75
            },
            alpha: 0.75
        }
    }
}

export default config;
