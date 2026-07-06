#pragma once
#include "../raylib/src/raylib.h"
#include "../script.h"

void CLASSFINAL_RL_Sound(JSRuntime *rt, JSValue val);
JSValue CLASSCTOR_RL_Sound(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv);

JSValue CLASSFUNC_RL_Sound_Play(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);
JSValue CLASSFUNC_RL_Sound_Stop(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);
JSValue CLASSFUNC_RL_Sound_Pause(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);
JSValue CLASSFUNC_RL_Sound_Resume(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);

SCRIPTENGINE_DECLARE_CLASS(RL_Sound, CLASSFINAL_RL_Sound);

static const JSCFunctionListEntry CLASSFUNCS_RL_Sound[] = {
    JS_CFUNC_DEF("play", 0, CLASSFUNC_RL_Sound_Play),
    JS_CFUNC_DEF("stop", 0, CLASSFUNC_RL_Sound_Stop),
    JS_CFUNC_DEF("pause", 0, CLASSFUNC_RL_Sound_Pause),
    JS_CFUNC_DEF("resume", 0, CLASSFUNC_RL_Sound_Resume),
};

