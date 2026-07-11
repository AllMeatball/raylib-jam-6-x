class TempText {
    pos = new Vector2();
    color = [255,255,255];

    font = MAIN_FONT;

    timer = 0.0;

    target_time = 0.0;

    constructor(params) {
        this.color = params.color || [255,255,255];
        this.pos.x = params.x;
        this.pos.y = params.y;

        this.text = params.text || 'FIX ME';
        this.font_size = params.font_size || 32;

        const text_size = RL_MeasureTextEx(this.font, this.text, this.font_size, 0);
        this.pos.x -= (text_size.x * 0.5);
        this.pos.y -= (text_size.y * 0.5);

        this.pos.z = Infinity;

        this.timer = params.start_time;
        this.target_time = params.time;
    }

    update(dt) {
        if (this.timer < this.target_time) {
            this.timer += dt;
            this.pos.y -= dt * this.font_size;
        } else
            this.delete = true;
    }

    draw() {
        const alpha = (Math.max(0, this.target_time) - this.timer) / this.target_time;
        const color = chroma(this.color).alpha(alpha).rgba();

        RL_DrawTextEx(MAIN_FONT, this.text, {
            x: this.pos.x + (this.font_size * 0.05),
            y: this.pos.y + (this.font_size * 0.05)
        }, this.font_size, 0, chroma('black').alpha(0.65 * alpha).rgba());

        RL_DrawTextEx(MAIN_FONT, this.text, this.pos, this.font_size, 0, color);
    }
}

module.exports = TempText;
