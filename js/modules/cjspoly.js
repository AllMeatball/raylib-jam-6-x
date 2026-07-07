class CommonModule {
    exports = new Object()
}

export function require(path) {
    // const module_name = path;

    if (path.startsWith('./') || path.startsWith('../'))
        path = FS_AbsolutePath("js/"+path);

    const code = RL_LoadFileText(path);

    const module = new CommonModule();
    const func = Function('module', 'exports', code, path);

    func.apply(null, [module, module.exports]);

    // console.log(module.exports, exports);

    return module.exports;
}
