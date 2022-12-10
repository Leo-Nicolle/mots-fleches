

export function getUrl(param: string) {
  return `http://localhost:${process.env.VUE_APP_APIPORT}/${param}`;
}