import { scene } from './Root';
import { Color } from 'three';
import { blockControl } from './events'
import { themes } from './config';
import * as conf from './config';
import { currentLevel, title, setReset } from './logic';
import { hideMessage } from './ui'
import { freeDrop } from './Physical';

// the vue app
let vueApp = new Vue({
    el: '#vue-app',
    data: function () {
        return {
            started: false,
            game: false,
            workshop: false,
            settings: false,
            score: currentLevel.board.score,
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
            this.started = true;
            this.game = true;
            scene.remove(title);
        },

        startWorkshop() {
            this.started = true;
            this.workshop = true;
        },

        startSettings() {
            this.started = true;
            this.settings = true;
        },

        addScore(score) {
            this.score += score;
        },

        setScore(score) {
            this.score = score;
        },

        back() {
            if (currentLevel.board.dieCheck()) {
                document.onkeypress = undefined;
                currentLevel.board.restart();
                blockControl(currentLevel.current);
                hideMessage(() => { });
                setReset(true);
            }
            this.started = false;
            this.game = false;
            scene.add(title);
            this.workshop = false;
            this.settings = false;
        },

        pauseOrPlay() {
            if (currentLevel.board.dieCheck()) return;
            if (this.pauseControl.pasued) {
                this.pauseControl.pasued = false;
                document.getElementById('pause-button').className = 'el-icon-video-pause';
            } else {
                this.pauseControl.pasued = true;
                document.getElementById('pause-button').className = 'el-icon-video-play';
            }
            currentLevel.current[0].state.paused = !currentLevel.current[0].state.paused;
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
