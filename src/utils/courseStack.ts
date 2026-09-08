export function getCourseStackOffset(index: number, activeIndex: number, count: number) {
  if (count <= 1) return 0;

  const normalizedIndex = ((index % count) + count) % count;
  const normalizedActiveIndex = ((activeIndex % count) + count) % count;
  let offset = (normalizedIndex - normalizedActiveIndex + count) % count;

  if (offset > count / 2) {
    offset -= count;
  }

  return offset;
}
