/*mapboxgl.accessToken = config.key1;*/

if (!mapboxgl.supported()) {
    alert('Your browser does not support Mapbox GL');
} else {
    mapboxgl.accessToken = 'pk.eyJ1Ijoicm9zcGVhcmNlIiwiYSI6ImNqbGhxaTAwNDFnamYzb25qY2Jha2NrZWgifQ.xZMz-pe7wEEpARooTi6lkw';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/rospearce/ckc3fvx5v0tig1ipcowx490i6',
        center: [20, 8],
        zoom: 1.5,
        maxZoom: 12
    });
}

map.scrollZoom.disable();

let screenWidth = window.innerWidth;

let boundsMobile = [
    [ -100, -70],[120, 85]
]

let boundsLaptop = [
    [ -160, -70],[160, 90]
]

let boundsDesktop = [
    [ -188, -75],[90, 86]
]

let boundsRetina = [
    [ -165, -65],[91, 78]
]

function getBounds () {
    if (screenWidth > 1400) {
        return boundsRetina
    }
    else if (screenWidth > 1024 && screenWidth < 1400) {
        return boundsDesktop
    } 
    else if (1024 > screenWidth && screenWidth > 850) {
        return boundsLaptop
    } else {
        return boundsMobile
    }
}

var bounds = getBounds();

// resize map for the screen
map.fitBounds(bounds, {padding: 10});

var icons = {
    "Wildfire": "fas fa-fire-alt",
};

var typeTags = {
    "Wildfire": "fire",
    
};
var impactTags = {
    "SS": "Supports statement",
    "MSS": "Mostly supports statement",
    "IS": "Informs statement"
}

var popupIcon = {
    "Wildfire": "<i class='fas fa-fire-alt'></i>",
}

var colors = {
    "Supports statement": "#c43e00",
    "Mostly supports statement": "#ff6f00",
    "Informs statement": "#ffa040"
}

var studyTypes = {
    "formal": "formal",
    "rapid": "rapid",
    "trend": "trend"
}

var tooltipStudyTypes = {
    "formal": "Formal study",
    "rapid": "Rapid assessment",
    "trend": "Trend"
}

var markerType = {
    "formal": "marker formal",
    "rapid": "marker rapid",
    "trend": "marker trend"
}

var unique = {
        "unique": "unique"
}


map.addControl(new mapboxgl.NavigationControl());

map.on('load', function() {

    map.addSource("geojson", {
        "type": "geojson",
        "data": geojson
    });

    geojson.features.forEach(function(feature) {

        let type = feature.properties['type'];
        let symbol = icons[type];

        // create class names to use as tags for filtering
        let typeTag = typeTags[type];
        let title = feature.properties['title'];
        let impact = feature.properties['impact'];
        let impactTag = impactTags[impact];
        let sType = feature.properties['studyType'];
        let studyType = studyTypes[sType];
        let tooltipStudy = feature.properties['studyType'];
        let ttStudy = tooltipStudyTypes[tooltipStudy];
        let uniqueStudies = feature.properties['unique'];
        let uniqueStudy = unique[uniqueStudies]

        // replave hash marks with smart quotes
        let summary = feature.properties['summary'];
        summary = "\u201c" + summary + "\u201d";

        let url = feature.properties['link'];
        let citation1 = feature.properties['citation'];
        let clipCitation = citation1.split("),")[0];
        console.log(clipCitation)
        let substr = "pdf";

        if (url.indexOf(substr) !== -1) {
            clipCitation = clipCitation + " [pdf]";
        }

        // create a HTML element for each feature
        var el = document.createElement('div');
        el.className = "marker" + " " + typeTag + " " + impactTag;
        el.innerHTML = '<i class="' + symbol + '"></i>';

         // exclude Global markers for now
        if (feature.properties['location'] !== 'Global') {

        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 10, closeButton: false }) // add popups
        .setHTML('<h4 style="padding-bottom: 4px; border-bottom: 2px solid ' + colors[impactTag] + ';">' + feature.properties['title'] + '</h4><ul class="list-group list-tooltip"><li>Area of study: ' + feature.properties['location'] + '</li><li><div style="display:inline-block" class=' + impactTag + '>' + popupIcon[type] + "</div>"  
        + impactTag + " " + 'that climate change increases the risk of wildfires.</li></ul><p class="summary">' 
        + summary + '</p><p class="citation"><a href="'
        + url + '" target="_blank">' + clipCitation + "),</a><span class='citation2'> " + feature.properties['journal'] + '</span></p>'))
        .addTo(map);

}
    });

// When the user clicks on div, open the popup


    $(".list-group-item").click(function(e) {

        // CHANGE CLICK CHECKBOX
        let $tc = $(this).find('input:checkbox');
        // checks what the current status of the checkbox is
        let tv = $tc.attr('checked');
        // applies the opposite
        $tc.attr('checked', !tv);

        // UPDATE STYLE
        // tv is the previous value
        if (tv == "checked") {
            $(this).addClass("unselected");
        } else {
            $(this).removeClass("unselected");
        }

        //REMOVE FILTER//filterMap();

    });


    $("#select").click(function(e) {

        $(".impact input:checkbox").each(function() {
            if(this.checked) {
                // do nothing
            } else {
                $(this).attr('checked', 'checked');
                // unselected = greyed out
                $(this).parent('li').removeClass('unselected');
            }
        });

        filterMap();

    });

    $("#deselect").click(function(e) {

        $(".impact input:checkbox").each(function() {
            if(this.checked) {
                $(this).attr('checked', false);
                // unselected = greyed out
                $(this).parent('li').addClass('unselected');
            } else {
                // do nothing
            }
        });

        filterMap();

    });

    let yearValue = "all";

    document.getElementById('selectorYear').addEventListener('change', function(e) {
        yearValue = e.target.value;
        filterMap();
    });

    function filterMap () {

        /*if (yearValue != "all") {
            $(".marker.trend").css("visibility", "hidden");
            $("li#trend.list-group-item").addClass("unselected");
            $("li#trend.list-group-item input:checkbox").attr('checked', false);
        } else if (yearValue == "all") {
            
        };*/

        // GATHER DATA ON CHECKBOXES
        let checkboxes = ["Supports", "Mostly", "Informs"];

        let selected = [];
        $('input:checked').each(function() {
            selected.push($(this).attr('name'));
        });

        // create array of checkboxes that aren't selected
        let unselected = checkboxes.filter(i => selected.indexOf(i) === -1);

        // make all map markers visible
        $(".marker").css("visibility", "visible");

        /*let years = ["2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010"];*/
        
        // hide each of the unselected classes in turn

        if (yearValue == "all") {
            for (i = 0; i < unselected.length; i++) {
                $("." + unselected[i]).css("visibility", "hidden");
            }
        } else {
            // filter both
            for (i = 0; i < years.length; i++) {
                if (yearValue !== years[i]) {
                    $("." + years[i]).css("visibility", "hidden");
                }
            }

            for (i = 0; i < unselected.length; i++) {
                $("." + unselected[i]).css("visibility", "hidden");
            }

        };




        /*$("#selectorYear").click(function(e) {

        $(".list-group-item.unselected input:checkbox").each(function() {
            if(this.checked) {
                $(this).attr('checked', 'checked')
                console.log(this);
                // unselected = greyed out
                $(this).parent('li').removeClass('unselected');
            } else {
                // do nothing
            }
        });

        filterMap();

    });*/

        /*$('#selectorYear').click(function() {
            var $sYear = $(this);
        
        $('#trend').click(function() {
            var $sTrend = $(this);

                if (yearValue == "all" && $sYear.data('clicked') && $sTrend.data('clicked')) {
                    $("li#trend.list-group-item").removeClass("unselected");
                } else {
                    $("li#trend.list-group-item").removeClass("unselected");
                }

                $sYear.data('clicked', true);
                $sTrend.data('clicked', true);
        })
    });*/
/*        if (yearValue == "all") {
        $("#selectorYear").click(function(e) {
            
        $("#trend input:checkbox").each(function() {
            if(this.checked) {
                // do nothing
            } else {
                $(this).attr('checked', 'checked');
                // unselected = greyed out
                $(this).parent('li').removeClass('unselected');
            }
        });
    })

        filterMap();

};  */  



        // UPDATE STUDIES

        let markers = [];

        $(".marker").each(function() {
            if (window.getComputedStyle(this).visibility === "visible") {
                markers.push($(this));
            }
        });

        $("#studies").text(markers.length);

    }

});


// reset dropdown on window reload

$(document).ready(function () {
    $("select").each(function () {
        $(this).val($(this).find('option[selected]').val());
    });
})

// TOGGLE BUTTON

$(".toggle").click(function() {
    $("#console").toggleClass('console-close console-open');
    $('.arrow-right-hidden').toggleClass('arrow-right');
    $('.arrow-left').toggleClass('arrow-left-hidden');
});

//Global Studies

        if (feature.properties['location'] == 'Global') {

var el = document.createElement('div');
        el.className = "marker" + " " + typeTag + " " + impactTag;
        el.innerHTML = '<i class="' + symbol + '"></i>';

var target = document.querySelector(id="globalcontainer");






    }
