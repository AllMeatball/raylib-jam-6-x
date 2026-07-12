#include <stdio.h>
#include <stdint.h>

#include "quickjs/quickjs.h"
#include "script.h"

#include "rl.h"
#include "fs.h"

#include "physfs/src/physfs.h"
#include "raylib/src/raylib.h"

#if defined(PLATFORM_WEB)
#include <emscripten/emscripten.h>
#endif

JSValue ENGINE_Update   = JS_UNDEFINED;
JSValue ENGINE_Draw     = JS_UNDEFINED;
JSValue ENGINE_Shutdown = JS_UNDEFINED;

ScriptEngine *engine = NULL;
bool has_shutdown = false;
bool restart = false;
bool running = true;

#if defined(PLATFORM_DESKTOP)
    #define GLSL_VERSION            330
#else   // PLATFORM_ANDROID, PLATFORM_WEB
    #define GLSL_VERSION            100
#endif

void GameUpdate() {
    float dt = GetFrameTime();
    JSValue dt_value = JS_NewFloat64(engine->ctx, dt);
    ScriptEngine_CallFunction(engine, ENGINE_Update, 1, &dt_value, NULL);
    JS_FreeValue(engine->ctx, dt_value);

    BeginDrawing();
        ScriptEngine_CallFunction(engine, ENGINE_Draw, 0, NULL, NULL);
    EndDrawing();
}

void GameShutdown() {
    if (has_shutdown)
        return;

    CloseAudioDevice();
    ScriptEngine_CallFunction(engine, ENGINE_Shutdown, 0, NULL, NULL);

    JS_FreeValue(engine->ctx, ENGINE_Update);
    JS_FreeValue(engine->ctx, ENGINE_Draw);
    JS_FreeValue(engine->ctx, ENGINE_Shutdown);


    RL_UnloadAtoms(engine);
    PHYSFS_deinit();
    ScriptEngine_Destroy(engine);
    printf("Exiting...\n");

    SetLoadFileDataCallback(NULL);
    SetSaveFileDataCallback(NULL);

    SetLoadFileTextCallback(NULL);
    ChangeDirectory(GetApplicationDirectory());

    has_shutdown = true;
}

JSValue ENGINE_Restart_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    printf("Restarting...");
    running = false;
    restart = true;
    return JS_UNDEFINED;
}

int main(int argc, char **argv) {
    do {
    restart = false;
    has_shutdown = false;
    running = true;

    if (!PHYSFS_init(argv[0])) {
        fprintf(stderr, "FS init failed: %s\n", PHYSFS_getErrorByCode(PHYSFS_getLastErrorCode()));
        return 1;
    }

    engine = ScriptEngine_Create(argc, argv);

    if (!engine) {
        PHYSFS_deinit();
        return 1;
    }

    atexit(GameShutdown);

    FS_LoadScriptingFunctions(engine);

    RL_LoadAtoms(engine);
    RL_LoadScriptingFunctions(engine);

    JS_SetPropertyStr(engine->ctx, engine->globals, "GLSL_VERSION", JS_NewInt64(engine->ctx, GLSL_VERSION));
    ScriptEngine_RegisterFunc(engine, ENGINE_Restart);

    // ScriptEngine_Eval(engine, NULL, "<debug:init>", "import * as os  from \"os\"; console.log(os.readdir('.'));", 0, JS_EVAL_TYPE_MODULE);

    char *script_data = LoadFileText("js/init.js");
    if (!script_data)
        return 1;

    if (!ScriptEngine_Eval(engine, NULL, "js/init.js", script_data, 0, JS_EVAL_TYPE_MODULE)) {
        UnloadFileText(script_data);
        return 1;
    }
    UnloadFileText(script_data);

    // while (JS_IsJobPending(engine->rt)) {
    //     JS_ExecutePendingJob(engine->rt, &engine->ctx);
    // }

    // this all will load in scripting mode
    SetLoadFileDataCallback(FS_LoadFileData);
    // SetSaveFileDataCallback(FS_SaveFileData);

    SetLoadFileTextCallback(FS_LoadTextData);

    // change dir to res to be able to handle music streaming
    ChangeDirectory("res");

    InitAudioDevice();

    script_data = LoadFileText("js/init.js");
    if (!script_data)
        return 1;

    if (!ScriptEngine_Eval(engine, NULL, "<game:init>", script_data, 0, JS_EVAL_TYPE_GLOBAL)) {
        UnloadFileText(script_data);
        return 1;
    }

    UnloadFileText(script_data);

    ENGINE_Update   = ScriptEngine_GetGlobal(engine, "ENGINE_Update");
    ENGINE_Draw     = ScriptEngine_GetGlobal(engine, "ENGINE_Draw");
    ENGINE_Shutdown = ScriptEngine_GetGlobal(engine, "ENGINE_Shutdown");


#if defined(PLATFORM_WEB)
    emscripten_set_main_loop(GameUpdate, 0, 1);
#else
    while (!WindowShouldClose() && running) {
        GameUpdate();
    }
#endif

    GameShutdown();
    } while (restart);

    return 0;
}
