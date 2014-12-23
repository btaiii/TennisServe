var MINIMUM_GLOB_SIZE = 6;
var MAXIMUM_GLOB_ASPECT_RATIO = 2.0;
var MASK_RADIUS = 50; 
var MASK_FAIL = -1;

function testMaskOnList(globList) {
  for (var i = 0; i < globList.length; i++) {
    var fit = globList[i].testMask();
    console.log('glob, fit ', i, fit); 
  }
}

function mergeGlobList(globList) {
  do {
    var changes = false;
    for (var i = globList.length - 1; i >= 0; i--) {
      for (var j = i - 1; j >= 0; j--) {
        if (globList[i].adjacent(globList[j])) {
          globList[j].merge(globList[i]);
          globList.splice(i--,1);
          changes = true;
        }
      }
    }
  } while (changes);
}

function filterGlobList(globList) {
   return globList.filter(isGlobOK);
}

function isGlobOK(glob) {
   return (glob.data.length >= MINIMUM_GLOB_SIZE);
}

function Point(row, col) {
  this.row = row,
  this.col = col
}

Point.prototype.adjacent = function(other) {
  return Math.abs(this.row - other.row) + Math.abs(this.col - other.col) < 2;
}

function Glob(row, col) {
  this.length = 1,
  this.data = [ new Point(row, col) ],
  this.minRow = row,
  this.maxRow = row,
  this.minCol = col,
  this.maxCol = col
}

Glob.prototype.testMask = function() {
   var width = this.maxCol - this.minCol + 1;
   var height = this.maxRow - this.minRow + 1;
   var aspectRatio = Math.max(width, height) / Math.min(width,height);
   if ( aspectRatio > MAXIMUM_GLOB_ASPECT_RATIO ) return MASK_FAIL;

   var globCenterRow = Math.round( (this.minRow + this.maxRow) / 2.0 );
   var globCenterCol = Math.round( (this.minCol + this.maxCol) / 2.0 );
   var startRow = this.minRow - Math.round(MASK_RADIUS/2);
   var startCol = this.minCol - Math.round(MASK_RADIUS/2);

   // is mask within canvas boundaries?
   if (startRow < 0 || startCol < 0) return MASK_FAIL;
   if (startRow + height > HEIGHT || startCol + width > WIDTH) return MASK_FAIL;
   for (var row = startRow; row < startRow + height; row++) {
     for (var col = startCol; col < startCol + width; col++) {
     }
   }
}

// add an array of [row, col] values to the glob ... for testing purposes only
Glob.prototype.addPoints = function(points) {
    for (var i = 0; i < points.length; i++)
      this.data.push( new Point(points[i][0], points[i][1]) );
    this.length += points.length;
}

Glob.prototype.adjacent = function(other) {
// an optimization -- are globs even close?
  if (this.minRow > other.maxRow+1 || 
      this.maxRow < other.minRow-1 ||
      this.minCol > other.maxCol+1 ||
      this.maxCol < other.minCol-1) return false;
  for (var i = 0; i < this.length; i++)
    for (var j = 0; j < other.length; j++)
      if (this.data[i].adjacent(other.data[j])) return true;
  return false;
}

Glob.prototype.merge = function(other) {
  this.minRow = Math.min(this.minRow, other.minRow);
  this.maxRow = Math.max(this.maxRow, other.maxRow);
  
  this.minCol = Math.min(this.minCol, other.minCol);
  this.maxCol = Math.max(this.maxCol, other.maxCol);

  this.length += other.length;
  this.data = this.data.concat(other.data);
}
/*
x = new Glob(3,5);
y = new Glob(3,6);
z = new Glob(2,6);
console.log(x.adjacent(y));
console.log(x.adjacent(z));
console.log(y.adjacent(z));
if (x.adjacent(y)) x.merge(y);
if (x.adjacent(z)) x.merge(z);
console.log(x);
w = new Glob(1,7);
w.addPoints([ [2,7] ]);
console.log(w);
if (x.adjacent(w)) x.merge(w);
console.log(x);
*/
