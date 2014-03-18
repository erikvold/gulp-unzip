var through = require('through2');
var gutil = require('gulp-util')
var unzip = require('unzip')
var fs = require('fs')
var minimatch = require('minimatch')
var defaults = require('lodash.defaults')
module.exports = function(extractOption){
  function transform(file, enc, callback){
    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    var opts = defaults(extractOption || {}, {
      filter : function(entry){ return true },
    })

    
    // unzip file
    var self = this
    file.pipe(unzip.Parse())
      .on('entry', function(entry){
        var chunks = []

        if(!opts.filter(entry)){
          entry.autodrain()
          // skip entry
          return
        }
        
        entry.pipe(through.obj(function(chunk, enc, cb){
          // gutil.log("Find file: "+ entry.path)
          chunks.push(chunk)
          cb()
        }, function(cb){
          if(chunks.length > 0){
            self.push(new gutil.File({
              cwd : "./",
              path : entry.path,
              contents: Buffer.concat(chunks)
            }))
          }
          cb()
        }))
      }).on('close', function(){
        callback()
      })
  }
  return through.obj(transform);
}