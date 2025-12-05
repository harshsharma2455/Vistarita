export interface ThemeDefinition {
    id: string;
    label: string;
    colors: {
        background: string;
        foreground: string;
        muted: string;
        primary: string;
        primaryForeground: string;
        border: string;
        ring: string; // Selection ring
    };
    sidebar: {
        background: string;
        foreground: string;
        border: string;
        activeBackground: string;
        activeForeground: string;
    };
    canvas: {
        background: string;
        dotColor: string;
        gridColor?: string;
    };
    node: {
        noteBg: string; // Sticky note default
        shapeBg: string; // Shape default
        border: string;
        text: string;
        shadow: string;
    };
}

export const themeRegistry: Record<string, ThemeDefinition> = {
    // 1. Notion Light
    light: {
        id: 'light',
        label: 'Notion Light',
        colors: {
            background: '#FFFFFF',
            foreground: '#37352F',
            muted: '#9B9A97',
            primary: '#2EAADC',
            primaryForeground: '#FFFFFF',
            border: '#ECDED0', // Warm notion border
            ring: '#2EAADC',
        },
        sidebar: {
            background: '#F7F6F3',
            foreground: '#37352F',
            border: '#E9E9E8',
            activeBackground: '#E8E7E4',
            activeForeground: '#37352F',
        },
        canvas: {
            background: '#FFFFFF',
            dotColor: '#E5E5E5',
        },
        node: {
            noteBg: '#FFF7D6', // Classic yellow note
            shapeBg: '#F0F0F0',
            border: '#E0E0E0',
            text: '#37352F',
            shadow: 'rgba(15, 15, 15, 0.05)',
        },
    },

    // 2. Linear Dark
    linear: {
        id: 'linear',
        label: 'Linear Dark',
        colors: {
            background: '#0F1115',
            foreground: '#F7F8F8',
            muted: '#8A8F98',
            primary: '#5E6AD2',
            primaryForeground: '#FFFFFF',
            border: '#22252B',
            ring: '#5E6AD2',
        },
        sidebar: {
            background: '#13151A',
            foreground: '#D0D3D6',
            border: '#22252B',
            activeBackground: '#262931',
            activeForeground: '#FFFFFF',
        },
        canvas: {
            background: '#0F1115',
            dotColor: '#282B32',
        },
        node: {
            noteBg: '#1A1D23',
            shapeBg: '#181A1F',
            border: '#2E323A',
            text: '#F7F8F8',
            shadow: 'rgba(0, 0, 0, 0.5)',
        },
    },

    // 3. Nord
    nord: {
        id: 'nord',
        label: 'Nord',
        colors: {
            background: '#2E3440',
            foreground: '#D8DEE9',
            muted: '#4C566A',
            primary: '#88C0D0',
            primaryForeground: '#2E3440',
            border: '#434C5E',
            ring: '#88C0D0',
        },
        sidebar: {
            background: '#3B4252',
            foreground: '#D8DEE9',
            border: '#4C566A',
            activeBackground: '#434C5E',
            activeForeground: '#88C0D0',
        },
        canvas: {
            background: '#2E3440',
            dotColor: '#4C566A',
        },
        node: {
            noteBg: '#3B4252',
            shapeBg: '#4C566A',
            border: '#434C5E',
            text: '#ECEFF4',
            shadow: 'rgba(0, 0, 0, 0.2)',
        },
    },

    // 4. Dracula
    dracula: {
        id: 'dracula',
        label: 'Dracula',
        colors: {
            background: '#282A36',
            foreground: '#F8F8F2',
            muted: '#6272A4',
            primary: '#FF79C6',
            primaryForeground: '#282A36',
            border: '#44475A',
            ring: '#FF79C6',
        },
        sidebar: {
            background: '#21222C',
            foreground: '#F8F8F2',
            border: '#44475A',
            activeBackground: '#44475A',
            activeForeground: '#50FA7B',
        },
        canvas: {
            background: '#282A36',
            dotColor: '#44475A',
        },
        node: {
            noteBg: '#21222C',
            shapeBg: '#44475A',
            border: '#6272A4',
            text: '#F8F8F2',
            shadow: 'rgba(0, 0, 0, 0.3)',
        },
    },

    // 5. Solarized Light
    solarized: {
        id: 'solarized',
        label: 'Solarized Light',
        colors: {
            background: '#FDF6E3',
            foreground: '#657B83',
            muted: '#93A1A1',
            primary: '#268BD2',
            primaryForeground: '#FDF6E3',
            border: '#E0DCC7', // Slightly darker than bg
            ring: '#268BD2',
        },
        sidebar: {
            background: '#EEE8D5',
            foreground: '#586E75',
            border: '#D8D3C0',
            activeBackground: '#D3CBB3',
            activeForeground: '#B58900',
        },
        canvas: {
            background: '#FDF6E3',
            dotColor: '#D8D3C0',
        },
        node: {
            noteBg: '#FEFBF3',
            shapeBg: '#EEE8D5',
            border: '#D3CBB3',
            text: '#586E75',
            shadow: 'rgba(101, 123, 131, 0.1)',
        },
    },

    // 6. Gruvbox Dark
    gruvbox: {
        id: 'gruvbox',
        label: 'Gruvbox',
        colors: {
            background: '#282828',
            foreground: '#EBDBB2',
            muted: '#928374',
            primary: '#FE8019',
            primaryForeground: '#282828',
            border: '#3C3836',
            ring: '#FE8019',
        },
        sidebar: {
            background: '#1D2021',
            foreground: '#A89984',
            border: '#3C3836',
            activeBackground: '#3C3836',
            activeForeground: '#FB4934',
        },
        canvas: {
            background: '#282828',
            dotColor: '#504945',
        },
        node: {
            noteBg: '#1D2021',
            shapeBg: '#3C3836',
            border: '#504945',
            text: '#EBDBB2',
            shadow: 'rgba(0, 0, 0, 0.4)',
        },
    },

    // 7. Catppuccin Mocha
    catppuccin: {
        id: 'catppuccin',
        label: 'Catppuccin',
        colors: {
            background: '#1E1E2E',
            foreground: '#CDD6F4',
            muted: '#6C7086',
            primary: '#CBA6F7',
            primaryForeground: '#1E1E2E',
            border: '#313244',
            ring: '#CBA6F7',
        },
        sidebar: {
            background: '#181825',
            foreground: '#A6ADC8',
            border: '#313244',
            activeBackground: '#313244',
            activeForeground: '#CBA6F7',
        },
        canvas: {
            background: '#1E1E2E',
            dotColor: '#45475A',
        },
        node: {
            noteBg: '#181825',
            shapeBg: '#313244',
            border: '#45475A',
            text: '#CDD6F4',
            shadow: 'rgba(20, 20, 30, 0.3)',
        },
    },

    // 8. Tokyo Night
    tokyo: {
        id: 'tokyo',
        label: 'Tokyo Night',
        colors: {
            background: '#1A1B26',
            foreground: '#C0CAF5',
            muted: '#565F89',
            primary: '#7AA2F7',
            primaryForeground: '#1A1B26',
            border: '#24283B',
            ring: '#7AA2F7',
        },
        sidebar: {
            background: '#16161E',
            foreground: '#787C99',
            border: '#24283B',
            activeBackground: '#292E42',
            activeForeground: '#7AA2F7',
        },
        canvas: {
            background: '#1A1B26',
            dotColor: '#24283B',
        },
        node: {
            noteBg: '#16161E',
            shapeBg: '#24283B',
            border: '#414868',
            text: '#C0CAF5',
            shadow: 'rgba(0, 0, 0, 0.4)',
        },
    },

    // 9. Monokai Pro
    monokai: {
        id: 'monokai',
        label: 'Monokai Pro',
        colors: {
            background: '#2D2A2E',
            foreground: '#FCFCFA',
            muted: '#727072',
            primary: '#FFD866',
            primaryForeground: '#2D2A2E',
            border: '#403E41',
            ring: '#FFD866',
        },
        sidebar: {
            background: '#221F22',
            foreground: '#939293',
            border: '#403E41',
            activeBackground: '#403E41',
            activeForeground: '#FF6188',
        },
        canvas: {
            background: '#2D2A2E',
            dotColor: '#403E41',
        },
        node: {
            noteBg: '#221F22',
            shapeBg: '#403E41',
            border: '#5B595C',
            text: '#FCFCFA',
            shadow: 'rgba(0, 0, 0, 0.4)',
        },
    },

    // 10. Blueprint
    blueprint: {
        id: 'blueprint',
        label: 'Blueprint',
        colors: {
            background: '#1E3A8A', // Blue 900
            foreground: '#FFFFFF',
            muted: '#93C5FD',
            primary: '#FFFFFF',
            primaryForeground: '#1E3A8A',
            border: '#3B82F6',
            ring: '#FFFFFF',
        },
        sidebar: {
            background: '#172554', // Blue 950
            foreground: '#BFDBFE',
            border: '#3B82F6',
            activeBackground: '#1E40AF',
            activeForeground: '#FFFFFF',
        },
        canvas: {
            background: '#1E3A8A',
            dotColor: '#3B82F6', // Lighter circles
        },
        node: {
            noteBg: '#172554',
            shapeBg: '#1E40AF',
            border: '#60A5FA',
            text: '#FFFFFF',
            shadow: 'rgba(0, 0, 0, 0.3)',
        },
    },
};

export const getTheme = (id: string) => themeRegistry[id] || themeRegistry.light;
