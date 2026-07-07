class Body {
    texture_scale = 0.15;
    texture = undefined;
    shadow_texture = undefined;

    constructor(texture, shadow_texture) {
        this.texture = texture;
        this.shadow_texture = shadow_texture;
    }

    getCenter() {
        return {
            x: (this.texture.width  * this.texture_scale) * 0.5,
            y: (this.texture.height * this.texture_scale) * 0.5
        };
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

        const shadow_width = this.texture.width * this.texture_scale;
        const shadow_height = (this.texture.height * this.texture_scale * 0.25);
        const dest = {
            x: pos.x,
            y: pos.y + (this.texture.height * this.texture_scale) - shadow_height + 16,
            width:  shadow_width,
            height: shadow_height,
        };

        if (GLOBAL_FLAGS.includes("boxes")) {
            RL_DrawRectangle({
                x: pos.x,
                y: pos.y,
                width:  this.texture.width * this.texture_scale,
                height: this.texture.height * this.texture_scale
            }, chroma('cyan').alpha(0.5).rgba());
        }
        this.shadow_texture.drawPro(src, dest, {x: 0, y: 0}, 0, [0,0,0, 0.20]);
        // console.log(pos_offset);

        scale.x *= this.texture_scale;
        scale.y *= this.texture_scale;

        const center = this.getCenter();

        RL_DrawTextureAtOrigin(
            this.texture,
            center,
            {
                x: (pos_offset.x + center.x + pos.x),
                y: (pos_offset.y + center.y + pos.y)
            },
            angle,
            scale,
            color
        );
    }
}

module.exports = Body;
