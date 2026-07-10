// const ENEMY_SPRITE_COUNT = 4;
const ENEMY_SPRITE_COUNT = 1;
const ENEMY_SHADER = new RL_Shader(null, "gfx/enemy.fs");

const RANDOM_COLORS = [
    'red',
    'brown',
    'chocolate',
    'goldenrod',
    'lavenderblush',
    'lawngreen',
    'coral',
];

const ENEMY_PALETTE = {
    red:   chroma(0xefc399),
    green: chroma(0x483a2d),
    blue:  chroma(0xaea8a8),
};

function getRandomColor() {
    return RANDOM_COLORS[ getRandomInt(0, RANDOM_COLORS.length) ];
}

class Enemy extends Humanoid {
    // speed = 256;
    speed = 32;

    // smooth_velocity = false;

    damage = 10;
    damage_cooldown = 0.15;
    damage_timer = 0;

    drop = undefined;

    palette = {};

    onDeath() {
        if (this.drop) {
            const center = this.body.getCenter();
            this.drop.pos.x = this.pos.x + center.x;
            this.drop.pos.y = this.pos.y + center.y;
            this.drop.pos.z = this.pos.y;

            ENTITIES.push(this.drop);
        }

        super.onDeath();
    }

    onCollision(other) {
        // this.collision_queue.push(other);
        // const other = this.collision_queue.pop();
        // console.log(other);
//         if ( other instanceof ENT_CLASS.Enemy ) {
//             // console.log('serperat')
//             other.x += (other.pos.x - this.pos.x);
//             other.y += (other.pos.y - this.pos.y);
//             // console.log('aaaaaa')
//
//             return;
//         }
        if (this.damage_timer > 0)
            return;

        if ( !(other instanceof ENT_CLASS.Player) )
            return;

        const it_hurt = other.doDamage(this.damage, (Math.PI * 2.0) * Math.random() );
        this.damage_timer = this.damage_cooldown;

        if (it_hurt) {
            this.visual.hit_angle = 15;
        }
    }

    constructor(params) {
        super(params);

        this.palette.red   = ENEMY_PALETTE.red.mix(getRandomColor(), Math.random() * 0.35).gl();
        this.palette.green = ENEMY_PALETTE.green.mix(getRandomColor(), Math.random()).desaturate(0.95).gl();
        this.palette.blue  = ENEMY_PALETTE.blue.gl();

        // console.log(this.color.red, this.color.blue, this.color.green);

        const atlas = GetAsset('texture.enemy');

        if (Math.random() < 0.60)
            this.drop = new ENT_CLASS.Dot(0, 0);

        this.hitbox.group = PHYS_GROUP.ENEMY;
        this.hitbox.mask = 0;
        this.setupBody(
            atlas,
            GetAsset('texture.shadow'),
            {
                x: 0,
                // y: 0,
                y: atlas.width * getRandomInt(0, ENEMY_SPRITE_COUNT),

                width:  atlas.width,
                height: atlas.width
            }
        );
        this.body.shadow_scale = 0.75;

        // this.visual.bob_speed = 1/32;
        this.visual.hit_angle = 0;

        this.hivemind = params.hivemind;
        this.health = this.hivemind.wave.health;
        this.speed = this.hivemind.wave.speed;

        this.target = params.target;
        this.pos.x = params.x;
        this.pos.y = params.y;
    }

    getTargetLine(target = this.target) {
        return new Vector2(
            target.pos.x - this.pos.x,
            target.pos.y - this.pos.y
        );
    }

    getReverseTargetLine(target = this.target) {
        return new Vector2(
            this.pos.x - target.pos.x,
            this.pos.y - target.pos.y
        );
    }

    update(dt) {
        super.update(dt);

        if (this.visual.hit_angle > 0) {
            this.visual.hit_angle -= dt * 60;
        }
        this.visual.extra_angle = this.visual.dir_x * this.visual.hit_angle;

        const new_dir = this.getTargetLine();
        new_dir.normalize();

        this.dir.x = new_dir.x;
        this.dir.y = new_dir.y;

        if (this.damage_timer > 0)
            this.damage_timer -= dt;


        // const target_velocity = {
        //     x: 0,
        //     y: 0
        // };


        // while (this.collision_queue.length > 0) {
        //
        //
        // }
        // if (this.damage_timer > 0)
        //     this.damage_timer -= dt;
        //
        // const new_dir = new Vector2(
        //     this.target.pos.x - this.pos.x,
        //     this.target.pos.y - this.pos.y
        // );
        // const dist = new_dir.magnitude();
        //
        // if (dist < 32) {
        //     this.velocity.x = 0;
        //     this.velocity.y = 0;
        //     return;
        // }
        //
        // new_dir.normalize();
        //
        // this.dir.x = new_dir.x;
        // this.dir.y = new_dir.y;

    }

    draw() {
        ENEMY_SHADER.setVec3("paletteRed",   this.palette.red);
        ENEMY_SHADER.setVec3("paletteGreen", this.palette.green);
        ENEMY_SHADER.setVec3("paletteBlue",  this.palette.blue);

        ENEMY_SHADER.apply(() => {
            super.draw();
        });
    }
}

module.exports = Enemy;
