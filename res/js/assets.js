const player_texture = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/wizzy.png", "texture.player");
player_texture.genMipmaps();
player_texture.wrap = RL_TextureWrap.TEXTURE_WRAP_CLAMP;
player_texture.filter = RL_TextureFilter.TEXTURE_FILTER_BILINEAR;

const shadow = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/shadow.png", "texture.shadow");
shadow.wrap = RL_TextureWrap.TEXTURE_WRAP_CLAMP;
shadow.filter = RL_TextureFilter.TEXTURE_FILTER_BILINEAR;

