#include "font.h"
#include <stdint.h>
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

    int32_t font_size = 0;

    font = js_mallocz(ctx, sizeof(Font));

    if (!font)
        return JS_EXCEPTION;

    if (argc < 2) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "path, font_size not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    path = JS_ToCString(ctx, argv[0]);
    if (!path)
        return JS_EXCEPTION;

    JS_ToInt32(ctx, &font_size, argv[1]);

    obj = Script_CreateOpaqueClass(ctx, new_target, CLASSID_RL_Font, font);

    if (JS_IsException(obj))
        return JS_EXCEPTION;

    *font = LoadFontEx(path, font_size, 0, 0);
    JS_FreeCString(ctx, path);

    return obj;
}
