class Humanoid {
    pos = new Vector2();
    dir = new Vector2();
    health = 100;

    color = [255,255,255];
    color_target = chroma('orangered').rgb();

    color_blend = 0;

    iframes = 0;
    iframes_max = 0.25;

    hitbox = {
        x: 0,
        y: 32,
        // width: 32,
        // height: 32,

        radius: 32,
        resolve: true,
    };


    damping = 0.15;
    // smooth_velocity = true;

    velocity = new Vector2();

    visual = {
        timer: 0,
        bob_speed: 0.16,
        extra_angle: 0,
        anim_scale: 0,
        dir_x: 1,
    };

    speed = 48;
    collidable = true;

    doDamage(damage, angle) {
        if (this.iframes > 0)
            return false;

        this.health -= damage;

        if (this.health < 0)
            this.health = 0;

        if (angle) {
            const force = damage * 42;
            this.velocity.x += Math.cos(angle) * force;
            this.velocity.y += Math.sin(angle) * force;
        }

        PlayTempSound('sfx.hit', (sound) => {
            sound.setVolume(0.40);
            sound.setPitch(0.85 - Math.random() * 0.25)
            sound.play();
        });

        this.color_blend = 1.0;
        this.iframes = this.iframes_max;

        return true;
    }

    onDeath() {
        this.delete = true;
    }

    onCollision() {}

    constructor(params) {
        this.pos.x = params.x;
        this.pos.y = params.y;

        if (params.health)
            this.health = params.health;
    }

    setupBody(texture, shadow_texture, rect) {
        this.body = new Body(texture, shadow_texture, rect);

        // this.hitbox.x *= this.body.scale;
        // this.hitbox.y *= this.body.scale;
        // this.hitbox.width  *= this.body.scale;
        // this.hitbox.height *= this.body.scale;
    }

    getHitbox() {
        const hitbox = {...this.hitbox};
        const center = this.body.getCenter();

        hitbox.x += this.pos.x + center.x;
        hitbox.y += this.pos.y + center.y;

        return hitbox;
    }

    update(dt) {
        if (this.iframes > 0)
            this.iframes -= dt;

        if (this.color_blend > 0)
            this.color_blend -= dt;

        if (this.health <= 0) {
            this.onDeath();
            return;
        }

        let moving_x = Math.abs(this.dir.x) > 0;
        let moving_y = Math.abs(this.dir.y) > 0;

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

        if (moving_x || moving_y)
            this.visual.anim_scale += dt * 8;
        else
            this.visual.anim_scale -= dt * 4;

        this.visual.anim_scale = Clamp(this.visual.anim_scale, 0.0, 1.0);
        this.visual.timer += dt * this.visual.anim_scale;

        if (this.dir.x > 0 || this.dir.x < 0)
            this.visual.dir_x = Math.sign(this.dir.x);

        this.velocity.x *= (1 - this.damping);
        this.velocity.y *= (1 - this.damping);

        this.pos.x += this.velocity.x * dt;
        this.pos.y += this.velocity.y * dt;
    }

    draw() {
        const speed = this.speed * this.visual.bob_speed;
        const pos_offset = {
            x: 0,
            y: (Math.abs(Math.cos(this.visual.timer * speed) * 4.0) - 4) * this.visual.anim_scale,
        };

        const angle = (Math.cos(this.visual.timer * (speed * 1.125)) + this.visual.extra_angle) * this.visual.anim_scale;

        this.body.draw(this.pos, pos_offset, angle, {x: 1}, chroma(this.color).mix(this.color_target, this.color_blend).rgb(), this.visual.dir_x < 0);

        if (GLOBAL_FLAGS.includes("boxes")) {
            const hitbox = this.getHitbox();

            RL_DrawCircle({x: hitbox.x, y: hitbox.y}, this.hitbox.radius, chroma('red').alpha(0.5).rgba());

            if (this instanceof ENT_CLASS.Player) {
                const center = this.body.getCenter();
                const player_origin = {
                    x: this.pos.x + center.x,
                    y: this.pos.y + center.y
                };

                RL_DrawCircle(player_origin, this.wand.radius, chroma('yellow').alpha(0.5).rgba());
            }
        }
    }
}

module.exports = Humanoid;
