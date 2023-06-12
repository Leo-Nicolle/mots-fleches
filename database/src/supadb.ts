import { Grid, GridOptions, GridState, defaultOptions, defaultSolutionOptions } from "grid";
import { Database } from "./db";
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { SBSchema } from "./types";


export class SupaDB extends Database {
  private projectUrl: string;
  private anonKey: string;
  private userid: string;
  public supabase: SupabaseClient<SBSchema>;

  constructor(projectUrl: string, anonKey: string) {
    super();
    this.projectUrl = projectUrl;
    this.anonKey = anonKey;
    this.userid = '';
    this.supabase = createClient(this.projectUrl, this.anonKey, {
      auth: {
        storage: window.localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      }
    })
    this.supabase.auth.getSession()
      .then(({ data }) => {
        if (!data) return;
        this.userid = data.session?.user.id || '';
      })
      .catch(e => console.error('error getting session', e));

    this.supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        this.userid = '';
        return;
      }
      this.userid = session.user.id;
      const opts = await this.getOption(defaultOptions.id);
      if (!opts) {
        await this.pushOption(defaultOptions);
      }
      const sOpts = await this.getOption(defaultSolutionOptions.id);
      if (!sOpts) {
        await this.pushOption(defaultSolutionOptions);
      }
    });
  }

  async getGrids() {
    const { data } = await this.supabase.from('Grids').select();
    return data!.map(({ data }) => data)
  }

  async pushGrid(g: Grid) {
    const grid = JSON.parse(g.serialize()) as GridState;
    await this.supabase.from('Grids').upsert({
      id: grid.id,
      created: new Date(grid.created).toISOString(),
      data: grid,
      userid: this.userid,
    });
    return grid.id;
  }

  async updateGrid(grid: Grid) {
    // things with same id are overwritten
    return this.pushGrid(grid);
  }

  async deleteGrid(id: string) {
    await this.supabase.from('Grids').delete()
      .eq('id', id);
  }

  async getGrid(id: string) {
    const { data } = await this.supabase.from('Grids')
      .select('id, data')
      .eq('id', id);
    return data && data.length ? data[0].data : undefined;
  }

  async getOptions() {
    const { data, error } = await this.supabase.from('Options').select();
    if (!error && data && !data.length) {
      // create default options
      await this.pushOption(defaultOptions);
      await this.pushOption(defaultSolutionOptions);
    }
    return data!.flatMap(({ data }) => data);
  }

  async getOption(id: string) {
    const { data } = await this.supabase.from('Options')
      .select('id, data')
      .eq('id', id);
    return data && data.length ? data[0].data : undefined;
  }

  async pushOption(options: GridOptions) {
    await this.supabase.from('Options').upsert({
      id: options.id,
      created: new Date(Date.now()).toISOString(),
      data: options,
      userid: this.userid,
    });
    return options.id;
  }

  async updateOption(option: GridOptions) {
    return await this.pushOption(option);
  }

  async deleteOption(optionId: string) {
    await this.supabase.from('Options').delete()
      .eq('id', optionId);
  }

  async getWords() {
    const { data } = await this.supabase.from('Words').select();
    return data!.flatMap(({ data }) => data);
  }

  async getWord(id: string) {
    const words = await this.getWords();
    return words.find(w => w === id);
  }

  async pushWord(word: string) {
    const words = await this.getWords();
    words.push(word);
    await this.supabase.from('Words').upsert({
      userid: this.userid,
      data: words,
    });
    return word;
  }

  async deleteWord(wordId: string) {
    const words = (await this.getWords()).filter(w => w !== wordId);
    await this.supabase.from('Words').upsert({
      userid: this.userid,
      data: words,
    });
  }

  async isSignedIn() {
    const { data } = await this.supabase.auth.getSession()
    if (!data) return false;
    return true;
  }


}