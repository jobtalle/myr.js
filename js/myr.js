var myr = {
    initialize: function(canvasElement) {
        this._gl = canvasElement.getContext("webgl");
        this._clearColor = new myr.Color(0, 0, 0, 0);
        this._width = canvasElement.width;
        this._height = canvasElement.height;
        
        this.bind();
    },
    
    setClearColor: function(color) {
        this._clearColor = color;
    },
    
    clear: function() {
        this._gl.clearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearColor.a);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT);
    },
    
    bind: function() {
        this._surface = null;
        
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
        this._gl.viewport(0, 0, this._width, this._height);
    }
}

myr.Surface = function(width, height) {
    this._clearColor = new myr.Color(0, 0, 0, 0);
    this._width = width;
    this._height = height;
    this.texture = myr._gl.createTexture();
    this.framebuffer = myr._gl.createFramebuffer();
    
    myr._gl.bindTexture(myr._gl.TEXTURE_2D, this.texture);
    myr._gl.texParameteri(myr._gl.TEXTURE_2D, myr._gl.TEXTURE_MAG_FILTER, myr._gl.NEAREST);
    myr._gl.texParameteri(myr._gl.TEXTURE_2D, myr._gl.TEXTURE_MIN_FILTER, myr._gl.LINEAR);
    myr._gl.texImage2D(myr._gl.TEXTURE_2D, 0, myr._gl.RGBA, width, height, 0, myr._gl.RGBA, myr._gl.UNSIGNED_BYTE, null);
    
    myr._gl.bindFramebuffer(myr._gl.FRAMEBUFFER, this.framebuffer);
    myr._gl.framebufferTexture2D(
        myr._gl.FRAMEBUFFER,
        myr._gl.COLOR_ATTACHMENT0,
        myr._gl.TEXTURE_2D,
        this.texture,
        0);
    
    myr._gl.bindFramebuffer(myr._gl.FRAMEBUFFER, null);
}

myr.Surface.prototype.free = function() {
    myr._gl.deleteTexture(this.texture);
    myr._gl.deleteFramebuffer(this.framebuffer);
}

myr.Surface.prototype.getWidth = function() {
    return this._width;
}

myr.Surface.prototype.getHeight = function() {
    return this._height;
}

myr.Surface.prototype.setClearColor = function(color) {
    this._clearColor = color;
}

myr.Surface.prototype.clear = function() {
    myr._gl.clearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearColor.a);
    myr._gl.clear(myr._gl.COLOR_BUFFER_BIT);
}

myr.Surface.prototype.bind = function() {
    myr._surface = this;
    
    myr._gl.bindFramebuffer(myr._gl.FRAMEBUFFER, this.fbo);
    myr._gl.viewport(0, 0, this.width, this.height);
}

myr.Color = function(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;

    if(a == undefined)
        this.a = 1;
    else
        this.a = a;
}

myr.Vector = function(x, y) {
	this.x = x;
	this.y = y;
}

myr.Vector.prototype.add = function(vector) {
    return new myr.Vector(this.x + vector.x, this.y + vector.y);
}

myr.Vector.prototype.subtract = function(vector) {
    return new myr.Vector(this.x - vector.x, this.y - vector.y);
}

myr.Vector.prototype.negate = function() {
    return new myr.Vector(-this.x, -this.y);
}

myr.Vector.prototype.dot = function(vector) {
    return this.x * vector.x + this.y * vector.y;
}

myr.Vector.prototype.length = function() {
    return Math.sqrt(this.dot(this));
}

myr.Vector.prototype.multiply = function(scalar) {
    return new myr.Vector(this.x * scalar, this.y * scalar);
}

myr.Vector.prototype.divide = function(scalar) {
    if(scalar == 0)
        return new myr.Vector(0, 0);
    else
        return this.multiply(1 / scalar);
}

myr.Vector.prototype.normalize = function() {
    return this.divide(this.length());
}

myr.Vector.prototype.angle = function() {
    return Math.atan2(this.y, this.x);
}