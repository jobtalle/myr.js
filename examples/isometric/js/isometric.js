const Isometric = function(myr) {
    const Texture = function(blockName) {
        let floor = undefined;
        let roof = undefined;
        let walls = [];

        this.getFloor = () => floor;
        this.getRoof = () => roof;
        this.getWall = wall => walls[wall];

        if(myr.isRegistered(blockName + "-floor"))
            floor = new myr.Sprite(blockName + "-floor");

        if(myr.isRegistered(blockName + "-roof"))
            roof = new myr.Sprite(blockName + "-roof");
        
        walls.push(new myr.Sprite(blockName + "-north"));
        walls.push(new myr.Sprite(blockName + "-east"));
        walls.push(new myr.Sprite(blockName + "-south"));
        walls.push(new myr.Sprite(blockName + "-west"));
    };

    const Block = function(name) {
        const texture = textures[name];

        this.render = () => {
            //texture.getFloor().drawTransformedAt(0, 0, tRoof);
            
            /*
            for(let i = 0; i < backWalls.length; ++i)
                texture.getWall(backWalls[i]).drawTransformedAt(0, 16 * scale, tWalls[backWalls[i]]);
            */
                
            for(let i = 0; i < frontWalls.length; ++i)
                texture.getWall(frontWalls[i]).drawTransformedAt(0, 8 * scale, tWalls[frontWalls[i]]);

            texture.getRoof().drawTransformedAt(0, -8 * scale, tRoof);
        };
    };
    
    const registerSprites = () => {
        parts = new myr.Surface(sprites.getWidth() * 3, sprites.getHeight());

        const blockKeys = Object.keys(blockSprites);

        parts.bind();
        parts.clear();

        for(let i = 0; i < blockKeys.length; ++i) {
            const block = blockKeys[i];
            const partKeys = Object.keys(blockSprites[block]);

            for(let j = 0; j < partKeys.length; ++j) {
                const part = partKeys[j];
                const frame = blockSprites[block][part];
                
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
                        textures[block].getWall(1).draw(frame[0] + sprites.getWidth() * 2, frame[1] + frame[3]);
                        break;
                    case "south":
                        textures[block].getWall(2).draw(frame[0] + sprites.getWidth(), frame[1] + frame[3]);
                        break;
                    case "west":
                        textures[block].getWall(3).draw(frame[0] + sprites.getWidth() * 2, frame[1] + frame[3]);
                        break;
                }
            }
        }
    };

    const shade = () => {
        if(parts === null) {
            if(sprites.ready())
                registerSprites();
            else
                return;
        }

        let lx = Math.cos(Math.PI * (0.75 + 0.125));
        let ly = Math.sin(Math.PI * (0.75 + 0.125));

        let nsx = Math.cos((angle + Math.PI * 0.5) % Math.PI + Math.PI * 0.5);
        let nsy = Math.sin((angle + Math.PI * 0.5) % Math.PI + Math.PI * 0.5);

        let nex = Math.cos(angle % Math.PI + Math.PI * 0.5);
        let ney = Math.sin(angle % Math.PI + Math.PI * 0.5);
        
        let ls = Math.max(0, lx * nsx + ly * nsy) * 0.75 + 0.25;
        let le = Math.max(0, lx * nex + ly * ney) * 0.75 + 0.25;
        
        cNorthSouth.r = cNorthSouth.g = cNorthSouth.b = Math.abs(ls);
        cEastWest.r = cEastWest.g = cEastWest.b = Math.abs(le);

        sprites.bind();
        sprites.clear();

        myr.setColor(cTop);
        parts.drawPart(0, 0, 0, 0, sprites.getWidth(), sprites.getHeight());

        myr.setColor(cNorthSouth);
        parts.drawPart(0, 0, sprites.getWidth(), 0, sprites.getWidth(), sprites.getHeight());

        myr.setColor(cEastWest);
        parts.drawPart(0, 0, sprites.getWidth() * 2, 0, sprites.getWidth(), sprites.getHeight());

        myr.setColor(myr.Color.WHITE);
    };

    const setTransforms = (angle, pitch) => {
        const radius = Math.sqrt(2) * 8;
        
        tRoof.identity();
        tRoof.scale(1, scale);
        tRoof.rotate(angle);

        for(let i = 0; i < 4; ++i) {
            const a = Math.PI * 0.5 * (i + 0.5) + angle;

            tWalls[i].identity();
            tWalls[i].scale(1, scale);
            tWalls[i].translate(Math.cos(-a) * radius, Math.sin(-a) * radius);
            tWalls[i].scale(-Math.cos(a - Math.PI * 0.25), 1);
            tWalls[i].shear(0, -Math.cos(a + Math.PI * 0.25));
        }

        backWalls[0] = 3 - Math.floor(angle / (Math.PI * 0.5));
        backWalls[1] = (backWalls[0] + 1) % 4;
        frontWalls[0] = (backWalls[1] + 1) % 4;
        frontWalls[1] = (frontWalls[0] + 1) % 4;

        scale = Math.cos(pitch);
    };

    const update = timeStep => {
        angle += timeStep;

        while(angle > Math.PI * 2)
            angle -= Math.PI * 2;

        shade();
        setTransforms(angle, pitch);
    };

    const render = () => {
        myr.bind();
        myr.clear();
        myr.push();

        myr.translate(myr.getWidth() / 2, myr.getHeight() / 2);
        myr.scale(6, 6);

        for(let i = 0; i < blocks.length; ++i)
            blocks[i].render();

        myr.pop();

        sprites.draw(10, 10);

        myr.flush();
    };

    const generate = () => {
        blocks.push(new Block("colorbox"));
    };

    this.start = () => {
        generate();

        myr.utils.loop(function(timeStep) {
            update(timeStep);
            render();

            return true;
        });
    };

    const blockSprites = {
        colorbox: {
            roof: [0, 0, 16, 16],
            floor: [16, 0, 16, 16],
            north: [32, 0, 16, 16],
            east: [48, 0, 16, 16],
            south: [64, 0, 16, 16],
            west: [80, 0, 16, 16]
        }
    };

    const textures = {};
    const blockKeys = Object.keys(blockSprites);
    const sprites = new myr.Surface("img/dirtWaterBottom.png");
    let parts = null;

    for(let i = 0; i < blockKeys.length; ++i) {
        const block = blockKeys[i];
        const partKeys = Object.keys(blockSprites[block]);

        for(let j = 0; j < partKeys.length; ++j) {
            const part = partKeys[j];
            let xOrigin, yOrigin;

            switch(part) {
                case "roof":
                case "floor":
                    xOrigin = blockSprites[block][part][2] * 0.5;
                    yOrigin = blockSprites[block][part][3] * 0.5;
                    break;
                default:
                    xOrigin = 0;
                    yOrigin = blockSprites[block][part][3];
            }

            myr.register(block + "-" + part, myr.makeSpriteFrame(sprites,
                blockSprites[block][part][0],
                blockSprites[block][part][1],
                blockSprites[block][part][2],
                blockSprites[block][part][3],
                xOrigin,
                yOrigin,
                0));
        }

        textures[block] = new Texture(block);
    }

    const CLEAR_COLOR = new myr.Color(0.2, 0.8, 0.5);
    const tRoof = new myr.Transform();
    const tWalls = [new myr.Transform(), new myr.Transform(), new myr.Transform(), new myr.Transform()];
    const cTop = new myr.Color(1, 1, 1);
    const cNorthSouth = new myr.Color(1, 1, 1);
    const cEastWest = new myr.Color(1, 1, 1);
    const blocks = [];
    const backWalls = [0, 1];
    const frontWalls = [2, 3];

    let angle = Math.PI / 4;
    let pitch = Math.PI / 4;
    let scale;

    myr.setClearColor(CLEAR_COLOR);
};

const renderer = document.getElementById("renderer");
const isometric = new Isometric(new Myr(renderer));

isometric.start();