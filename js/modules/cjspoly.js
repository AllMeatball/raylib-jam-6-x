class CommonModule {
    exports = new Object()
}

export function require(path) {
    if (path.startsWith('./') || path.startsWith('../'))
        path = FS_AbsolutePath("js/"+path);

    const code = RL_LoadFileText(path);

    const module = new CommonModule();
    Function('module', 'exports', code).apply(null, [module, module.exports]);
    // console.log(module.exports, exports);

    return module.exports;
}
