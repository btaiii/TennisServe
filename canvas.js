/* canvasApp for TennisServe.html
*/
function canvasApp() {
  var testData = [ [0,0,0], [-0.7, -0.5, 0.13] ];
  initUI();
  var referenceFrame = getCanvasWithContext('#referenceImage');
  $(referenceFrame.image).load( function() {
    imageToContext(referenceFrame);
    referenceFrame.imageData =
      referenceFrame.context.getImageData(0, 0, referenceFrame.canvas.width, referenceFrame.canvas.height);
  });
  imageSrc(referenceFrame, 1);

  var testFrame = getCanvasWithContext('#testImage');
  $(testFrame.image).load( function() {
    imageToContext(testFrame);
  });
  imageSrc(testFrame, 4);
  $('#imageNum').text(testFrame.image.src);
  var jpgNum = /(\d)(\.jpg)/
  $('#next').click( nextImage );
  $('#automaticRegistration').click( function() {
    automaticRegistration(referenceFrame, testFrame);
  } );

  //var imageData = context.createImageData(32,32); // space for 32x32 map

  function getCanvasWithContext(id) {
    canvas = $(id)[0];
    context = canvas.getContext('2d');
    context.resetTransform = function() {
      this.setTransform(1,0,0,1,0,0);
    }

    var image = new Image();
    // storage for manipulating image in memory
    var memoryCanvas = document.createElement('canvas');
    memoryCanvas.width = canvas.width;
    memoryCanvas.height = canvas.height;
    var memoryContext = memoryCanvas.getContext('2d');
    memoryContext.resetTransform = function() {
      this.setTransform(1,0,0,1,0,0);
    }

    return {
      canvas: canvas,
      context: context,
      memoryCanvas: memoryCanvas,
      memoryContext: memoryContext,
      image: image
    }
  }
    
  function imageToContext(frame) {
    var offsetX = $('#offsetX').spinner('value');
    var offsetY = $('#offsetY').spinner('value');
    frame.context.drawImage(frame.image, offsetX, offsetY);
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

  function initUI() {
    var MAX_OFFSET = 2;
    var STEP = 0.1;
    $( "#offsetX" ).spinner( {
      min: -MAX_OFFSET,
      max: MAX_OFFSET,
      step: STEP,
    // 'change' event only fired after ENTER key pressed; use 'stop' event
      stop: function( event, ui ) {
          manualRegistration(referenceFrame, testFrame);
      }
    } );
    $( "#offsetY" ).spinner( {
      min: -MAX_OFFSET,
      max: MAX_OFFSET,
      step: STEP,
      stop: function( event, ui ) {
        manualRegistration(referenceFrame, testFrame);
      }
    } );
    $( "#theta" ).spinner( {
      min: -MAX_OFFSET,
      max: MAX_OFFSET,
      step: 0.01,
      stop: function( event, ui ) {
        manualRegistration(referenceFrame, testFrame);
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
    $( "#testData" ).spinner( {
      min: 0,
      max: testData.length - 1,
      stop: function( event, ui ) {
        testRegistration(referenceFrame, testFrame);
      }
    } );
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
