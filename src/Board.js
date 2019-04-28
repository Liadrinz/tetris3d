import * as THREE from 'three';
import { scene } from './Root';

export default class Board {
    constructor(history) {
        this.size = {
            x: 8,
            y: 16,
            z: 8
        };
        this.history = history;
        this.object3d = new THREE.Group();
        var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(8, 8), new THREE.MeshPhongMaterial({ color: 0xa0a0a0 }));
        plane.rotation.x = - Math.PI / 2;
        plane.receiveShadow = true;
        plane.position.set(4, 0, 4);
        this.object3d.add(plane);
        scene.add(this.object3d);
        this.matrix = [];
        for (let j = 0; j < this.size.y; j++) {
            let pane = [];
            for (let i = 0; i < this.size.x; i++) {
                let subPane = [];
                for (let k = 0; k < this.size.z; k++) {
                    subPane.push(0);
                }
                pane.push(subPane);
            }
            this.matrix.push(pane);
        }
    }

    // TODO: swap x, y
    eliminateCheck() {
        for (let j = 0; j < this.size.y; j++) {
            let eliminatable = true;
            for (let i = 0; i < this.size.x && eliminatable; i++) {
                for (let k = 0; k < this.size.z && eliminatable; k++) {
                    if (this.matrix[j][i][k] === 0) {
                        eliminatable = false;
                    }
                }
            }
            if (eliminatable) {
                this.history.eliminate(j);
            }
        }
        for (let j = 0; j < this.size.y; j++) {
            let eliminatable = true;
            for (let i = 0; i < this.size.x && eliminatable; i++) {
                for (let k = 0; k < this.size.z && eliminatable; k++) {
                    if (this.matrix[j][i][k] === 0) {
                        eliminatable = false;
                    }
                }
            }
            if (eliminatable) {
                this.matrix.splice(j, 1);
                j--;
                let pane = [];
                for (let i = 0; i < this.size.x; i++) {
                    let subPane = [];
                    for (let k = 0; k < this.size.z; k++) {
                        subPane.push(0);
                    }
                    pane.push(subPane);
                }
                this.matrix.push(pane);
            }
        }
    }
}
