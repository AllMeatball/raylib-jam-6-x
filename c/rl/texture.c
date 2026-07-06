#include "texture.h"
#include <stdint.h>

SCRIPTENGINE_DEFINE_ID(RL_Texture);
JSValue CLASSOBJ_RL_Texture;

void CLASSFINAL_RL_Texture(JSRuntime *rt, JSValue val) {
    struct TextureWrap_JSAPI *twrap = JS_GetOpaque(val, CLASSID_RL_Texture);

    if (twrap->unload_this) {
        if (IsTextureValid(twrap->texture))
            UnloadTexture(twrap->texture);
        else
            return;
    }

    js_free_rt(rt, twrap);
}

JSValue CLASSGET_RL_Texture(JSContext *ctx, JSValueConst this_val, int magic)
{
    Texture *texture = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Texture);
    if (!texture)
        return JS_EXCEPTION;

    int size = 0;
    switch (magic) {
        case 0:
            return JS_NewInt32(ctx, texture->width);
        case 1:
            return JS_NewInt32(ctx, texture->height);
        case 2:
            return JS_NewInt32(ctx, texture->format);
        case 3:
            return JS_NewUint32(ctx, texture->id);
        case 4:
            return JS_NewInt32(ctx, texture->mipmaps);
    }

    return JS_UNDEFINED;
}


JSValue CLASSSET_RL_Texture(JSContext *ctx, JSValueConst this_val, JSValue val, int magic) {
    Texture *texture = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Texture);
    if (!texture)
        return JS_EXCEPTION;

    int32_t value = 0;
    switch (magic) {
        case 5:
            JS_ToInt32(ctx, &value, val);
            SetTextureWrap(*texture, value);
            break;
        case 6:
            JS_ToInt32(ctx, &value, val);
            SetTextureFilter(*texture, value);
            break;
    }

    return JS_UNDEFINED;
}

JSValue CLASSCTOR_RL_Texture(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv) {
    struct TextureWrap_JSAPI *twrap = NULL;

    JSValue obj = JS_UNDEFINED;
    const char *path = NULL;

    twrap = js_mallocz(ctx, sizeof(struct TextureWrap_JSAPI));

    if (!twrap)
        return JS_EXCEPTION;

    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "path not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    if ( !(path = JS_ToCString(ctx, argv[0])) ) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "invalid path string"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    obj = Script_CreateOpaqueClass(ctx, new_target, CLASSID_RL_Texture, twrap);

    if (JS_IsException(obj))
        return JS_EXCEPTION;

    twrap->unload_this = true;
    twrap->texture = LoadTexture(path);

    return obj;
}

JSValue CLASSFUNC_RL_Texture_DrawPro(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    double rotation = 0;
    struct TextureWrap_JSAPI *twrap = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Texture);

    if (!twrap)
        return JS_EXCEPTION;

    if (argc < 5) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "source, dest, origin, rotation, color not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    Rectangle source = RL_GetRectangle(ctx, argv[0]);
    Rectangle dest   = RL_GetRectangle(ctx, argv[1]);

    Vector2 origin = RL_GetVector2(ctx, argv[2]);

    JS_ToFloat64(ctx, &rotation, argv[3]);

    Color color  = RL_GetColor(ctx, argv[4]);

    DrawTexturePro(twrap->texture, source, dest, origin, rotation, color);

    return JS_UNDEFINED;
}


JSValue CLASSFUNC_RL_Texture_Draw(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    double rotation = 0;
    double scale = 0;

    struct TextureWrap_JSAPI *twrap = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Texture);

    if (!twrap)
        return JS_EXCEPTION;

    if (argc < 4) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "position, rotation, scale, color not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    Vector2 position = RL_GetVector2(ctx, argv[0]);
    JS_ToFloat64(ctx, &rotation, argv[1]);
    JS_ToFloat64(ctx, &scale, argv[2]);

    Color color  = RL_GetColor(ctx, argv[3]);

    DrawTextureEx(twrap->texture, position, rotation, scale, color);

    return JS_UNDEFINED;
}
