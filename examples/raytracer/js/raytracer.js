const Raytracer = function(myr) {
    const UP_SCALING = 8;
    const NUM_REFLECTIONS = 4;
    const COLOR_CLEAR = new myr.Color(0.7, 0.7, 1);
    const TIME_STEP_MAX = 0.5;

    let lastDate = null;

    const width = myr.getWidth() / UP_SCALING;
    const height = myr.getHeight() / UP_SCALING;
    const renderSurface = new myr.Surface(width, height);

    let spheres = [new Sphere(new Vector3(0.5 * width, 0.5 * height, 0), 1, 0.1  * width),
                   new Sphere(new Vector3(0.5 * width, 0.5 * height, 0), 2, 0.05 * width),
                   new Sphere(new Vector3(0.5 * width, 0.5 * height, 0), 3, 0.1  * width),
                   new Sphere(new Vector3(0.5 * width, 0.5 * height, 0), 4, 0.05 * width)];

    const eye   = new Vector3(width / 2, height / 2, 1000);
    const light = new Vector3(width / 2, height / 2, 100);

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

    const shade = (ray, hit, recursionDepth) => {
        const MATERIAL_AMBIENT    = 0.2,
              MATERIAL_DIFFUSE    = 0.3,
              MATERIAL_SPECULAR   = 0.5,
              MATERIAL_SPECULAR_N = 8;

        let position = ray.at(hit.getDistance());
        let normal = hit.getNormal();
        let lightDir = light.subtract(position).normalize();
        let intensity = MATERIAL_AMBIENT + MATERIAL_DIFFUSE * Math.max(normal.dot(lightDir), 0);

        let reflectedLightDir = reflect(lightDir.multiply(-1), normal);
        let viewDir = ray.getDirection().multiply(-1);
        let specAngle = Math.max(reflectedLightDir.dot(viewDir), 0);
        intensity += MATERIAL_SPECULAR * Math.pow(specAngle, MATERIAL_SPECULAR_N);

        if (recursionDepth > 0) {
            let reflectedRayDir = reflect(ray.getDirection(), normal).normalize();
            let reflectedRay = new Ray(position.add(normal), reflectedRayDir);
            intensity += MATERIAL_SPECULAR * trace(reflectedRay, recursionDepth - 1);
        }

        return intensity;
    };

    const trace = (ray, recursionDepth) => {
        let closestHit = new Hit(Infinity);
        let sphere;

        for(let i = 0; i < spheres.length; ++i) {
            let hit = spheres[i].intersect(ray);
            if (hit.getDistance() < closestHit.getDistance()) {
                closestHit = hit;
                sphere = spheres[i];
            }
        }

        if (sphere)
            return shade(ray, closestHit, recursionDepth);

        return 0;
    };

    const render = () => {
        renderSurface.bind();
        renderSurface.clear();
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let pixel = new Vector3(x + 0.5, height - 1 - y + 0.5, 0);
                let ray = new Ray(eye, pixel.subtract(eye).normalize());
                let intensity = trace(ray, NUM_REFLECTIONS);
                if (intensity > 0)
                    myr.primitives.drawPoint(new myr.Color(0, 0, intensity, 1), x, y);
            }
        }

        myr.bind();
        myr.clear();
        renderSurface.drawScaled(0, 0, UP_SCALING, UP_SCALING);
        myr.flush();
    };
    
    const animate = () => {
        requestAnimationFrame(animate.bind());
        
        update(getTimeStep());
        render();
    };

    this.start = () => {
        lastDate = new Date();

        myr.setClearColor(COLOR_CLEAR);
        renderSurface.setClearColor(COLOR_CLEAR);
        animate();
    };
};

const renderer = document.getElementById("renderer");
const tracer = new Raytracer(new Myr(renderer));

tracer.start();