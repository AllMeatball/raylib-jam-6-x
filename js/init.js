import * as os  from "os";
import * as std from "std";

import {
    RL_ConfigFlags,
    RL_DrawCircle,
    RL_DrawTextureAtOrigin,
    RL_TextureWrap,
    RL_TextureFilter,
    RL_KeyboardKey
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
        // const archive_path = handleErrno(os.realpath(mount.archive));
        FS_Mount(mount.archive, mount.mount, mount.append);
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

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
globalThis.getRandomInt = function(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

globalThis.GetVectorMagnitude = function(...values) {
    let sum = 0;

    for (const value of values)
        sum += value * value;

    return Math.sqrt(sum);
}

globalThis.Clamp = (value, min, max) => Math.min(Math.max(value, min), max);
