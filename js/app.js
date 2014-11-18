$(function () {
	var fillerHeight = 50;
	var mapWidth = $('.mapcontainer').width();
	var height = $(window).height();
	$('#gmap').width(mapWidth).height(height);
	$('.navigation').height(height);
	$('.petitions').height(height-fillerHeight);

	var map = new Maplace({
		map_options: {
			set_center: [41.850033, -87.6500523],
			zoom:3
		},
		locations: []
	}).Load();

	var petitions = [],
		zipArray = [],
		signatures = [];
	var currentID;

	var WeThePeopleURL = "https://api.whitehouse.gov/v1/petitions";
	var jsonpURL = '.jsonp?limit=1000&offset=0&callback=?';
	var jsonpURL20 = '.jsonp?limit=20&offset=0&callback=?';

	var sigToMaplace = function(zip, name) {
		var zipLatLong = zipArray[zip];
		if (signatures[zip]){
			signatures[zip].html += ", " + name;
		}
		else if (zipLatLong){
			signatures[zip] = {html: "Signature(s): " + name, lat: zipLatLong.lat, lon: zipLatLong.lon, title: zip};
		}
	};

	//get list of petitions
	var getPetitions = function(sort, status) {
		//figure out how to do this
		$.getJSON(WeThePeopleURL + jsonpURL, {
			status: status,
			format: "json"
		})
		.done(function(data) {
			var results = data.results;
			//sort the results 
			if (sort === 'signatures') {
				results.sort(function(a, b){
					return b.signatureCount - a.signatureCount;
				});
			}
			else {
				results.sort(function(a,b){
					return b.created - a.created;
				});
			}
			//add the results to petitions
			petitions = results;

			console.log(petitions.length);
			//clear previous petitions
			$('.petitions').children().remove();
			//add new petitions to DOM
			for (i in petitions) {
				$('.petitions').append('<li class="petition" id="'+i+'"><h5 class="petition_title">'+petitions[i].title+'</h5><p>Signatures: '+petitions[i].signatureCount+'</p><a href="'+petitions[i].url+'">View Petition</a></li>');
			}
		});
	};

	$('.petitions').on('click', '.petition', function (e) {
		//draw corresponding points to 
		//get petition id from corresponding petition
		var id = $(this).attr("id");
		var petitionID = petitions[id].id;
		//reset signatures
		signatures = [];
		//get area codes from first 1000 petitions
		$.getJSON(WeThePeopleURL + '/' + petitionID + '/signatures' + jsonpURL, 
		{
			format: "json"
		})
		.done(function(data) {
			var results = data.results;
			results = results
			.map(function(i){
				//make zip codes nice
				i.zip = i.zip.slice(0,5);
				if (i.zip[0] === '0') {
					i.zip = i.zip.slice(1);
				}
				return i;
			})
			.filter(function(i){
				//remove non zip-codes
				return i.zip && !isNaN(+i.zip);
			})

			//console.log(results);
			
			results.forEach(function(i) {
				//change sigs into maplace locations and add to signatures
				sigToMaplace(i.zip, i.name);
			});

			signatures = signatures.filter(function(i) {
				return i;
			})
			.map(function(i){
				i.zoom = 8;
				i.visible = true;
				return i;
			});

			//add the petitions to map
			$('#gmap').children().remove();

			map = new Maplace({
				locations: signatures,
				map_options: {
					set_center: [41.850033, -87.6500523],
					zoom:3
				}
			}).Load();

			//console.log(signatures);

		});
	});

	$('select').change(function () {
		var status = $('.status option:selected').text();
		var sort = $('.sort option:selected').text();
		//console.log(status)
		//console.log(sort);
		getPetitions(sort, status);
	});

	getPetitions("signatures", "responded");

	$.ajax({
	    url: 'free-zipcode-database.csv',
	    dataType: 'jsonp',
	    complete: function(data){
	        var results = data.responseText;
	        results = $.csv.toObjects(results);
	        //move results to zipArray
	        //console.log(results);
	        results.forEach(function(i){
	        	zipArray[i.Zipcode] = {lat: i.Lat, lon: i.Long};
	        });
	        //console.log(zipArray);
	    }
	});

	$(window).resize(function () {
		mapWidth = $('.mapcontainer').width();
		height = $(window).height();
		$('#gmap').width(mapWidth).height(height);
		$('.navigation').height(height);
		$('.petitions').height(height-fillerHeight);
	});
});