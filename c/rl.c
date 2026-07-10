#include "rl.h"
#include "quickjs/quickjs.h"
#include "raylib/src/raylib.h"
#include "raylib/src/raymath.h"

#include "script.h"

#include <math.h>
#include <stdint.h>

// CLASS BINDINGS
#include "rl/image.h"
#include "rl/texture.h"
#include "rl/rendertexture.h"

#include "rl/sound.h"
#include "rl/musicstream.h"

#include "rl/font.h"

JSAtom RL_ATOM_X, RL_ATOM_Y;
JSAtom RL_ATOM_WIDTH, RL_ATOM_HEIGHT;

JSAtom RL_ATOM_RADIUS;
JSAtom RL_ATOM_GROUP, RL_ATOM_MASK, RL_ATOM_RESOLVE;

#define RL_GLOBAL_GROUP (0)

#define USE_CIRCLE_COLLISION
#ifdef USE_CIRCLE_COLLISION
struct RL_CollisonBox {
    float radius;
    Vector2 position;
    uint32_t group, mask;
    bool resolve;
};
#else
struct RL_CollisonBox {
    Rectangle rect;
    uint32_t group, mask;
    bool resolve;
};
#endif

// NOTE: for future devs using QuickJS. using atoms can gain you a lot performance --
// I was really under the assumption that it was badly batched draw calls.
void RL_LoadAtoms(ScriptEngine *engine) {
    RL_ATOM_X = JS_NewAtom(engine->ctx, "x");
    RL_ATOM_Y = JS_NewAtom(engine->ctx, "y");

    RL_ATOM_WIDTH  = JS_NewAtom(engine->ctx, "width");
    RL_ATOM_HEIGHT = JS_NewAtom(engine->ctx, "height");

    RL_ATOM_GROUP = JS_NewAtom(engine->ctx, "group");
    RL_ATOM_MASK = JS_NewAtom(engine->ctx, "mask");

    RL_ATOM_RESOLVE = JS_NewAtom(engine->ctx, "resolve");
    RL_ATOM_RADIUS = JS_NewAtom(engine->ctx, "radius");
}

void RL_UnloadAtoms(ScriptEngine *engine) {
    JS_FreeAtom(engine->ctx, RL_ATOM_X);
    JS_FreeAtom(engine->ctx, RL_ATOM_Y);
    JS_FreeAtom(engine->ctx, RL_ATOM_WIDTH);
    JS_FreeAtom(engine->ctx, RL_ATOM_HEIGHT);
    JS_FreeAtom(engine->ctx, RL_ATOM_GROUP);
    JS_FreeAtom(engine->ctx, RL_ATOM_MASK);
    JS_FreeAtom(engine->ctx, RL_ATOM_RESOLVE);
    JS_FreeAtom(engine->ctx, RL_ATOM_RADIUS);
}

Color RL_GetColor(JSContext *ctx, JSValue color_obj) {
    Color color = {};

    JSValue red   = JS_GetPropertyUint32(ctx, color_obj, 0);
    JSValue green = JS_GetPropertyUint32(ctx, color_obj, 1);
    JSValue blue  = JS_GetPropertyUint32(ctx, color_obj, 2);

    JSValue alpha = JS_GetPropertyUint32(ctx, color_obj, 3);

    uint32_t val_u32;
    JS_ToUint32(ctx, &val_u32, red);
    color.r = val_u32;

    JS_ToUint32(ctx, &val_u32, green);
    color.g = val_u32;

    JS_ToUint32(ctx, &val_u32, blue);
    color.b = val_u32;


    if (!JS_IsNumber(alpha)) {
        color.a = 255;
    } else {
        double alpha_f64 = 0;
        JS_ToFloat64(ctx, &alpha_f64, alpha);
        color.a = alpha_f64 * 255;
    }


    JS_FreeValue(ctx, red);
    JS_FreeValue(ctx, blue);
    JS_FreeValue(ctx, green);
    JS_FreeValue(ctx, alpha);

    return color;
}


// TODO: performance check using `JS_GetPropertyStr` with `JS_GetProperty` using atoms inplace of strings
Vector2 RL_GetVector2(JSContext *ctx, JSValue vector_obj) {
    Vector2 vector = {};

    JSValue x = JS_GetProperty(ctx, vector_obj, RL_ATOM_X);
    JSValue y = JS_GetProperty(ctx, vector_obj, RL_ATOM_Y);


    double val_f64;

    JS_ToFloat64(ctx, &val_f64, x);
    vector.x = val_f64;
    JS_ToFloat64(ctx, &val_f64, y);
    vector.y = val_f64;

    JS_FreeValue(ctx, x);
    JS_FreeValue(ctx, y);

    return vector;
}

JSValue RL_CreateVector2(JSContext *ctx, Vector2 vector) {
    JSValue vector_obj = JS_NewObject(ctx);

    JS_SetProperty(ctx, vector_obj, RL_ATOM_X, JS_NewFloat64(ctx, vector.x));
    JS_SetProperty(ctx, vector_obj, RL_ATOM_Y, JS_NewFloat64(ctx, vector.y));

    return vector_obj;
}

Rectangle RL_GetRectangle(JSContext *ctx, JSValue rect_obj) {
    Rectangle rect = {};

    JSValue x = JS_GetProperty(ctx, rect_obj, RL_ATOM_X);
    JSValue y = JS_GetProperty(ctx, rect_obj, RL_ATOM_Y);

    JSValue width  = JS_GetProperty(ctx, rect_obj, RL_ATOM_WIDTH);
    JSValue height = JS_GetProperty(ctx, rect_obj, RL_ATOM_HEIGHT);


    double val_f64;

    JS_ToFloat64(ctx, &val_f64, x);
    rect.x = val_f64;
    JS_ToFloat64(ctx, &val_f64, y);
    rect.y = val_f64;

    JS_ToFloat64(ctx, &val_f64, width);
    rect.width = val_f64;
    JS_ToFloat64(ctx, &val_f64, height);
    rect.height = val_f64;

    JS_FreeValue(ctx, x);
    JS_FreeValue(ctx, y);
    JS_FreeValue(ctx, width);
    JS_FreeValue(ctx, height);

    return rect;
}


JSValue RL_LoadFileData_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int length = 0;
    const char *filename = NULL;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "filename not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    filename = JS_ToCString(ctx, argv[0]);


    unsigned char *data = LoadFileData(filename, &length);
    JS_FreeCString(ctx, filename);

    JSValue buffer = JS_NewArrayBufferCopy(ctx, data, length);
    MemFree(data);

    return buffer;
}

JSValue RL_LoadFileText_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int length = 0;
    const char *filename = NULL;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "filename not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    filename = JS_ToCString(ctx, argv[0]);


    char *text = LoadFileText(filename);
    JS_FreeCString(ctx, filename);

    if (!text) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "failed to load file"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }


    JSValue string = JS_NewString(ctx, text);
    UnloadFileText(text);

    return string;
}

JSValue RL_SetTargetFPS_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int32_t fps = 0;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "fps not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    JS_ToInt32(ctx, &fps, argv[0]);
    SetTargetFPS(fps);

    return JS_UNDEFINED;
}

JSValue RL_InitWindow_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int32_t width  = 0;
    int32_t height = 0;

    const char *title = NULL;

    if (argc < 3) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "width, height, title not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    JS_ToInt32(ctx, &width,   argv[0]);
    JS_ToInt32(ctx, &height,  argv[1]);
    title = JS_ToCString(ctx, argv[2]);

    InitWindow(width, height, title);
    JS_FreeCString(ctx, title);

    return JS_UNDEFINED;
}

JSValue RL_CloseWindow_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    CloseWindow();
    return JS_UNDEFINED;
}

JSValue RL_SetWindowState_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    uint32_t flags = 0;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "flags not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    JS_ToUint32(ctx, &flags, argv[0]);
    SetWindowState(flags);
    return JS_UNDEFINED;
}

JSValue RL_SetConfigFlags_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    uint32_t flags = 0;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "flags not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    JS_ToUint32(ctx, &flags, argv[0]);
    SetConfigFlags(flags);
    return JS_UNDEFINED;
}

JSValue RL_DrawFPS_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    DrawFPS(0, 0);
    return JS_UNDEFINED;
}

JSValue RL_SetWindowIcons_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Image *images = js_mallocz(ctx, sizeof(Image) * argc);
    if (!images)
        return JS_EXCEPTION;

    for (int i = 0; i < argc; i++) {
        Image *img = JS_GetOpaque2(ctx, argv[i], CLASSID_RL_Image);
        if (!img) {
            js_free(ctx, images);
            return JS_EXCEPTION;
        }

        // printf("%d, %d, %d\n", img->width, img->height, img->format);
        images[i] = *img;
    }

    SetWindowIcons(images, argc);
    js_free(ctx, images);

    return JS_UNDEFINED;
}

JSValue RL_ClearBackground_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "color not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }


    Color color = RL_GetColor(ctx, argv[0]);
    ClearBackground(color);

    return JS_UNDEFINED;
}

JSValue RL_DrawCircleSector_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int32_t segments;
    double radius, start_angle, end_angle;
    if (argc < 6) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "center, radius, start_angle, end_angle, segments not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    Vector2 center = RL_GetVector2(ctx, argv[0]);

    JS_ToFloat64(ctx, &radius,      argv[1]);
    JS_ToFloat64(ctx, &start_angle, argv[2]);
    JS_ToFloat64(ctx, &end_angle,   argv[3]);
    JS_ToInt32  (ctx, &segments,    argv[4]);

    Color color = RL_GetColor(ctx, argv[5]);

    DrawCircleSector(center, radius, start_angle, end_angle, segments, color);
    return JS_UNDEFINED;
}

JSValue RL_GetMousePosition_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Vector2 vector = GetMousePosition();
    return RL_CreateVector2(ctx, vector);
}

JSValue RL_GetMouseDelta_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Vector2 vector = GetMouseDelta();
    return RL_CreateVector2(ctx, vector);
}

JSValue RL_IsMouseButtonPressed_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int32_t button;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "button not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    JS_ToInt32(ctx, &button, argv[0]);
    return JS_NewBool(ctx, IsMouseButtonPressed(button));
}

JSValue RL_IsKeyPressed_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int32_t key;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "key not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    JS_ToInt32(ctx, &key, argv[0]);
    return JS_NewBool(ctx, IsKeyPressed(key));
}

JSValue RL_IsKeyDown_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int32_t key;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "key not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    JS_ToInt32(ctx, &key, argv[0]);
    return JS_NewBool(ctx, IsKeyDown(key));
}

JSValue RL_IsKeyUp_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int32_t key;
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "key not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    JS_ToInt32(ctx, &key, argv[0]);
    return JS_NewBool(ctx, IsKeyUp(key));
}

JSValue RL_DrawTextEx_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Font *font;
    const char *text;
    double font_size, spacing;

    Vector2 position;
    Color tint;

    if (argc < 6) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "font, text, position, font_size, spacing, tint not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    font = JS_GetOpaque2(ctx, argv[0], CLASSID_RL_Font);
    if (!font)
        return JS_EXCEPTION;

    text = JS_ToCString(ctx, argv[1]);
    position = RL_GetVector2(ctx, argv[2]);

    JS_ToFloat64(ctx, &font_size, argv[3]);
    JS_ToFloat64(ctx, &spacing, argv[4]);

    tint = RL_GetColor(ctx, argv[5]);

    DrawTextEx(*font, text, position, font_size, spacing, tint);

    JS_FreeCString(ctx, text);

    return JS_UNDEFINED;
}


JSValue RL_MeasureTextEx_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Font *font;
    const char *text;
    double font_size, spacing;

    Vector2 text_size;

    if (argc < 4) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "font, text, font_size, spacing not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    font = JS_GetOpaque2(ctx, argv[0], CLASSID_RL_Font);
    if (!font)
        return JS_EXCEPTION;

    text = JS_ToCString(ctx, argv[1]);

    JS_ToFloat64(ctx, &font_size, argv[2]);
    JS_ToFloat64(ctx, &spacing, argv[3]);

    JSValue obj = RL_CreateVector2(ctx, MeasureTextEx(*font, text, font_size, spacing));

    JS_FreeCString(ctx, text);

    return obj;
}

JSValue RL_DrawRectangle_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Rectangle rect;
    Color color;

    if (argc < 2) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "rect, color not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    rect  = RL_GetRectangle(ctx, argv[0]);
    color = RL_GetColor(ctx, argv[1]);

    DrawRectangleRec(rect, color);

    return JS_UNDEFINED;
}

JSValue RL_SetCursorEnabled_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "state not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    if (JS_ToBool(ctx, argv[0]))
        EnableCursor();
    else
        DisableCursor();

    return JS_UNDEFINED;
}

#ifdef USE_CIRCLE_COLLISION
JSValue RL_HandleBulkCollisionCheck_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (argc < 2) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "this, ...rects not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    JSValue callback = JS_GetPropertyStr(ctx, argv[0], "collisionCallback");
    if (JS_IsException(callback))
        return JS_EXCEPTION;

    int boxes_count = argc - 1;
    struct RL_CollisonBox *boxes = js_mallocz(ctx, boxes_count * sizeof(struct RL_CollisonBox));

    if (!boxes)
        return JS_EXCEPTION;

    for (int i = 0; i < boxes_count; i++) {
        struct RL_CollisonBox *box = boxes + i;
        box->position = RL_GetVector2(ctx, argv[i+1]);
        JSValue resolve_obj = JS_GetProperty(ctx, argv[i+1], RL_ATOM_RESOLVE);
        JSValue radius_obj = JS_GetProperty(ctx, argv[i+1], RL_ATOM_RADIUS);
        JSValue group_obj  = JS_GetProperty(ctx, argv[i+1], RL_ATOM_GROUP);
        JSValue mask_obj   = JS_GetProperty(ctx, argv[i+1], RL_ATOM_MASK);

        if (JS_IsUndefined(group_obj))
            box->group = RL_GLOBAL_GROUP;
        else
            JS_ToUint32(ctx, &box->group, group_obj);

        if (JS_IsUndefined(mask_obj))
            box->mask = 0;
        else
            JS_ToUint32(ctx, &box->mask, mask_obj);

        if (JS_IsUndefined(resolve_obj))
            boxes[i].resolve = false;
        else
            boxes[i].resolve = JS_ToBool(ctx, resolve_obj);

        if (JS_IsUndefined(radius_obj))
            boxes[i].radius = 0;
        else {
            double radius;
            JS_ToFloat64(ctx, &radius, radius_obj);
            box->radius = radius;
            // printf("%f\n", radius);
        }

        JS_FreeValue(ctx, group_obj);
        JS_FreeValue(ctx, mask_obj);
        JS_FreeValue(ctx, radius_obj);
    }

    JSValue cb_params[4];
    for (int i = 0; i < boxes_count; i++) {
        struct RL_CollisonBox box1 = boxes[i];

        // TODO: no double iter here
        for (int j = 0; j < boxes_count; j++) {
            if (i == j)
                continue;

            struct RL_CollisonBox box2 = boxes[j];

            if ( box1.group & box2.mask )
                continue;


            Vector2 result1 = {.x = 0, .y = 0};
            Vector2 result2 = {.x = 0, .y = 0};

            // unrolling some of the code for CheckCollisionCircles from raymath.h for optimizations

            float dx = box1.position.x - box2.position.x;      // X distance between centers
            float dy = box1.position.y - box2.position.y;      // Y distance between centers

            float distance_squared = dx*dx + dy*dy; // Distance between centers squared
            float radius_sum = box1.radius + box2.radius;

            bool collision = (distance_squared <= (radius_sum*radius_sum));

            // check_collisions:
            if (collision) {

                cb_params[0] = argv[i+1];
                cb_params[1] = argv[j+1];

                if (box1.resolve && box2.resolve) {
                    float dist = sqrtf(distance_squared);

                    if (fabsf(dist) <= 0) {
                        dist = 10;
                    }

                    float sep_x = (dx) / dist;
                    float sep_y = (dy) / dist;

                    // result1.x =  sep_x * (dx * 0.5);
                    // result1.y =  sep_y * (dy * 0.5);
                    //
                    // result2.x = -sep_x * (dx * 0.5);
                    // result2.y = -sep_y * (dy * 0.5);

                    result2.x = (box1.position.x - sep_x * radius_sum - box2.position.x) * 0.4;
                    result2.y = (box1.position.y - sep_y * radius_sum - box2.position.y) * 0.4;

                    result1.x = (box2.position.x + sep_x * radius_sum - box1.position.x) * 0.4;
                    result1.y = (box2.position.y + sep_y * radius_sum - box1.position.y) * 0.4;
                }

                cb_params[2] = RL_CreateVector2(ctx, result1);
                cb_params[3] = RL_CreateVector2(ctx, result2);

                JSValue result = JS_Call(ctx, callback, argv[0], 4, cb_params);

                if (JS_IsException(result)) {
                    JS_FreeValue(ctx, callback);
                    JS_FreeValue(ctx, cb_params[2]);
                    JS_FreeValue(ctx, cb_params[3]);
                    js_free(ctx, boxes);
                    return JS_EXCEPTION;
                }

                JS_FreeValue(ctx, result);
                JS_FreeValue(ctx, cb_params[2]);
                JS_FreeValue(ctx, cb_params[3]);
            }
        }
    }

    js_free(ctx, boxes);
    JS_FreeValue(ctx, callback);
    return JS_UNDEFINED;
}
#else
JSValue RL_HandleBulkCollisionCheck_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (argc < 2) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "this, ...rects not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    JSValue callback = JS_GetPropertyStr(ctx, argv[0], "collisionCallback");
    if (JS_IsException(callback))
        return JS_EXCEPTION;

    int boxes_count = argc - 1;
    struct RL_CollisonBox *boxes = js_mallocz(ctx, boxes_count * sizeof(struct RL_CollisonBox));

    if (!boxes)
        return JS_EXCEPTION;

    for (int i = 0; i < boxes_count; i++) {
        struct RL_CollisonBox *box = boxes + i;
        box->rect = RL_GetRectangle(ctx, argv[i+1]);
        JSValue group_obj  = JS_GetProperty(ctx, argv[i+1], RL_ATOM_GROUP);
        JSValue mask_obj   = JS_GetProperty(ctx, argv[i+1], RL_ATOM_MASK);

        if (JS_IsUndefined(group_obj))
            box->group = RL_GLOBAL_GROUP;
        else
            JS_ToUint32(ctx, &box->group, group_obj);

        if (JS_IsUndefined(mask_obj))
            box->mask = 0;
        else
            JS_ToUint32(ctx, &box->mask, mask_obj);

        JS_FreeValue(ctx, group_obj);
        JS_FreeValue(ctx, mask_obj);
    }

    JSValue cb_params[2];
    for (int i = 0; i < boxes_count; i++) {
        struct RL_CollisonBox box1 = boxes[i];

        // TODO: no double iter here
        for (int j = 0; j < boxes_count; j++) {
            if (i == j)
                continue;

            struct RL_CollisonBox box2 = boxes[j];

            if ( box1.group & box2.mask )
                continue;

            // check_collisions:
            if (CheckCollisionRecs(box1.rect, box2.rect)) {
                cb_params[0] = argv[i+1];
                cb_params[1] = argv[j+1];

                JSValue result = JS_Call(ctx, callback, argv[0], 2, cb_params);

                if (JS_IsException(result)) {
                    JS_FreeValue(ctx, callback);
                    return JS_EXCEPTION;
                }

                JS_FreeValue(ctx, result);
            }
        }
    }

    // js_free(ctx, rects);
    JS_FreeValue(ctx, callback);
    return JS_UNDEFINED;
}
#endif

void RL_LoadScriptingClasses(ScriptEngine *engine) {
    CLASSOBJ_RL_Sound = SCRIPTENGINE_DEFINE_CLASS2(engine, RL_Sound);
    CLASSOBJ_RL_Texture = SCRIPTENGINE_DEFINE_CLASS2(engine, RL_Texture);
    SCRIPTENGINE_DEFINE_CLASS2(engine, RL_RenderTexture);

    SCRIPTENGINE_DEFINE_CLASS2(engine, RL_Image);
    SCRIPTENGINE_DEFINE_CLASS2(engine, RL_MusicStream);

    SCRIPTENGINE_DEFINE_CLASS(engine, RL_Font, NULL, 0);
}

void RL_LoadScriptingFunctions(ScriptEngine *engine) {
    RL_LoadScriptingClasses(engine);

    JSValue rl_global_group = JS_NewUint32(engine->ctx, RL_GLOBAL_GROUP);
    JS_SetPropertyStr(engine->ctx, engine->globals, "RL_GLOBAL_GROUP", rl_global_group);

    ScriptEngine_RegisterFunc(engine, RL_LoadFileData);
    ScriptEngine_RegisterFunc(engine, RL_LoadFileText);

    ScriptEngine_RegisterFunc(engine, RL_SetTargetFPS);
    ScriptEngine_RegisterFunc(engine, RL_InitWindow);
    ScriptEngine_RegisterFunc(engine, RL_CloseWindow);
    ScriptEngine_RegisterFunc(engine, RL_SetWindowState);
    ScriptEngine_RegisterFunc(engine, RL_SetConfigFlags);
    ScriptEngine_RegisterFunc(engine, RL_SetWindowIcons);
    ScriptEngine_RegisterFunc(engine, RL_ClearBackground);
    ScriptEngine_RegisterFunc(engine, RL_DrawCircleSector);

    ScriptEngine_RegisterFunc(engine, RL_SetCursorEnabled);
    ScriptEngine_RegisterFunc(engine, RL_GetMousePosition);
    ScriptEngine_RegisterFunc(engine, RL_GetMouseDelta);
    ScriptEngine_RegisterFunc(engine, RL_IsMouseButtonPressed);
    ScriptEngine_RegisterFunc(engine, RL_IsKeyPressed);

    ScriptEngine_RegisterFunc(engine, RL_IsKeyUp);
    ScriptEngine_RegisterFunc(engine, RL_IsKeyDown);

    ScriptEngine_RegisterFunc(engine, RL_DrawTextEx);
    ScriptEngine_RegisterFunc(engine, RL_MeasureTextEx);


    ScriptEngine_RegisterFunc(engine, RL_DrawRectangle);
    ScriptEngine_RegisterFunc(engine, RL_HandleBulkCollisionCheck);

    ScriptEngine_RegisterFunc(engine, RL_DrawFPS);
}
