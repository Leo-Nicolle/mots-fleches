import { CellProba, Direction, Grid, Vec } from "grid";
import EventEmitter from "eventemitter3";
import * as fflate from 'fflate';
import { api } from "../api";

export type Events = {
  'run-result': CellProba[][];
  'search-result': number[];
  'bail-result': undefined;
}

export default class SearchWorker extends EventEmitter<Events> {
  public worker: Worker;
  private busy: boolean = false;
  private queue: { type: string, data: string }[] = [];
  private flagsBuffer: SharedArrayBuffer;
  private flagsArray: Int8Array;
  private wordsBuffer: SharedArrayBuffer;
  private wordsArray: Uint8Array;

  /* setting data */
  /* sending the buffer (copy) to worker */
  constructor() {
    super();
    if (!window.isSecureContext) {
      throw new Error('Not in a secure context');
    }
    if (crossOriginIsolated) {
      this.flagsBuffer = new SharedArrayBuffer(1);
      this.flagsArray = new Int8Array(this.flagsBuffer);
      this.flagsArray[0] = 0;
      this.wordsBuffer = new SharedArrayBuffer(0);
      this.wordsArray = new Uint8Array(this.wordsBuffer);
      this.wordsArray[0] = 0;
    } else {
      throw new Error('SharedArrayBuffer is not supported');
    }

    this.worker = new Worker(new URL('./search-worker', import.meta.url), { type: 'module' });
    // this.worker.postMessage(this.sharedBuffer);
    this.worker.addEventListener('message', (evt) => this.onMessage(evt));
    this.loadWords('fr-fr');

  }

  search(grid: Grid, coords: Vec, dir: Direction) {
    this._postMessage('search',
      JSON.stringify({
        grid: grid.serialize(),
        coords, dir
      }));

  }

  run(grid: Grid) {
    this._postMessage('run', grid.serialize());
  }

  _postMessage(type: string, data: string) {
    if (this.busy) {
      this.queue.push({ type, data });
      this.flagsArray[0] = 1;
      return;
    }
    this.busy = true;
    this.flagsArray[0] = 0;
    this.worker.postMessage({ type, data });
  }

  onMessage(event: MessageEvent) {
    const { type, data } = event.data;
    console.log('message', type);
    this.busy = false;
    if (type === 'search-result') {
      this.emit('search-result', data);
    }
    if (type === 'run-result') {
      this.emit('run-result', data);
    }
    if (type === 'bail-result') {
      this.emit('bail-result');
    }

    if (this.queue.length > 0) {
      const { type, data } = this.queue[this.queue.length - 1];
      // give up all the other works
      this.queue = [];
      // this._postMessage(type, data);
    }
  }

  bail() {
    if (!this.busy) return;
    this.flagsArray[0] = 1;
  }

  destroy() {
    this.worker.terminate();
    this.removeAllListeners();
  }

  _fetchLocales(){
    return fetch('/dico.zip')
    .then((response) => response.arrayBuffer())
    .then((data) => new Promise<Record<string, string[]>>((resolve, reject) => {
      fflate.unzip(new Uint8Array(data), (err, decompressed) => {
        if (err) {
          return reject(err);
        }
        const locales = Object.entries(decompressed)
          .reduce((acc, [path, value]) => {
            const localName = path.split('/')[1];
            if (!value.length || !localName.length) return acc;
            if (!acc[localName]) { acc[localName] = []; }
            acc[localName].push(new TextDecoder().decode(value));
            return acc;
          }, {} as Record<string, string[]>);
        resolve(locales);
      });
    }));
  }

  loadWords(locale: string){
    return Promise.all([
      this._fetchLocales(),
      api.db.getWords() as Promise<string[]>
    ])
    .then(([locales, words]) => {
      words.push('COUCOU');
      words.push('CACAHOUETE');
      locales[locale]
      .forEach(locale => {
        for (let i =0; i< locale.length; i++){
          words.push(locale[i]);
        }
      });
      const encoded = new TextEncoder().encode(words.join(','));
      this.wordsBuffer = new SharedArrayBuffer(encoded.byteLength);
      this.wordsArray = new Uint8Array(this.wordsBuffer);
      for (let i = 0; i < encoded.byteLength; i++){
        this.wordsArray[i] = encoded[i];
      }
      // this.wordsArray.set(encoded);
      console.log(this.wordsArray);
      this.worker.postMessage({flags: this.flagsBuffer, words: this.wordsBuffer});
    });
  }
}