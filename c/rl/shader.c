#include "shader.h"
#include <stdint.h>

SCRIPTENGINE_DEFINE_ID(RL_Shader);

void CLASSFINAL_RL_Shader(JSRuntime *rt, JSValue val) {
    Shader *shader = JS_GetOpaque(val, CLASSID_RL_Shader);
    if (shader)
        UnloadShader(*shader);
    else
        return;

    js_free_rt(rt, shader);
}

JSValue CLASSCTOR_RL_Shader(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv) {
    Shader *shader = NULL;
    JSValue obj = JS_UNDEFINED;
    const char *vs_shader_path = NULL;
    const char *fs_shader_path = NULL;

    if (JS_IsString(argv[0]))
        vs_shader_path = JS_ToCString(ctx, argv[0]);

    if (JS_IsString(argv[1]))
        fs_shader_path = JS_ToCString(ctx, argv[1]);

    if (!vs_shader_path && !fs_shader_path) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "either vs_shader_path or fs_shader_path must defined"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        JS_FreeCString(ctx, vs_shader_path);
        JS_FreeCString(ctx, fs_shader_path);
        return JS_EXCEPTION;
    }

    shader = js_mallocz(ctx, sizeof(Shader));

    if (!shader)
        return JS_EXCEPTION;

    obj = Script_CreateOpaqueClass(ctx, new_target, CLASSID_RL_Shader, shader);

    if (JS_IsException(obj))
        return JS_EXCEPTION;

    *shader = LoadShader(vs_shader_path, fs_shader_path);
    JS_FreeCString(ctx, vs_shader_path);
    JS_FreeCString(ctx, fs_shader_path);

    return obj;
}


JSValue CLASSFUNC_RL_Shader_Apply(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue func = JS_UNDEFINED;
    Shader *shader = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Shader);
    if (!shader)
        return JS_EXCEPTION;

    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "func not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    func = argv[0];

    BeginShaderMode(*shader);
    JSValue result = JS_Call(ctx, func, JS_UNDEFINED, 0, NULL);
    if (JS_IsException(result)) {
        EndShaderMode();
        return JS_EXCEPTION;
    }

    EndShaderMode();
    return JS_UNDEFINED;
}

JSValue CLASSFUNC_RL_Shader_SetVec3(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    Shader *shader = JS_GetOpaque2(ctx, this_val, CLASSID_RL_Shader);
    const char *uniform = NULL;
    if (!shader)
        return JS_EXCEPTION;

    if (argc < 2) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "uniform, value not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    uniform = JS_ToCString(ctx, argv[0]);
    if (!uniform)
        return JS_EXCEPTION;

    float value[3];
    RL_GetVector3Array(ctx, argv[1], value);

    int location = GetShaderLocation(*shader, uniform);
    printf("%d: %f, %f, %f\n", location, value[0], value[1], value[2]);

    SetShaderValue(*shader, location, &value, SHADER_UNIFORM_VEC3);
    return JS_UNDEFINED;
}


