#version 120

// Input vertex attributes (from vertex shader)
varying vec2 fragTexCoord;
varying vec4 fragColor;

// Input uniform values
uniform sampler2D texture0;
uniform vec4 colDiffuse;

uniform vec3 paletteRed;

uniform vec3 paletteGreen;

uniform vec3 paletteBlue;

void main()
{
    // Texel color fetching from texture sampler
    vec4 texelColor = texture2D(texture0, fragTexCoord) * colDiffuse * fragColor;

    vec4 result = vec4(0.0);
    result.a = texelColor.a;

    result.rgb += vec3(texelColor.r) * paletteRed.rgb;
    result.rgb += vec3(texelColor.g) * paletteGreen.rgb;
    result.rgb += vec3(texelColor.b) * paletteBlue.rgb;

    // Calculate final fragment color
    gl_FragColor = result;
}
