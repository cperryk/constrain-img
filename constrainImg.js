#! /usr/bin/env node
var gm = require('gm');
var fs = require('fs-extra');
var minimatch = require('minimatch');
var promisify = require('es6-promisify');
var path = require('path');
fs.readdirAsync = promisify(fs.readdir);
fs.ensureDirAsync = promisify(fs.ensureDir);

function constrainImages(conf, cb){
  var source_dir = conf.source;
  var target_dir = conf.out;
  var quality = conf.quality || 100;
  var force = conf.force || false;

  return fs.ensureDirAsync(target_dir)
    .then(function(){
      return fs.readdirAsync(source_dir);
    })
    .then(function(files){
      return files.filter(function(file_name){
          return minimatch(file_name, '*.+(jpg|png|jpeg|gif)');
      });
    })
    .then(function(file_names){
      return file_names.map(function(file_name){
          var source_path = path.resolve(source_dir + '/' + file_name);
          var target_path = path.resolve(getTargetPath(file_name));
          if(force === false && (source_path === target_path)){
            if(require.main === module){
              throw('FAILED: Use the -f or --force flags to overwrite existing files.');
            }
            else{
              throw('Set the "force" option to true to overwrite existing files.');
            }
          }
          return {
            target_path: target_path,
            gm: gm(source_path)
          };
        });
    })
    .then(function(imgs){
      var promises = imgs.map(function(img){
        img.gm.quality(quality);
        return constrainImg(img.gm)
          .then(function(){
            return writeImg(img.gm, img.target_path);
          });
      });
      return Promise.all(promises);
    })
    .then(function(){
      log('constrainImg complete!');
      if(cb) cb();
      return;
    })
    .catch(function(err){
      if(require.main === module){
        console.log(err);
      }
      if(cb) cb(err);
      return;
    });

  function constrainImg(img){
    return new Promise(function(resolve, reject){
      img.size(function(err, size){
        var width = conf.width || size.width;
        var height = conf.height || size.height;
        var bound_ar  = width / height;
        if(err){
          return reject(err);
        }
        // if both dimensions are smaller, just write the original image
        if(size.width < width && size.height < height){
          return resolve(img);
        }
        // get source image aspect ratio
        var ar = size.width / size.height;
        // if source is wider proportionally than bound, or aspect ratios are equivalent
        if(ar >= bound_ar){
          // constrain by width
          img.resize(width, null);
        }
        // if source is taller proportionally than bound
        else if(ar < bound_ar){
          // constrain by height
          img.resize(null, height);
        }
        return resolve(img);
      });
    });
  }

  function writeImg(img, target_path){
    return new Promise(function(resolve, reject){
      img.write(target_path, function(err){
        if(err){
          reject(err);
        }
        else{
          log('exported: ' + target_path);
          resolve();
        }
      });
    });
  }

  function getTargetPath(fn){
    // fn means source file name
    if(conf.prefix){
      fn = conf.prefix + fn;
    }
    if(conf.suffix){
      fn =
        fn.substring(fn, fn.lastIndexOf('.')) + // path with no extension
        conf.suffix + // suffix
        fn.substring(fn.lastIndexOf('.'), fn.length); // extension
    }
    return  target_dir + '/' + fn;
  }

  function log(s){
    if(!conf.quiet){
      console.log(s);
    }
  }

}

if(require.main === module){
  var program = require('commander');
  program
    .version('0.0.1')
    .option('-w, --width <n>', 'Define max width', parseInt)
    .option('-h, --height <n>', 'Define max height', parseInt)
    .option('-s, --source [source]', 'Define source directory') // The source directory. Deafults to current working directory.
    .option('-o, --out [target]', 'Define export directory') // The target directory. Defaults to current working directory.
    .option('--suffix [suffix]', 'Suffix appended output filenames') // string to append to out file names
    .option('--prefix [prefix]', 'Prefix prepended to output filenames') // string to prefix to out file names
    .option('-q, --quality <n>', 'Compression quality')
    .option('--quiet')
    .option('-f, --force', 'Overwrite existing files')
    .arguments('<cmd> [env]')
    .parse(process.argv);
  var args = (function(){
    var args = program.args;
    if(args.length === 1){
      return {
        width: args[0],
        source: '.',
        out: '.'
      };
    }
    if(args.length === 2){
      return {
        width: args[0],
        height: args[1]
      };
    }
    return {
      source: args[0],
      out: args[1],
      width: args[2],
      height: args[3]
    };
  }());
  constrainImages({
    source: program.source || args.source || process.cwd(),
    out: program.out || args.out || process.cwd(),
    width: program.width || args.width,
    height: program.height || args.height,
    prefix: program.prefix,
    suffix: program.suffix,
    quiet: program.quiet,
    quality: program.quality,
    force: program.force
  });
}
else{
  module.exports = constrainImages;
}
