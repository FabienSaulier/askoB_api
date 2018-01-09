/* eslint no-underscore-dangle: "off" */

import { expect } from 'chai'
import rewire from 'rewire'

const Message = rewire('../lib/message')
const canExploseEntities = Message.__get__('canExploseEntities');
const exploseArrays = Message.__get__('exploseArrays');
const removeDuplicates = Message.__get__('removeDuplicates');
const explose = Message.__get__('explose');

describe('explose tests', () => {
  const entititiesAndValuesABC = ['A', 'B', 'C']
  const resFirstExplosionABC = [['B', 'C'], ['A', 'C'], ['A', 'B']]
  const resSecondExplosionABC = [['C'], ['B'], ['A']]

  const entititiesAndValuesABCD = ['A', 'B', 'C', 'D']
  const resFirstExplosionABCD = [['B', 'C', 'D'], ['A', 'C', 'D'], ['A', 'B', 'D'], ['A', 'B', 'C']]
  const resSecondExplosionABCD = [['C', 'D'], ['B', 'D'], ['B', 'C'], ['A', 'D'], ['A', 'C'], ['A', 'B']]

  describe('can expplose?', () => {
    it('canExploseEntities of array[array]', () => {
      expect(canExploseEntities(entititiesAndValuesABC)).to.equal(true)
    });
    it('canExploseEntities of array[array]', () => {
      expect(canExploseEntities(resFirstExplosionABC)).to.equal(true)
    });
    it('canExploseEntities expected false with only one entity', () => {
      const onlyOneEntity = [['uniqueEntity']]
      expect(canExploseEntities(onlyOneEntity)).to.equal(false)
    });
  })

  describe('explose', () => {
    it('explose 3 into 3x2', () => {
      expect(explose(entititiesAndValuesABC)).to.deep.equal(resFirstExplosionABC)
    });
    it('explose 4 into 4x3', () => {
      expect(explose(entititiesAndValuesABCD)).to.deep.equal(resFirstExplosionABCD)
    });
  })

  describe('removeDuplicates', () => {
    it('nothing to remove', () => {
      const input = [['MANGER', 'foin'], ['ALIMENTS-OK', 'foin'], ['ALIMENTS-OK', 'MANGER']]
      const out = [['MANGER', 'foin'], ['ALIMENTS-OK', 'foin'], ['ALIMENTS-OK', 'MANGER']]
      expect(removeDuplicates(input)).to.deep.equal(out)
    });
  })

  describe('exploseArrays', () => {
    it('explose 3x2 into 3x1', () => {
      expect(exploseArrays(resFirstExplosionABC)).to.deep.equal(resSecondExplosionABC)
    });

    it('explose 4x3 into 4x2', () => {
      expect(exploseArrays(resFirstExplosionABCD)).to.deep.equal(resSecondExplosionABCD)
    });
    it('explose 4x2 into 4x1', () => {
      expect(exploseArrays(resFirstExplosionABCD)).to.deep.equal(resSecondExplosionABCD)
    });
  })
});
