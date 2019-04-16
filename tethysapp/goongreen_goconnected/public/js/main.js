var view
var graphicsLayer
var g1
var g2
var g3
var connscore
var elevscore
var intscore
var busscore
var displaycityname

require([
  "esri/Map",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  //"esri/geometry/Point",
  "esri/tasks/Geoprocessor",
  //"esri/tasks/support/LinearUnit",
  "esri/tasks/support/FeatureSet",
  "esri/views/MapView",
  "dojo/domReady!"
], function(Map, GraphicsLayer, Graphic, Geoprocessor, FeatureSet, MapView){

	//a map with basemap
	var map = new Map({
    basemap: "streets"
	});

    //a graphics layer to show input data and output polygon
    graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    view = new MapView({
    container: "viewDiv",
    map: map,
	center: [-111.9, 40.75],
	zoom: 8
    });


	// symbol for polygons
    var fillSymbol = {
          type: "simple-fill", // autocasts as new SimpleFillSymbol()
          color: [255, 0, 0, 0.3],
          outline: { // autocasts as new SimpleLineSymbol()
            color: [0, 0, 0],
            width: 1
          }
        };

    // symbol for points
	var markerSymbol = {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          color: [0, 0, 0],
          size: 8,
          outline: { // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: .25
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

	//function to run geoprocessors

    function runmytool(event) {
           graphicsLayer.removeAll();
         //loading symbol, grabbed from web
          $("#loading").html('<img src="http://baxtersonestop.com/wp-content/plugins/cars-seller-auto-classifieds-script/images/loading-1.gif" style="height: 100px"/>');

		  // input parameters
         var cityname = '"NAME" = ' + "'" + $("#cityname").val() + "'";
         var params = {
            "Expression": cityname
          };
          Promise.all([
            gp1.submitJob(params).then(completeCallback1, errBack),
            gp2.submitJob(params).then(completeCallback2, errBack),
            gp3.submitJob(params).then(completeCallback3, errBack),
          ]).then($("#loading").html(''), errBack);
    }

	function completeCallback1(result){
        gp1.getResultData(result.jobId, "result_poly").then(drawResult, drawResultErrBack);
	}
	function completeCallback2(result){
        gp2.getResultData(result.jobId, "output_poly_shp").then(drawResult2, drawResultErrBack);
	}
	function completeCallback3(result){
        gp3.getResultData(result.jobId, "BusStops_Clip").then(drawResult3, drawResultErrBack);
	}

	function drawResult(data){

        g1 = data.value.features[0].attributes['gridcode'];
        $("#Range").html("Maximum change in elevation: " + g1 + " ft");

        var i = 0;
	    for(i;i<data.value.features.length;i++){

	        var polygon_feature = data.value.features[i];
		    polygon_feature.symbol = fillSymbol;
		    graphicsLayer.add(polygon_feature);
		    }

//     counter = counter + 1;
//     removeLoadingSpinnerIfDone(counter);
	}



    function drawResult2(data){
        g2 = data.value.features[0].attributes['gridcode'];
        $("#IntDen").html("Intersections per square mile: " + g2);
	}



    function drawResult3(data){
        g3 = data.value.features.length;
        $("#Buses").html("Number of Bus Stops: " + g3);

		var i = 0;
	    for(i;i<data.value.features.length;i++){

	        var polygon_feature = data.value.features[i];
		    polygon_feature.symbol = markerSymbol;
		    graphicsLayer.add(polygon_feature);
		    }
	}



	function drawResultErrBack(err) {
        console.log("draw result error: ", err);
    }

    function errBack(err) {
        console.log("gp error: ", err);
    }

});


// function to analyze connectivity scores (high, medium, low)

function Connectivity(Score) {
  var ElevationChange;
  var ECWscore;
  switch(true) {
    case (g1 <=2499 && g1 >=600):
        ElevationChange = '10';
        ECWscore = "Low";
        break;
    case (g1 <=599 && g1 >=300):
        ElevationChange = '20';
        ECWscore = "Medium";
        break;
    case (g1 <=299 && g1 >=0):
        ElevationChange = '30';
        ECWscore = "High";
        break;
  }

  var IntersectionDensity;
  var IDWscore;
  switch(true) {
    case (g2 <=219 && g2 >=140):
        IntersectionDensity = '30';
        IDWscore = "High";
        break;
    case (g2 <=139 && g2 >=70):
        IntersectionDensity = '20';
        IDWscore = "Medium";
        break;
   case (g2 <=69 && g2 >=0):
        IntersectionDensity = '10';
        IDWscore = "Low";
        break;
  }

  var BusStopCount;
  var BSWscore;
  switch(true) {
    case (g3 <=1299 && g3 >=100):
      BusStopCount = '30';
      BSWscore = "High";
      break;
    case (g3 <=99 && g3 >=10):
      BusStopCount = '20';
      BSWscore = "Medium";
      break;
    case (g3 <=9 && g3 >=0):
      BusStopCount = '10';
      BSWscore = "Low";
      break;
  }

  var TotalScore = (ElevationChange * 0.20) + (IntersectionDensity * 0.50) + (BusStopCount * 0.30);
  var HiMidLo;
  switch(true) {
    case (TotalScore >= 10 && TotalScore <= 17):
      var HiMidLo = "Low";
      break;
    case (TotalScore >= 18 && TotalScore <= 22):
      var HiMidLo = "Medium";
      break;
    case (TotalScore >= 23 && TotalScore <= 30):
      var HiMidLo = "High";
      break;
  }
    displaycityname = document.getElementById("DisplayCityName");
    displaycityname.innerText = "Connectivity for " + document.getElementById("cityname").value + ", Utah"
    connscore = document.getElementById("ConnScore");
    connscore.innerText = "Total Connectivity Score: " + HiMidLo;
    elevscore = document.getElementById("ElevScore");
    elevscore.innerText = "Elevation Change Score: " + ECWscore;
    intscore = document.getElementById("IntScore");
    intscore.innerText = "Intersection Density Score: " + IDWscore;
    busscore = document.getElementById("BusScore");
    busscore.innerText = "Bus Stops Score: " + BSWscore;

  };






//Script for exporting to PDF from Modal
$('#exportBtn').click(function() {

  var w = document.getElementById("resultsModal").offsetWidth;
  var h = document.getElementById("resultsModal").offsetHeight;
  html2canvas(document.getElementById("resultsModal"), {
    dpi: 300, // Set to 300 DPI
    scale: 3, // Adjusts your resolution
    onrendered: function(canvas) {
      var img = canvas.toDataURL("image/jpeg", 1);
      var doc = new jsPDF('L', 'px', [w, h]);
      doc.addImage(img, 'JPEG', 0, 0, w, h);
      doc.save('Connectivity_Results.pdf');
        }
    });

  });
