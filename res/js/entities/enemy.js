// const ENEMY_SPRITE_COUNT = 4;
const ENEMY_SPRITE_COUNT = 1;

class Enemy extends Humanoid {
    // speed = 256;
    speed = 32;

    push_radius = 32;

    // smooth_velocity = false;

    damage = 10;
    damage_cooldown = 0.15;
    damage_timer = 0;

    collision_queue = [];

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

        other.doDamage(this.damage, (Math.PI * 2.0) * Math.random() );
        this.damage_timer = this.damage_cooldown;
    }

    constructor(params) {
        super(params);

        const atlas = GetAsset('texture.enemy');

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

        this.visual.bob_speed = 1/32;
        this.hivemind = params.hivemind;
        this.target = params.target;
        this.pos.x = params.x;
        this.pos.y = params.y;
    }

    update(dt) {
        super.update(dt);

        const new_dir = new Vector2(
            this.target.pos.x - this.pos.x,
            this.target.pos.y - this.pos.y
        );
        const dist = new_dir.magnitude();

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
}

module.exports = Enemy;
