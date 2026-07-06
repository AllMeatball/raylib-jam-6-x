#pragma once
#include "script.h"
void FS_LoadScriptingFunctions(ScriptEngine *engine);

unsigned char *FS_LoadFileData(const char *filename, int *dataSize);
bool FS_SaveFileData(const char *filename, void *data, int dataSize);
char *FS_LoadTextData(const char *filename);
