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
    
    this.Surface = function() {
        const texture = gl.createTexture();
        const framebuffer = gl.createFramebuffer();
        let width = 0;
        let height = 0;
        let shaders = shadersDefault;
        let clearColor = new Color(0, 0, 0, 0);
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        
        if(arguments.length == 2) {
            width = arguments[0];
            height = arguments[1];
            
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
        else {
            const image = new Image();
            
            image.onload = function() {
                width = image.width;
                height = image.height;
                
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            };
            
            image.crossOrigin = "Anonymous";
            image.src = arguments[0];
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        
        this.getWidth = () => width;
        this.getHeight = () => height;
        this.getFramebuffer = () => framebuffer;
        this.setClearColor = color => clearColor = color;
        this.bind = () => bind(this);
        this.clear = () => clear(clearColor);
        this.ready = () => !(width == 0 || height == 0);
        this.draw = (x, y) => {
            draw(RENDER_MODE_SPRITES, shaders, [x, y]);
        };
        this.free = () => {
            gl.deleteTexture(texture);
            gl.deleteFramebuffer(framebuffer);
        };
    };
    
    const Shader = this.Shader = function(vertex, fragment) {
        const program = gl.createProgram();
        const createShader = (type, source) => {
            const shader = gl.createShader(type);
            
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            
            if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
                console.log(gl.getShaderInfoLog(shader));
            
            return shader;
        };
        
        const shaderVertex = createShader(gl.VERTEX_SHADER, vertex);
        const shaderFragment = createShader(gl.FRAGMENT_SHADER, fragment);
        
        gl.attachShader(program, shaderVertex);
        gl.attachShader(program, shaderFragment);
        gl.linkProgram(program);
        
        this.getProgram = () => program;
        this.free = () => {
            gl.detachShader(program, shaderVertex);
            gl.detachShader(program, shaderFragment);
            gl.deleteShader(shaderVertex);
            gl.deleteShader(shaderFragment);
            gl.deleteProgram(program);
        };
    };
    
    const ShaderSet = function(sprites, lines, points) {
        let shaders = [sprites, lines, points];
        
        this.get = mode => {
            return shaders[mode];
        };
        
        this.set = (mode, shader) => {
            shaders[mode] = shader;
        };
    };
    
    const bind = target => {
        if(surface == target)
            return;
        
        flush();
        
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
    
    const clear = color => {
        gl.clearColor(color.r, color.g, color.b, color.a);
        gl.clear(gl.COLOR_BUFFER_BIT);
    };
    
    const appendBuffer = data => {
        if(instanceBufferAt + data.length > instanceBufferCapacity) {
            instanceBufferCapacity *= 2;
            
            const oldBuffer = instanceBuffer;
            instanceBuffer = new Float32Array(instanceBufferCapacity);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, instances);
            gl.bufferData(gl.ARRAY_BUFFER, instanceBufferCapacity, gl.DYNAMIC_DRAW);
            
            for(let i = 0; i < oldBuffer.byteLength; ++i)
                instanceBuffer[i] = oldBuffer[i];
        }
        
        for(let i = 0; i < data.length; ++i)
            instanceBuffer[instanceBufferAt++] = data[i];
        
        ++instanceCount;
    };
    
    const flush = this.flush = () => {
        if(instanceCount == 0)
            return;
        
        gl.bindBuffer(gl.ARRAY_BUFFER, instances);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceBuffer, 0, instanceBufferAt);
        
        switch(renderMode) {
            case RENDER_MODE_SPRITES:
                gl.bindVertexArray(vaoSprites);
                gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, instanceCount);
                break;
            case RENDER_MODE_LINES:
                
                break;
            case RENDER_MODE_POINTS:
                
                break;
        }
        
        instanceBufferAt = 0;
        instanceCount = 0;
    };
    
    const setMode = mode => {
        renderMode = mode;
    };
    
    const setShader = newShader => {
        shader = newShader;
        
        gl.useProgram(shader.getProgram());
    }
    
    const draw = (mode, shaderSet, data) => {
        if(renderMode != mode) {
            flush();
            
            setMode(mode);
        
            if(shader != shaderSet.get(mode))
                setShader(shaderSet.get(mode));
        }
        
        appendBuffer(data);
    };
    
    this.bind = () => bind(null);
    this.setClearColor = color => clearColor = color;
    this.clear = () => clear(clearColor);
    this.free = () => {
        shaderSprites.free();
        
        gl.deleteVertexArray(vao);
        gl.deleteBuffer(quad);
        gl.deleteBuffer(instances);
    }
    
    const RENDER_MODE_NONE = -1;
    const RENDER_MODE_SPRITES = 0;
    const RENDER_MODE_LINES = 1;
    const RENDER_MODE_POINTS = 2;
    const QUAD = [0, 0, 0, 1, 1, 1, 1, 0];
    const gl = canvasElement.getContext("webgl2");
    const quad = gl.createBuffer();
    const instances = gl.createBuffer();
    const vaoSprites = gl.createVertexArray();
    
    const shaderSprites = new Shader(
        "#version 300 es\n" +
        "layout(location = 0) in highp vec2 vertex;" +
        "layout(location = 1) in highp vec2 position;" +
        "void main() {" +
            "gl_Position = vec4(vertex + position, 0, 1);" +
        "}",
        "#version 300 es\n" +
        "layout (location = 0) out lowp vec4 color;" +
        "void main() {" +
            "color = vec4(1, 0.6, 0.4, 1);" +
        "}"
    );
    
    const shadersDefault = new ShaderSet(shaderSprites, shaderSprites, shaderSprites);
    
    let renderMode = RENDER_MODE_NONE;
    let instanceBufferCapacity = 1024;
    let instanceBufferAt = 0;
    let instanceBuffer = new Float32Array(instanceBufferCapacity);
    let instanceCount = 0;
    let clearColor = new Color(0, 0, 0, 0);
    let width = canvasElement.width;
    let height = canvasElement.height;
    let shader = null;
    let surface = null;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);
    gl.bufferData(gl.ARRAY_BUFFER, instanceBufferCapacity, gl.DYNAMIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(QUAD), gl.STATIC_DRAW);
    
    gl.bindVertexArray(vaoSprites);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribDivisor(1, 1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 8, 0);

    this.bind();
};