/* =========================================================
   REFRESH — TOUJOURS REVENIR AU HERO
========================================================= */

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

window.addEventListener("load", () => {

    if (window.location.hash) {
        history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search
        );
    }

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
    });

});


console.log("✅ ROURISSOL JS CHARGÉ");


/* =========================================================
   ÉLÉMENTS HERO
========================================================= */

const hero =
    document.querySelector(".hero");

const heroImage =
    document.querySelector(".hero-media img");


/* =========================================================
   PARALLAX HERO
========================================================= */

if (hero && heroImage) {

    hero.addEventListener("pointermove", (event) => {

        if (window.innerWidth <= 1050) {
            return;
        }


        const rect =
            hero.getBoundingClientRect();


        const mouseX =
            event.clientX - rect.left;

        const mouseY =
            event.clientY - rect.top;


        const normalizedX =
            mouseX / rect.width;

        const normalizedY =
            mouseY / rect.height;


        const moveX =
            (normalizedX - 0.5) * 8;

        const moveY =
            (normalizedY - 0.5) * 8;


        heroImage.style.translate =
            `${moveX}px ${moveY}px`;

    });


    hero.addEventListener("pointerleave", () => {

        heroImage.style.translate =
            "0 0";

    });

}


/* =========================================================
   HALO GLOBAL
========================================================= */

if (window.matchMedia("(pointer: fine)").matches) {

    let rafId = null;


    window.addEventListener("pointermove", (event) => {

        if (rafId) {
            cancelAnimationFrame(rafId);
        }


        rafId = requestAnimationFrame(() => {

            document.documentElement.style.setProperty(
                "--halo-x",
                `${event.clientX}px`
            );

            document.documentElement.style.setProperty(
                "--halo-y",
                `${event.clientY}px`
            );

        });

    });

}

/* =========================================================
   PAN HORIZONTAL — RÉALISATION À LA UNE
========================================================= */

const projectCard =
    document.querySelector(".hero-project");

const projectImage =
    document.querySelector(".project-image-slider img");


if (projectCard && projectImage) {

    let dragging = false;

    let startMouseX = 0;
    let startPosition = 0;
    let currentPosition = 0;


    /* =====================================================
       POSITION INITIALE : IMAGE CENTRÉE
    ===================================================== */

    function centerProjectImage() {

        const overflow =
            projectImage.offsetWidth -
            projectCard.offsetWidth;

        if (overflow <= 0) {
            currentPosition = 0;
            return;
        }

        currentPosition =
            -(overflow / 2);

        projectImage.style.transform =
            `translate3d(${currentPosition}px, 0, 0)`;

    }


    /* =====================================================
       DÉBUT DU DRAG
    ===================================================== */

    projectCard.addEventListener(
        "pointerdown",
        (event) => {

            /*
               On laisse fonctionner normalement
               le bouton "Voir le projet".
            */

            if (event.target.closest("a")) {
                return;
            }


            dragging = true;

            startMouseX =
                event.clientX;

            startPosition =
                currentPosition;


            projectCard.setPointerCapture(
                event.pointerId
            );

        }
    );


    /* =====================================================
       DÉPLACEMENT
    ===================================================== */

    projectCard.addEventListener(
        "pointermove",
        (event) => {

            if (!dragging) {
                return;
            }


            const movement =
                event.clientX -
                startMouseX;


            const overflow =
                projectImage.offsetWidth -
                projectCard.offsetWidth;


            if (overflow <= 0) {
                return;
            }


            let nextPosition =
                startPosition +
                movement;


            /* LIMITE GAUCHE */

            if (nextPosition > 0) {
                nextPosition = 0;
            }


            /* LIMITE DROITE */

            if (nextPosition < -overflow) {
                nextPosition = -overflow;
            }


            currentPosition =
                nextPosition;


            projectImage.style.transform =
                `translate3d(${currentPosition}px, 0, 0)`;

        }
    );


    /* =====================================================
       FIN DU DRAG
    ===================================================== */

    function stopDragging() {
        dragging = false;
    }


    projectCard.addEventListener(
        "pointerup",
        stopDragging
    );

    projectCard.addEventListener(
        "pointercancel",
        stopDragging
    );


    /* =====================================================
       CHARGEMENT / RESIZE
    ===================================================== */

    if (projectImage.complete) {

        centerProjectImage();

    } else {

        projectImage.addEventListener(
            "load",
            centerProjectImage
        );

    }


    window.addEventListener(
        "resize",
        centerProjectImage
    );

}

/* =========================================================
   NAVBAR — HERO TRANSITION
========================================================= */

const siteNavbar =
    document.querySelector(
        "#site-navbar"
    );

const heroSection =
    document.querySelector(
        "#accueil"
    );


function updateNavbarState() {

    if (
        !siteNavbar ||
        !heroSection
    ) {
        return;
    }


    const heroRect =
        heroSection
            .getBoundingClientRect();


    /*
       La navigation horizontale apparaît
       lorsque le bas du Hero arrive
       derrière la navbar.
    */

    const heroFinished =
        heroRect.bottom
        <= siteNavbar.offsetHeight;


    siteNavbar
        .classList
        .toggle(
            "is-past-hero",
            heroFinished
        );

}


window.addEventListener(
    "scroll",
    updateNavbarState,
    {
        passive: true
    }
);


window.addEventListener(
    "resize",
    updateNavbarState
);


updateNavbarState();



/* =========================================================
   MOBILE MENU
========================================================= */

const navbarBurger =
    document.querySelector(
        ".navbar-burger"
    );

const mobileNav =
    document.querySelector(
        ".mobile-nav"
    );


if (
    navbarBurger &&
    mobileNav
) {

    navbarBurger
        .addEventListener(
            "click",
            () => {

                const isOpen =
                    navbarBurger
                        .classList
                        .toggle(
                            "is-open"
                        );


                mobileNav
                    .classList
                    .toggle(
                        "is-open",
                        isOpen
                    );


                navbarBurger
                    .setAttribute(
                        "aria-expanded",
                        isOpen
                    );

            }
        );


    mobileNav
        .querySelectorAll(
            "a"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        navbarBurger
                            .classList
                            .remove(
                                "is-open"
                            );


                        mobileNav
                            .classList
                            .remove(
                                "is-open"
                            );


                        navbarBurger
                            .setAttribute(
                                "aria-expanded",
                                "false"
                            );

                    }
                );

            }
        );

}



/* =========================================================
   NAVBAR — SECTION ACTIVE
========================================================= */

const navbarSectionLinks =
    document.querySelectorAll(
        ".navbar-main-nav [data-section]"
    );


const trackedSections =
    [
        "entreprise",
        "metiers",
        "realisations",
        "references",
        "recrutement"
    ]
        .map(
            id =>
                document
                    .getElementById(
                        id
                    )
        )
        .filter(
            Boolean
        );


if (
    trackedSections.length
) {

    const sectionObserver =
        new IntersectionObserver(

            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        navbarSectionLinks
                            .forEach(
                                link => {

                                    link
                                        .classList
                                        .toggle(
                                            "is-active",

                                            link.dataset.section
                                            ===
                                            entry.target.id

                                        );

                                }
                            );

                    }
                );

            },

            {
                rootMargin:
                    "-30% 0px -55% 0px",

                threshold:
                    0
            }

        );


    trackedSections
        .forEach(
            section =>
                sectionObserver
                    .observe(
                        section
                    )
        );

}