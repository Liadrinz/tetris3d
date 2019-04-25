import * as THREE from 'three';
import { board } from './logic';

const R = Math.PI / 2;

/**axis: 0=x, 1=y, 2=z
 * direction: 1=counterclockwise, -1=clockwise
 */
function rotateBlockPositions(block, axis, direction) {
    let dim = [];
    for (let i = 0; i < 3; i++) {
        if (i === axis) {
            continue;
        }
        dim.push(i);
    }
    for (let position of block.positions) {
        let cube = [position[dim[0]] + 0.5, position[dim[1]] + 0.5];
        let center = [block.center[dim[0]], block.center[dim[1]]];
        let vector = [cube[0] - center[0], cube[1] - center[1]];
        [vector[0], vector[1]] = [-direction * vector[1], direction * vector[0]];  // rotate
        [cube[0], cube[1]] = [vector[0] + center[0], vector[1] + center[1]];
        [position[dim[0]], position[dim[1]]] = [cube[0] - 0.5, cube[1] - 0.5];
    }
}

export function blockControl(blocks) {
    document.onkeydown = (e) => {
        for (let block of blocks) {
            if (!block.state.settled && block.state.shown) {
                // immediate
                if (e.keyCode === 32) {
                    block.state.speed = 0.2;
                }
                // rotation
                if (block.state.allowRotate && (e.keyCode > 36 && e.keyCode < 41 || e.keyCode === 188 || e.keyCode === 190)) {
                    let intervalEvent, count = 0;
                    if (e.keyCode === 37) {
                        intervalEvent = () => {
                            block.object3d.rotateY(-R * 0.2);
                        }
                        rotateBlockPositions(block, 1, -1);
                    } else if (e.keyCode === 38) {
                        intervalEvent = () => {
                            block.object3d.rotateX(-R * 0.2);
                        }
                        rotateBlockPositions(block, 0, -1);
                    } else if (e.keyCode === 39) {
                        intervalEvent = () => {
                            block.object3d.rotateY(R * 0.2);
                        }
                        rotateBlockPositions(block, 1, 1);
                    } else if (e.keyCode === 40) {
                        intervalEvent = () => {
                            block.object3d.rotateX(R * 0.2);
                        }
                        rotateBlockPositions(block, 0, 1);
                    } else if (e.keyCode === 188) {
                        intervalEvent = () => {
                            block.object3d.rotateZ(R * 0.2)
                        }
                        rotateBlockPositions(block, 2, 1);
                    } else if (e.keyCode === 190) {
                        intervalEvent = () => {
                            block.object3d.rotateZ(-R * 0.2);
                        }
                        rotateBlockPositions(block, 2, -1);
                    }
                    block.state.allowRotate = false;
                    setTimeout(() => {
                        block.state.allowRotate = true;
                    }, 200);
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
}
