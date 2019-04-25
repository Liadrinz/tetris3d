import * as THREE from 'three';
import { blockControl } from './events';
import { renderer, scene, camera } from './Root';
import Board from './Board';
import Block from './Block';

camera.position.set(14, 12, 14);

export let board = new Board();

let blocks = [];
let block = null;
for (let i = 0; i < 4; i++) {
    block = new Block([
        [0, 0, 0], [1, 0, 0],
        [0, 1, 0], [0, 0, 1]
    ], [1, 1, 1], parseInt(Math.random() * 16777215), block);
    blocks.push(block);
}

blockControl(blocks);

export default function loop() {
    requestAnimationFrame(loop);
    renderer.render(scene, camera);

    // logic
    for (let block of blocks) {
        block.update();
    }
}
