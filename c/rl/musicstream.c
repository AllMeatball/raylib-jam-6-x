#include "musicstream.h"
SCRIPTENGINE_DEFINE_ID(RL_MusicStream);

void CLASSFINAL_RL_MusicStream(JSRuntime *rt, JSValue val) {
    Music *music = JS_GetOpaque(val, CLASSID_RL_MusicStream);
    if (music)
        UnloadMusicStream(*music);
    else
        return;

    js_free_rt(rt, music);
}

JSValue CLASSCTOR_RL_MusicStream(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv) {
    Music *music = NULL;
    JSValue obj = JS_UNDEFINED;
    const char *path = NULL;

    music = js_mallocz(ctx, sizeof(Music));

    if (!music)
        return JS_EXCEPTION;

    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "path not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    path = JS_ToCString(ctx, argv[0]);
    if (!path)
        return JS_EXCEPTION;

    obj = Script_CreateOpaqueClass(ctx, new_target, CLASSID_RL_MusicStream, music);

    if (JS_IsException(obj))
        return JS_EXCEPTION;

    *music = LoadMusicStream(path);
    JS_FreeCString(ctx, path);

    return obj;
}


JSValue CLASSFUNC_RL_MusicStream_IsPlaying(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Music *music = JS_GetOpaque2(ctx, this_val, CLASSID_RL_MusicStream);
    if (!music)
        return JS_EXCEPTION;

    return JS_NewBool(ctx, IsMusicStreamPlaying(*music));
}


JSValue CLASSFUNC_RL_MusicStream_Update(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Music *music = JS_GetOpaque2(ctx, this_val, CLASSID_RL_MusicStream);
    if (!music)
        return JS_EXCEPTION;

    UpdateMusicStream(*music);
    return JS_UNDEFINED;
}

JSValue CLASSFUNC_RL_MusicStream_SetPitch(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    double pitch = 0;
    Music *music = JS_GetOpaque2(ctx, this_val, CLASSID_RL_MusicStream);
    if (!music)
        return JS_EXCEPTION;

    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "pitch not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    JS_ToFloat64(ctx, &pitch, argv[0]);
    SetMusicPitch(*music, pitch);
    return JS_UNDEFINED;
}

JSValue CLASSFUNC_RL_MusicStream_SetVolume(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    double volume = 0;
    Music *music = JS_GetOpaque2(ctx, this_val, CLASSID_RL_MusicStream);
    if (!music)
        return JS_EXCEPTION;

    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "volume not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    JS_ToFloat64(ctx, &volume, argv[0]);
    SetMusicVolume(*music, volume);
    return JS_UNDEFINED;
}

JSValue CLASSFUNC_RL_MusicStream_Play(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Music *music = JS_GetOpaque2(ctx, this_val, CLASSID_RL_MusicStream);
    if (!music)
        return JS_EXCEPTION;

    PlayMusicStream(*music);
    return JS_UNDEFINED;
}

JSValue CLASSFUNC_RL_MusicStream_Stop(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Music *music = JS_GetOpaque2(ctx, this_val, CLASSID_RL_MusicStream);
    if (!music)
        return JS_EXCEPTION;

    StopMusicStream(*music);
    return JS_UNDEFINED;
}

JSValue CLASSFUNC_RL_MusicStream_Pause(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Music *music = JS_GetOpaque2(ctx, this_val, CLASSID_RL_MusicStream);
    if (!music)
        return JS_EXCEPTION;

    PauseMusicStream(*music);
    return JS_UNDEFINED;
}

JSValue CLASSFUNC_RL_MusicStream_Resume(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Music *music = JS_GetOpaque2(ctx, this_val, CLASSID_RL_MusicStream);
    if (!music)
        return JS_EXCEPTION;

    ResumeMusicStream(*music);
    return JS_UNDEFINED;
}
