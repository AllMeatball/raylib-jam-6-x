function getRandomSpell() {
    const keys = Object.keys(Spells.spell);
    const key = keys[getRandomInt(0, keys.length)];

    return new Spells.spell[key]();
}

class SpellDrop {
    pos = new Vector2();
    color = chroma('white').rgb();

    collidable = true;
    hitbox = {
        x: 0,
        y: 0,
        radius: 32,

        group: PHYS_GROUP.PICKUP,
        mask: PHYS_GROUP.PLAYER
    };

    onCollision(other) {
        if ( !(other instanceof ENT_CLASS.Player) )
            return;

        const spell = getRandomSpell();
        other.wand.slots.addSpell(spell);

        const text = new ENT_CLASS.TempText({
            text: spell.name,
            x: this.pos.x,
            y: this.pos.y,
            start_time: -0.5,
            time: 0.25
        });
        - this.hitbox.radius
        - this.hitbox.radius
        ENTITIES.push(text);

        // this.wand.slots.addSpell(new Spells.spell.Circle());
        // this.wand.slots.addSpell(new Spells.spell.Teleport());

        PlayTempSound('sfx.pickup', (sound) => {
            // sound.setVolume(0.40);
            sound.setPitch(1.0 + Math.random() * 0.25)
            sound.play();
        });
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

        this.texture = GetAsset('texture.spell');
        this.texture_size = (this.hitbox.radius / this.texture.width) * 2.0;
    }

    update(_dt) { }
    draw() {
        // RL_DrawCircle(this.pos, this.hitbox.radius, [255,0,0]);

        const pos = {
            x: this.pos.x - this.hitbox.radius,
            y: this.pos.y - this.hitbox.radius
        }
        this.texture.draw(pos, 0, this.texture_size, this.color);
    }
}

module.exports = SpellDrop;
