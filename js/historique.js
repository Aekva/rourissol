/* =========================================================
   ROURISSOL — HISTORIQUE
========================================================= */

const historyData = [
    {
        year: "1969",
        title: "Création",
        image: "images/historique/1969.jpg",
        text:
            "Raymond Rourissol fonde l’entreprise, initialement spécialisée dans la construction de maisons individuelles."
    },

    {
        year: "1986",
        title: "Transmission",
        image: "images/historique/1986.jpg",
        text:
            "Alain et Roland Rourissol reprennent l’entreprise et développent progressivement le bâtiment collectif et le génie civil."
    },

    {
        year: "2011",
        title: "Montpellier",
        image: "images/historique/2011.jpg",
        text:
            "Rourissol poursuit son développement avec l’ouverture d’un site technique à Montpellier."
    },

    {
        year: "2014",
        title: "Un nouveau cap",
        image: "images/historique/2014.jpg",
        text:
            "L’entreprise franchit une nouvelle étape dans son développement et renforce ses collaborations avec de grands acteurs du secteur."
    },

    {
        year: "2018",
        title: "3e génération",
        image: "images/historique/2018.jpg",
        text:
            "Sophie Rourissol, petite-fille du fondateur, prend la tête de l’entreprise et poursuit l’histoire familiale."
    },

    {
        year: "2020",
        title: "Le Var",
        image: "images/historique/2020.jpg",
        text:
            "Création d’une agence dans le Var afin de poursuivre le développement de Rourissol sur l’Arc méditerranéen."
    },

    {
        year: "2022",
        title: "Nouveau siège",
        image: "images/historique/2022.jpg",
        text:
            "Rourissol inaugure son nouveau siège social à Alès, symbole d’une nouvelle étape dans le développement de l’entreprise."
    }
];


/* =========================================================
   ROOT
========================================================= */

const historySection =
    document.querySelector(
        ".history-showcase"
    );


if (historySection) {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const image =
        historySection.querySelector(
            ".history-media-image"
        );

    const media =
        historySection.querySelector(
            ".history-media"
        );

    const mediaYear =
        historySection.querySelector(
            ".history-media-year"
        );

    const year =
        historySection.querySelector(
            ".history-active-year"
        );

    const title =
        historySection.querySelector(
            ".history-active-title"
        );

    const text =
        historySection.querySelector(
            ".history-active-text"
        );

    const counter =
        historySection.querySelector(
            ".history-counter"
        );

    const status =
        historySection.querySelector(
            ".history-status"
        );

    const copy =
        historySection.querySelector(
            ".history-copy-content"
        );

    const datesContainer =
        historySection.querySelector(
            ".history-timeline-dates"
        );

    const progress =
        historySection.querySelector(
            ".history-timeline-progress"
        );


    /* =====================================================
       SAFETY
    ===================================================== */

    const requiredElements = [
        image,
        media,
        mediaYear,
        year,
        title,
        text,
        counter,
        status,
        copy,
        datesContainer,
        progress
    ];


    const historyReady =
        requiredElements.every(Boolean);


    if (!historyReady) {

        console.warn(
            "Historique : structure HTML incomplète."
        );

    } else {

        /* =================================================
           STATE
        ================================================= */

        let currentIndex = 0;

        let autoplayTimer = null;

        let resumeTimer = null;

        let swapTimer = null;

        let revealTimer = null;

        let userLocked = false;

        let sectionVisible = false;

        let transitionInProgress = false;


        const autoplayDelay = 4500;

        /*
           Temps du fade-out avant changement
           de l'image.
        */
        const swapDelay = 320;

        /*
           Moment où la nouvelle image
           commence à réapparaître.
        */
        const revealDelay = 360;


        /* =================================================
           CREATE TIMELINE
        ================================================= */

        historyData.forEach(
            (item, index) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "history-date";


                button.dataset.index =
                    index;


                button.setAttribute(
                    "aria-label",
                    `${item.year} — ${item.title}`
                );


                button.setAttribute(
                    "aria-pressed",
                    "false"
                );


                button.innerHTML = `
                    <span class="history-date-year">
                        ${item.year}
                    </span>

                    <span
                        class="history-date-marker"
                        aria-hidden="true"
                    ></span>
                `;


                datesContainer.appendChild(
                    button
                );

            }
        );


        const dateButtons = [
            ...datesContainer.querySelectorAll(
                ".history-date"
            )
        ];


        /* =================================================
           PRELOAD IMAGES
        ================================================= */

        historyData.forEach(
            item => {

                const preload =
                    new Image();


                preload.src =
                    item.image;

            }
        );


        /* =================================================
           PROGRESS
        ================================================= */

        function updateProgress(index) {

            const maxIndex =
                historyData.length - 1;


            const percentage =
                maxIndex === 0
                    ? 0
                    : (
                        index
                        /
                        maxIndex
                    )
                    * 100;


            progress.style.width =
                `${percentage}%`;

        }


        /* =================================================
           ACTIVE BUTTON
        ================================================= */

        function updateButtons(index) {

            dateButtons.forEach(
                (button, buttonIndex) => {

                    const active =
                        buttonIndex === index;


                    button.classList.toggle(
                        "is-active",
                        active
                    );


                    button.setAttribute(
                        "aria-pressed",
                        active
                            ? "true"
                            : "false"
                    );

                }
            );

        }


        /* =================================================
           APPLY CONTENT
        ================================================= */

        function applyContent(index) {

            const item =
                historyData[index];


            image.src =
                item.image;


            image.alt =
                `${item.title} — Rourissol ${item.year}`;


            year.textContent =
                item.year;


            mediaYear.textContent =
                item.year;


            title.textContent =
                item.title;


            text.textContent =
                item.text;


            counter.textContent =
                `${String(index + 1).padStart(2, "0")} / ${String(historyData.length).padStart(2, "0")}`;

        }


        /* =================================================
           CHANGE CONTENT — CROSSFADE
        ================================================= */

        function showHistoryItem(
            index,
            animate = true
        ) {

            if (
                index < 0
                ||
                index >= historyData.length
            ) {
                return;
            }


            /*
               Évite de relancer une transition
               sur la date déjà affichée.
            */

            if (
                animate
                &&
                index === currentIndex
                &&
                !transitionInProgress
            ) {
                return;
            }


            currentIndex =
                index;


            updateButtons(
                index
            );


            updateProgress(
                index
            );


            /* ---------------------------------------------
               PREMIER AFFICHAGE
            --------------------------------------------- */

            if (!animate) {

                applyContent(
                    index
                );


                media.classList.remove(
                    "is-switching"
                );


                copy.classList.remove(
                    "is-out"
                );


                transitionInProgress =
                    false;


                return;
            }


            /* ---------------------------------------------
               RESET TIMERS
            --------------------------------------------- */

            clearTimeout(
                swapTimer
            );


            clearTimeout(
                revealTimer
            );


            transitionInProgress =
                true;


            /* ---------------------------------------------
               FADE-OUT
            --------------------------------------------- */

            media.classList.add(
                "is-switching"
            );


            copy.classList.add(
                "is-out"
            );


            /* ---------------------------------------------
               CHANGEMENT PHOTO + TEXTE

               On attend que l'ancienne image soit
               pratiquement invisible.
            --------------------------------------------- */

            swapTimer =
                setTimeout(
                    () => {

                        applyContent(
                            index
                        );

                    },

                    swapDelay
                );


            /* ---------------------------------------------
               FADE-IN
            --------------------------------------------- */

            revealTimer =
                setTimeout(
                    () => {

                        media.classList.remove(
                            "is-switching"
                        );


                        copy.classList.remove(
                            "is-out"
                        );


                        transitionInProgress =
                            false;

                    },

                    revealDelay
                );

        }


        /* =================================================
           AUTOPLAY
        ================================================= */

        function stopAutoplay() {

            clearInterval(
                autoplayTimer
            );


            autoplayTimer =
                null;

        }


        function startAutoplay() {

            if (
                userLocked
                ||
                !sectionVisible
            ) {
                return;
            }


            stopAutoplay();


            status.textContent =
                "Lecture automatique";


            autoplayTimer =
                setInterval(
                    () => {

                        const nextIndex =
                            (
                                currentIndex
                                + 1
                            )
                            %
                            historyData.length;


                        showHistoryItem(
                            nextIndex
                        );

                    },

                    autoplayDelay
                );

        }


        /* =================================================
           HOVER DES DATES
        ================================================= */

        dateButtons.forEach(
            button => {

                const index =
                    Number(
                        button.dataset.index
                    );


                button.addEventListener(
                    "mouseenter",
                    () => {

                        if (
                            !window.matchMedia(
                                "(hover: hover) and (pointer: fine)"
                            ).matches
                        ) {
                            return;
                        }


                        clearTimeout(
                            resumeTimer
                        );


                        stopAutoplay();


                        status.textContent =
                            "Exploration";


                        showHistoryItem(
                            index
                        );

                    }
                );


                /* =========================================
                   CLICK / TAP
                ========================================= */

                button.addEventListener(
                    "click",
                    () => {

                        userLocked =
                            true;


                        clearTimeout(
                            resumeTimer
                        );


                        stopAutoplay();


                        status.textContent =
                            "Sélection";


                        showHistoryItem(
                            index
                        );

                    }
                );

            }
        );


        /* =================================================
           RESUME AFTER HOVER
        ================================================= */

        datesContainer.addEventListener(
            "mouseleave",
            () => {

                if (
                    userLocked
                    ||
                    !window.matchMedia(
                        "(hover: hover) and (pointer: fine)"
                    ).matches
                ) {
                    return;
                }


                clearTimeout(
                    resumeTimer
                );


                resumeTimer =
                    setTimeout(
                        () => {

                            startAutoplay();

                        },

                        1800
                    );

            }
        );


        /* =================================================
           SECTION VISIBILITY
        ================================================= */

        const historyObserver =
            new IntersectionObserver(

                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.target
                                !==
                                historySection
                            ) {
                                return;
                            }


                            sectionVisible =
                                entry.isIntersecting;


                            if (
                                sectionVisible
                            ) {

                                startAutoplay();

                            } else {

                                stopAutoplay();

                            }

                        }
                    );

                },

                {
                    threshold:
                        0.25
                }

            );


        historyObserver.observe(
            historySection
        );


        /* =================================================
           REDUCED MOTION
        ================================================= */

        const reducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );


        if (
            reducedMotion.matches
        ) {

            userLocked =
                true;


            stopAutoplay();


            status.textContent =
                "Chronologie";

        }


        /* =================================================
           INITIAL STATE
        ================================================= */

        showHistoryItem(
            0,
            false
        );

    }

}