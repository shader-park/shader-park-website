import * as THREE from 'three';
import * as loadFont from 'load-bmfont'

// A utility to load a font, then a texture
export const loadFonts = (opt, cb) => {
  console.log(loadFont);
  loadFont.default(opt.font, function (err, font) {
    if (err) throw err
    THREE.ImageUtils.loadTexture(opt.image, undefined, function (tex) {
      cb(font, tex)
    })
  })
};
