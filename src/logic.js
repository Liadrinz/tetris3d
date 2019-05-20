import { blockControl } from './events';
import { renderer, scene, camera } from './Root';
import { showMessage, hideMessage } from './ui';
import Board from './Board';
import Block from './Block';
import History from './History';
import { theme, shapes } from './config';
import { vueApp } from './main';

function getRandomShape() {
    return shapes[parseInt(Math.random() * shapes.length)];
}

export let history = new History();

export let board = new Board(history);

let block = null;
export let currentBox = new Array(1);  // a space containing the current block

blockControl(currentBox);

let reset = false;

export default function loop() {
    requestAnimationFrame(loop);
    renderer.render(scene, camera);
    if (!vueApp.started) return;
    // logic
    if (board.dieCheck()) {
        currentBox[0].state.paused = true;
        showMessage('<p style="text-align: center;">Blocks Overflow!<br><span style="font-size: 25px;">[press space to restart]</span></p>', '#fff', () => {
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
        block = new Block(shape.mat, shape.center, theme.blockColors[parseInt(Math.random() * theme.blockColors.length)]);
        if (speed) {
            block.state.originalSpeed = speed * 1.005;
            block.state.speed = speed * 1.005;
        }
        currentBox[0] = block;
    }
    block.update();
}
