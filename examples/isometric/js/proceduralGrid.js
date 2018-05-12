/**
 * A simple 3D grid that fills its cells using an array of adjacency rules.
 * @param width The width of the grid, as seen from the front.
 * @param height The height of the grid, as seen from the front.
 * @param depth The depth of the grid, as seen from the front.
 * @param rules The generation rules, an array of arrays that represent allowed cell values for a cell at that index.
 * @constructor
 */
const ProceduralGrid = function(width, height, depth, rules) {
    const EMPTY_CELL = -1;

    let currentGrid = [];
    let locations = [];

    const Point = function (x, y, z) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
        this.z = Math.floor(z);

        return this;
    };

    Point.prototype.equals = function (other) {
        return this.x === other.x &&
               this.y === other.y &&
               this.z === other.z;
    };

    const mergePointsUnique = (toArray, fromArray) => {
        let array = toArray.concat(fromArray);
        for(let left = 0; left < array.length; left++) {
            for(let right = left+1; right < array.length; right++) {
                if (array[left].equals(array[right]))
                    array.splice(right--, 1);
            }
        }
        return array;
    };

    const createEmptyGrid = () => {
        return new Array(width * height * depth).fill(EMPTY_CELL);
    };

    const gridIndex = (point) => {
        return point.x + point.y * width + point.z * width * depth;
    };

    const isArray = (variable) => {
        return variable.constructor === Array;
    };

    const getCell = (grid, point) => {
        return grid[gridIndex(point)];
    };

    const setCell = (grid, point, newCell) => {
        let currentCell = getCell(grid, point);
        if (isArray(newCell) && isArray(currentCell)) {
            newCell.filter(function(value) {
                return currentCell.indexOf(value) !== -1;
            }).filter(function (value, index, potentialDuplicates) {
                return potentialDuplicates.indexOf(value) === index;
            });
        }
        grid[gridIndex(point)] = newCell;
    };

    const getOptions = (grid, point) => {
        let options = [];
        let value = getCell(grid, point);
        if (value !== EMPTY_CELL)
            options = rules[value];
        return options;
    };

    const randomIndex = (array) => {
        return Math.floor(Math.random() * array.length);
    };

    const solveCell = (grid, point) => {
        let options = getCell(grid, point);
        return options[randomIndex(options)];
    };

    const isInBounds = (point) => {
        return point.x < width && point.x >= 0 &&
               point.y < height && point.y >= 0 &&
               point.z < depth && point.z >= 0;
    };

    const isEmpty = (grid, point) => {
        let cell = getCell(grid, point);
        return cell === EMPTY_CELL || isArray(cell);
    };

    const prepareEmptyNeighbours = (grid, point) => {
        let neighbours = [];
        let options = getOptions(grid, point);

        let left = new Point(point.x + 1, point.y, point.z);
        if (isInBounds(left) && isEmpty(currentGrid, left)) {
            setCell(grid, left, options);
            neighbours.push(left);
        }

        let right = new Point(point.x - 1, point.y, point.z);
        if (isInBounds(right) && isEmpty(currentGrid, right)) {
            setCell(grid, right, options);
            neighbours.push(right);
        }

        let up = new Point(point.x, point.y + 1, point.z);
        if (isInBounds(up) && isEmpty(currentGrid, up)) {
            setCell(grid, up, options);
            neighbours.push(up);
        }

        let down = new Point(point.x, point.y - 1, point.z);
        if (isInBounds(down) && isEmpty(currentGrid, down)) {
            setCell(grid, down, options);
            neighbours.push(down);
        }

        let top = new Point(point.x, point.y, point.z + 1);
        if (isInBounds(top) && isEmpty(currentGrid, top)) {
            setCell(grid, top, options);
            neighbours.push(top);
        }

        let bottom = new Point(point.x, point.y, point.z - 1);
        if (isInBounds(bottom) && isEmpty(currentGrid, bottom)) {
            setCell(grid, bottom, options);
            neighbours.push(bottom);
        }

        return neighbours;
    };

    this.solveGridStep = () => {
        let newGrid = currentGrid.slice();
        let newLocations = [];
        while (locations.length > 0) {
            let point = locations.pop();
            setCell(newGrid, point, solveCell(currentGrid, point));
            newLocations = mergePointsUnique(newLocations,prepareEmptyNeighbours(newGrid, point));
        }
        currentGrid = newGrid;
        locations = newLocations;

        return locations.length > 0;
    };

    this.initialize = () => {
        currentGrid = createEmptyGrid();
        locations = [];
    };

    this.setCell = (x, y, z, value) => {
        let point = Point(x, y, z);
        setCell(currentGrid, point, value);
        locations = mergePointsUnique(locations, prepareEmptyNeighbours(currentGrid, point));
    };

    this.getCell = (x, y, z) => {
        return getCell(currentGrid, new Point(x, y, z));
    };

    this.initialize();
};