/*
 * Bubble class
 * Draws hundreds of bubble particles on screen, animated with Famo.us physic engine
 * @author: Jonathan Vallet with AdFab Connect
 */
define(function(require, exports, module) {
    "use strict";
    
    var View = require('famous/core/View'),
        Vector = require('famous/math/Vector'),
        Engine = require("famous/core/Engine"),
        Surface = require("famous/core/Surface"),
        Particle = require('famous/physics/bodies/Particle');
    var RenderNode = require('famous/core/RenderNode');

    var PhysicsEngine = require('famous/physics/PhysicsEngine');
    var VectorField = require('famous/physics/forces/VectorField');      //Gravity

    var maxParticleNumber = 10000, // max particule number before stop emitting
        maxEmissionRate = 3, // maximum number of bubble emitted every frame
        bubbleSizeRatio = window.innerWidth / 380, // The size of a bubble from window size (for portrait format only, then don't check height/orientation)
        isDebugMode = false,
        isRunning = false,
        emissionRate,
        now, debugElement; // Debug data

    var bubbleImageList = [
        {image: document.getElementById('bubble_1'), width: 32, height: 64},
        {image: document.getElementById('bubble_2'), width: 37, height: 32},
        {image: document.getElementById('bubble_3'), width: 50, height: 19},
        {image: document.getElementById('bubble_4'), width: 33, height: 35},
        {image: document.getElementById('bubble_5'), width: 46, height: 44},
    ];

    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Initiate the physics engine
    var PE = new PhysicsEngine();
    
    // Creates gravity 
    var gravity = new VectorField({
        direction: [0, -1, 0],
        name : VectorField.FIELDS.CONSTANT,
        strength : 0.0005
    });
    
    var gravityAgentId = PE.attach([gravity]);
    
    function Bubble() {
        View.apply(this, arguments);
    }

    Bubble.prototype = Object.create(View.prototype);
    Bubble.prototype.constructor = Bubble;
    Bubble.DEFAULT_OPTIONS = {};
   
    /*
     * Renders the bubble canvas
     */
    Bubble.prototype.render = function render() {
        // Clears view, then updates bubble positions, then draw canvas
        clear();
        PE.step();
        //Updates particles: add new ones, moves and removes particles
        addNewParticles();
        plotParticles();
        checkEmissionRate();
    };

    /**
     * Clears the canvas every frame 
     */    
    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    
    /*
     * Checks the emission rate the particle on the canvas
     */
    function checkEmissionRate() {
        // Reduces emission rate for slow devices
        var currentTime = new Date();
        var fps = Math.floor(1000 / (currentTime - now));
        if(fps < 30 && emissionRate > 1) {
            --emissionRate;
        } else if(fps < 25) {
            emissionRate = 1;
        } else if(emissionRate < maxEmissionRate) {
            ++emissionRate;
        }
        if(isDebugMode) {
            debugElement.setContent(fps + ' - ' + particleList.length);
        }
        now = currentTime;
    };

    /*
     * Updates canvas dimensions when window is resized
     */
    Bubble.prototype.resize = function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        bubbleSizeRatio = window.innerWidth / 380;
    };
        
    function Field(position, mass) {
        this.position = position;
        this.mass = mass || 100;
    };

    /*
     * Particle emitter
     */
    function Emitter() {};

    Emitter.prototype.emitParticle = function () {
        // Sets particle data
        var particleImage = bubbleImageList[Math.floor(Math.random() * 5)];
        var width = Math.ceil(particleImage.width * bubbleSizeRatio);
        var height = Math.ceil(particleImage.height * bubbleSizeRatio);
        var image = particleImage.image;
        var position = new Vector(Math.random() * canvas.width - width / 2, canvas.height);

        // New velocity based off of the calculated angle and magnitude
        var velocity = new Vector(0, - 0.33 * (0.8 + Math.random() * 0.4));

        var particle = new Particle({
            position: position,
            velocity: velocity,
        });
        
        // Ads the particule to the physic engine
        PE.addBody(particle);
        // Attach the gravity to the particle
        PE.attachTo(gravityAgentId, particle);
        
        return {
            particle: particle,
            image: image,
            width: width,
            height: height
        };
    };
    
    function addNewParticles() {
        // if we're at our max or not running, stop emitting.
        if (!isRunning || particleList.length > maxParticleNumber)
            return;

        // for each emitter
        if(emissionRate > 0) {
            for (var emitNumber = 0; emitNumber < emissionRate; ++emitNumber) {
                particleList.push(emitter.emitParticle());
            }
        }
    };

    /**
     * Checks if particles are out of range, 
     */
    function plotParticles() {
        // a new array to hold particles within our bounds
        for (var i = 0; i < particleList.length; ++i) {
            var particle = particleList[i].particle;
            var pos = particle.position;
            // If we're out of bounds, drop this particle and move on to the next
            var particleWidth = particleList[i].width;
            var particleHeight = particleList[i].height;
            if ((pos.x + particleWidth) < 0 || pos.x > canvas.width || pos.y + particleHeight < 0 || pos.y > canvas.height) {
                // Removes the particle of the list
                particleList.splice(i--, 1);
                // Removes the particle from physic engine
                PE.removeBody(particle);
                continue;
            }

            // Update velocities and accelerations to account for the fields
            var totalAccelerationX = 0;

            // for each passed field
            for (var fieldIndex = 0; fieldIndex < fields.length; ++fieldIndex) {
                var field = fields[fieldIndex];
                // find the distance between the particle and the field
                var vectorX = field.position.x - particle.position.x - particleWidth / 2;
                var vectorY = field.position.y - particle.position.y;

                // calculate the force of the field on particle
                var force = field.mass / Math.pow(vectorX * vectorX + vectorY * vectorY, 1.5);
                // add to the total acceleration the force adjusted by distance
                totalAccelerationX += vectorX * force / 10;
            }

            // update our particle's acceleration
            particle.applyImpulse(new Vector(totalAccelerationX, 0));
            
            ctx.drawImage(particleList[i].image, (particle.position.x) | 0, (particle.position.y)| 0, particleList[i].width, particleList[i].height);
        }
    };

    var particleList = [];
    
    var emitter = new Emitter();
    var fields = [];
    var fieldMass = -3.5 * canvas.width;

    /*
     * Sets events to add/remove fields from fingers
     */
    document.body.addEventListener('touchstart', function(e) {
        var touch = e.touches[0] || e.changedTouches[0];
        // Multitouch can be managed with multiple fields
        fields = [new Field(new Vector(touch.pageX, touch.pageY), fieldMass)];
        e.preventDefault();
        return false;
    }, false);
    
    document.body.addEventListener('touchmove', function(e) {
        var touch = e.touches[0] || e.changedTouches[0];
        fields = [new Field(new Vector(touch.pageX, touch.pageY), fieldMass)];
        e.preventDefault();
        return false;
    }, false);

    document.body.addEventListener('touchend', function(e) {
        fields = [];
    }, false);

    Bubble.prototype.removeCircleField = function removeCircleField() {
        fields = [];
    };

    Bubble.prototype.debug = function debug(context) {
        var Surface = require('famous/core/Surface');
        var p = new Surface({
            position: [0, 0],
        });
        context.add(p);
        debugElement = p;
        isDebugMode = true;
        now = new Date();
    };

    Bubble.prototype.run = function run() {
        emissionRate = maxEmissionRate;
        isRunning = true;
        // Add one field located at circle button position
        setTimeout(function() {
            var circleButton = document.querySelector('.startButton').getBoundingClientRect();
            fields = [new Field(new Vector(circleButton.left + circleButton.width / 2, circleButton.top + circleButton.height), fieldMass)];
        }, 100);
    };

    Bubble.prototype.stop = function stop() {
        isRunning = false;
    };
    
    Bubble.prototype.isRunning = function isRunning() {
        return isRunning;
    };
    
    module.exports = Bubble;
});