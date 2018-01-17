/* eslint no-underscore-dangle: "off" */

import { expect } from 'chai'
import rewire from 'rewire'
import Tests from '../model/test'
import mongoose from 'mongoose'
import logger from '../lib/logger'
import _ from 'lodash'
import * as Message from '../lib/message'


const rewiredMessage = rewire('../lib/message')
const getEntities = rewiredMessage.__get__('getEntities');
const getEntitiesValues = rewiredMessage.__get__('getEntitiesValues');

describe('tests Recast', () => {

  before(function (done) {

    mongoose.Promise = global.Promise
    mongoose.connect(`mongodb://${process.env.mongodbuser}:${process.env.mongodbpassword}@${process.env.mongodburl}`, { useMongoClient: true })
    const db = mongoose.connection

    Tests.find({ 'species':'lapin' }).sort({ name: 1 })
    .then( (testsSet) => {
        describe('Generated tests from Kadmin', function () {
            testsSet.forEach(function (test) {
                it(test.userInput, async function () {
                    const result = await Message.analyseMessage({text:test.userInput})
                    let recastTags = getEntities(result)
                    recastTags.concat(await getEntitiesValues(result))
                    recastTags = _.sortBy(recastTags, [function(o) { return o }]);
                    const dataSet = _.sortBy(test.tags, [function(o) { return o }]);

                    expect(recastTags).to.deep.equal(dataSet)

                });
            });
            done()
        })
      })

  })


    it('This is a required placeholder to allow before() to work', function () {
    });


});
