let Myr = function(canvasElement) {
    const gl = canvasElement.getContext("webgl2", {
        antialias: false,
        depth: false
    });
    
    const Color = this.Color = function(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a === undefined?1:a;
    };
    
    Color.BLACK = new Color(0, 0, 0);
    Color.BLUE = new Color(0, 0, 1);
    Color.GREEN = new Color(0, 1, 0);
    Color.CYAN = new Color(0, 1, 1);
    Color.RED = new Color(1, 0, 0);
    Color.MAGENTA = new Color(1, 0, 1);
    Color.YELLOW = new Color(1, 1, 0);
    Color.WHITE = new Color(1, 1, 1);

    Color.fromHSV = (h, s, v) => {
        const c = v * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = v - c;

        switch(Math.floor(h * 6)) {
            case 1:
                return new Color(x + m, c + m, m);
            case 2:
                return new Color(m, c + m, x + m);
            case 3:
                return new Color(m, x + m, c + m);
            case 4:
                return new Color(x + m, m, c + m);
            case 5:
                return new Color(c + m, m, x + m);
            default:
                return new Color(c + m, x + m, m);
        }
    };

    Color.prototype.toHSV = function() {
        const cMax = Math.max(this.r, this.g, this.b);
        const cMin = Math.min(this.r, this.g, this.b);
        let h, s, l = (cMax + cMin) * 0.5;

        if (cMax == cMin)
            h = s = 0;
        else {
            let delta = cMax - cMin;
            s = l > 0.5 ? delta / (2 - delta) : delta / (cMax + cMin);
            
            switch(cMax) {
                case this.r:
                    h = (this.g - this.b) / delta + (this.g < this.b ? 6 : 0);
                    break;
                case this.g:
                    h = (this.b - this.r) / delta + 2;
                    break;
                case this.b:
                    h = (this.r - this.g) / delta + 4;
            }
        }

        return {
            h: h / 6,
            s: s,
            v: cMax
        };
    };
    
    const Vector = this.Vector = function(x, y) {
        this.x = x;
        this.y = y;
    };
    
    Vector.prototype.copy = function() {
        return new Vector(this.x, this.y);
    };
    
    Vector.prototype.add = function(vector) {
        this.x += vector.x;
        this.y += vector.y;
        
        return this;
    };

    Vector.prototype.subtract = function(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        
        return this;
    };

    Vector.prototype.negate = function() {
        this.x = -this.x;
        this.y = -this.y;
        
        return this;
    };

    Vector.prototype.dot = function(vector) {
        return this.x * vector.x + this.y * vector.y;
    };

    Vector.prototype.length = function() {
        return Math.sqrt(this.dot(this));
    };

    Vector.prototype.multiply = function(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        
        return this;
    };

    Vector.prototype.divide = function(scalar) {
        if(scalar === 0)
            this.x = this.y = 0;
        else
            return this.multiply(1.0 / scalar);
        
        return this;
    };

    Vector.prototype.normalize = function() {
        return this.divide(this.length());
    };
    
    Vector.prototype.angle = function() {
        return Math.atan2(this.y, this.x);
    };
    
    Vector.prototype.equals = function(vector) {
        return this.x === vector.x && this.y === vector.y;
    };

    const Transform = this.Transform = function(_00, _10, _20, _01, _11, _21) {
        if(_00 == undefined)
            this.identity();
        else {
            this._00 = _00;
            this._10 = _10;
            this._20 = _20;
            this._01 = _01;
            this._11 = _11;
            this._21 = _21;
        }
    };
    
    Transform.prototype.apply = function(vector) {
        const x = vector.x;
        const y = vector.y;
        
        vector.x = this._00 * x + this._10 * y + this._20;
        vector.y = this._01 * x + this._11 * y + this._21;
    };
    
    Transform.prototype.copy = function() {
        return new Transform(this._00, this._10, this._20, this._01, this._11, this._21);
    };
    
    Transform.prototype.identity = function() {
        this._00 = 1;
        this._10 = 0;
        this._20 = 0;
        this._01 = 0;
        this._11 = 1;
        this._21 = 0;
    };
    
    Transform.prototype.set = function(transform) {
        this._00 = transform._00;
        this._10 = transform._10;
        this._20 = transform._20;
        this._01 = transform._01;
        this._11 = transform._11;
        this._21 = transform._21;
    };
    
    Transform.prototype.multiply = function(transform) {
        const _00 = this._00;
        const _10 = this._10;
        const _01 = this._01;
        const _11 = this._11;
        
        this._00 = _00 * transform._00 + _10 * transform._01;
        this._10 = _00 * transform._10 + _10 * transform._11;
        this._20 += _00 * transform._20 + _10 * transform._21;
        this._01 = _01 * transform._00 + _11 * transform._01;
        this._11 = _01 * transform._10 + _11 * transform._11;
        this._21 += _01 * transform._20 + _11 * transform._21;
    };
    
    Transform.prototype.rotate = function(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        const _00 = this._00;
        const _01 = this._01;
        
        this._00 = _00 * cos - this._10 * sin;
        this._10 = _00 * sin + this._10 * cos;
        this._01 = _01 * cos - this._11 * sin;
        this._11 = _01 * sin + this._11 * cos;
    };
    
    Transform.prototype.shear = function(x, y) {
        const _00 = this._00;
        const _01 = this._01;
        
        this._00 += this._10 * y;
        this._10 += _00 * x;
        this._01 += this._11 * y;
        this._11 += _01 * x;
    };
    
    Transform.prototype.translate = function(x, y) {
        this._20 += this._00 * x + this._10 * y;
        this._21 += this._01 * x + this._11 * y;
    };
    
    Transform.prototype.scale = function(x, y) {
        this._00 *= x;
        this._10 *= y;
        this._01 *= x;
        this._11 *= y;
    };
    
    this.Surface = function() {
        this.free = () => {
            gl.deleteTexture(texture);
            gl.deleteFramebuffer(framebuffer);
        };
        
        this.bind = () => {
            bind(this);
            
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.viewport(0, 0, width, height);
        };

        this._prepareDraw = () => {
            bindTextureSurface(texture);
            prepareDraw(RENDER_MODE_SURFACES, 12);

            instanceBuffer[++instanceBufferAt] = 0;
            instanceBuffer[++instanceBufferAt] = 0;
        };
        
        this._addFrame = frame => {
            if(ready) {
                frame[5] /= width;
                frame[6] /= height;
                frame[7] /= width;
                frame[8] /= height;
            }
            else
                frames.push(frame);
        };

        this._getTexture = () => texture;
        this._getUvLeft = () => 0;
        this._getUvTop = () => 0;
        this._getUvWidth = () => 1;
        this._getUvHeight = () => 1;
        this.getShaders = () => shaders;
        this.getWidth = () => width;
        this.getHeight = () => height;
        this.setClearColor = color => clearColor = color;
        this.clear = () => clear(clearColor);
        this.ready = () => ready;
        
        const texture = gl.createTexture();
        const framebuffer = gl.createFramebuffer();
        const frames = [];
        
        let ready = false;
        let width = 0;
        let height = 0;
        let clearColor = new Color(0, 0, 0, 0);
        
        gl.activeTexture(TEXTURE_EDITING);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
        if(arguments.length == 2) {
            width = arguments[0];
            height = arguments[1];
            ready = true;
            
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(width * height * 4));
        }
        else {
            const image = document.createElement("img");
            
            if(arguments[2] != undefined) {
                width = arguments[1];
                height = arguments[2];
            }
            
            image.onload = () => {
                if(width == 0 || height == 0) {
                    width = image.width;
                    height = image.height;
                }
                
                gl.activeTexture(TEXTURE_EDITING);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                for(let frame = frames.pop(); frame != undefined; frame = frames.pop()) {
                    frame[5] /= width;
                    frame[6] /= height;
                    frame[7] /= width;
                    frame[8] /= height;
                }
                
                ready = true;
            };
            
            image.crossOrigin = "Anonymous";
            image.src = arguments[0];
            
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    };
    
    this.Sprite = function(name) {
        this.animate = timeStep => {
            const currentFrame = getFrame();
            
            frameCounter += timeStep;
            
            while(frameCounter > getFrame()[9]) {
                frameCounter -= getFrame()[9];

                if(++frame == frames.length)
                    frame = 0;
            }
        };
        
        this._setMeshBounds = () => {
            meshUvLeft = getFrame()[5];
            meshUvTop = getFrame()[6];
            meshUvWidth = getFrame()[7];
            meshUvHeight = getFrame()[8];
        };

        this._prepareDraw = () => {
            const frame = getFrame();
            
            bindTextureAtlas(frame[0]);
            prepareDraw(RENDER_MODE_SPRITES, 12);

            instanceBuffer[++instanceBufferAt] = frame[3];
            instanceBuffer[++instanceBufferAt] = frame[4];
        };

        this._getTexture = () => getFrame()[0];
        this._getUvLeft = () => getFrame()[5];
        this._getUvTop = () => getFrame()[6];
        this._getUvWidth = () => getFrame()[7];
        this._getUvHeight = () => getFrame()[8];
        this.setFrame = index => frame = index;
        this.getFrame = () => frame;
        this.getWidth = () => getFrame()[1];
        this.getHeight = () => getFrame()[2];
               
        const getFrame = () => frames[frame];
        
        const frames = sprites[name];
        let frameCounter = 0;
        let frame = 0;
    };

    const setAttributesUv = (uvLeft, uvTop, uvWidth, uvHeight) => {
        instanceBuffer[++instanceBufferAt] = uvLeft;
        instanceBuffer[++instanceBufferAt] = uvTop;
        instanceBuffer[++instanceBufferAt] = uvWidth;
        instanceBuffer[++instanceBufferAt] = uvHeight;
    };
    
    const setAttributesUvPart = (uvLeft, uvTop, uvWidth, uvHeight, left, top, width, height) => {
        instanceBuffer[++instanceBufferAt] = uvLeft + uvWidth * left;
        instanceBuffer[++instanceBufferAt] = uvTop + uvHeight * top;
        instanceBuffer[++instanceBufferAt] = uvWidth * width;
        instanceBuffer[++instanceBufferAt] = uvHeight * height;
    };
    
    const setAttributesDraw = (x, y, width, height) => {
        instanceBuffer[++instanceBufferAt] = width;
        instanceBuffer[++instanceBufferAt] = instanceBuffer[++instanceBufferAt] = 0;
        instanceBuffer[++instanceBufferAt] = height;
        instanceBuffer[++instanceBufferAt] = x;
        instanceBuffer[++instanceBufferAt] = y;
    };
    
    const setAttributesDrawSheared = (x, y, width, height, xShear, yShear) => {
        instanceBuffer[++instanceBufferAt] = width;
        instanceBuffer[++instanceBufferAt] = width * xShear;
        instanceBuffer[++instanceBufferAt] = height * yShear;
        instanceBuffer[++instanceBufferAt] = height;
        instanceBuffer[++instanceBufferAt] = x;
        instanceBuffer[++instanceBufferAt] = y;
    };
    
    const setAttributesDrawRotated = (x, y, width, height, angle) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        instanceBuffer[++instanceBufferAt] = cos * width;
        instanceBuffer[++instanceBufferAt] = sin * height;
        instanceBuffer[++instanceBufferAt] = -sin * width;
        instanceBuffer[++instanceBufferAt] = cos * height;
        instanceBuffer[++instanceBufferAt] = x;
        instanceBuffer[++instanceBufferAt] = y;
    };
    
    const setAttributesDrawTransform = (transform, width, height) => {
        instanceBuffer[++instanceBufferAt] = transform._00 * width;
        instanceBuffer[++instanceBufferAt] = transform._10 * height;
        instanceBuffer[++instanceBufferAt] = transform._01 * width;
        instanceBuffer[++instanceBufferAt] = transform._11 * height;
        instanceBuffer[++instanceBufferAt] = transform._20;
        instanceBuffer[++instanceBufferAt] = transform._21;
    };

    const setAttributesDrawTransformAt = (x, y, transform, width, height) => {
        instanceBuffer[++instanceBufferAt] = transform._00 * width;
        instanceBuffer[++instanceBufferAt] = transform._10 * height;
        instanceBuffer[++instanceBufferAt] = transform._01 * width;
        instanceBuffer[++instanceBufferAt] = transform._11 * height;
        instanceBuffer[++instanceBufferAt] = transform._20 + x;
        instanceBuffer[++instanceBufferAt] = transform._21 + y;
    };

    const Renderable = new Object();

    Renderable.prototype = {
        draw: function(x, y) {
            this._prepareDraw();

            setAttributesUv(this._getUvLeft(), this._getUvTop(), this._getUvWidth(), this._getUvHeight());
            setAttributesDraw(x, y, this.getWidth(), this.getHeight());
        },

        drawScaled: function(x, y, xScale, yScale) {
            this._prepareDraw();
            
            setAttributesUv(this._getUvLeft(), this._getUvTop(), this._getUvWidth(), this._getUvHeight());
            setAttributesDraw(x, y, this.getWidth() * xScale, this.getHeight() * yScale);
        },

        drawSheared: function(x, y, xShear, yShear) {
            this._prepareDraw();
            
            setAttributesUv(this._getUvLeft(), this._getUvTop(), this._getUvWidth(), this._getUvHeight());
            setAttributesDrawSheared(x, y, this.getWidth(), this.getHeight(), xShear, yShear);
        },

        drawRotated: function(x, y, angle) {
            this._prepareDraw();
            
            setAttributesUv(this._getUvLeft(), this._getUvTop(), this._getUvWidth(), this._getUvHeight());
            setAttributesDrawRotated(x, y, this.getWidth(), this.getHeight(), angle);
        },

        drawScaledRotated: function(x, y, xScale, yScale, angle) {
            this._prepareDraw();
            
            setAttributesUv(this._getUvLeft(), this._getUvTop(), this._getUvWidth(), this._getUvHeight());
            setAttributesDrawRotated(x, y, this.getWidth() * xScale, this.getHeight() * yScale, angle);
        },

        drawTransformed: function(transform) {
            this._prepareDraw();
            
            setAttributesUv(this._getUvLeft(), this._getUvTop(), this._getUvWidth(), this._getUvHeight());
            setAttributesDrawTransform(transform, this.getWidth());
        },

        drawTransformedAt: function(x, y, transform) {
            this._prepareDraw();
            
            setAttributesUv(this._getUvLeft(), this._getUvTop(), this._getUvWidth(), this._getUvHeight());
            setAttributesDrawTransformAt(x, y, transform, this.getWidth(), this.getHeight());
        },

        drawPart: function(x, y, left, top, w, h) {
            this._prepareDraw();

            const wf = 1 / this.getWidth();
            const hf = 1 / this.getHeight();
            
            setAttributesUvPart(this._getUvLeft(), this._getUvTop(), this._getUvWidth(), this._getUvHeight(), left * wf, top * hf, w * wf, h * hf);
            setAttributesDraw(x, y, w, h);
        },

        drawPartTransformed: function(transform, left, top, w, h) {
            this._prepareDraw();

            const wf = 1 / this.getWidth();
            const hf = 1 / this.getHeight();
            
            setAttributesUvPart(this._getUvLeft(), this._getUvTop(), this._getUvWidth(), this._getUvHeight(), left * wf, top * hf, w * wf, h * hf);
            setAttributesDrawTransform(transform, w, h);
        }
    };

    this.Surface.prototype = Object.create(Renderable.prototype);
    this.Sprite.prototype = Object.create(Renderable.prototype);
    
    const pushVertexColor = (mode, color, x, y) => {
        prepareDraw(mode, 6);
        
        instanceBuffer[++instanceBufferAt] = color.r;
        instanceBuffer[++instanceBufferAt] = color.g;
        instanceBuffer[++instanceBufferAt] = color.b;
        instanceBuffer[++instanceBufferAt] = color.a;
        instanceBuffer[++instanceBufferAt] = x;
        instanceBuffer[++instanceBufferAt] = y;
    };
    
    const primitivesCirclePoints = new Array(1024);
    const primitivesGetCircleStep = radius => Math.max(2, 32 >> Math.floor(radius / 128));
    
    for(let i = 0; i < 1024; i += 2) {
        const radians = i * Math.PI * 2 / 1024;
        
        primitivesCirclePoints[i] = Math.cos(radians);
        primitivesCirclePoints[i + 1] = Math.sin(radians);
    }
    
    this.primitives = {};
    
    this.primitives.drawPoint = (color, x, y) => {
        pushVertexColor(RENDER_MODE_POINTS, color, x, y);
    };
    
    this.primitives.drawLine = (color, x1, y1, x2, y2) => {
        pushVertexColor(RENDER_MODE_LINES, color, x1, y1);
        pushVertexColor(RENDER_MODE_LINES, color, x2, y2);
    };
    
    this.primitives.drawLineGradient = (color1, x1, y1, color2, x2, y2) => {
        pushVertexColor(RENDER_MODE_LINES, color1, x1, y1);
        pushVertexColor(RENDER_MODE_LINES, color2, x2, y2);
    };
    
    this.primitives.drawRectangle = (color, x, y, width, height) => {
        this.primitives.drawLine(color, x, y, x + width, y);
        this.primitives.drawLine(color, x + width, y, x + width, y + height);
        this.primitives.drawLine(color, x + width, y + height, x, y + height);
        this.primitives.drawLine(color, x, y + height, x, y);
    };
    
    this.primitives.drawCircle = (color, x, y, radius) => {
        const step = primitivesGetCircleStep(radius);
        let i;
        
        for(i = 0; i < 1024 - step; i += step)
            this.primitives.drawLine(
                color,
                x + primitivesCirclePoints[i] * radius,
                y + primitivesCirclePoints[i + 1] * radius,
                x + primitivesCirclePoints[i + step] * radius,
                y + primitivesCirclePoints[i + 1 + step] * radius);
        
        this.primitives.drawLine(
            color,
            x + primitivesCirclePoints[i] * radius,
            y + primitivesCirclePoints[i + 1] * radius,
            x + primitivesCirclePoints[0] * radius,
            y + primitivesCirclePoints[1] * radius);
    };
    
    this.primitives.drawTriangle = (color, x1, y1, x2, y2, x3, y3) => {
        pushVertexColor(RENDER_MODE_TRIANGLES, color, x1, y1);
        pushVertexColor(RENDER_MODE_TRIANGLES, color, x2, y2);
        pushVertexColor(RENDER_MODE_TRIANGLES, color, x3, y3);
    };
    
    this.primitives.drawTriangleGradient = (color1, x1, y1, color2, x2, y2, color3, x3, y3) => {
        pushVertexColor(RENDER_MODE_TRIANGLES, color1, x1, y1);
        pushVertexColor(RENDER_MODE_TRIANGLES, color2, x2, y2);
        pushVertexColor(RENDER_MODE_TRIANGLES, color3, x3, y3);
    };
    
    this.primitives.fillRectangle = (color, x, y, width, height) => {
        this.primitives.drawTriangle(color, x, y, x, y + height, x + width, y + height);
        this.primitives.drawTriangle(color, x + width, y + height, x + width, y, x, y);
    };
    
    this.primitives.fillRectangleGradient = (color1, color2, color3, color4, x, y, width, height) => {
        this.primitives.drawTriangleGradient(color1, x, y, color3, x, y + height, color4, x + width, y + height);
        this.primitives.drawTriangleGradient(color4, x + width, y + height, color2, x + width, y, color1, x, y);
    };
    
    this.primitives.fillCircle = (color, x, y, radius) => {
        const step = primitivesGetCircleStep(radius);
        let i = 0;
        
        for(; i < 1024 - step; i+= step)
            this.primitives.drawTriangle(
                color,
                x, y,
                x + primitivesCirclePoints[i] * radius,
                y + primitivesCirclePoints[i + 1] * radius,
                x + primitivesCirclePoints[i + step] * radius,
                y + primitivesCirclePoints[i + 1 + step] * radius);
        
        this.primitives.drawTriangle(
            color,
            x, y,
            x + primitivesCirclePoints[i] * radius,
            y + primitivesCirclePoints[i + 1] * radius,
            x + primitivesCirclePoints[0] * radius,
            y + primitivesCirclePoints[1] * radius);
    };
    
    this.primitives.fillCircleGradient = (colorStart, colorEnd, x, y, radius) => {
        const step = primitivesGetCircleStep(radius);
        let i;
        
        for(i = 0; i < 1024 - step; i+= step)
            this.primitives.drawTriangleGradient(
                colorStart,
                x, y,
                colorEnd,
                x + primitivesCirclePoints[i] * radius,
                y + primitivesCirclePoints[i + 1] * radius,
                colorEnd,
                x + primitivesCirclePoints[i + step] * radius,
                y + primitivesCirclePoints[i + 1 + step] * radius);
        
        this.primitives.drawTriangleGradient(
            colorStart,
            x, y,
            colorEnd,
            x + primitivesCirclePoints[i] * radius,
            y + primitivesCirclePoints[i + 1] * radius,
            colorEnd,
            x + primitivesCirclePoints[0] * radius,
            y + primitivesCirclePoints[1] * radius);
    };
    
    const meshBindSource = source => {
        if(source instanceof this.Surface) {
            meshUvLeft = meshUvTop = 0;
            meshUvWidth = meshUvHeight = 1;
        }
        else
            source._setMeshBounds();
        
        if(currentTextureMesh == source._getTexture())
            return;
        
        flush();
        
        gl.activeTexture(TEXTURE_MESH);
        gl.bindTexture(gl.TEXTURE_2D, source._getTexture());
        
        currentTextureMesh = source._getTexture();
    };
    
    const pushVertexMesh = (mode, x, y, u, v) => {
        prepareDraw(mode, 4);
        
        instanceBuffer[++instanceBufferAt] = x;
        instanceBuffer[++instanceBufferAt] = y;
        instanceBuffer[++instanceBufferAt] = u * meshUvWidth + meshUvLeft;
        instanceBuffer[++instanceBufferAt] = v * meshUvHeight + meshUvTop;
    };
    
    this.mesh = {};
    
    this.mesh.drawTriangle = (source, x1, y1, u1, v1, x2, y2, u2, v2, x3, y3, u3, v3) => {
        meshBindSource(source);
        
        pushVertexMesh(RENDER_MODE_MESH, x1, y1, u1, v1);
        pushVertexMesh(RENDER_MODE_MESH, x2, y2, u2, v2);
        pushVertexMesh(RENDER_MODE_MESH, x3, y3, u3, v3);
    };
    
    this.utils = {};
    
    this.utils.loop = update => {
        let lastDate = new Date();
        let loopFunction = function(step) {
            const date = new Date();
            
            if(update((date - lastDate) / 1000))
                requestAnimationFrame(loopFunction);
            
            lastDate = date;
        };
        
        requestAnimationFrame(loopFunction);
    };
    
    const ShaderCore = function(vertex, fragment) {
        const createShader = (type, source) => {
            const shader = gl.createShader(type);
            
            gl.shaderSource(shader, "#version 300 es\n" + source);
            gl.compileShader(shader);
            
            if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
                console.log(gl.getShaderInfoLog(shader));
            
            return shader;
        };
        
        this.bind = () => {
            if(currentShaderCore == this)
                return;
            
            currentShaderCore = this;
            
            gl.useProgram(program);
        };
        
        this.getProgram = () => program;
        
        this.free = () => {
            gl.detachShader(program, shaderVertex);
            gl.detachShader(program, shaderFragment);
            gl.deleteShader(shaderVertex);
            gl.deleteShader(shaderFragment);
            gl.deleteProgram(program);
        };
        
        const program = gl.createProgram();
        const shaderVertex = createShader(gl.VERTEX_SHADER, vertex);
        const shaderFragment = createShader(gl.FRAGMENT_SHADER, fragment);
        
        gl.attachShader(program, shaderVertex);
        gl.attachShader(program, shaderFragment);
        gl.linkProgram(program);
    };
    
    const Shader = function(core, samplers) {
        this.bind = () => {
            if(currentShader == this)
                return;
            
            currentShader = this;
            
            core.bind();
            
            for(let i = 0; i < samplerCalls.length; ++i)
                samplerCalls[i][0](samplerCalls[i][1], samplerCalls[i][2].value);
        };
        
        this.setUniform = (name, value) => samplers[name].value = value;
        this.free = () => core.free();
        
        const samplerCalls = [];
        const samplerNames = Object.keys(samplers);
        
        for(let i = 0; i < samplerNames.length; ++i)
            samplerCalls.push([
                gl["uniform" + samplers[samplerNames[i]].type].bind(gl),
                gl.getUniformLocation(core.getProgram(), samplerNames[i]),
                samplers[samplerNames[i]]
            ]);
    };
    
    const bind = target => {
        if(surface == target)
            return;
        
        flush();
        
        if(surface != null)
            this.pop();
        
        if(target != null)
            pushIdentity();
        
        surface = target;
    };
    
    const bindTextureSurface = texture => {
        if(currentTextureSurface == texture)
            return;
        
        flush();
        
        gl.activeTexture(TEXTURE_SURFACE);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        currentTextureSurface = texture;
    };
    
    const bindTextureAtlas = texture => {
        if(currentTextureAtlas == texture)
            return;
        
        flush();

        gl.activeTexture(TEXTURE_ATLAS);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        currentTextureAtlas = texture;
    };
    
    const clear = color => {
        flush();
        
        gl.clearColor(color.r * uboContents[8], color.g * uboContents[9], color.b * uboContents[10], color.a * uboContents[11]);
        gl.clear(gl.COLOR_BUFFER_BIT);
    };
    
    const flush = this.flush = () => {
        if(instanceCount == 0)
            return;
        
        gl.bindBuffer(gl.ARRAY_BUFFER, instances);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceBuffer, 0, instanceBufferAt + 1);
        
        switch(renderMode) {
            case RENDER_MODE_SURFACES:
            case RENDER_MODE_SPRITES:
                gl.bindVertexArray(vaoSprites);
                gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, instanceCount);
                break;
            case RENDER_MODE_LINES:
                gl.bindVertexArray(vaoLines);
                gl.drawArrays(gl.LINES, 0, instanceCount);
                break;
            case RENDER_MODE_POINTS:
                gl.bindVertexArray(vaoLines);
                gl.drawArrays(gl.POINTS, 0, instanceCount);
                break;
            case RENDER_MODE_TRIANGLES:
                gl.bindVertexArray(vaoLines);
                gl.drawArrays(gl.TRIANGLES, 0, instanceCount);
                break;
            case RENDER_MODE_MESH:
                gl.bindVertexArray(vaoMesh);
                gl.drawArrays(gl.TRIANGLES, 0, instanceCount);
                break;
        }
        
        instanceBufferAt = -1;
        instanceCount = 0;
    };
    
    const sendUniformBuffer = () => {
        if(surface == null) {
            uboContents[3] = width;
            uboContents[7] = height;
        }
        else {
            uboContents[3] = surface.getWidth();
            uboContents[7] = surface.getHeight();
        }
        
        uboContents[0] = transformStack[transformAt]._00;
        uboContents[1] = transformStack[transformAt]._10;
        uboContents[2] = transformStack[transformAt]._20;
        uboContents[4] = transformStack[transformAt]._01;
        uboContents[5] = transformStack[transformAt]._11;
        uboContents[6] = transformStack[transformAt]._21;
        
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, uboContents);
        
        transformDirty = false;
    };
    
    const prepareDraw = (mode, size) => {
        if(transformDirty) {
            flush();
            
            sendUniformBuffer();
        }
        
        if(renderMode != mode) {
            flush();
            
            renderMode = mode;
        
            (shader = shaders[mode]).bind();
        }
        
        if(instanceBufferAt + size >= instanceBufferCapacity) {
            const oldBuffer = instanceBuffer;
            
            instanceBuffer = new Float32Array(instanceBufferCapacity *= 2);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, instances);
            gl.bufferData(gl.ARRAY_BUFFER, instanceBufferCapacity * 4, gl.DYNAMIC_DRAW);
            
            for(let i = 0; i < oldBuffer.byteLength; ++i)
                instanceBuffer[i] = oldBuffer[i];
        }
        
        ++instanceCount;
    };
    
    const pushIdentity = () => {
        if(++transformAt == transformStack.length)
            transformStack.push(new Transform());
        else
            transformStack[transformAt].identity();
        
        transformDirty = true;
    };
    
    this.push = () => {
        if(++transformAt == transformStack.length)
            transformStack.push(transformStack[transformAt - 1].copy());
        else
            transformStack[transformAt].set(transformStack[transformAt - 1]);
    };
    
    this.pop = () => {
        --transformAt;
        
        transformDirty = true;
    };
    
    this.bind = () => {
        bind(null);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, width, height);
    };
    
    this.register = function() {
        const frames = [];
        
        for(let i = 1; i < arguments.length; ++i)
            frames.push(arguments[i]);
        
        sprites[arguments[0]] = frames;
    };
        
    this.makeSpriteFrame = (sheet, x, y, width, height, xOrigin, yOrigin, time) => {
        const frame = [
            sheet._getTexture(),
            width,
            height,
            xOrigin / width,
            yOrigin / height,
            x,
            y,
            width,
            height,
            time
        ];

        sheet._addFrame(frame);

        return frame;
    };
    
    this.free = () => {
        for(let i = 0; i < shaders.length; ++i)
            shaders[i].free();
        
        gl.deleteVertexArray(vaoSprites);
        gl.deleteVertexArray(vaoLines);
        gl.deleteVertexArray(vaoMesh);
        gl.deleteBuffer(quad);
        gl.deleteBuffer(instances);
        gl.deleteBuffer(ubo);
    };
    
    this.setColor = color => {
        if(
            uboContents[8] == color.r &&
            uboContents[9] == color.g &&
            uboContents[10] == color.b &&
            uboContents[11] == color.a)
            return;
        
        flush();
        
        uboContents[8] = color.r;
        uboContents[9] = color.g;
        uboContents[10] = color.b;
        uboContents[11] = color.a;
        
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, uboContents);
    };
    
    this.setAlpha = alpha => {
        if(uboContents[11] == alpha)
            return;
        
        flush();
        
        uboContents[11] = alpha;
        
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, uboContents);
    };
    
    const touchTransform = () => {
        transformDirty = true;
        
        return transformStack[transformAt];
    };
    
    this.getTransform = () => transformStack[transformAt];
    this.transform = transform => touchTransform().multiply(transform);
    this.translate = (x, y) => touchTransform().translate(x, y);
    this.rotate = angle => touchTransform().rotate(angle);
    this.shear = (x, y) => touchTransform().shear(x, y);
    this.scale = (x, y) => touchTransform().scale(x, y);
    this.setClearColor = color => clearColor = color;
    this.clear = () => clear(clearColor);
    this.getWidth = () => width;
    this.getHeight = () => height;
    this.unregister = name => delete sprites[name];
    
    const RENDER_MODE_NONE = -1;
    const RENDER_MODE_SURFACES = 0;
    const RENDER_MODE_SPRITES = 1;
    const RENDER_MODE_LINES = 2;
    const RENDER_MODE_POINTS = 3;
    const RENDER_MODE_TRIANGLES = 4;
    const RENDER_MODE_MESH = 5;
    const TEXTURE_ATLAS = gl.TEXTURE0;
    const TEXTURE_SURFACE = gl.TEXTURE1;
    const TEXTURE_MESH = gl.TEXTURE2;
    const TEXTURE_EDITING = gl.TEXTURE3;
    
    const quad = gl.createBuffer();
    const instances = gl.createBuffer();
    const vaoSprites = gl.createVertexArray();
    const vaoLines = gl.createVertexArray();
    const vaoMesh = gl.createVertexArray();
    const ubo = gl.createBuffer();
    const uboContents = new Float32Array(12);
    const sprites = [];
    const transformStack = [new Transform(1, 0, 0, 0, -1, canvasElement.height)];
    const uniformBlock = "layout(std140) uniform transform {mediump vec4 tw;mediump vec4 th;lowp vec4 c;};";
    const shaderCoreSprites = new ShaderCore(
        "layout(location=0) in mediump vec2 vertex;" +
        "layout(location=1) in mediump vec4 a1;" +
        "layout(location=2) in mediump vec4 a2;" +
        "layout(location=3) in mediump vec4 a3;" +
        uniformBlock +
        "out mediump vec2 uv;" +
        "void main() {" +
            "uv=a1.zw+vertex*a2.xy;" +
            "mediump vec2 transformed=(((vertex-a1.xy)*" + 
                "mat2(a2.zw,a3.xy)+a3.zw)*" + 
                "mat2(tw.xy,th.xy)+vec2(tw.z,th.z))/" +
                "vec2(tw.w,th.w)*2.0;" +
            "gl_Position=vec4(transformed-vec2(1),0,1);" +
        "}",
        "uniform sampler2D source;" +
        uniformBlock +
        "in mediump vec2 uv;" +
        "layout(location=0) out lowp vec4 color;" +
        "void main() {" +
            "color=texture(source,uv)*c;" +
        "}"
    );
    const shaderCoreLines = new ShaderCore(
        "layout(location=0) in mediump vec4 color;" +
        "layout(location=1) in mediump vec2 vertex;" +
        uniformBlock +
        "out lowp vec4 colori;" +
        "void main() {" +
            "mediump vec2 transformed=(vertex*" +
                "mat2(tw.xy,th.xy)+vec2(tw.z,th.z))/" +
                "vec2(tw.w,th.w)*2.0;" +
            "gl_Position=vec4(transformed-vec2(1),0,1);" +
            "colori = color*c;" +
        "}",
        "in lowp vec4 colori;" +
        "layout(location=0) out lowp vec4 color;" +
        "void main() {" +
            "color=colori;" +
        "}"
    );
    const shaderCorePoints = new ShaderCore(
        "layout(location=0) in mediump vec4 color;" +
        "layout(location=1) in mediump vec2 vertex;" +
        uniformBlock +
        "flat out lowp vec4 colorf;" +
        "void main() {" +
            "mediump vec2 transformed=(vertex*" +
                "mat2(tw.xy,th.xy)+vec2(tw.z,th.z))/" +
                "vec2(tw.w,th.w)*2.0;" +
            "gl_Position=vec4(transformed-vec2(1),0,1);" +
            "gl_PointSize=1.0;" +
            "colorf = color*c;" +
        "}",
        "flat in lowp vec4 colorf;" +
        "layout(location=0) out lowp vec4 color;" +
        "void main() {" +
            "color=colorf;" +
        "}"
    );
    const shaderCoreMesh = new ShaderCore(
        "layout(location=0) in mediump vec4 vertex;" +
        uniformBlock +
        "out mediump vec2 uv;" +
        "void main() {" +
            "mediump vec2 transformed=(vertex.xy*" +
                "mat2(tw.xy,th.xy)+vec2(tw.z,th.z))/" +
                "vec2(tw.w,th.w)*2.0;" +
            "gl_Position=vec4(transformed-vec2(1),0,1);" +
            "uv = vertex.zw;" +
        "}",
        "uniform sampler2D source;" +
        uniformBlock +
        "in mediump vec2 uv;" +
        "layout(location=0) out lowp vec4 color;" +
        "void main() {" +
            "color=texture(source,uv)*c;" +
        "}"
    );
    const shaders = [
        new Shader(
            shaderCoreSprites,
            {
                source: {
                    type: "1i",
                    value: 1
                }
            }),
        new Shader(
            shaderCoreSprites,
            {
                source: {
                    type: "1i",
                    value: 0
                }
            }),
        new Shader(
            shaderCoreLines,
            {}),
        new Shader(
            shaderCorePoints,
            {}),
        new Shader(
            shaderCoreLines,
            {}),
        new Shader(
            shaderCoreMesh,
            {
                source: {
                    type: "1i",
                    value: 2
                }
            })
    ];
    
    let currentShader, currentShaderCore, surface, currentTextureSurface, currentTextureAtlas, currentTextureMesh;
    let meshUvLeft,  meshUvTop, meshUvWidth, meshUvHeight;
    let transformAt = 0;
    let transformDirty = true;
    let renderMode = RENDER_MODE_NONE;
    let instanceBufferCapacity = 1024;
    let instanceBufferAt = -1;
    let instanceBuffer = new Float32Array(instanceBufferCapacity);
    let instanceCount = 0;
    let clearColor = new Color(0, 0, 0);
    let width = canvasElement.width;
    let height = canvasElement.height;
    
    uboContents[8] = uboContents[9] = uboContents[10] = uboContents[11] = 1;
    
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);
    gl.bufferData(gl.ARRAY_BUFFER, instanceBufferCapacity * 4, gl.DYNAMIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, 48, gl.DYNAMIC_DRAW);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, ubo);
    
    gl.bindVertexArray(vaoSprites);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribDivisor(1, 1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 48, 0);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribDivisor(2, 1);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 48, 16);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribDivisor(3, 1);
    gl.vertexAttribPointer(3, 4, gl.FLOAT, false, 48, 32);
    
    gl.bindVertexArray(vaoLines);
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 24, 16);
    
    gl.bindVertexArray(vaoMesh);
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
    
    gl.bindVertexArray(null);
};