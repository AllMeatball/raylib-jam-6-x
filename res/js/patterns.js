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
        for (const item of tmp_queue) {
            item.timer -= dt;
            if (item.timer < 0)
                this.queue.splice();
        }
    }
}

module.exports = PatternSystem;
