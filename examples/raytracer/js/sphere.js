const Sphere = function(position, radius) {
    const MOVE_SPEED = 200;

    let timePassed = 0;
    let _originalPosition = position;

    this.update = timeStep => {
        timePassed += timeStep;
        position = _originalPosition.add(new Vector3(0, 0, MOVE_SPEED * Math.sin(timePassed)));
    };

    this.intersect = ray => {
        let L = ray.getOrigin().subtract(position);
        let a = ray.getDirection().dot(ray.getDirection());
        let b = 2 * ray.getDirection().dot(L);
        let c = L.dot(L) - radius * radius;

        let distance = 0;

        let d = b * b - 4 * a * c;
        if (d === 0)
            distance = -0.5 * b / a;
        else if (d > 0) {
            let q = (b > 0) ? -0.5 * (b + Math.sqrt(d)) : -0.5 * (b - Math.sqrt(d));
            distance = Math.min(q / a, c / q);
        }

        if (distance > 0) {
            let normal = ray.at(distance).subtract(position).normalize();
            return new Hit(distance, normal);
        }

        return new Hit(Infinity);
    };
};