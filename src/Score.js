import { showScore } from './ui';
import { board } from './logic';

export function addScore(score) {
    board.score += score;
    let newScore = board.score;
    showScore(newScore);
}

export function clearScore(score) {
    board.score = 0;
    showScore(0);
}