const Raytracer = function(myr) {
    const COLOR_CLEAR = new myr.Color(0.2, 0.3, 0.8);
    const TIME_STEP_MAX = 0.5;

    const MATERIAL_AMBIENT    = 0.3,
          MATERIAL_DIFFUSE    = 0.5,
          MATERIAL_SPECULAR   = 0.3,
          MATERIAL_SPECULAR_N = 6;

    const EYE   = new Vector3(400, 300, 1000);
    const LIGHT = new Vector3(400, 300, 0);

    let lastDate = null;

    myr.setClearColor(COLOR_CLEAR);

    let spheres = [new Sphere(new Vector3(300, 300, 0), 50),
                   new Sphere(new Vector3(500, 300, 0), 50)];
    
    const getTimeStep = () => {
        const date = new Date();
        let timeStep = (date - lastDate) / 1000;
        
        if(timeStep < 0)
            timeStep += 1.0;
        else if(timeStep > TIME_STEP_MAX)
            timeStep = TIME_STEP_MAX;
        
        lastDate = date;
        
        return timeStep;
    };
    
    const update = timeStep => {
        for(let i = 0; i < spheres.length; ++i)
            spheres[i].update(timeStep);
    };

    const shade = (viewDir, point, normal) => {
        let lightDir = LIGHT.subtract(point).normalize();
        let diffuse = Math.max(normal.dot(lightDir), 0);

        let reflectDir = normal.multiply(normal.dot(lightDir)).multiply(2).subtract(lightDir);
        let specAngle = Math.max(reflectDir.dot(viewDir), 0);
        let specular = Math.pow(specAngle, MATERIAL_SPECULAR_N);

        return MATERIAL_AMBIENT +
               MATERIAL_DIFFUSE * diffuse +
               MATERIAL_SPECULAR * specular;
    };

    const trace = ray => {
        let closestHit = new Hit(Infinity);
        let sphere;

        for(let i = 0; i < spheres.length; ++i) {
            let hit = spheres[i].intersect(ray);
            if (hit.getDistance() < closestHit.getDistance()) {
                closestHit = hit;
                sphere = spheres[i];
            }
        }

        if (!sphere) return;

        let viewDir = ray.getDirection().multiply(-1);
        let hitPoint = ray.at(closestHit.getDistance());
        let normal = closestHit.getNormal();
        let intensity = shade(viewDir, hitPoint, normal);

        return new myr.Color(intensity, intensity, intensity, 1);
    };

    const render = () => {
        myr.bind();
        myr.clear();

        for (let y = 0; y < myr.getHeight(); y++)
            for (let x = 0; x < myr.getWidth(); x++) {
                let pixel = new Vector3(x + 0.5, myr.getHeight() -  1 - y + 0.5, 0);
                let ray = new Ray(EYE, pixel.subtract(EYE).normalize());
                let color = trace(ray);
                if (color)
                    myr.primitives.drawPoint(trace(ray), x, y);
            }

        myr.flush();
    };
    
    const animate = () => {
        requestAnimationFrame(animate.bind());
        
        update(getTimeStep());
        render();
    };

    this.start = () => {
        lastDate = new Date();
        
        animate();
    };
};

const renderer = document.getElementById("renderer");
const tracer = new Raytracer(new Myr(renderer));

tracer.start();