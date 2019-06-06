import { blockControl } from './events';
import { renderer, scene, camera } from './Root';
import { showMessage, hideMessage, showTitle, showDemo } from './ui';
import Block from './Block';
import { theme, newHere } from './config';
import { vueApp } from './main';
import Level from './Level';
import allLevels from './loadLevel';
import { clearScore } from './Score';

export let title: THREE.Object3D = null;

// to control something that should only be done finite times
let titleShown = false;
let reset = false;

export function setReset(status: boolean) {
    reset = status;
}

let removed = false;
let started = false;
export let guideSteps = [-4, -9, 0, 0];

export let lv_Ptr: Array<number> = [0];
export let currentLevel: Level = allLevels[lv_Ptr[0]];
blockControl(currentLevel.current);

export default function loop() {
    // animation
    requestAnimationFrame(loop);
    renderer.render(scene, camera);

    /** logic start */

    // before start
    if (!vueApp.game) {
        started = false;
        back();
        if (!titleShown) {
            showTitle((obj) => {
                title = obj;
            });
            titleShown = true;
        }
        return;
    } else {
        resume();
    }

    // while dead and not restart
    if (currentLevel.board.dieCheck()) {
        currentLevel.current[0].state.paused = true;
        showMessage('<p style="text-align: center;">Blocks Overflow!<br><span style="font-size: 25px;">[press space to restart]</span></p>', '#fff', () => {
            document.onkeypress = (e) => {
                if (e.keyCode === 32) {
                    document.onkeypress = undefined;
                    currentLevel.board.restart();
                    blockControl(currentLevel.current);
                    hideMessage(() => { });
                    reset = true;
                }
            }
        });
        return;
    }

    // restart
    if (reset) {
        currentLevel.board.score = 0;
        clearScore();
        scene.remove(currentLevel.block.object3d);
        currentLevel.block = null;
        reset = false;
    }

    if (newHere) {
        if (guideSteps[0] <= 0) {
            showMessage(`Use <img width="100" src="res/wasd.png"/> to move the block! (${4 + guideSteps[0]}/5)`, 0xfff, () => { }, true, [2, 1.25]);
        } else if (guideSteps[1] <= 0) {
            showMessage(`Use <img width="100" src="res/lryz.png"/> and <img width="100" src="res/lrx.png"/> to rotate it! (${9 + guideSteps[1]}/10)`, 0xfff, () => { }, true, [2, 1.25]);
        } else if (guideSteps[2] <= 0) {
            showMessage(`Now the block starts dropping. <br> Press space to drop it immediately! (${guideSteps[2]}/1)`, 0xfff, () => { }, true, [2, 1.25]);
            currentLevel.current[0].state.speed = currentLevel.current[0].state.originalSpeed;
        } else if (guideSteps[3] <= 0) {
            showMessage('Make a line with the same color <br> Or make a complete surface! (0/1)', 0xfff, () => { }, true, [2, 1.25]);
            showDemo();
        }
    }

    currentLevel.loop();
    currentLevel.block.update();
    /** logic end */
}

function back() {
    if (!removed) {
        try {
            scene.remove(currentLevel.board.object3d, ...currentLevel.board.barrierObjects, currentLevel.history.object3d);
            if (currentLevel.current[0]) {
                scene.remove(currentLevel.current[0].object3d);
            }
        } catch (e) {

        } finally {
            removed = true;
        }
    }
}

function resume() {
    if (!started) {
        scene.add(currentLevel.board.object3d, ...currentLevel.board.barrierObjects, currentLevel.history.object3d);
        if (currentLevel.current[0]) {
            scene.add(currentLevel.current[0].object3d);
        }
        started = true;
        removed = false;
    }
}