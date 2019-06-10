import { Object3D } from "three";
import { renderer, scene, camera } from "./Root";

interface RenderPair {
    parent: Object3D,
    target: Object3D
}

export default class Buffer {
    timeout: number = null;
    renderRequired: boolean = false;
    delayAddSpace: Array<RenderPair> = [];
    immediateAddSpace: Array<RenderPair> = [];
    delayRemoveSpace: Array<RenderPair> = [];
    immediateRemoveSpace: Array<RenderPair> = [];

    timeRender() {
        this.renderRequired = true;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.renderRequired = false;
        }, 300);
    }

    add(parent: Object3D, ...target: Array<Object3D>): void {
        for (let t of target) {
            this.immediateAddSpace.push({
                parent: parent,
                target: t
            });
        }
    }

    addDelay(parent: Object3D, ...target: Array<Object3D>): void {
        for (let t of target) {
            this.delayAddSpace.push({
                parent: parent,
                target: t
            });
        }
    }

    remove(parent: Object3D, ...target: Array<Object3D>) {
        for (let t of target) {
            this.immediateRemoveSpace.push({
                parent: parent,
                target: t
            });
        }
    }

    removeDelay(parent: Object3D, ...target: Array<Object3D>) {
        for (let t of target) {
            this.delayRemoveSpace.push({
                parent: parent,
                target: t
            });
        }
    }

    commit(): void {
        while (this.immediateAddSpace.length > 0) {
            let pair = this.immediateAddSpace.pop();
            pair.parent.add(pair.target);
        }
        while (this.immediateRemoveSpace.length > 0) {
            let pair = this.immediateRemoveSpace.pop();
            pair.parent.remove(pair.target);
        }
        if (this.delayAddSpace.length > 0) {
            setTimeout(() => {
                let pair = this.delayAddSpace.pop();
                pair.parent.add(pair.target);
            }, 0);
        }
        if (this.delayRemoveSpace.length > 0) {
            setTimeout(() => {
                let pair = this.delayRemoveSpace.pop();
                pair.parent.remove(pair.target);
            }, 0);
        }
        this.timeRender();
    }
}
