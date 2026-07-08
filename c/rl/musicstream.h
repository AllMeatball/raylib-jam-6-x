#pragma once
#include "../raylib/src/raylib.h"
#include "../script.h"

void CLASSFINAL_RL_MusicStream(JSRuntime *rt, JSValue val);
JSValue CLASSCTOR_RL_MusicStream(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv);

JSValue CLASSFUNC_RL_MusicStream_IsPlaying(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);
JSValue CLASSFUNC_RL_MusicStream_Update(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);

JSValue CLASSFUNC_RL_MusicStream_Play(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);
JSValue CLASSFUNC_RL_MusicStream_Stop(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);
JSValue CLASSFUNC_RL_MusicStream_Pause(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);
JSValue CLASSFUNC_RL_MusicStream_Resume(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);

JSValue CLASSFUNC_RL_MusicStream_SetPitch(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);
JSValue CLASSFUNC_RL_MusicStream_SetVolume(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);

SCRIPTENGINE_DECLARE_CLASS(RL_MusicStream, CLASSFINAL_RL_MusicStream);

static const JSCFunctionListEntry CLASSFUNCS_RL_MusicStream[] = {
    JS_CFUNC_DEF("isPlaying", 0, CLASSFUNC_RL_MusicStream_IsPlaying),
    JS_CFUNC_DEF("update", 0, CLASSFUNC_RL_MusicStream_Update),
    JS_CFUNC_DEF("play", 0, CLASSFUNC_RL_MusicStream_Play),
    JS_CFUNC_DEF("stop", 0, CLASSFUNC_RL_MusicStream_Stop),
    JS_CFUNC_DEF("pause", 0, CLASSFUNC_RL_MusicStream_Pause),
    JS_CFUNC_DEF("resume", 0, CLASSFUNC_RL_MusicStream_Resume),
    JS_CFUNC_DEF("setPitch", 0, CLASSFUNC_RL_MusicStream_SetPitch),
    JS_CFUNC_DEF("setVolume", 0, CLASSFUNC_RL_MusicStream_SetVolume),
};

