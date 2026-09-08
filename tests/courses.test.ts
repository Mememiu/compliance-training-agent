import assert from 'node:assert/strict';
import test from 'node:test';

import { COURSES, getCourseById } from '../src/data/courses.ts';

test('数据隐私与信息安全合并为一门完整课程', () => {
  const mergedCourse = getCourseById('data-privacy');

  assert.equal(COURSES.length, 3);
  assert.ok(mergedCourse);
  assert.equal(mergedCourse.title, '数据隐私与信息安全');
  assert.equal(mergedCourse.category, '数据与安全');
  assert.equal(mergedCourse.estimatedTime, 85);
  assert.equal(mergedCourse.lessons.length, 6);
  assert.equal(mergedCourse.quiz.length, 10);
  assert.equal(new Set(mergedCourse.lessons.map((lesson) => lesson.id)).size, 6);
  assert.equal(new Set(mergedCourse.quiz.map((question) => question.id)).size, 10);
});

test('旧信息安全课程链接兼容到合并后的课程', () => {
  assert.equal(COURSES.some((course) => course.id === 'info-security'), false);
  assert.equal(getCourseById('info-security')?.id, 'data-privacy');
});
