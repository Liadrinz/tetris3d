import { blockControl } from './events';
import { renderer, scene, camera } from './Root';
import Board from './Board';
import Block from './Block';
import History from './History';

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

export let history = new History();

export let board = new Board(history);

let block = null;
export let currentBox = new Array(1);  // a space containing the current block

blockControl(currentBox);

export default function loop() {
    requestAnimationFrame(loop);
    renderer.render(scene, camera);
    // logic
    if (!block || block.state.settled) {
        if (block) {
            history.write(block);
            board.eliminateCheck();
            board.dieCheck();
        }
        let shape = getRandomShape();
        block = new Block(shape.mat, shape.center, parseInt(Math.random() * 0xffffff));
        currentBox[0] = block;
    }
    block.update();
}
