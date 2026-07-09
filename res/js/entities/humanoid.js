class Humanoid {
    pos = new Vector2();
    dir = new Vector2();
    health = 100;

    color = [255,255,255];

    hitbox = {
        x: 310,
        y: 355,

        width: 428,
        height: 609,
    };

    damping = 0.15;

    velocity = new Vector2();

    visual = {
        timer: 0,
        anim_scale: 0,
        dir_x: 1,
    };

    speed = 48;
    collidable = true;

    doDamage(damage, angle) {
        this.health -= damage;

        if (angle) {
            const force = damage * 42;
            this.velocity.x += Math.cos(angle) * force;
            this.velocity.y += Math.sin(angle) * force;
        }
    }

    onDeath() {
        this.delete = true;
    }

    onCollision() {}

    constructor(params) {
        this.pos.x = params.x;
        this.pos.y = params.y;
    }

    setupBody(texture, shadow_texture, rect) {
        this.body = new Body(texture, shadow_texture, rect);

        this.hitbox.x *= this.body.scale;
        this.hitbox.y *= this.body.scale;
        this.hitbox.width  *= this.body.scale;
        this.hitbox.height *= this.body.scale;
    }

    getHitbox() {
        const hitbox = {...this.hitbox};
        hitbox.x += this.pos.x;
        hitbox.y += this.pos.y;

        return hitbox;
    }

    update(dt) {
        if (this.health < 0) {
            this.onDeath();
            return;
        }

        let moving_x = Math.abs(this.dir.x) > 0;
        let moving_y = Math.abs(this.dir.y) > 0;

        if (moving_x || moving_y)
            this.visual.anim_scale += dt * 8;
        else
            this.visual.anim_scale -= dt * 4;

        this.visual.anim_scale = Clamp(this.visual.anim_scale, 0.0, 1.0);
        this.visual.timer += dt * this.visual.anim_scale;

        let speed_mult = 1;
        if (moving_x && moving_y)
            speed_mult = 0.65;

        this.velocity.addVector2({
            x: this.dir.x * this.speed * speed_mult,
            y: this.dir.y * this.speed * speed_mult,
        });

        this.velocity.addVector2({
            x: this.velocity.x * dt,
            y: this.velocity.y * dt,
        });

        this.pos.x += this.velocity.x * dt;
        this.pos.y += this.velocity.y * dt;

        this.pos.x = Clamp(this.pos.x, -64, SCREEN_SIZE - 96);
        this.pos.y = Clamp(this.pos.y, -64, SCREEN_SIZE - 96);

        this.velocity.x *= (1 - this.damping);
        this.velocity.y *= (1 - this.damping);

        if (this.dir.x > 0 || this.dir.x < 0)
            this.visual.dir_x = Math.sign(this.dir.x);
    }

    draw() {
        const speed = this.speed / 6;
        const pos_offset = {
            x: 0,
            y: (Math.abs(Math.cos(this.visual.timer * speed)  * 4.0) - 4) * this.visual.anim_scale,
        };

        const angle = (Math.cos(this.visual.timer * (speed * 1.125))) * this.visual.anim_scale;

        this.body.draw(this.pos, pos_offset, angle, {x: 1}, this.color, this.visual.dir_x < 0);

        if (GLOBAL_FLAGS.includes("boxes")) {
            const center = this.body.getCenter();
            const hitbox = this.getHitbox();
            RL_DrawRectangle(hitbox, chroma('red').alpha(0.5).rgba());

            const player_origin = {
                x: this.pos.x + center.x,
                y: this.pos.y + center.y
            };

            if (this instanceof ENT_CLASS.Player)
                RL_DrawCircle(player_origin, this.wand.radius, chroma('yellow').alpha(0.5).rgba());
        }
    }
}

module.exports = Humanoid;
