import { vueApp } from './main';
import { currentLevel } from './logic';

export function addScore(score: number) {
    currentLevel.board.score += score;
    vueApp.addScore(score);
}

export function clearScore() {
    currentLevel.board.score = 0;
    vueApp.setScore(0);
}