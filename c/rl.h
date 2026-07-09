#pragma once
#include "quickjs/quickjs.h"
#include "raylib/src/raylib.h"
#include "script.h"

void RL_LoadScriptingFunctions(ScriptEngine *engine);

Color RL_GetColor(JSContext *ctx, JSValue color_obj);
Vector2 RL_GetVector2(JSContext *ctx, JSValue vector_obj);
JSValue RL_CreateVector2(JSContext *ctx, Vector2 vector);
Rectangle RL_GetRectangle(JSContext *ctx, JSValue rect_obj);

void RL_LoadAtoms(ScriptEngine *engine);
void RL_UnloadAtoms(ScriptEngine *engine);
