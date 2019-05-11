let radius = sin(time);//0.3;
rotateY(time);

// let offset = float( sin(x) );
displace(0.0, mult(0.1, sin( add( mult(10.0,x), time) )),0.0);
sphere(radius);
