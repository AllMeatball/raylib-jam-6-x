#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include "script.h"
#include "fs.h"


#include "raylib/src/raylib.h"

#include "quickjs/quickjs-libc.h"
#include "quickjs/quickjs.h"

// #define SCRIPT_MODULE_FMT "%s.js"

ScriptEngine Script_GetEngineFromContext(JSContext *ctx) {
    ScriptEngine engine = {
        .ctx = ctx,
        .rt  = JS_GetRuntime(ctx),
        .globals = JS_UNDEFINED,
    };

    return engine;
}

JSModuleDef *Script_LoadModuleFromFormat(JSContext *ctx, const char *format, const char *module_name) {
    size_t module_path_len = snprintf(NULL, 0, format, module_name);
    module_path_len += 1;

    char *module_path = js_mallocz(ctx, module_path_len);
    if (!module_path)
        return NULL;

    snprintf(module_path, module_path_len, format, module_name);

    if (access(module_path, R_OK) < 0)
        return NULL;

    char *script_data = LoadFileText(module_path);
    if (!script_data) {
        js_free(ctx, module_path);
        return NULL;
    }

    JSValue bytecode = JS_Eval(ctx, script_data, strlen(script_data), module_name, JS_EVAL_TYPE_MODULE | JS_EVAL_FLAG_COMPILE_ONLY);
    js_free(ctx, module_path);

    JS_ResolveModule(ctx, bytecode);
    JSModuleDef* module_def = (JSModuleDef*)JS_VALUE_GET_PTR(bytecode);
    JS_FreeValue(ctx, bytecode);

    return module_def;
}

JSModuleDef *Script_ModuleLoader(JSContext *ctx, const char *module_name, void *opaque) {
    JSModuleDef *module_def = NULL;

    // TODO: don't hardcode these. add JS_PATH variable or something

    module_def = Script_LoadModuleFromFormat(ctx, "%s", module_name);
    if (module_def)
        return module_def;

    module_def = Script_LoadModuleFromFormat(ctx, "%s.js", module_name);
    if (module_def)
        return module_def;

    return NULL;
}

JSValue ScriptEngine_INTERNAL_DefineClass(ScriptEngine *engine, JSClassID *id, const JSClassDef *def, JSCFunction *ctor, const JSCFunctionListEntry *funcs, size_t func_count, const char *name) {
    JS_NewClassID(id);
    JS_NewClass(engine->rt, *id, def);


    JSValue class_obj = JS_NewCFunction2(engine->ctx, ctor, name, 0, JS_CFUNC_constructor, 0);
    JSValue prototype = JS_NewObject(engine->ctx);

    if (funcs)
        JS_SetPropertyFunctionList(engine->ctx, prototype, funcs, func_count);

    JS_SetConstructor(engine->ctx, class_obj, prototype);
    JS_SetClassProto (engine->ctx, *id, prototype);


    JS_SetPropertyStr(engine->ctx, engine->globals, name, class_obj);

    return class_obj;
}

void Script_PrintValueWrite(void *opaque, const char *buf, size_t len) {
    FILE *output = opaque;
    fwrite(buf, len, 1, output);
}

void ScriptEngine_PrintValue(ScriptEngine *engine, JSValue value) {
    JSValue prototype = JS_GetPrototype(engine->ctx, value);
    const char *typename = JS_ToCString(engine->ctx, prototype);

    JS_FreeValue(engine->ctx, prototype);
    fprintf(stderr, "JS VALUE (type: %s): ", typename);

    JS_FreeCString(engine->ctx, typename);
    ScriptEngine_PrintValueRaw(engine, value);
}

void ScriptEngine_PrintValueRaw(ScriptEngine *engine, JSValue value) {
    JS_PrintValue(engine->ctx, Script_PrintValueWrite, stderr, value, 0);
    fputc('\n', stderr);
}

ScriptEngine *ScriptEngine_Create(int argc, char **argv) {
    ScriptEngine *engine = malloc(sizeof(ScriptEngine));

    if (!engine)
        return NULL;

    engine->rt = JS_NewRuntime();
    if (!engine->rt)
        return NULL;

    js_std_init_handlers(engine->rt);

    engine->ctx = JS_NewContext(engine->rt);
    if (!engine->ctx)
        return NULL;

    js_std_add_helpers(engine->ctx, argc, argv);
    js_init_module_std(engine->ctx, "std");
    js_init_module_os(engine->ctx, "os");

    engine->globals = JS_GetGlobalObject(engine->ctx);

    JS_SetModuleLoaderFunc(engine->rt, NULL, Script_ModuleLoader, NULL);

    return engine;
}

bool ScriptEngine_HandleErrors(ScriptEngine *engine, const char *path, JSValue result) {
    if (JS_HasException(engine->ctx)) {
        js_std_dump_error(engine->ctx);
        return false;
    }

    // Unwrap promise to check for errors
    JSPromiseStateEnum promise_state = JS_PromiseState(engine->ctx, result);

    if (!(promise_state < 0)) {
        JSValue unpromised_value = JS_PromiseResult(engine->ctx, result);

        if (JS_IsError(engine->ctx, unpromised_value)) {
            ScriptEngine_PrintValueRaw(engine, unpromised_value);
            JS_FreeValue(engine->ctx, unpromised_value);

            return false;
        }

        JS_FreeValue(engine->ctx, unpromised_value);
    }

    return true;
}

bool ScriptEngine_Eval(ScriptEngine *engine, JSValue *result, const char *filename, const char *code, size_t length, int flags) {
    bool success = true;

    if (length <= 0)
        length = strlen(code);

    JSValue value = JS_Eval(engine->ctx, code, length, filename, flags | JS_EVAL_FLAG_STRICT);
    if (result)
        *result = value;


    success = ScriptEngine_HandleErrors(engine, filename, value);

    if (!result)
        JS_FreeValue(engine->ctx, value);

    return success;
}

bool ScriptEngine_CallFunction(ScriptEngine *engine, JSValue function, int argc, JSValue *argv, JSValue *result) {
    JSValue value = JS_Call(engine->ctx, function, JS_UNDEFINED, argc, argv);

    bool success  = ScriptEngine_HandleErrors(engine, "<anonymous>", value);

    if (result)
        *result = value;
    else
        JS_FreeValue(engine->ctx, value);

    return success;
}

JSValue ScriptEngine_GetGlobal(ScriptEngine *engine, const char *name) {
    return JS_GetPropertyStr(engine->ctx, engine->globals, name);
}

JSValue Script_CreateOpaqueClass(JSContext *ctx, JSValue class_obj, JSClassID class_id, void *data) {
    JSValue prototype   = JS_GetPropertyStr(ctx, class_obj, "prototype");
    ScriptEngine engine = Script_GetEngineFromContext(ctx);

    if (JS_IsException(prototype))
        goto fail;

    JSValue obj = JS_NewObjectProtoClass(ctx, prototype, class_id);
    JS_FreeValue(ctx, prototype);

    if (JS_IsException(obj))
        goto fail;

    JS_SetOpaque(obj, data);
    return obj;

    fail:
    JS_FreeValue(ctx, obj);
    return JS_EXCEPTION;
}

void ScriptEngine_Destroy(ScriptEngine *engine) {
    js_std_free_handlers(engine->rt);

    JS_FreeValue(engine->ctx, engine->globals);
    JS_FreeContext(engine->ctx);
    JS_FreeRuntime(engine->rt);
}

