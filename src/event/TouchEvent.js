/**
 * TouchEvent Class
 **/
var TouchEvent = function() {
    TouchEvent.superClass.constructor.call(this);
    // page position
    this.pageX = 0;
    this.pageY = 0;
    // local position
    this.localX = 0;
    this.localY = 0;
}

// inherit
Util.inherit(TouchEvent, Event);

/**
 * create and dispatch event
 **/
TouchEvent.dispatchEvent = function(target, type, pageX, pageY) {
    var event = new TouchEvent();
    event.type = type;
    event.target = target;
    event.pageX = pageX;
    event.pageY = pageY;
    var matrix = target.getInvertedConcatenatedMatrix();
    var localX = matrix.a * pageX + matrix.c * pageY + matrix.tx;
    var localY = matrix.b * pageX + matrix.d * pageY + matrix.ty;
    event.localX = localX;
    event.localY = localY;
    target.dispatchEvent(event);
}

/**
 * touch tap event
 **/
TouchEvent.TOUCH_TAP = "touch_tap";

/**
 * touch begin event
 **/
TouchEvent.TOUCH_BEGIN = "touch_begin";

/**
 * touch move event
 **/
TouchEvent.TOUCH_MOVE = "touch_move";

/**
 * touch end event
 **/
TouchEvent.TOUCH_END = "touch_end";

/**
 * touch release outside event
 **/
TouchEvent.TOUCH_RELEASE_OUTSIDE = "touch_release_outside";
