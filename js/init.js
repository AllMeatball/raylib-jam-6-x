import * as os  from "os";
import * as std from "std";

import {
    RL_ConfigFlags,
    RL_DrawCircle,
    RL_DrawTextureAtOrigin,
    RL_TextureWrap,
    RL_TextureFilter,
    RL_KeyboardKey,
    RL_MouseButton
} from "./raylib.js";

import { require } from "./modules/cjspoly.js";

// import * as PHY from "./physics.js";
console.log("ENGINE: <init.js> loaded");

globalThis.LAUNCH_ARGS = scriptArgs.slice(1);

function handleErrno(result, message) {
    if (result[1] != 0)
        throw Error(`${message}: (${result[1]}) ${std.strerror(result[1])}`);

    return result[0]
}

const MOUNTS_PATH = "mounts/";
const filenames = handleErrno(os.readdir(MOUNTS_PATH), "Failed to read mounts dir");
filenames.sort();

filenames.forEach((filename) => {
    if (filename.charAt(0) == '.')
        return;

    if (!filename.endsWith('.json'))
        return;

    const file = std.open(`${MOUNTS_PATH}${filename}`, 'r');
    const mounts = JSON.parse(file.readAsString());
    file.close();

    mounts.forEach((mount) => {
        const archive_path = handleErrno(os.realpath(mount.archive));
        FS_Mount(archive_path, mount.mount, mount.append);
    });
});

// remove functions that aren't needed in game code past this point
delete globalThis.FS_Mount;

globalThis.RL_ConfigFlags = RL_ConfigFlags;
globalThis.RL_DrawCircle  = RL_DrawCircle;
globalThis.RL_DrawTextureAtOrigin = RL_DrawTextureAtOrigin;

globalThis.RL_TextureFilter = RL_TextureFilter;
globalThis.RL_TextureWrap   = RL_TextureWrap;
globalThis.RL_KeyboardKey   = RL_KeyboardKey;
globalThis.RL_MouseButton   = RL_MouseButton;

globalThis.FS_AbsolutePath = function(path) {
    const path_parts = path.split('/');

    const new_path_parts = [];
    for (const part of path_parts) {
        // console.log(i, part);
        switch (part) {
            case '.':
                break;
            case '..':
                new_path_parts.shift();
                return;
            default:
                new_path_parts.push(part);
                break;
        }

    }

    return new_path_parts.join('/');
};

globalThis.ASSET_TYPE = Object.freeze({
    IMAGE: 0,
    TEXTURE: 1,
    MUSIC: 2,
});

globalThis.require = require;

const _asset_list = {};
globalThis.LoadAsset = function(type, path, key) {
    let asset = undefined;

    switch (type) {
        case ASSET_TYPE.IMAGE:
            asset = new RL_Image(path);
            break;
        case ASSET_TYPE.TEXTURE:
            asset = new RL_Texture(path);
            break;
        case ASSET_TYPE.MUSIC:
            asset = new RL_MusicStream(path);
            break;
    }

    if (!asset)
        throw Error(`Unknown asset type number ${type}`);

    if (key in _asset_list)
        throw Error(`Can't override asset key '${key}'`);

    _asset_list[key] = asset;
    return asset;
}

globalThis.GetAsset = function(key) {
    return _asset_list[key];
}

globalThis.MusicUpdate = function() {
    for (const key in _asset_list) {
        const asset = _asset_list[key];

        if ( !(asset instanceof RL_MusicStream) )
            continue;

        asset.update();
    }
}


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
globalThis.getRandomInt = function(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

globalThis.RAD2DEG = 180 / Math.PI;

globalThis.MirrorRange = (value, x) => (value >= -x && value <= x);

globalThis.GetVectorMagnitude = function(...values) {
    let sum = 0;

    for (const value of values)
        sum += value * value;

    return Math.sqrt(sum);
}

class Vector2 {
    x = 0;
    y = 0;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    addVector2(vec2) {
        this.x += vec2.x;
        this.y += vec2.y;
    }


    copy() {
        return new Vector2(this.x, this.y);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    magnitude() {
        return GetVectorMagnitude(this.x, this.y);
    }

    normalize() {
        const magnitude = this.magnitude();

        this.x /= magnitude;
        this.y /= magnitude;
    }

    circleClamp(radius) {
        if (this.magnitude() > radius) {
            this.normalize();
            this.x *= radius;
            this.y *= radius;
        }
    }

    applyFunction(func) {
        this.x = func(this.x, 'x');
        this.y = func(this.y, 'y');
    }
}
globalThis.Vector2 = Vector2;

globalThis.Clamp = (value, min, max) => Math.min(Math.max(value, min), max);
