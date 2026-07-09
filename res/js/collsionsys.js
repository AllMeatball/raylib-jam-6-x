const CollisionSystem = {
    collisionCallback(box1, box2) {
        box1.ent.onCollision(box2.ent);
        box2.ent.onCollision(box1.ent);
        // console.log(box1.x, box2.y)
    },

    update() {
        const boxes = [];
        for (const ent of ENTITIES) {
            if (!ent.collidable)
                continue;

            const box = ent.getHitbox();
            box.ent = ent;
            boxes.push(box);
        }

        RL_HandleBulkCollisionCheck(this, ...boxes);
    }
}


module.exports = CollisionSystem;
