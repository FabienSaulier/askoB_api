/* eslint no-underscore-dangle: "off" */

import { expect } from 'chai'
import rewire from 'rewire'

const Message = rewire('../lib/message')
const filterAnswers = Message.__get__('filterAnswers');
const filterPrecise = Message.__get__('filterPrecise');

describe('filterAnswers', () => {
  const answers = [{ text: 'A', entities: ['A', 'B', 'C'], precise: false },
    { text: 'B', entities: ['A', 'B'], precise: false },
    { text: 'C', entities: ['A', 'B'], precise: false },
  ]
  const emptyAnswer = []

  it('return one answer', () => {
    expect(filterAnswers(answers, 3).length).to.equal(1)
  });
  it('return an answer with 2 quick replies', () => {
    expect(filterAnswers(answers, 2).length).to.equal(2)
  });
  it('all anwser have lower dimension: return all answers in quick replies', () => {
    expect(filterAnswers(answers, 4).length).to.equal(3)
  });
  it('all anwser have higher dimension: return all answers in quick replies', () => {
    expect(filterAnswers(answers, 1).length).to.equal(3)
  });
  it('input is an empty answer (case where filterPrecise remove all)', () => {
    expect(filterAnswers(emptyAnswer, 1).length).to.equal(0)
  });
});

describe('filterPrecise', () => {
  const answers = [{ text: 'A', entities: ['A', 'B', 'C'], precise: true },
    { text: 'B', entities: ['A', 'B'], precise: false },
    { text: 'C', entities: ['A', 'B'], precise: false },
  ]

  it('remove one precise', () => {
    expect(filterPrecise(answers, 2).length).to.equal(2)
  });
  it('remove none', () => {
    expect(filterPrecise(answers, 3).length).to.equal(3)
  });
});
