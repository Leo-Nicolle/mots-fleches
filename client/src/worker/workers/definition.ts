
import { definitionSearch } from '../utils/definition-search';

onmessage = function (e) {
  const { type, data } = e.data;
  console.log(e.data);
  if (e.data.definitions) {
    const { definitions } = e.data as { definitions: string; };
    console.log('start defs load');
    console.time('definitions-load');
    definitionSearch.loadDefinitions(definitions);
    console.timeEnd('definitions-load');
    return this.postMessage({ type: 'loaded' });
  }
  if (type === 'searchdefinition') {
    const res = definitionSearch.getDefinitions(JSON.parse(data));
    postMessage({ type: 'searchdefinition-result', data: res });
  }
  if (type === 'setuserdefinitions') {
    definitionSearch.setUserDefinitions(JSON.parse(data));
    postMessage({ type: 'setuserdefinitions-result' });
  }
};