const player_texture = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/wizzy.png", "texture.player");
player_texture.genMipmaps();
player_texture.wrap = RL_TextureWrap.TEXTURE_WRAP_CLAMP;
player_texture.filter = RL_TextureFilter.TEXTURE_FILTER_BILINEAR;

const player_wand = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/wand.png", "texture.player.wand");
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

const enemy_texture = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/enemy.png", "texture.enemy");
enemy_texture.genMipmaps();
enemy_texture.wrap = RL_TextureWrap.TEXTURE_WRAP_REPEAT;
enemy_texture.filter = RL_TextureFilter.TEXTURE_FILTER_BILINEAR;

const wizard_hat = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/icon.png", "texture.hat");
wizard_hat.genMipmaps();
wizard_hat.wrap = RL_TextureWrap.TEXTURE_WRAP_REPEAT;
wizard_hat.filter = RL_TextureFilter.TEXTURE_FILTER_BILINEAR;

const spell_texture = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/spell.png", "texture.spell");
spell_texture.genMipmaps();
spell_texture.wrap = RL_TextureWrap.TEXTURE_WRAP_REPEAT;
spell_texture.filter = RL_TextureFilter.TEXTURE_FILTER_BILINEAR;

const potion_texture = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/potion.png", "texture.potion");
potion_texture.genMipmaps();
potion_texture.wrap = RL_TextureWrap.TEXTURE_WRAP_REPEAT;
potion_texture.filter = RL_TextureFilter.TEXTURE_FILTER_BILINEAR;

LoadAsset(ASSET_TYPE.TEXTURE, "gfx/bg.png", "texture.bg");

// const atlas = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/atlas.png", "texture.atlas");
// atlas.genMipmaps();
// atlas.wrap = RL_TextureWrap.TEXTURE_WRAP_CLAMP;
// atlas.filter = RL_TextureFilter.TEXTURE_FILTER_BILINEAR;

LoadAsset(ASSET_TYPE.MUSIC, "music/wizard-tower.ogg", "music.wizardtower");
LoadAsset(ASSET_TYPE.MUSIC, "music/yes-sire.ogg", "music.title");

LoadAsset(ASSET_TYPE.SOUND, "sfx/oh-no.wav", "sfx.gameover");
LoadAsset(ASSET_TYPE.SOUND, "sfx/hit.wav", "sfx.hit");
LoadAsset(ASSET_TYPE.SOUND, "sfx/wave.ogg", "sfx.wave");
const sfx_pickup = LoadAsset(ASSET_TYPE.SOUND, "sfx/pickup.ogg", "sfx.pickup");
LoadAsset(ASSET_TYPE.SOUND, "sfx/potion.ogg", "sfx.potion");

// const sfx_telport = sfx_pickup.makeAlias();
const sfx_telport = LoadAsset(ASSET_TYPE.SOUND, "sfx/pickup.ogg", "sfx.teleport");
sfx_telport.setPitch(0.45);
sfx_telport.setVolume(0.35);

const sfx_magik = LoadAsset(ASSET_TYPE.SOUND, "sfx/magik.ogg", "sfx.magik");
sfx_magik.setVolume(0.5);
