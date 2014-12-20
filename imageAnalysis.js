  function automaticRegistration(referenceFrame, testFrame) {
    Debugger.log('auto'); 
    var theta = 0;
    for (var offsetX = -1; offsetX <= 1; offsetX++)
      for (var offsetY = -1; offsetY <= 1; offsetY++) {
        var subtraction = performSubtraction(referenceFrame, testFrame, offsetX, offsetY, theta);
        Debugger.log(' (offsetX, offsetY, theta) = (' + offsetX + ', ' + offsetY + ', ' + theta + ')');
        Debugger.log(' Error: ' + subtraction.error.toExponential(2) );
      }
  }

/* subtract images using spinner parameters, and refresh image on screen,
   along with error

Good values for Serve-4.jpg: (offsetX, offsetY, theta) = (-0.7, -0.5, 0.13)
   Error: 5.05e6
*/
  function manualRegistration(referenceFrame, testFrame) {
    var offsetX = $('#offsetX').spinner('value');
    var offsetY = $('#offsetY').spinner('value');
    var theta = $('#theta').spinner('value');

    var subtraction = performSubtraction(referenceFrame, testFrame, offsetX, offsetY, theta);
    testFrame.context.clearRect(0,0,testFrame.canvas.width, testFrame.canvas.height);
    testFrame.context.putImageData(subtraction.data, 0, 0);
    $('#error').text(subtraction.error.toExponential(3));
  }

  function performSubtraction(referenceFrame, testFrame, offsetX, offsetY, theta) {
    var width = testFrame.canvas.width;
    var height = testFrame.canvas.height;
    
    var referenceData = referenceFrame.imageData;
    
    testFrame.memoryContext.resetTransform();
    testFrame.memoryContext.translate(offsetX, offsetY);
    testFrame.memoryContext.rotate(theta * Math.PI / 180.0);
    testFrame.memoryContext.drawImage(testFrame.image, 0, 0 );
    var testData = testFrame.memoryContext.getImageData(0, 0, width, height);
    
    var totalError = 0; 
    for (var i = 0; i < testData.data.length; i++) {
      if ((i+1) % 4 == 0) continue;
      var error = testData.data[i] - referenceData.data[i];
      totalError += Math.abs(error);
      testData.data[i] = 127 + 0.5 * Math.max(0, error);
    }
    return {
      error: totalError,
      data: testData
    }
}

