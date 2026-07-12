const DEFAULT_STATE = {
    speed_scale: 1,
    damage_scale: 1,
    repeats: 1,
    repeat_index: 0,
};

class SpellSlots {
    index = 0;
    last_valid_index = 0;
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
        for (let i = 0; i < this.max_slots; i++) {
            const is_slot_free = !this.slots[i];

            if (is_slot_free) {
                this.slots[i] = spell;
                return;
            }
        }

        this.aux_slot = spell;
    }

    next(caller) {
        if (this.max_slots <= 0)
            return;

        // console.log(this.index);
        if (this.index >= this.max_slots) {
            this.index = 0;
            this.state = {...DEFAULT_STATE};
        }

        let spell = this.slots[this.index];

        // if (!spell) {
        //     this.index++;
        //     return;
        // }

        let result = undefined;

        if (spell) {
            result = spell.activate(caller, this);
            this.last_valid_index = this.index;
        }

        let no_repeats = false;
        if (result)
            no_repeats = result.no_repeats

        if (this.state.repeat_index < this.state.repeats-1 && !no_repeats) {
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
    name = "Basic";
    rarity = "common";

    activate (wand, slots) {
        const pos = wand.getAbsolutePos();
        return {
            entities: [new ENT_CLASS.Projectile({
                creator: wand.parent,
                x: pos.x,
                y: pos.y,
                damage: 10 * slots.state.damage_scale,
                angle: wand.angle,
                speed: 512 * slots.state.speed_scale
            })]
        };
    }
}

class CircleSpell {
    name = "Circle";
    rarity = "common";
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
                damage: 2 * slots.state.damage_scale,
                decay: 0.1
            });

            result.entities.push(proj);
        }

        return result;
    }
}

class SpeedBoostSpell {
    name = "Proj. Speed";
    rarity = "uncommon";

    activate (_, slots) {
        slots.state.speed_scale *= 2;

        return {
            empty: true
        };
    }
}


class SpellLarge {
    name = "Large";
    rarity = "uncommon";

    activate (wand, slots) {
        const pos = wand.getAbsolutePos();
        return {
            entities: [new ENT_CLASS.Projectile({
                creator: wand.parent,
                radius: 48,
                hits: 40,
                x: pos.x,
                y: pos.y,
                damage: 24 * slots.state.damage_scale,
                angle: wand.angle,
                speed: 360 * slots.state.speed_scale
            })]
        };
    }
}

class DoubleSpell {
    name = "Double Cast";
    rarity = "rare";

    activate (_, slots) {
        slots.state.repeats *= 2;

        return {
            empty: true,
            no_repeats: true,
        };
    }
}

class DoubleDamageSpell {
    name = "Dbl-Damage"
    rarity = "legendary";

    activate (_, slots) {
        slots.state.damage_scale *= 2;

        return {
            empty: true,
        };
    }
}

class TeleportSpell {
    name = "Teleport";
    rarity = "rare";

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
        Basic:     BasicSpell,
        Large:     SpellLarge,
        Circle:    CircleSpell,
        Double:    DoubleSpell,
        Teleport:  TeleportSpell,
        DblDamage: DoubleDamageSpell,
        Speed:     SpeedBoostSpell
    }
}


