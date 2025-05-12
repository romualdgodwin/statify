import newman from 'newman'
import { describe } from 'node:test'

describe('Postman', () => {
  test('should run the Postman collection', () => {
    newman.run(
      {
        collection: require('../Node Demo.postman_collection.json'),
        reporters: 'cli',
      },
      function (err) {
        if (err) {
          throw err
        }
      },
    )
  })
})
