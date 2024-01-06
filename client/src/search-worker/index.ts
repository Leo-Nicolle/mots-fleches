import { CellProba, Direction, Grid, GridValidity, Vec } from "grid";
import EventEmitter from "eventemitter3";
import * as fflate from 'fflate';
import { api } from "../api";
import { copyCellProbas } from "./heatmap";
// import { dico as debugDico, Dico } from "./dico";
// import { autoFill } from "./auto-fill";

export type Events = {
  'run-result': CellProba[][];
  'search-result': string[];
  'autofill-result': Grid;
  'bail-result': undefined;
  'locale-changed': undefined;
  'start-locale-change': undefined;
  'searchword-result': string[];
  'searchdefinition-result': {title: string, text: string}[];
  'check-result': GridValidity;
};

class WorkerController extends EventEmitter<Events> {
  public searchWorker: Worker;
  public probaWorker: Worker;
  private busy: boolean[] = [false, false];
  private queues: { type: string, data: string; }[][] = [[], []];
  private flagsBuffer: SharedArrayBuffer;
  private flagsArray: Uint8Array;
  private distribution: [number, number][];
  public wordsBuffer: SharedArrayBuffer;
  public wordsArray: Uint8Array;
  private searchWorkerId = 0;
  private probaWorkerId = 1;
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
      this.wordsBuffer = new SharedArrayBuffer(1);
      this.wordsArray = new Uint8Array(this.wordsBuffer);
      this.wordsArray[0] = 0;
    } else {
      throw new Error('SharedArrayBuffer is not supported');
    }
    this.distribution = [];
    this.searchWorker = new Worker(new URL('./worker', import.meta.url), { type: 'module' });
    this.probaWorker = new Worker(new URL('./worker', import.meta.url), { type: 'module' });

    this.searchWorker.addEventListener('message', (evt) => this.onMessage(this.searchWorkerId, evt));
    this.probaWorker.addEventListener('message', (evt) => this.onMessage(this.probaWorkerId, evt));
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
    this._postMessage('run', grid.serialize(), this.probaWorkerId);
  }

  autofill(grid: Grid, words: string[]) {
    this.loadingPromise.then(() => {
      //   const data = autoFill(grid, words);
      //   this.emit('autofill-result', Grid.unserialize(data));
      this._postMessage('autofill', JSON.stringify({
        grid: grid.serialize(),
        words
      }), this.probaWorkerId);
    });
  }

  searchWord(query: string) {
    this.loadingPromise.then(() => {
      this._postMessage('searchword', query, this.searchWorkerId);
    });
  }

  searchDefinition(query: string) {
    this.loadingPromise.then(() => {
      this._postMessage('searchdefinition', query, this.searchWorkerId);
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
    const ww = workerId === this.probaWorkerId ? this.probaWorker : this.searchWorker;
    this.loadingPromise.then(() => {
      ww.postMessage({ type, data });
    });

  }

  onMessage(workerId: number, event: MessageEvent) {
    const { type, data } = event.data;
    this.busy[workerId] = false;
    if (type === 'loaded') {
      this.emit('locale-changed');
    }
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
    const queue = this.queues[workerId];
    const job = queue.shift();
    if (!job) return;
    // remove all jobs of the same type
    this.queues[workerId] = queue.filter(q => q.type !== job.type);
    this._postMessage(job.type, job.data, workerId);
  }

  destroy() {
    this.probaWorker.terminate();
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
    const worker = workerId === this.probaWorkerId ? this.probaWorker : this.searchWorker;
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
      api.getDefinitions() as Promise<string>
    ])
      .then(([locales, words, definitions]) => {
        locales[locale]
          .forEach(locale => {
            const wordsInLocale = locale.split(',');
            for (let i = 0; i < wordsInLocale.length; i++) {
              words.push(wordsInLocale[i]);
            }
          });
        const encoded = new TextEncoder().encode(words.join(','));
        this.wordsBuffer = new SharedArrayBuffer(encoded.byteLength);
        this.wordsArray = new Uint8Array(this.wordsBuffer);
        for (let i = 0; i < encoded.byteLength; i++) {
          this.wordsArray[i] = encoded[i];
        }
        // debugDico.load(words);
        return Promise.all(
          [this.searchWorker, this.probaWorker]
            .map(worker => {
              this.promisifiedCall(
                { flags: this.flagsBuffer, words: this.wordsBuffer,
                definitions },
                worker === this.probaWorker ? this.probaWorkerId : this.searchWorkerId,
                'loaded'
              );
            })
        );
      })
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
    return this.loadingPromise;
  }


  // getWords() {
  //   return this.loadingPromise.then(() => {
  //     const encoded = new Uint8Array(this.wordsBuffer.byteLength);
  //     encoded.set(new Uint8Array(this.wordsBuffer));
  //     return new TextDecoder().decode(encoded).split(',');
  //   });
  // }

}

export const workerController = new WorkerController(localStorage.getItem('locale') || 'fr-fr');