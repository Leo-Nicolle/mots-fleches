import { CellProba, Direction, Grid, Vec } from "grid";
import EventEmitter from "eventemitter3";
import * as fflate from 'fflate';
import { api } from "../api";

export type Events = {
  'run-result': CellProba[][];
  'search-result': string[];
  'bail-result': undefined;
}

class WorkerController extends EventEmitter<Events> {
  public searchWorker: Worker;
  public probaWorker: Worker;
  private busy: boolean[] = [false, false];
  private queues: { type: string, data: string }[][] = [[], []];
  private flagsBuffer: SharedArrayBuffer;
  private flagsArray: Uint8Array;
  private wordsBuffer: SharedArrayBuffer;
  private wordsArray: Uint8Array;
  private searchWorkerId = 0;
  private probaWorkerId = 1;

  /* setting data */
  /* sending the buffer (copy) to worker */
  constructor() {
    super();
    if (!window.isSecureContext) {
      throw new Error('Not in a secure context');
    }
    if (crossOriginIsolated) {
      this.flagsBuffer = new SharedArrayBuffer(1);
      this.flagsArray = new Uint8Array(this.flagsBuffer);
      this.flagsArray[0] = 0;
      this.wordsBuffer = new SharedArrayBuffer(1);
      this.wordsArray = new Uint8Array(this.wordsBuffer);
      this.wordsArray[0] = 0;
    } else {
      throw new Error('SharedArrayBuffer is not supported');
    }
    this.searchWorker = new Worker(new URL('./worker', import.meta.url), { type: 'module' });
    this.probaWorker = new Worker(new URL('./worker', import.meta.url), { type: 'module' });

    // this.worker.postMessage(this.sharedBuffer);
    this.searchWorker.addEventListener('message', (evt) => this.onMessage(this.searchWorkerId, evt));
    this.probaWorker.addEventListener('message', (evt) => this.onMessage(this.probaWorkerId, evt));
    this.loadWords('fr-fr');
  }

  search(grid: Grid, coords: Vec, dir: Direction) {
    this._postMessage('search',
      JSON.stringify({
        grid: grid.serialize(),
        coords, dir
      }), this.searchWorkerId);
  }

  run(grid: Grid) {
    this._postMessage('run', grid.serialize(), this.probaWorkerId);
  }

  _postMessage(type: string, data: string, workerId: number) {
    if (this.busy[workerId]) {
      this.queues[workerId].push({ type, data });
      this.flagsArray[0] = 1;
      return;
    }
    this.busy[workerId] = true;
    this.flagsArray[0] = 0;
    const ww = workerId === this.probaWorkerId ? this.probaWorker : this.searchWorker;
    ww.postMessage({ type, data });
  }

  onMessage(workerId: number, event: MessageEvent) {
    const { type, data } = event.data;
    this.busy[workerId] = false;
    if (type === 'search-result') {
      this.emit('search-result', data);
    }
    if (type === 'run-result') {
      this.emit('run-result', data);
    }
    if (type === 'bail-result') {
      this.emit('bail-result');
    }
    const queue = this.queues[workerId];
    if (queue.length > 0) {
      const { type, data } = queue[queue.length - 1];
      // give up all the other works
      this.queues[workerId] = [];
    }
  }

  bail() {
    if (!this.busy[this.probaWorkerId]) return;
    this.flagsArray[0] = 1;
  }

  destroy() {
    this.probaWorker.terminate();
    this.searchWorker.terminate();
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
            acc[localName].push(new TextDecoder().decode(value).trim());
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
      locales[locale]
      .forEach(locale => {
        const wordsInLocale = locale.split(',');
        for (let i =0; i< wordsInLocale.length; i++){
          words.push(wordsInLocale[i]);
        }
      });
      const encoded = new TextEncoder().encode(words.join(','));
      this.wordsBuffer = new SharedArrayBuffer(encoded.byteLength);
      this.wordsArray = new Uint8Array(this.wordsBuffer);
      for (let i = 0; i < encoded.byteLength; i++){
        this.wordsArray[i] = encoded[i];
      }
      this.searchWorker.postMessage({flags: this.flagsBuffer, words: this.wordsBuffer});
      this.probaWorker.postMessage({flags: this.flagsBuffer, words: this.wordsBuffer});
    });
  }
}

export const workerController = new WorkerController();