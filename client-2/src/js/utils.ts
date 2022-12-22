import axios from "axios";
import {Grid} from "../grid";
import { NIcon } from "naive-ui";
import { h,  Component } from "vue";


export function getUrl(param: string) {
  return `http://localhost:${process.env.VUE_APP_APIPORT}/${param}`;
}

export function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

export function save(grid: Grid){
  console.log('save');
  return axios.post(getUrl("grid"), {
    grid: grid.serialize(),
  });
}