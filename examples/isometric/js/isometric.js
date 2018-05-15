const Isometric = function(myr, width, height) {
    this.Block = function(name) {
        const texture = textures[name];

        this.render = () => {
            if(texture.isTransparent()) {
                texture.getFloor().drawTransformedAt(0, 0, tRoof);
                
                for(let i = 0; i < backWalls.length; ++i)
                    texture.getWall(backWalls[i]).drawTransformedAt(0, 8 * Math.cos(pitch), tWalls[backWalls[i]]);
            }
            
            for(let i = 0; i < frontWalls.length; ++i)
                texture.getWall(frontWalls[i]).drawTransformedAt(0, 8 * Math.cos(pitch), tWalls[frontWalls[i]]);

            texture.getRoof().drawTransformedAt(0, -8 * Math.cos(pitch), tRoof);
        };
    };

    const Texture = function(blockName) {
        const walls = [];
        let floor = undefined;
        let roof = undefined;

        this.getFloor = () => floor;
        this.getRoof = () => roof;
        this.getWall = wall => walls[wall];
        this.isTransparent = () => floor === undefined;

        if(myr.isRegistered(blockName + "-floor"))
            floor = new myr.Sprite(blockName + "-floor");

        if(myr.isRegistered(blockName + "-roof"))
            roof = new myr.Sprite(blockName + "-roof");
        
        walls.push(new myr.Sprite(blockName + "-north"));
        walls.push(new myr.Sprite(blockName + "-east"));
        walls.push(new myr.Sprite(blockName + "-south"));
        walls.push(new myr.Sprite(blockName + "-west"));
    };
    
    const partitionTextures = () => {
        parts = new myr.Surface(sprites.getWidth() * 2, sprites.getHeight() * 2);
        parts.bind();
        parts.clear();

        const blockKeys = Object.keys(locations);

        for(let i = 0; i < blockKeys.length; ++i) {
            const block = blockKeys[i];
            const partKeys = Object.keys(locations[block]);

            for(let j = 0; j < partKeys.length; ++j) {
                const part = partKeys[j];
                const frame = locations[block][part];
                
                switch(part) {
                    case "floor":
                        textures[block].getFloor().draw(frame[0] + frame[2] * 0.5, frame[1] + frame[3] * 0.5);
                        break;
                    case "roof":
                        textures[block].getRoof().draw(frame[0] + frame[2] * 0.5, frame[1] + frame[3] * 0.5);
                        break;
                    case "north":
                        textures[block].getWall(0).draw(frame[0] + sprites.getWidth(), frame[1] + frame[3]);
                        break;
                    case "east":
                        textures[block].getWall(1).draw(frame[0], frame[1] + frame[3] + sprites.getHeight());
                        break;
                    case "south":
                        textures[block].getWall(2).draw(frame[0] + sprites.getWidth(), frame[1] + frame[3]);
                        break;
                    case "west":
                        textures[block].getWall(3).draw(frame[0], frame[1] + frame[3] + sprites.getHeight());
                        break;
                }
            }
        }
    };

    const shade = () => {
        const ambient = 0.35;

        let lx = Math.cos(Math.PI * (1 + 0.125));
        let ly = Math.sin(Math.PI * (1 + 0.125));
        
        let nsx = Math.cos((angle + Math.PI * 0.5) % Math.PI + Math.PI * 0.5);
        let nsy = Math.sin((angle + Math.PI * 0.5) % Math.PI + Math.PI * 0.5);

        let nex = Math.cos(angle % Math.PI + Math.PI * 0.5);
        let ney = Math.sin(angle % Math.PI + Math.PI * 0.5);
        
        cTop.r = cTop.g = cTop.b = -lx * (1 - ambient) * Math.sin(pitch) + ambient;
        cNorthSouth.r = cNorthSouth.g = cNorthSouth.b = Math.max(0, lx * nsx + ly * nsy) * (1 - ambient) * Math.cos(pitch) + ambient;
        cEastWest.r = cEastWest.g = cEastWest.b = Math.max(0, lx * nex + ly * ney) * (1 - ambient) * Math.cos(pitch) + ambient;

        sprites.bind();
        sprites.clear();

        myr.setColor(cTop);
        parts.drawPart(0, 0, 0, 0, sprites.getWidth(), sprites.getHeight());

        myr.setColor(cNorthSouth);
        parts.drawPart(0, 0, sprites.getWidth(), 0, sprites.getWidth(), sprites.getHeight());

        myr.setColor(cEastWest);
        parts.drawPart(0, 0, 0, sprites.getHeight(), sprites.getWidth(), sprites.getHeight());

        myr.setColor(myr.Color.WHITE);
    };

    const setTransforms = (angle, pitch) => {
        const radius = Math.sqrt(2) * 8;
        
        tRoof.identity();
        tRoof.scale(1, Math.sin(pitch));
        tRoof.rotate(angle);

        for(let i = 0; i < 4; ++i) {
            const a = Math.PI * 0.5 * (i + 0.5) + angle;
            
            tWalls[i].identity();
            tWalls[i].translate(Math.cos(-a) * radius, Math.sin(-a) * radius * Math.sin(pitch));
            tWalls[i].scale(-Math.cos(a - Math.PI * 0.25), 1);
            tWalls[i].shear(0, -Math.cos(a + Math.PI * 0.25) * Math.sin(pitch));
            tWalls[i].scale(1, Math.cos(pitch));
        }

        backWalls[0] = 3 - Math.floor(angle / (Math.PI * 0.5));
        backWalls[1] = (backWalls[0] + 1) % 4;
        frontWalls[0] = (backWalls[1] + 1) % 4;
        frontWalls[1] = (frontWalls[0] + 1) % 4;
    };

    const update = timeStep => {
        
    };

    const render = () => {
        if(parts === null) {
            if(sprites.ready())
                partitionTextures();
            else
                return;
        }

        if(rotated) {
            shade();
            setTransforms(angle, pitch);

            rotated = false;
        }

        myr.bind();
        myr.clear();

        myr.push();
        myr.translate(myr.getWidth() / 2, myr.getHeight() / 2);
        myr.scale(zoom, zoom);

        myr.pop();

        sprites.draw(10, 10);

        myr.flush();
    };

    this.start = () => {
        myr.utils.loop(function(timeStep) {
            update(timeStep);
            render();

            return true;
        });
    };

    this.rotate = delta => {
        angle += delta;

        while(angle < 0)
            angle += Math.PI * 2;

        while(angle > Math.PI * 2)
            angle -= Math.PI * 2;

        rotated = true;
    };

    this.pitch = delta => {
        pitch += delta;

        if(pitch < 0)
            pitch = 0;
        else if(pitch > Math.PI * 0.5)
            pitch = Math.PI * 0.5;
        
        rotated = true;
    };

    this.zoom = delta => {
        zoom *= 1 + delta;

        if(zoom > ZOOM_MAX)
            zoom = ZOOM_MAX;
        else if(zoom < ZOOM_MIN)
            zoom = ZOOM_MIN;
    };

    const loadTextures = (sprites, locations) => {
        const textures = {};
        const blockKeys = Object.keys(locations);

        for(let i = 0; i < blockKeys.length; ++i) {
            const block = blockKeys[i];
            const partKeys = Object.keys(locations[block]);
    
            for(let j = 0; j < partKeys.length; ++j) {
                const part = partKeys[j];
                let xOrigin, yOrigin;
    
                switch(part) {
                    case "roof":
                    case "floor":
                        xOrigin = locations[block][part][2] * 0.5;
                        yOrigin = locations[block][part][3] * 0.5;
                        break;
                    default:
                        xOrigin = 0;
                        yOrigin = locations[block][part][3];
                }
    
                myr.register(block + "-" + part, myr.makeSpriteFrame(sprites,
                    locations[block][part][0],
                    locations[block][part][1],
                    locations[block][part][2],
                    locations[block][part][3],
                    xOrigin,
                    yOrigin,
                    0));
            }
    
            textures[block] = new Texture(block);
        }

        return textures;
    };

    const locations = {
        colorbox: {
            roof: [0, 0, 16, 16],
            floor: [16, 0, 16, 16],
            north: [32, 0, 16, 16],
            east: [48, 0, 16, 16],
            south: [64, 0, 16, 16],
            west: [80, 0, 16, 16]
        }
    };

    const grid = new Array(width * height);
    const sprites = new myr.Surface("img/dirtWaterBottom.png");
    const textures = loadTextures(sprites, locations);
    let parts = null;
    let rotated = true;

    const CLEAR_COLOR = new myr.Color(0.2, 0.8, 0.5);
    const ZOOM_MIN = 1;
    const ZOOM_MAX = 40;

    const tRoof = new myr.Transform();
    const tWalls = [new myr.Transform(), new myr.Transform(), new myr.Transform(), new myr.Transform()];
    const cTop = new myr.Color(1, 1, 1);
    const cNorthSouth = new myr.Color(1, 1, 1);
    const cEastWest = new myr.Color(1, 1, 1);
    const backWalls = [0, 1];
    const frontWalls = [2, 3];

    let angle = Math.PI / 4;
    let pitch = Math.PI / 4;
    let zoom = 12;

    myr.setClearColor(CLEAR_COLOR);
    
    for(let i = 0; i < grid.length; ++i)
        grid[i] = [];
};

const renderer = document.getElementById("renderer");
const isometric = new Isometric(new Myr(renderer), 8, 8);

let dragging = false;
let mouseX = 0;
let mouseY = 0;

renderer.addEventListener("mousemove", function(event) {
    if(dragging) {
        const dx = event.clientX - mouseX;
        const dy = event.clientY - mouseY;

        if(dx != 0)
            isometric.rotate(dx * 0.015);
        
        if(dy != 0)
            isometric.pitch(dy * 0.015);

        mouseX = event.clientX;
        mouseY = event.clientY;
    }
});

renderer.addEventListener("mousedown", function(event) {
    dragging = true;

    mouseX = event.clientX;
    mouseY = event.clientY;
});

renderer.addEventListener("mouseup", function(event) {
    dragging = false;
});

renderer.addEventListener("wheel", function(event) {
    if(event.deltaY > 0)
        isometric.zoom(-0.25);
    else
        isometric.zoom(0.25);
});

isometric.start();