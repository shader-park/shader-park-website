module.exports = {
  title: 'Shader Park',
  description: 'References & Examples',
  themeConfig: {
    nav: [
      {text: 'About', link: '/'},
      {text: 'Home', link: 'http://localhost:3000/'}
    ],
    // sidebar: 'auto'
    sidebar: [
      {
        title: 'Geometries',
        collapsable: false,
        children: [
          '/references/geometries/sphere', '/references/geometries/box',
          '/references/geometries/torus', '/references/geometries/line',
          '/references/geometries/cappedCylinder'
        ]
      },
      {
        title: 'Operations',
        collapsable: false,
        children: [
          '/references/operations/add',
          '/references/operations/subtract',
          '/references/operations/intersect',
          '/references/operations/smoothAdd',
          '/references/operations/mix',
        ]
      },
      {
        title: 'Lighting',
        collapsable: false,
        children: [
          '/references/lighting/simpleLighting',
          '/references/lighting/occlusion',
        ]
      },
      {
        title: 'Noise',
        collapsable: false,
        children: [
          '/references/noise/noise',
          '/references/noise/fractalNoise',
        ]
      },
      {
        title: 'Mouse Interactions',
        collapsable: false,
        children: [
          '/references/mouse-interactions/mouse',
          '/references/mouse-interactions/mouseIntersection',
        ]
      }
    ]
  }
}