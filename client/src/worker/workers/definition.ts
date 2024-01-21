
import { definitionSearch } from '../utils/definition-search';

onmessage = function (e) {
  const { type, data } = e.data;
<<<<<<< HEAD
  if (e.data.definitions !== undefined) {
    const { definitions } = e.data as { definitions: string; };
    definitionSearch.loadDefinitions(definitions);
=======
  if (e.data.definitions) {
    const { definitions } = e.data as { definitions: string; };
    console.time('definitions-load');
    definitionSearch.loadDefinitions(definitions);
    console.timeEnd('definitions-load');
>>>>>>> @{-1}
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