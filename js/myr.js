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
        
        gl.activeTexture(TEXTURE_EDITING);
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
                
                gl.activeTexture(TEXTURE_EDITING);
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
            if(this.ready()) {
                if(currentTexture != texture) {
                    flush();
                    
                    currentTexture = texture;
                }
                
                draw(RENDER_MODE_SURFACES, shaders, [x, y]);
            }
        };
        this.free = () => {
            gl.deleteTexture(texture);
            gl.deleteFramebuffer(framebuffer);
        };
    };
    
    const Shader = this.Shader = function(vertex, fragment, samplers) {
        const program = gl.createProgram();
        const createShader = (type, source) => {
            const shader = gl.createShader(type);
            
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            
            if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
                console.log(gl.getShaderInfoLog(shader));
            
            return shader;
        };
        
        const shaderVertex = createShader(gl.VERTEX_SHADER, SHADER_VERSION + vertex);
        const shaderFragment = createShader(gl.FRAGMENT_SHADER, SHADER_VERSION + fragment);
        const samplerNames = Object.keys(samplers);
        const samplerLocations = new Object();
        
        gl.attachShader(program, shaderVertex);
        gl.attachShader(program, shaderFragment);
        gl.linkProgram(program);
        
        for(var i = 0; i < samplerNames.length; ++i) {
            const sampler = samplerNames[i];
            
            samplerLocations.sampler = gl.getUniformLocation(program, sampler);
        }
        
        this.bind = () => {
            gl.useProgram(program);
            
            for(var i = 0; i < samplerNames.length; ++i) {
                const sampler = samplerNames[i];
                
                gl.uniform1i(samplerLocations.sampler, samplers[sampler]);
            }
        };
        this.free = () => {
            gl.detachShader(program, shaderVertex);
            gl.detachShader(program, shaderFragment);
            gl.deleteShader(shaderVertex);
            gl.deleteShader(shaderFragment);
            gl.deleteProgram(program);
        };
    };
    
    const ShaderSet = function(surfaces, sprites, lines, points) {
        let shaders = [surfaces, sprites, lines, points];
        
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
            case RENDER_MODE_SURFACES:
                gl.activeTexture(TEXTURE_SURFACE);
                gl.bindTexture(gl.TEXTURE_2D, currentTexture);
                
                gl.bindVertexArray(vaoSprites);
                gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, instanceCount);
                break;
            case RENDER_MODE_SPRITES:
                
                break;
            case RENDER_MODE_LINES:
                
                break;
            case RENDER_MODE_POINTS:
                
                break;
        }
        
        gl.bindVertexArray(null);
        
        instanceBufferAt = 0;
        instanceCount = 0;
    };
    
    const setMode = mode => {
        renderMode = mode;
    };
    
    const setShader = newShader => {
        shader = newShader;
        
        shader.bind();
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
        gl.deleteBuffer(transformBuffer);
    }
    
    const SHADER_VERSION = "#version 300 es\n";
    const RENDER_MODE_NONE = -1;
    const RENDER_MODE_SURFACES = 0;
    const RENDER_MODE_SPRITES = 1;
    const RENDER_MODE_LINES = 2;
    const RENDER_MODE_POINTS = 3;
    const QUAD = [0, 0, 0, 1, 1, 1, 1, 0];
    const gl = canvasElement.getContext("webgl2");
    const TEXTURE_ATLAS = gl.TEXTURE0;
    const TEXTURE_SURFACE = gl.TEXTURE1;
    const TEXTURE_EDITING = gl.TEXTURE2;
    const quad = gl.createBuffer();
    const instances = gl.createBuffer();
    const vaoSprites = gl.createVertexArray();
    const transformBuffer = gl.createBuffer();
    
    const shaderSprites = new Shader(
        "layout(location = 0) in vec2 vertex;" +
        "layout(location = 1) in vec2 position;" +
        "layout(std140) uniform transform {" +
            "vec4 widthRow0;" +
            "vec4 heightRow1;" +
        "};" +
        "out highp vec2 uv;" +
        "void main() {" +
            "uv = vertex;" +
            "vec2 transformed = vertex + position;" +
            "gl_Position = vec4(vec2(transformed.x - 1.0, 1.0 - transformed.y), 0, 1);" +
        "}",
        "uniform sampler2D source;" +
        "in highp vec2 uv;" +
        "layout (location = 0) out lowp vec4 color;" +
        "void main() {" +
            "color = texture(source, uv);" +
        "}",
        {
            source: 1
        }
    );
    
    const shadersDefault = new ShaderSet(shaderSprites, shaderSprites, shaderSprites, shaderSprites);
    const transform = new Float32Array(8);
    
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
    let currentTexture = null;
    
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);
    gl.bufferData(gl.ARRAY_BUFFER, instanceBufferCapacity, gl.DYNAMIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(QUAD), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.UNIFORM_BUFFER, transformBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, transform, gl.DYNAMIC_DRAW);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, transformBuffer);
    
    gl.bindVertexArray(vaoSprites);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribDivisor(1, 1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 8, 0);
    
    gl.bindVertexArray(null);

    this.bind();
};