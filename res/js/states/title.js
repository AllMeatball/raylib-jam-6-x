const TitleState = {
    enter() {
    },

    update(dt) {
        if (RL_IsMouseButtonPressed(RL_MouseButton.MOUSE_BUTTON_LEFT)) {
            STATES.current = STATES.MAIN;
            STATES.current.enter();
        }
    },

    draw() {
        RL_ClearBackground(BG_COLOR);
        RL_DrawTextEx(MAIN_FONT, `Click to start`, {x: 0, y: 0}, 64, 4, [255,255,255]);
    }
};

module.exports = TitleState;
