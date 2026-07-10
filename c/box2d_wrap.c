#include "box2d_wrap.h"

#include "rl.h"
#include "script.h"

b2WorldId B2Wrap_worldId;

SCRIPTENGINE_DECLARE_CLASS(b2Body, NULL)

SCRIPTENGINE_DEFINE_ID(b2Body);

JSValue CLASSCTOR_b2Body(JSContext *ctx, JSValueConst new_target, int argc, JSValueConst *argv) {
    b2BodyId *body = NULL;
    JSValue obj = JS_UNDEFINED;

    body = js_mallocz(ctx, sizeof(b2BodyId));

    if (!body)
        return JS_EXCEPTION;

    if (argc < 1) {
        JSValue err = JS_NewError(ctx);
        JS_DefinePropertyValueStr(ctx, err, "message", JS_NewString(ctx, "rect not provided"), JS_PROP_WRITABLE | JS_PROP_CONFIGURABLE);
        JS_Throw(ctx, err);

        return JS_EXCEPTION;
    }

    Rectangle rect = RL_GetRectangle(ctx, argv[0]);

    b2BodyDef body_def = b2DefaultBodyDef();
    body_def.type = b2_kinematicBody;
    body_def.position = (b2Vec2){rect.x, rect.y};
    body_def.fixedRotation = true;

    *body = b2CreateBody(B2Wrap_worldId, &body_def);
    b2ShapeDef shape_def = b2DefaultShapeDef();
    b2Polygon shape = b2MakeBox(rect.width, rect.height);

    b2CreatePolygonShape(*body, &shape_def, &shape);

    return obj;
}

void B2Wrap_init(ScriptEngine *engine) {
    b2WorldDef world_def = b2DefaultWorldDef();
    B2Wrap_worldId = b2CreateWorld(&world_def);

    SCRIPTENGINE_DEFINE_CLASS(engine, b2Body, NULL, 0);
}

