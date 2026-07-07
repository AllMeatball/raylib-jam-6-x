#pragma once
#include "../rl.h"
#include "../script.h"

void CLASSFINAL_RL_Texture(JSRuntime *rt, JSValue val);
JSValue CLASSCTOR_RL_Texture(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv);
JSValue CLASSGET_RL_Texture(JSContext *ctx, JSValueConst this_val, int magic);
JSValue CLASSSET_RL_Texture(JSContext *ctx, JSValueConst this_val, JSValue val, int magic);

JSValue CLASSFUNC_RL_Texture_Draw(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);
JSValue CLASSFUNC_RL_Texture_DrawPro(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);
JSValue CLASSFUNC_RL_Texture_GenMipmaps(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv);

SCRIPTENGINE_DECLARE_CLASS(RL_Texture, CLASSFINAL_RL_Texture);
extern JSValue CLASSOBJ_RL_Texture;

struct TextureWrap_JSAPI {
    bool unload_this;
    Texture texture;
};

static const JSCFunctionListEntry CLASSFUNCS_RL_Texture[] = {
    JS_CGETSET_MAGIC_DEF("width",   CLASSGET_RL_Texture, NULL, 0),
    JS_CGETSET_MAGIC_DEF("height",  CLASSGET_RL_Texture, NULL, 1),
    JS_CGETSET_MAGIC_DEF("format",  CLASSGET_RL_Texture, NULL, 2),
    JS_CGETSET_MAGIC_DEF("id",      CLASSGET_RL_Texture, NULL, 3),
    JS_CGETSET_MAGIC_DEF("mipmaps", CLASSGET_RL_Texture, NULL, 4),

    JS_CGETSET_MAGIC_DEF("wrap", NULL, CLASSSET_RL_Texture, 5),
    JS_CGETSET_MAGIC_DEF("filter", NULL, CLASSSET_RL_Texture, 6),

    JS_CFUNC_DEF("draw", 0,    CLASSFUNC_RL_Texture_Draw),
    JS_CFUNC_DEF("drawPro", 0, CLASSFUNC_RL_Texture_DrawPro),
    JS_CFUNC_DEF("genMipmaps", 0, CLASSFUNC_RL_Texture_GenMipmaps),
};
