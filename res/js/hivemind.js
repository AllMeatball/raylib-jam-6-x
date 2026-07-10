class Hivemind {
    pos = new Vector2();
    mob = [];

    wave = {
        sound: GetAsset('sfx.wave'),

        number: 0,
        timer: 1,

        count: 10,
        health: 15,
        speed: 32
    };

    constructor(target) {
        this.target = target;
    }

    finishingUpdate(dt) {
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

    spawnWave() {
        this.wave.number++;
        this.wave.sound.play();

        console.log(`spawned wave ${this.wave.number}`)
        for (let i = 0; i < this.wave.count; i++) {
            const angle = getRandomInt(0, 360) * (Math.PI / 180);
            const enemy = new ENT_CLASS.Enemy({
                target: this,
                hivemind: this,
                x: (Math.cos(angle) * SCREEN_SIZE) + SCREEN_SIZE * 0.5,
                y: (Math.sin(angle) * SCREEN_SIZE) + SCREEN_SIZE * 0.5
            });
            // console.log(angle);

            ENTITIES.push(enemy);
            this.add(enemy);
        }

        this.wave.timer = getRandomInt(2, 7);
        this.wave.count += 5;
        this.wave.speed *= 1.15;
        this.wave.health *= 1.05;
        this.wave.damage *= 1.025;
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

    assignLeader() {
        let cur_dist = Infinity;
        let new_leader = undefined;
        for (const enemy of this.mob) {
            if (!enemy)
                continue;

            const target_line = enemy.getReverseTargetLine(this.target);
            const dist = target_line.magnitude();

            if (dist < cur_dist) {
                cur_dist = dist;
                new_leader = enemy;
            }
        }

        if (!new_leader)
            return;

        this.leader = new_leader;
        this.leader.target = this.target;
    }

    add(...guys) {
        this.mob.push(...guys);
    }

    update(dt) {
        if (this.mob.length <= 0) {
            this.pos.x = this.target.pos.x;
            this.pos.y = this.target.pos.y;

            this.wave.timer -= dt;

            if (this.wave.timer < 0)
                this.spawnWave();

            return;
        }

        // if (!this.leader)
        this.assignLeader();

        this.pos.x = this.leader.pos.x;
        this.pos.y = this.leader.pos.y;

        this.finishingUpdate(dt);
    }
}


module.exports = Hivemind;
