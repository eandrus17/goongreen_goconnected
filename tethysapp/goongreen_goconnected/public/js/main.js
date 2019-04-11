require([
  "esri/Map",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  // "esri/geometry/Point",
  "esri/tasks/Geoprocessor",
  // "esri/tasks/support/LinearUnit",
  "esri/tasks/support/FeatureSet",
  "esri/views/MapView",
  "dojo/domReady!"
], function(Map, GraphicsLayer, Graphic, Geoprocessor, FeatureSet, MapView){

	//a map with basemap
	var map = new Map({
    basemap: "streets"
	});

    //a graphics layer to show input data and output polygon
    var graphicsLayer = new GraphicsLayer();
    //var graphicsLayer2 = new GraphicsLayer2();
    map.add(graphicsLayer);
    //map.add(graphicsLayer2);

    var view = new MapView({
    container: "viewDiv",
    map: map,
	center: [-111.9, 40.75],
	zoom: 8
    });

	// symbol for polygons
    var fillSymbol = {
          type: "simple-fill", // autocasts as new SimpleFillSymbol()
          color: [226, 119, 40, 0.75],
          outline: { // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: 1
          }
        };

	// Geoprocessing service url
	var gpUrl1 = "http://geoserver2.byu.edu/arcgis/rest/services/GoConnected/FindElevChange/GPServer/FindElevChange";
    var gpUrl2 = "http://geoserver2.byu.edu/arcgis/rest/services/GoConnected/IntersectionDensity/GPServer/Intersection%20Density";
    var gpUrl3 = "http://geoserver2.byu.edu/arcgis/rest/services/GoConnected/BusStops/GPServer/Bus%20Stops";

    // create new Geoprocessors
	var gp1 = new Geoprocessor(gpUrl1);
	var gp2 = new Geoprocessor(gpUrl2);
    var gp3 = new Geoprocessor(gpUrl3);

	// define output spatial reference
    gp1.outSpatialReference = { // autocasts as new SpatialReference()
          wkid: 102100 //EPSG3857
        };
    gp2.outSpatialReference = { // autocasts as new SpatialReference()
          wkid: 102100 //EPSG3857
        };
    gp3.outSpatialReference = { // autocasts as new SpatialReference()
          wkid: 102100 //EPSG3857
        };

	// runs the tool on the button click (jQuery)
	$("#submit").click(function () {
	  runmytool();
	});

	//main function

    function runmytool(event) {
         //loading symbol, grabbed from web
          $("#loading").html('<img src="http://baxtersonestop.com/wp-content/plugins/cars-seller-auto-classifieds-script/images/loading-1.gif" style="height: 100px"/>');

		  // input parameters
         var cityname = $("#cityname").val();
             // document.getElementById("cityname").value;
         var params = {
            "Expression": cityname
          };
          gp1.submitJob(params).then(completeCallback1, errBack, statusCallback);
          gp2.submitJob(params).then(completeCallback2, errBack, statusCallback);
          gp3.submitJob(params).then(completeCallback3, errBack, statusCallback);
    }

	function completeCallback1(result){
        gp1.getResultData(result.jobId, "result_poly").then(drawResult, drawResultErrBack);
	}
	function completeCallback2(result){
        gp2.getResultData(result.jobId, "output_poly_shp").then(drawResult2, drawResultErrBack);
	}
	function completeCallback3(result){
        gp3.getResultData(result.jobId, "Row_Count").then(drawResult3, drawResultErrBack);
	}

	function drawResult(data){
        g = data.value.features[0].attributes['gridcode'];
        $("#Range").html("Maximum change in elevation: " + g + " ft");

        var polygon_feature = data.value.features[0];
        polygon_feature.symbol = fillSymbol;
		graphicsLayer.add(polygon_feature);
	}

    function drawResult2(data){
        g = data.value.features[0].attributes['gridcode'];
        $("#IntDen").html("Intersections per square mile: " + g);

	    var polygon_feature = data.value.features[0];
		polygon_feature.symbol = fillSymbol;
		//graphicsLayer.add(polygon_feature);
	}

    function drawResult3(data){
	    $("#loading").html('');
	    alert("in Drawresults3");
	    //var polygon_feature3 = data.value.features[0];
	    alert("hello");
        g3 = data.value.features[0];
        alert("hi there");
        var busstops = document.getElementById("Buses");
          busstops.innerText = "Number of Bus Stops in " + cityname3 + ": " + g3;

		//polygon_feature3.symbol = fillSymbol;
		//graphicsLayer3.add(polygon_feature3);
	}

	function drawResultErrBack(err) {
        console.log("draw result error: ", err);
    }

	function statusCallback(data) {
        console.log(data.jobStatus);
    }
    function errBack(err) {
        console.log("gp1 error: ", err);
    }

});