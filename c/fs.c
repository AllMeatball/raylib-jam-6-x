#include "fs.h"

#include "physfs/src/physfs.h"
#include "quickjs/quickjs.h"
#include "script.h"

#include "raylib/src/raylib.h"

struct FS_callbackInfo {
    JSContext *ctx;
    JSValue files;

    uint32_t index;
};

static int FS_AddFile_CB(void *data, const char *origdir, const char *filename) {
    struct FS_callbackInfo *cb_info = data;
    JS_SetPropertyUint32(cb_info->ctx, cb_info->files, cb_info->index, JS_NewString(cb_info->ctx, filename));

    cb_info->index++;
    return 1;
}

unsigned char *FS_LoadFileData(const char *filename, int *dataSize) {
    PHYSFS_Stat stat = {0};
    unsigned char *buffer = NULL;

    if (PHYSFS_stat(filename, &stat) == 0) {
        PHYSFS_ErrorCode err = PHYSFS_getLastErrorCode();
        fprintf(stderr, "%s: PHYSFS_stat '%s': (%d) %s\n", __func__, filename, err, PHYSFS_getErrorByCode(err));
        return NULL;
    }


    if (stat.filesize < 0) {
        fprintf(stderr, "%s: Bad filesize\n", __func__);
        return NULL;
    }

    PHYSFS_File *file = PHYSFS_openRead(filename);

    buffer = MemAlloc(stat.filesize);
    PHYSFS_readBytes(file, buffer, stat.filesize);

    PHYSFS_close(file);

    *dataSize = stat.filesize;

    return buffer;
}

bool FS_SaveFileData(const char *filename, void *data, int dataSize) {
    return false;
}

char *FS_LoadTextData(const char *filename) {
    int size = 0;

    unsigned char *buffer = FS_LoadFileData(filename, &size);

    // printf("%s\n", filename);
    char *string = MemAlloc(size + 1);

    memcpy(string, buffer, size);
    string[size] = '\0';
    MemFree(buffer);

    return string;
}

JSValue FS_Exists_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    const char *path = NULL;

    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "path not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    path = JS_ToCString(ctx, argv[0]);
    return JS_NewBool(ctx, PHYSFS_exists(path) != 0);
}

JSValue FS_Mount_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    const char *archive_path = NULL;
    const char *mount_point = NULL;

    if (argc < 3) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "archive_path, mount_point, append_to_path must be provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    archive_path = JS_ToCString(ctx, argv[0]);
    mount_point  = JS_ToCString(ctx, argv[1]);
    int append_to_path = JS_ToBool(ctx, argv[2]);

    int result = PHYSFS_mount(archive_path, mount_point, append_to_path);

    JS_FreeCString(ctx, archive_path);
    JS_FreeCString(ctx, mount_point);

    if (result == 0) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, PHYSFS_getErrorByCode(PHYSFS_getLastErrorCode())), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        return err;
    }

    return JS_UNDEFINED;
}

JSValue FS_ListFiles_JSAPI(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    const char *path = NULL;

    if (argc < 1) {
        return JS_FALSE;
    }

    struct FS_callbackInfo cb_info = {
        .ctx   = ctx,

        .index = 0,
        .files = JS_NewArray(ctx),
    };

    path = JS_ToCString(ctx, argv[0]);
    PHYSFS_enumerate(path, FS_AddFile_CB, &cb_info);
    JS_FreeCString(ctx, path);

    return cb_info.files;
}

void FS_LoadScriptingFunctions(ScriptEngine *engine) {
    ScriptEngine_RegisterFunc(engine, FS_Mount);
    ScriptEngine_RegisterFunc(engine, FS_ListFiles);
    ScriptEngine_RegisterFunc(engine, FS_Exists);
}
