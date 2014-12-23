/* canvasApp for TennisServe.html
*/
var DEBUG = true;
//                1           2               3(4.513)                  4(5.024)
var testData = [ [0,0,0], [0.9, -1.7, 0.05], [0.5, -0.9, 0.06], [-0.3, 0.8, 0.15] ];
var referenceFrame;
var testFrame;
var WIDTH;
var HEIGHT;
var memoryCanvas;
var memoryContext;
var subtraction;

function canvasApp() {
  referenceFrame = getCanvasWithContext('#referenceImage');
  testFrame = getCanvasWithContext('#testImage');
  WIDTH = referenceFrame.canvas.width;
  HEIGHT = referenceFrame.canvas.height;
    // storage for manipulating image in memory
  memoryCanvas = document.createElement('canvas');
  memoryCanvas.width = WIDTH;
  memoryCanvas.height = HEIGHT;
  memoryContext = memoryCanvas.getContext('2d');
  memoryContext.resetTransform = function() {
      this.setTransform(1,0,0,1,0,0);
  }
  initUI();
  
  $(referenceFrame.image).load( function() {
    referenceFrame.context.drawImage(referenceFrame.image, 0,0);
    referenceFrame.imageData =
      referenceFrame.context.getImageData(0, 0, WIDTH, HEIGHT);
  });
  imageSrc(referenceFrame, 1);

  $(testFrame.image).load( function() {
    testFrame.context.drawImage(testFrame.image, 0, 0);
  });
  imageSrc(testFrame, 4);
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

    return {
      canvas: canvas,
      context: context,
      image: image
    }
  }
    
  function nextImage() {
    var match = jpgNum.exec(testFrame.image.src);
    digit = +match[1];
    if (++digit > 4) digit = 1;
    imageSrc(testFrame, digit); 
    $('#imageNum').text(testFrame.image.src);
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
      stop: function( event, ui ) { manualRegistration(); }
    } );
    $( "#offsetY" ).spinner( {
      min: -MAX_OFFSET,
      max: MAX_OFFSET,
      step: STEP,
      stop: function( event, ui ) { manualRegistration(); }
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
    $('#showMask').click( showMask );
    $('#showCandidateGlobs').click( function() {
      var globList = showMask();
      mergeGlobList(globList);
      globList = filterGlobList(globList);
      $('#candidateCount').text(globList.length);

      // initialize to opaque black
      var subtractionData = subtraction.data.data;
      var length = subtractionData.length;
      for (var i = 0; i < length; i++) 
        subtractionData[i] = ((i+1) % 4 == 0) ? 255 : 0;

      // color the candidates and display them
      for (var i = 0; i < globList.length; i++) {
        for (var j = 0; j < globList[i].data.length; j++ ) {
          var pixel = globList[i].data[j];
          var index = (pixel.row * WIDTH + pixel.col)<<2;
          subtractionData[index] = subtractionData[index+2] = 255;
        }
      }
      testFrame.context.putImageData(subtraction.data, 0, 0);
    } );
  }
}
