import * as THREE from 'three';
import { blockControl } from './events';
import { renderer, scene, camera } from './Root';
import Board from './Board';
import Block from './Block';
import History from './History';

camera.position.set(14, 12, 14);

export let history = new History();

export let board = new Board(history);

let block = null;
let currentBox = new Array(1);  // a space containing the current block

blockControl(currentBox);

export default function loop() {
    requestAnimationFrame(loop);
    renderer.render(scene, camera);
    if (!block || block.state.settled) {
        if (block) {
            history.write(block);
            board.eliminateCheck();
        }
        block = new Block([
            [0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0],
            [0, 0, 1], [1, 0, 1], [2, 0, 1], [3, 0, 1],
            [0, 0, 2], [1, 0, 2], [2, 0, 2], [3, 0, 2],
            [0, 0, 3], [1, 0, 3], [2, 0, 3], [3, 0, 3]
        ], [2, 1, 2], parseInt(Math.random() * 1677215));
        currentBox[0] = block;
    }
    // logic
    block.update();
}
