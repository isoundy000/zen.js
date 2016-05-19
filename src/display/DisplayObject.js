/**
 * DisplayObject Class
 * base class of all display objects
 **/
var DisplayObject = function() {

    // type of this display object
    // typeof DISPLAY_TYPE
    this.type = null;

    // bla bla ...
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.anchorX = 0;
    this.anchorY = 0;

    // a 4x4 transform matrix
    this.transform = new Matrix();

    this.width = 0;
    this.height = 0;

    this.filters = [];

    this.blend = BLEND_MODE.SOURCE_OVER;

}

/**
 * get vertices data of this
 **/
DisplayObject.prototype.getVertices = function() {

}

/**
 * get indices data of this
 **/
DisplayObject.prototype.getIndices = function() {

};

/**
 * get draw data of this
 **/
DisplayObject.prototype.getDrawData = function(render) {

};

/**
 * prepare draw for a render
 **/
// DisplayObject.prototype.prepareDraw = function(render) {
//
// };

/**
 * get the transform matrix
 **/
DisplayObject.prototype.getTransformMatrix = function() {

    this.transform.identify();
    this.transform.translate(-this.anchorX * this.width, -this.anchorY * this.height);
    this.transform.scale(this.scaleX, this.scaleY);
    this.transform.rotate(this.rotation);
    this.transform.translate(this.x, this.y);

    return this.transform;
}
