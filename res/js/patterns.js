class PatternSystem {
    queue = []
    constructor(creator) {
        this.creator = creator;
    }

    doPattern(pattern) {
        for (const action of pattern) {
            const result = action(this);
            queue.push(result);
        }
    }

    update(dt) {
        const tmp_queue = [...this.queue];

        for (let i = 0; i < tmp_queue.length; i++) {
            const item = tmp_queue[i];

            item.timer -= dt;
            if (item.timer < 0) {
                ENTITIES.push(...item.entities);
                this.queue.splice(i);
                continue;
            }

            break;
        }
    }
}

module.exports = PatternSystem;
