export default function (num: any, fixed: number = 2) {
  try {
    return [null, undefined, '', false].includes(num) ? '' : `${num.toFixed(fixed)}%`;
  } catch (e) {
    return num;
  }
}
