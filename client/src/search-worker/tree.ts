import { remove } from 'fs-extra';
import { ACode, ZCode, dico } from './dico';

export type Node = {
  code: number;
  start: number;
  end: number;
  parent: Node | undefined;
  index: number;
  children: Node[];
};

function getChildren(start: number, end: number, index: number, size: number, parent?: Node): Node[] {
  if (index === size) return [];
  if (start === end) return [{
    code: dico.words[start].charCodeAt(index),
    start,
    end,
    index,
    parent,
    children: []
  }];
  return new Array(26).fill(0).map((e, i) => i + 65)
    .map(code => {
      const newStart = dico.stringBS.findStartIdx(
        code,
        index,
        start,
        end
      );
      const newEnd = dico.stringBS.findEndIdx(
        code,
        index,
        newStart,
        end
      );
      start = newStart;
      if (newStart > newEnd) return null;
      const node = {
        code,
        start: newStart,
        end: newEnd,
        index,
        parent
      } as Node;
      node.children = getChildren(newStart, newEnd, index + 1, size, node).filter(c => !isNaN(c.code) && c.code >= ACode && c.code <= ZCode);
      return node;
    }).filter(e => e) as Node[];
}

let interSet: Set<number>;
export function intersect(a: Map<number, Node[][]>, b: Map<number, Node[][]>) {
  // const interA: Node[] = [];
  // const interB: Node[] = [];
  // interSet = new Set(a.map(c => c.code));
  // for (let i = 0; i < b.length; i++) {
  //   if (!interSet.has(b[i].code)) {
  //     // removedB.push(b[i])
  //     continue;
  //   }
  //   interB.push(b[i]);
  // }
  // interSet.clear();
  // interSet = new Set(b.map(c => c.code));
  // for (let i = 0; i < a.length; i++) {
  //   if (!interSet.has(a[i].code)) {
  //     // removedA.push(a[i]);
  //     continue;
  //   }
  //   interA.push(a[i]);
  // }
  for (let i = ACode; i < ACode + 26; i++) {
    if (!a.has(i) || !b.has(i)) {
      a.delete(i);
      b.delete(i);
    }
  }
}

export function bottomUp(callback: (node: Node) => void, node: Node) {
  const Q = [node];
  while (Q.length) {
    const n = Q.pop()!;
    callback(n);
    if (!n?.parent) break;
    Q.push(n?.parent);
  }
}


function parentHasCode(nodes: Node[], code: number, start: number, end: number, foundCodes: Set<number>) {
  while (start <= end) {
    const middle = (start + end) >>> 1;
    const parentCode = nodes[middle].parent!.code;
    if (!parentCode) break;
    foundCodes.add(parentCode)
    if (parentCode < code) start = middle + 1;
    else end = middle - 1;
  }
  return nodes[start] && nodes[start].parent!.code === code;
}
export function getPossibleParents(nodes: Map<number, Node[]>, res: Set<number>) {
  for (let i = ACode; i <= ZCode; i++) {
    if (res.has(i)) continue;
    for (const [_, ns] of nodes) {
      if (!parentHasCode(ns, i, 0, ns.length - 1, res)) continue;
      res.add(i);
    }
  }
}

export function mapToWords(map: Map<number, Node[]>) {
  const words: string[] = [];
  for (const [_, nodes] of map) {
    for (const node of nodes) {
      new Array(node.end - node.start + 1).fill(0).map((e, i) => i + node.start).forEach(i => words.push(dico.words[dico.sorted[i]]));
    }
  }
  return words;
}

export class Tree {
  private roots: Node[];
  constructor(size: number) {
    const [min, max] = dico.findLengthInterval(size);
    let start = min;
    let end = max;
    this.roots = getChildren(start, end, 0, size);
  }

  getIntervals(query: string): Map<number, Node[]> {
    return this.getIntervalsR(query, Array.from(this.roots.values()).flat())
      .reduce((acc, node) => {
        return acc.set(node.code, acc.get(node.code) ? [...acc.get(node.code)!, node] : [node]);
      }, new Map<number, Node[]>());
  }

  getIntervalsR(query: string, stack: Node[]): Node[] {
    if (query.length === 1) {
      if (query === "*") return stack;//.map(node => [node.start, node.end]);
      return stack.filter(node => node.code === query.charCodeAt(0));//.map(node => [node.start, node.end]);
    }
    const code = query.charCodeAt(0);
    if (query.charAt(0) !== "*") {
      const newStack = stack.filter(node => node.code === code).flatMap(node => node.children);
      return this.getIntervalsR(query.slice(1), newStack);
    }
    const newStack = stack.flatMap(node => Array.from(node.children));
    return this.getIntervalsR(query.slice(1), newStack);
  }

}