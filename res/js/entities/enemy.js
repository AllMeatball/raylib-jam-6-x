// const ENEMY_SPRITE_COUNT = 4;
const ENEMY_SPRITE_COUNT = 1;

class Enemy extends Humanoid {
    speed = 60
    push_radius = 32
    push_rate = 64

    damage = 10;
    damage_cooldown = 0.15;
    damage_timer = 0;

    onCollision(other) {
        if (this.damage_timer > 0)
            return;

        if ( !(other instanceof ENT_CLASS.Player) )
            return;

        other.doDamage(this.damage, (Math.PI * 2.0) * Math.random() );
        this.damage_timer = this.damage_cooldown;
        // if (collider.damageEntity)
        //     collider.damageEntity(this);
    }

    constructor(params) {
        super(params);

        const atlas = GetAsset('texture.enemy');
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

        this.target = params.target;
        this.pos.x = params.x;
        this.pos.y = params.y;
    }

    update(dt) {
        super.update(dt);
        this.damage_timer -= dt;

        const new_dir = new Vector2(
            this.target.pos.x - this.pos.x,
            this.target.pos.y - this.pos.y
        );
        const dist = new_dir.magnitude();

        if (dist < 32) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            return;
        }

        new_dir.normalize();

        this.dir.x = new_dir.x;
        this.dir.y = new_dir.y;

        // console.log(dist);




        // current->x += dir.x * this.speed;
        // current->y += dir.y * this.speed;
        // self.dir.x =
    }
}

module.exports = Enemy;
