#include "image.h"
SCRIPTENGINE_DEFINE_ID(RL_Image);

void CLASSFINAL_RL_Image(JSRuntime *rt, JSValue val) {
    Image *img = JS_GetOpaque(val, CLASSID_RL_Image);
    if (img)
        UnloadImage(*img);
    else
        return;

    js_free_rt(rt, img);
}

JSValue CLASSGET_RL_Image(JSContext *ctx, JSValueConst this_val, int magic)
{
    Image *img = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Image);
    if (!img)
        return JS_EXCEPTION;

    int size = 0;
    switch (magic) {
        case 0:
            return JS_NewInt32(ctx, img->width);
        case 1:
            return JS_NewInt32(ctx, img->height);
        case 2:
            return JS_NewInt32(ctx, img->format);
        case 3:
            size = GetPixelDataSize(img->width, img->height, img->format);
            // printf("PIXEL DATA: %d\n", size);
            if (size <= 0)
                return JS_EXCEPTION;


            JSValue array_buf = JS_NewArrayBuffer(ctx, img->data, size, NULL, NULL, 0);

            ScriptEngine engine = Script_GetEngineFromContext(ctx);
            ScriptEngine_PrintValue(&engine, array_buf);

            return array_buf;
        case 4:
            return JS_NewInt32(ctx, img->mipmaps);
        default:
            return JS_EXCEPTION;
    }
}

JSValue CLASSCTOR_RL_Image(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv) {
    Image *image = NULL;
    JSValue obj = JS_UNDEFINED;
    const char *path = NULL;

    image = js_mallocz(ctx, sizeof(Image));

    if (!image)
        return JS_EXCEPTION;

    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "path not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    if ( !(path = JS_ToCString(ctx, argv[0])) ) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "invalid or null path string"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    obj = Script_CreateOpaqueClass(ctx, new_target, CLASSID_RL_Image, image);

    if (JS_IsException(obj))
        return JS_EXCEPTION;

    *image = LoadImage(path);

    return obj;
}
