class Projectile {
    pos = new Vector2();
    angle = 0;
    speed = 0;
    damage = 10;
    radius = 16;

    decay_target = 0.8;
    decay = 0;

    max_afterimages = 10;
    afterimages = [];
    // base_color = chroma('coral');

    collidable = true;

    onDecay() { }

    onCollision(other) {
        if (other instanceof Projectile || other instanceof ENT_CLASS.SpellDrop)
            return;

        if (other === this.creator)
            return;


        if (!this.delete) {
            other.doDamage(this.damage, this.angle);
            this.delete = true;
        }
    }

    constructor(params) {
        this.pos.x = params.x || 0;
        this.pos.y = params.y || 0;

        this.texture = GetAsset('texture.projectile');
        this.base_color = chroma.temperature( (params.speed / 512) * 2000).mix('red', 0.25).saturate() || this.base_color;
        this.color = this.base_color.darken(Math.sin(TIMER * 8.0)).rgb();

        this.angle = params.angle || 0;
        this.speed = params.speed || 512;
        this.damage = params.damage || 10;
        this.creator = params.creator;

        this.hitbox = {
            x: 0,
            y: 0,
            radius: this.radius,
            resolve: false,
            // width:  this.radius * 2.0,
            // height: this.radius * 2.0,
            mask:   PHYS_GROUP.PLAYER | PHYS_GROUP.PICKUP,
        };

        this.decay = params.decay_start || -0.5;
        this.decay_target = params.decay || 0.8;
    }

    getHitbox() {
        const hitbox = {...this.hitbox};
        hitbox.x += this.pos.x;
        hitbox.y += this.pos.y;

        return hitbox;
    }

    update(dt) {
        this.pos.x += Math.cos(this.angle) * this.speed * dt;
        this.pos.y += Math.sin(this.angle) * this.speed * dt;

        this.color = this.base_color.darken(Math.sin(TIMER * 8.0)).rgb();

        this.afterimages.push({
            pos: {
                x: this.pos.x - this.radius,
                y: this.pos.y - this.radius
            },
            color: this.color,
        });

        if (this.afterimages.length > this.max_afterimages)
            this.afterimages.shift();


        if (this.decay > this.decay_target) {
            if (!this.delete) {
                this.delete = true;
                this.onDecay();
            }

        } else {
            this.decay += dt;
        }
    }

    draw() {
        const decay_alpha = 1.0 - (Math.max(0, this.decay) / this.decay_target);
        // const decay_alpha = 1.0;
        const size = (this.radius / this.texture.width) * 2.0;

        for (let i = 0; i < this.afterimages.length; i++) {
            const afterimage = this.afterimages[i];
            const alpha = (i / this.max_afterimages) * 0.5;
            this.texture.draw(afterimage.pos, 0, size, chroma(afterimage.color).alpha(decay_alpha * alpha).rgba());
        }

        this.texture.draw( {
            x: this.pos.x - this.radius,
            y: this.pos.y - this.radius
        }, 0, size, chroma(this.color).alpha(decay_alpha).rgba());
    }
}

class TeleportProjectile extends Projectile {
    onDecay() {
        // console.log('zoop');
        GetAsset('sfx.teleport').play();

        this.creator.pos.x = this.pos.x;
        this.creator.pos.y = this.pos.y;
    }

    constructor(params) {
        super(params);
        this.decay = -0.1;
        this.decay_target = 0.4;
        this.base_color = chroma('magenta');
    }

    onCollision(_other) { }
}

module.exports = {
    Projectile: Projectile,
    TeleportProjectile: TeleportProjectile,
};
