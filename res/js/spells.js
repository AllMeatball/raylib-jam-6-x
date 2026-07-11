const DEFAULT_STATE = {
    speed_scale: 1,
    repeats: 1,
    repeat_index: 0,
};

class SpellSlots {
    index = 0;
    max_slots = 4;

    slots = [];
    aux_slot = undefined;

    constructor() {
        this.state = {...DEFAULT_STATE};
    }

    swapWithAux(index) {
        index--;

        if (index < 0 || index > this.max_slots)
            return;

        const slot_n_item = this.slots[index];

        this.slots[index] = this.aux_slot;
        this.aux_slot = slot_n_item;
    }

    addSpell(spell) {
        if (this.slots.length >= this.max_slots) {
            this.aux_slot = spell;
            return;
        }

        for (let i = 0; i < this.max_slots; i++) {
            const is_slot_free = this.slots[i] === undefined;

            if (is_slot_free) {
                this.slots[i] = spell;
                break;
            }
        }
    }

    next(caller) {
        if (this.max_slots <= 0)
            return;

        // console.log(this.index);
        if (this.index >= this.slots.length) {
            this.index = 0;
            this.state = {...DEFAULT_STATE};
        }

        let spell = this.slots[this.index];

        if (!spell) {
            this.index++;
            return { delay: 0 };
        }

        const result = spell.activate(caller, this);
        if (this.state.repeat_index < this.state.repeats-1 && !result.no_repeats) {
            // console.log(this.index, this.state.repeat_index, this.state.repeats);
            this.state.repeat_index++;
        } else {
            this.state.repeat_index = 0;
            this.index++;
        }

        return result;
    }
}

class BasicSpell {
    name = "Basic"
    activate (wand, slots) {
        const pos = wand.getAbsolutePos();
        return {
            entities: [new ENT_CLASS.Projectile({
                creator: wand.parent,
                x: pos.x,
                y: pos.y,
                angle: wand.angle,
                speed: 512 * slots.state.speed_scale
            })]
        };
    }
}

class CircleSpell {
    name = "Circle";
    amount = 20;

    activate (wand, slots) {
        const pos = wand.getAbsolutePos();
        const result = {
            entities: [],
        }

        const PI_SLICE = (Math.PI*2) / this.amount;

        for (let i = 0; i < this.amount; i++) {
            const cur_slice = PI_SLICE * i;
            const proj = new ENT_CLASS.Projectile({
                creator: wand.parent,
                x: pos.x,
                y: pos.y,
                angle: cur_slice,
                speed: 420 * slots.state.speed_scale,
                damage: 2,
                decay: 0.3
            });

            result.entities.push(proj);
        }

        return result;
    }
}

class SpeedBoostSpell {
    name = "Proj. Speed"

    activate (_, slots) {
        slots.state.speed_scale *= 2;

        return {
            delay: 0
        };
    }
}

class DoubleSpell {
    name = "Double Cast"

    activate (_, slots) {
        slots.state.repeats *= 2;

        return {
            delay: 0,
            no_repeats: true,
        };
    }
}

class TeleportSpell {
    name = "Teleport"

    activate (wand, slots) {
        const pos = wand.getAbsolutePos();
        return {
            entities: [new ENT_CLASS.TeleportProjectile({
                creator: wand.parent,
                x: pos.x,
                y: pos.y,
                angle: wand.angle,
                speed: 512 * slots.state.speed_scale
            })]
        };
    }
}


module.exports = {
    SpellSlots: SpellSlots,
    spell: {
        Basic:    BasicSpell,
        Circle:   CircleSpell,
        Double:   DoubleSpell,
        // Teleport: TeleportSpell,
        Speed:    SpeedBoostSpell
    }
}


