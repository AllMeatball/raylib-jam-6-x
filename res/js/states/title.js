const TitleState = {
    title_color: chroma(0xffce00).rgb(),
    text_button: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },

    enter() { },

    update(dt) {
        if (this.textIsClicked() && RL_IsMouseButtonPressed(RL_MouseButton.MOUSE_BUTTON_LEFT)) {
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

    drawCenterText(font, text, ratio_x, ratio_y, font_size, color) {
        const text_size = RL_MeasureTextEx(font, text, font_size, 4);
        const position = {
            x: SCREEN_SIZE * 0.5 - (text_size.x * ratio_x),
            y: SCREEN_SIZE * 0.5 - (text_size.y * ratio_y)
        };

        RL_DrawTextEx(
            font,
            text,
            position,
            font_size, 4,
            color
        );

        return [position, text_size];
    },

    draw() {
        RL_ClearBackground(BG_COLOR);

        this.drawCenterText(TITLE_FONT, "Hexzard", 0.5, 0.75, 256, this.title_color);
        const result = this.drawCenterText(MAIN_FONT, "Click me to start", 0.5 + (Math.cos(TIMER * 4) * 0.02), -3 + (Math.sin(TIMER * 4) * 0.02), 64, [255,255,255]);

        const position = result[0];
        this.text_button.x = position.x;
        this.text_button.y = position.y;

        const text_size = result[1];
        this.text_button.width  = text_size.x;
        this.text_button.height = text_size.y;
    }
};

module.exports = TitleState;
