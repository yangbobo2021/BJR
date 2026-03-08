// web/app/home/player/visualizer/gl.ts
function shaderTypeName(gl: WebGL2RenderingContext, type: number): string {
  if (type === gl.VERTEX_SHADER) return "VERTEX";
  if (type === gl.FRAGMENT_SHADER) return "FRAGMENT";
  return `UNKNOWN(${type})`;
}

function numberSourceLines(source: string): string {
  return source
    .split("\n")
    .map((line, idx) => `${String(idx + 1).padStart(3, " ")}| ${line}`)
    .join("\n");
}

export function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("createShader failed");

  gl.shaderSource(sh, source);
  gl.compileShader(sh);

  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const typeName = shaderTypeName(gl, type);
    const infoLog = (gl.getShaderInfoLog(sh) || "").trim();
    const numberedSource = numberSourceLines(source);
    const err = new Error(
      `shader compile failed (${typeName}): ${infoLog || "empty info log"}`,
    );

    console.error(`[gl] ${typeName} shader compile failed`, {
      infoLog: infoLog || null,
      source,
      numberedSource,
    });

    gl.deleteShader(sh);
    throw err;
  }

  return sh;
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string,
) {
  let vs: WebGLShader | null = null;
  let fs: WebGLShader | null = null;

  try {
    vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const p = gl.createProgram();
    if (!p) throw new Error("createProgram failed");

    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);

    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const infoLog = (gl.getProgramInfoLog(p) || "").trim();

      console.error("[gl] program link failed", {
        infoLog: infoLog || null,
        vsSource,
        fsSource,
        numberedVsSource: numberSourceLines(vsSource),
        numberedFsSource: numberSourceLines(fsSource),
      });

      gl.deleteProgram(p);
      throw new Error(`program link failed: ${infoLog || "empty info log"}`);
    }

    return p;
  } finally {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
  }
}

export function makeFullscreenTriangle(gl: WebGL2RenderingContext) {
  // Fullscreen triangle (no indices)
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  // positions only; vertex shader expands
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );

  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return { vao, buf };
}
