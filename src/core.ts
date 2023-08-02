type TBit = number | null;
type TMemory = TBit[];

export default class FS {
  maxLength = 0;
  memory: TMemory = [];
  reserveLength = 0;
  reserve: TMemory = [];
  freeMemory = 0;
  freeAddresses = new Map<number, number>();
  fileRegyster = new Map<string, [number, number][]>();

  constructor(maxLength: number, reserveLength: number) {
    this.maxLength = maxLength;
    this.memory = Array(maxLength).fill(null);
    this.reserveLength = 0;
    this.reserve = Array(reserveLength).fill(null);
    this.freeMemory = maxLength;
    this.freeAddresses.set(0, maxLength);
  }

  add(fileName: string, payload: number[]) {
    if (this.freeMemory < payload.length) {
      throw new Error(`Can't save, not enough memory.`);
    }

    let maximumLength = 0;
    let arrdessOfMaximum = 0;

    const sortedFreeAddresses = new Map(
      [...this.freeAddresses].sort(
        ([addressA, _], [addressB, __]) => addressA - addressB
      )
    );
    const iterator = sortedFreeAddresses.entries();

    let item = iterator.next();
    while (!item.done && !this.fileRegyster.has(fileName)) {
      const [addressOfStart, lengthBlock] = item.value;
      if (maximumLength < lengthBlock) {
        maximumLength = lengthBlock;
        arrdessOfMaximum = addressOfStart;
      }
      if (lengthBlock === payload.length) {
        this.saveOnSize(addressOfStart, payload, fileName);
      }
      item = iterator.next();
    }
    if (!this.fileRegyster.has(fileName)) {
      if (maximumLength > payload.length) {
        this.saveOnMaximum(arrdessOfMaximum, maximumLength, payload, fileName);
      } else {
        this.saveOnParts(payload, fileName);
      }
    }
    console.log(this.freeAddresses);
    this.freeAddresses = FS.concatNearFreeAddresses(this.freeAddresses);
    console.log(this.freeAddresses);
    return this.memory;
  }

  saveOnSize(addressOfStart: number, payload: number[], fileName: string) {
    let i = 0;
    while (i < payload.length) {
      this.memory[addressOfStart + i] = payload[i];
      i++;
    }
    this.freeMemory -= payload.length;
    this.freeAddresses.delete(addressOfStart);
    this.fileRegyster.set(fileName, [[addressOfStart, payload.length]]);
  }

  saveOnMaximum(
    arrdessOfMaximum: number,
    maximumLength: number,
    payload: number[],
    fileName: string
  ) {
    let i = 0;
    while (i < payload.length) {
      this.memory[arrdessOfMaximum + i] = payload[i];
      i++;
    }
    this.freeMemory -= payload.length;
    this.freeAddresses.delete(arrdessOfMaximum);
    this.freeAddresses.set(
      arrdessOfMaximum + i,
      maximumLength - payload.length
    );
    this.fileRegyster.set(fileName, [[arrdessOfMaximum, payload.length]]);
  }

  saveOnParts(payload: number[], fileName: string) {
    const sortedFreeAddresses = new Map(
      [...this.freeAddresses].sort(
        ([addressA, _], [addressB, __]) => addressA - addressB
      )
    );
    const iterator = sortedFreeAddresses.entries();
    let i = 0;
    const addressesOfFile: [number, number][] = [];
    while (i < payload.length) {
      const [addressOfStart, lengthBlock] = iterator.next().value;
      if (i + lengthBlock > payload.length) {
        let j = 0;
        const payloadTail = payload.length - i;
        while (j < payloadTail) {
          this.memory[addressOfStart + j] = payload[i];
          i++;
          j++;
        }
        addressesOfFile.push([addressOfStart, payloadTail]);
        this.freeAddresses.delete(addressOfStart);
        console.log("parts", addressOfStart + j, lengthBlock - payloadTail);
        this.freeAddresses.set(addressOfStart + j, lengthBlock - payloadTail);
      } else {
        let j = 0;
        while (j < lengthBlock) {
          this.memory[addressOfStart + j] = payload[i];
          i++;
          j++;
        }
        addressesOfFile.push([addressOfStart, lengthBlock]);
        this.freeAddresses.delete(addressOfStart);
      }
    }
    this.freeMemory -= payload.length;
    this.fileRegyster.set(fileName, addressesOfFile);
  }

  del(fileName: string) {
    const fileAddresses = this.fileRegyster.get(fileName);
    if (!fileAddresses) throw new Error(`File not exist.`);
    this.fileRegyster.delete(fileName);
    if (fileAddresses.length === 1) {
      const fileLength = fileAddresses[0][1];
      const fileAddress = fileAddresses[0][0];
      this.freeMemory += fileLength;
      this.freeAddresses.set(fileAddress, fileLength);
      let i = 0;
      while (i < fileLength) {
        this.memory[fileAddress + i] = null;
        i++;
      }
    } else {
      fileAddresses.forEach(([startAddressPart, partLength]) => {
        this.freeMemory += partLength;
        this.freeAddresses.set(startAddressPart, partLength);
        let i = 0;
        while (i < partLength) {
          this.memory[startAddressPart + i] = null;
          i++;
        }
      });
    }
    console.log(this.freeAddresses);
    this.freeAddresses = FS.concatNearFreeAddresses(this.freeAddresses);
    console.log(this.freeAddresses);
    return this.memory;
  }

  checkFileName(index: number) {
    if (this.memory[index] === null) return null;
    const iterator = this.fileRegyster.entries();
    let item = iterator.next();
    let fileName = "";
    while (!item.done && !fileName) {
      const [file, adressed] = item.value;
      const findedIndex = adressed.findIndex(
        ([startAddressPart, lengthBlock]) => {
          const endAddressPart = startAddressPart + lengthBlock;
          return index >= startAddressPart && index < endAddressPart;
        }
      );
      if (findedIndex !== -1) fileName = file;
      item = iterator.next();
    }
    return fileName;
  }

  static concatNearFreeAddresses(
    freeAddresses: Map<number, number>
  ): Map<number, number> {
    const newFreeAddresses = new Map<number, number>();
    const sortedFreeAddresses = new Map(
      [...freeAddresses].sort(
        ([addressA, _], [addressB, __]) => addressA - addressB
      )
    );
    const iterator = sortedFreeAddresses.entries();
    let item = iterator.next();
    while (!item.done) {
      const partAddress = item.value[0];
      let partLength = item.value[1];
      let nextNearAddress = partAddress + partLength;
      while (sortedFreeAddresses.has(nextNearAddress)) {
        const nextNearLength = sortedFreeAddresses.get(nextNearAddress) || 0;
        partLength += nextNearLength;
        sortedFreeAddresses.delete(nextNearAddress);
        nextNearAddress = partAddress + partLength;
      }
      newFreeAddresses.set(partAddress, partLength);
      item = iterator.next();
    }
    return newFreeAddresses;
  }

  static needDefragmentstion(fs: FS) {
    let hasParts = false;
    const iterator = fs.fileRegyster.entries();
    let item = iterator.next();
    while (!item.done && !hasParts) {
      const addresses = item.value[1];
      hasParts = addresses.length > 1;
      item = iterator.next();
    }
    const hasFreeParts = fs.freeAddresses.size > 1;
    const firstFreePart = fs.freeAddresses.entries().next().value || [0,0];
    const addressFirstFreePart = firstFreePart[0];
    const lengthFirstFreePart = firstFreePart[1];
    const endFirstFreePart = addressFirstFreePart + lengthFirstFreePart;
    const firstFreePartIsLastPartOfMemory = endFirstFreePart === fs.maxLength;
    if (!hasParts && !hasFreeParts && firstFreePartIsLastPartOfMemory)
      return false;
    return true;
  }

  static defragmentation(fs: FS): FS {
    if (!FS.needDefragmentstion(fs)) return fs;
    const sortedFileNameOfAddress = [...fs.fileRegyster].sort(
      ([fileNameA, addressesA], [fileNameB, addressesB]) =>
        addressesA[0][0] - addressesB[0][0]
    );
    const newFileRegyster = new Map();
    const newMemory = sortedFileNameOfAddress
      .map(([fileName, addresses]) => {
        const reducePayload = addresses
          .map((x) => fs.memory.slice(x[0], x[1]))
          .flat(1);
        const reduceAddress = addresses.reduce((acc, x) => [
          acc[0],
          (acc[1] += x[1]),
        ]);
        console.log(reducePayload,reduceAddress);
        newFileRegyster.set(fileName, reduceAddress);
        return reducePayload;
      })
      .flat(1);
    fs.fileRegyster.clear;
    console.log(newFileRegyster);
    fs.fileRegyster = new Map(newFileRegyster);
    fs.memory = newMemory;
    fs.freeAddresses.clear;
    fs.freeMemory = 0;
    const nullIndex = newMemory.findIndex((x) => x === null);
    if (nullIndex !== -1) {
      const newFreeMemory = newMemory.length - nullIndex;
      fs.freeMemory = newFreeMemory;
      fs.freeAddresses.set(nullIndex, newFreeMemory);
    }
    return fs;
  }
}
