const MainState = {
    health_text_color: chroma(0xff9292).rgba(),
    slots_font_size: 26,
    paused: false,
    bg: GetAsset('texture.bg'),

    enter() {
        ENTITIES.length = 0;

        this.gameover_timer = 0;
        this.gameover_timer_target = Infinity;

        this.timer = 0;
        this.gameover = false;

        this.PLAYER = new ENT_CLASS.Player({
            x: 0,
            y: 0
        });

        const player_center = this.PLAYER.body.getCenter();
        this.PLAYER.pos.x = SCREEN_SIZE * 0.5 - player_center.x;
        this.PLAYER.pos.y = SCREEN_SIZE * 0.5 - player_center.y;

        // this.PLAYER.b.getCenter();

        this.hivemind = new Hivemind();
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
        if (RL_IsKeyPressed(RL_KeyboardKey.KEY_Q))
            TakeScreenshot();
        if (RL_IsKeyPressed(RL_KeyboardKey.KEY_F))
            this.PLAYER.wand.slots.addSpell(new Spells.spell.Basic());
        if (RL_IsKeyPressed(RL_KeyboardKey.KEY_T)) {
            const mouse_pos = RL_GetMousePosition();
            const text = new ENT_CLASS.TempText({
                x: mouse_pos.x,
                y: mouse_pos.y,
                start_time: -0.5,
                time: 0.25
            });

            ENTITIES.push(text);
        }
    },

    update(dt) {
        if (RL_IsKeyPressed(RL_KeyboardKey.KEY_ENTER) && !this.gameover) {
            this.paused = !this.paused;
            RL_SetCursorEnabled(this.paused);

            if (this.paused)
                PauseAllSound();
            else
                ResumeAllSound();
        }

        if (this.paused) {
            VOLUME_SLIDER.update();
            return;
        }

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
        this.hivemind.update(dt);
    },

    drawSlots() {
        const slots = this.PLAYER.getSpellSlots();
        for (let i = 0; i < slots.max_slots; i++) {
            let name = "[NONE]";
            const color = (i == slots.last_valid_index) ? this.health_text_color : [255,255,255];
            const spell = slots.slots[i];

            if (spell)
                name = spell.name

            RL_DrawTextEx(MAIN_FONT, `${ i+1 }: ${name}`, {
                x: 0,
                y: SCREEN_SIZE + (i * this.slots_font_size) - ( (slots.max_slots + 1) * this.slots_font_size)
            }, this.slots_font_size, 4, color);
        }


        let name = "[NONE]";
        const spell = slots.aux_slot;

        if (spell)
            name = spell.name

        RL_DrawTextEx(MAIN_FONT, `AUX: ${name}`, {
            x: 0,
            y: SCREEN_SIZE - this.slots_font_size
        }, this.slots_font_size, 4, this.health_text_color);
    },

    gameover_color: [255,0,0],
    draw() {
        // RL_ClearBackground(BG_COLOR);
        this.bg.draw({x: 0, y:0}, 0, 1, [255,255,255]);

        const draw_order = ENTITIES;
        draw_order.sort((ent1, ent2) => {
            const z1 = (ent1.pos.z || ent1.pos.y);
            const z2 = (ent2.pos.z || ent2.pos.y);
            return z1 - z2;
        });
        for (ent of draw_order)
            ent.draw();

        RL_DrawTextEx(MAIN_FONT, `Wave: ${ this.hivemind.wave.number }`, {x: 0, y: 0}, 64, 4, [255,255,255]);

        if (GLOBAL_FLAGS.includes('debug_text'))
            RL_DrawTextEx(MAIN_FONT, `Health: ${this.PLAYER.health}, #ENTS: ${ENTITIES.length}`, {x: 0, y: 64}, 64, 4, this.health_text_color);
        else
            RL_DrawTextEx(MAIN_FONT, `Health: ${this.PLAYER.health}`, {x: 0, y: 64}, 64, 4, this.health_text_color);

        const time_text = secondsToString(this.timer);
        RL_DrawCenterText(MAIN_FONT, time_text, 0.5, 1.0, 64, [255,255,255]);

        this.drawSlots();

        if (this.paused && !this.gameover) {
            RL_DrawRectangle({
                x: 0,
                y: 0,
                width:  SCREEN_SIZE,
                height: SCREEN_SIZE
            }, [0,0,0, 0.5]);
            RL_DrawCenterText(TITLE_FONT, "PAUSED", 0.5, 0.5, 128, [255,255,255])
            VOLUME_SLIDER.draw();
            return;
        }

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
