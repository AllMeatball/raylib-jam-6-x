class Player extends Humanoid {
    onDeath() {
        const result = super.onDeath();
        STATES.current.doGameover();

        return result;
    }

    heal(amount) {
        this.health += amount;
    }

    constructor(params) {
        params.health = 125;
        super(params);

        this.hitbox.group = PHYS_GROUP.PLAYER;

        this.setupBody(
            GetAsset('texture.player'),
            GetAsset('texture.shadow')
        );

        this.wand = new Wand(this);
        this.wand.slots.addSpell(new Spells.spell.Basic());
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

        this.pos.x = Clamp(this.pos.x, -64, SCREEN_SIZE - 96);
        this.pos.y = Clamp(this.pos.y, -64, SCREEN_SIZE - 96);

        this.wand.update(dt);

        if (RL_IsMouseButtonDown(RL_MouseButton.MOUSE_BUTTON_LEFT)) {
            RL_SetCursorEnabled(false);
            this.wand.cast();
        }
    }

    draw() {
        if (this.wand.backdraw)
            this.wand.draw();

        super.draw();

        if (!this.wand.backdraw)
            this.wand.draw();
    }

    getSpellSlots() {
        return this.wand.slots;
    }
}

class Wand {
    pos = new Vector2();
    cursor_pos = new Vector2();
    cast_timer = 0;
    cast_delay = 0.25;

    angle = 0;
    angle_offset = Math.PI/2;

    radius = 96;
    backdraw = true;

    slots = new Spells.SpellSlots();

    constructor(parent) {
        this.parent = parent;
        this.y_sensor = 355 * this.parent.body.size;

        this.pattern_sys = new PatternSystem(this);

        this.SFX_MAGIK = GetAsset('sfx.magik');
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
        let selected_index = undefined;
        if (RL_IsKeyPressed(RL_KeyboardKey.KEY_ONE)) {
            selected_index = 1;
        } else if (RL_IsKeyPressed(RL_KeyboardKey.KEY_TWO)) {
            selected_index = 2;
        } else if (RL_IsKeyPressed(RL_KeyboardKey.KEY_THREE)) {
            selected_index = 3;
        } else if (RL_IsKeyPressed(RL_KeyboardKey.KEY_FOUR)) {
            selected_index = 4;
        }

        if (selected_index !== undefined)
            this.slots.swapWithAux(selected_index);

        if (this.cast_timer > 0)
            this.cast_timer -= dt;

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

        // const wand_above_player = (this.pos.y) < (this.parent.hitbox.y + 48);
        const wand_above_player = (pos.y) < (this.y_sensor + 48);
        this.backdraw = MirrorRange(this.angle, 0.85) || wand_above_player;
    }

    cast() {
        if (this.cast_timer > 0)
            return;

        let delay = this.cast_delay;

        // console.log(`${this.slots.index}`)
        const result = this.slots.next(this);

        if (result === undefined) {
            this.cast_timer = 0;
            return;
        }

        if (result.delay)
            delay = result.delay;

        // console.log(delay);

        if (result.empty) {
            this.cast_timer = 0;
            return;
        }

        this.SFX_MAGIK.play();
        this.SFX_MAGIK.setPitch(0.85 + (Math.random() * 0.05));

        if (result.entities)
            ENTITIES.push(...result.entities);

        this.cast_timer = delay;
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
            this.parent.current_color
        );

        // const hitbox = this.parent.getHitbox();
    }
}

module.exports = Player;
