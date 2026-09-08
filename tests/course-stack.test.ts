import assert from 'node:assert/strict';
import test from 'node:test';

import { getCourseStackOffset } from '../src/utils/courseStack.ts';

test('当前课程始终位于卡组中心', () => {
  assert.equal(getCourseStackOffset(0, 0, 3), 0);
  assert.equal(getCourseStackOffset(2, 2, 3), 0);
});

test('课程卡位按最短环形距离分布在当前课程两侧', () => {
  assert.deepEqual(
    [0, 1, 2].map((index) => getCourseStackOffset(index, 0, 3)),
    [0, 1, -1],
  );
  assert.deepEqual(
    [0, 1, 2].map((index) => getCourseStackOffset(index, 2, 3)),
    [1, -1, 0],
  );
});

test('空卡组与单卡组不会产生偏移', () => {
  assert.equal(getCourseStackOffset(4, 3, 0), 0);
  assert.equal(getCourseStackOffset(0, 0, 1), 0);
});
