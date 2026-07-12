const SPELL_WEIGHTS = {
    sum_weight: 0,
    weights: {
        common: 50,
        uncommon: 30,
        rare: 15,
        legendary: 5
    },

    colors: {
        common:    chroma('limegreen').rgb(),
        uncommon:  chroma('cornflowerblue').rgb(),
        rare:      chroma('crimson').rgb(),
        legendary: chroma('darkviolet').rgb()
    },

    common:    [],
    uncommon:  [],
    rare:      [],
    legendary: []
}

for (const key in SPELL_WEIGHTS.weights) {
    const weight = SPELL_WEIGHTS.weights[key];
    SPELL_WEIGHTS.sum_weight += weight;
}

for (const key in Spells.spell) {
    const spell = Spells.spell[key];
    const spell_instance = new spell();

    const rarity = spell_instance.rarity;

    SPELL_WEIGHTS[rarity].push(spell);
}

function getRandomRarity() {
    // double the sum weight to fix polarity issues with rng (e.g. getting legendary too often)
    const rand_num = Math.floor(Math.random() * SPELL_WEIGHTS.sum_weight * 2);

    // const nearest_rarity = ''

    let cur_rarity = 'common';
    for (const key in SPELL_WEIGHTS.weights) {
        const rarity_weight = SPELL_WEIGHTS.weights[key];

        if (rand_num > rarity_weight) {
            cur_rarity = key;
            // console.log(cur_rarity, rand_num);
            break;
        }
    }
    return cur_rarity;
}

function getRandomSpell(rarity) {
    const rarity_weight = SPELL_WEIGHTS.weights[rarity];

    const table = SPELL_WEIGHTS[rarity];
    const spell = table[Math.floor(Math.random() * table.length)];

    const spell_instance = new spell();
    spell_instance.rarity_weight = rarity_weight;

    // console.log(spell);

    return spell_instance;
}

class Pickup {
    pos = new Vector2();
    color = chroma('white').rgb();

    decay = -5.0;
    decay_target = 0.2;

    collidable = true;
    hitbox = {
        x: 0,
        y: 0,
        radius: 32,

        group: PHYS_GROUP.PICKUP,
        mask: PHYS_GROUP.PLAYER
    };

    onPickup(_other) { }

    onCollision(other) {
        if ( !(other instanceof ENT_CLASS.Player) )
            return;

        this.onPickup(other);
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

        this.texture = params.texture;
    }

    update(dt) {
        if (this.decay > this.decay_target)
            this.delete = true;
        else
            this.decay += dt;
    }

    draw() {
        const decay_alpha = 1.0 - (Math.max(0, this.decay) / this.decay_target);
        // RL_DrawCircle(this.pos, this.hitbox.radius, [255,0,0]);

        const pos = {
            x: this.pos.x - this.hitbox.radius,
            y: this.pos.y - this.hitbox.radius
        }

        this.texture.draw(pos, 0, this.texture_size, chroma(this.color).brighten(0.35 + (Math.cos(TIMER * 3) * 0.5) ).alpha(decay_alpha).rgba());
    }
}

class SpellDrop extends Pickup {
    onPickup(other) {
        other.wand.slots.addSpell(this.spell);
        const text = new ENT_CLASS.TempText({
            text: this.spell.name,
            x: this.pos.x,
            y: this.pos.y,
            start_time: -0.5,
            time: 0.25
        });

        ENTITIES.push(text);

        PlayTempSound('sfx.pickup', (sound) => {
            sound.setVolume(0.65);
            sound.setPitch(1.0 + Math.random() * 0.25)
            sound.play();
        });
    }

    constructor(params) {
        super(params);
        this.texture = GetAsset('texture.spell');

        const rarity = getRandomRarity();
        const spell = getRandomSpell(rarity);
        spell.decay = (SPELL_WEIGHTS.sum_weight - spell.rarity_weight / 6) + 2;
        // console.log(spell);

        this.spell = spell;

        this.color = SPELL_WEIGHTS.colors[rarity];
        this.texture_size = (this.hitbox.radius / this.texture.width) * 2.0;
    }
}

class Potion extends Pickup {
    onPickup(other) {
        const amount = 6;
        other.heal(amount);

        const text = new ENT_CLASS.TempText({
            text: `HEALTH +${amount}`,
            x: this.pos.x,
            y: this.pos.y,
            color: chroma('crimson').rgb(),
            start_time: -0.5,
            time: 0.25
        });

        ENTITIES.push(text);

        PlayTempSound('sfx.potion', (sound) => {
            sound.setVolume(0.85);
            sound.setPitch(1.0 + Math.random() * 0.25)
            sound.play();
        });
    }

    constructor(params) {
        super(params);
        this.texture = GetAsset('texture.potion');

        this.color = chroma('red').rgb();
        this.decay = -2.5;
        this.decay_target = 2.5;
        this.texture_size = (this.hitbox.radius / this.texture.width) * 2.0;
    }
}

module.exports = {
    Pickup: Pickup,
    SpellDrop: SpellDrop,
    Potion: Potion,
};
