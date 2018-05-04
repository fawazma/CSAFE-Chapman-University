var autocompletePickUp, autocompleteDropOff;
var start_pos, end_pos;
var directionDisplay;
var directionsService;
var waypoint_count = 0;
var input_Clear = document.getElementById("searchclear");
var markerArray = [];
var routes = [];
var pickCount = 0;
var dropCount = 0;
var radio_count = 0;
var status_id, eta_id;
var dest_map;
var dest_marker;
var rdn_btn_doc = document.getElementsByName('optradio');

var userSequence = function (){

}();


function initAutocompleteRequestMap(map) {

  var directionsService = new google.maps.DirectionsService();
  var stepDisplay = new google.maps.InfoWindow;
  var service = new google.maps.DistanceMatrixService();

  autocompletePickUp = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */
    (document.getElementById('autocomplete')), {
      types: ['geocode']
    });
  autocompleteDropOff = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */
    (document.getElementById('autocomplete2')), {
      types: ['geocode']
    });

  pickUpmarker = new mapIcons.Marker({});
  dropOffMarker = new mapIcons.Marker({});

  directionsDisplay = new google.maps.DirectionsRenderer({
    map: map,
    suppressMarkers: true
  });

  // use address to get lat long
  google.maps.event.addListener(autocompletePickUp, 'place_changed', function() {

    try {

      bounds = getBoundsRequestMap();

      var rectangle = new google.maps.Rectangle({
        bounds: bounds,
        editable: false,
        draggable: false
      });
      var place = autocompletePickUp.getPlace();
      var lat = place.geometry.location.lat(),
      lng = place.geometry.location.lng();


      document.getElementById('errorPickUp').innerHTML = ""
      //PickUp BOUNDS
      var pickUpPos = {
        lat: lat,
        lng: lng
      };

      if (rectangle.getBounds().contains(pickUpPos)) {

        start_pos = pickUpPos;
        pickUpmarker.setMap(null);
        //DropOff
        pickUpmarker = mapIcons.Marker({
          map: map,
          position: pickUpPos,
          icon: {
            //      path: mapIcons.shapes.MAP_PIN,
            fillColor: '#7d22bd',
            fillOpacity: 1,
            strokeColor: '',
            strokeWeight: 0,
            scale: 2 / 3
          },
          map_icon_label: '<span class="map-icon"></span>'
        });
        start_pos = pickUpPos;
        }else {
      //  console.log("nah")
        document.getElementById('errorPickUp').innerHTML = "Please make sure your pick up location is within our map bounds"
      }}catch (err) {
      console.log(err.message);
      document.getElementById('errorPickUp').innerHTML = "Please use the drop down menu to choose your address"
    }
  });

  google.maps.event.addListener(autocompleteDropOff, 'place_changed', function() {

    try {
      var place = autocompleteDropOff.getPlace();
      var lat = place.geometry.location.lat(),
        lng = place.geometry.location.lng();
      document.getElementById('errorDropOff').innerHTML = ""
      //dropOff
      var dropOffPos = {
        lat: lat,
        lng: lng
      };

      if (rectangle.getBounds().contains(dropOffPos)) {
        console.log("contains")
        end_pos = dropOffPos;
        dropOffMarker.setMap(null);
        dropOffMarker = mapIcons.Marker({
          map: map,
          position: dropOffPos,
          icon: {
            //  path: mapIcons.shapes.MAP_PIN,
            fillColor: '#ee2727',
            fillOpacity: 1,
            strokeColor: '',
            strokeWeight: 0,
            scale: 2 / 3
          },
          map_icon_label: '<span class="map-icon"></span>'
        });
        dest_marker = dropOffMarker;
        end_pos = dropOffPos;
      } else {
        console.log("nah")
        document.getElementById('errorDropOff').innerHTML = "Please make sure your drop off destination is within our map bounds";
        directionsDisplay.setDirections({
          routes: []
        });
      }
    } catch (err) {
      console.log(err.message);
      document.getElementById('errorDropOff').innerHTML = "Please use the drop down menu to choose your address";
    }
    setMAPWAY(start_pos, end_pos);
  });


  function setMAPWAY(start_pos, end_pos) {

    setWaypoint(start_pos, end_pos, markerArray, stepDisplay);
    // Listen to change events from the start and end lists.
    document.getElementById('autocomplete').addEventListener('change', function() {
      pickUpmarker.setMap(null);
      pickCount++;
      callDisplay();
    });
    document.getElementById('autocomplete2').addEventListener('change', function() {
      dropOffMarker.setMap(null);
      dropCount++;
      callDisplay();
    });
  }

  function callDisplay() {
    calculateAndDisplayRoute(directionsDisplay, directionsService, markerArray, stepDisplay, map);
  }

  function cancelDirections() {
    directionsDisplay.setDirections({
      routes: []
    });
  }

  //SET WAYPOINTS ------
  function setWaypoint(start_pos, end_pos, markerArray, stepDisplay, ) {

    var request = {
      destination: end_pos,
      origin: start_pos,
      travelMode: 'DRIVING'
    };
    // Pass the directions request to the directions service.
    var directionsService = new google.maps.DirectionsService();

    directionsService.route(request, function(response, status) {

      if (status == 'OK') {
        // Display the route on the map.
        document.getElementsByClassName('map-icon')[0].style.visibility = 'hidden';
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  // Sets the map on all routes in the array.
  function setMapOnAll(map) {
    //  alert("SET MAP ON ALL")
    for (var i = 0; i < markerArray.length; i++) {
      markerArray[i].setMap(map);
      //  alert("SET MAP ON ALL INSIDE ROUTES")
    }
  }
  // Removes the markers from the map, but keeps them in the array.
  function clearMarkers() {
    directionDisplay = null;
    pickUpmarker.setMap(null);
    dropOffMarker.setMap(null);
  }


  // Bias the autocomplete object to the user's geographical location,
  // as supplied by the browser's 'navigator.geolocation' object.
  function geolocate(pickUpOrDropOff) {
    console.log(pickUpOrDropOff);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var geolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var circle = new google.maps.Circle({
          center: geolocation,
          radius: position.coords.accuracy
        });
        if (pickUpOrDropOff == "pickUp") {
          autocompletePickUp.setBounds(circle.getBounds());
        } else if (pickUpOrDropOff == "dropOff") {
          autocompleteDropOff.setBounds(circle.getBounds());
        }
      });
    }
  }
}
// ------- END ON INIT AUTOCOMPLETE FUNCTION ------ //////

// --------- jQuery time ------------- ///////
var current_fs = localStorage.getItem("fieldset");
var next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches
var count = 0;
var field_next;

$(document).on('click', '.next', function() {

  var the_rdn = radioCheck();
  for (var i = 0, length = rdn_btn_doc.length; i < length; i++) {
    radio_count++;
    if (rdn_btn_doc[i].checked) {
      radio_count = radio_count;
      break;
    }
  }

if (the_rdn === true && autocomplete.value !== '' && autocomplete2.value !== '' && phone.value !== '') {

    count++;
    current_fs = $(this).parent();
  //  localStorage.setItem("fieldset", current_fs);
    next_fs = $(this).parent().next();
    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

    if (animating) return false;
    animating = true;
    //show the next fieldset
    $('[id^=loading_modal]').modal({
      backdrop: 'static',
      keyboard: true,
      show: true
    });
    startLoadingModal();

  } else {
    console.log("Error, fields are not filled");
  }

});

function startLoadingModal() {

  $('[id^=loading_modal]').modal('hide');
  next_fs.show();
  field_next = next_fs.show();
  //hide the current fieldset with style
  current_fs.animate({
    opacity: 0
    },{
    step: function(now, mx) {
      //as the opacity of current_fs reduces to 0 - stored in "now"
      //1. scale current_fs down to 80%
      scale = 1 - (1 - now) * 0.2;
      //2. bring next_fs from the right(50%)
      left = (now * 50) + "%";
      //3. increase opacity of next_fs to 1 as it moves in
      opacity = 1 - now;
      current_fs.css({
        'transform': 'scale(' + scale + ')',
        'position': 'absolute'
      });
      next_fs.css({
        'left': left,
        'opacity': opacity
      });
    },
    duration: 800,
    complete: function() {
      current_fs.hide();
      animating = false;
    },
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });
  status_id = generateID();
  eta_id = Date.now();
  riderRequestInfo(autocomplete.value, autocomplete2.value, phone.value, radio_count, status_id, eta_id);
}

function stopLoadingModal(id) {
  console.log(id);
  $('#loader_message_' + id).text("Your ride was accepted!");
  setTimeout(function() {
    $('#loading_modal_' + id).modal('hide');
    $('#loader_message_' + id).text("Requesting your ride");
  }, 3000)
}

$(document).on('click', '.previous', function() {

  if (animating) return false;
  animating = true;
  current_fs = $(this).parent();
  localStorage.setItem("fieldset", current_fs);
  previous_fs = $(this).parent().prev();
  //de-activate current step on progressbar
  $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
  //show the previous fieldset
  previous_fs.show();
  //hide the current fieldset with style
  current_fs.animate({
    opacity: 0
    },{
    step: function(now, mx) {
      //as the opacity of current_fs reduces to 0 - stored in "now"
      //1. scale previous_fs from 80% to 100%
      scale = 0.8 + (1 - now) * 0.2;
      //2. take current_fs to the right(50%) - from 0%
      left = ((1 - now) * 50) + "%";
      //3. increase opacity of previous_fs to 1 as it moves in
      opacity = 1 - now;
      current_fs.css({
        'left': left
      });
      previous_fs.css({
        'transform': 'scale(' + scale + ')',
        'opacity': opacity
      });
    },
    duration: 800,
    complete: function() {
      current_fs.hide();
      animating = false;
    },
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });
});

function riderRequestInfo(start_loc, end_loc,contact,passenger,status_id,eta_id){ /////INFO TO PASS ON TO ADMIN
console.log("Start Position\n" + start_loc + "Destination \n" + end_loc + "\nPHONE\n" + contact + "\nPassenger\n " + passenger);

    var startLocationLat = start_pos.lat;
    var startLocationLong = start_pos.lng;
    var endLocationLat = end_pos.lat;
    var endLocationLong = end_pos.lng;
    var phoneNumber = contact;
    var startAddress = start_loc;
    var endAddress = end_loc;
    var message_id = status_id; //ride request ID
    var time_arrival = eta_id; //time of arrival

    //console.log("Requesting a ride");

    var data = {"num_passenger":radio_count, "userEmail": userEmail, "start_loca_lat" : startLocationLat,"start_loca_lng" : startLocationLong,"end_loca_lat" : endLocationLat,
        "end_loca_lng":endLocationLong,"phone_number":phoneNumber,"start_address":startAddress,"end_address":endAddress,"message_id":message_id,"time_arrival_datetime": time_arrival};

    $.ajax({
        url: '/api/v1/rides/',
        type: 'POST',
        data: data,
        success: function(result) {
            console.log("requested!");
            // refreshes the table
            console.log(result);
            App.ride_request.notify(result.data.id);
        }
    });
  requestWait();
}

function cancelRide() {
  console.log(rideID);
  App.ride_request.cancel(rideID);
}

//Used for Way Points between start and finish
function calcRoute(start_pos, end_pos) {

  var request = {
    origin: start_pos,
    destination: end_pos,
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(result);
    }
  });
};

$(".submit").click(function() {
  return false;
});

$(document).ready(function() {
  $("#phone").mask('(000) 000-0000');
});

function radioCheck() {
  if ($('input[name=optradio]:checked').length > 0) {
    return true;
  } else {
    return false;
  }
}

var type = 0;
function inputClear() { //CLEAR BUTTON PICK UP
  $("#autocomplete").val(' ');
  type = 1;
  clearBtnMap(type);
  //cancelDirections();
}

function dropClear() { //CLEAR BUTTON DROP OFF
  $("#autocomplete2").val(' ');
  type = 2;
  clearBtnMap(type);
}

function clearBtnMap(type) {
  switch (type) {
    case 1:
      pickUpmarker.setMap(null);
      break;
    case 2:
      dropOffMarker.setMap(null);
      break;
    default:
  }
}

$(document).on('click', '#cancelRide-btn', function() {
  // alert("CANCEL RIDE");
    console.log("cancel button clicked");
    $('#cancelRide-btn-prev').trigger("click");
});

// This is a super hacky solution.
$(document).on('click', '#cancelRide-btn-prev', function() {
    cancelRide();
});


var theL;
var theLong;
var setT;

function generateID() {
  return Math.random().toString(36).substr(2, 28);
}

var the_eta;

function setEta(id, eta) {
  // This clears whatever timer was already set
  clearInterval(setT);

  if ($("#timer_" + id).length) {
    the_eta = moment(eta).toDate();
    // This prints the eta in PDT
    console.log(the_eta);
    setT = setInterval(updateTimer, 1000);

    function updateTimer() {

      console.log("updateTimer()");
      arrival = the_eta; //Estimated TIME OF ARRIVAL FOR PSAFE
      now = new Date(); //DATE AT THE MOMENT
      diff = arrival - now;
      days = Math.floor(diff / (1000 * 60 * 60 * 24));
      hours = Math.floor(diff / (1000 * 60 * 60));
      mins = Math.floor(diff / (1000 * 60));
      secs = Math.floor(diff / 1000);
      m = (mins - hours * 60);
      s = (secs - mins * 60);

      document.getElementById("timer_" + id)
        .innerHTML =
        '<div>' + hours + '<span>Hours</span></div>' +
        '<div>' + m + '<span>minutes</span></div>' +
        '<div>' + s + '<span>seconds</span></div>';
        if (m === 0 && s === 0) { //if the timer is at Zero
          myStopFunction();
        }

    }
  }
}

function myStopFunction() { //TO NEXT FIELD SET
  //document.querySelector('.timer') = ' ';
  clearInterval(setT); //Keep timer at 0
  //change fieldset
  $('#ride_wait').css('display', 'none');
  $('#arrived').css('display', 'block');

  var next_fs = document.getElementById('ride_wait');
  next_fs = $(this).parent().next();
  $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

  console.log("Next Field Set");
}


$('.rating .fa-star').click(function() { ///FEEDBACK RATING
   $('.rating .active-rating').removeClass('active-rating');
   $(this).toggleClass('active-rating');
});
c
