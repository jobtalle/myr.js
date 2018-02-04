var myr = {
    initialize(canvasElement) {
        this.gl = canvasElement.getContext("webgl");
    },
    
    clearColor(color) {
        this.gl.clearColor(color.r, color.g, color.b, color.a);
    },
    
    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    },
    
    Color: function(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        
        if(a == undefined)
            this.a = 1;
        else
            this.a = a;
    }
}