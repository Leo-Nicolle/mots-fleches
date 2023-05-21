import { Grid, GridOptions, GridState } from "grid";
import { Database } from "./db";
import axios from "axios";


export class FsdbClient extends Database {
  private baseUrl: string;
  constructor(baseUrl: string) {
    super();
    this.baseUrl = baseUrl;
  }

  async getGrids() {
    return axios.get(`${this.baseUrl}/grid`)
      .then(({ data }) => data as GridState[])
  }

  async pushGrid(g: Grid) {
    const grid = g.serialize();
    return await axios.post(`${this.baseUrl}/grid`, { grid })
      .then(({ data }) => data as string)
  }

  async updateGrid(grid: Grid) {
    // things with same id are overwritten
    return this.pushGrid(grid);
  }

  async deleteGrid(id: string) {
    return await axios.delete(`${this.baseUrl}/grid/${id}`)
      .then(({ data }) => data as void);
  }

  async getGrid(id: string) {
    return await axios.get(`${this.baseUrl}/grid/${id}`)
      .then(({ data }) => data as GridState)
  }

  async getOptions() {
    return await axios.get(`${this.baseUrl}/options`)
      .then(({ data }) => data as GridOptions[])
  }

  async getOption(id: string) {
    return await axios.get(`${this.baseUrl}/options/${id}`)
      .then(({ data }) => data as GridOptions)
  }

  async pushOption(options: GridOptions) {
    return await axios.post(`${this.baseUrl}/options`, { options })
      .then(({ data }) => data as string)
  }

  async updateOption(option: GridOptions) {
    return await this.pushOption(option);
  }

  async deleteOption(optionId: string) {
    return await axios.delete(`${this.baseUrl}/options/${optionId}`)
      .then(({ data }) => data as void);
  }

  async getWords() {
    return await axios.get(`${this.baseUrl}/word`)
      .then(({ data }) => data as string[])
  }

  async getWord(id: string) {
    return await axios.get(`${this.baseUrl}/word/${id}`)
      .then(({ data }) => data as string)
  }

  async pushWord(word: string) {
    return await axios.post(`${this.baseUrl}/word`, { word })
      .then(({ data }) => data as string)
  }

  async deleteWord(wordId: string) {
    return await axios.delete(`${this.baseUrl}/word/${wordId}`)
      .then(({ data }) => data as void);
  }

}