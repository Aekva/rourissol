/* =========================================================
   ROURISSOL — HISTORIQUE
   RÈGLE GRADUÉE TABLETTE / MOBILE

   IMPORTANT :
   - ne modifie pas historique.js
   - utilise les dates générées par historique.js
   - remplace uniquement l'ancien rapporteur responsive
========================================================= */

(() => {

    const BREAKPOINT =
        window.matchMedia(
            "(max-width: 1050px)"
        );


    const section =
        document.querySelector(
            ".history-showcase"
        );


    if (!section) {
        return;
    }


    /* =====================================================
       HELPERS
    ====================================================== */

    const clamp = (
        value,
        min,
        max
    ) => {

        return Math.min(
            Math.max(
                value,
                min
            ),
            max
        );

    };


    /* =====================================================
       STATE
    ====================================================== */

    let ruler = null;

    let viewport = null;

    let track = null;


    let dateButtons = [];

    let rulerYears = [];


    let activeIndex = 0;

    let visualIndex = 0;


    let step = 120;

    let sidePadding = 0;


    let currentTranslate = 0;


    let dragging = false;

    let dragMoved = false;

    let pointerId = null;


    let startX = 0;

    let startTranslate = 0;


    let autoplayLocked = false;

    let observer = null;


    /* =====================================================
       GET HISTORY BUTTONS
    ====================================================== */

    function getDateButtons() {

        return [
            ...section.querySelectorAll(
                ".history-date"
            )
        ];

    }


    /* =====================================================
       GET ACTIVE INDEX
    ====================================================== */

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


    /* =====================================================
       STOP AUTOPLAY
    ====================================================== */

    function lockAutoplay() {

        if (
            autoplayLocked
            ||
            !dateButtons.length
        ) {
            return;
        }


        autoplayLocked = true;


        const index =
            getActiveIndex();


        /*
           On clique sur la date déjà active.

           historique.js garde donc toute la responsabilité
           de l'arrêt de l'autoplay / verrouillage utilisateur.
        */

        dateButtons[index]?.click();

    }


    /* =====================================================
       BUILD RULER
    ====================================================== */

    function buildRuler() {

        if (
            ruler
            ||
            !BREAKPOINT.matches
        ) {
            return;
        }


        dateButtons =
            getDateButtons();


        if (!dateButtons.length) {
            return;
        }


        const years =
            dateButtons.map(
                button => {

                    const year =
                        button.querySelector(
                            ".history-date-year"
                        );


                    return (
                        year?.textContent?.trim()
                        ||
                        ""
                    );

                }
            );


        /* =================================================
           ROOT
        ================================================= */

        ruler =
            document.createElement(
                "div"
            );


        ruler.className =
            "history-ruler";


        ruler.setAttribute(
            "role",
            "group"
        );


        ruler.setAttribute(
            "aria-label",
            "Chronologie interactive Rourissol"
        );


        /* =================================================
           STRUCTURE
        ================================================= */

        ruler.innerHTML = `

            <div class="history-ruler-header">

                <span class="history-ruler-header-start">
                    ${years[0]}
                </span>

                <span class="history-ruler-header-title">
                    Chronologie
                </span>

                <span class="history-ruler-header-end">
                    ${years[years.length - 1]}
                </span>

            </div>


            <div class="history-ruler-viewport">

                <div
                    class="
                        history-ruler-fade
                        history-ruler-fade-left
                    "
                    aria-hidden="true"
                ></div>


                <div
                    class="
                        history-ruler-fade
                        history-ruler-fade-right
                    "
                    aria-hidden="true"
                ></div>


                <div class="history-ruler-track">

                    <span
                        class="history-ruler-baseline"
                        aria-hidden="true"
                    ></span>

                </div>


                <span
                    class="history-ruler-index"
                    aria-hidden="true"
                ></span>

            </div>


            <div class="history-ruler-footer">
                Glisser pour parcourir
            </div>

        `;


        /* =================================================
           INSERTION

           Même emplacement que l'ancien rapporteur.
        ================================================= */

        const timeline =
            section.querySelector(
                ".history-timeline-wrapper"
            );


        timeline.insertAdjacentElement(
            "afterend",
            ruler
        );


        viewport =
            ruler.querySelector(
                ".history-ruler-viewport"
            );


        track =
            ruler.querySelector(
                ".history-ruler-track"
            );


        /* =================================================
           YEARS
        ================================================= */

        rulerYears =
            years.map(
                (year, index) => {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "history-ruler-year";


                    button.dataset.index =
                        String(index);


                    button.setAttribute(
                        "aria-label",
                        `Afficher ${year}`
                    );


                    button.innerHTML = `

                        <span class="history-ruler-year-label">
                            ${year}
                        </span>

                    `;


                    button.addEventListener(
                        "click",
                        () => {

                            if (dragMoved) {
                                return;
                            }


                            lockAutoplay();


                            selectIndex(
                                index
                            );

                        }
                    );


                    track.appendChild(
                        button
                    );


                    return button;

                }
            );


        /* =================================================
           POINTER
        ================================================= */

        viewport.addEventListener(
            "pointerdown",
            pointerDown
        );


        viewport.addEventListener(
            "pointermove",
            pointerMove
        );


        viewport.addEventListener(
            "pointerup",
            pointerUp
        );


        viewport.addEventListener(
            "pointercancel",
            pointerCancel
        );


        /* =================================================
           OBSERVER historique.js
        ================================================= */

        observer =
            new MutationObserver(
                syncFromHistory
            );


        dateButtons.forEach(
            button => {

                observer.observe(
                    button,
                    {
                        attributes: true,

                        attributeFilter: [
                            "class"
                        ]
                    }
                );

            }
        );


        /* =================================================
           INITIAL STATE
        ================================================= */

        activeIndex =
            getActiveIndex();


        visualIndex =
            activeIndex;


        requestAnimationFrame(
            () => {

                measure();

                goToIndex(
                    activeIndex,
                    false
                );

            }
        );

    }


    /* =====================================================
       MEASURE
    ====================================================== */

    function measure() {

        if (
            !viewport
            ||
            !track
        ) {
            return;
        }


        const width =
            viewport.clientWidth;


        /*
           Environ 3 à 5 dates perceptibles à l'écran.
        */

        step =
            clamp(
                width * 0.30,
                112,
                155
            );


        /*
           Padding d'une demi-largeur.

           Permet à 1969 ET 2022
           d'arriver sous le curseur central.
        */

        sidePadding =
            width / 2;


        const totalWidth =
            sidePadding
            *
            2
            +
            step
            *
            (
                dateButtons.length
                -
                1
            );


        track.style.width =
            `${totalWidth}px`;


        /* =================================================
           BASELINE
        ================================================= */

        const baseline =
            track.querySelector(
                ".history-ruler-baseline"
            );


        baseline.style.left =
            `${sidePadding}px`;


        baseline.style.width =
            `${
                step
                *
                (
                    dateButtons.length
                    -
                    1
                )
            }px`;


        /* =================================================
           POSITION YEARS
        ================================================= */

        rulerYears.forEach(
            (element, index) => {

                const x =
                    sidePadding
                    +
                    index
                    *
                    step;


                element.style.left =
                    `${x}px`;

            }
        );


        /* =================================================
           REMOVE OLD MINOR TICKS
        ================================================= */

        track
            .querySelectorAll(
                ".history-ruler-minor"
            )
            .forEach(
                tick =>
                    tick.remove()
            );


        /* =================================================
           GRADUATIONS

           4 petites graduations
           entre chaque grande date.
        ================================================= */

        const subdivisions = 5;


        for (
            let index = 0;
            index < dateButtons.length - 1;
            index++
        ) {

            for (
                let division = 1;
                division < subdivisions;
                division++
            ) {

                const tick =
                    document.createElement(
                        "span"
                    );


                tick.className =
                    "history-ruler-minor";


                if (division === 3) {

                    tick.classList.add(
                        "is-medium"
                    );

                }


                const x =
                    sidePadding
                    +
                    index
                    *
                    step
                    +
                    (
                        division
                        /
                        subdivisions
                    )
                    *
                    step;


                tick.style.left =
                    `${x}px`;


                tick.setAttribute(
                    "aria-hidden",
                    "true"
                );


                track.appendChild(
                    tick
                );

            }

        }


        goToIndex(
            visualIndex,
            false
        );

    }


    /* =====================================================
       TRANSLATE FOR INDEX
    ====================================================== */

    function translateForIndex(
        index
    ) {

        const center =
            viewport.clientWidth
            /
            2;


        const position =
            sidePadding
            +
            index
            *
            step;


        return (
            center
            -
            position
        );

    }


    /* =====================================================
       INDEX FROM TRANSLATE
    ====================================================== */

    function indexFromTranslate(
        translate
    ) {

        const center =
            viewport.clientWidth
            /
            2;


        const position =
            center
            -
            translate;


        const index =
            (
                position
                -
                sidePadding
            )
            /
            step;


        return clamp(
            index,
            0,
            dateButtons.length - 1
        );

    }


    /* =====================================================
       SET TRANSLATE
    ====================================================== */

    function setTranslate(
        value
    ) {

        currentTranslate =
            value;


        track.style.transform =
            `translate3d(${value}px, 0, 0)`;

    }


    /* =====================================================
       MOVE TO INDEX
    ====================================================== */

    function goToIndex(
        index,
        animated = true
    ) {

        if (
            !track
            ||
            !viewport
        ) {
            return;
        }


        const safeIndex =
            clamp(
                index,
                0,
                dateButtons.length - 1
            );


        visualIndex =
            safeIndex;


        if (animated) {

            viewport.classList.remove(
                "is-dragging"
            );

        }


        setTranslate(
            translateForIndex(
                safeIndex
            )
        );


        updateStates(
            safeIndex
        );

    }


    /* =====================================================
       STATES / OPACITY
    ====================================================== */

    function updateStates(
        previewIndex
    ) {

        const nearest =
            Math.round(
                previewIndex
            );


        rulerYears.forEach(
            (element, index) => {

                element.classList.toggle(
                    "is-active",
                    index === activeIndex
                );


                element.classList.toggle(
                    "is-preview",
                    index === nearest
                );


                const distance =
                    Math.abs(
                        index
                        -
                        previewIndex
                    );


                let opacity = 1;


                if (distance > 2.5) {

                    opacity = 0.08;

                } else if (
                    distance > 1.75
                ) {

                    opacity = 0.22;

                } else if (
                    distance > 0.9
                ) {

                    opacity = 0.5;

                }


                element.style.opacity =
                    String(opacity);

            }
        );

    }


    /* =====================================================
       SELECT INDEX
    ====================================================== */

    function selectIndex(
        index
    ) {

        const safeIndex =
            clamp(
                Math.round(
                    index
                ),
                0,
                dateButtons.length - 1
            );


        activeIndex =
            safeIndex;


        visualIndex =
            safeIndex;


        /*
           On laisse historique.js changer :

           - photo
           - titre
           - texte
           - compteur
           - transition
        */

        dateButtons[
            safeIndex
        ]?.click();


        goToIndex(
            safeIndex,
            true
        );

    }


    /* =====================================================
       POINTER DOWN
    ====================================================== */

    function pointerDown(
        event
    ) {

        if (
            event.pointerType === "mouse"
            &&
            event.button !== 0
        ) {
            return;
        }


        lockAutoplay();


        dragging =
            true;


        dragMoved =
            false;


        pointerId =
            event.pointerId;


        startX =
            event.clientX;


        startTranslate =
            currentTranslate;


        viewport.classList.add(
            "is-dragging"
        );


        viewport.setPointerCapture?.(
            pointerId
        );

    }


    /* =====================================================
       POINTER MOVE

       IMPORTANT :

       doigt vers GAUCHE
       → règle vers GAUCHE
       → années PLUS RÉCENTES

       doigt vers DROITE
       → règle vers DROITE
       → années PLUS ANCIENNES
    ====================================================== */

    function pointerMove(
        event
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


        const deltaX =
            event.clientX
            -
            startX;


        if (
            Math.abs(
                deltaX
            )
            >
            5
        ) {

            dragMoved =
                true;

        }


        /*
           Le rail suit réellement le doigt.
        */

        let translate =
            startTranslate
            +
            deltaX;


        const maximum =
            translateForIndex(
                0
            );


        const minimum =
            translateForIndex(
                dateButtons.length
                -
                1
            );


        translate =
            clamp(
                translate,
                minimum,
                maximum
            );


        setTranslate(
            translate
        );


        visualIndex =
            indexFromTranslate(
                translate
            );


        updateStates(
            visualIndex
        );

    }


    /* =====================================================
       POINTER UP
    ====================================================== */

    function pointerUp(
        event
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


        viewport.classList.remove(
            "is-dragging"
        );


        viewport.releasePointerCapture?.(
            pointerId
        );


        pointerId =
            null;


        /*
           Vrai slide :
           snap sur la date la plus proche.
        */

        if (dragMoved) {

            const index =
                Math.round(
                    visualIndex
                );


            selectIndex(
                index
            );


            /*
               Évite qu'un click synthétique mobile
               sélectionne une deuxième date.
            */

            setTimeout(
                () => {

                    dragMoved =
                        false;

                },
                80
            );


            return;
        }


        /*
           Simple tap dans le vide :
           retour propre sur la date active.
        */

        goToIndex(
            activeIndex,
            true
        );

    }


    /* =====================================================
       POINTER CANCEL
    ====================================================== */

    function pointerCancel() {

        if (!dragging) {
            return;
        }


        dragging =
            false;


        dragMoved =
            false;


        pointerId =
            null;


        viewport.classList.remove(
            "is-dragging"
        );


        goToIndex(
            activeIndex,
            true
        );

    }


    /* =====================================================
       SYNC AVEC historique.js
    ====================================================== */

    function syncFromHistory() {

        if (
            dragging
            ||
            !dateButtons.length
        ) {
            return;
        }


        const index =
            getActiveIndex();


        if (
            index
            ===
            activeIndex
        ) {
            return;
        }


        activeIndex =
            index;


        visualIndex =
            index;


        goToIndex(
            index,
            true
        );

    }


    /* =====================================================
       DESTROY
    ====================================================== */

    function destroyRuler() {

        if (!ruler) {
            return;
        }


        observer?.disconnect();


        observer =
            null;


        ruler.remove();


        ruler =
            null;


        viewport =
            null;


        track =
            null;


        rulerYears =
            [];


        dragging =
            false;


        dragMoved =
            false;


        pointerId =
            null;

    }


    /* =====================================================
       WAIT FOR historique.js
    ====================================================== */

    function initWhenReady(
        attempt = 0
    ) {

        if (!BREAKPOINT.matches) {
            return;
        }


        dateButtons =
            getDateButtons();


        if (dateButtons.length) {

            buildRuler();

            return;

        }


        if (attempt >= 40) {

            console.warn(
                "Historique ruler : dates introuvables."
            );

            return;

        }


        setTimeout(
            () => {

                initWhenReady(
                    attempt + 1
                );

            },
            50
        );

    }


    /* =====================================================
       BREAKPOINT
    ====================================================== */

    function handleBreakpoint() {

        if (BREAKPOINT.matches) {

            initWhenReady();

        } else {

            destroyRuler();

        }

    }


    BREAKPOINT.addEventListener?.(
        "change",
        handleBreakpoint
    );


    /* =====================================================
       RESIZE
    ====================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                !ruler
                ||
                !BREAKPOINT.matches
            ) {
                return;
            }


            measure();

        },
        {
            passive: true
        }
    );


    /* =====================================================
       START
    ====================================================== */

    if (
        document.readyState
        ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            handleBreakpoint
        );

    } else {

        handleBreakpoint();

    }

})();