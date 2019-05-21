export const BOARD_SIZE = { x: 6, y: 12, z: 6 };  // x, z must be even
export const CAMERA_POSITION = [14, 15, 14];
export const CAMERA_LOOK_AT = [0, 0, 0];
export const BLOCK_SPEED = 0.01;  // speed of falling blocks
export const INIT_BLOCK_Y = 10;  // initial position of a new block
export const MAX_LAYERS = 8;  // the max safe layers
export const MAX_OPACITY = 0.4;  // of the wall

// theme configuration
export const themes = {
    LIGHT: {
        button: 'el-icon-moon',
        background: 0xccddee,
        blockColors: [0x8cbaff, 0x8cffdd, 0xb2ff8c, 0xff978c]
    },
    DARK: {
        button: 'el-icon-sunny',
        background: 0x0e213c,
        blockColors: [0x395c91, 0x39916f, 0x39914e, 0x913966]
    }
}
export var THEME = localStorage.getItem('game-theme-name') || 'LIGHT';
export var theme = themes[THEME];
export function switchTheme() {
    if (THEME === 'DARK') {
        THEME = 'LIGHT';
        localStorage.setItem('game-theme-name', 'LIGHT');
        theme = themes[THEME];
    }
    else if (THEME === 'LIGHT') {
        THEME = 'DARK';
        localStorage.setItem('game-theme-name', 'DARK');
        theme = themes[THEME];
    }
}

// guide
export var newHere = localStorage.getItem('new-comer') === "false" ? false : true;
export function setNewHere(flag) {
    newHere = flag;
}

// cube shapes
export var shapes = [
    {
        mat: [
            [0, 0, 0], [1, 0, 0],
            [0, 1, 0], [0, 0, 1]
        ],
        center: [1, 1, 1]
    },
    {
        mat: [
            [0, 0, 0], [0, 0, 1]
        ],
        center: [1, 1, 1]
    },
    {
        mat: [
            [0, 0, 0], [0, 0, 1],
            [1, 0, 1], [1, 1, 1]
        ],
        center: [1, 1, 1]
    },
    {
        mat: [
            [0, 0, 0], [0, 0, 1], [1, 0, 0]
        ],
        center: [1, 1, 1]
    },
    {
        mat: [
            [0, 0, 0]
        ],
        center: [1, 1, 1]
    }
]