$(function () {
	var map = new Maplace({
		map_options: {
			set_center: [41.850033, -87.6500523],
			zoom:3
		}
	}).Load();

	var petitions = [];
	var petition; 

	var WeThePeopleURL = "https://api.whitehouse.gov/v1/petitions";
	var jsonpURL = '.jsonp?limit=1000&offset=0&callback=?'

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
			results.sort(function(a, b){
				return b.signatureCount - a.signatureCount;
			});
			//add the results to petitions
			petitions = results;
			//clear previous petitions
			$('.petition').remove();
			//add new petitions to DOM
			for (i in petitions) {
				$('.petitions').append('<li class="petition" id="'+i+'"><h3 class="petition_title">'+petitions[i].title+'</h3></li>');
			}
		});
	}

	$('.petitions').on('click', '.petition', function (e) {
		//draw corresponding points to 
		//get petition id from corresponding petition
		var id = $(this).attr("id");
		var petitionID = petitions[id].id;
		//get area codes from first 1000 petitions
		$.getJSON(WeThePeopleURL + '/' + petitionID + '/signatures' + jsonpURL, 
		{
			format: "json"
		})
		.done(function(data) {
			var petitions = data.petitions;
			console.log(petitions);
			/*petitions.filter(function(i){
				return i.zip;
			});
			petitions.map(function(i){
				return i;
			})*/
			//add the petitions to map
		});
	});


	getPetitions("signatures", "responded");
});