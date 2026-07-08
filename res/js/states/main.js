const MainState = {
    level: 1,

    enter() {
        ENTITIES.length = 0;

        this.level = 1;
        this.PLAYER = new ENT_CLASS.Player(0, 0);
        ENTITIES.push(this.PLAYER);

        this.song = GetAsset('music.wizardtower');
        this.song.setPitch(0.85);
        this.song.play();

        RL_SetCursorEnabled(false);
    },

    update(dt) {
        CollisionSystem.update();
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
        RL_DrawTextEx(MAIN_FONT, `Level: ${this.level}`, {x: 0, y: 0}, 64, 4, [255,255,255]);

        for (ent of ENTITIES)
            ent.draw();

        // RL_DrawFPS();
    }
};

module.exports = MainState;
