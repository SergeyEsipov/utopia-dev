"use client";
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  LiquidGlassButton: () => LiquidGlassButton,
  cn: () => cn,
  generateGlassMaps: () => generateGlassMaps,
  getCachedGlassMaps: () => getCachedGlassMaps,
  revokeGlassMaps: () => revokeGlassMaps
});
module.exports = __toCommonJS(index_exports);

// src/liquid-glass-button.tsx
var import_react = require("react");
var import_gsap = __toESM(require("gsap"), 1);

// src/utils.ts
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// src/generate-displacement-map.ts
var VERT = `attribute vec4 position; void main(){ gl_Position = position; }`;
var FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uRadius;
uniform float uBorderSoftness;
uniform float uSpecularWidth;
uniform int uMode; // 0 = displacement, 1 = specular

float sdRoundedBox(vec2 p, vec2 b, float r){
  r = min(r, min(b.x, b.y));
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec3 calcNormal(vec2 p, vec2 b, float r){
  float e = max(0.5, min(b.x, b.y) * 0.01);
  vec2 h = vec2(e, 0.0);
  return normalize(vec3(
    sdRoundedBox(p+h.xy, b, r) - sdRoundedBox(p-h.xy, b, r),
    sdRoundedBox(p+h.yx, b, r) - sdRoundedBox(p-h.yx, b, r),
    -e * 2.0
  ));
}

void main(){
  vec2 p = gl_FragCoord.xy - uRes * 0.5;
  vec2 halfSize = uRes * 0.5 - 1.0;
  float d = sdRoundedBox(p, halfSize, uRadius);

  if(d > 0.0){ gl_FragColor = vec4(0.0); return; }

  if(uMode == 0){
    vec3 n = calcNormal(p, halfSize, uRadius);
    vec3 nc = n * 0.5 + 0.5;
    float border = smoothstep(-uBorderSoftness, 0.0, d);
    vec3 flat_ = vec3(0.5, 0.5, 1.0);
    gl_FragColor = vec4(mix(flat_, nc, border), 1.0);
  } else {
    float rim = smoothstep(-uSpecularWidth - 2.0, -uSpecularWidth, d)
              * (1.0 - smoothstep(-2.0, 0.0, d));
    float glow = smoothstep(-uBorderSoftness, 0.0, d) * 0.1;
    float s = clamp(rim + glow, 0.0, 1.0);
    gl_FragColor = vec4(vec3(s), s);
  }
}
`;
function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}
var _cachedProgram = null;
function getGL() {
  if (_cachedProgram) return _cachedProgram;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, premultipliedAlpha: false });
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  _cachedProgram = { gl, program, canvas };
  return _cachedProgram;
}
var _mapCache = /* @__PURE__ */ new Map();
function cacheKey(w, h, r, bs, sw) {
  return `${w}|${h}|${r}|${bs}|${sw}`;
}
function renderToBlob(width, height, radius, borderSoftness, specularWidth, mode) {
  const { gl, program, canvas } = getGL();
  canvas.width = width;
  canvas.height = height;
  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniform2f(gl.getUniformLocation(program, "uRes"), width, height);
  gl.uniform1f(gl.getUniformLocation(program, "uRadius"), radius);
  gl.uniform1f(gl.getUniformLocation(program, "uBorderSoftness"), borderSoftness);
  gl.uniform1f(gl.getUniformLocation(program, "uSpecularWidth"), specularWidth);
  gl.uniform1i(gl.getUniformLocation(program, "uMode"), mode);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob));
    }, "image/png");
  });
}
async function generateGlassMaps(opts) {
  const {
    width,
    height,
    radius = 60,
    edgeSize = 30,
    intensity = 0.7,
    specularWidth = 0.02,
    quality = 2
  } = opts;
  const scale = Math.max(1, Math.round(quality));
  const rw = width * scale;
  const rh = height * scale;
  const r = Math.min(radius * scale, rw / 2, rh / 2);
  const borderSoftness = edgeSize * intensity * scale;
  const specPx = specularWidth * Math.min(rw, rh);
  const key = cacheKey(rw, rh, r, borderSoftness, specPx);
  const cached = _mapCache.get(key);
  if (cached) return cached;
  const [displacement, specular] = await Promise.all([
    renderToBlob(rw, rh, r, borderSoftness, specPx, 0),
    renderToBlob(rw, rh, r, borderSoftness, specPx, 1)
  ]);
  const result = { displacement, specular };
  _mapCache.set(key, result);
  return result;
}
function getCachedGlassMaps(opts) {
  var _a;
  const {
    width,
    height,
    radius = 60,
    edgeSize = 30,
    intensity = 0.7,
    specularWidth = 0.02,
    quality = 2
  } = opts;
  const scale = Math.max(1, Math.round(quality));
  const rw = width * scale;
  const rh = height * scale;
  const r = Math.min(radius * scale, rw / 2, rh / 2);
  const borderSoftness = edgeSize * intensity * scale;
  const specPx = specularWidth * Math.min(rw, rh);
  return (_a = _mapCache.get(cacheKey(rw, rh, r, borderSoftness, specPx))) != null ? _a : null;
}
function revokeGlassMaps(maps) {
  URL.revokeObjectURL(maps.displacement);
  URL.revokeObjectURL(maps.specular);
}

// src/liquid-glass-button.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var LiquidGlassButton = (0, import_react.forwardRef)(
  function LiquidGlassButton2(_a, ref) {
    var _b = _a, {
      children,
      className,
      style,
      width = 300,
      height = 56,
      radius = 60,
      edgeSize = 30,
      intensity = 0.7,
      specularWidth = 0.02,
      displacement = 55,
      blur = 1,
      saturation = 150,
      brightness = 1.1,
      glassColor = "transparent",
      hoverScale = 1.08,
      hoverDisplacement = 125,
      hoverBlur = 4,
      hoverDuration = 0.25,
      disableAnimation = false,
      quality = 2
    } = _b, props = __objRest(_b, [
      "children",
      "className",
      "style",
      "width",
      "height",
      "radius",
      "edgeSize",
      "intensity",
      "specularWidth",
      "displacement",
      "blur",
      "saturation",
      "brightness",
      "glassColor",
      "hoverScale",
      "hoverDisplacement",
      "hoverBlur",
      "hoverDuration",
      "disableAnimation",
      "quality"
    ]);
    const internalRef = (0, import_react.useRef)(null);
    const buttonRef = ref != null ? ref : internalRef;
    const displacerRef = (0, import_react.useRef)(null);
    const blurRef = (0, import_react.useRef)(null);
    const filterId = "lg" + (0, import_react.useId)().replace(/:/g, "");
    const mapOpts = { width, height, radius, edgeSize, intensity, specularWidth, quality };
    const [maps, setMaps] = (0, import_react.useState)(
      () => getCachedGlassMaps(mapOpts)
    );
    (0, import_react.useEffect)(() => {
      const cached = getCachedGlassMaps(mapOpts);
      if (cached) {
        setMaps(cached);
        return;
      }
      let cancelled = false;
      generateGlassMaps(mapOpts).then((m) => {
        if (!cancelled) setMaps(m);
      });
      return () => {
        cancelled = true;
      };
    }, [width, height, radius, edgeSize, intensity, specularWidth, quality]);
    (0, import_react.useEffect)(() => {
      return () => {
        if (maps) revokeGlassMaps(maps);
      };
    }, [maps]);
    (0, import_react.useEffect)(() => {
      const button = buttonRef.current;
      const displacer = displacerRef.current;
      const blurEl = blurRef.current;
      if (!button || !displacer || !blurEl || disableAnimation) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const fx = {
        displacement,
        blur
      };
      const sync = () => {
        displacer.setAttribute("scale", fx.displacement.toString());
        blurEl.setAttribute("stdDeviation", fx.blur.toString());
      };
      sync();
      const onEnter = () => {
        import_gsap.default.killTweensOf([fx, button]);
        import_gsap.default.to(fx, {
          displacement: hoverDisplacement,
          blur: hoverBlur,
          duration: hoverDuration,
          ease: "back.out(1.4)",
          onUpdate: sync
        });
        import_gsap.default.to(button, {
          scale: hoverScale,
          duration: hoverDuration,
          ease: "back.out(1.4)"
        });
      };
      const onLeave = () => {
        import_gsap.default.killTweensOf([fx, button]);
        import_gsap.default.to(fx, {
          displacement,
          blur,
          duration: hoverDuration,
          ease: "power2.out",
          onUpdate: sync
        });
        import_gsap.default.to(button, {
          scale: 1,
          duration: hoverDuration,
          ease: "power2.out"
        });
      };
      const onClick = () => {
        import_gsap.default.killTweensOf(button);
        const cur = import_gsap.default.getProperty(button, "scale");
        import_gsap.default.timeline().to(button, { scale: cur * 0.92, duration: 0.08, ease: "power2.in" }).to(button, { scale: hoverScale, duration: 0.25, ease: "back.out(2)" });
      };
      button.addEventListener("pointerenter", onEnter);
      button.addEventListener("pointerleave", onLeave);
      button.addEventListener("click", onClick);
      return () => {
        button.removeEventListener("pointerenter", onEnter);
        button.removeEventListener("pointerleave", onLeave);
        button.removeEventListener("click", onClick);
        import_gsap.default.killTweensOf([button, fx]);
      };
    }, [buttonRef, maps, displacement, blur, hoverScale, hoverDisplacement, hoverBlur, hoverDuration, disableAnimation]);
    if (!maps) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        __spreadProps(__spreadValues({
          ref: buttonRef,
          className: cn("relative overflow-hidden shadow-lg cursor-pointer", className),
          style: __spreadValues({ width, height, borderRadius: radius, border: "none", background: glassColor }, style)
        }, props), {
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "div",
              {
                className: "absolute inset-0",
                style: {
                  backdropFilter: `url(#${filterId}) brightness(${brightness * 100}%)`,
                  WebkitBackdropFilter: `url(#${filterId}) brightness(${brightness * 100}%)`,
                  borderRadius: "inherit",
                  willChange: "backdrop-filter",
                  transform: "translateZ(0)"
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "div",
              {
                className: "absolute inset-0 inline-flex items-center justify-center font-bold text-white",
                style: { background: "hsl(0 100% 100% / 15%)", borderRadius: "inherit" },
                children
              }
            )
          ]
        })
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "svg",
        {
          colorInterpolationFilters: "sRGB",
          style: { position: "absolute", width: 0, height: 0, overflow: "hidden" },
          "aria-hidden": "true",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("filter", { id: filterId, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "feGaussianBlur",
              {
                ref: blurRef,
                in: "SourceGraphic",
                stdDeviation: blur,
                result: "blurred_source"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "feImage",
              {
                href: maps.displacement,
                x: "0",
                y: "0",
                width,
                height,
                result: "displacement_map"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "feDisplacementMap",
              {
                ref: displacerRef,
                in: "blurred_source",
                in2: "displacement_map",
                scale: displacement,
                xChannelSelector: "R",
                yChannelSelector: "G",
                result: "displaced"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "feColorMatrix",
              {
                in: "displaced",
                type: "saturate",
                result: "displaced_saturated",
                values: saturation.toString()
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "feImage",
              {
                href: maps.specular,
                x: "0",
                y: "0",
                width,
                height,
                result: "specular_layer"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "feGaussianBlur",
              {
                in: "specular_layer",
                stdDeviation: "1",
                result: "blurred_specular_layer"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "feComposite",
              {
                in: "displaced_saturated",
                in2: "blurred_specular_layer",
                operator: "in",
                result: "final_specular_layer"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "feBlend",
              {
                in: "final_specular_layer",
                in2: "displaced",
                mode: "normal"
              }
            )
          ] }) })
        }
      )
    ] });
  }
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LiquidGlassButton,
  cn,
  generateGlassMaps,
  getCachedGlassMaps,
  revokeGlassMaps
});
//# sourceMappingURL=index.cjs.map