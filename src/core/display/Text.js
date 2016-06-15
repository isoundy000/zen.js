var textCanvas = document.createElement("canvas");

var textContext = textCanvas.getContext("2d");

/**
 * Text Class
 * sprite to show text
 **/
var Text = function(gl) {

    Text.superClass.constructor.call(this);

    this.type = DISPLAY_TYPE.TEXT;

    // we render text on a 2D context, and then
    // store canvas to this texture
    this.texture = new Texture(gl);

    // text
    this.$text = "";

    // font color
    this.$fontColor = 0xff0000;

    // font size
    this.$fontSize = 24;

    // font family
    this.$fontFamily = "Arial";

    // dirty flag
    this.dirty = true;

    // TODO width and height is not used in this DisplayObject

}

// inherit
Util.inherit(Text, DisplayObject);

Object.defineProperties(Text.prototype, {

    text:
    {
        get: function ()
        {
            return this.$text;
        },
        set: function(value)
        {
            this.$text = value;
            this.dirty = true;
        }
    },

    fontColor:
    {
        get: function ()
        {
            return this.$fontColor;
        },
        set: function(value)
        {
            this.$fontColor = value;
            this.dirty = true;
        }
    },

    fontSize:
    {
        get: function ()
        {
            return this.$fontSize;
        },
        set: function(value)
        {
            this.$fontSize = value;
            this.dirty = true;
        }
    },

    fontFamily:
    {
        get: function ()
        {
            return this.$fontFamily;
        },
        set: function(value)
        {
            this.$fontFamily = value;
            this.dirty = true;
        }
    }

});

/**
 * get coords data of this
 * [
 *      0         , 0          ,
 *      this.width, 0          ,
 *      this.width, this.height,
 *      0         , this.height
 * ]
 **/
Text.prototype.getCoords = function() {

    if(this.dirty) {
        var canvas = textCanvas;
        var context = textContext;
        context.font = this.$fontSize + "px " + this.$fontFamily;
        this.width = context.measureText(this.$text).width;
        this.height = this.$fontSize * 1.4;
    }

    this.coords[0] = this.coords[1] = this.coords[3] = this.coords[6] = 0;
    this.coords[2] = this.coords[4] = this.width;
    this.coords[5] = this.coords[7] = this.height;

    return coords;
}

/**
 * get props data of this
 * uv datas
 * [
 *     0, 0,
 *     1, 0,
 *     1, 1,
 *     0, 1
 * ]
 **/
Text.prototype.getProps = function() {
    this.props[0] = 0;
    this.props[1] = 0;
    this.props[2] = 1;
    this.props[3] = 0;

    this.props[4] = 1;
    this.props[5] = 1;
    this.props[6] = 0;
    this.props[7] = 1;

    return this.props;
}

/**
 * get indices data of this
 **/
Text.prototype.getIndices = function() {
    this.indices[0] = 0;
    this.indices[1] = 1;
    this.indices[2] = 2;

    this.indices[3] = 2;
    this.indices[4] = 3;
    this.indices[5] = 0;

    return this.indices;
};

/**
 * get draw data of this
 **/
Text.prototype.getDrawData = function() {
    var data = DrawData.getObject();

    // if dirty, update texture
    if(this.dirty) {
        this.updateTexture();
        this.dirty = false;
    }

    data.texture = this.texture;
    data.filters = this.filters;
    return data;
};

/**
 * update texture
 */
Text.prototype.updateTexture = function() {
    var canvas = textCanvas;
    var context = textContext;

    context.font = this.$fontSize + "px " + this.$fontFamily;

    // canvas can not be size 0
    var width = context.measureText(this.$text).width || 1;
    var height = this.$fontSize * 1.4 || 1;

    canvas.width = width;
    canvas.height = height;

    context.clearRect(0, 0, width, height);

    context.font = this.$fontSize + "px " + this.$fontFamily;
    context.fillStyle = "#" + this.$fontColor.toString(16);
    context.fillText(this.$text, 0, this.$fontSize);

    this.texture.uploadImage(canvas, true);
}
