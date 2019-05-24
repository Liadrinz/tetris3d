import { vueApp } from './main';
import { board } from './logic';

export function addScore(score: number) {
    board.score += score;
    vueApp.addScore(score);
}

export function clearScore() {
    board.score = 0;
    vueApp.setScore(0);
}