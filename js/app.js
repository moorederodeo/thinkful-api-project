$(function () {
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
		if (signatures[zip]){
			signatures[results[i].zip].names.push(results[i].name);
		}
		else {
			signatures[results[i].zip] = {names: [results[i].name], zip: results[i].zip};
		}
	};

	//get list of petitions
	var getPetitions = function(sort, status) {
		//figure out how to do this
		$.getJSON(WeThePeopleURL + jsonpURL20, {
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
			//clear previous petitions
			$('.petition').remove();
			//add new petitions to DOM
			for (i in petitions) {
				$('.petitions').append('<li class="petition" id="'+i+'"><h3 class="petition_title">'+petitions[i].title+'</h3></li>');
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
			
			results.every(function(i) {
				//change sigs into maplace locations and add to 
				signatures[i.zip] = sigToMaplace(i.zip, i.name);
			});


			console.log(signatures);

			//add the petitions to map
		});
	});

	$('select').change(function () {
		var status = $('.status option:selected').text();
		var sort = $('.sort option:selected').text();
		console.log(status);
		getPetitions(sort, status);
	});
	/*


	console.log(signatures.filter(function(i) {
		return i.names.length > 1;
	}));
	*/

	// This next function will update the list when the sort or status update


	getPetitions("signatures", "responded");

	$.ajax({
	    url: 'free-zipcode-database.csv',
	    dataType: 'jsonp',
	    complete: function(data){
	        var results = data.responseText;
	        results = $.csv.toObjects(results);
	        //move results to zipAarray
	        results.every(function(i){
	        	zipArray[i.Zipcode] = {lat: i.Lat, lon: i.Long};
	        });
	        console.log(zipArray);
	    }
	});
});