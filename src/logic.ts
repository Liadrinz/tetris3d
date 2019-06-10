import { blockControl } from './events';
import { renderer, scene, camera, buffer } from './Root';
import { showMessage, hideMessage, showTitle, showDemo } from './ui';
import { newHere } from './config';
import { vueApp } from './main';
import Level from './Level';
import allLevels from './loadLevel';
import { clearScore } from './Score';

export let title: THREE.Object3D = null;

// to control something that should only be done finite times
let titleShown = false;
let reset = false;

export function setReset(status: boolean): void {
    reset = status;
}

let removed = false;
let started = false;
export let guideSteps = [-4, -9, 0, 0];

let currentLvN = 0;
export let currentPtr: Array<Level> = [allLevels[currentLvN]];

export function setLevel(num: number): void {
    currentLvN = num;
    currentPtr[0] = allLevels[num];
    blockControl(currentPtr);
}

blockControl(currentPtr);

export default function loop(): void {
    // animation
    requestAnimationFrame(loop);

    if (buffer.renderRequired) {
        renderer.render(scene, camera);
    }
    buffer.commit();

    /** logic start */

    // before start
    if (!vueApp.flags.game) {
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
    if (currentPtr[0].board.dieCheck()) {
        currentPtr[0].current[0].state.paused = true;
        showMessage('<p style="text-align: center;">白给了<br><span style="font-size: 25px;">[按空格键重来]</span></p>', '#fff', () => {
            document.onkeyup = (e) => {
                if (e.keyCode === 32) {
                    document.onkeyup = undefined;
                    currentPtr[0].board.restart();
                    hideMessage(() => { });
                    reset = true;
                }
            }
        });
        return;
    }

    
    // level up
    if (currentPtr[0].board.score >= currentPtr[0].levelInfo.targetScore) {
        currentPtr[0].current[0].state.paused = true;
        showMessage('<p style="text-align: center;">牛逼嗷！<br><span style="font-size: 25px;">[按任意键下一关]</span></p>', '#fff', () => {
            document.onkeyup = (e) => {
                if (e.keyCode === 32) {
                    document.onkeyup = undefined;
                    currentPtr[0].board.score = 0;
                    clearScore();
                    buffer.remove(scene, currentPtr[0].block.object3d, currentPtr[0].board.object3d, currentPtr[0].history.object3d);
                    buffer.remove(scene, ...currentPtr[0].board.barrierObjects);
                    currentPtr[0].block = null;
                    currentPtr[0] = allLevels[++currentLvN];
                    blockControl(currentPtr);
                    hideMessage(() => { });
                    currentPtr[0].board.score = 0;
                    currentPtr[0].history.reset();
                    currentPtr[0].board.reset(currentPtr[0].history);
                    currentPtr[0].board.score = 0;
                    vueApp.targetScore = currentPtr[0].levelInfo.targetScore;
                    vueApp.levelNum = currentPtr[0].levelNum;
                }
            }
        });
        return;
    }

    // restart
    if (reset) {
        currentPtr[0].board.score = 0;
        clearScore();
        buffer.remove(scene, currentPtr[0].block.object3d)
        currentPtr[0].block = null;
        reset = false;
    }

    // new-comer hints
    if (newHere) {
        if (guideSteps[0] <= 0) {
            showMessage(`用<img width="100" src="res/wasd.png"/>来移动 (${4 + guideSteps[0]}/5)`, 0xfff, () => { }, true, [2, 1.25]);
        } else if (guideSteps[1] <= 0) {
            showMessage(`用<img width="100" src="res/lryz.png"/>和<img width="100" src="res/lrx.png"/>来旋转方块 (${9 + guideSteps[1]}/10)`, 0xfff, () => { }, true, [2, 1.25]);
        } else if (guideSteps[2] <= 0) {
            showMessage(`方块开始下落了<br>按空格键让它瞬间掉下 (${guideSteps[2]}/1)`, 0xfff, () => { }, true, [2, 1.25]);
            currentPtr[0].current[0].state.speed = currentPtr[0].current[0].state.originalSpeed;
        } else if (guideSteps[3] <= 0) {
            showMessage('相同颜色连成一条线<br>或者任意颜色凑齐一个平面 (0/1)', 0xfff, () => { }, true, [2, 1.25]);
            showDemo();
        }
    }

    // one frame of a block movement
    currentPtr[0].loop();
    currentPtr[0].block.update();
    /** logic end */
}

function back(): void {
    if (!removed) {
        try {
            for (let level of allLevels) {
                buffer.remove(scene, level.board.object3d, ...level.board.barrierObjects, level.history.object3d);
                if (level.current[0]) {
                    buffer.remove(scene, level.current[0].object3d);
                }
            }
        } catch (e) {

        } finally {
            removed = true;
        }
    }
}

function resume(): void {
    if (!started) {
        buffer.add(scene, currentPtr[0].board.object3d, ...currentPtr[0].board.barrierObjects, currentPtr[0].history.object3d);
        if (currentPtr[0].current[0]) {
            buffer.add(scene, currentPtr[0].current[0].object3d);
        }
        started = true;
        removed = false;
    }
}
