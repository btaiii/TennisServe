  function testRegistration() {
    var testIndex = $('#testData').spinner('value');
    var thisTest = testData[testIndex-1];
    $('#offsetX').spinner('value', thisTest[0]);
    $('#offsetY').spinner('value', thisTest[1]);
    $('#theta').spinner('value', thisTest[2]);
    manualRegistration(thisTest);
  }
  function automaticRegistration() {
    var theta = 0;
    var minX = -4.0;
    var maxX = 4.0;
    var minY = -4.0;
    var maxY = -4.0;
    var errors = {};

    var offsetY = 0.0;
    var offsetX = 0.0;
    var deltaX = 0.05;
    var eps = 0.01;

    var MAX_ITERATIONS = 0;

    for (var iteration = 1; iteration < MAX_ITERATIONS; iteration++) {
      var offsetXold = offsetX;
      var subtractionX = performSubtraction(offsetX, offsetY, theta);
      var subtractionXdX = performSubtraction(offsetX+deltaX, offsetY, theta);
      var errorPrime = (subtractionXdX.error - subtractionX.error) / deltaX;
      var change = eps * errorPrime;
      offsetX = offsetXold - change;
      Debugger.log(' Errors: ' + 
        subtractionX.error.toExponential(2) + ',' +  subtractionXdX.error.toExponential(2));
      if (offsetX < minX) offsetX = minX;
      if (offsetX > maxX) offsetX = maxX;
        Debugger.log(' (offsetX, offsetY, theta) = (' + offsetX + ', ' + offsetY + ', ' + theta + ')');
      if ( Math.abs(change) < 0.1) break;
    }

    var offsetList = [];
    var errorList = [];
    for (var offsetX = -3.5; offsetX <= 1.5; offsetX+=0.1) {
        var subtraction = performSubtraction(offsetX, offsetY, theta);
        offsetList.push(offsetX.toFixed(2));
        errorList.push(subtraction.error);
    }
    console.log(offsetList);
    console.log(errorList);
}

  function showMask() {
    var offsetX = $('#offsetX').spinner('value');
    var offsetY = $('#offsetY').spinner('value');
    var theta = $('#theta').spinner('value');
    subtraction = performSubtraction(offsetX, offsetY, theta);
    var subtractionData = subtraction.data.data;
    var length = subtractionData.length;
    var threshold = $('#maskThreshold').spinner('value');
    var globList = [];
    for (var i = 0; i < length; i+=4) {
      if (subtractionData[i] + subtractionData[i+1] - subtractionData[i+2] > threshold) {
        subtractionData[i] = subtractionData[i+1] = 255;
        var row = Math.trunc((i>>2) / WIDTH);
        var col = (i>>2) % WIDTH;
        globList.push( new Glob(row, col) );
      } else {
        subtractionData[i] = subtractionData[i+1] = 0;
      }
      subtractionData[i+2] = 0;
      subtractionData[i+3] = 255;
    }
    testFrame.context.putImageData(subtraction.data, 0, 0);
    return globList; 
  }

/* subtract images using spinner parameters, and refresh image on screen,
   along with error

Good values for Serve-4.jpg: (offsetX, offsetY, theta) = (-0.7, -0.5, 0.13)
   Error: 5.05e6
*/
  function manualRegistration(testData) {
    if (testData) {
      var offsetX = testData[0];
      var offsetY = testData[1];
      var theta = testData[2];
    } else {
      offsetX = $('#offsetX').spinner('value');
      offsetY = $('#offsetY').spinner('value');
      theta = $('#theta').spinner('value');
    }
    var subtraction = performSubtraction(offsetX, offsetY, theta);
    testFrame.context.clearRect(0,0,WIDTH, HEIGHT);
    testFrame.context.putImageData(subtraction.data, 0, 0);
    $('#error').text(subtraction.error.toExponential(3));
  }

  function performSubtraction(offsetX, offsetY, theta) {
    var referenceData = referenceFrame.imageData;
  
  memoryCanvas = document.createElement('canvas');
  memoryCanvas.width = WIDTH;
  memoryCanvas.height = HEIGHT;
  memoryContext = memoryCanvas.getContext('2d');
  memoryContext.resetTransform = function() {
      this.setTransform(1,0,0,1,0,0);
  }
    
    memoryContext.resetTransform();
    memoryContext.fillSTyle = 'black';
    memoryContext.clearRect(0, 0, WIDTH, HEIGHT);
    memoryContext.translate(offsetX, offsetY);
    memoryContext.rotate(theta * Math.PI / 180.0);
    memoryContext.drawImage(testFrame.image, 0, 0 );
    var testData = memoryContext.getImageData(0, 0, WIDTH, HEIGHT);
    
    var refString = '';
    var testString = '';
    var totalError = 0; 
    for (var i = 0; i < testData.data.length; i++) {
      if ((i+1) % 4 == 0) continue;
      if (DEBUG && i < 10) {
        refString += ' ' + referenceData.data[i];
        testString += ' ' + testData.data[i];
      }
      var error = testData.data[i] - referenceData.data[i];
      totalError += Math.abs(error);
      testData.data[i] = 127 + 0.5 * Math.max(0, error);
    }

    if (DEBUG) {
      Debugger.log('Test Data: (' + offsetX + ', ' + offsetY + ', ' + theta + ')');
      Debugger.log(refString);
      Debugger.log(testString);
      Debugger.log('Error: ' + totalError.toExponential(3));
    }
    return {
      error: totalError,
      data: testData
    }
}

