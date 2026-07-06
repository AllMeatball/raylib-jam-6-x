#pragma once
#include <stdbool.h>
#include <stdio.h>
#include "quickjs/quickjs.h"
#include "quickjs/quickjs-libc.h"

#define SCRIPTING_COUNTOF(x) (sizeof(x) / sizeof((x)[0]))

typedef struct {
    JSRuntime *rt;
    JSContext *ctx;

    JSValue globals;
} ScriptEngine;

#define SCRIPTENGINE_DECLARE_CLASS(name, fin) static JSClassDef CLASSDEF_##name = { \
    .class_name = #name, \
    .finalizer  = fin, \
}; extern JSClassID CLASSID_##name;

#define SCRIPTENGINE_DEFINE_ID(name) JSClassID CLASSID_##name

JSValue ScriptEngine_INTERNAL_DefineClass(ScriptEngine *engine, JSClassID *id, const JSClassDef *def, JSCFunction *ctor, const JSCFunctionListEntry *funcs, size_t func_count, const char *name);

#define SCRIPTENGINE_DEFINE_CLASS(engine, name, funcs, func_count) \
    ScriptEngine_INTERNAL_DefineClass(engine, &CLASSID_##name, &CLASSDEF_##name, CLASSCTOR_##name, funcs, func_count, #name)

#define SCRIPTENGINE_DEFINE_CLASS2(engine, name) \
    SCRIPTENGINE_DEFINE_CLASS(engine, name, CLASSFUNCS_##name, SCRIPTING_COUNTOF(CLASSFUNCS_##name))

#define SCRIPTENGINE_GET_CLASS(name) CLASSID_##name
#define SCRIPTENGINE_CONCAT(a, b) a##b

#define ScriptEngine_RegisterFunc(engine, name) JS_SetPropertyStr(engine->ctx, engine->globals, #name, JS_NewCFunction(engine->ctx, SCRIPTENGINE_CONCAT(name, _JSAPI), #name, 0))

ScriptEngine *ScriptEngine_Create(int argc, char **argv);
bool ScriptEngine_Eval(ScriptEngine *engine, JSValue *result, const char *filename, const char *code, size_t length, int flags);
void ScriptEngine_Destroy(ScriptEngine *engine);


ScriptEngine Script_GetEngineFromContext(JSContext *ctx);
void ScriptEngine_PrintValue(ScriptEngine *engine, JSValue value);
void ScriptEngine_PrintValueRaw(ScriptEngine *engine, JSValue value);

bool ScriptEngine_HandleErrors(ScriptEngine *engine, const char *path, JSValue result);

bool ScriptEngine_CallFunction(ScriptEngine *engine, JSValue function, int argc, JSValue *argv, JSValue *result);
JSValue Script_CreateOpaqueClass(JSContext *ctx, JSValue class_obj, JSClassID class_id, void *data);

JSValue ScriptEngine_GetGlobal(ScriptEngine *engine, const char *name);
