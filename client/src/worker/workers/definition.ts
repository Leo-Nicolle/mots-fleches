
import { definitionSearch } from '../utils/definition-search';

onmessage = function (e) {
  const { type, data } = e.data;
  if (e.data.definitions !== undefined) {
    const { definitions } = e.data as { definitions: string; };
    definitionSearch.loadDefinitions(definitions);
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