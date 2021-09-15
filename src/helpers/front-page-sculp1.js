export function spCode2() {
    let hover = input(0, 0, 1);
    let click = input(0, 0, 1);
    lightDirection(getRayDirection());
    metal(.4);
    shine(.7);
    
    let sCurve = shape((size, innerOffset) => {
      sphere(size);
      difference();
      let s = getSpace();
      displace(0.1, innerOffset, s.z);
      sphere(size-.03);
      expand(.00)
    })
    
    
    let s = getSpace();
    let col = vec3(0, .1, length(normal));
    color(col+normal*.1)
    rotateX((sin(time))*.04);
    rotateZ((sin(time))*.04);
    rotateY((cos(time))*.1);
    
    shape(() => {
      for(let i = 0; i < 3; i++) {
        blend(.1);
        // let rot = 4 * sin(time * .2) * .5 * hover;
        let rot = hover;
        rotateX(rot);
        rotateY(rot);
        rotateZ(rot);
        sCurve(1*(i/3)+.3, .2);
      }
      sphere(.15);
    })();
    mixGeo(nsin(time)*.22+.9 * 1-click);
    sphere(.8)
  
}

export function spCode()  {
    //Put your Shader Park Code here
    
    let hover = input();
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
    expand(hover * .03)
  
    // inspired by https://www.shadertoy.com/view/ttlGDf
    function warpSpace(p) {
      let t = time / 4.;
      rotateY(getRayDirection().y * (1 - click) * 12);
      p = getSpace().x*8.0*(vec3(0.5, .2, .1) + p);
      for(let i = 1.0; i < 3.0; i += 1.0) { 
          p.x = p.x +hover * sin(2.0 * t + i * 1.5 * p.y) + t * 0.5;
          p.y = p.x + hover * cos(2.0 * t + i * 1.5 * p.x);
      }
      return  0.5 + 0.5 * cos(time + vec3(p.x, p.y, p.x) + vec3(0., 2., 4.));
    }
  };