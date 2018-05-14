const Snake = function(myr) {
    const COLOR_CLEAR = new myr.Color(0.3, 0.9, 0.5);
    const SEGMENT_LENGTH = 64;
    const SEGMENTS = 18;
    const SEGMENT_DIVISIONS = 8;
    const LAG_MAX = 512;
    const LAG_APPROACH = 14;
    const ANCHOR_SPACING = 16;
    const ANCHOR_COUNT = (SEGMENT_LENGTH * SEGMENTS + LAG_MAX) / ANCHOR_SPACING + 4 + 2;
          
    const sheet = new myr.Surface("img/snake.png");
    const anchors = [];
    const mesh = [];
    let anchorDistance = 0;
    let lag = 0;
    
    myr.register("body", myr.makeSpriteFrame(sheet, 0, 0, 64, 64, 0, 0, 0));
    myr.register("tail", myr.makeSpriteFrame(sheet, 0, 64, 64, 64, 64, 32, 0));
    myr.register(
        "head",
        myr.makeSpriteFrame(sheet, 64, 0, 64, 64, 0, 32, 3),
        myr.makeSpriteFrame(sheet, 64, 64, 64, 64, 0, 32, 0.2));
    
    const body = new myr.Sprite("body");
    const head = new myr.Sprite("head");
    const tail = new myr.Sprite("tail");
    
    for(let i = 0; i < ANCHOR_COUNT; ++i)
        anchors.push(new myr.Vector(myr.getWidth() / 2, -SEGMENT_LENGTH));
    
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
            angle: delta * (0.5 - lerp) - angle
        }
    };
    
    const update = timeStep => {
        lag = Math.max(0, lag - lag * LAG_APPROACH * timeStep);
        
        head.animate(timeStep);
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
    };
    
    const getSides = (sample, radius) => {
        const x = -Math.sin(-sample.angle) * body.getHeight() * 0.5;
        const y = Math.cos(-sample.angle) * body.getHeight() * 0.5;
        
        return {
            sample: sample,
            leftX: sample.position.x - x,
            leftY: sample.position.y - y,
            rightX: sample.position.x + x,
            rightY: sample.position.y + y,
        }
    };
    
    const drawSnake = () => {
        const radius = SEGMENT_LENGTH * 0.5;
        let distance = ANCHOR_SPACING * 2 + SEGMENTS * SEGMENT_LENGTH - anchorDistance + lag;
        let sides = getSides(sample(distance), radius);
        
        tail.drawRotated(sides.sample.position.x, sides.sample.position.y, sides.sample.angle);
        
        for(let i = 0; i < SEGMENTS; ++i) {
            for(let j = 0; j < SEGMENT_DIVISIONS; ++j) {
                distance -= SEGMENT_LENGTH / SEGMENT_DIVISIONS;
                
                const previousSides = sides;
                sides = getSides(sample(distance), radius);
                
                myr.mesh.drawTriangle(
                    body,
                    previousSides.leftX, previousSides.leftY, j / SEGMENT_DIVISIONS, 0,
                    previousSides.rightX, previousSides.rightY, j / SEGMENT_DIVISIONS, 1,
                    sides.rightX, sides.rightY, (j + 1) / SEGMENT_DIVISIONS, 1);
                
                myr.mesh.drawTriangle(
                    body,
                    sides.rightX, sides.rightY, (j + 1) / SEGMENT_DIVISIONS, 1,
                    sides.leftX, sides.leftY, (j + 1) / SEGMENT_DIVISIONS, 0,
                    previousSides.leftX, previousSides.leftY, j / SEGMENT_DIVISIONS, 0);
            }
        }
        
        head.drawRotated(sides.sample.position.x, sides.sample.position.y, sides.sample.angle);
    };
    
    this.move = (x, y) => {
        const delta = new myr.Vector(x, y).subtract(anchors[anchors.length - 1]);
        
        anchorDistance = delta.length();
        delta.normalize();
        
        while(anchorDistance > ANCHOR_SPACING) {
            addAnchor(anchors[anchors.length - 1].copy().add(delta.copy().multiply(ANCHOR_SPACING)));
            
            anchorDistance -= ANCHOR_SPACING;
            
            if(anchorDistance > ANCHOR_SPACING)
                lag = Math.min(LAG_MAX, lag + ANCHOR_SPACING);
        }
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