const MainState = {
    hivemind: new Hivemind(),

    enter() {
        ENTITIES.length = 0;
        this.hivemind.mob.length = 0;

        this.gameover_timer = 0;
        this.gameover_timer_target = Infinity;

        this.timer = 0;
        this.gameover = false;

        this.PLAYER = new ENT_CLASS.Player({x: 0, y: 0});
        this.hivemind.target = this.PLAYER;

        ENTITIES.push(this.PLAYER);

        this.song_pitch = 0.85;
        this.song = GetAsset('music.wizardtower');
        this.song.setPitch(this.song_pitch);
        this.song.play();

        RL_SetCursorEnabled(false);
    },

    doGameover() {
        if (this.gameover)
            return;

        this.gameover = true;

        const sound = GetAsset('sfx.gameover');
        sound.setPitch(2);
        sound.play();

        this.gameover_timer_target = (sound.getDuration() / 2) + 3.25;
    },

    debugKeys() {
        if (RL_IsKeyPressed(RL_KeyboardKey.KEY_C))
            this.hivemind.create(1);
        if (RL_IsKeyPressed(RL_KeyboardKey.KEY_K))
            this.hivemind.create(100);
        if (RL_IsKeyPressed(RL_KeyboardKey.KEY_L))
            this.hivemind.createLeader(this.PLAYER);
        if (RL_IsKeyPressed(RL_KeyboardKey.KEY_P))
            this.hivemind.spawnWave(20);
    },

    update(dt) {
        if (this.gameover) {
            this.gameover_timer += dt;
            if (this.song_pitch > 0.45) {
                this.song_pitch -= dt;
                this.song.setPitch(this.song_pitch);
            }

            if (this.gameover_timer > this.gameover_timer_target) {
                this.song.stop();

                STATES.TITLE.enter();
                STATES.current = STATES.TITLE;
            }
            return;
        } else {
            this.timer += dt;
        }

        if (GLOBAL_FLAGS.includes('debug'))
            this.debugKeys();

        for (let i = ENTITIES.length - 1; i >= 0; i--) {
            const ent = ENTITIES[i];
            if (ent.delete) {
                ENTITIES.splice(i, 1);
                continue;
            }

            ent.update(dt);
        }

        CollisionSystem.update();
        this.hivemind.update();
    },

    gameover_color: [255,0,0],
    draw() {
        RL_ClearBackground(BG_COLOR);

        for (ent of ENTITIES)
            ent.draw();

        if (GLOBAL_FLAGS.includes('debug'))
            RL_DrawTextEx(MAIN_FONT, `#ENTS: ${ENTITIES.length}`, {x: 0, y: SCREEN_SIZE - 64}, 64, 4, [255,0,0]);


        RL_DrawTextEx(MAIN_FONT, `Time: ${ secondsToString(this.timer) }`, {x: 0, y: 0}, 64, 4, [255,255,255]);

        if (this.gameover) {
            RL_DrawRectangle({
                x: 0,
                y: 0,
                width:  SCREEN_SIZE,
                height: SCREEN_SIZE
            }, [0,0,0, 0.5]);
            RL_DrawCenterText(TITLE_FONT, "GAME OVER", 0.5, 0.5, 128, this.gameover_color);
        }
    }
};

module.exports = MainState;
