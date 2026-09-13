
import EventEmmiter from 'eventemitter3';

export type Preferences = {
  shortcuts: {
    toggleDefinition: string;
    exitDefinition: string;
    horizontalSplit: string;
    verticalSplit: string;
    changeMode: string;
  };
  editing: {
    autoLayoutDefinitions: boolean;
  };
  tips:{
    hasSeenAutoLayoutTip: boolean;
  }
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
  editing: {
    autoLayoutDefinitions: false,
  },
  tips: {
    hasSeenAutoLayoutTip: false,
  }
};

class Prefs extends EventEmmiter<Events> {
  private preferences: Preferences = this.load();
  constructor() {
    super();
  }
  load(): Preferences {
    const stored = localStorage.getItem("motsflex-preferences");
    if (!stored) return structuredClone(defaults);
    const parsed = JSON.parse(stored);
    // Merge one level deep so preferences saved before a new category (e.g.
    // "editing") existed don't leave it missing and crash `get`.
    const merged = structuredClone(defaults);
    for (const key of Object.keys(merged) as (keyof Preferences)[]) {
      Object.assign(merged[key], parsed[key]);
    }
    return merged;
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
    } else if (value !== undefined) {
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