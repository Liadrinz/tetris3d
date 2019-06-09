/**
 * 
 * @param {THREE.Object3D} object3d 需要施加自由落体的物体
 * @param {Number} dy 下落距离
 * @param {Number} frames 总帧数
 * @param {Number} accelerate 加速度
 * @param {Boolean} withBounce 落到终点是否弹跳
 * @param {Number} bounceTimes 弹跳次数
 */
export function freeDrop(object3d: THREE.Object3D, dy: number, frames=100, accelerate=1, withBounce=true, bounceTimes=2, callback=()=>{}): void {
    if (bounceTimes === 0) {
        object3d.translateY(-dy);
        return;
    }
    let scale = (1 + frames * accelerate - accelerate + 1) * frames / 2;
    let total = 0;
    let step = dy / scale;
    let s = setInterval(() => {
        object3d.translateY(-step);
        total += step;
        if (total >= dy) {
            object3d.translateY(total - dy);
            clearInterval(s);
            callback();
            if (withBounce) {
                freeDrop(object3d, -dy / 5, frames, accelerate, true, bounceTimes - 1);
                freeDrop(object3d, dy / 5, frames, accelerate, false, bounceTimes - 1);
            }
        }
        step += accelerate * dy / scale;
    }, 1000/frames/accelerate/5);
}

export function hex(num: number, len: number = 6): string {
    let seqs = [];
    for (let i = 0; i < 10; i++) {
        seqs.push(i.toString());
    }
    seqs.push('A', 'B', 'C', 'D', 'E', 'F');
    let str = '';
    while (num > 0) {
        str = seqs[num % 16] + str;
        num = parseInt((num / 16).toString());
    }
    while (str.length < len) {
        str = '0' + str;
    }
    return str
}