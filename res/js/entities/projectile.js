class Projectile {
    pos = new Vector2();
    angle = 0;
    speed = 0;
    radius = 16;

    decay_target = 0.8;
    decay = 0;

    max_afterimages = 6;
    afterimages = [];
    base_color = chroma('coral');

    collidable = true;

    constructor(creator, x, y, angle, speed) {
        this.pos.x = x;
        this.pos.y = y;
        this.texture = GetAsset('texture.projectile');

        this.angle = angle;
        this.speed = speed;
        this.creator = creator;

        this.hitbox = {
            x: 0,
            y: 0,
            width:  this.radius * 2.0,
            height: this.radius * 2.0
        };

        this.decay = -0.5;
    }

    damageEntity(entity) {
        if (entity === this.creator)
            return;

        if (entity instanceof Projectile)
            return;

        entity.velocity.x += 32;
        entity.velocity.y += 32;
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
            this.delete = true;
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

module.exports = Projectile;
