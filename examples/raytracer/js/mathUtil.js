const Vector3 = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.add = (other) => {
        let x = this.x + other.x;
        let y = this.y + other.y;
        let z = this.z + other.z;
        return new Vector3(x, y, z);
    };

    this.subtract = (other) => {
        let x = this.x - other.x;
        let y = this.y - other.y;
        let z = this.z - other.z;
        return new Vector3(x, y, z);
    };

    this.dot = (other) => {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    };

    this.length = () => {
        return Math.sqrt(this.dot(this));
    };

    this.multiplyVec = (other) => {
        let x = this.x * other.x;
        let y = this.y * other.y;
        let z = this.z * other.z;
        return new Vector3(x, y, z);
    };

    this.multiply = (scalar) => {
        let x = this.x * scalar;
        let y = this.y * scalar;
        let z = this.z * scalar;
        return new Vector3(x, y, z);
    };

    this.divide = (scalar) => {
        if (scalar === 0)
            return new Vector3(0, 0, 0);
        return this.multiply(1.0 / scalar);
    };

    this.normalize = () => {
        return this.divide(this.length());
    }
};

const Hit = function (t, normal) {
    this.getDistance = () => { return t };
    this.getNormal = () => { return normal };
};

const Ray = function (origin, direction) {
    this.getOrigin = () => {
        return origin;
    };

    this.getDirection = () => {
        return direction;
    };

    this.at = distance => {
        return origin.add(direction.multiply(distance));
    };
};