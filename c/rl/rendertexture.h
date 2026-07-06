#pragma once
#include "../rl.h"
#include "../script.h"

void CLASSFINAL_RL_RenderTexture(JSRuntime *rt, JSValue val);
JSValue CLASSCTOR_RL_RenderTexture(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv);
JSValue CLASSGET_RL_RenderTexture(JSContext *ctx, JSValueConst this_val, int magic);

SCRIPTENGINE_DECLARE_CLASS(RL_RenderTexture, CLASSFINAL_RL_RenderTexture);

static const JSCFunctionListEntry CLASSFUNCS_RL_RenderTexture[] = {
    JS_CGETSET_MAGIC_DEF("texture", CLASSGET_RL_RenderTexture, NULL, 0),
};
