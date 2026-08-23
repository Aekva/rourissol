/* =========================================================
   ROURISSOL — 06 CONTACT
========================================================= */

(() => {

    const map =
        document.querySelector(
            "#home-contact-map"
        );

    const mapContainer =
        document.querySelector(
            ".home-contact-map"
        );

    const city =
        document.querySelector(
            "#home-contact-map-city"
        );

    const locations =
        document.querySelectorAll(
            ".home-contact-location"
        );


    if (
        !map ||
        !locations.length
    ) {
        return;
    }


    const cities = {

        ales:
            "ALÈS · 30100",

        var:
            "LA VALETTE-DU-VAR · 83160"

    };


    locations.forEach(location => {

        location.addEventListener(
            "click",
            () => {

                const query =
                    location.dataset.mapQuery;

                const locationId =
                    location.dataset.location;


                if (!query) {
                    return;
                }


                locations.forEach(item => {

                    item.classList.remove(
                        "is-active"
                    );

                });


                location.classList.add(
                    "is-active"
                );


                if (mapContainer) {

                    mapContainer.classList.add(
                        "is-switching"
                    );

                }


                setTimeout(() => {

                    map.src =
                        `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;


                    if (
                        city &&
                        cities[locationId]
                    ) {

                        city.textContent =
                            cities[locationId];

                    }


                    setTimeout(() => {

                        if (mapContainer) {

                            mapContainer.classList.remove(
                                "is-switching"
                            );

                        }

                    }, 350);


                }, 180);

            }
        );

    });

})();