# myr.js

**myr.js** is a WebGL 2 based 2D graphics renderer. The engine is optimized for rendering large amounts of sprites, and also supports render targets, custom shaders, primitives and advanced transformations. There are no external dependencies. **myr.js** has been licensed under the [MIT license](LICENSE). All source code is contained in the [myr.js](js/myr.js) file.

# Initialization
**myr.js** can be initialized by calling the `Myr` function, which requires a canvas element as an argument. All global functions and objects are members of the returned object. The provided canvas must be able to provide a *WebGL 2* context.

Initialization would typically look like this:
```javascript
// Create a myr.js object
let myr = new Myr(document.getElementById("some-canvas-id"));

// Access myr.js functions and classes from here on
myr.setClearColor(new myr.Color(0.2, 0.5, 0.7));
```

# Objects
The **myr.js** object exposes several objects:

Object | Description
-|-
[`Surface`](#surface)|A render target which can be rendered to, which may be initialized to an existing image
[`Transform`](#transform)|A 2D transformation
[`Color`](#color)|A color containing a red, green, blue and alpha channel
[`Vector`](#vector)|A 2D vector


# Global functions
Global functions are members of the object returned by the `Myr` function. One of the most important tasks of the global functions is maintaining the transform stack. Everything that is rendered is transformed by the [`Transform`](#transform) on top of this stack. Before applying transformations, it is useful to first save the current transform state using the `push()` function. The `pop()` function can be called after the transformations are done to get back to the original state.

### `setClearColor(color)`
Set the clear color of the **myr.js** object. When `clear()` is called, the screen will be cleared using this color.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|A color which the canvas will be cleared to when `clear()` is called

### `clear()`
Clears the canvas to the currently set clear color.

### `bind()`
Binds the canvas as the current render target.

### `flush()`
This function finishes all previously given draw calls. This function should be called at the very end of the render loop.

### `free()`
Frees the **myr.js** object and the OpenGL objects it maintains. Note that this function does not free objects like [surfaces](#surface), these must be freed individually.

### `getTransform()`
Return the [transformation](#transform) which is currently on top of the stack.

### `push()`
Push the current [transformation](#transform) onto the stack, saving the current transformation state.

### `pop()`
Pop the current [transformation](#transform) from the stack, restoring the last pushed transformation.

### `transform(transform)`
Transform the current [transformation](#transform) by multiplying it with another transformation.

Parameter | Type | Description
-|-|-
transform|[`Transform`](#transform)|A transform to multiply the current transformation with

### `translate(x, y)`
Translate the current transformation.

Parameter | Type | Description
-|-|-
x|`Number`|Horizontal movement
y|`Number`|Vertical movement

### `rotate(angle)`
Rotate the current transformation.

Parameter | Type | Description
-|-|-
angle|`Number`|Angle in radians

### `shear(x, y)`
Shear the current transformation.

Parameter | Type | Description
-|-|-
x|`Number`|Horizontal shear
y|`Number`|Vertical shear

### `scale(x, y)`
Scale the current transformation

Parameter | Type | Description
-|-|-
x|`Number`|Horizontal scale
y|`Number`|Vertical scale

# Surface
A surface in **myr.js** can be a render target. After binding it using its member function `bind()`, all render calls render to this surface. The surface itself can also be rendered. Additionally, the surface may be constructed from images, making surfaces useful for large image or background rendering since large images don't fit well on sprite sheets.

### `Surface(width, height)`
Constructs a surface of a specific size.

Parameter | Type | Description
-|-|-
width|`Number`|Width in pixels
height|`Number`|Height in pixels

### `Surface(image)`
Constructs a surface from an existing image. The function `ready()` will return `false` until the image is loaded.

Parameter | Type | Description
-|-|-
image|`String`|A URL to a valid image file

### `bind()`
Binds the surface, making it the current render target until another one is bound. After binding, an empty [transform](#transform) is pushed onto the transformation stack.

### `setClearColor(color)`
Set the clear color of this surface. When `clear()` is called, the surface will be cleared using this color.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|A color which the canvas will be cleared to when `clear()` is called

### `clear()`
Clears the surface to the currently set clear color.

### `ready()`
Returns a `Boolean` indicating whether the surface is ready for use. Surfaces constructed from an image will be ready once the image is loaded. Surfaces that don't require an image are always immediately ready.

### `draw(x, y)`
Draws this surface on the currently bound target. Note that surfaces can only render to other targets, never to themselves.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to render to
y|`Number`|The Y position to render to

### `getWidth()`
Returns the width of the surface.

### `getHeight()`
Returns the height of the surface.

### `free()`
Frees the surface and all memory allocated by it.

# Transform
The transform object wraps a homogeneous 2D transformation matrix. Several different transform functions are provided, but the matrix can also be filled by hand. Transform objects are used in the global transformation stack to transform everything that is being rendered.

### `Transform()`
Constructs a `Transform` object, which is initialized as the identity matrix (no transform).

### `Transform(_00, _10, _20, _01, _11, _21)`
Constructs a `Transform` object with custom values. Note that only the top two rows of the matrix can be entered, since the bottom row for 2D transformations will always be `[0, 0, 1]`.

Parameter | Type | Description
-|-|-
_00|`Number`|Value [0, 0] of the matrix
_10|`Number`|Value [1, 0] of the matrix
_20|`Number`|Value [2, 0] of the matrix
_01|`Number`|Value [0, 1] of the matrix
_11|`Number`|Value [1, 1] of the matrix
_21|`Number`|Value [2, 1] of the matrix

### `apply(vector)`
Multiplies the given vector by this transformation matrix. This function may prove useful when a coordinate instead of a rendering call must be transformed.

Parameter | Type | Description
-|-|-
vector|[`Vector`](#vector)|A vector object to transform

### `copy()`
Returns a copy of this transform object.

### `identity()`
Sets the transformation to the identity matrix.

### `set(transform)`
Sets the transformation to another transformation.

Parameter | Type | Description
-|-|-
transform|[`Transform`](#transform)|A transform object

### `multiply(transform)`
Multiplies this transformation with another transformation by matrix multiplication. This is useful for combining different transforms together.

Parameter | Type | Description
-|-|-
transform|[`Transform`](#transform)|A transform object

### `rotate(angle)`
Rotate by a number of radians.

Parameter | Type | Description
-|-|-
angle|`Number`|The number of radians to rotate by

### `shear(x, y)`
Shear this transformation.

Parameter | Type | Description
-|-|-
x|`Number`|Horizontal shear
y|`Number`|Vertical shear

### `translate(x, y)`
Translate this transformation.

Parameter | Type | Description
-|-|-
x|`Number`|Horizontal translation
y|`Number`|Vertical translation

### `scale(x, y)`
Scale this transformation.

Parameter | Type | Description
-|-|-
x|`Number`|Horizontal scale
y|`Number`|Vertical scale

# Color
This object represents a color with a red, green, blue and alpha component.

### `Color(r, g, b)`
Constructs a color object from red, green and blue. The values must lie in the range [0, 1]. The color will have an alpha value of `1.0`.

### `Color(r, g, b, a)`
Constructs a color object from red, green, blue and alpha. The values must lie in the range [0, 1].

# Vector
This object represents a vector in 2D space. Several useful vector operation functions are provided.

### `Vector(x, y)`
Constructs a vector object.

Parameter | Type | Description
-|-|-
x|`Number`|X value
y|`Number`|Y value

### `copy()`
Returns a copy of this vector object.

### `add(vector)`
Add another vector to this one.

Parameter | Type | Description
-|-|-
vector|[`Vector`](#vector)|A vector object

### `subtract(vector)`
Subtract another vector from this one.

Parameter | Type | Description
-|-|-
vector|[`Vector`](#vector)|A vector object

### `negate()`
Negate the vector values.

### `dot(vector)`
Returns the dot product of this vector and another one.

Parameter | Type | Description
-|-|-
vector|[`Vector`](#vector)|A vector object

### `length()`
Returns the length of the vector.

### `multiply(scalar)`
Multiplies the vector by a scalar.

Parameter | Type | Description
-|-|-
scalar|`Number`|A number

### `divide(scalar)`
Divides the vector by a scalar.

Parameter | Type | Description
-|-|-
scalar|`Number`|A number

### `normalize()`
Normalizes the vector.

### `angle()`
Returns the angle this vector is pointing towards.