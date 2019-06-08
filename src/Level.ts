import { shapes, Shape } from "./config";
import History from './History';
import Board from "./Board";
import Block from "./Block";
import Barrier from "./Barrier";

interface LevelInfo {
    initSpeed: number,
    speedRate: number,
    targetScore: number
}

interface LevelParam {
    levelNum: number,
    levelInfo: LevelInfo,
    controlFlag: Object,
    blocks: Array<number>,
    loop: Function
}

export default class Level {
    levelNum: number;
    levelInfo: LevelInfo;
    history: History;
    board: Board;
    block: Block;
    barriers: Array<Barrier>;
    blocks: Array<number>;
    current: Array<Block>;
    controlFlag: Object;
    loop: Function;

    constructor(params: LevelParam) {
        this.history = new History();
        this.board = new Board(this.history);
        this.levelNum = params.levelNum;
        this.levelInfo = params.levelInfo;
        this.controlFlag = params.controlFlag;
        this.blocks = params.blocks;
        this.loop = params.loop;
        this.current = [];
    }

    setBarriers(barriers: Array<Barrier>): void {
        this.barriers = barriers;
        this.board.setBarriers(this.barriers);
    }

    getRandomShape(): Shape {
        return shapes[this.blocks[parseInt((Math.random() * this.blocks.length).toString())]];
    }
}