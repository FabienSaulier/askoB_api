import {expect} from 'chai'
import rewire from 'rewire'

const Message = rewire('../lib/message')
let canExploseEntities = Message.__get__('canExploseEntities');
let exploseArrays = Message.__get__('exploseArrays');
let removeDuplicates = Message.__get__('removeDuplicates');
let explose = Message.__get__('explose');

describe("explose tests", function() {
  const entititiesAndValuesABC = ['A','B','C']
  const resFirstExplosionABC = [['B','C'],['A','C'],['A','B']]
  const resSecondExplosionABC = [['C'],['B'],['A']]

  const entititiesAndValuesABCD = ['A','B','C','D']
  const resFirstExplosionABCD = [['B','C','D'],['A','C','D'],['A','B','D'],['A','B','C']]
  const resSecondExplosionABCD = [['C','D'],['B','D'],['B','C'],['A','D'],['A','C'],['A','B']]
  const resThirdExplosionABCD = [['A'],['B'],['C'],['D']]

  describe("can expplose?", function(){
    it("canExploseEntities of array[array]", function() {
      expect(canExploseEntities(entititiesAndValuesABC)).to.equal(true)
    });
    it("canExploseEntities of array[array]", function() {
      expect(canExploseEntities(resFirstExplosionABC)).to.equal(true)
    });
    it("canExploseEntities expected false with only one entity", function() {
      const onlyOneEntity = [['uniqueEntity']]
      expect(canExploseEntities(onlyOneEntity)).to.equal(false)
    });
  })

  describe("explose", function(){
    it("explose 3 into 3x2", function() {
      expect(explose(entititiesAndValuesABC)).to.deep.equal(resFirstExplosionABC)
    });
    it("explose 4 into 4x3", function() {
      expect(explose(entititiesAndValuesABCD)).to.deep.equal(resFirstExplosionABCD)
    });
  })

  describe("removeDuplicates", function(){
    it("nothing to remove", function() {
      const input = [['MANGER','foin'],['ALIMENTS-OK','foin'],['ALIMENTS-OK','MANGER']]
      const out = [['MANGER','foin'],['ALIMENTS-OK','foin'],['ALIMENTS-OK','MANGER']]
      expect(removeDuplicates(input)).to.deep.equal(out)
    });
  })

  describe("exploseArrays", function(){
    it("explose 3x2 into 3x1", function() {
      expect(exploseArrays(resFirstExplosionABC)).to.deep.equal(resSecondExplosionABC)
    });

    it("explose 4x3 into 4x2", function() {
      expect(exploseArrays(resFirstExplosionABCD)).to.deep.equal(resSecondExplosionABCD)
    });
    it("explose 4x2 into 4x1", function() {
      expect(exploseArrays(resFirstExplosionABCD)).to.deep.equal(resSecondExplosionABCD)
    });
  })

});
