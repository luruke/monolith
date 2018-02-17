#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

uniform float u_morph;
uniform float u_time;
uniform float u_step;
uniform float u_force;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform sampler2D u_matcap;
uniform sampler2D u_matcap2;
uniform float u_matcapindex;
// uniform vec2 u_cameraoffset;

#define M_PI 3.1415926535897932384626433832795

const int MAX_MARCHING_STEPS = 150;
const float MAX_DIST = 8.0;
const float MIN_DIST = 2.0;
const float EPSILON = 0.001;

// https://github.com/glslify/glsl-aastep/blob/master/index.glsl
float aastep(float threshold, float value) {
  #ifdef GL_OES_standard_derivatives
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold-afwidth, threshold+afwidth, value);
  #else
    return step(threshold, value);
  #endif
}

// https://github.com/mattdesl/glsl-random/blob/master/index.glsl
float random(vec2 co)
{
    float a = 12.9898;
    float b = 78.233;
    float c = 43758.5453;
    float dt= dot(co.xy ,vec2(a,b));
    float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

//https://github.com/mattdesl/glsl-blend-soft-light/blob/master/index.glsl
// vec3 blendSoftLight(vec3 base, vec3 blend) {
//     return mix(
//         sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend),
//         2.0 * base * blend + base * base * (1.0 - 2.0 * blend),
//         step(base, vec3(0.5))
//     );
// }

mat3 rotateX(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(1, 0, 0),
        vec3(0, c, -s),
        vec3(0, s, c)
    );
}

mat3 rotateY(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(c, 0, s),
        vec3(0, 1, 0),
        vec3(-s, 0, c)
    );
}

mat3 rotateZ(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(c, -s, 0),
        vec3(s, c, 0),
        vec3(0, 0, 1)
    );
}

float sdBox( vec3 p, vec3 b )
{
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float sdTriPrism( vec3 p, vec2 h )
{
    vec3 q = abs(p);
    return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
}

float sdHexPrism( vec3 p, vec2 h )
{
    vec3 q = abs(p);
    return max(q.z-h.y,max((q.x*0.866025+q.y*0.5),q.y)-h.x);
}

float opRep( vec3 p, vec3 c )
{
  vec3 q = mod(p,c)-0.5*c;
  return sdBox( q, vec3(1.0) );
}

float smin( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float sdCapsule( vec3 p, vec3 a, vec3 b, float r )
{
    vec3 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h ) - r;
}

float sdCone( vec3 p, vec2 c )
{
    // c must be normalized
    float q = length(p.xy);
    return dot(c,vec2(q,p.z));
}

float shapex(vec3 p) {
  float time = u_time * .6;
  float xsize = 0.4;
  float x1 = sdCapsule(p, vec3(-xsize), vec3(xsize), 0.1);
  float x2 = sdCapsule(rotateX(time) * p, vec3(-xsize), vec3(xsize), 0.1);

  float sticky = .2 + 0.1 * (sin(time) + 1.0) / 2.0;
  return smin(x1, x2, sticky);
}

float shapeprism(vec3 p) {
  float time = u_time * .2;
  float prism1 = sdHexPrism(rotateZ(time * 0.2) * p, vec2(0.4 + (sin(time)*0.1), 0.1));
  float prism2 = sdHexPrism(rotateY(M_PI/2.0) * rotateX(time) * p, vec2(0.4, 0.1));
  float merge = mix(.2, .4, (sin(time*8.0) + 1.0)/2.0);

  return smin(prism1, prism2, merge);
}

float shapemeta(vec3 p) {
  float time = u_time * .6;
  float balls = sdSphere(p, 0.2);
  vec2 diff = vec2(0.0);
  float nball = 0.0;
  for (float i = 0.0; i < 5.0; i+=1.0) {
    diff = vec2(
      sin(i*3.0+time),
      cos(i+2.0*1.0-time)
    )* .5;

    nball = sdSphere(p + vec3(diff, 0.0), 0.1);
    balls = smin(balls, nball, 0.5);
  }

  return balls;
}

float shapetorus(vec3 p) {
  return sdTorus(p, vec2(0.4, 0.1));
}

float shapebox(vec3 p) {
  return sdBox(p, vec3(0.4));
}

float map(vec3 p) {
  float time = u_time * .2;
  mat3 rotation = rotateY(time) * rotateZ(time) * rotateX(time);
  vec3 rotatedP = rotation * p;

  // rotatedP = rotateX(u_cameraoffset.y * 20.0) * rotatedP;

  float r = 0.0;
  if (u_step == 0.0) {
    r = mix(shapebox(rotatedP), shapex(rotatedP), u_morph);
  } else if (u_step == 1.0) {
    r = mix(shapex(rotatedP), shapetorus(rotatedP), u_morph);
  } else if (u_step == 2.0) {
    r = mix(shapetorus(rotatedP), shapemeta(rotatedP), u_morph);
  } else if (u_step == 3.0) {
    r = mix(shapemeta(rotatedP), shapebox(rotatedP), u_morph);
  }

  vec3 spherep = p;
  spherep.xy -= u_mouse.xy;
  float sphereSize = 0.1 + (u_force * 0.05) + (sin(time * 9.0) * 0.02);
  float fusionMod = ((sin((p.x + p.y) * 200.0 + time * 30.0) + 1.0) / 2.0) * 0.006;
  float sphere = sdSphere(spherep, sphereSize);
  float sphereFusion = 0.4 + (u_force * 0.4) + (fusionMod * (sphere - r));
  r = smin(r, sphere, sphereFusion);

  return r;
}

float march(vec3 eye, vec3 dir) {
  float depth = MIN_DIST;

  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    float dist = map(eye + depth * dir);

    if (dist < EPSILON) {
      return depth;
    }

    depth += dist;

    if (depth >= MAX_DIST) {
        return MAX_DIST;
    }
  }
  return MAX_DIST;
}

vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
    vec2 xy = fragCoord - size / 2.0;
    float z = size.y / tan(radians(fieldOfView) / 2.0);
    return normalize(vec3(xy, -z));
}

mat4 viewMatrix(vec3 eye, vec3 center, vec3 up) {
    vec3 f = normalize(center - eye);
    vec3 s = normalize(cross(f, up));
    vec3 u = cross(s, f);
    return mat4(
        vec4(s, 0.0),
        vec4(u, 0.0),
        vec4(-f, 0.0),
        vec4(0.0, 0.0, 0.0, 1)
    );
}

// https://github.com/glslify/glsl-sdf-normal/blob/master/index.glsl
vec3 calcNormal(vec3 p) {
  float eps = 0.001;
  const vec3 v1 = vec3( 1.0,-1.0,-1.0);
  const vec3 v2 = vec3(-1.0,-1.0, 1.0);
  const vec3 v3 = vec3(-1.0, 1.0,-1.0);
  const vec3 v4 = vec3( 1.0, 1.0, 1.0);

  return normalize( v1 * map( p + v1*eps ) +
                    v2 * map( p + v2*eps ) +
                    v3 * map( p + v3*eps ) +
                    v4 * map( p + v4*eps ) );
}


// // https://www.shadertoy.com/view/Xsd3Rs
// float hash( float n ){
// 	return fract(sin(n)*3538.5453);
// }

// float calcAO( in vec3 p, in vec3 n, float maxDist, float falloff ){
// 	float ao = 0.0;
// 	const int nbIte = 6;
// 	for( int i=0; i<nbIte; i++ )
// 	{
// 		float l = hash(float(i))*maxDist;
// 		vec3 rd = n*l;
// 		ao += (l - map( p + rd )) / pow(1.+l, falloff);
// 	}
// 	return clamp( 1.-ao/float(nbIte), 0., 1.);
// }


float grain(vec2 uv) {
  return random(uv + vec2(u_time, u_time * 0.3)) * 0.04;
}

vec3 background(vec2 uv) {
  vec2 q = vec2(uv - 0.5);

  float dst = length(q);
  vec2 smooth = vec2(0.0, 1.0);
  dst = smoothstep(smooth.x, smooth.y, dst);
  vec3 color = mix(vec3(0.2), vec3(0.0), dst);

  color += grain(uv) * 0.8;

  return color;
}


// https://www.shadertoy.com/view/4scSW4
float fresnel(float bias, float scale, float power, vec3 I, vec3 N)
{
    return bias + scale * pow(1.0 + dot(I, N), power);
}

vec3 getTexture(vec2 uv) {
  return mix(
    texture2D(u_matcap, uv).rgb,
    texture2D(u_matcap2, uv).rgb,
    u_matcapindex
  );
}

void main()
{
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec3 viewDir = rayDirection(45.0, u_resolution.xy, gl_FragCoord.xy);
  vec3 eye = vec3(0.0, 1.0, 4.0);

  // eye.xy += u_mouse.xy;
  // eye.x += u_cameraoffset.y * 30.0;
  // eye.y += u_cameraoffset.x * 30.0;

  mat4 viewToWorld = viewMatrix(eye, vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
  vec3 worldDir = (viewToWorld * vec4(viewDir, 0.0)).xyz;
  float dist = march(eye, worldDir);
  vec3 bg = background(uv);

  if (dist > MAX_DIST - EPSILON) {
    gl_FragColor = vec4(bg, 1.0);
    return;
  }

  vec3 pos = eye + dist * worldDir;
  vec3 nor = calcNormal(pos);

  // Matcap
  vec3 r = reflect(worldDir, nor);
  float m = 2.82842712474619 * sqrt( r.z+1.01 );
  vec2 vN = r.xy / m + .5;

  vec3 color = getTexture(vN);

  // Fog
  float dd = distance(eye, pos);
  float start = 4.2;
  float end = 6.0;
  float fog = 1.0 - clamp((end - dd) / (end - start), 0.0, 1.0);
  color = mix(color, bg, fog);

  // Fresnel
  vec3 I = normalize(pos - eye);
  float R = fresnel(0.0, 0.4, 3.2, I, nor);
  R =  pow(R, 0.6);
  color = mix(color, bg, R);

  // Grain fx
  color += grain(uv);

  gl_FragColor = vec4(color, 1.0);
}
