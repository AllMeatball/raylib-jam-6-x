#pragma once
#include "quickjs/quickjs.h"
#include "raylib/src/raylib.h"
#include "script.h"

void RL_LoadScriptingFunctions(ScriptEngine *engine);

// TODO: performance check using `JS_GetPropertyStr` with `JS_GetProperty` using atoms inplace of strings
static Color RL_GetColor(JSContext *ctx, JSValue color_obj) {
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

    if (JS_IsNull(alpha) || JS_IsUndefined(alpha)) {
        color.a = 255;
    } else {
        JS_ToUint32(ctx, &val_u32, alpha);
        color.a = val_u32;
    }



    JS_FreeValue(ctx, red);
    JS_FreeValue(ctx, blue);
    JS_FreeValue(ctx, green);
    JS_FreeValue(ctx, alpha);

    return color;
}


static Vector2 RL_GetVector2(JSContext *ctx, JSValue vector_obj) {
    Vector2 vector = {};

    JSValue x = JS_GetPropertyStr(ctx, vector_obj, "x");
    JSValue y = JS_GetPropertyStr(ctx, vector_obj, "y");


    double val_f64;

    JS_ToFloat64(ctx, &val_f64, x);
    vector.x = val_f64;
    JS_ToFloat64(ctx, &val_f64, y);
    vector.y = val_f64;

    JS_FreeValue(ctx, x);
    JS_FreeValue(ctx, y);

    return vector;
}

static JSValue RL_CreateVector2(JSContext *ctx, Vector2 vector) {
    JSValue vector_obj = JS_NewObject(ctx);

    JS_SetPropertyStr(ctx, vector_obj, "x", JS_NewFloat64(ctx, vector.x));
    JS_SetPropertyStr(ctx, vector_obj, "y", JS_NewFloat64(ctx, vector.y));

    return vector_obj;
}

static Rectangle RL_GetRectangle(JSContext *ctx, JSValue rect_obj) {
    Rectangle rect = {};

    JSValue x = JS_GetPropertyStr(ctx, rect_obj, "x");
    JSValue y = JS_GetPropertyStr(ctx, rect_obj, "y");

    JSValue width  = JS_GetPropertyStr(ctx, rect_obj, "width");
    JSValue height = JS_GetPropertyStr(ctx, rect_obj, "height");


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
