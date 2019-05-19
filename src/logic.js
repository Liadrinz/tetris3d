import { blockControl } from './events';
import { renderer, scene, camera } from './Root';
import { showMessage, hideMessage } from './ui';
import Board from './Board';
import Block from './Block';
import History from './History';
import { THEME } from './config';

function getRandomShape() {
    // let fourStage = {
    //     mat: [
    //         [0, 0, 0], [1, 0, 0],
    //         [0, 1, 0], [0, 0, 1]
    //     ],
    //     center: [1, 1, 1]
    // };
    let doubleCube = {
        mat: [
            [0, 0, 0], [1, 0, 0],
            [0, 0, 1], [1, 0, 1],
            [0, 1, 0], [1, 1, 0],
            [0, 1, 1], [1, 1, 1]
        ],
        center: [1, 1, 1]
    };
    let longPiece = {
        mat: [
            [0, 0, 0], [0, 0, 1],
            [0, 0, 2], [0, 0, 3]
        ],
        center: [1, 1, 2]
    };
    let shortPiece = {
        mat: [
            [0, 0, 0], [0, 0, 1]
        ],
        center: [1, 1, 1]
    }
    let LPiece = {
        mat: [
            [0, 0, 0], [0, 0, 1], [1, 0, 0]
        ],
        center: [1, 1, 1]
    };
    let unitCube = {
        mat: [
            [0, 0, 0]
        ],
        center: [1, 1, 1]
    };
    let options = [doubleCube, longPiece, shortPiece, LPiece, unitCube];
    return options[parseInt(Math.random() * options.length)];
}

const lightColors = [0x8cbaff, 0x8cffdd, 0x8cffdd, 0xb2ff8c, 0xe5ff8c, 0xff978c];
const darkColors = [0x395c91, 0x39918c, 0x39916f, 0x39914e, 0x5e9139, 0x913966];

export let history = new History();

export let board = new Board(history);

let block = null;
export let currentBox = new Array(1);  // a space containing the current block

blockControl(currentBox);

let reset = false;

export default function loop() {
    requestAnimationFrame(loop);
    renderer.render(scene, camera);
    // logic
    if (board.dieCheck()) {
        currentBox[0].state.paused = true;
        showMessage('<p style="text-align: center;">Blocks Overflow!<br><span style="font-size: 25px;">[press space to restart]</span></p>', '#88aacc', () => {
            document.onkeypress = (e) => {
                if (e.keyCode === 32) {
                    document.onkeypress = undefined;
                    board.restart();
                    blockControl(currentBox);
                    hideMessage(() => {});
                    reset = true;
                }
            }
        });
        return;
    }
    if (reset) {
        scene.remove(block.object3d);
        block = null;
        reset = false;
    }
    if (!block || block.state.settled) {
        let speed = null;
        if (block) {
            history.write(block);
            board.eliminateCheck();
            speed = block.state.originalSpeed;
        }
        let shape = getRandomShape();
        if (THEME === 'LIGHT')
            block = new Block(shape.mat, shape.center, lightColors[parseInt(Math.random() * lightColors.length)]);
        else if (THEME === 'DARK')
            block = new Block(shape.mat, shape.center, darkColors[parseInt(Math.random() * darkColors.length)]);
        if (speed) {
            block.state.originalSpeed = speed * 1.005;
            block.state.speed = speed * 1.005;
        }
        currentBox[0] = block;
    }
    block.update();
}
