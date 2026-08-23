/* =========================================================
   ROURISSOL — HISTORIQUE DIAL
   TABLETTE + MOBILE
========================================================= */

(() => {

    const BREAKPOINT =
        window.matchMedia(
            "(max-width: 1050px)"
        );


    /* =====================================================
       INIT
    ===================================================== */

    function initHistoryDial(
        attempt = 0
    ) {

        const section =
            document.querySelector(
                ".history-showcase"
            );


        if (!section) {
            return;
        }


        const timeline =
            section.querySelector(
                ".history-timeline-wrapper"
            );


        const datesContainer =
            section.querySelector(
                ".history-timeline-dates"
            );


        const dateButtons =
            datesContainer
                ? [
                    ...datesContainer.querySelectorAll(
                        ".history-date"
                    )
                ]
                : [];


        /*
           historique.js génère les dates dynamiquement.

           Si jamais ce fichier est exécuté quelques ms
           trop tôt, on attend simplement.
        */

        if (
            !timeline
            ||
            !dateButtons.length
        ) {

            if (attempt < 40) {

                setTimeout(
                    () => {

                        initHistoryDial(
                            attempt + 1
                        );

                    },

                    50
                );

            }

            return;
        }


        /*
           Évite de créer deux fois le rapporteur.
        */

        if (
            section.querySelector(
                ".history-dial"
            )
        ) {
            return;
        }


        /* =================================================
           YEARS
        ================================================= */

        const years =
            dateButtons.map(
                button => {

                    const year =
                        button.querySelector(
                            ".history-date-year"
                        );

                    return year
                        ? year.textContent.trim()
                        : "";

                }
            );


        /* =================================================
           CREATE DIAL
        ================================================= */

        const dial =
            document.createElement(
                "div"
            );


        dial.className =
            "history-dial";


        dial.setAttribute(
            "aria-label",
            "Chronologie interactive Rourissol"
        );


        dial.innerHTML = `
            <div class="history-dial-header">

                <span>
                    ${years[0]}
                </span>

                <span>
                    Chronologie
                </span>

                <span>
                    ${years[years.length - 1]}
                </span>

            </div>

            <div class="history-dial-shell">

                <div
                    class="
                        history-dial-fade
                        history-dial-fade-left
                    "
                    aria-hidden="true"
                ></div>

                <div
                    class="
                        history-dial-fade
                        history-dial-fade-right
                    "
                    aria-hidden="true"
                ></div>

                <div
                    class="history-dial-rotor"
                ></div>

                <div
                    class="history-dial-index"
                    aria-hidden="true"
                ></div>

            </div>

            <div class="history-dial-hint">
                Glisser pour parcourir
            </div>
        `;


        timeline.insertAdjacentElement(
            "afterend",
            dial
        );


        const shell =
            dial.querySelector(
                ".history-dial-shell"
            );


        const rotor =
            dial.querySelector(
                ".history-dial-rotor"
            );


        /* =================================================
           CREATE STEPS
        ================================================= */

        const dialSteps =
            years.map(
                (year, index) => {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "history-dial-step";


                    button.dataset.index =
                        index;


                    button.setAttribute(
                        "aria-label",
                        `Afficher ${year}`
                    );


                    button.innerHTML = `
                        <span
                            class="history-dial-step-year"
                        >
                            ${year}
                        </span>

                        <span
                            class="history-dial-step-marker"
                            aria-hidden="true"
                        ></span>
                    `;


                    rotor.appendChild(
                        button
                    );


                    return button;

                }
            );


        /* =================================================
           STATE
        ================================================= */

        let visualValue = 0;

        let dragging = false;

        let pointerId = null;

        let startX = 0;

        let startValue = 0;

        let dragMoved = false;

        let startTarget = null;

        let animationFrame = null;

        let autoplayLockedByDial =
            false;

        let lastObservedIndex =
            -1;


        /* =================================================
           HELPERS
        ================================================= */

        function clamp(
            value,
            min,
            max
        ) {

            return Math.max(
                min,
                Math.min(
                    max,
                    value
                )
            );

        }


        function getActiveIndex() {

            const index =
                dateButtons.findIndex(
                    button =>
                        button.classList.contains(
                            "is-active"
                        )
                );


            return index >= 0
                ? index
                : 0;

        }


        /* =================================================
           RENDER RAPPORTEUR
        ================================================= */

        function renderDial(
            value
        ) {

            visualValue =
                clamp(
                    value,
                    0,
                    dialSteps.length - 1
                );


            const width =
                shell.clientWidth;


            const height =
                shell.clientHeight;


            if (
                width === 0
                ||
                height === 0
            ) {
                return;
            }


            /*
               Ellipse correspondant à notre
               rapporteur aplati.
            */

            const radiusX =
                width * 0.43;


            const radiusY =
                height * 0.56;


            const centerX =
                width / 2;


            const centerY =
                height * 0.12;


            /*
               90° = point central inférieur.

               C'est ici que vient se placer
               la date actuellement sélectionnée.
            */

            const angleStep =
                width <= 500
                    ? 25
                    : 22;


            const nearestIndex =
                clamp(
                    Math.round(
                        visualValue
                    ),
                    0,
                    dialSteps.length - 1
                );


            dialSteps.forEach(
                (step, index) => {

                    const offset =
                        index - visualValue;


                    const distance =
                        Math.abs(
                            offset
                        );


                    /*
                       Seulement 3 à 5 dates réellement
                       perceptibles en même temps.
                    */

                    if (
                        distance > 2.75
                    ) {

                        step.style.opacity =
                            "0";


                        step.style.pointerEvents =
                            "none";


                        return;

                    }


                    step.style.pointerEvents =
                        "auto";


                    const angle =
                        90
                        +
                        (
                            offset
                            *
                            angleStep
                        );


                    const radians =
                        angle
                        *
                        Math.PI
                        /
                        180;


                    const x =
                        centerX
                        +
                        Math.cos(
                            radians
                        )
                        *
                        radiusX;


                    const y =
                        centerY
                        +
                        Math.sin(
                            radians
                        )
                        *
                        radiusY;


                    /*
                       Plus une date s'éloigne,
                       plus elle disparaît.
                    */

                    const opacity =
                        Math.max(
                            0,
                            1
                            -
                            (
                                distance
                                *
                                0.29
                            )
                        );


                    let scale;


                    if (
                        distance < 0.35
                    ) {

                        scale = 1.17;

                    } else if (
                        distance < 1.25
                    ) {

                        scale = 0.96;

                    } else {

                        scale = 0.78;

                    }


                    step.style.left =
                        `${x}px`;


                    step.style.top =
                        `${y}px`;


                    step.style.opacity =
                        `${opacity}`;


                    step.style.transform =
                        `
                            translate(
                                -50%,
                                -50%
                            )
                            scale(
                                ${scale}
                            )
                        `;


                    step.style.zIndex =
                        `${100 - Math.round(distance * 10)}`;


                    step.classList.toggle(
                        "is-preview",
                        index === nearestIndex
                    );

                }
            );

        }


        /* =================================================
           ANIMATE ROTATION
        ================================================= */

        function animateDialTo(
            target,
            duration = 480
        ) {

            cancelAnimationFrame(
                animationFrame
            );


            const start =
                visualValue;


            const difference =
                target - start;


            /*
               Rien à animer.
            */

            if (
                Math.abs(
                    difference
                )
                <
                0.001
            ) {

                renderDial(
                    target
                );

                return;

            }


            const startTime =
                performance.now();


            function frame(
                now
            ) {

                const elapsed =
                    now - startTime;


                const progress =
                    Math.min(
                        1,
                        elapsed / duration
                    );


                /*
                   easeOutCubic
                */

                const eased =
                    1
                    -
                    Math.pow(
                        1 - progress,
                        3
                    );


                renderDial(
                    start
                    +
                    difference
                    *
                    eased
                );


                if (
                    progress < 1
                ) {

                    animationFrame =
                        requestAnimationFrame(
                            frame
                        );

                }

            }


            animationFrame =
                requestAnimationFrame(
                    frame
                );

        }


        /* =================================================
           STOP AUTOPLAY ON FIRST USER TOUCH
        ================================================= */

        function lockHistoryAutoplay() {

            if (
                autoplayLockedByDial
            ) {
                return;
            }


            autoplayLockedByDial =
                true;


            const currentIndex =
                getActiveIndex();


            /*
               On utilise le bouton existant.

               historique.js va donc lui-même :
               - arrêter l'autoplay
               - verrouiller la sélection
               - conserver toute sa logique
            */

            dateButtons[
                currentIndex
            ]?.click();

        }


        /* =================================================
           SELECT HISTORY DATE
        ================================================= */

        function selectIndex(
            index
        ) {

            const safeIndex =
                clamp(
                    index,
                    0,
                    dateButtons.length - 1
                );


            const currentIndex =
                getActiveIndex();


            animateDialTo(
                safeIndex,
                300
            );


            if (
                safeIndex
                !==
                currentIndex
            ) {

                dateButtons[
                    safeIndex
                ]?.click();

            }

        }


        /* =================================================
           POINTER DOWN
        ================================================= */

        shell.addEventListener(
            "pointerdown",
            event => {

                if (
                    !BREAKPOINT.matches
                ) {
                    return;
                }


                if (
                    event.button !== undefined
                    &&
                    event.button !== 0
                ) {
                    return;
                }


                lockHistoryAutoplay();


                cancelAnimationFrame(
                    animationFrame
                );


                dragging =
                    true;


                dragMoved =
                    false;


                pointerId =
                    event.pointerId;


                startX =
                    event.clientX;


                startValue =
                    visualValue;


                startTarget =
                    event.target.closest(
                        ".history-dial-step"
                    );


                dial.classList.add(
                    "is-dragging"
                );


                shell.setPointerCapture?.(
                    event.pointerId
                );

            }
        );


        /* =================================================
           POINTER MOVE
        ================================================= */

        shell.addEventListener(
            "pointermove",
            event => {

                if (
                    !dragging
                    ||
                    event.pointerId
                    !==
                    pointerId
                ) {
                    return;
                }


                const deltaX =
                    event.clientX
                    -
                    startX;


                if (
                    Math.abs(
                        deltaX
                    )
                    >
                    4
                ) {

                    dragMoved =
                        true;

                }


                /*
                   Largeur d'un cran.

                   Automatiquement adaptée à
                   tablette / téléphone.
                */

                const pixelsPerStep =
                    clamp(
                        shell.clientWidth
                        /
                        5.1,
                        68,
                        120
                    );


                /*
                   Drag gauche =
                   avancer dans le temps.
                */

                const value =
                    startValue
                    -
                    (
                        deltaX
                        /
                        pixelsPerStep
                    );


                renderDial(
                    clamp(
                        value,
                        0,
                        dateButtons.length - 1
                    )
                );

            }
        );


        /* =================================================
           END DRAG
        ================================================= */

        function finishDrag(
            event,
            cancelled = false
        ) {

            if (
                !dragging
                ||
                event.pointerId
                !==
                pointerId
            ) {
                return;
            }


            dragging =
                false;


            dial.classList.remove(
                "is-dragging"
            );


            shell.releasePointerCapture?.(
                event.pointerId
            );


            /*
               Si on a simplement tapé directement
               sur une date, on sélectionne celle-ci.
            */

            if (
                !cancelled
                &&
                !dragMoved
                &&
                startTarget
            ) {

                const tappedIndex =
                    Number(
                        startTarget.dataset.index
                    );


                selectIndex(
                    tappedIndex
                );


            } else if (
                !cancelled
            ) {

                /*
                   Snap magnétique sur
                   le cran le plus proche.
                */

                const snappedIndex =
                    clamp(
                        Math.round(
                            visualValue
                        ),
                        0,
                        dateButtons.length - 1
                    );


                selectIndex(
                    snappedIndex
                );


            } else {

                /*
                   Scroll vertical / interruption :
                   retour à la vraie date active.
                */

                animateDialTo(
                    getActiveIndex(),
                    250
                );

            }


            pointerId =
                null;


            startTarget =
                null;

        }


        shell.addEventListener(
            "pointerup",
            event => {

                finishDrag(
                    event
                );

            }
        );


        shell.addEventListener(
            "pointercancel",
            event => {

                finishDrag(
                    event,
                    true
                );

            }
        );


        /* =================================================
           CLAVIER
        ================================================= */

        dialSteps.forEach(
            (step, index) => {

                step.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key
                            !==
                            "Enter"
                            &&
                            event.key
                            !==
                            " "
                        ) {
                            return;
                        }


                        event.preventDefault();


                        lockHistoryAutoplay();


                        selectIndex(
                            index
                        );

                    }
                );

            }
        );


        /* =================================================
           SYNCHRO AVEC historique.js
        ================================================= */

        function syncFromHistory() {

            const activeIndex =
                getActiveIndex();


            if (
                activeIndex
                ===
                lastObservedIndex
            ) {
                return;
            }


            lastObservedIndex =
                activeIndex;


            if (
                dragging
            ) {
                return;
            }


            /*
               Quand l'autoplay desktop change
               la date, le rapporteur tourne aussi.
            */

            animateDialTo(
                activeIndex,
                520
            );

        }


        const observer =
            new MutationObserver(
                syncFromHistory
            );


        dateButtons.forEach(
            button => {

                observer.observe(
                    button,
                    {
                        attributes:
                            true,

                        attributeFilter: [
                            "class"
                        ]
                    }
                );

            }
        );


        /* =================================================
           RESIZE
        ================================================= */

        window.addEventListener(
            "resize",
            () => {

                renderDial(
                    getActiveIndex()
                );

            }
        );


        BREAKPOINT.addEventListener?.(
            "change",
            () => {

                renderDial(
                    getActiveIndex()
                );

            }
        );


        /* =================================================
           INITIAL STATE
        ================================================= */

        const initialIndex =
            getActiveIndex();


        lastObservedIndex =
            initialIndex;


        visualValue =
            initialIndex;


        requestAnimationFrame(
            () => {

                renderDial(
                    initialIndex
                );

            }
        );

    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState
        ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                initHistoryDial();

            }
        );

    } else {

        initHistoryDial();

    }

})();