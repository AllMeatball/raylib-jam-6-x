const SFX_MAGIK = new RL_Sound("sfx/magik.ogg");

class Wand {
    pos = new Vector2();
    cursor_pos = new Vector2();

    angle = 0;
    angle_offset = Math.PI/2;

    radius = 96;
    backdraw = true;

    constructor(parent) {
        this.parent = parent;
        this.pattern_sys = new PatternSystem(this);

        this.texture = GetAsset('texture.player.wand');
    }

    getAbsolutePos() {
        const abs_pos = this.pos.copy();
        const player_center = this.parent.body.getCenter();

        abs_pos.x += this.parent.pos.x + player_center.x;
        abs_pos.y += this.parent.pos.y + player_center.y;

        return abs_pos;
    }

    update(dt) {
        const mouse_delta = RL_GetMouseDelta();

        mouse_delta.x *= 0.45;
        mouse_delta.y *= 0.45;

        this.pos.x += mouse_delta.x;
        this.pos.y += mouse_delta.y;

        this.pos.circleClamp(this.radius);

        this.angle = (
            Math.atan2(
                this.pos.y,
                this.pos.x
            )
        ) % (Math.PI*2);

        const pos = this.getAbsolutePos();
        const hitbox = this.parent.getHitbox();

        // const wand_above_player = (this.pos.y) < (this.parent.hitbox.y + 48);
        const wand_above_player = (pos.y) < (hitbox.y + 48);
        this.backdraw = MirrorRange(this.angle, 0.85) || wand_above_player;
    }

    cast() {
        SFX_MAGIK.play();
        SFX_MAGIK.setPitch(0.85 + (Math.random() * 0.05));

        const pos = this.getAbsolutePos();
        globalThis.ENTITIES.push(new ENT_CLASS.Projectile(this.parent, pos.x, pos.y, this.angle, 512));
    }

    draw() {
        const wand_center = {
            x: (this.texture.width  * this.parent.body.scale) * 0.5,
            y: (this.texture.height * this.parent.body.scale) * 0.5,
        };

        const pos = this.getAbsolutePos();
        RL_DrawTextureAtOrigin(
            this.texture,
            wand_center,
            pos,
            (this.angle_offset + this.angle) * RAD2DEG,
            {x: this.parent.body.scale},
            this.parent.color
        );

        // const hitbox = this.parent.getHitbox();
    }
}

class Player {
    pos = new Vector2();
    dir = new Vector2();

    color = [255,255,255];

    hitbox = {
        x: 310,
        y: 355,

        width: 428,
        height: 609,
    };

    damping = 0.15;

    velocity = new Vector2();
    wand = new Wand(this);

    visual = {
        timer: 0,
        anim_scale: 0,
    };

    speed = 48;
    collidable = true;

    onCollision(collider) {
        // if (collider.damageEntity)
        //     collider.damageEntity(this);
    }

    constructor(x = 0, y = 0) {
        this.body = new Body(
            GetAsset('texture.player'),
            GetAsset('texture.shadow')
        );

        this.pos.x = x;
        this.pos.y = y;

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
        this.dir.x = 0;
        this.dir.y = 0;

        if (RL_IsKeyDown(RL_KeyboardKey.KEY_A))
            this.dir.x -= 1;
        if (RL_IsKeyDown(RL_KeyboardKey.KEY_D))
            this.dir.x += 1;
        if (RL_IsKeyDown(RL_KeyboardKey.KEY_W))
            this.dir.y -= 1;
        if (RL_IsKeyDown(RL_KeyboardKey.KEY_S))
            this.dir.y += 1;

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

        if (RL_IsMouseButtonPressed(RL_MouseButton.MOUSE_BUTTON_LEFT)) {
            RL_SetCursorEnabled(false);
            this.wand.cast();
        }

        this.wand.update(dt);
    }

    draw() {
        const pos_offset = {
            x: 0,
            y: (Math.abs(Math.cos(this.visual.timer * 8.0)  * 4.0) - 4) * this.visual.anim_scale,
        };

        const angle = (Math.cos(this.visual.timer * 9.0)) * this.visual.anim_scale;

        if (this.wand.backdraw)
            this.wand.draw();

        this.body.draw(this.pos, pos_offset, angle, {x: 1}, this.color);
        if (GLOBAL_FLAGS.includes("boxes")) {
            const center = this.body.getCenter();
            const hitbox = this.getHitbox();
            RL_DrawRectangle(hitbox, chroma('red').alpha(0.5).rgba());

            const player_origin = {
                x: this.pos.x + center.x,
                y: this.pos.y + center.y
            };

            RL_DrawCircle(player_origin, this.wand.radius, chroma('yellow').alpha(0.5).rgba());
        }

        if (!this.wand.backdraw)
            this.wand.draw();
    }
}

module.exports = Player;
