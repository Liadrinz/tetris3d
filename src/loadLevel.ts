import levels from './levels.json';
import Level from './Level';
import Block from './Block';
import { theme } from './config';
import Barrier from './Barrier';

console.log(levels)

let allLevels: Array<Level> = [];

function levelLoop() {
    let self = this;
    if (!self.block || self.block.state.settled) {
        let speed = null;
        if (self.block) {
            self.history.write(self.block);
            self.board.eliminateCheck();
            speed = self.block.state.originalSpeed;
        }
        let shape = self.getRandomShape();
        let color = theme.blockColors[parseInt((Math.random() * theme.blockColors.length).toString())];
        self.block = new Block(shape.mat, shape.center, color);
        self.current[0] = self.block;
        if (speed !== null) {
            self.block.state.originalSpeed = speed * self.levelInfo.speedRate;
            self.block.state.speed = speed * self.levelInfo.speedRate;
        }
    }
}

for (let levelMeta of levels) {
    let newLevel = new Level({
        levelNum: levelMeta.levelNum,
        levelInfo: levelMeta.levelInfo,
        controlFlag: null,
        loop: levelLoop
    });
    let barriers: Array<Barrier> = [];
    for (let barrier of levelMeta.barriers) {
        barriers.push(new Barrier(newLevel.history, barrier.barrierInfo.layer, barrier.barrierInfo.matrix, barrier.reverse))
    }
    newLevel.setBarriers(barriers);
    allLevels.push(newLevel);
}

export default allLevels;