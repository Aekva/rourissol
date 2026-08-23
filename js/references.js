/* =========================================================
   ROURISSOL — 05 RÉFÉRENCES
========================================================= */

(() => {

    const section = document.querySelector(".home-references");

    if (!section) {
        return;
    }


    const showSection = () => {
        section.classList.add("is-visible");
    };


    /* Réduction des animations */

    if (
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {
        showSection();
        return;
    }


    /* Fallback vieux navigateur */

    if (!("IntersectionObserver" in window)) {
        showSection();
        return;
    }


    const observer = new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) {
                    return;
                }

                showSection();

                observer.unobserve(section);

            });

        },

        {
            threshold: 0.05,
            rootMargin: "0px 0px 100px 0px"
        }

    );


    observer.observe(section);

})();