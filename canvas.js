/* canvasApp for TennisServe.html
*/
function canvasApp() {
  var MAX_OFFSET = 2;
  var STEP = 0.1;
  $( "#offsetX" ).spinner( {
    min: -MAX_OFFSET,
    max: MAX_OFFSET,
    step: STEP,
  // 'change' event only fired after ENTER key pressed; use 'stop' event
    stop: function( event, ui ) {
//      imageToContext(testFrame);
        performSubtraction();
    }
  } );
  $( "#offsetY" ).spinner( {
    min: -MAX_OFFSET,
    max: MAX_OFFSET,
    step: STEP,
    stop: function( event, ui ) {
      //imageToContext(testFrame);
      performSubtraction();
    }
  } );
  $( "#theta" ).spinner( {
    min: -MAX_OFFSET,
    max: MAX_OFFSET,
    step: 0.01,
    stop: function( event, ui ) {
      imageToContext(testFrame);
      performSubtraction();
    }
  } );
  $('#alphaSlider').slider( {
    value: 0.5,
    min: 0.0,
    max: 1.01,
    step: 0.05,
    stop: function( event, ui ) {
      var alpha = $(this).slider('value').toFixed(2);
      $('#alpha').text(alpha);
    }
  });

  referenceFrame = getCanvasWithContext('#referenceImage');
  $(referenceFrame.image).load( function() {
    imageToContext(referenceFrame);
  });
  imageSrc(referenceFrame, 1);

  testFrame = getCanvasWithContext('#testImage');
  $(testFrame.image).load( function() {
    imageToContext(testFrame);
  });
  imageSrc(testFrame, 4);
  var jpgNum = /(\d)(\.jpg)/
  $('#next').click( nextImage );

  //var imageData = context.createImageData(32,32); // space for 32x32 map

  function getCanvasWithContext(id) {
    canvas = $(id)[0];
    context = canvas.getContext('2d');
    context.resetTransform = function() {
      this.setTransform(1,0,0,1,0,0);
    }

    var image = new Image();

    return {
      canvas: canvas,
      context: context,
      image: image
    }
  }
    
  function imageToContext(frame) {
    var offsetX = $('#offsetX').spinner('value');
    var offsetY = $('#offsetY').spinner('value');
    frame.context.drawImage(frame.image, offsetX, offsetY);
    $('#imageNum').text(frame.image.src);
  }

  function nextImage() {
    var match = jpgNum.exec(testFrame.image.src);
    digit = +match[1];
    if (++digit > 4) digit = 1;
    imageSrc(testFrame, digit); 
  }

  function imageSrc(frame, digit) {
    frame.image.src = 'Serve-' + digit + '.jpg';
  }

  function performSubtraction() {
    var offsetX = $('#offsetX').spinner('value');
    var offsetY = $('#offsetY').spinner('value');
    var theta = $('#theta').spinner('value');
    var width = testFrame.canvas.width;
    var height = testFrame.canvas.height;
    testFrame.context.clearRect(0,0,width,height);
    var referenceCanvas = document.createElement('canvas');
    referenceCanvas.width = 640;
    referenceCanvas.height = 480;
    var referenceContext = referenceCanvas.getContext('2d');
    referenceContext.drawImage(referenceFrame.image, 0, 0 );
    var referenceData = referenceContext.getImageData(0, 0, referenceCanvas.width, referenceCanvas.height);
    
    var testCanvas = document.createElement('canvas');
    testCanvas.width = 640;
    testCanvas.height = 480;
    var testContext = testCanvas.getContext('2d');
    testContext.translate(offsetX, offsetY);
    testContext.rotate(theta * Math.PI / 180.0);
    testContext.drawImage(testFrame.image, 0, 0 );
    var testData = testContext.getImageData(0, 0, testCanvas.width, testCanvas.height);
    
    Debugger.log(testData.data.length);
    for (var i = 0; i < testData.data.length; i++) {
      if ((i+1) % 4 == 0) continue;
      testData.data[i] = 127 + 0.5 * Math.max(0, testData.data[i] - referenceData.data[i]);
    }
    testFrame.context.putImageData(testData, 0, 0);
}
// http://stackoverflow.com/questions/11444401/perfecting-canvas-mouse-coordinates
  function getPosition(element) {
      var _x = element.offsetLeft;
      var _y = element.offsetTop;
  
      while(element = element.offsetParent) {
          _x += element.offsetLeft - element.scrollLeft;
          _y += element.offsetTop - element.scrollTop;
      }
  
      return {
          X : _x,
          Y : _y
      }
  }
}
