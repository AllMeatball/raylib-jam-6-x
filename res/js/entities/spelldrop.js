class SpellDrop {
    pos = new Vector2();
    color = chroma('white').rgb();

    collidable = true;
    hitbox = {
        x: 0,
        y: 0,
        radius: 16,

        group: PHYS_GROUP.PICKUP,
        mask: PHYS_GROUP.PLAYER
    };

    onCollision(other) {
        if ( !(other instanceof ENT_CLASS.Player) )
            return;

        const text = new ENT_CLASS.TempText({
            x: this.pos.x,
            y: this.pos.y,
            start_time: -0.5,
            time: 0.25
        });
        - this.hitbox.radius
         - this.hitbox.radius
        ENTITIES.push(text);

        this.delete = true;
    }

    getHitbox() {
        const hitbox = {...this.hitbox};
        hitbox.x += this.pos.x;
        hitbox.y += this.pos.y;

        return hitbox;
    }

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
