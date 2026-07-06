import * as os  from "os";
import * as std from "std";

import {
    RL_ConfigFlags,
    RL_DrawCircle,
    RL_TextureWrap,
    RL_TextureFilter
} from "./raylib.js";

import { require } from "./modules/cjspoly.js";

// import * as PHY from "./physics.js";
console.log("ENGINE: <init.js> loaded");

const args = scriptArgs.slice(1);

for (let i = 0; i < args.length; i++) {
    console.log(args);
}

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

// globalThis.PHY = PHY;
globalThis.RL_ConfigFlags = RL_ConfigFlags;
globalThis.RL_DrawCircle  = RL_DrawCircle;

globalThis.RL_TextureFilter = RL_TextureFilter;
globalThis.RL_TextureWrap   = RL_TextureWrap;

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
globalThis.LoadAsset = function(type, path) {
    switch (type) {
        case ASSET_TYPE.IMAGE:
            return new RL_Image(path);
        case ASSET_TYPE.TEXTURE:
            return new RL_Texture(path);
        default:
            throw Error(`Unknown asset type number ${type}`);
    }

}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
globalThis.getRandomInt = function(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
