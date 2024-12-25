(function() {
    // Function to create random opacity animations
    function randomOpacityAnimation(element) {
        gsap.killTweensOf(element, { opacity: true });
        gsap.fromTo(
            element,
            { opacity: 1 },
            { duration: 0.07, opacity: Math.random(), repeat: -1 }
        );
    }

    // Function to animate particles along motion paths
    function animateParticles(element) {
        if (isAnimating) {
            currentElement = particles[particleIndex];
            gsap.set(currentElement, {
                x: gsap.getProperty(".pContainer", "x"),
                y: gsap.getProperty(".pContainer", "y"),
                scale: randomScale()
            });

            gsap.timeline()
                .to(currentElement, {
                    duration: gsap.utils.random(0.61, 6),
                    physics2D: {
                        velocity: gsap.utils.random(-23, 23),
                        angle: gsap.utils.random(-180, 180),
                        gravity: gsap.utils.random(-6, 50)
                    },
                    scale: 0,
                    rotation: gsap.utils.random(-123, 360),
                    ease: "power1",
                    onStart: randomOpacityAnimation,
                    onStartParams: [currentElement],
                    onRepeat: function(el) {
                        gsap.set(el, { scale: randomScale() });
                    },
                    onRepeatParams: [currentElement]
                });

            particleIndex++;
            particleIndex = (particleIndex >= 201) ? 0 : particleIndex;
        }
    }

    // Convert polygons to paths for animations
    MorphSVGPlugin.convertToPath("polygon");

    // DOM Elements
    var mainContainer = document.querySelector(".pContainer");
    var mainSVG = document.querySelector(".mainSVG");
    var starElement = document.querySelector("#star");
    var sparkleElement = document.querySelector(".sparkle");
    var treeElement = document.querySelector("#tree");

    // Animation flags
    var isAnimating = true;
    var colorPalette = ["#E8F6F8", "#ACE8F8", "#F6FBFE", "#A2CBDC", "#B74551", "#5DBA72", "#910B28", "#910B28", "#446D39"];
    var particleClasses = ["#star", "#circ", "#cross", "#heart"];
    var particles = [];
    var particleIndex = 0;

    // Set initial visibility
    gsap.set("svg", { visibility: "visible" });
    gsap.set(sparkleElement, { transformOrigin: "50% 50%", y: -100 });

    // Utility function to get points from a path
    function getPathPoints(selector) {
        var points = [];
        var rawPath = MotionPathPlugin.getRawPath(selector)[0];
        for (var i = 0; i < rawPath.length; i += 2) {
            points.push({ x: rawPath[i], y: rawPath[i + 1] });
        }
        return points;
    }

    var treePathPoints = getPathPoints(".treePath");
    var treeBottomPathPoints = getPathPoints(".treeBottomPath");

    // Main timeline
    var mainTimeline = gsap.timeline({ delay: 0, repeat: 0 });

    // Particle creation
    (function createParticles() {
        for (var i = 0; i < 201; i++) {
            var particle = document.querySelector(particleClasses[i % particleClasses.length]).cloneNode(true);
            mainSVG.appendChild(particle);
            particle.setAttribute("fill", colorPalette[i % colorPalette.length]);
            particle.setAttribute("class", "particle");
            particles.push(particle);
            gsap.set(particle, { x: -100, y: -100, transformOrigin: "50% 50%" });
        }
    })();

    // Animation sequence
    (function() {
        var scaleRandom = gsap.utils.random(0.5, 3, 0.001, true);

        mainTimeline
            .to(".pContainer, .sparkle", {
                duration: 6,
                motionPath: { path: ".treePath", autoRotate: false },
                ease: "linear"
            })
            .to(".pContainer, .sparkle", {
                duration: 1,
                onStart: function() { isAnimating = false; },
                x: treeBottomPathPoints[0].x,
                y: treeBottomPathPoints[0].y
            })
            .to(".pContainer, .sparkle", {
                duration: 2,
                onStart: function() { isAnimating = true; },
                motionPath: { path: ".treeBottomPath", autoRotate: false },
                ease: "linear"
            }, "-=0")
            .from(".treeBottomMask", {
                duration: 2,
                drawSVG: "0% 0%",
                stroke: "#FFF",
                ease: "linear"
            }, "-=2");
    })();

    // Additional masks
    mainTimeline
        .from([".treePathMask", ".treePotMask"], {
            drawSVG: "0% 0%",
            stroke: "#FFF",
            stagger: { each: 6 },
            duration: gsap.utils.wrap([6, 1, 2]),
            ease: "linear"
        })
        .from(".treeStar", {
            duration: 3,
            scaleY: 0,
            scaleX: 0.15,
            transformOrigin: "50% 50%",
            ease: "elastic(1, 0.5)"
        }, "-=4")
        .to(".sparkle", {
            duration: 3,
            opacity: 0,
            ease: "rough({ strength: 2, points: 100, template: linear, taper: both, randomize: true, clamp: false })"
        }, "-=0")
        .to(".treeStarOutline", {
            duration: 1,
            opacity: 1,
            ease: "rough({ strength: 2, points: 16, template: linear, taper: none, randomize: true, clamp: false })"
        }, "+=1");

    // Complete animation
    mainTimeline.add(mainTimeline, 0);

    // Adjust global timeline time scale
    gsap.globalTimeline.timeScale(1.5);

    // Callback for foreignObject opacity
    mainTimeline.vars.onComplete = function() {
        gsap.to('foreignObject', { opacity: 1 });
    };
})();
