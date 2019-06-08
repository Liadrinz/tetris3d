import { vueApp } from './main';
import { currentPtr } from './logic';

export function addScore(score: number): void {
    currentPtr[0].board.score += score;
    vueApp.addScore(score);
}

export function clearScore(): void {
    currentPtr[0].board.score = 0;
    vueApp.setScore(0);
}