let Myr = function(canvasElement) {
    const Color = this.Color = function(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;

        if(a === undefined)
            this.a = 1;
        else
            this.a = a;
    };
    
    const Vector = this.Vector = function(x, y) {
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
        let clearColor = new Color(0, 0, 0, 0);
        let texture = gl.createTexture();
        let framebuffer = gl.createFramebuffer();
        let shader = shaderDefault;
        let self = this;
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        
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
        
        this.getShader = function() {
            return shader;
        };
        
        this.getFramebuffer = function() {
            return framebuffer;
        };
        
        this.setClearColor = function(color) {
            clearColor = color;
        };
        
        this.bind = function() {
            bind(self);
        };
        
        this.clear = function() {
            gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
            gl.clear(gl.COLOR_BUFFER_BIT);
        };
    };
    
    const Shader = this.Shader = function(vertex, fragment) {
        const program = gl.createProgram();
        
        let createShader = function(type, source) {
            const shader = gl.createShader(type);
            
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            
            return shader;
        };
        
        const shaderVertex = createShader(gl.VERTEX_SHADER, vertex);
        const shaderFragment = createShader(gl.FRAGMENT_SHADER, fragment);

        gl.attachShader(program, shaderVertex);
        gl.attachShader(program, shaderFragment);
        gl.linkProgram(program);
        
        this.free = function() {
            gl.detachShader(program, shaderVertex);
            gl.detachShader(program, shaderFragment);
            gl.deleteShader(shaderVertex);
            gl.deleteShader(shaderFragment);
            gl.deleteProgram(program);
        };
        
        this.getProgram = function() {
            return program;
        };
    };
    
    const bind = function(target) {
        if(surface == target)
            return;
        
        // Unbind previous target
        
        surface = target;
        
        if(surface == null) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, width, height);
        }
        else {            
            gl.bindFramebuffer(gl.FRAMEBUFFER, surface.getFramebuffer());
            gl.viewport(0, 0, surface.getWidth(), surface.getHeight());
        }
    };
    
    this.bind = function() {
        bind(null);
    };
    
    this.free = function() {
        this.shaderDefault.free();
    };
    
    this.setClearColor = function(color) {
        clearColor = color;
    };
    
    this.clear = function() {
        gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
        gl.clear(gl.COLOR_BUFFER_BIT);
    };
    
    const gl = canvasElement.getContext("webgl");
    let clearColor = new Color(0, 0, 0, 0);
    let width = canvasElement.width;
    let height = canvasElement.height;
    let shader = null;
    let surface = null;
    const shaderDefault = new Shader(
        "void main() {" +
            "gl_Position = vec4(0, 0, 0, 1);" +
        "}",
        "void main() {" +
            "gl_FragColor = vec4(1, 0, 1, 1);" +
        "}"
    );

    this.bind();
};