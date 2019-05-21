import { blockControl } from './events';
import { renderer, scene, camera } from './Root';
import { showMessage, hideMessage, showTitle, showInfo, showDemo } from './ui';
import Board from './Board';
import Block from './Block';
import History from './History';
import { theme, shapes, newHere } from './config';
import { vueApp } from './main';

function getRandomShape() {
    return shapes[parseInt(Math.random() * shapes.length)];
}

export let history = new History();

export let board = new Board(history);

let block = null;
export let currentBox = new Array(1);  // a space containing the current block

blockControl(currentBox);

// to control something that should only be done finite times
let titleShown = false;
let reset = false;
export let guideSteps = [-4, -9, 0, 0];

export default function loop() {
    // animation
    requestAnimationFrame(loop);
    renderer.render(scene, camera);

    /** logic start */

    // before start
    if (!vueApp.started) {
        if (!titleShown) {
            showTitle();
            titleShown = true;
        }
        return;
    }

    // while dead and not restart
    if (board.dieCheck()) {
        currentBox[0].state.paused = true;
        showMessage('<p style="text-align: center;">Blocks Overflow!<br><span style="font-size: 25px;">[press space to restart]</span></p>', '#fff', () => {
            document.onkeypress = (e) => {
                if (e.keyCode === 32) {
                    document.onkeypress = undefined;
                    board.restart();
                    blockControl(currentBox);
                    hideMessage(() => { });
                    reset = true;
                }
            }
        });
        return;
    }

    // restart
    if (reset) {
        scene.remove(block.object3d);
        block = null;
        reset = false;
    }

    if (newHere) {
        if (guideSteps[0] <= 0) {
            showMessage(`Use <img width="100" src="res/wasd.png"/> to move the block! (${4 + guideSteps[0]}/5)`, 0xfff, () => { }, true, [2, 1.25]);
        } else if (guideSteps[1] <= 0) {
            showMessage(`Use <img width="100" src="res/lryz.png"/> and <img width="100" src="res/lrx.png"/> to rotate it! (${9 + guideSteps[1]}/10)`, 0xfff, () => { }, true, [2, 1.25]);
        } else if (guideSteps[2] <= 0) {
            showMessage(`Now the block starts dropping. <br> Press space to drop it immediately! (${guideSteps[2]}/1)`, 0xfff, () => { }, true, [2, 1.25]);
            currentBox[0].state.speed = currentBox[0].state.originalSpeed;
        } else if (guideSteps[3] <= 0) {
            showMessage('Make a line with the same color <br> Or make a complete surface! (0/1)', 0xfff, () => { }, true, [2, 1.25]);
            showDemo();
        }
    }

    // the main
    if (!block || block.state.settled) {
        if (newHere) {
            let shape = shapes[1];
            if (block) {
                history.write(block);
                board.eliminateCheck();
            }
            block = new Block(shape.mat, shape.center, theme.blockColors[parseInt(Math.random() * theme.blockColors.length)]);
            if (guideSteps[1] <= 0)
                block.state.speed = 0;
            currentBox[0] = block;
        } else {
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
    }

    block.update();
    /** logic end */
}
