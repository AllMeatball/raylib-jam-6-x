class Pattern {
    constructor(params) {

    }
};


class PatternSystem {
    inventory = []
    constructor(creator) {
        this.creator = creator;
    }

    next() {
        if (this.queue.length <= 0)
            return;

        const item = this.queue.pop();

        const result = item.action(this.creator);
        queue.push(result);

        ENTITIES.push(...result.entities);

        return result;
    }
    // update(dt) {
    //     const tmp_queue = [...this.queue];
    //
    //     for (let i = 0; i < tmp_queue.length; i++) {
    //         const item = tmp_queue[i];
    //
    //         // item.timer -= dt;
    //         // if (item.timer < 0) {
    //         ENTITIES.push(...item.entities);
    //         this.queue.splice(i);
    //         continue;
    //         // }
    //
    //         break;
    //     }
    // }
}

module.exports = PatternSystem;
