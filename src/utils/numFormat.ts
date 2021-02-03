export default function numFormat(num: number, int?: boolean) {
  if (num as any === '-') return num;
  let result: any = int ? parseInt(num as any) : num;
  try {
    result = new Intl.NumberFormat().format(result);
  } catch (e) {
    const reg = /(?=(\B\d{3})+$)/g;
    result = String(result || '').replace(reg, ',');
  }
  if (Number.isNaN(result as any)) return '';
  if (result === 'NaN') return '';
  return result;
}
