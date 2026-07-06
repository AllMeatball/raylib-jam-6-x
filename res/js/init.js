console.log("welcome. the game is now in scripting scope");
const chroma = require("./modules/chroma.min.js");

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

const canvas = new RL_RenderTexture(64, 64);
const canvas_tex = canvas.texture;

let timer = 0;
function ENGINE_Update(dt) {
    timer += dt;
}

const texture = new RL_Texture("gfx/wizzy.png");
texture.wrap = RL_TextureWrap.TEXTURE_WRAP_CLAMP;

function ENGINE_Draw() {
    RL_ClearBackground(chroma('lime').darken( Math.abs(Math.sin(timer * 2.0)) * 2 ).rgb());

    const pos = RL_GetMousePosition();
    // pos.x += Math.cos(timer * 8.0) * 16;
    pos.y += Math.sin(timer * 12.0) * 8;

    // canvas_tex.draw(pos, 0, 1, chroma('white').rgb());
    texture.draw(pos, Math.cos(timer * 8.0) * 2, 0.15, chroma('white').rgb());

    RL_DrawFPS();
}

function ENGINE_Shutdown() {
    console.log("<game>: shutting down");
    RL_CloseWindow();
}
