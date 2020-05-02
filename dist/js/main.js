(function(){     
    serialize = function(obj) {
        var str = [];
        for (var p in obj)
          if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          }
        return str.join("&");
      }
   //fetch("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer?",{
   fetch("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?", {
    method: 'POST',
     headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
     body:serialize({ 
       "f":"json",
        "category":"Coffee Shop", 
        "location": "-118.58864,34.06145",
        "outFields": "Place_addr, PlaceName",
        "maxLocations": "30" 
    })
}).then(function(response){return response.json()})
   .then(function(json){
   
           console.log(json);
           displayApplication(json);
         

})
 function displayApplication()
         {
           //var locator = jsonArray;
          
           require([
            "esri/Map",
            "esri/views/MapView",
            "esri/tasks/Locator",
            "esri/Graphic"
          ], function(Map, MapView, Locator, Graphic) {
      
            var map = new Map({
              basemap: "topo-vector"
            });
            
            var view = new MapView({
              container: "viewDiv",
              map: map,
              center: [-63.585949, 44.648618 ],
              zoom: 15
            });
           

            var places = ["Coffee shop", "Gas station", 
            "Food", "Hotel", "Neighborhood", "Parks and Outdoors", 
            "American Food, Chinese Food, Mexican Food",
            "Hotel, Motel, Bed and Breakfast, Resort",
            "Arts and Entertainment","Education","Airport", "Bus Station, Bus Stop, Metro Station",
            "Parking, Rest Area, Tourist Information", "Train Station", "Travel Agency", "Truck","Bridge",  ];
            
            var select = document.createElement("select","");
             select.setAttribute("class", "esri-widget esri-select");
             select.setAttribute("style", "width: 175px; font-family: Avenir Next W00; font-size: 1em");
             places.forEach(function(p){
              var option = document.createElement("option");
              option.value = p;
              option.innerHTML = p;
              select.appendChild(option);
            });
           //wiew.ui.add(search, "bottom-right");
           document.getElementById("loc").appendChild(select, "top");
            // view.ui.add(select, "top-right");
            
            var locator = new Locator({
               url: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
            });
        
            // Find places and add them to the map
            function findPlaces(category, pt) {
   fetch("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?", {
    method: 'POST',
     headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
     body:serialize({ 
       "f":"json",
        "category":category, 
        "location": pt.longitude+","+pt.latitude,
        "outFields": "Place_addr, PlaceName",
        "maxLocations": "30" 
    })
    }).then(function(response){return response.json()})
              //locator.addressToLocations({
                //location: pt,
                //categories: [category],
                //maxLocations: 30,
                //outFields: ["Place_addr", "PlaceName"]
              //})
              .then(function(results) {
                // console.log(results);
                view.popup.close();
                view.graphics.removeAll();
          results["candidates"].filter(function(element, index){
                  if(index !==0 && index !==29){
                    return true;
                  }
                  else{
                    console.log(element);
                    return false;
                  }
              }).map(function(result, index){
                //results.forEach(function(result){
					result.location.type = "point";
                  view.graphics.add(
                    new Graphic({
                      attributes: result.attributes,
                      geometry: result.location,
                      symbol: {
                       type: "simple-marker",
                       color: "#660000",
                       size: "18px",
                       outline: {
                         color: "#6f42c1",
                         width: "4px"
                       }
                      },
                      popupTemplate: {
                        //title: result.attributes.PlaceName,
                        //content: result.attributes.Place_addr
                        
                        title: "{PlaceName}"+" - "+ index,
                        content: "{Place_addr}"
                      }
                   }));
                });

              });
            }
            
            // Search for places in center of map
            findPlaces(select.value, view.center);
      
            // Listen for category changes and find places
            select.addEventListener('change', function (event) {
              findPlaces(event.target.value, view.center);
            });
        
            // Listen for mouse clicks and find places
            view.on("click", function(event){
              view.hitTest(event.screenPoint)
                .then(function(response){
                  if (response.results.length < 2) { // If graphic is not clicked, find places 
      findPlaces(select.options[select.selectedIndex].text, event.mapPoint);
      
                  }
              })
            });
        
          });
      };
})();
