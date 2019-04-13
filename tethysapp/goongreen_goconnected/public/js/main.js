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
         var cityname = '"NAME" = ' + "'" + $("#cityname").val() + "'";
        // var cityname = document.getElementById("cityname").value;
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
        gp3.getResultData(result.jobId, "BusStops_Clip").then(drawResult3, drawResultErrBack);
	}

    //counter to see when all three processes have run
    var counter;
    counter = 0;

	function drawResult(data){
        g1 = data.value.features[0].attributes['gridcode'];
        $("#Range").html("Maximum change in elevation: " + g1 + " ft");

        var polygon_feature = data.value.features[0];
        polygon_feature.symbol = fillSymbol;
		graphicsLayer.add(polygon_feature);

		counter = counter + 1;
	}

    function drawResult2(data){
        g2 = data.value.features[0].attributes['gridcode'];
        $("#IntDen").html("Intersections per square mile: " + g2);

	    var polygon_feature = data.value.features[0];
		polygon_feature.symbol = fillSymbol;
		//graphicsLayer.add(polygon_feature);

		counter = counter + 1;
	}

    function drawResult3(data){
	    //var polygon_feature3 = data.value.features[0];
        g3 = data.value.features.length;
        //g = data.value.features[0].attributes['stopid'];
        var busstops = document.getElementById("Buses");

		//polygon_feature3.symbol = fillSymbol;
		//graphicsLayer3.add(polygon_feature3);

		counter = counter + 1;
	}

	function drawResultErrBack(err) {
        console.log("draw result error: ", err);
    }

	function statusCallback(data) {
        console.log(data.jobStatus);
        if (counter == 3) {
            $("#loading").html('');
        }
    }
    function errBack(err) {
        console.log("gp1 error: ", err);
    }

});

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
    case (TotalSCore >= 23 && TotalScore <= 30):
      var HiMidLo = "High";
      break;
  }

  var connscore = document.getElementById("ConnScore");
    connscore.innerText = "Total Connectivity Score: " + HiMidLo;
  var elevscore = document.getElementById("ElevScore");
    elevscore.innerText = "Elevation Change Score: " + ECWscore;
  var intscore = document.getElementById("IntScore");
    intscore.innerText = "Intersection Density Score: " + IDWscore;
  var busscore = document.getElementById("BusScore");
    busscore.innerText = "Bus Stops Score: " + BSWscore;

  }





});