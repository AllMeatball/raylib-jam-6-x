class SpellDrop {
    pos = new Vector2();
    color = chroma('red').rgb();

    constructor(params) {
        this.pos.x = params.x;
        this.pos.y = params.y;
    }

    update(_dt) { }
    draw() {
        RL_DrawCircle(this.pos, 16, this.color);
    }
}

module.exports = SpellDrop;
