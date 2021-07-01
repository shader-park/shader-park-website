export function spCode()  {
    //Put your Shader Park Code here
    
    let buttonHover = input();
    let click = input();
    //setMaxIterations(1)
    setStepSize(.3);
    lightDirection(mouse);

  
    rotateY(time * .2);
    let warpedSpace = warpSpace(getSpace());
    metal(.9);
    shine(1);
    color(1 - warpedSpace);
    sphere(.5 + length(warpedSpace) * .2);
    expand(buttonHover * .03)
  
    // inspired by https://www.shadertoy.com/view/ttlGDf
    function warpSpace(p) {
      let t = time / 4.;
      rotateY(getRayDirection().y * (1 - click) * 12);
      p = getSpace().x*8.0*(vec3(0.5, .2, .1) + p);
      for(let i = 1.0; i < 3.0; i += 1.0) { 
          p.x = p.x +buttonHover * sin(2.0 * t + i * 1.5 * p.y) + t * 0.5;
          p.y = p.x + buttonHover * cos(2.0 * t + i * 1.5 * p.x);
      }
      return  0.5 + 0.5 * cos(time + vec3(p.x, p.y, p.x) + vec3(0., 2., 4.));
    }
  };