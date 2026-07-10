class Hivemind {
    pos = new Vector2();
    mob = [];

    constructor(target) {
        this.target = target;
    }

    finishingUpdate(dt) {
        const velocity_avg = new Vector2();
        for (let i = this.mob.length - 1; i >= 0; i--) {
            const enemy = this.mob[i];
            if (enemy.delete) {
                if (enemy == this.leader)
                    this.leader = undefined;

                this.mob.splice(i, 1);
            }
        }
    }

    create(count) {
        for (let i = 0; i < count; i++) {
            const mouse_pos = RL_GetMousePosition();
            const enemy = new ENT_CLASS.Enemy({
                target: this,
                hivemind: this,
                x: mouse_pos.x,
                y: mouse_pos.y
            });


            ENTITIES.push(enemy);
            this.add(enemy);
        }
    }

    spawnWave(count) {
        for (let i = 0; i < count; i++) {
            const mouse_pos = RL_GetMousePosition();
            const angle = getRandomInt(0, 360) * (Math.PI / 180);
            const enemy = new ENT_CLASS.Enemy({
                target: this,
                hivemind: this,
                x: (Math.cos(angle) * SCREEN_SIZE) + SCREEN_SIZE * 0.5,
                y: (Math.sin(angle) * SCREEN_SIZE) + SCREEN_SIZE * 0.5
            });
            console.log(angle);


            ENTITIES.push(enemy);
            this.add(enemy);
        }
    }


    createLeader(target) {
        const mouse_pos = RL_GetMousePosition();
        const enemy = new ENT_CLASS.Enemy({
            target: target,
            hivemind: this,
            x: mouse_pos.x,
            y: mouse_pos.y
        });

        ENTITIES.push(enemy);
        this.add(enemy);

        this.leader = enemy;
    }

    assignLeader(enemy) {
        this.leader = enemy;
        this.leader.target = this.target;
    }

    add(...guys) {
        this.mob.push(...guys);
    }

    update(dt) {
        // if (this.mob.length <= 1) {
            this.pos.x = this.target.pos.x;
            this.pos.y = this.target.pos.y;
            // return;
        // }

        // if (!this.leader)
        //     this.assignLeader(this.mob[0]);
        //
        // this.pos.x = this.leader.pos.x;
        // this.pos.y = this.leader.pos.y;

        this.finishingUpdate(dt);
    }
}


module.exports = Hivemind;
