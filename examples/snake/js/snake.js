const Snake = function(myr) {
    const COLOR_CLEAR = new myr.Color(0.3, 0.9, 0.5);
    const SEGMENT_LENGTH = 64;
    const SEGMENTS = 16;
    const SEGMENT_DIVISIONS = 4;
    const ANCHOR_SPACING = 16;
    const ANCHOR_COUNT = (SEGMENT_LENGTH * SEGMENTS) / ANCHOR_SPACING + 4 + 2;
          
    const sheet = new myr.Surface("img/snake.png", 128, 128);
    const anchors = [];
    const mesh = [];
    let anchorDistance = 0;
    
    myr.register("body", myr.makeSpriteFrame(sheet, 0, 0, 64, 64, 0, 0, 0));
    myr.register("head", myr.makeSpriteFrame(sheet, 64, 0, 64, 64, 0, 32, 0));
    myr.register("tail", myr.makeSpriteFrame(sheet, 0, 64, 64, 64, 64, 32, 0));
    
    const body = new myr.Sprite("body");
    const head = new myr.Sprite("head");
    const tail = new myr.Sprite("tail");
    
    for(let i = 0; i < ANCHOR_COUNT; ++i)
        anchors.push(new myr.Vector(myr.getWidth() / 2, myr.getHeight() / 2));
    
    myr.setClearColor(COLOR_CLEAR);
    
    const sample = distance => {
        const anchorsDistance = Math.floor(distance / ANCHOR_SPACING);
        const i0 = anchors.length - 1 - anchorsDistance;
        
        const leftoverDistance = distance - ANCHOR_SPACING * anchorsDistance;
        const lerp = leftoverDistance / ANCHOR_SPACING;
        const position = anchors[i0].copy().add(anchors[i0 - 1].copy().subtract(anchors[i0]).multiply(lerp));
        let angle = anchors[i0].copy().subtract(anchors[i0 - 1]).angle();
        let delta = 0;
        
        if(lerp > 0.5)
            delta = anchors[i0 - 1].copy().subtract(anchors[i0 - 2]).angle() - angle;
        else
            delta = angle - anchors[i0 + 1].copy().subtract(anchors[i0]).angle();
        
        if(delta > Math.PI)
            delta -= Math.PI * 2;
        else if(delta < -Math.PI)
            delta += Math.PI * 2;
        
        return {
            position: position,
            angle: -(angle + delta * (lerp - 0.5))
        }
    };
    
    const update = timeStep => {
        
    };
    
    const render = () => {
        myr.bind();
        myr.clear();
        
        drawSnake();
        
        myr.flush();
    };
    
    const addAnchor = vector => {
        anchors.push(vector);
        anchors.shift();
        
        anchorDistance = 0;
    };
    
    const moveSnake = () => {
        
    };
    
    const drawSnake = () => {
        const radius = SEGMENT_LENGTH * 0.5;
        let distance = ANCHOR_SPACING * 2 - anchorDistance;
        let sampleCurrent = sample(distance);
        
        head.drawRotated(sampleCurrent.position.x, sampleCurrent.position.y, sampleCurrent.angle);
        
        for(let i = 0; i < SEGMENTS; ++i) {
            for(let j = 0; j < SEGMENT_DIVISIONS; ++j) {
                distance += SEGMENT_LENGTH / SEGMENT_DIVISIONS;
                
                const sampleNew = sample(distance);
                
                myr.mesh.drawTriangle(
                    body,
                    sampleCurrent.position.x + Math.cos(-sampleCurrent.angle - Math.PI * 0.5) * radius,
                    sampleCurrent.position.y + Math.sin(-sampleCurrent.angle - Math.PI * 0.5) * radius,
                    j / SEGMENT_DIVISIONS, 0,
                    sampleCurrent.position.x + Math.cos(-sampleCurrent.angle + Math.PI * 0.5) * radius,
                    sampleCurrent.position.y + Math.sin(-sampleCurrent.angle + Math.PI * 0.5) * radius,
                    j / SEGMENT_DIVISIONS, 1,
                    sampleNew.position.x + Math.cos(-sampleNew.angle + Math.PI * 0.5) * radius,
                    sampleNew.position.y + Math.sin(-sampleNew.angle + Math.PI * 0.5) * radius,
                    (j + 1) / SEGMENT_DIVISIONS, 1);
                
                myr.mesh.drawTriangle(
                    body,
                    sampleNew.position.x + Math.cos(-sampleNew.angle + Math.PI * 0.5) * radius,
                    sampleNew.position.y + Math.sin(-sampleNew.angle + Math.PI * 0.5) * radius,
                    (j + 1) / SEGMENT_DIVISIONS, 1,
                    sampleNew.position.x + Math.cos(-sampleNew.angle - Math.PI * 0.5) * radius,
                    sampleNew.position.y + Math.sin(-sampleNew.angle - Math.PI * 0.5) * radius,
                    (j + 1) / SEGMENT_DIVISIONS, 0,
                    sampleCurrent.position.x + Math.cos(-sampleCurrent.angle - Math.PI * 0.5) * radius,
                    sampleCurrent.position.y + Math.sin(-sampleCurrent.angle - Math.PI * 0.5) * radius,
                    j / SEGMENT_DIVISIONS, 0);
                    
                sampleCurrent = sampleNew;
            }
        }
        
        tail.drawRotated(sampleCurrent.position.x, sampleCurrent.position.y, sampleCurrent.angle);
    };
    
    this.move = (x, y) => {
        const mouse = new myr.Vector(x, y);
        const delta = mouse.copy().subtract(anchors[anchors.length - 1]);
        
        anchorDistance = delta.length();
        
        if(anchorDistance > ANCHOR_SPACING)
            addAnchor(mouse);
        
        moveSnake();
    };
    
    this.start = () => {
        myr.utils.loop(function(timeStep) {
            update(timeStep);
            render();
            
            return true;
        });
    };
}

const renderer = document.getElementById("renderer");
const snake = new Snake(new Myr(renderer));

renderer.addEventListener("mousemove", function(event) {
    const rect = renderer.getBoundingClientRect();
    
    snake.move(event.clientX - rect.left, event.clientY - rect.top);
});

snake.start();