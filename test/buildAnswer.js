import {expect} from 'chai'
import rewire from 'rewire'
import util from 'util'
import logger from '../lib/logger'

const Message = rewire('../lib/message')
let buildAnswerFromSeverals = Message.__get__('buildAnswerFromSeverals');

describe("buildAnswerFromSeverals", function() {
  const answers = [{text:'A', entities:['A','B','C']},
                  {text:'B', entities:['A','B']},
                  {text:'C', entities:['A','B']},
                ]

  it("return one answer", function() {
    expect(buildAnswerFromSeverals(answers, 3)).to.deep.equal(answers[0])
  });
  it("return an answer with 2 quick replies", function() {
    expect(buildAnswerFromSeverals(answers, 2).children.length).to.equal(2)
  });
  it("all anwser have lower dimension: return all answers in quick replies", function() {
    expect(buildAnswerFromSeverals(answers, 4).children.length).to.equal(3)
  });
  it("all anwser have higher dimension: return all answers in quick replies", function() {
    expect(buildAnswerFromSeverals(answers, 1).children.length).to.equal(3)
  });
});
