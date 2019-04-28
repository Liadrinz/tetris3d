import * as THREE from 'three';
import { board } from './logic';

const R = Math.PI / 2;

/**
 * axis: 0=x, 1=y, 2=z
 * direction: 1=counterclockwise, -1=clockwise
 */
function rotateBlockPositions(block, axis, direction, callback = () => { }) {
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

        let [resI, resJ] = [cube[0] - 0.5, cube[1] - 0.5];
        let cubeX, cubeY, cubeZ;
        if (axis === 0) {
            cubeX = parseInt(block.object3d.position.x - block.center[0] + position[0] + 0.5);
            cubeY = parseInt(block.object3d.position.y - block.center[1] + resI + 0.5);
            cubeZ = parseInt(block.object3d.position.z - block.center[2] + resJ + 0.5);
        } else if (axis === 1) {
            cubeX = parseInt(block.object3d.position.x - block.center[0] + resI + 0.5);
            cubeY = parseInt(block.object3d.position.y - block.center[1] + position[1] + 0.5);
            cubeZ = parseInt(block.object3d.position.z - block.center[2] + resJ + 0.5);
        } else {
            cubeX = parseInt(block.object3d.position.x - block.center[0] + resI + 0.5);
            cubeY = parseInt(block.object3d.position.y - block.center[1] + resJ + 0.5);
            cubeZ = parseInt(block.object3d.position.z - block.center[2] + position[2] + 0.5);
        }

        let flag = board.matrix[cubeY][cubeX][cubeZ];

        if (!flag)
            cache.push([resI, resJ]);
        else return;

        [position[dim[0]], position[dim[1]]] = [resI, resJ];
    }
    let idx = 0;
    for (let position of block.positions) {
        [position[dim[0]], position[dim[1]]] = cache[idx++];
    }
    callback();
}

export function blockControl(currentBox) {
    document.onkeydown = (e) => {
        let block = currentBox[0];
        if (block && !block.state.settled && block.state.shown) {
            // immediate
            if (e.keyCode === 32) {
                block.state.speed = 0.2;
            }
            // rotation
            if (block.state.allowRotate && (e.keyCode > 36 && e.keyCode < 41 || e.keyCode === 188 || e.keyCode === 190)) {
                let intervalEvent = null, count = 0;
                if (e.keyCode === 37) {
                    rotateBlockPositions(block, 1, 1, () => {
                        intervalEvent = () => {
                            block.object3d.rotateY(-R * 0.2);
                        }
                    });
                } else if (e.keyCode === 38) {
                    rotateBlockPositions(block, 0, -1, () => {
                        intervalEvent = () => {
                            block.object3d.rotateX(-R * 0.2);
                        }
                    });
                } else if (e.keyCode === 39) {
                    rotateBlockPositions(block, 1, -1, () => {
                        intervalEvent = () => {
                            block.object3d.rotateY(R * 0.2);
                        }
                    });
                } else if (e.keyCode === 40) {
                    rotateBlockPositions(block, 0, 1, () => {
                        intervalEvent = () => {
                            block.object3d.rotateX(R * 0.2);
                        }
                    });
                } else if (e.keyCode === 188) {
                    rotateBlockPositions(block, 2, 1, () => {
                        intervalEvent = () => {
                            block.object3d.rotateZ(R * 0.2)
                        }
                    });
                } else if (e.keyCode === 190) {
                    rotateBlockPositions(block, 2, -1, () => {
                        intervalEvent = () => {
                            block.object3d.rotateZ(-R * 0.2);
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
                        // TODO: to copy child by child
                        for (let child of block.object3d) {
                            let tempObject = new THREE.Object3D();
                            tempObject.position.setX(child.position.x);
                            tempObject.position.setY(child.position.y);
                            tempObject.position.setZ(child.position.z);
                            let objectCloned = child.clone();
                            objectCloned.position.setX(objectCloned.position.x - child.position.x);
                            objectCloned.position.setY(objectCloned.position.y - child.position.y);
                            objectCloned.position.setZ(objectCloned.position.z - child.position.z);
                            tempObject.add(objectCloned);
                            block.object3d.remove(...block.object3d.children);
                            block.object3d.copy(tempObject);
                        }
                        if (count === 5) {
                            clearInterval(s);
                        }
                    }, 20);
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
