var cursor = document.querySelector(".cursor");
var cursor2 = document.querySelector(".cursor2");

document.addEventListener("mousemove", function(e){
    cursor.style.cssText = cursor2.style.cssText = "left: " + e.clientX 
    + "px; top: " + e.clientY + "px;";
})

document.addEventListener('DOMContentLoaded', function () {
    const sliderContainer = document.querySelector('.slider');
    const indicators = document.querySelectorAll('.index');
    const path = document.querySelector('svg path');
    const line1 = document.querySelector('.line-1');
    const line2 = document.querySelector('.line-2');
    const link = document.querySelector('.link');
    const linkWrapper = document.querySelector('.link-wrapper');

    const linkUrls = [
        'url1', 
        'url2',
        'url3',
        'url4',
        'url5'
    ];
    const totalSlides = 5;
    
    let currentSlideIndex = 1;
    let isAnimating = false;
    let currentTopValue = 0;

    window.addEventListener('wheel', (e) => {
        if (isAnimating) return;
        if (e.deltaY > 0) showNextSlide();
        else if (e.deltaY < 0) showPrevSlide();
    });

    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, idx) => {
        const img = slide.querySelector('img');
        if (idx === 0) {
            gsap.set(slide, { zIndex: 1 });
            gsap.set(img, { scale: 1, top: "0" });
        } else {
            gsap.set(slide, {
                clipPath: `polygon(0 100%, 100% 100%, 100% 0, 0 0)`,
                zIndex: 0,
            });
            gsap.set(img, { scale: 2, top: "4em" });
        }
    });

    function showNextSlide() {
        const currentSlide = document.querySelector(`#slide-${currentSlideIndex}`);

        currentSlideIndex++;
        if(currentSlideIndex > totalSlides){ // iff
            currentSlideIndex = 1;
        }

        let nextSlide = document.querySelector(`#slide-${currentSlideIndex}`);
        if (!nextSlide) {
            nextSlide = createSlide(currentSlideIndex);
            sliderContainer.appendChild(nextSlide);
        }

        animateSlideTransition(currentSlide, nextSlide, "down");
    }

    function showPrevSlide() {
        const currentSlide = document.querySelector(`#slide-${currentSlideIndex}`);
        const prevSlideIndex = currentSlideIndex - 1;

        let prevSlide = document.querySelector(`#slide-${prevSlideIndex}`);
        if (!prevSlide) {
            prevSlide = createSlide(prevSlideIndex);
            sliderContainer.insertBefore(prevSlide, sliderContainer);
        }

        animateSlideTransition(currentSlide, prevSlide, "up");
        currentSlideIndex--;

        if(currentSlideIndex < 1){
            currentSlideIndex = totalSlides;  //IFF
        }
    }

    function createSlide(slideNumber) {
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.id = `slide-${slideNumber}`;

        const img = document.createElement('img');
        img.src = getImgSource(slideNumber);
        img.alt = "";

        slide.appendChild(img);

        gsap.set(slide, {
            clipPath: `polygon(0 100%, 100% 100%, 100% 100%, 0 100%)`,
            zIndex: 0,
        });
        gsap.set(img, { scale: 2, top: "4em" });

        return slide;
    }

    function animateSlideTransition(currentSlide, nextSlide, direction) {
        if (isAnimating) return;
        isAnimating = true;

        const currentImg = currentSlide.querySelector('img');
        const nextImg = nextSlide.querySelector('img');

        gsap.set(nextSlide, {
            clipPath: direction === "up"
                ? `polygon(0 0, 100% 0, 100% 0, 0 0)`
                : `polygon(0 100%, 100% 100%, 100% 100%, 0 100%)`,
        });
        gsap.set(nextImg, { scale: 2, top: "4em" });
        gsap.set(currentSlide, { zIndex: 1 });
        gsap.set(nextSlide, { zIndex: 2 });

        updateSlideTitle(direction === "up" ? currentSlideIndex - 1 : currentSlideIndex);
        updateIndicators(direction === "up" ? currentSlideIndex - 1 : currentSlideIndex);
        updateLink(direction === "up" ? currentSlideIndex - 1 : currentSlideIndex);

        const timeline = gsap.timeline({
            onComplete: () => {
                gsap.set(currentSlide, { zIndex: 0 });
                gsap.set(nextSlide, { zIndex: 1 });
                cleanupSlide();
                isAnimating = false;
            },
        });

        timeline.add(animateCircle(), 0);
        timeline.add(animateText(), 0);

        timeline.to(currentImg, {
            scale: 1,
            top: "4em",
            duration: 2,
            ease: "power3.inOut",
        }, 0)
        .to(nextSlide, {
            clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
            duration: 2,
            ease: "power4.inOut",
        }, 0)
        .to(nextImg, {
            scale: 1,
            top: "0",
            duration: 2,
            ease: "power3.inOut",
        });
    }

    function updateSlideTitle(index) {
        const displayTitle = normalizeSlideTitle(index);
        const multiplier = window.innerWidth > 900 ? 120 : 150;
        currentTopValue = -(displayTitle - 1) * multiplier;

        gsap.to(document.querySelector('.postfix'), {
            y: `${currentTopValue}px`,
            duration: 2,
            ease: "power4.inOut",
        });
    }

    function cleanupSlide() {
        const slides = document.querySelectorAll(".slide"); // Fixed selector
        slides.forEach((slide) => {
            const slideNumber = parseInt(slide.id.split("-")[1]);
            if (Math.abs(slideNumber - currentSlideIndex) > 2) {
                slide.remove();
            }
        });
    }

    function normalizeSlideTitle(number) {
        let normalized = number;
        while (normalized <= 0) normalized += totalSlides;
        return ((normalized - 1) % totalSlides) + 1;
    }

    function getImgSource(slideNumber) {
        return `img/${normalizeSlideTitle(slideNumber)}.jpg`;
    }

    function updateIndicators(index) {
        const normalizedIndex = normalizeSlideTitle(index);

        indicators.forEach((indicator) => {
            gsap.to(indicator, {
                scale: 0.8,
                duration: 2,
                ease: "power4.inOut",
            });
        });

        gsap.to(indicators[normalizedIndex - 1], {
            scale: 1.5,
            duration: 2,
            ease: "power4.inOut",
        });
    }

    function createNewText() {
        const line1Text = document.createElement("p");
        const line2Text = document.createElement("p");

        line1Text.textContent = "View";
        line2Text.textContent = "Project";

        gsap.set([line1Text, line2Text], {
            y: 30,
        });

        return { line1Text, line2Text };
    }

    function animateText() {
        const tl = gsap.timeline();
        const currentLine1 = line1.querySelector('p');
        const currentLine2 = line2.querySelector('p');
        const { line1Text, line2Text } = createNewText();

        tl.to([currentLine1, currentLine2], {
            y: -30,
            stagger: 0.1,
            delay: 0.25,
            duration: 1,
            ease: "power3.inOut",
            onComplete: () => {
                currentLine1.remove();
                currentLine2.remove();
            }
        });

        line1.appendChild(line1Text);
        line2.appendChild(line2Text);

        tl.to([line1Text, line2Text], {
            y: 0,
            stagger: 0.1,
            delay: 0.75,
            duration: 1,
            ease: "power3.inOut",
        }, "<");

        return tl;
    }

    function updateLink(index) {
        const normalizedIndex = normalizeSlideTitle(index) - 1;
        const linkElement = document.querySelector(".link-wrapper a");
        linkElement.href = linkUrls[normalizedIndex];
    }

    const length = path.getTotalLength(); // Fixed method name
    gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: 0,
        rotation: -90,
        transformOrigin: "center center",
    });

    function animateCircle() {
        const tl = gsap.timeline();

        tl.set(path, {
            strokeDashoffset: 0,
            strokeDasharray: length,
            scale: 1,
        })
        .to(path, {
            strokeDashoffset: -length,
            duration: 1,
            ease: "power2.inOut",
        })
        .set(path, { strokeDashoffset: length })
        .to(path, {
            strokeDashoffset: 0,
            duration: 1,
            ease: "power2.inOut",
        });

        return tl;
    }

    function xTo(value) {
        gsap.to(linkWrapper, { x: value, duration: 0.5 });
    }

    function yTo(value) {
        gsap.to(linkWrapper, { y: value, duration: 0.5 });
    }

    link.addEventListener("mousemove", (e) => { // Added (e) parameter
        const rect = link.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;

        xTo(relX * 0.5);
        yTo(relY * 0.5);
    });

    link.addEventListener("mouseleave", () => {
        xTo(0);
        yTo(0);
    });

    gsap.set(linkWrapper, {
        x: 0,
        y: 0,
        xPercent: -50,
        yPercent: -50,
    });

    updateLink(1); // Initialize the link
});




