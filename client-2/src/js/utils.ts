import {Vec} from './types';


export function add(v1: Vec, v2: Vec){
  return {x: v1.x + v2.x, y: v1.y + v2.y};
}

export function subtract(v1: Vec, v2: Vec){
  return {x: v1.x - v2.x, y: v1.y - v2.y};
}

export function dot(v1: Vec, v2: Vec){
  return v1.x * v2.x +  v1.y + v2.y;
}