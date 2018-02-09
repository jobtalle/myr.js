var myr = {
    initialize: function(canvasElement) {
        this.gl = canvasElement.getContext("webgl");
        this.clearColor = new myr.Color(0, 0, 0, 0);
        this.width = canvasElement.width;
        this.height = canvasElement.height;
        
        this.bind();
    },
    
    setClearColor: function(color) {
        this.clearColor = color;
    },
    
    clear: function() {
        this.gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    },
    
    bind: function() {
        this.surface = null;
        
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.width, this.height);
    }
}

myr.Surface = function(width, height) {
    this.clearColor = new myr.Color(0, 0, 0, 0);
    this.width = width;
    this.height = height;
    this.texture = myr.gl.createTexture();
    this.framebuffer = myr.gl.createFramebuffer();
    
    myr.gl.bindTexture(myr.gl.TEXTURE_2D, this.texture);
    myr.gl.texParameteri(myr.gl.TEXTURE_2D, myr.gl.TEXTURE_MAG_FILTER, myr.gl.NEAREST);
    myr.gl.texParameteri(myr.gl.TEXTURE_2D, myr.gl.TEXTURE_MIN_FILTER, myr.gl.LINEAR);
    myr.gl.texImage2D(myr.gl.TEXTURE_2D, 0, myr.gl.RGBA, width, height, 0, myr.gl.RGBA, myr.gl.UNSIGNED_BYTE, null);
    
    myr.gl.bindFramebuffer(myr.gl.FRAMEBUFFER, this.framebuffer);
    myr.gl.framebufferTexture2D(
        myr.gl.FRAMEBUFFER,
        myr.gl.COLOR_ATTACHMENT0,
        myr.gl.TEXTURE_2D,
        this.texture,
        0);
    
    myr.gl.bindFramebuffer(myr.gl.FRAMEBUFFER, null);
}

myr.Surface.prototype.free = function() {
    myr.gl.deleteTexture(this.texture);
    myr.gl.deleteFramebuffer(this.framebuffer);
}

myr.Surface.prototype.clearColor = function(color) {
    this.clearColor = color;
}

myr.Surface.prototype.clear = function() {
    myr.gl.clearColor(this.clearColor.r, this.clearColor.g, this.clearColor.b, this.clearColor.a);
    myr.gl.clear(myr.gl.COLOR_BUFFER_BIT);
}

myr.Surface.prototype.bind = function() {
    myr.surface = this;
    
    myr.gl.bindFramebuffer(myr.gl.FRAMEBUFFER, this.fbo);
    myr.gl.viewport(0, 0, this.width, this.height);
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