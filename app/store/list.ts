class Node {
  public value: any;
  public next: any;
  public prev: any;
  constructor(val: string) {
    this.value = val;
    this.next = null;
    this.prev = null;
  }
}

export class Lists {
  private head: null | Node;
  private tail: null | Node;
  private size: number;
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }
  getSize(): number {
    return this.size;
  }
  lPush(values: string[]): number {
    for (let val of values) {
      const node = new Node(val);
      if (this.head) {
        let curr = this.head;
        this.head = node;
        this.head.next = curr;
        curr.prev = this.head;
      } else {
        this.head = node;
        this.tail = this.head;
      }
      this.size++;
    }
    return this.size;
  }
  rPush(values: string[]): number {
    for (let val of values) {
      const node = new Node(val);
      if (this.tail) {
        node.prev = this.tail;
        this.tail.next = node;
        this.tail = this.tail.next;
      } else {
        this.head = node;
        this.tail = this.head;
      }
      this.size++;
    }
    return this.size;
  }
  lPop(n = 1): string[] {
    let deletedValues: string[] = [];
    for (let i = 0; i < n; i++) {
      if (this.head) {
        deletedValues.push(this.head.value);
        this.head = this.head.next;

        if (this.head) this.head.prev = null;
        else this.tail = null;

        this.size--;
      }
    }
    return deletedValues;
  }
  rPop(): number | null {
    let deletedValue: number | null = null;
    if (this.tail) {
      deletedValue = this.tail.value;
      this.tail = this.tail.prev;

      if (this.tail) this.tail.next = null;
      else this.head = null;

      this.size--;
    }
    return deletedValue;
  }
  lrange(start: number, end: number): string[] {
    let result: string[] = [];
    let curr = this.head;
    if (start < 0) start = this.size + start;
    if (end < 0) end = this.size + end;
    if (!curr || start >= this.size || start > end) return result;
    let i = 0;
    while (curr) {
      if (i >= start && i <= end) {
        result.push(curr.value);
      }
      if (i > end) return result;
      curr = curr.next;
      i++;
    }
    return result;
  }
}
