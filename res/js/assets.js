const player_texture = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/wizzy.png", "texture.player");
player_texture.genMipmaps();
player_texture.wrap = RL_TextureWrap.TEXTURE_WRAP_CLAMP;
player_texture.filter = RL_TextureFilter.TEXTURE_FILTER_BILINEAR;

const player_wand = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/wand.png", "texture.player_wand");
player_wand.genMipmaps();
player_wand.wrap = RL_TextureWrap.TEXTURE_WRAP_CLAMP;
player_wand.filter = RL_TextureFilter.TEXTURE_FILTER_BILINEAR;

const shadow = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/shadow.png", "texture.shadow");
shadow.genMipmaps();
shadow.wrap = RL_TextureWrap.TEXTURE_WRAP_CLAMP;
shadow.filter = RL_TextureFilter.TEXTURE_FILTER_BILINEAR;

const projectile = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/projectile.png", "texture.projectile");
projectile.genMipmaps();
projectile.wrap = RL_TextureWrap.TEXTURE_WRAP_CLAMP;
projectile.filter = RL_TextureFilter.TEXTURE_FILTER_POINT;
