class Body {
    scale = 0.15;
    texture = undefined;
    shadow_texture = undefined;

    constructor(texture, shadow_texture, rect) {
        this.texture = texture;
        this.shadow_texture = shadow_texture;

        if (rect === undefined) {
            this.rect = {
                x: 0,
                y: 0,
                width:  this.texture.width,
                height: this.texture.height
            };
        } else {
            this.rect = rect;
        }
    }

    getCenter() {
        return {
            x: (this.rect.width  * this.scale) * 0.5,
            y: (this.rect.height * this.scale) * 0.5
        };
    }

    drawSprite(pos, center, angle, scale, color) {
        const src = {
            x: this.rect.x,
            y: this.rect.y,
            width:  this.rect.width,
            height: this.rect.height,
        };

        const dest = {
            x: pos.x,
            y: pos.y,
            width:  this.rect.width  * scale.x,
            height: this.rect.height * scale.y,
        };

        this.texture.drawPro(
            src,
            dest,
            center,
            angle,
            color
        );
    }

    draw(pos, pos_offset, angle, scale, color) {
        if (scale.y === undefined)
            scale.y = scale.x;

        const src = {
            x: 0,
            y: 0,
            width:  this.shadow_texture.width,
            height: this.shadow_texture.height,
        };

        const shadow_width  = this.rect.width * this.scale;
        const shadow_height = (this.rect.height * this.scale * 0.25);
        const dest = {
            x: pos.x,
            y: pos.y + (this.rect.height * this.scale) - shadow_height + 16,
            width:  shadow_width,
            height: shadow_height,
        };

        if (GLOBAL_FLAGS.includes("boxes")) {
            RL_DrawRectangle({
                x: pos.x,
                y: pos.y,
                width:  this.rect.width  * this.scale,
                height: this.rect.height * this.scale
            }, chroma('cyan').alpha(0.5).rgba());
        }
        this.shadow_texture.drawPro(src, dest, {x: 0, y: 0}, 0, [0,0,0, 0.20]);
        // console.log(pos_offset);

        scale.x *= this.scale;
        scale.y *= this.scale;

        const center = this.getCenter();
        this.drawSprite(
            {
                x: (pos_offset.x + center.x + pos.x),
                y: (pos_offset.y + center.y + pos.y)
            }, center, angle, scale, color
        );
    }
}

module.exports = Body;
