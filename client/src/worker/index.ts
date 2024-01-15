import { CellProba, Direction, Grid, GridValidity, Vec } from "grid";
import EventEmitter from "eventemitter3";
import * as fflate from 'fflate';
import { api } from "../api";
import { copyCellProbas } from "./utils/heatmap";

export type Events = {
  'run-result': CellProba[][];
  'search-result': string[];
  'autofill-result': Grid;
  'bail-result': undefined;
  'locale-changed': undefined;
  'start-locale-change': undefined;
  'searchword-result': string[];
  'searchdefinition-result': ({ title: string, text: string; }[]);
  'setuserdefinition-done': undefined;
  'check-result': GridValidity;
};

class WorkerController extends EventEmitter<Events> {
  public searchWorker: Worker;
  public suggestionWorker: Worker;
  public definitionWorker: Worker;
  private busy: boolean[] = [false, false];
  private queues: { type: string, data: string; }[][] = [[], [], []];
  private flagsBuffer: SharedArrayBuffer;
  private flagsArray: Uint8Array;
  private distribution: [number, number][];
  private searchWorkerId = 0;
  private suggestionWorkerId = 1;
  private definitionWorkerId = 2;
  private locale = '';
  public loadingPromise;

  /* setting data */
  /* sending the buffer (copy) to worker */
  constructor(locale = 'fr-fr') {
    super();
    this.loadingPromise = new Promise(resolve => setTimeout(resolve, 1000));
    if (!window.isSecureContext) {
      throw new Error('Not in a secure context');
    }
    if (crossOriginIsolated) {
      this.flagsBuffer = new SharedArrayBuffer(1);
      this.flagsArray = new Uint8Array(this.flagsBuffer);
      this.flagsArray[0] = 0;
    } else {
      throw new Error('SharedArrayBuffer is not supported');
    }
    this.distribution = [];
    this.searchWorker = new Worker(new URL('./workers/search', import.meta.url), { type: 'module' });
    this.suggestionWorker = new Worker(new URL('./workers/suggestion', import.meta.url), { type: 'module' });
    this.definitionWorker = new Worker(new URL('./workers/definition', import.meta.url), { type: 'module' });
    this.searchWorker.addEventListener('message', (evt) => this.onMessage(this.searchWorkerId, evt));
    this.suggestionWorker.addEventListener('message', (evt) => this.onMessage(this.suggestionWorkerId, evt));
    this.definitionWorker.addEventListener('message', (evt) => this.onMessage(this.definitionWorkerId, evt));
    this.setLocale(locale);
  }

  search(grid: Grid, coords: Vec, dir: Direction) {
    this._postMessage('search',
      JSON.stringify({
        grid: grid.serialize(),
        coords, dir
      }), this.searchWorkerId);
  }

  getDistribution() {
    return this.loadingPromise.then(() => this.distribution);
  }

  checkGrid(grid: Grid) {
    this._postMessage('check', grid.serialize(), this.searchWorkerId);
  }

  run(grid: Grid) {
    this._postMessage('run', grid.serialize(), this.suggestionWorkerId);
  }

  autofill(grid: Grid, words: string[]) {
    this.loadingPromise.then(() => {
      //   const data = autoFill(grid, words);
      //   this.emit('autofill-result', Grid.unserialize(data));
      this._postMessage('autofill', JSON.stringify({
        grid: grid.serialize(),
        words
      }), this.suggestionWorkerId);
    });
  }

  searchWord(query: string) {
    this.loadingPromise.then(() => {
      this._postMessage('searchword', query, this.searchWorkerId);
    });
  }

  searchDefinition(query: string[]) {
    this.loadingPromise.then(() => {
      this._postMessage('searchdefinition', JSON.stringify(query), this.definitionWorkerId);
    });
  }
  setUserDefinitions(userDefinitions: Map<string, Set<string>>) {
    this.loadingPromise.then(() => {
      const data = JSON.stringify(Array.from(userDefinitions.entries())
        .map(([key, value]) => [key, Array.from(value.keys())]));
      this._postMessage('setuserdefinitions', data, this.definitionWorkerId);
    });
  }

  _postMessage(type: string, data: string, workerId: number) {
    if (this.busy[workerId]) {
      this.queues[workerId].push({ type, data });
      this.flagsArray[0] = 1;
      return;
    }
    this.busy[workerId] = true;
    this.flagsArray[0] = 0;
    console.log('post message', type, workerId);
    const ww = workerId === this.suggestionWorkerId
      ? this.suggestionWorker
      : workerId === this.searchWorkerId
        ? this.searchWorker
        : this.definitionWorker;
    this.loadingPromise.then(() => {
      ww.postMessage({ type, data });
    });

  }

  onMessage(workerId: number, event: MessageEvent) {
    const { type, data } = event.data;
    this.busy[workerId] = false;
    // if (type === 'loaded') {
    //   this.emit('locale-changed');
    // }
    if (type === 'search-result') {
      this.emit('search-result', data);
    }
    if (type === 'check-result') {
      this.emit('check-result', data);
    }
    if (type === 'run-result') {
      copyCellProbas(data);
      this.emit('run-result', data);
    }
    if (type === 'autofill-result') {
      this.emit('autofill-result', Grid.unserialize(data));
    }
    if (type === 'bail-result') {
      this.emit('bail-result');
    }
    if (type == 'searchword-result') {
      this.emit('searchword-result', data);
    }
    if (type == 'searchdefinition-result') {
      this.emit('searchdefinition-result', data);
    }
    if (type == 'setuserdefinitions-result') {
      this.emit('setuserdefinition-done');
    }
    const queue = this.queues[workerId];
    const job = queue.shift();
    if (!job) return;
    // remove all jobs of the same type
    this.queues[workerId] = queue.filter(q => q.type !== job.type);
    this._postMessage(job.type, job.data, workerId);
  }

  destroy() {
    this.suggestionWorker.terminate();
    this.searchWorker.terminate();
    this.removeAllListeners();
  }

  private _fetchLocales() {
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

  private promisifiedCall<T>(data: any, workerId: number, event: string) {
    const worker = workerId === this.suggestionWorkerId
      ? this.suggestionWorker
      : workerId === this.searchWorkerId
        ? this.searchWorker
        : this.definitionWorker;
    return new Promise<T>((resolve) => {
      const listenner = (evt: MessageEvent) => {
        if (evt.data.type === event) {
          worker.removeEventListener('message', listenner);
          resolve(evt.data.data);
        }
      };
      worker.addEventListener('message', listenner);
      worker.postMessage(data);
    });
  }

  setLocale(locale: string) {
    if (this.locale === locale) return this.loadingPromise
      .then(() => {
        this.emit('locale-changed');
      });
    this.locale = locale;
    this.emit('start-locale-change');
    this.loadingPromise = Promise.all([
      this._fetchLocales(),
      api.db.getWords() as Promise<string[]>,
      api.db.getBannedWords() as Promise<string[]>,
      api.getDefinitions() as Promise<string>
    ])
      .then(([locales, words, bannedWords, definitions]) => {
        locales[locale]
          .forEach(locale => {
            const wordsInLocale = locale.split(',');
            for (let i = 0; i < wordsInLocale.length; i++) {
              words.push(wordsInLocale[i]);
            }
          });
        // debugDico.load(words);
        return Promise.all([
          this.promisifiedCall({
            words, bannedWords
          }, this.searchWorkerId, 'loaded'),
          this.promisifiedCall({
            words, flags: this.flagsBuffer,
            bannedWords
          }, this.suggestionWorkerId, 'loaded'),
          this.promisifiedCall({
            definitions
          }, this.definitionWorkerId, 'loaded'),
        ])
          .then(() => this.promisifiedCall<[number, number][]>({
            type: 'distribution'
          },
            this.searchWorkerId,
            'distrib-result'
          ))
          .then((distribution) => {
            this.distribution = distribution;
            return this.emit('locale-changed');
          })
          .catch((err) => {
            console.error(err);
          });
      });
    return this.loadingPromise;
  }
}

export const workerController = new WorkerController(localStorage.getItem('locale') || 'fr-fr');