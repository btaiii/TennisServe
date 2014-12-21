/* canvasApp for TennisServe.html
*/
var DEBUG = false;
var testData = [ [0,0,0], [-0.7, 1.1, 0.13], [-0.7, -0.5, 0.13] ];
var referenceFrame;
var testFrame;
var WIDTH;
var HEIGHT;

function canvasApp() {
  initUI();
  referenceFrame = getCanvasWithContext('#referenceImage');
  testFrame = getCanvasWithContext('#testImage');
  WIDTH = referenceFrame.canvas.width;
  HEIGHT = referenceFrame.canvas.height;
  
  $(referenceFrame.image).load( function() {
    imageToContext(referenceFrame);
    referenceFrame.imageData =
      referenceFrame.context.getImageData(0, 0, WIDTH, HEIGHT);
  });
  imageSrc(referenceFrame, 1);

  $(testFrame.image).load( function() {
    imageToContext(testFrame);
  });
  imageSrc(testFrame, 4);
  testFrame.context.createImageData(WIDTH, HEIGHT);
  $('#imageNum').text(testFrame.image.src);

  var jpgNum = /(\d)(\.jpg)/
  $('#next').click( nextImage );
  $('#automaticRegistration').click( automaticRegistration );

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
    memoryCanvas.width = WIDTH;
    memoryCanvas.height = HEIGHT;
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
    var MAX_OFFSET = 4;
    var STEP = 0.1;
    $( "#offsetX" ).spinner( {
      min: -MAX_OFFSET,
      max: MAX_OFFSET,
      step: STEP,
    // 'change' event only fired after ENTER key pressed; use 'stop' event
      stop: function( event, ui ) { manualRegistration }
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
        manualRegistration();
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
        testRegistration();
      }
    } );
    $( "input[type=button]" ).button();
    $('#maskThreshold').spinner( {
      min: 127,
      max: 255 
    } );
    $('#showMask').click( function() {
      showMask();
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
