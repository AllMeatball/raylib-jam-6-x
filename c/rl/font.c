#include "font.h"
SCRIPTENGINE_DEFINE_ID(RL_Font);

void CLASSFINAL_RL_Font(JSRuntime *rt, JSValue val) {
    Font *font = JS_GetOpaque(val, CLASSID_RL_Font);
    if (font)
        UnloadFont(*font);
    else
        return;

    js_free_rt(rt, font);
}

JSValue CLASSCTOR_RL_Font(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv) {
    Font *font = NULL;
    JSValue obj = JS_UNDEFINED;
    const char *path = NULL;

    font = js_mallocz(ctx, sizeof(Font));

    if (!font)
        return JS_EXCEPTION;

    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "path not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    if ( !(path = JS_ToCString(ctx, argv[0])) ) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "invalid or null path string"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    obj = Script_CreateOpaqueClass(ctx, new_target, CLASSID_RL_Font, font);

    if (JS_IsException(obj))
        return JS_EXCEPTION;

    *font = LoadFont(path);

    return obj;
}
