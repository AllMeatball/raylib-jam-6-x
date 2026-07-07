console.log("welcome. the game is now in scripting scope");
const chroma = require("./modules/chroma.min.js");

globalThis.timer = 0;

function LoadWindowFlagsFromArray(flags) {
    let window_flags = 0;
    for (const flag_name of flags) {
        const flag_mask = RL_ConfigFlags[flag_name];

        if (flag_mask == undefined)
            throw Error(`Invalid window flag '${flag_name}'`);

        window_flags |= flag_mask;
    }

    RL_SetConfigFlags(window_flags);
}

const config = JSON.parse(RL_LoadFileText("conf.json"));
LoadWindowFlagsFromArray(config.preflags || []);
RL_InitWindow(
    config.width  || 854,
    config.height || 480,
    config.title  || "??? NO WINDOW TITLE ???",
);
RL_SetTargetFPS(config.max_fps || 60);

const icons = [];
config.icons.forEach((path) => {
    const icon = new RL_Image(path);
    icons.push(icon);
});

RL_SetWindowIcons(...icons);

let player_texture = LoadAsset(ASSET_TYPE.TEXTURE, "gfx/wizzy.png", "texture.player");
player_texture.wrap = RL_TextureWrap.TEXTURE_WRAP_CLAMP;
player_texture.filter = RL_TextureFilter.TEXTURE_FILTER_TRILINEAR;

const Player = require("./player.js");

// const canvas = new RL_RenderTexture(64, 64);
// const canvas_tex = canvas.texture;

let player = new Player(0, 0);

function ENGINE_Update(dt) {
    globalThis.timer += dt;
    // console.log(player);

    // player.pos.x = mouse_xy.x;
    // player.pos.y = mouse_xy.y;


    player.update(dt);
}

function ENGINE_Draw() {
    RL_ClearBackground(chroma('coral').rgb());


    // PLAYER_TEXTURE.draw(player.pos, Math.cos(timer * 8.0) - Math.sin(timer * 7.85), 0.15, chroma('white').rgb());
    // player.texture.draw(RL_GetMousePosition(), Math.cos(timer * 8.0) - Math.sin(timer * 7.85), 0.15, chroma('white').rgb());
    // player.draw();

    player.draw();

    // canvas_tex.draw(pos, 0, 1, chroma('white').rgb());

    RL_DrawFPS();
}

function ENGINE_Shutdown() {
    console.log("<game>: shutting down");
    RL_CloseWindow();
}
