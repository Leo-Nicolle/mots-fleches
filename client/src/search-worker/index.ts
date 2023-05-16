import { CellProba, Direction, Grid, Vec } from "grid";
import EventEmitter from "eventemitter3";

export type Events = {
  'run-result': CellProba[][];
  'search-result': number[];
  'bail-result': undefined;
}

export default class SearchWorker extends EventEmitter<Events> {
  public worker?: Worker;
  private busy: boolean = false;
  private queue: { type: string, data: string }[] = [];
  private sharedBuffer: SharedArrayBuffer;
  private sharedArray: Int8Array;
  /* setting data */
  /* sending the buffer (copy) to worker */
  constructor() {
    super();
    if (!window.isSecureContext) {
      throw new Error('Not in a secure context');
    }
    if (crossOriginIsolated) {
      this.sharedBuffer = new SharedArrayBuffer(1);
      this.sharedArray = new Int8Array(this.sharedBuffer);
      this.sharedArray[0] = 0;
    } else {
      throw new Error('SharedArrayBuffer is not supported');
    }

    this.worker = new Worker(new URL('./search-worker', import.meta.url), { type: 'module' });
    this.worker.postMessage(this.sharedBuffer);
    this.worker?.addEventListener('message', (evt) => this.onMessage(evt));
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
      this.sharedArray[0] = 1;
      return;
    }
    this.busy = true;
    this.sharedArray[0] = 0;
    this.worker?.postMessage({ type, data });
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
      this._postMessage(type, data);
    }
  }

  bail() {
    if (!this.busy) return;
    this.sharedArray[0] = 1;
  }
}