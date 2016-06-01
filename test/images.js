
var assert = require('assert');
var _ = require('lodash');
var async = require('async');
var apos;

var mockImages = [
  {
    type: 'apostrophe-image',
    slug: 'image-1',
    published: true,
    attachment: {
      width: 500,
      height: 400
    }
  },
  {
    type: 'apostrophe-image',
    slug: 'image-2',
    published: true,
    attachment: {
      width: 500,
      height: 400
    }
  },
  {
    type: 'apostrophe-image',
    slug: 'image-3',
    published: true,
    attachment: {
      width: 150,
      height: 150
    }
  },
];

describe('Images', function() {

  this.timeout(5000);

  it('should be a property of the apos object', function(done) {
    this.timeout(5000);
    this.slow(2000);

    apos = require('../index.js')({
      root: module,
      shortName: 'test',
      hostName: 'test.com',
      modules: {
        'apostrophe-express': {
          port: 7951
        }
      },
      afterInit: function(callback) {
        assert(apos.images);
        // In tests this will be the name of the test file,
        // so override that in order to get apostrophe to
        // listen normally and not try to run a task. -Tom
        apos.argv._ = [];
        return callback(null);
      },
      afterListen: function(err) {
        // assert(!err);
        done();
      }
    });
  });

  // Test pieces.list()
  it('should clean up any existing images for testing', function(done) {
    return apos.docs.db.remove({ type: 'apostrophe-image' }, function(err) {
      assert(!err);
      return done();
    });
  });

  it('should add images for testing', function(done) {
    assert(apos.images.insert);
    return async.each(mockImages, function(image, callback) {
      return apos.images.insert(adminReq(), image, callback);
    }, function(err) {
      assert(!err);
      done();
    });
  });

  it('should respect minSize filter', function(done) {
    var req = anonReq();
    return apos.images.find(req).minSize([ 200, 200 ]).toArray(function(err, images) {
      assert(!err);
      assert(images.length === 2);
      return done();
    });
  });

  it('should respect minSize filter in toCount, which uses a cloned cursor', function(done) {
    var req = anonReq();
    return apos.images.find(req).minSize([ 200, 200 ]).toCount(function(err, count) {
      assert(!err);
      assert(count === 2);
      return done();
    });
  });

// mock up a request
  function anonReq() {
    return {
      res: {
        __: function(x) { return x; }
      },
      browserCall: apos.app.request.browserCall,
      getBrowserCalls: apos.app.request.getBrowserCalls,
      query: {}
    };
  }

  function adminReq() {
    return _.merge(anonReq(), {
      user: {
        _id: 'testfileuser',
        _permissions: {
          admin: true
        }
      }
    });
  }

})
