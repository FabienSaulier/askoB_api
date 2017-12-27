import {expect} from 'chai'
import rewire from 'rewire'
import util from 'util'
import logger from '../lib/logger'

const Message = rewire('../lib/message')
let buildCriteria = Message.__get__('buildCriteria');

describe("buildCriteria", function() {
  const entities1 = [['ALIMENTS-OK','MANGER']]
  const expectedQuery1 = {$or: [{ entities: {$all:['ALIMENTS-OK', 'MANGER']}}] }
  const entities2 = [['ALIMENTS-OK'],['MANGER']]
  const expectedQuery2 = {$or: [{ entities: {$all:['ALIMENTS-OK']}}, { entities: {$all:['MANGER']}}] }

  it("build criteria [[entities]]", function() {
    expect(buildCriteria(entities1)).to.deep.equal(expectedQuery1)
  });
  it("build criteria [[entities],[entities]]", function() {
    expect(buildCriteria(entities2)).to.deep.equal(expectedQuery2)
  });
});
