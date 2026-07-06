#include "rendertexture.h"
#include "texture.h"
#include <stdint.h>

SCRIPTENGINE_DEFINE_ID(RL_RenderTexture);

void CLASSFINAL_RL_RenderTexture(JSRuntime *rt, JSValue val) {
    RenderTexture *render_texture = JS_GetOpaque(val, CLASSID_RL_RenderTexture);
    if (render_texture)
        UnloadRenderTexture(*render_texture);
    else
        return;

    js_free_rt(rt, render_texture);
}

JSValue CLASSGET_RL_RenderTexture(JSContext *ctx, JSValueConst this_val, int magic)
{
    RenderTexture *render_texture = JS_GetOpaque2(ctx, this_val, CLASSID_RL_RenderTexture);
    if (!render_texture)
        return JS_EXCEPTION;

    JSValue obj = JS_UNDEFINED;
    struct TextureWrap_JSAPI *twrap;
    switch (magic) {
        case 0:
            // FIXME: it is wasteful to allocate memory every single time
            // RL_Texture probably should be stored alongside the RL_RenderTexture
            twrap = js_mallocz(ctx, sizeof(struct TextureWrap_JSAPI));
            if (!twrap)
                return JS_EXCEPTION;

            obj = Script_CreateOpaqueClass(ctx, CLASSOBJ_RL_Texture, CLASSID_RL_Texture, twrap);

            ScriptEngine engine = Script_GetEngineFromContext(ctx);
            ScriptEngine_PrintValue(&engine, obj);

            if (JS_IsException(obj))
                return JS_EXCEPTION;

            twrap->unload_this = false;
            twrap->texture = render_texture->texture;

            return obj;
    }

    return JS_UNDEFINED;
}

JSValue CLASSCTOR_RL_RenderTexture(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv) {
    int32_t width  = 0;
    int32_t height = 0;

    JSValue obj = JS_UNDEFINED;
    RenderTexture *render_texture = js_mallocz(ctx, sizeof(RenderTexture));

    if (!render_texture)
        return JS_EXCEPTION;

    if (argc < 2) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "width, height not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    JS_ToInt32(ctx, &width,  argv[0]);
    JS_ToInt32(ctx, &height, argv[1]);

    obj = Script_CreateOpaqueClass(ctx, new_target, CLASSID_RL_RenderTexture, render_texture);

    if (JS_IsException(obj))
        return JS_EXCEPTION;

    *render_texture = LoadRenderTexture(width, height);

    return obj;
}
