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

    const getOptions = (point) => {
        let options = [];
        let value = getCell(currentGrid, point);
        if (value !== EMPTY_CELL)
            options = rules[value];
        return options;
    };

    const randomIndex = (array) => {
        return Math.floor(Math.random() * array.length);
    };

    const solveCell = (neighbours) => {
        let options = getOptions(neighbours[0]);

        for (let index = 1; index < neighbours.length; index++) {
            options = options.concat(getOptions(neighbours[index]));
        }

        for(let left = 0; left < options.length; left++) {
            for(let right = left+1; right < options.length; right++) {
                if(options[left] === options[right])
                    options.splice(right--, 1);
            }
        }

        return options[randomIndex(options)];
    };

    const getNeighbours = (point) => {
        let neighbours = [];

        if (point.x + 1 < width)
            neighbours.push(Point(point.x + 1, point.y, point.z));
        if (point.x - 1 >= 0)
            neighbours.push(Point(point.x - 1, point.y, point.z));
        if (point.y + 1 < height)
            neighbours.push(Point(point.x, point.y + 1, point.z));
        if (point.y - 1 >= 0)
            neighbours.push(Point(point.x, point.y - 1, point.z));
        if (point.z + 1 < depth)
            neighbours.push(Point(point.x, point.y, point.z + 1));
        if (point.z - 1 >= 0)
            neighbours.push(Point(point.x, point.y, point.z - 1));

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
            if (getCell(currentGrid, point) === EMPTY_CELL) {
                let neighbours = getNeighbours(point);
                setCell(newGrid, point, solveCell(neighbours));
                newLocations = newLocations.concat(neighbours);
            }
        }
        currentGrid = newGrid;
        locations = newLocations;
    };

    this.initialize = (x, y, z, value) => {
        currentGrid = createEmptyGrid();
        let seedPoint = Point(x, y, z);
        setCell(currentGrid, seedPoint, value);
        locations = getNeighbours(seedPoint);
    };

    currentGrid = createEmptyGrid();
};