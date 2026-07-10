const CollisionSystem = {
    collisionCallback(box1, box2, resolved1, resolved2) {
        // console.log(resolved1, resolved2);

        if (box1.resolve && box2.resolve) {
            box1.ent.velocity.x += resolved1.x;
            box1.ent.velocity.y += resolved1.y;

            box2.ent.velocity.x += resolved2.x;
            box2.ent.velocity.y += resolved2.y;
        }

        box1.ent.onCollision(box2.ent);
        box2.ent.onCollision(box1.ent);

        // box2.ent.pos.addVector2Scalar(resolved1, 10000);

        // console.log(box1, box2);
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
