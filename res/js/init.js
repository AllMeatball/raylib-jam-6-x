console.log("welcome. the game is now in scripting scope");
const chroma = require("./modules/chroma.min.js");
// const astar = require("./modules/astar.js");

globalThis.TIMER = 0;
globalThis.GLOBAL_FLAGS = [];
globalThis.ENTITIES = [];
globalThis.CollisionSystem = require('./collsionsys.js');

globalThis.SCREEN_SIZE = 720;
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

        if (flag_mask === undefined)
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

const BG_COLOR = chroma(0x187a3e).rgb();
const MAIN_FONT = new RL_Font('fonts/GochiHand-Regular.ttf', 64);
const TITLE_FONT = new RL_Font('fonts/PatrickHand-Regular.ttf', 256);

require('./assets.js');

const Body = require("./body.js");
const Humanoid = require("./entities/humanoid.js");
const PatternSystem = require("./patterns.js");


const ENT_CLASS = {
    Projectile: require("./entities/projectile.js"),
    Player: require("./entities/player.js"),
    Enemy: require("./entities/enemy.js"),
    Dot:  require("./entities/dot.js"),
};

let STATES = {
    TITLE: require("./states/title.js"),
    MAIN: require("./states/main.js"),
};

(function() {
    const prev_RL_SetCursorEnabled = RL_SetCursorEnabled;
    globalThis.RL_SetCursorEnabled = (state) => {
        if (GLOBAL_FLAGS.includes('cursor'))
            return;

        prev_RL_SetCursorEnabled(state);
    }
})();

if (GLOBAL_FLAGS.includes('main_state')) {
    STATES.current = STATES.MAIN;
} else {
    STATES.current = STATES.TITLE;
}

STATES.current.enter();
function ENGINE_Update(dt) {
    MusicUpdate();

    globalThis.TIMER += dt;
    STATES.current.update(dt);
}

function ENGINE_Draw() {
    // RL_ClearBackground([0,0,0]);
    STATES.current.draw();

    if (GLOBAL_FLAGS.includes('fps'))
        RL_DrawFPS();
}

function ENGINE_Shutdown() {
    console.log("<game>: shutting down");
    RL_CloseWindow();
}
