# ConstrainImg

ConstrainImg is a command-line or progammatic tool for resizing multiple images so that they do not exceed a specified width and height.

## Command Line

### Installation

You must have GraphicsMagick installed on your machine. In Mac OS X, you can use [Homebrew](http://brew.sh/):

```
brew install graphicsmagick
```

Then, to install ConstrainImg:

```
npm install constrain-img -g
```

### Usage

```
  constrainImg myimages newimages 200 100
```

This will copy the images in the folder `myimages` to the folder `newimages` and resize them so that the width of any image does not exceed 200 pixels and the height of any image does not exceed 100.

Or more explicitly:
```
  constrainImg -s myimages -o newimages -w 200 -h 100
```

More compact syntaxes:

- `constraingImg 50 -f`: (One argument) Constrain all images in current directory to 50 width and 50 height.
- `constrainImg 50 75 -f`: (Two arguments) Constrain all images in current directory to 50 width and 75 height.


### Options

- `-s, --source`: The source folder. Defaults to the current working directory.
- `-o, --out`: The out (export) destination. Defaults to the current working directory.
- `-w, --width`: Mandatory. The constraining width.
- `-h, --height`: Mandatory. The constraining height.
- `--suffix`: A suffix to append to each filename on export.
- `--prefix`: A prefix to prepend to each filename on export.
- `--quiet`: Prevent log messages from printing.
- `-q, --quality`: Quality of compression. 0 is minimum, 100 is maximum. Defaults to 100.
- `-f, --force`: Allow source files to be overwritten.

## Programmatic

The package exports a function that takes two arguments: a dictionary of options and an optional callback.

The available options match the command line options listed above.

The callback function is node-style; its first argument is an error or null if no error occurred. There are no subsequent arguments.

The function returns a promise.

### Installation

```
npm install constrain-img
```


### Usage ###

```
var constrainImg = require('constrain-img');
constrainImg({
  source: 'myimages',
  out: 'newimages',
  width: 200,
  height: 100
  suffix: '_new',
  prefix: 'myprefix_',
  quiet: true
})
.then(function(){
  // done!
});

```
