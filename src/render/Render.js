/**
 * Render Class
 **/
var Render = function(view) {
    // canvas
    this.view = view;
    // gl context
    this.gl = view.getContext("webgl", {
        antialias: false, // effect performance!! default false
        // alpha: false, // effect performance, default false
        // premultipliedAlpha: false, // effect performance, default false
        stencil: true
    });
    // width and height, same with the canvas
    this.width = view.clientWidth;
    this.height = view.clientHeight;

    // render target
    this.rootRenderTarget = new RenderTarget(this.gl, this.width, this.height, true);
    this.currentRenderTarget = null;
    this.activateRenderTarget(this.rootRenderTarget);

    // render buffer
    this.rootRenderBuffer = new RenderBuffer(this.gl);
    this.currentRenderBuffer = null;
    this.activateRenderBuffer(this.rootRenderBuffer);

    // shader
    this.textureShader = new TextureShader(this.gl);
    this.primitiveShader = new PrimitiveShader(this.gl);
    this.colorTransformShader = new ColorTransformShader(this.gl);
    this.currentShader = null;

    // draw call count
    this.drawCall = 0;

    this.defaultBlendMode = BLEND_MODE.SOURCE_OVER;

    // filter
    this.filtersStack = [];

    // init webgl
    var gl = this.gl;
    gl.disable(gl.STENCIL_TEST);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    this.setBlendMode(this.defaultBlendMode);
}

Object.defineProperties(Render.prototype, {
    /**
     * webgl context
     **/
    context:
    {
        get: function ()
        {
            return this.gl;
        }
    }
});

/**
 * activate a shader
 **/
Render.prototype.activateShader = function(shader) {
    if(this.currentShader == shader) {
        return;
    }

    var gl = this.gl;
    shader.activate(gl, this.width, this.height);
    this.currentShader = shader;
}

/**
 * activate a renderTarget
 **/
 Render.prototype.activateRenderTarget = function(renderTarget) {
     if(this.currentRenderTarget == renderTarget) {
         return;
     }

     renderTarget.activate();
     this.currentRenderTarget = renderTarget;
 }

 /**
  * activate a renderBuffer
  **/
  Render.prototype.activateRenderBuffer = function(renderBuffer) {
      if(this.currentRenderBuffer == renderBuffer) {
          return;
      }

      renderBuffer.activate();
      this.currentRenderBuffer = renderBuffer;
  }

/**
 * render display object and flush
 **/
Render.prototype.render = function(displayObject) {

    this.drawCall = 0;

    this._render(displayObject);

    this.flush();

    return this.drawCall;

};

/**
 * render display object
 **/
Render.prototype._render = function(displayObject) {

    // if buffer count reached max size, auto flush
    if(this.currentRenderBuffer.reachedMaxSize()) {
        this.flush();
    }

    // save matrix
    var transform = this.currentRenderBuffer.transform;
    var matrix = Matrix.create();
    matrix.copy(transform);

    // transform, use append to add transform matrix
    transform.append(displayObject.getTransformMatrix());

    // if blend, cache blend mode
    if(displayObject.blend != this.defaultBlendMode) {
        this.currentRenderBuffer.cacheBlendMode(displayObject.blend);
    }

    // if filter, pushFilters, identify matrix
    var filterMatrix = null;
    if(displayObject.filters.length > 0) {

        filterMatrix = Matrix.create();
        filterMatrix.copy(transform);
        transform.identify();

        this.currentRenderBuffer.cacheFiltersPush(displayObject.filters, displayObject.width, displayObject.height);
    }

    // if mask, pushMask
    if(displayObject.mask) {
        // TODO handle mask

        // cache rect

        // cacheMaskPush
    }

    if(displayObject.type == DISPLAY_TYPE.CONTAINER) {// cache children

        // if cacheAsBitmap

        // if not init
        // change target, identify matrix

        var len = displayObject.children.length;
        for(var i = 0; i < len; i++) {
            var child = displayObject.children[i];
            this._render(child);
        }

        // render renderTexture

    } else {
        // cache display object
        this.currentRenderBuffer.cache(displayObject);
    }

    // if blend, reset blend mode
    if(displayObject.blend != this.defaultBlendMode) {
        this.currentRenderBuffer.cacheBlendMode(this.defaultBlendMode);
    }

    // if filter, popFilters, restoreMatrix
    if(displayObject.filters.length > 0) {

        for(var i = 0; i < displayObject.filters.length - 1; i++) {

            if(this.currentRenderBuffer.reachedMaxSize()) {
                this.flush();
            }

            this.currentRenderBuffer.cacheQuad(displayObject.width, displayObject.height, transform);
        }

        transform.copy(filterMatrix);
        Matrix.release(filterMatrix);

        if(this.currentRenderBuffer.reachedMaxSize()) {
            this.flush();
        }

        // last time, push vertices by real transform
        this.currentRenderBuffer.cacheQuad(displayObject.width, displayObject.height, transform);

        this.currentRenderBuffer.cacheFiltersPop();
    }

    // if mask, popMask
    if(displayObject.mask) {
        // TODO handle mask

        // cacheMaskPop
    }

    // restore matrix
    transform.copy(matrix);
    Matrix.release(matrix);
};

/**
 * flush the render buffer data, should do in the end of the frame
 **/
Render.prototype.flush = function() {

    this.drawWebGL();

    this.currentRenderBuffer.clear();
}

/**
 * draw into webGL context
 **/
Render.prototype.drawWebGL = function() {
    var gl = this.gl;

    this.currentRenderBuffer.upload();

    var offset = 0;
    var drawData = this.currentRenderBuffer.drawData;
    var currentSize = drawData.length;
    for(var i = 0; i < currentSize; i++) {
        var data = drawData[i];

        switch (data.cmd) {
            case RENDER_CMD.TEXTURE:

                var size = data.count;
                // is texture not loaded skip render
                if(data.texture && data.texture.isInit) {

                    this.activateShader(this.textureShader);

                    // TODO use more texture unit
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, data.texture.glTexture);

                    gl.drawElements(gl.TRIANGLES, size * 6, gl.UNSIGNED_SHORT, offset * 2);

                    // count draw call if texture not exist?
                    this.drawCall++;
                }

                offset += size * 6;

                break;

            case RENDER_CMD.RECT:

                var size = data.count;

                this.activateShader(this.primitiveShader);

                this.primitiveShader.fillColor(gl, data.color);

                gl.drawElements(gl.TRIANGLES, size * 6, gl.UNSIGNED_SHORT, offset * 2);

                this.drawCall++;

                offset += size * 6;

                break;

            case RENDER_CMD.BLEND:

                var blendMode = data.blendMode;

                // set blendMode
                this.setBlendMode(blendMode);

                break;

            case RENDER_CMD.FILTERS_PUSH:

                // get filters
                var filters = data.filters;

                // the root of this stack
                // after all, we must draw to the stage
                if(this.filtersStack.length == 0) {
                    this.filtersStack.push({
                        filters: null,
                        renderTarget: this.currentRenderTarget
                    });
                }

                // create a render target for filters
                // this render target will store the render result of prev filters
                // and as a input of this filters
                var renderTarget = RenderTarget.create(this.gl, data.width, data.height);

                // push filters data
                this.filtersStack.push({
                    filters: filters,
                    renderTarget: renderTarget
                });

                // activate this render target, so the object will be rendered to this render target
                // TODO maybe this draw can apply a filter?
                this.activateRenderTarget(renderTarget);

                break;

            case RENDER_CMD.FILTERS_POP:

                var currentData = this.filtersStack.pop();
                var lastData = this.filtersStack[this.filtersStack.length - 1];

                var filters = currentData.filters;
                var len = filters.length;

                var flip = currentData.renderTarget;
                if(len > 1) {

                    for(var j = 0; j < len - 1; j++) {

                        var filter = filters[j];

                        // a temp render target
                        var flop = RenderTarget.create(gl, flip.width, flip.height);

                        offset = filter.applyFilter(this, flip, flop, offset);

                        RenderTarget.release(flip);

                        flip = flop;
                    }

                }

                var filter = filters[filters.length - 1];

                var renderTarget = lastData.renderTarget;

                offset = filter.applyFilter(this, flip, renderTarget, offset);

                // release the render target
                RenderTarget.release(flip);

                break;

            case RENDER_CMD.MASK_PUSH:

                // TODO handle mask push

                break;

            case RENDER_CMD.MASK_POP:

                // TODO handle mask pop

                break;

            default:
                console.warn("no render type function!");
                break;

        }

    }

    gl.bindTexture(gl.TEXTURE_2D, null);
}

/**
 * apply filter
 */
Render.prototype.applyFilter = function(filter, input, output, offset) {
    var gl = this.gl;

    this.activateRenderTarget(output);

    var size = 1;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, input.texture.glTexture);
    gl.drawElements(gl.TRIANGLES, size * 6, gl.UNSIGNED_SHORT, offset * 2);
    this.drawCall++;

    offset += size * 6;

    return offset;
}

/**
 * set blend mode
 */
Render.prototype.setBlendMode = function(blendMode) {
    var gl = this.gl;

    if(blendMode && blendMode.length == 2) {
        gl.blendFunc(gl[blendMode[0]], gl[blendMode[1]]);
    } else {
        console.log("blend mode not found!");
    }
}

/**
 * clear current renderTarget
 **/
Render.prototype.clear = function() {
    this.currentRenderTarget.clear();
}
