/*!
 * Google Map v3 1.0
 * http://HatterasSoftware.com/products/GoogleMapV3
 *
 * Copyright 2011, Lighthouse I.T. Consulting, Inc.
 * Dual licensed under the BSD or GPL Version 2 licenses or later.
 * http://HatterasSoftware.com/products/GoogleMapV3#licenses
 *
 */


(function($) {

    
    var map;

    $.fn.GoogleMapV3 = function(method) {

    	// plugin default options
        var defaults = {
            lat: 51.478196,
            lng: -0.002167,
            width: "450px",
            height: "300px",
            zoom: 8,
            mapType: google.maps.MapTypeId.ROADMAP,
                            
        };

        var markerDefaults = {
            title: "Greenwich Observatory",
            lat: defaults.lat,
            lng: defaults.lng,
            draggable: false,
            clickable: false,
            visible: true
        }

        var methods = {
            init: function(options) {
                    
                // extends defaults with options provided
                var options = $.extend(defaults, options);
        
                this.height(options.height);
                this.width(options.width);
                // Set the map
                var center = new google.maps.LatLng(options.lat, options.lng);
                var mapOptions = {
                    zoom: options.zoom,
                    center: center,
                    mapTypeId: options.mapType
                };
                if(options.rawMapOptions) {
                    mapOptions = $.extend(mapOptions, options.rawMapOptions);
                }

                map = new google.maps.Map(this.get(0), mapOptions);
                map.setMapTypeId(options.mapType);
                map.setCenter(new google.maps.LatLng(options.lat, options.lng), 10);
                map.setZoom(options.zoom);
            },

            addMarker: function(markerOptions)  {
                 var markerOptions = $.extend(markerDefaults, markerOptions);
                 var position = new google.maps.LatLng(markerOptions.lat, markerOptions.lng);
                 markerOptions.position = position;
                 markerOptions.map = map; 

                 var marker = new google.maps.Marker(markerOptions);

                 if(markerOptions.clickable && markerOptions.clickHandler) {
                     google.maps.event.addListener(marker, 'click', markerOptions.clickHandler);
                 }
                 if(markerOptions.draggable && markerOptions.dragHandler) {
                     google.maps.event.addListener(marker, 'dragend', markerOptions.dragHandler);
                 }
                 
                 // Give the user a reference to the marker.
                 return marker;
            },

            setCenter: function(latlng) {
                 map.setCenter(latlng);
            },

            fitBounds: function(latlngbounds) {
                 map.fitBounds(latlngbounds);
            }
    
        };

    
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
        }
    };

})(jQuery);

(function($) {

    var geocoder;
    var latId;
    var lngId;
    var marker;

    $.fn.GoogleLocationPicker = function(method) {

        var defaults = {
            address: "Wake Forest, NC"
        };

        var methods = {
            init: function(options) {
                               
                geocoder = geocoder || new google.maps.Geocoder();
                    
                // extends defaults with options provided
                var options = $.extend(defaults, options);

                if(!options.latId) {
                    this.after('<input type="hidden" name="lat" id="lat"/>');
                    latId = '#lat';
                } else
                    latId = options.latId;

                if(!options.lngId) {
                    this.after('<input type="hidden" name="lng" id="lng"/>');
                    lngId = '#lng';
                } else
                    lngId = options.lngId;

                this.GoogleMapV3({rawMapOptions: {streetViewControl: false}});
                marker = this.GoogleMapV3('addMarker', {title: " "});
                lookupAddress(options)
                
            },
            setAddress: function(options) {
                 lookupAddress(options);
            }
        };

    
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
        }
    };

    function RoundDecimal(num, decimals){
        var mag = Math.pow(10, decimals);
        return Math.round(num * mag)/mag;
    };

    function lookupAddress(options) {
        var callback = options.callback;
        delete options.callback;
        geocoder.geocode(options, function(results, status) {
            if(status == google.maps.GeocoderStatus.OK) {
                // setPosition was resulting in the marker no longer dragging correctly. As a workaround remove the marker
                // and place a new one in the correct position.
                if(marker) {
                    marker.setMap(null);
                }
                $(this).GoogleMapV3('setCenter', results[0].geometry.location);
                marker = $(this).GoogleMapV3('addMarker', {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng(),
                    title: results[0].formatted_address,
                    draggable: true,
                    dragHandler: function(event) {
                            var lat = RoundDecimal(event.latLng.lat(), 6);
                            var lng = RoundDecimal(event.latLng.lng(), 6)
                            if($(latId).val() != lat) {
                                $(latId).val(lat);
                                $(latId).change();
                            }
                            if($(lngId).val() != lng) {
                                $(lngId).val(lng);
                                $(lngId).change();
                            }
                            
                        }
                    });
                $(this).GoogleMapV3('fitBounds', results[0].geometry.viewport);
                $(latId).val(RoundDecimal(results[0].geometry.location.lat(), 6));
                $(lngId).val(RoundDecimal(results[0].geometry.location.lng(), 6));
            } else {
                alert("Error looking up address. Google says:\n" + status);              
            }
            if(callback != undefined) {
                callback(results, status);
            }
        });
    }

})(jQuery);
