/* =========================================================
   ROURISSOL — 03 CHIFFRES CLÉS
========================================================= */

(() => {

    const section =
        document.querySelector(
            ".keyfigures"
        );


    if (!section) {
        return;
    }


    /* =====================================================
       REDUCED MOTION
    ===================================================== */

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    if (
        reducedMotion.matches
    ) {

        section.classList.add(
            "is-visible"
        );

        return;
    }


    /* =====================================================
       REVEAL
    ===================================================== */

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        section.classList.add(
                            "is-visible"
                        );


                        observer.unobserve(
                            section
                        );

                    }
                );

            },

            {
                threshold:0.18
            }
        );


    observer.observe(
        section
    );

})();