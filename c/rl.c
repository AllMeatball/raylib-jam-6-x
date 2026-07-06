#include "rl.h"
#include "quickjs/quickjs.h"
#include "raylib/src/raylib.h"
#include "script.h"

#include <stdint.h>

// CLASS BINDINGS
#include "rl/image.h"
#include "rl/sound.h"
#include "rl/texture.h"
#include "rl/rendertexture.h"

JSValue RL_LoadFileData_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int length = 0;
    const char *filename = NULL;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "filename not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    filename = JS_ToCString(ctx, argv[0]);


    unsigned char *data = LoadFileData(filename, &length);
    JS_FreeCString(ctx, filename);

    JSValue buffer = JS_NewArrayBufferCopy(ctx, data, length);
    MemFree(data);

    return buffer;
}

JSValue RL_LoadFileText_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int length = 0;
    const char *filename = NULL;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "filename not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    filename = JS_ToCString(ctx, argv[0]);


    char *text = LoadFileText(filename);
    JS_FreeCString(ctx, filename);

    if (!text) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "failed to load file"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }


    JSValue string = JS_NewString(ctx, text);
    UnloadFileText(text);

    return string;
}

JSValue RL_SetTargetFPS_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int32_t fps = 0;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "fps not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    JS_ToInt32(ctx, &fps, argv[0]);
    SetTargetFPS(fps);

    return JS_UNDEFINED;
}

JSValue RL_InitWindow_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int32_t width  = 0;
    int32_t height = 0;

    const char *title = NULL;

    if (argc < 3) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "width, height, title not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    JS_ToInt32(ctx, &width,   argv[0]);
    JS_ToInt32(ctx, &height,  argv[1]);
    title = JS_ToCString(ctx, argv[2]);

    InitWindow(width, height, title);
    JS_FreeCString(ctx, title);

    return JS_UNDEFINED;
}

JSValue RL_CloseWindow_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    CloseWindow();
    return JS_UNDEFINED;
}

JSValue RL_SetWindowState_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    uint32_t flags = 0;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "flags not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    JS_ToUint32(ctx, &flags, argv[0]);
    SetWindowState(flags);
    return JS_UNDEFINED;
}

JSValue RL_SetConfigFlags_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    uint32_t flags = 0;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "flags not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    JS_ToUint32(ctx, &flags, argv[0]);
    SetConfigFlags(flags);
    return JS_UNDEFINED;
}

JSValue RL_DrawFPS_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    DrawFPS(0, 0);
    return JS_UNDEFINED;
}

JSValue RL_SetWindowIcons_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Image *images = js_mallocz(ctx, sizeof(Image) * argc);
    if (!images)
        return JS_EXCEPTION;

    for (int i = 0; i < argc; i++) {
        Image *img = JS_GetOpaque2(ctx, argv[i], CLASSID_RL_Image);
        if (!img) {
            js_free(ctx, images);
            return JS_EXCEPTION;
        }

        // printf("%d, %d, %d\n", img->width, img->height, img->format);
        images[i] = *img;
    }

    SetWindowIcons(images, argc);
    js_free(ctx, images);

    return JS_UNDEFINED;
}

JSValue RL_ClearBackground_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "color not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }


    Color color = RL_GetColor(ctx, argv[0]);
    ClearBackground(color);

    return JS_UNDEFINED;
}

JSValue RL_DrawCircleSector_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int32_t segments;
    double radius, start_angle, end_angle;
    if (argc < 6) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "center, radius, start_angle, end_angle, segments not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    Vector2 center = RL_GetVector2(ctx, argv[0]);

    JS_ToFloat64(ctx, &radius,      argv[1]);
    JS_ToFloat64(ctx, &start_angle, argv[2]);
    JS_ToFloat64(ctx, &end_angle,   argv[3]);
    JS_ToInt32  (ctx, &segments,    argv[4]);

    Color color = RL_GetColor(ctx, argv[5]);

    DrawCircleSector(center, radius, start_angle, end_angle, segments, color);
    return JS_UNDEFINED;
}

JSValue RL_GetMousePosition_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Vector2 vector = GetMousePosition();
    return RL_CreateVector2(ctx, vector);
}

JSValue RL_IsKeyDown_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int32_t key;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "key not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    JS_ToInt32(ctx, &key, argv[0]);
    return JS_NewBool(ctx, IsKeyDown(key));
}

JSValue RL_IsKeyUp_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int32_t key;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "key not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    JS_ToInt32(ctx, &key, argv[0]);
    return JS_NewBool(ctx, IsKeyUp(key));
}

void RL_LoadScriptingClasses(ScriptEngine *engine) {
    CLASSOBJ_RL_Texture = SCRIPTENGINE_DEFINE_CLASS2(engine, RL_Texture);

    SCRIPTENGINE_DEFINE_CLASS2(engine, RL_Image);
    SCRIPTENGINE_DEFINE_CLASS2(engine, RL_Sound);
    SCRIPTENGINE_DEFINE_CLASS2(engine, RL_RenderTexture);
}

void RL_LoadScriptingFunctions(ScriptEngine *engine) {
    RL_LoadScriptingClasses(engine);

    ScriptEngine_RegisterFunc(engine, RL_LoadFileData);
    ScriptEngine_RegisterFunc(engine, RL_LoadFileText);

    ScriptEngine_RegisterFunc(engine, RL_SetTargetFPS);
    ScriptEngine_RegisterFunc(engine, RL_InitWindow);
    ScriptEngine_RegisterFunc(engine, RL_CloseWindow);
    ScriptEngine_RegisterFunc(engine, RL_SetWindowState);
    ScriptEngine_RegisterFunc(engine, RL_SetConfigFlags);
    ScriptEngine_RegisterFunc(engine, RL_SetWindowIcons);
    ScriptEngine_RegisterFunc(engine, RL_ClearBackground);
    ScriptEngine_RegisterFunc(engine, RL_DrawCircleSector);
    ScriptEngine_RegisterFunc(engine, RL_GetMousePosition);

    ScriptEngine_RegisterFunc(engine, RL_IsKeyUp);
    ScriptEngine_RegisterFunc(engine, RL_IsKeyDown);

    ScriptEngine_RegisterFunc(engine, RL_DrawFPS);
}
