cmake_minimum_required(VERSION 3.13)

if (NOT DEFINED GAME_NAME)
    set(GAME_NAME "Hexzard")
endif ()
project("${GAME_NAME}" C)

# Disable a bunch of crap PhysFS enables by default
set(PHYSFS_BUILD_DOCS   OFF)
set(PHYSFS_BUILD_TEST   OFF)
set(PHYSFS_BUILD_SHARED OFF)
set(PHYSFS_BUILD_STATIC ON )
set(PHYSFS_BUILD_DOCS   OFF)
set(BUILD_SHARED_LIBS   OFF)

set(C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

set(APP_SRC
    main.c
    script.c
    fs.c

    # box2d_wrap.c

    rl.c
    rl/font.c
    rl/image.c
    rl/sound.c
    rl/shader.c
    rl/texture.c
    rl/musicstream.c
    rl/rendertexture.c
)



if (EMSCRIPTEN)
    function(web_embed_file input_path)
        file(RELATIVE_PATH embed_path "${CMAKE_BINARY_DIR}" "${CMAKE_SOURCE_DIR}/../${input_path}")
        add_link_options("--embed-file=${embed_path}")
    endfunction()
    # ${CMAKE_SOURCE_DIR}/../res

    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O3")
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -s USE_GLFW=3 -s ASSERTIONS=1 -s WASM=1 -s ASYNCIFY -s GL_ENABLE_GET_PROC_ADDRESS=1 -v --shell-file \"${CMAKE_SOURCE_DIR}/shell.html\" -sINITIAL_MEMORY=268435456")
    set(CMAKE_EXECUTABLE_SUFFIX ".html") # This line is used to set your executable to build with the emscripten html template so that you can directly open it.
    web_embed_file("mounts")
    web_embed_file("res")
    web_embed_file("js")

    # add_link_options()
else()
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O2")
endif ()

# add_subdirectory("box2d")
add_subdirectory("quickjs")
add_subdirectory("physfs")
add_subdirectory("raylib")

add_executable("${GAME_NAME}" ${APP_SRC})

if (EMSCRIPTEN)
    set_target_properties("${GAME_NAME}" PROPERTIES OUTPUT_NAME "index")
endif ()

target_link_libraries("${GAME_NAME}" m) # math library
target_link_libraries("${GAME_NAME}" quickjs raylib physfs-static)
