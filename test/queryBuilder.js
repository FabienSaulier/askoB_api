/* eslint no-underscore-dangle: "off" */

import { expect } from 'chai'
import rewire from 'rewire'

const Message = rewire('../lib/message')
const buildCriteria = Message.__get__('buildCriteria');

describe('buildCriteria', () => {
  const entities1 = [['ALIMENTS-OK', 'MANGER']]
  const expectedQuery1 = { $or: [{ entities: { $all: ['ALIMENTS-OK', 'MANGER'] } }] }
  const entities2 = [['ALIMENTS-OK'], ['MANGER']]
  const expectedQuery2 = { $or: [{ entities: { $all: ['ALIMENTS-OK'] } }, { entities: { $all: ['MANGER'] } }] }

  it('build criteria [[entities]]', () => {
    expect(buildCriteria(entities1)).to.deep.equal(expectedQuery1)
  });
  it('build criteria [[entities],[entities]]', () => {
    expect(buildCriteria(entities2)).to.deep.equal(expectedQuery2)
  });
});
