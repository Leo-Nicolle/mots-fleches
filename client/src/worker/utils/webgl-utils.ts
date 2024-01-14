export type FBO = {
  handle: WebGLFramebuffer;
  texture: WebGLTexture;
};
export type Uniform = {
  type: GLint;
  size: number;
  value: number[] | number | WebGLTexture;
  location: WebGLUniformLocation;
};
export type Attribute = {
  buffer: WebGLBuffer;
  value: ArrayBuffer;
  location: GLint;
};
export type Texture = {
  width: number;
  height: number;
  data: ArrayBufferView;
  // handle for the texture
  texture: WebGLTexture;
  type: GLenum;
  format: GLenum;
};
const typeToBind = {
  // gl.FLOAT,
  5126: 'uniform1f',
  // gl.FLOAT_VEC2,
  35664: 'uniform2fv',
  // gl.FLOAT_VEC3,
  35665: 'uniform3fv',
  // gl.FLOAT_VEC4,
  35666: 'uniform4fv',
  // gl.INT,
  5124: 'uniform1i',
  // gl.INT_VEC2,
  35667: 'uniform2iv',
  // gl.INT_VEC3,
  35668: 'uniform3iv',
  // gl.INT_VEC4,
  35669: 'uniform4iv',
  // gl.FLOAT_MAT2,
  35674: 'uniformMatrix2fv',
  // gl.FLOAT_MAT3,
  35675: 'uniformMatrix3fv',
  // gl.FLOAT_MAT4,
  35676: 'uniformMatrix4fv',
  // gl.SAMPLER_2D,
  35678: 'uniform1i',
  // gl.SAMPLER_CUBE
  35680: 'uniform1i'
};

export function createProgram(
  gl: WebGL2RenderingContext,
  shaders: [string, string]
) {
  const program = gl.createProgram();
  if (!program) throw new Error('Could not create program');
  shaders.forEach((source, i) => {
    const shader = gl.createShader(
      i === 0 ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER
    );
    if (!shader) throw new Error('Could not create shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      throw `Could not compile WebGL program. \n\n${info}`;
    }
    gl.attachShader(program, shader);
  });
  gl.linkProgram(program);
  // Check the link status
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    // something went wrong with the link
    const lastError = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error('Error in program linking:' + lastError);
  }
  return program;
}

export function createTexture(
  gl: WebGL2RenderingContext,
  {
    data,
    width,
    height,
    type,
    format
  }: {
    data: ArrayBufferView;
    width: number;
    height: number;
    type: GLenum;
    format: GLenum;
  }
): Texture {
  const empty = width * height === 0;
  const tex = gl.createTexture();
  if (!tex) throw new Error('Could not create texture');
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0, 
    format, // internal format
    empty ? 1 : width,
    empty ? 1 : height,
    0, 
    format,
    type, // type
    empty ? new Float32Array(4) : data
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return {
    texture: tex,
    width,
    height,
    data,
    type: gl.FLOAT,
    format: gl.RGBA
  };
}

export function createFrameBuffer(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture
): FBO {
  const handle = gl.createFramebuffer();
  if (!handle) throw new Error('Could not create framebuffer');
  gl.bindFramebuffer(gl.FRAMEBUFFER, handle);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );
  return {
    handle,
    texture
  };
}
export function createUniforms(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  uniforms: Record<string, any>
) {
  gl.useProgram(program);
  const res = {} as Record<string, Uniform>;
  const nbUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < nbUniforms; i++) {
    const { name, size, type }: { name: string; size: number; type: GLint } =
      gl.getActiveUniform(program, i) as WebGLActiveInfo;
    const location = gl.getUniformLocation(program, name);
    if (!location) throw new Error(`Could not get location for ${name}`);
    res[name] = {
      size,
      value: uniforms[name],
      type,
      location
    };
  }
  return res;
}
export function bindUniforms(
  gl: WebGL2RenderingContext,
  uniforms: Record<string, Uniform>,
  newValues: Record<string, number[] | number | WebGLTexture>
): void {
  let textureCount = 0;
  return Object.entries(uniforms).forEach(
    ([key, { location, type, value }]) => {
      let newValue = newValues[key] !== undefined ? newValues[key] : value;
      if (type === gl.SAMPLER_2D) {
        gl.activeTexture(gl.TEXTURE0 + textureCount);
        gl.bindTexture(gl.TEXTURE_2D, newValue);
        newValue = textureCount;
        textureCount++;
      }
      // @ts-ignore
      gl[typeToBind[type]](location, newValue);
    }
  );
}

export function createAttributeLocs(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  attributes: Record<string, ArrayBuffer>
) {
  return Object.entries(attributes).reduce((acc, [key, value]) => {
    const buffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, value, gl.STATIC_DRAW);
    acc[key] = {
      buffer,
      value,
      location: gl.getAttribLocation(program, key)
    };
    return acc;
  }, {} as Record<string, Attribute>);
}
