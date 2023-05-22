import { Grid, GridOptions, GridState, defaultOptions, defaultSolutionOptions } from "grid";
import { Database } from "./db";
import { SupabaseClient, createClient } from '@supabase/supabase-js'


export class SupaDB extends Database {
  private projectUrl: string;
  private anonKey: string;
  public supabase: SupabaseClient;

  constructor(projectUrl: string, anonKey: string) {
    super();
    this.projectUrl = projectUrl;
    this.anonKey = anonKey;
    this.supabase = createClient(this.projectUrl, this.anonKey)

    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if(!session?.user)return;
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
    return data?.map(({ data }) => JSON.parse(data)) as GridState[];
  }

  async pushGrid(g: Grid) {
    const grid = JSON.parse(g.serialize()) as GridState;
    const { data: userData } = await this.supabase.auth.getUser();
    const { data } = await this.supabase.from('Grids').upsert({
      id: grid.id,
      created: new Date(grid.created),
      data: JSON.stringify(grid),
      userid: userData.user?.id,
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
    return data && data.length ? JSON.parse(data[0].data) as GridState : undefined;
  }

  async getOptions() {
    const { data, error } = await this.supabase.from('Options').select();
    if (!error && data && !data.length) {
      // create default options
      await this.pushOption(defaultOptions);
      await this.pushOption(defaultSolutionOptions);
    }
    return data?.map(({ data }) => JSON.parse(data)) as GridOptions[];
  }

  async getOption(id: string) {
    const { data } = await this.supabase.from('Options')
      .select('id, data')
      .eq('id', id);
    return data && data.length ? JSON.parse(data[0].data) as GridOptions : undefined;
  }

  async pushOption(options: GridOptions) {
    const { data: userData } = await this.supabase.auth.getUser();
    const { data } = await this.supabase.from('Options').upsert({
      id: options.id,
      created: new Date(Date.now()),
      data: JSON.stringify(options),
      userid: userData.user?.id,
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
    return data?.map(({ data }) => JSON.parse(data)) as string[];
  }

  async getWord(id: string) {
    const words = await this.getWords();
    return words.find(w => w === id);
  }

  async pushWord(word: string) {
    const { data: userData } = await this.supabase.auth.getUser();
    const words = await this.getWords();
    words.push(word);
    await this.supabase.from('Words').upsert({
      id: userData.user?.id,
      data: JSON.stringify(words),
    });
    return word;
  }

  async deleteWord(wordId: string) {
    const words = (await this.getWords()).filter(w => w !== wordId);
    const { data: userData } = await this.supabase.auth.getUser();
    await this.supabase.from('Words').upsert({
      id: userData.user?.id,
      data: JSON.stringify(words),
    });
  }

  async isSignedIn() {
    const { data: userData } = await this.supabase.auth.getUser();
    return !!userData.user;
  }


}