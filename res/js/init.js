console.log("welcome. the game is now in scripting scope");
const chroma = require("./modules/chroma.min.js");

globalThis.TIMER = 0;
globalThis.GLOBAL_FLAGS = [];
globalThis.ENTITIES = [];

for (let i = 0; i < LAUNCH_ARGS.length; i++) {
    const arg = LAUNCH_ARGS[i];
    if (arg.charAt(0) == '+') {
        globalThis.GLOBAL_FLAGS.push(arg.slice(1));
        continue;
    }
}

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
// RL_IsMouseButtonPressed
RL_SetWindowIcons(...icons);

const BG_COLOR = chroma(0x187a3e).rgb();
const MAIN_FONT = new RL_Font('fonts/GochiHand-Regular.ttf', 64);
require('./assets.js');

const Body = require("./body.js");
const Dot = require("./entities/dot.js");
const Player = require("./entities/player.js");

if (!GLOBAL_FLAGS.includes('show_mouse'))
    RL_SetCursorEnabled(false);

let PLAYER_ENTITY = new Player(0, 0);
ENTITIES.push(PLAYER_ENTITY);

function ENGINE_Update(dt) {
    globalThis.TIMER += dt;

    for (let ent of ENTITIES)
        ent.update(dt);
}

function ENGINE_Draw() {
    RL_ClearBackground(BG_COLOR);

    for (let ent of ENTITIES)
        ent.draw();

    RL_DrawTextEx(MAIN_FONT, "abcdefghijk", {x: 0, y: 0}, 64, 0, [255,255,255]);

    // RL_DrawFPS();
}

function ENGINE_Shutdown() {
    console.log("<game>: shutting down");
    RL_CloseWindow();
}
