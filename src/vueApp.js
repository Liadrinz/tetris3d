import { scene } from './Root';
import { Color } from 'three';
import { blockControl } from './events'
import { themes } from './config';
import * as conf from './config';
import { currentPtr, title, setReset, setLevel } from './logic';
import { hideMessage } from './ui'
import allLevels from './loadLevel';

// the vue app
let vueApp = new Vue({
    el: '#vue-app',
    data: function () {
        return {
            flags: {
                started: false,
                levelChoice: false,
                game: false,
                workshop: false,
                settings: false,
            },
            levelNum: currentPtr[0].levelNum,
            score: currentPtr[0].board.score,
            targetScore: currentPtr[0].levelInfo.targetScore,
            allLevels: allLevels,
            pauseControl: {
                pasued: false
            }
        }
    },

    mounted() {
        let menu = document.getElementById('menu');
        menu.style.left = parseInt(((window.innerWidth - menu.clientWidth) / 2).toString()) + 'px';
        menu.style.top = parseInt(((window.innerHeight - menu.clientHeight) / 5 * 4).toString()) + 'px';
        document.getElementById('theme-button').className = conf.theme.button;
        window.addEventListener('resize', function () {
            menu.style.left = parseInt(((window.innerWidth - menu.clientWidth) / 2).toString()) + 'px';
            menu.style.top = parseInt(((window.innerHeight - menu.clientHeight) / 5 * 4).toString()) + 'px';
        });
    },

    methods: {
        startGame() {
            this.flags.started = true;
            this.flags.levelChoice = true;
            scene.remove(title);
        },

        startLevel(level) {
            this.flags.levelChoice = false;
            this.flags.game = true;
            setLevel(level.levelNum - 1);
            currentPtr[0].board.score = 0;
            currentPtr[0].history.reset();
            currentPtr[0].board.reset(currentPtr[0].history);
            this.setScore(0);
            this.targetScore = level.levelInfo.targetScore;
            this.levelNum = currentPtr[0].levelNum;
        },

        startWorkshop() {
            this.flags.started = true;
            this.flags.workshop = true;
        },

        startSettings() {
            this.flags.started = true;
            this.flags.settings = true;
        },

        addScore(score) {
            this.score += score;
        },

        setScore(score) {
            this.score = score;
        },

        back() {
            if (currentPtr[0].board.dieCheck()) {
                document.onkeypress = undefined;
                currentPtr[0].board.restart();
                blockControl(currentPtr[0].current);
                hideMessage(() => { });
                setReset(true);
            }
            if (this.flags.game) {
                this.flags.game = false;
                this.flags.levelChoice = true;
            } else {
                scene.add(title);
                this.flags.levelChoice = false;
                this.flags.started = false;
                this.flags.workshop = false;
                this.flags.settings = false;
            }
        },

        pauseOrPlay() {
            if (currentPtr[0].board.dieCheck()) return;
            if (this.pauseControl.pasued) {
                this.pauseControl.pasued = false;
                document.getElementById('pause-button').className = 'el-icon-video-pause';
            } else {
                this.pauseControl.pasued = true;
                document.getElementById('pause-button').className = 'el-icon-video-play';
            }
            currentPtr[0].current[0].state.paused = !currentPtr[0].current[0].state.paused;
        },

        switchTheme() {
            if (conf.THEME === 'LIGHT') {
                scene.background = new Color(themes.DARK.background);
                conf.switchTheme();
                document.getElementById('theme-button').className = themes.DARK.button;
            }
            else if (conf.THEME === 'DARK') {
                scene.background = new Color(themes.LIGHT.background);
                conf.switchTheme();
                document.getElementById('theme-button').className = themes.LIGHT.button;
            }
        }
    }
});

export default vueApp;
