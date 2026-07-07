class Body {
    texture_scale = 0.15;
    texture = undefined;
    shadow_texture = undefined;

    constructor(texture, shadow_texture) {
        this.texture = texture;
        this.shadow_texture = shadow_texture;
    }

    draw(pos, pos_offset, angle, color) {
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


        this.shadow_texture.drawPro(src, dest, {x: 0, y: 0}, 0, [0,0,0,50]);

        // console.log(pos_offset);

        // pos.x += this.pos.x;
        // pos.y += this.pos.y;
        this.texture.draw({x: pos_offset.x + pos.x, y: pos_offset.y + pos.y}, angle, this.texture_scale, color);
    }
}

module.exports = Body;
