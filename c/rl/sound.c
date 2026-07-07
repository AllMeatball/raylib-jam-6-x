#include "sound.h"
SCRIPTENGINE_DEFINE_ID(RL_Sound);

void CLASSFINAL_RL_Sound(JSRuntime *rt, JSValue val) {
    Sound *sound = JS_GetOpaque(val, CLASSID_RL_Sound);
    if (sound)
        UnloadSound(*sound);
    else
        return;

    js_free_rt(rt, sound);
}

JSValue CLASSCTOR_RL_Sound(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv) {
    Sound *sound = NULL;
    JSValue obj = JS_UNDEFINED;
    const char *path = NULL;

    sound = js_mallocz(ctx, sizeof(Sound));

    if (!sound)
        return JS_EXCEPTION;

    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "path not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    if ( !(path = JS_ToCString(ctx, argv[0])) ) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "invalid or null path string"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    obj = Script_CreateOpaqueClass(ctx, new_target, CLASSID_RL_Sound, sound);

    if (JS_IsException(obj))
        return JS_EXCEPTION;

    *sound = LoadSound(path);

    return obj;
}

JSValue CLASSFUNC_RL_Sound_Play(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Sound *sound = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Sound);
    if (!sound)
        return JS_EXCEPTION;

    PlaySound(*sound);
    return JS_UNDEFINED;
}

JSValue CLASSFUNC_RL_Sound_SetPitch(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    double pitch = 0;
    Sound *sound = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Sound);
    if (!sound)
        return JS_EXCEPTION;

    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "pitch not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    JS_ToFloat64(ctx, &pitch, argv[0]);
    SetSoundPitch(*sound, pitch);
    return JS_UNDEFINED;
}


JSValue CLASSFUNC_RL_Sound_Stop(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Sound *sound = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Sound);
    if (!sound)
        return JS_EXCEPTION;

    StopSound(*sound);
    return JS_UNDEFINED;
}

JSValue CLASSFUNC_RL_Sound_Pause(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Sound *sound = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Sound);
    if (!sound)
        return JS_EXCEPTION;

    PauseSound(*sound);
    return JS_UNDEFINED;
}

JSValue CLASSFUNC_RL_Sound_Resume(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Sound *sound = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Sound);
    if (!sound)
        return JS_EXCEPTION;

    ResumeSound(*sound);
    return JS_UNDEFINED;
}
