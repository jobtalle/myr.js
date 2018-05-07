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

    const Point = (x, y, z) => {
        return {x: Math.floor(x), y: Math.floor(y), z: Math.floor(z)};
    };

    const createEmptyGrid = () => {
        return new Array(width * height * depth).fill(EMPTY_CELL);
    };

    const gridIndex = (point) => {
        return point.x + point.y * width + point.z * width * depth;
    };

    const setCell = (grid, point, value) => {
        grid[gridIndex(point)] = value;
    };

    const getCell = (grid, point) => {
        return grid[gridIndex(point)];
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

    const prepareEmptyNeighbours = (grid, point) => {
        let neighbours = [];
        let options = getOptions(grid, point);

        let left = Point(point.x + 1, point.y, point.z);
        if (left.x < width && getCell(currentGrid, left) === EMPTY_CELL) {
            setCell(grid, left, options);
            neighbours.push(left);
        }

        let right = Point(point.x - 1, point.y, point.z);
        if (right.x >= 0 && getCell(currentGrid, right) === EMPTY_CELL) {
            setCell(grid, right, options);
            neighbours.push(right);
        }

        let up = Point(point.x, point.y + 1, point.z);
        if (up.y < height && getCell(currentGrid, up) === EMPTY_CELL) {
            setCell(grid, up, options);
            neighbours.push(up);
        }

        let down = Point(point.x, point.y - 1, point.z);
        if (down.y >= 0 && getCell(currentGrid, down) === EMPTY_CELL) {
            setCell(grid, down, options);
            neighbours.push(down);
        }

        let top = Point(point.x, point.y, point.z + 1);
        if (top.z < depth && getCell(currentGrid, top) === EMPTY_CELL) {
            setCell(grid, top, options);
            neighbours.push(top);
        }

        let bottom = Point(point.x, point.y, point.z - 1);
        if (bottom.z >= 0 && getCell(currentGrid, bottom) === EMPTY_CELL) {
            setCell(grid, bottom, options);
            neighbours.push(bottom);
        }

        return neighbours;
    };

    this.getCell = (x, y, z) => {
        return getCell(currentGrid, Point(x, y, z));
    };

    this.solveGridStep = () => {
        let newGrid = currentGrid.slice();
        let newLocations = [];
        while (locations.length > 0) {
            let point = locations.pop();
            setCell(newGrid, point, solveCell(currentGrid, point));
            newLocations = newLocations.concat(prepareEmptyNeighbours(newGrid, point));
        }
        currentGrid = newGrid;
        locations = newLocations;
    };

    this.initialize = (x, y, z, value) => {
        currentGrid = createEmptyGrid();
        let seedPoint = Point(x, y, z);
        setCell(currentGrid, seedPoint, value);
        locations = prepareEmptyNeighbours(currentGrid, seedPoint);
    };

    currentGrid = createEmptyGrid();
};