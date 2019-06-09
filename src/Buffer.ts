import { Object3D } from "three";

interface RenderPair {
    parent: Object3D,
    target: Object3D
}

export default class Buffer {
    delaySpace: Array<RenderPair> = [];
    immediateSpace: Array<RenderPair> = [];

    add(parent: Object3D, ...target: Array<Object3D>): void {
        for (let t of target) {
            this.immediateSpace.push({
                parent: parent,
                target: t
            });
        }
    }

    addDelay(parent: Object3D, ...target: Array<Object3D>): void {
        for (let t of target) {
            this.delaySpace.push({
                parent: parent,
                target: t
            });
        }
    }

    render(): void {
        while (this.immediateSpace.length > 0) {
            let pair = this.immediateSpace.pop();
            pair.parent.add(pair.target);
        }
        if (this.delaySpace.length > 0) {
            setTimeout(() => {
                let pair = this.delaySpace.pop();
                pair.parent.add(pair.target);
            }, 50);
        }
    }
}
