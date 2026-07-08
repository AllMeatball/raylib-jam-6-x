const ENEMY_SPRITE_COUNT = 4;

class Enemy extends Humanoid {
    onCollision(collider) {
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

        this.hitbox.x      *= this.body.scale;
        this.hitbox.y      *= this.body.scale;
        this.hitbox.width  *= this.body.scale;
        this.hitbox.height *= this.body.scale;
    }

    update(dt) {
        super.update(dt);
    }
}

module.exports = Enemy;
