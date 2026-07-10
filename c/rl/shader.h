#pragma once
#include "../rl.h"
#include "../script.h"

void CLASSFINAL_RL_Shader(JSRuntime *rt, JSValue val);
JSValue CLASSCTOR_RL_Shader(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv);
JSValue CLASSFUNC_RL_Shader_Apply(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv);
JSValue CLASSFUNC_RL_Shader_SetVec3(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv);


SCRIPTENGINE_DECLARE_CLASS(RL_Shader, CLASSFINAL_RL_Shader);


static const JSCFunctionListEntry CLASSFUNCS_RL_Shader[] = {
    JS_CFUNC_DEF("apply", 0, CLASSFUNC_RL_Shader_Apply),
    JS_CFUNC_DEF("setVec3", 0, CLASSFUNC_RL_Shader_SetVec3),
};
