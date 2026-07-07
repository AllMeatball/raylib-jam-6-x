class Dot {
    pos = new Vector2();
    color = chroma('red').rgb();

    constructor(x, y) {
        this.pos.x = x;
        this.pos.y = y;
    }

    update(_dt) { }
    draw() {
        RL_DrawCircle(this.pos, 16, this.color);
    }
}

module.exports = Dot;
