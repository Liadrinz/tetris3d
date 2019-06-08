import levels from './levels.json';
import Level from './Level';
import Block from './Block';
import { theme, newHere, shapes } from './config';
import Barrier from './Barrier';
import { guideSteps } from './logic';

let allLevels: Array<Level> = [];

function levelLoop(): void {
    let self: Level = this;
    if (!self.block || self.block.state.settled) {
        if (newHere) {
            if (self.block) {
                self.history.write(self.block);
                self.board.eliminateCheck();
            }
            let shape = shapes[1];
            let color = theme.blockColors[parseInt((Math.random() * theme.blockColors.length).toString())];
            self.block = new Block(shape.mat, shape.center, color);
            if (guideSteps[1] <= 0)            
                self.block.state.speed = 0;
            self.current[0] = self.block;
        } else {
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
}

for (let levelMeta of levels) {
    let newLevel = new Level({
        levelNum: levelMeta.levelNum,
        levelInfo: levelMeta.levelInfo,
        controlFlag: null,
        blocks: levelMeta.blocks,
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