import { GridStyle, GridState } from "grid";
import { Database } from "../db";
import { Book, Font } from "../types";
import axios from "axios";
import { AxiosAPI } from "./types";

export class RemoteDB extends Database {
  private serverURL: string;
  private fetcher: AxiosAPI;
  private anonKey: string;
  private headers: any;
  // TODO: Make use of refresh token.
  // private refreshToken: string;
  constructor(serverURL: string, anonKey: string = "", headers: any = {}) {
    super();
    this.headers = headers;
    this.serverURL = serverURL;
    this.anonKey = anonKey;
    this.fetcher = axios.create({
      baseURL: serverURL,
      headers: {
        ...headers,
        Authorization: `Bearer ${this.anonKey}`,
      },
    });
  }

  public async signin(email: string, password: string) {
    const { data } = await this.fetcher.post("/auth/login", {
      email,
      password,
    });
    this.anonKey = data.accessToken;
    this.fetcher = axios.create({
      baseURL: this.serverURL,
      headers: {
        ...this.headers,
        Authorization: `Bearer ${this.anonKey}`,
      },
    });
    return data;
  }
  public async getPlans() {
    const { data } = await this.fetcher.get("/payments/plans");
    return data;
  }
  public register(email: string, password: string) {
    return this.fetcher.post("/auth/register", { email, password });
  }

  public logout() {
    return this.fetcher.post("/auth/logout", this.anonKey);
  }

  async getGrids() {
    const { data } = await this.fetcher.get("/grids");
    return data;
  }

  async pushGrid(grid: GridState) {
    await this.fetcher.post("/grid", grid);
    return grid.id;
  }

  async updateGrid(grid: GridState) {
    // things with same id are overwritten
    return this.pushGrid(grid);
  }

  async deleteGrid(id: string) {
    await this.fetcher.delete(`/grid/${id}`);
  }

  async getGrid(id: string) {
    const { data } = await this.fetcher.get(`/grid/${id}`);
    return data;
  }

  async getBooks() {
    const { data } = await this.fetcher.get("/books");
    return data;
  }

  async pushBook(book: Book) {
    const { data } = await this.fetcher.post("/book", {
      id: book.id,
      data: book,
    });
    return data;
  }

  async updateBook(book: Book) {
    return await this.pushBook(book);
  }

  async deleteBook(bookId: string) {
    await this.fetcher.delete(`/book/${bookId}`);
  }

  async getBook(bookId: string) {
    const { data } = await this.fetcher.get(`/book/${bookId}`);
    return data;
  }

  async getStyles() {
    const { data } = await this.fetcher.get("/styles");
    return data;
  }

  async getStyle(id: string) {
    const { data } = await this.fetcher.get(`/style/${id}`);
    return data;
  }

  async pushStyle(style: GridStyle) {
    await this.fetcher.post("/style", style);
    return style.id;
  }

  async updateOption(option: GridStyle) {
    return await this.pushStyle(option);
  }

  async deleteStyle(optionId: string) {
    await this.fetcher.delete(`/style/${optionId}`);
  }

  async getWords() {
    const { data } = await this.fetcher.get("/words");
    return data;
  }

  async getWord(id: string) {
    const { data } = await this.fetcher.get(`/word/${id}`);
    return data;
  }

  async pushWord(word: string) {
    await this.fetcher.post("/word", word);
    return word;
  }

  async deleteWord(wordId: string) {
    await this.fetcher.delete(`/word/${wordId}`);
  }

  async getBannedWords() {
    const { data } = await this.fetcher.get("/banned-words");
    return data;
  }

  async getBannedWord(id: string) {
    const { data } = await this.fetcher.get(`/banned-word/${id}`);
    return data;
  }

  async pushBannedWord(word: string) {
    await this.fetcher.post("/banned-word", word);
    return word;
  }

  async deleteBannedWord(wordId: string) {
    await this.fetcher.delete(`/banned-word/${wordId}`);
  }

  async getFonts() {
    const { data } = await this.fetcher.get("/fonts");
    return data;
  }

  async getFont(id: string) {
    const { data } = await this.fetcher.get(`/font/${id}`);
    return data;
  }

  async pushFont(font: Font) {
    await this.fetcher.post("/font", font);
    return font.family;
  }

  async deleteFont(fontId: string) {
    await this.fetcher.delete(`/font/${fontId}`);
  }

  async isSignedIn() {
    // TODO: check if token is valid
    return true;
  }
}
