
import EventEmmiter from 'eventemitter3';

export type Preferences = {
  shortcuts: {
    toggleDefinition: string;
    exitDefinition: string;
    horizontalSplit: string;
    verticalSplit: string;
    changeMode: string;
  };
};
type Events = {
  update: [Preferences];
};

const defaults: Preferences = {
  shortcuts: {
    toggleDefinition: "Esc",
    exitDefinition: "Ctrl + Enter",
    horizontalSplit: "_",
    verticalSplit: "|",
    changeMode: "Space",
  },
};

class Prefs extends EventEmmiter<Events> {
  private preferences: Preferences = this.load();
  constructor() {
    super();
  }
  load() {
    return localStorage.getItem("motsflex-preferences")
      ? JSON.parse(localStorage.getItem("motsflex-preferences")!)
      : structuredClone(defaults);
  }
  save() {
    localStorage.setItem("motsflex-preferences", JSON.stringify(this.preferences));
  }
  get(str: string) {
    return str.split('.').reduce((acc, cur) => acc[cur], this.preferences);
  }
  set(str: string | Partial<Preferences>, value?: any) {
    if (typeof str === 'object') {
      this.preferences = { ...this.preferences, ...str };
    } else if (value) {
      const keys = str.split('.');
      const lastKey = keys.pop()!;
      const parent = keys.reduce((acc, cur) => acc[cur], this.preferences);
      parent[lastKey] = value;
    }
    this.emit('update', this.preferences);
    this.save();
  }

}

export default new Prefs();