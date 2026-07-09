#include "sound.h"

SCRIPTENGINE_DEFINE_ID(RL_Sound);
JSValue CLASSOBJ_RL_Sound;


void CLASSFINAL_RL_Sound(JSRuntime *rt, JSValue val) {
    struct RL_SoundWrap *sound = JS_GetOpaque(val, CLASSID_RL_Sound);
    if (IsSoundValid(sound->sound))
        if (sound->is_alias)
            UnloadSoundAlias(sound->sound);
        else
            UnloadSound(sound->sound);
    else
        return;

    js_free_rt(rt, sound);
}

JSValue CLASSCTOR_RL_Sound(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv) {
    struct RL_SoundWrap *sound = NULL;
    JSValue obj = JS_UNDEFINED;
    const char *path = NULL;

    sound = js_mallocz(ctx, sizeof(struct RL_SoundWrap));

    if (!sound)
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

    obj = Script_CreateOpaqueClass(ctx, new_target, CLASSID_RL_Sound, sound);

    if (JS_IsException(obj))
        return JS_EXCEPTION;

    Wave wave = LoadWave(path);
    sound->is_alias = false;
    sound->sound = LoadSoundFromWave(wave);
    sound->duration = ((double)wave.frameCount / wave.channels) / wave.sampleRate;
    UnloadWave(wave);

    JS_FreeCString(ctx, path);

    return obj;
}

JSValue CLASSFUNC_RL_Sound_Play(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    struct RL_SoundWrap *sound = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Sound);
    if (!sound)
        return JS_EXCEPTION;

    PlaySound(sound->sound);
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
    struct RL_SoundWrap *sound = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Sound);
    if (!sound)
        return JS_EXCEPTION;

    StopSound(sound->sound);
    return JS_UNDEFINED;
}

JSValue CLASSFUNC_RL_Sound_Pause(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    struct RL_SoundWrap *sound = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Sound);
    if (!sound)
        return JS_EXCEPTION;

    PauseSound(sound->sound);
    return JS_UNDEFINED;
}

JSValue CLASSFUNC_RL_Sound_Resume(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    struct RL_SoundWrap *sound = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Sound);
    if (!sound)
        return JS_EXCEPTION;

    ResumeSound(sound->sound);
    return JS_UNDEFINED;
}

JSValue CLASSFUNC_RL_Sound_GetDuration(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    struct RL_SoundWrap *sound = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Sound);
    if (!sound)
        return JS_EXCEPTION;

    return JS_NewFloat64(ctx, sound->duration);
}

JSValue CLASSFUNC_RL_Sound_MakeAlias(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    struct RL_SoundWrap *sound = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Sound);
    if (!sound)
        return JS_EXCEPTION;

    struct RL_SoundWrap *alias = js_mallocz(ctx, sizeof(struct RL_SoundWrap));
    if (!alias)
        return JS_EXCEPTION;

    JSValue alias_obj = Script_CreateOpaqueClass(ctx, CLASSOBJ_RL_Sound, CLASSID_RL_Sound, alias);

    if (JS_IsException(alias_obj))
        return JS_EXCEPTION;

    *alias = *sound;
    alias->sound = LoadSoundAlias(sound->sound);
    alias->is_alias = true;

    return alias_obj;
}
