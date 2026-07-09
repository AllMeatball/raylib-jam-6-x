const TitleState = {
    title_color: chroma(0xffce00).rgb(),
    text_button: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },

    enter() {
        this.hat = GetAsset('texture.hat');
        this.song = GetAsset('music.title');
        this.song.play();

        RL_SetCursorEnabled(true);
    },

    update(dt) {
        if (this.textIsClicked() && RL_IsMouseButtonPressed(RL_MouseButton.MOUSE_BUTTON_LEFT)) {
            this.song.stop();

            STATES.current = STATES.MAIN;
            STATES.current.enter();
        }
    },

    textIsClicked() {
        const mouse_pos = RL_GetMousePosition();
        return (
            mouse_pos.x >= this.text_button.x &&
            mouse_pos.x <= this.text_button.x + this.text_button.width &&

            mouse_pos.y >= this.text_button.y &&
            mouse_pos.y <= this.text_button.y + this.text_button.height
        );
    },

    draw() {
        RL_ClearBackground(BG_COLOR);

        const title_text_info = RL_DrawCenterText(TITLE_FONT, "Hexzard", 0.5, 0.75, 256, this.title_color);


        const hat_pos = title_text_info[0];
        hat_pos.x -= 64;
        hat_pos.y -= 24;

        this.hat.draw(hat_pos, 0, 0.35, [255,255,255]);

        const result = RL_DrawCenterText(MAIN_FONT, "Click me to start", 0.5 + (Math.cos(TIMER * 4) * 0.02), -3 + (Math.sin(TIMER * 4) * 0.02), 64, [255,255,255]);

        const position = result[0];
        this.text_button.x = position.x;
        this.text_button.y = position.y;

        const text_size = result[1];
        this.text_button.width  = text_size.x;
        this.text_button.height = text_size.y;
    }
};

module.exports = TitleState;
