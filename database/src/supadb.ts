import { GridStyle, GridState, defaultStyles, defaultSolutionStyle } from "grid";
import { Database } from "./db";
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Book, Font, SBSchema } from "./types";


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
    });
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
      const opts = await this.getStyle(defaultStyles.id);
      if (!opts) {
        await this.pushStyle(defaultStyles);
      }
      const sOpts = await this.getStyle(defaultSolutionStyle.id);
      if (!sOpts) {
        await this.pushStyle(defaultSolutionStyle);
      }
    });
  }

  async getGrids() {
    const { data } = await this.supabase.from('Grids').select();
    return data!.map(({ data }) => data);
  }

  async pushGrid(grid: GridState) {
    await this.supabase.from('Grids').upsert({
      id: grid.id,
      created: new Date(grid.created).toISOString(),
      data: grid,
      userid: this.userid,
    });
    return grid.id;
  }

  async updateGrid(grid: GridState) {
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

  async getBooks() {
    const { data } = await this.supabase.from('Books').select();
    return data!.flatMap(({ data }) => data);
  }

  async pushBook(book: Book) {
    await this.supabase.from('Books').upsert({
      id: book.id,
      created: new Date(book.created).toISOString(),
      // TODO: See wether the db should take care of this
      // or if it should be done in the client
      updated: new Date(book.updated).toISOString(),
      data: book,
      userid: this.userid,
    });
    return book.id;
  }

  async updateBook(book: Book) {
    return await this.pushBook(book);
  }

  async deleteBook(bookId: string) {
    await this.supabase.from('Books').delete()
      .eq('id', bookId);
  }

  async getBook(bookId: string) {
    const { data } = await this.supabase.from('Books')
      .select('id, data')
      .eq('id', bookId);
    return data && data.length ? data[0].data : undefined;
  }

  async getStyles() {
    const { data, error } = await this.supabase.from('Options').select();
    if (!error && data && !data.length) {
      // create default style
      await this.pushStyle(defaultStyles);
      await this.pushStyle(defaultSolutionStyle);
    }
    return data!.flatMap(({ data }) => data);
  }

  async getStyle(id: string) {
    const { data } = await this.supabase.from('Options')
      .select('id, data')
      .eq('id', id);
    const option = data && data.length ? data[0].data : undefined;
    return option;
  }

  async pushStyle(style: GridStyle) {
    await this.supabase.from('Options').upsert({
      id: style.id,
      created: new Date(Date.now()).toISOString(),
      data: style,
      userid: this.userid,
    });
    return style.id;
  }

  async updateOption(option: GridStyle) {
    return await this.pushStyle(option);
  }

  async deleteStyle(optionId: string) {
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

  async getBannedWords() {
    const { data } = await this.supabase.from('BannedWords').select();
    return data!.flatMap(({ data }) => data);
  }

  async getBannedWord(id: string) {
    const words = await this.getBannedWords();
    return words.find(w => w === id);
  }

  async pushBannedWord(word: string) {
    const words = await this.getBannedWords();
    words.push(word);
    await this.supabase.from('BannedWords').upsert({
      userid: this.userid,
      data: words,
    });
    return word;
  }

  async deleteBannedWord(wordId: string) {
    const words = (await this.getWords()).filter(w => w !== wordId);
    await this.supabase.from('Words').upsert({
      userid: this.userid,
      data: words,
    });
  }

  async getFonts() {
    const { data } = await this.supabase.from('Fonts').select();
    return data!.flatMap(({ data }) => data);
  }

  async getFont(id: string) {
    const fonts = await this.getFonts();
    return fonts.find(f => f.id === id);
  }

  async pushFont(font: Font) {
    const fonts = await this.getFonts();
    fonts.push(font);
    await this.supabase.from('Fonts').upsert({
      userid: this.userid,
      data: fonts,
    });
    return font.family;
  }

  async deleteFont(fontId: string) {
    const fonts = (await this.getFonts()).filter(f => f.id !== fontId);
    await this.supabase.from('Fonts').upsert({
      userid: this.userid,
      data: fonts,
    });
  }

  async isSignedIn() {
    const { data } = await this.supabase.auth.getSession();
    if (!data) return false;
    return !!data.session && !!data.session.access_token;
  }


}