export function updateScore(score) {
    document.querySelector('#score').innerHTML = '' + score;
}

export function addScore(score) {
    let scoreDiv = document.querySelector('#score');
    scoreDiv.innerHTML = '' + (parseInt(scoreDiv.innerHTML) + score);
}
