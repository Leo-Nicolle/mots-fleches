import { GridStyle, GridState, SolutionStyle } from "grid";
import { Database } from "../db";
import { Book, Font } from "../types";
import axios from "axios";
import { AxiosAPI } from "./types";

export class RemoteDB extends Database {
  public fetcher: AxiosAPI;
  private anonKey: string;
  private refreshToken: string;
  private serverURL: string;

  constructor(serverURL: string, anonKey: string = "") {
    super();
    this.serverURL = serverURL;
    this.anonKey = anonKey;
    this.refreshToken = localStorage.getItem("refreshToken") || "";
    this.fetcher = axios.create({
      baseURL: serverURL,
    });
    // Attach access token to every request
    //@ts-expect-error
    this.fetcher.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${this.anonKey}`;
      return config;
    });
    // Refresh token on 401
    //@ts-expect-error
    this.fetcher.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            const { data } = await axios.post(`${this.serverURL}/auth/refresh-token`, {
              refreshToken: this.refreshToken,
            });
            this.anonKey = data.accessToken;
            localStorage.setItem("accessToken", data.accessToken);
            error.config.headers.Authorization = `Bearer ${this.anonKey}`;
            return this.fetcher.request(error.config);
          } catch {
            // Refresh failed — propagate the original error
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public async signin(email: string, password: string) {
    const { data } = await this.fetcher.post("/auth/login", {
      email,
      password,
    });
    this.anonKey = data.accessToken;
    this.refreshToken = data.refreshToken;
    return data;
  }

  public setToken(anonKey: string) {
    this.anonKey = anonKey;
  }

  public async getPlans() {
    const { data } = await this.fetcher.get("/payments/plans");
    return data;
  }

  public async subscribe(payload: { planId: string }) {
    const { data } = await this.fetcher.post("/payments/subscribe", payload);
    return data;
  }

  public register(email: string, password: string, pseudo?: string, turnstileToken?: string) {
    return this.fetcher.post("/auth/register", { email, password, pseudo, turnstileToken });
  }

  public logout() {
    return this.fetcher.post("/auth/logout");
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

  // ── Group resources ────────────────────────────────────────────────────────

  async getGroupGrids(groupId: number): Promise<GridState[]> {
    const { data } = await (this.fetcher as any).get(`/group/${groupId}/grids`);
    return data;
  }

  async getGroupBooks(groupId: number): Promise<Book[]> {
    const { data } = await (this.fetcher as any).get(`/group/${groupId}/books`);
    return data;
  }

  async getGroupStyles(groupId: number): Promise<(GridStyle | SolutionStyle)[]> {
    const { data } = await (this.fetcher as any).get(`/group/${groupId}/styles`);
    return data;
  }

  async getGroupStyle(groupId: number, clientId: string): Promise<GridStyle | SolutionStyle> {
    const { data } = await (this.fetcher as any).get(`/group/${groupId}/style/${clientId}`);
    return data;
  }

  async shareGrid(groupId: number, gridId: string): Promise<void> {
    await (this.fetcher as any).post(`/group/${groupId}/grid/${gridId}/share`);
  }

  async unshareGrid(groupId: number, gridId: string): Promise<void> {
    await (this.fetcher as any).delete(`/group/${groupId}/grid/${gridId}/share`);
  }

  async shareBook(groupId: number, bookId: string): Promise<void> {
    await (this.fetcher as any).post(`/group/${groupId}/book/${bookId}/share`);
  }

  async unshareBook(groupId: number, bookId: string): Promise<void> {
    await (this.fetcher as any).delete(`/group/${groupId}/book/${bookId}/share`);
  }

  async shareStyle(groupId: number, styleId: string): Promise<void> {
    await (this.fetcher as any).post(`/group/${groupId}/style/${styleId}/share`);
  }

  async unshareStyle(groupId: number, styleId: string): Promise<void> {
    await (this.fetcher as any).delete(`/group/${groupId}/style/${styleId}/share`);
  }

  async getGroupFonts(groupId: number): Promise<Font[]> {
    const res = await (this.fetcher as any).get(`/group/${groupId}/fonts`);
    return res.data;
  }

  async shareFont(groupId: number, fontName: string): Promise<void> {
    await (this.fetcher as any).post(`/group/${groupId}/font/${encodeURIComponent(fontName)}/share`);
  }

  async unshareFont(groupId: number, fontName: string): Promise<void> {
    await (this.fetcher as any).delete(`/group/${groupId}/font/${encodeURIComponent(fontName)}/share`);
  }

  // ── Auth ───────────────────────────────────────────────────────────────────

  async isSignedIn() {
    if (!this.anonKey) return false;
    try {
      await this.fetcher.get("/profile");
      return true;
    } catch {
      return false;
    }
  }
}
