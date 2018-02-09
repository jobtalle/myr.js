var myr = new function() {
    var gl;
    var clearColor;
    var width, height;
    var surface;
    
    var Color = this.Color = function(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;

        if(a === undefined)
            this.a = 1;
        else
            this.a = a;
    };
    
    var Vector = this.Vector = function(x, y) {
        this.x = x;
        this.y = y;
    };
    
    Vector.prototype.add = function(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    };

    Vector.prototype.subtract = function(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    };

    Vector.prototype.negate = function() {
        return new Vector(-this.x, -this.y);
    };

    Vector.prototype.dot = function(vector) {
        return this.x * vector.x + this.y * vector.y;
    };

    Vector.prototype.length = function() {
        return Math.sqrt(this.dot(this));
    };

    Vector.prototype.multiply = function(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    };

    Vector.prototype.divide = function(scalar) {
        if(scalar === 0)
            return new Vector(0, 0);
        else
            return this.multiply(1 / scalar);
    };

    Vector.prototype.normalize = function() {
        return this.divide(this.length());
    };
    
    Vector.prototype.angle = function() {
        return Math.atan2(this.y, this.x);
    };
    
    this.Surface = function(width, height) {
        var clearColor = new Color(0, 0, 0, 0);
        var texture = gl.createTexture();
        var framebuffer = gl.createFramebuffer();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        this.free = function() {
            gl.deleteTexture(texture);
            gl.deleteFramebuffer(framebuffer);
        };
        
        this.getWidth = function() {
            return width;
        };
        
        this.getHeight = function() {
            return height;
        };
        
        this.setClearColor = function(color) {
            clearColor = color;
        };
        
        this.bind = function() {
            surface = this;
            
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.viewport(0, 0, width, height);
        };
        
        this.clear = function() {
            gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
            gl.clear(gl.COLOR_BUFFER_BIT);
        };
    };
    
    var bind = this.bind = function() {
        surface = null;
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, width, height);
    };
    
    this.initialize = function(canvasElement) {
        gl = canvasElement.getContext("webgl");
        clearColor = new Color(0, 0, 0, 0);
        width = canvasElement.width;
        height = canvasElement.height;
        
        bind();
    };
    
    this.setClearColor = function(color) {
        clearColor = color;
    };
    
    this.clear = function() {
        gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
        gl.clear(gl.COLOR_BUFFER_BIT);
    };
};