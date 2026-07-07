class Player {
    pos = {x: 0, y: 0};
    dir = {x: 0, y: 0};

    damping = 0.15;

    velocity = {x: 0, y: 0};

    visual = {
        anim_scale: 0,
    };

    speed = 64;
    texture = undefined;

    constructor(x = 0, y = 0) {
        this.texture = GetAsset('texture.player');

        this.pos.x = x;
        this.pos.y = y;
    }

    update(dt) {
        this.dir.x = 0;
        this.dir.y = 0;

        let has_input = false;

        if (RL_IsKeyDown(RL_KeyboardKey.KEY_LEFT)) {
            this.dir.x -= 1;
            has_input = true;
        }

        if (RL_IsKeyDown(RL_KeyboardKey.KEY_RIGHT)) {
            this.dir.x += 1;
            has_input = true;
        }

        if (RL_IsKeyDown(RL_KeyboardKey.KEY_UP)) {
            this.dir.y -= 1;
            has_input = true;
        }

        if (RL_IsKeyDown(RL_KeyboardKey.KEY_DOWN)) {
            this.dir.y += 1;
            has_input = true;
        }

        let moving_x = Math.abs(this.dir.x) > 0;
        let moving_y = Math.abs(this.dir.y) > 0;

        if (moving_x || moving_y)
            this.visual.anim_scale += dt * 4;
        else
            this.visual.anim_scale -= dt * 4;

        this.visual.anim_scale = Clamp(this.visual.anim_scale, 0.0, 1.0);

        let speed_mult = 1;
        if (moving_x && moving_y)
            speed_mult = 0.65;

        this.velocity.x += this.dir.x * this.speed * speed_mult;
        this.velocity.y += this.dir.y * this.speed * speed_mult;


        this.pos.x += this.velocity.x * dt;
        this.pos.y += this.velocity.y * dt;


        this.velocity.x *= (1 - this.damping);
        this.velocity.y *= (1 - this.damping);

    }

    draw() {
        const anim_scale = this.visual.anim_scale;
        const timer = globalThis.timer;
        const pos = {
            x: 0,
            y: (Math.sin(timer * 12.0) * 4) * anim_scale,
        };

        let angle = (Math.cos(timer * 8.0) - Math.sin(timer * 10.0)) * anim_scale;

        pos.x += this.pos.x;
        pos.y += this.pos.y;


        const src = {
            x: 0,
            y: 0,
            width:  this.texture.width,
            height: this.texture.height,
        };

        const dest = {
            x: 0,
            y: 0,
            width:  this.texture.width  * 0.5,
            height: this.texture.height * 0.5,
        };


        this.texture.drawPro(src, dest, {x: 0, y: 0}, angle, 0.15, [255,255,255,50]);
        // this.texture.draw(pos, angle, 0.15, [255,255,255]);
    }
}

module.exports = Player;
