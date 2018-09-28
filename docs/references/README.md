---
sidebar: auto
---

# References 
## Geometries

### sphere

```float sphere( vec3 p, float size )```

#### Example
```glsl
float map(vec3 p) {
	return sphere(p, 0.3);
}
```
<iframe width="100%" height="350px" src="http://shaderpark.herokuapp.com" frameborder="0"></iframe>

### box
```flat box(vec3 p, vec3 dimensions)```
#### Example
```glsl
float map(vec3 p) {
	return box(p, vec3(0.3, 0.3, 0.3));
}
```

<iframe width="100%" height="350px" src="http://shaderpark.herokuapp.com" frameborder="0"></iframe>

### roundedBox
```flat roundedBox(vec3 p, vec3 dimensions, float roundness)```
#### Example
```glsl
float map(vec3 p) {
	return box(p, vec3(0.3, 0.3, 0.3), 0.2);
}
```

<iframe width="100%" height="350px" src="http://shaderpark.herokuapp.com" frameborder="0"></iframe>



### line()
#### Example

### torus()
#### Example

### cylinder
#### Example

### cone
#### Example

### plane
#### Example

### prism
#### Example

## Operations

### Add
### Union
### Subtraction
### Intersection
### Smooth Add
### Smooth Subtraction
### Mix

### Repeat 3D
### Radial Repeat

### Translate 2D
### Translate 3D
### Scale 2D
### Scale 3D
### Twist

## Lighting

### Simple Lighting
### Ambient Occlusion