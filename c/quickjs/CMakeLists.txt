cmake_minimum_required(VERSION 3.13)
project(QuickJS C)

file(READ "${CMAKE_CURRENT_SOURCE_DIR}/VERSION" QUICKJS_CONFIG_VER_RAW)
string(STRIP "${QUICKJS_CONFIG_VER_RAW}" QUICKJS_CONFIG_VER)
# set(C_STANDARD 99)

set(QUICKJS_SRC
    quickjs.c
    dtoa.c
    libregexp.c
    libunicode.c
    cutils.c
    quickjs-libc.c
)

add_library(quickjs STATIC ${QUICKJS_SRC})

target_compile_options(quickjs PRIVATE -Wall -MMD -Wno-array-bounds -Wno-infinite-recursion -fwrapv)

target_compile_definitions(quickjs PRIVATE _GNU_SOURCE)
target_compile_definitions(quickjs PRIVATE "CONFIG_VERSION=\"${QUICKJS_CONFIG_VER}\"")

