const CollisionSystem = {
    checkEntity(ent1) {
        if (!ent1.collidable)
            return;

        const box1 = ent1.getHitbox();
        for (const ent2 of ENTITIES) {
            if (!ent2.collidable || ent1 === ent2)
                continue;

            const box2 = ent2.getHitbox();
            const is_colliding = (
                box1.x < box2.x + box2.width &&
                box1.x + box1.width > box2.x &&

                box1.y < box2.y + box2.height &&
                box1.y + box1.height > box2.y
            );

            if (is_colliding) {
                if (ent1.onCollision)
                    ent1.onCollision(ent2);

                if (ent2.onCollision)
                    ent2.onCollision(ent1);
            }
        }
    },

    update() {
        for (const ent of ENTITIES)
            this.checkEntity(ent);
    }
}


module.exports = CollisionSystem;
