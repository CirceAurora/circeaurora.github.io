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
            light: '#FFFFFF80',
            dark: '#00000080',
        },
        background: {
            mode: 'rgb' as InterpolationMode,
            light: {
                color: '#FFFFFF',
                ratio: 0.6
            },
            dark: {
                color: '#000000',
                ratio: 0.6
            },
            alpha: 0.6
        }
    }
}

export default config;
