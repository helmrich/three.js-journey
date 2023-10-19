// Only necessary when using THREE.RawShaderMaterial
// precision mediump float;

uniform vec3 uColor;
uniform sampler2D uTexture;

varying vec2 vUv;
varying float vElevation;

void main() {
  vec4 textureColor = texture2D(uTexture, vUv);
  textureColor.rgb *= vElevation * 2.0 + 0.75;
  gl_FragColor = textureColor;

  // Note: gl_FragColor can be used to debug values
  // gl_FragColor = vec4(vUv, 1.0, 1.0);
}