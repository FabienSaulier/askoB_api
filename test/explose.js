import {expect} from 'chai'
import rewire from 'rewire'

const Message = rewire('../lib/message')
let canExploseEntities = Message.__get__('canExploseEntities');
let exploseWithDuplicates = Message.__get__('exploseWithDuplicates');
let removeDuplicates = Message.__get__('removeDuplicates');
let explose = Message.__get__('explose');

describe("explose tests", function() {
  const entititiesAndValues = ['A','B','C']
  const entititiesAndValues2 = ['A']
  const resFirstExplosion = [['A','B'],['A','C'],['B','C']]
  const resSecondExplosion = [['A'],['B'],['C']]

  it("canExploseEntities of array", function() {
    expect(canExploseEntities(entititiesAndValues)).to.equal(true)
  });
  it("canExploseEntities of array[array]", function() {
    expect(canExploseEntities(resFirstExplosion)).to.equal(true)
  });
  it("canExploseEntities expected false to array[array] with one entity", function() {
    expect(canExploseEntities(resSecondExplosion)).to.equal(false)
  });
  it("canExploseEntities expected false to array with one entity", function() {
    expect(canExploseEntities(entititiesAndValues2)).to.equal(false)
  });
/*
  it("exploseWithDuplicates", function() {
    const entititiesAndValues = ['A','B','C']
    const resFirstExplosion = [['A','B'],['A','C'],['B','C']]
    const resSecondExplosion = [['A'],['B'],['C']]


  });

  it("removeDuplicates", function() {


  });

  it("explose", function() {


  });
  */

});
