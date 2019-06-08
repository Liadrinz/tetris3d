interface LevelInfo {
    initSpeed: number,
    speedRate: number,
    targetScore: number
}

interface BarrierInfo {
    layer: number,
    matrix: Array<Array<number>>
}

interface BarrierMeta {
    barrierInfo: BarrierInfo,
    reverse: boolean
}

interface LevelMeta {
    levelNum: number,
    levelInfo: LevelInfo,
    barriers: Array<BarrierMeta>
    blocks: Array<number>
}

declare module "*.json" {
    const value: Array<LevelMeta>;
    export default value;
}
