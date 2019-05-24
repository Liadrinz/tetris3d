import * as THREE from 'three';
import { board } from './logic';
import { newHere } from './config';
import { guideSteps } from './logic';
import { showInfo, hideMessage } from './ui';
import Block from './Block';
import { vueApp } from './main';

const R = Math.PI / 2;

/**
 * Rotate the position infomation of a block.
 * @param {Block} block The target object.
 * @param {Number} 0: x, 1: y, 2: z
 * @param {Number} direction 1: Counter-clockwise, -1: Clockwise.
 * @param {function} callback (err: Boolean)
 */
function rotateBlockPositions(block: Block, axis: number, direction: number, callback: Function = (err: boolean) => { }) {
    let dim = [];
    for (let i = 0; i < 3; i++) {
        if (i === axis) {
            continue;
        }
        dim.push(i);
    }
    let cache = [];
    for (let position of block.positions) {
        let cube = [position[dim[0]] + 0.5, position[dim[1]] + 0.5];
        let center = [block.center[dim[0]], block.center[dim[1]]];
        let vector = [cube[0] - center[0], cube[1] - center[1]];
        [vector[0], vector[1]] = [-direction * vector[1], direction * vector[0]];  // rotate
        [cube[0], cube[1]] = [vector[0] + center[0], vector[1] + center[1]];

        // simple transformation on a surface
        let [resI, resJ] = [cube[0] - 0.5, cube[1] - 0.5];
        let cubeX, cubeY, cubeZ;
        if (axis === 0) {
            cubeX = parseInt((block.object3d.position.x - block.center[0] + position[0]).toString());
            cubeY = parseInt((block.object3d.position.y - block.center[1] + resI).toString());
            cubeZ = parseInt((block.object3d.position.z - block.center[2] + resJ).toString());
        } else if (axis === 1) {
            cubeX = parseInt((block.object3d.position.x - block.center[0] + resI).toString());
            cubeY = parseInt((block.object3d.position.y - block.center[1] + position[1]).toString());
            cubeZ = parseInt((block.object3d.position.z - block.center[2] + resJ).toString());
        } else {
            cubeX = parseInt((block.object3d.position.x - block.center[0] + resI).toString());
            cubeY = parseInt((block.object3d.position.y - block.center[1] + resJ).toString());
            cubeZ = parseInt((block.object3d.position.z - block.center[2] + position[2]).toString());
        }

        // overflow detection
        if (cubeX < 0) {
            board.overflowShow('left');
            callback(true);
            return;
        }
        if (cubeX >= board.size.x) {
            board.overflowShow('right');
            callback(true);
            return;
        }
        if (cubeZ < 0) {
            board.overflowShow('up');
            callback(true);
            return;
        }
        if (cubeZ >= board.size.z) {
            board.overflowShow('down');
            callback(true);
            return;
        }
        if (!board.matrix[cubeY][cubeX][cubeZ])
            cache.push([resI, resJ]);
        else {
            callback(true);
            return;
        }
    }

    // change position information
    let idx = 0;
    for (let position of block.positions) {
        [position[dim[0]], position[dim[1]]] = cache[idx++];
    }
    callback(false);
}

export function blockControl(currentBox: Array<Block>) {
    document.onkeydown = (e) => {
        if (vueApp.game === false) return;
        if (newHere) {
            if (guideSteps[0] <= 0 && (e.keyCode > 36 && e.keyCode < 41 || e.keyCode === 188 || e.keyCode === 190)) return;
            if (guideSteps[1] <= 0 && e.keyCode === 32) return;
        }
        let block = currentBox[0];
        if (block.state.paused) return;
        if (block && !block.state.settled && block.state.shown) {
            // immediate
            if (e.keyCode === 32) {
                if (newHere) {
                    guideSteps[2] += 1;
                    if (guideSteps[2] === 1) {
                        hideMessage(() => { });
                        showInfo('<h1 style="color: #fff">Fantastic!</h1>', 0xfff);
                    }
                }
                block.state.speed = 0.2;
            }
            // rotation
            if (block.state.allowRotate && (e.keyCode > 36 && e.keyCode < 41 || e.keyCode === 188 || e.keyCode === 190)) {
                if (newHere) {
                    guideSteps[1] += 1;
                    if (guideSteps[1] === 1) {
                        hideMessage(() => { });
                        showInfo('<h1 style="color: #fff">Voila!</h1>', 0xfff);
                    }
                }
                let intervalEvent: Function = null, count = 0;
                if (e.keyCode === 37) {
                    rotateBlockPositions(block, 1, 1, (err: boolean) => {
                        if (!err) {
                            intervalEvent = () => {
                                block.object3d.rotateY(-R * 0.2);
                            }
                        }
                    });
                } else if (e.keyCode === 38) {
                    rotateBlockPositions(block, 0, -1, (err: boolean) => {
                        if (!err) {
                            intervalEvent = () => {
                                block.object3d.rotateX(-R * 0.2);
                            }
                        }
                    });
                } else if (e.keyCode === 39) {
                    rotateBlockPositions(block, 1, -1, (err: boolean) => {
                        if (!err) {
                            intervalEvent = () => {
                                block.object3d.rotateY(R * 0.2);
                            }
                        }
                    });
                } else if (e.keyCode === 40) {
                    rotateBlockPositions(block, 0, 1, (err: boolean) => {
                        if (!err) {
                            intervalEvent = () => {
                                block.object3d.rotateX(R * 0.2);
                            }
                        }
                    });
                } else if (e.keyCode === 188) {
                    rotateBlockPositions(block, 2, 1, (err: boolean) => {
                        if (!err) {
                            intervalEvent = () => {
                                block.object3d.rotateZ(R * 0.2)
                            }
                        }
                    });
                } else if (e.keyCode === 190) {
                    rotateBlockPositions(block, 2, -1, (err: boolean) => {
                        if (!err) {
                            intervalEvent = () => {
                                block.object3d.rotateZ(-R * 0.2);
                            }
                        }
                    });
                }
                block.state.allowRotate = false;
                setTimeout(() => {
                    block.state.allowRotate = true;
                }, 200);
                if (intervalEvent) {
                    let s = setInterval(() => {
                        intervalEvent();
                        count++;
                        // copy the object to a new one
                        let tempObject = new THREE.Object3D();
                        tempObject.position.setX(block.object3d.position.x);
                        tempObject.position.setY(block.object3d.position.y);
                        tempObject.position.setZ(block.object3d.position.z);
                        let objectCloned = block.object3d.clone();
                        objectCloned.position.setX(objectCloned.position.x - block.object3d.position.x);
                        objectCloned.position.setY(objectCloned.position.y - block.object3d.position.y);
                        objectCloned.position.setZ(objectCloned.position.z - block.object3d.position.z);
                        tempObject.add(objectCloned);
                        block.object3d.remove(...block.object3d.children);
                        block.object3d.copy(tempObject);
                        if (count === 5) {
                            clearInterval(s);
                        }
                    }, 20);
                }
            }
            if (e.keyCode === 65 || e.keyCode === 87 || e.keyCode === 68 || e.keyCode === 83) {
                if (newHere) {
                    guideSteps[0] += 1;
                    if (guideSteps[0] === 1) {
                        hideMessage(() => { });
                        showInfo('<h1 style="color: #fff">Great!</h1>', 0xfff);
                    }
                }
                // translation
                if (e.keyCode === 65) {
                    if (!block._collisionXZ('left'))
                        block.object3d.translateX(-1);
                } else if (e.keyCode === 87) {
                    if (!block._collisionXZ('up'))
                        block.object3d.translateZ(-1);
                } else if (e.keyCode === 68) {
                    if (!block._collisionXZ('right'))
                        block.object3d.translateX(1);
                } else if (e.keyCode === 83) {
                    if (!block._collisionXZ('down'))
                        block.object3d.translateZ(1);
                }
            }
        }
    }
    document.onkeyup = (e) => {
        board.overflowFade('left');
        board.overflowFade('right');
        board.overflowFade('up');
        board.overflowFade('down');
    }
}
