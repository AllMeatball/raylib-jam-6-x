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

class Player extends Humanoid {
    wand = new Wand(this);

    onDeath() {
        super.onDeath();
        STATES.current.doGameover();
    }

    constructor(params) {
        super(params);

        this.hitbox.group = 1;

        this.setupBody(
            GetAsset('texture.player'),
            GetAsset('texture.shadow')
        );
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

        super.update(dt);

        if (RL_IsMouseButtonPressed(RL_MouseButton.MOUSE_BUTTON_LEFT)) {
            RL_SetCursorEnabled(false);
            this.wand.cast();
        }

        this.wand.update(dt);
    }

    draw() {
        if (this.wand.backdraw)
            this.wand.draw();

        super.draw();

        if (!this.wand.backdraw)
            this.wand.draw();
    }
}

module.exports = Player;
