import { math } from './math.ts';

interface UnitData {
  units: string[];
  divs: number[];
}

const unitSelectId = (u: UnitData, value: number): number => {
  let idx = 0;
  while (idx < u.units.length - 1 && value > (u.divs[idx + 1] * 3) / 2) idx++;
  return idx;
};

const unitTruncateTo = (u: UnitData, id: number, value: number): number =>
  math.truncate(value / u.divs[id]);
const unitConvertTo = (u: UnitData, id: number, value: number): string =>
  unitTruncateTo(u, id, value) + u.units[id];
export const unitConvertAuto = (u: UnitData, value: number): string =>
  unitConvertTo(u, unitSelectId(u, value), value);

const UNIT_TIME: UnitData = {
  units: ['ns', 'µs', 'ms', 's'],
  divs: [1, 1e3, 1e6, 1e9],
};
const UNIT_BYTE: UnitData = {
  units: ['b', 'kb', 'mb', 'gb'],
  divs: [1, 1e3, 1e6, 1e9],
};

export const toByte = (byte: number) => unitConvertAuto(UNIT_BYTE, byte);
export const toDuration = (ns: number) => unitConvertAuto(UNIT_TIME, ns);
