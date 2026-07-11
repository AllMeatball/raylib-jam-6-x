class Slider {
    rect = {
        x: 0,
        y: 0,
        width: 32,
        height: 256
    }

    title = "Slider"

    font_size = 32;
    color = chroma('black').rgb();

    handle = {
        color: chroma('white').rgb(),
        radius: 16
    };

    constructor(params) {
        this.rect.x = params.x;
        this.rect.y = params.y;

        this.rect.width  = params.width;
        this.rect.height = params.height;

        this.getter = params.getter;
        this.setter = params.setter;

        this.title = params.title;

        this.holding = false;
    }

    isHovering(mouse_pos) {
        return (
            mouse_pos.x >= this.rect.x &&
            mouse_pos.x <= this.rect.x + this.rect.width &&

            mouse_pos.y >= this.rect.y &&
            mouse_pos.y <= this.rect.y + this.rect.height
        );
    }

    update(dt) {
        const mouse_pos = RL_GetMousePosition();
        const hovering = this.isHovering(mouse_pos);
        const mouse_down = RL_IsMouseButtonDown(RL_MouseButton.MOUSE_BUTTON_LEFT);

        if (this.holding) {
            if (!mouse_down)
                this.holding = false;
        } else {
            this.holding = hovering && mouse_down;
        }

        // console.log( mouse_pos, hovering, mouse_down, this.holding);
        if (!this.holding) return;

        const new_volume = Clamp((mouse_pos.x - this.rect.x) / this.rect.width, 0, 1);
        this.setter(new_volume);
    }


    drawText(text, dir) {
        const text_size = RL_MeasureTextEx(MAIN_FONT, text, this.font_size, 0);
        const text_pos = {
            x: this.rect.x,
            y: this.rect.y
        };

        text_pos.x -= (text_size.x * 0.5) - this.rect.width  * 0.5;
        text_pos.y -= (text_size.y * 0.5) - this.rect.height * 0.5;

        text_pos.y += this.font_size * dir;

        RL_DrawTextEx(MAIN_FONT, text, text_pos, this.font_size, 0, [255,255,255]);
    }

    draw() {
        const value = this.getter();
        RL_DrawRectangle(this.rect, this.color);

        const handle_pos = {
            x: this.rect.x + (this.rect.width * value),
            y: this.rect.y + this.rect.height * 0.5,
        };

        const text = `${value.toFixed(2)}`;
        this.drawText(this.title, -1);
        this.drawText(text, 1);

        RL_DrawCircle(handle_pos, this.handle.radius, this.handle.color);
    }
}

module.exports = Slider;
