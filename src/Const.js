/*
 * render command
 */
var RENDER_CMD = {

    TEXTURE: 0,

    RECT: 1,

    BLEND: 2

}

/*
 * display object type
 */
var DISPLAY_TYPE = {

    CONTAINER: 0,

    RECT: 1,

    SPRITE: 2
}

/*
 * blend mode
 */
var BLEND_MODE = {

    SOURCE_OVER: ["ONE", "ONE_MINUS_SRC_ALPHA"],

    LIGHTER: ["SRC_ALPHA", "ONE"],

    DESTINATION_OUT: ["ZERO", "ONE_MINUS_SRC_ALPHA"],

    DESTINATION_IN: ["ZERO", "SRC_ALPHA"],

    ADD: ["ONE", "DST_ALPHA"],

    MULTIPLY: ["DST_COLOR", "ONE_MINUS_SRC_ALPHA"],

    SCREEN: ["ONE", "ONE_MINUS_SRC_COLOR"]
}