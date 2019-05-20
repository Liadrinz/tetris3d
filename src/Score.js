import { vueApp } from './main';
import { board } from './logic';

export function addScore(score) {
    board.score += score;
    vueApp.addScore(score);
}

export function clearScore(score) {
    board.score = 0;
    vueApp.setScore(0);
}