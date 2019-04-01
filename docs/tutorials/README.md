---
sidebar: auto
---

## Modeling with Distance Functions

Distance functions or signed distance functions (DFs, SDFs) are a functional representation useful for defining shapes and solid volumes. Deriving the DF of an arbitrary surface in general is a complex problem. However by considering some simple examples and studying their properties we can develop an intuition for modeling with DFs. Constructive solid geometry (CSG), coordinate systems, symmetry and non-linear transformations can be applied to create sophisticated models.
  
**Definition:** A distance function is a scalar field ($\large f: \Bbb{R^n} \to \Bbb{R}$) which maps a point to its minimum distance from the surface of a solid.  
To understand what this means, consider the DF of a solid 2D circle. The distance $\large d$ from a point $\large \mathbf{p}=(x,y)$ to a circle of radius $\large r$ centered at the origin is the distance from the point to the origin minus the radius of the circle.  
<center>$\large d=\sqrt{x^2+y^2}-r$</center>

<iframe src="https://www.desmos.com/calculator/mvrntrecdh?embed" width="500px" height="500px" style="border: 1px solid #ccc" frameborder=0></iframe>

### Coordinate Systems

Spherical

### Preserving operations

Translation
Rotation
Reflection


### Non-Preserving operations

Any arbitrary distortion  
  


## The Sphere-tracing algorithm

## Color Vector Fields

## Roll your own intersection function

The shade function can be hacked to render 2D shaders, or implement your own intersection algorithm or volumetric renderer. 

## Sources
Much of the math and code in this page is based on
IQ articles
Jamie wong

## GLSL (OpenGL Shading Language)

GLSL a small language (essentially C without pointers) with built-in functions and data types for working with vectors and common maths. It is designed to run very efficiently on a graphics processor, even from within a web page. Graphics processors are capable of performing calculations at an amazing speed. In just a few minutes of interactive modeling on this site, your program in distanceToSurface can easily be executed over 100 billion times.

Some built in types:
vec2
vec3
vec4
mat2
mat3
mat4

Some built in functions:
float length(vec v)
float distance(vec v1,vec v2)
vec normalize(vec v)
pow
exp
sqrt
abs
Trig - sin, cos, tan, atan, acos, asin...

A full list of built-in functions can be found at: [url]

## Further reading and resources

IQs articles
shadertoy
Curv