#pragma once
#include "../raylib/src/raylib.h"
#include "../script.h"

void CLASSFINAL_RL_Image(JSRuntime *rt, JSValue val);
JSValue CLASSCTOR_RL_Image(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv);
JSValue CLASSGET_RL_Image(JSContext *ctx, JSValueConst this_val, int magic);

SCRIPTENGINE_DECLARE_CLASS(RL_Image, CLASSFINAL_RL_Image);

static const JSCFunctionListEntry CLASSFUNCS_RL_Image[] = {
    JS_CGETSET_MAGIC_DEF("width",   CLASSGET_RL_Image, NULL, 0),
    JS_CGETSET_MAGIC_DEF("height",  CLASSGET_RL_Image, NULL, 1),
    JS_CGETSET_MAGIC_DEF("format",  CLASSGET_RL_Image, NULL, 2),
    JS_CGETSET_MAGIC_DEF("data",    CLASSGET_RL_Image, NULL, 3),
    JS_CGETSET_MAGIC_DEF("mipmaps", CLASSGET_RL_Image, NULL, 4),
    // JS_CFUNC_DEF("unload", 0, CLASSFUNC_RL_Image_Unload),
};

