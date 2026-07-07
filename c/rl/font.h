#pragma once
#include "../raylib/src/raylib.h"
#include "../script.h"

void CLASSFINAL_RL_Font(JSRuntime *rt, JSValue val);
JSValue CLASSCTOR_RL_Font(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv);

SCRIPTENGINE_DECLARE_CLASS(RL_Font, CLASSFINAL_RL_Font);

