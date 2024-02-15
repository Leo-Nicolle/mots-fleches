import {bindUniforms, createAttributeLocs, createProgram, createUniforms} from '../utils/webgl-utils';
import vert from '../shaders/vertex.vert';
import frag from '../shaders/fragment.frag';
const w = 256;
export class WebGLWorker{
  private _canvas: HTMLCanvasElement;
  private _gl: WebGL2RenderingContext;
  private _program: WebGLProgram;
  private _attributes: Record<string, any>;
  private _uniforms: Record<string, any>;

  constructor(canvas ? : HTMLCanvasElement){
    this._canvas = canvas || document.createElement("canvas");
    this._canvas.width = w;
    this._canvas.height = w;
    this._gl = this._canvas.getContext("webgl2") as WebGL2RenderingContext;
    this._program = createProgram(this._gl, [vert, frag]);
    const pixels = new Float32Array(w * w * 4);
    // const framebuffers = [outputTexture, bodyTexture].map(({ texture }) =>
    //   createFrameBuffer(gl, texture)
    // );
    // functions computing the simulation and drawing the result on the current FBO
    this._attributes = createAttributeLocs(this._gl, this._program, {
      position: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
    });
  
    this._uniforms = createUniforms(this._gl, this._program, {
      
    });
    this._gl.viewport(0, 0, w, w);
    
  }
  
  
  frame(){
    const {_gl: gl, _program: program, _uniforms: uniforms, _attributes: attributes } = this;
    // gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[i].handle);
    gl.viewport(0, 0, w, w);
    // gl.viewport(0, 0, bodyTexture.width, bodyTexture.height);
    gl.bindBuffer(gl.ARRAY_BUFFER, attributes.position.buffer);
    gl.enableVertexAttribArray(attributes.position.location);
    gl.vertexAttribPointer(
      attributes.position.location,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.useProgram(program);
    bindUniforms(gl, uniforms, { color: [1, 0, 0, 1] });
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }







}