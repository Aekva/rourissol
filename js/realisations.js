/* =========================================================
   ROURISSOL — 04 RÉALISATIONS
========================================================= */

(() => {

    const section =
        document.querySelector(
            ".home-realisations"
        );


    if (!section) {
        return;
    }


    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    if (reducedMotion.matches) {

        section.classList.add(
            "is-visible"
        );

        return;
    }


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
                threshold:
                    0.12
            }

        );


    observer.observe(
        section
    );

})();