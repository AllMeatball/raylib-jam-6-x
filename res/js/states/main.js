const MainState = {
    level: 1,

    enter() {
        ENTITIES.length = 0;

        this.level = 1;
        this.PLAYER = new ENT_CLASS.Player({x: 0, y: 0});
        ENTITIES.push(this.PLAYER);

        this.song = GetAsset('music.wizardtower');
        this.song.setPitch(0.85);
        this.song.play();

        RL_SetCursorEnabled(false);
    },

    debugKeys() {
        if (RL_IsKeyPressed(RL_KeyboardKey.KEY_C)) {
            const mouse_pos = RL_GetMousePosition();
            ENTITIES.push(
                new ENT_CLASS.Enemy({
                    target: this.PLAYER,
                    x: mouse_pos.x,
                    y: mouse_pos.y
                })
            );

            // ENTITIES.push(
            //     new ENT_CLASS.Dot(mouse_pos.x, mouse_pos.y)
            // );
        }
    },

    update(dt) {
        CollisionSystem.update();

        if (GLOBAL_FLAGS.includes('debug'))
            this.debugKeys();

        for (let i = 0; i < ENTITIES.length; i++) {
            const ent = ENTITIES[i];
            if (ent.delete) {
                ENTITIES.splice(i, 1);
                i--;
                continue;
            }

            ent.update(dt);
        }
    },

    draw() {
        RL_ClearBackground(BG_COLOR);

        for (ent of ENTITIES)
            ent.draw();

        RL_DrawTextEx(MAIN_FONT, `Level: ${this.level}`, {x: 0, y: 0}, 64, 4, [255,255,255]);
    }
};

module.exports = MainState;
