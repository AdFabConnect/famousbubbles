/*
 * Main animation class
 * Sets elements with Famo.us engine, animate some surfaces and inits the bubbles
 * @author: Fabrice Labbé & Jonathan Vallet with AdFab Connect
 */
define(function (require, exports, module, start)
{
    // Includes famous classes
    var Engine = require('famous/core/Engine');
    var ImageSurface  = require('famous/surfaces/ImageSurface');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var Modifier       = require('famous/core/Modifier');
    var Transitionable = require('famous/transitions/Transitionable');

    var Bubble = require('app/bubble');
    var NonBounce = require('app/nonBounce');

    var currentStep = 0;
    var windowWidth = parseInt(window.innerWidth);
    var windowHeight = parseInt(window.innerHeight);
    
    // Adds the "touch the screen" text
    var mainContext = Engine.createContext();
    var titleSurface = new ImageSurface({
        content: 'images/bubbleText2.png',
        size: [undefined, true],
        properties: {
            padding: '0 5%'
        },
    });
    var titleModifier = new StateModifier({
      align: [0.5, 0.2],
      origin: [0.5, 0.2]
    });
    mainContext.add(titleModifier).add(titleSurface);
    
    // Adds icon
    var iconSurface = new ImageSurface({
        content: 'images/button.png',
        size: [120, 120],
        classes: ['startButton'],
        properties: {
            borderRadius: '50%',
            border: '0.5rem solid white',
            padding: '20px',
            id: 'startIcon'
        }
    });
    var iconModifier = new StateModifier({
      align: [0.5, 0.9],
      origin: [0.5, 0.8]
    });
    mainContext.add(iconModifier).add(iconSurface);

   // Adds Adfab icon
    var adfabSurface = new ImageSurface({
        content: 'images/bubbleText.png',
        size: [undefined, true],
        properties: {
            padding: '0 10%',
        }
    });
    var adfabModifier = new StateModifier({
      align: [0.5, 0.5],
      origin: [0.5, 0.3]
    });
    adfabModifier.setTransform(
      Transform.translate(0, window.innerHeight, 0)
    );
    mainContext.add(adfabModifier).add(adfabSurface);
   
   // Adds Zoom element
    var transitionable = new Transitionable(7);
    var opacityTransitionable = new Transitionable(0);
    var zoomSurface = new Surface({
        size:[window.innerWidth, window.innerHeight],
        classes: ['image'],
        properties: {
            background: "url('images/bottle-zoom-in.jpg') no-repeat center transparent",
            backgroundSize: 'cover',
        }
    });
    
    var zoomTextSurface = new Surface({
        size:[window.innerWidth, window.innerHeight],
        classes: ['text'],
    });

   var zoomStateModifier = new StateModifier({
      origin: [0.75, 0.5]
    });
    var zoomModifier = new Modifier();
    
    zoomModifier.transformFrom(function() {
        return Transform.scale(transitionable.get(), transitionable.get());
    });
    
    zoomModifier.opacityFrom(function() {
        return opacityTransitionable.get();
    });
    
    var zoomContext = mainContext.add(zoomStateModifier).add(zoomModifier);
    zoomContext.add(zoomSurface);

   // Adds zoom text
    var zoomTextSurface = new ImageSurface({
        content: 'images/bubbleText.png',
        size: [window.innerWidth * 0.7, window.innerWidth * 0.7 * 150 / 290],
    });
    var zoomTextModifier = new StateModifier({
      align: [0.5, 1],
      origin: [0.5, 0.98]
    });
    zoomContext.add(zoomTextModifier).add(zoomTextSurface);

    // Adds bubbles
    var bubbleView = new Bubble();
    mainContext.add(bubbleView);
    NonBounce.init('bubbleCanvas');
    bubbleView.run();
    // For those who want to debug bubbles and get some stats
    //bubbleView.debug(mainContext);

    var nextStepTimeout = setTimeout(goToNext, 2000);
   // Sets steps animations
    function goToNext() {
        titleModifier.setTransform(
          Transform.translate(0, -window.innerHeight, 0),
          { duration : 2000, curve: 'easeInOut' }
        );
        iconModifier.setTransform(
          Transform.translate(0, -window.innerHeight, 0),
          { duration : 2000, curve: 'easeInOut' }
        );
        adfabModifier.setTransform(
            Transform.translate(0, 0, 0),
            { duration : 2000, curve: 'easeInOut' }
        );
        bubbleView.removeCircleField();
    }

    setTimeout(function() {
        bubbleView.stop();
        transitionable.set(1, {curve: "easeInOut", duration: 500});
        opacityTransitionable.set(1, {curve: "easeInOut", duration: 500});
    }, 8000);
});
