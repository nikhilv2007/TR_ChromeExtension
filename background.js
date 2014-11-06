
var sourceLanguage="";
var hotelAvailabilityData,hotelBookingData="",hotelListenerActivated = false;
var flightAvailabilityData,flightBookingData="",flightListenerActivated = false;
var autofiller = true;
var launchBookingId ="";

chrome.browserAction.setBadgeText({text: "0"});

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	//console.log(changeInfo.status + " -- " + tab.url);
	if(changeInfo.status == "complete") {
		checkForValidUrl(tab);
	}
});

//Capture data when any xhr fails
chrome.webRequest.onCompleted.addListener( 			
	function(xhrData){
		
		if(parseInt(xhrData.statusCode) >=400){		//type == 'xmlhttprequest'
			//console.log("URL - " +xhrData.url+ "\nStatus - " + parseInt(xhrData.statusCode)+ "\nType - " +xhrData.type);
			chrome.tabs.query({active:true,highlighted:true}, function(tabsInfo){
				chrome.browserAction.getBadgeText({tabId: tabsInfo[0].id},function(errorCount){
					//console.log(errorCount);
					chrome.browserAction.setBadgeText({text: String(parseInt(errorCount)+1), tabId:tabsInfo[0].id});
				});
			});
		}
		
	},
	{urls: ["<all_urls>"]}
);

//Capture data when any error encountered
chrome.webRequest.onErrorOccurred.addListener( 			
	function(xhrData){

		//console.log("URL - " +xhrData.url+ "\nType - " +xhrData.type);
		chrome.tabs.query({active:true,highlighted:true}, function(tabsInfo){
			chrome.browserAction.getBadgeText({tabId: tabsInfo[0].id},function(errorCount){
				//console.log(errorCount);
				chrome.browserAction.setBadgeText({text: String(parseInt(errorCount)+1), tabId:tabsInfo[0].id});
			});
		});
		
	},
	{urls: ["<all_urls>"]}
);

//listen for any tabs get activated.
chrome.tabs.onActivated.addListener( function(info) { 
	chrome.tabs.get(info.tabId, function(tab) { 
		if (tab.url.indexOf('/hotels/hotel-availability.aspx?sid') > -1) { 
			chrome.tabs.sendMessage(tab.id, {action : 'getAllHotelsDisplayed', trigger:'tabOnActivated'}, function(source) {
				//console.log(source);
			});
			
		} 
		else if(tab.url.indexOf('/hotels/hotel-availability-details.aspx?id')> -1){
			chrome.tabs.sendMessage(tab.id, {action : 'getSingleHotelDisplayed', trigger:'tabOnActivated'}, function(source) {
				//console.log(source);
			});	
			
		}
		else if(tab.url.indexOf('/flights/flight-availability.aspx?fguid=') > -1){
			chrome.tabs.sendMessage(tab.id, {action : 'captureFlightDetails',trigger:'tabOnActivated'}, function(source) {
				//nothing to check here
			});
			
		}
	}); 
});
/*
//listen for tabs when closed
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo){
	
});
*/			
// Check to see if we are on TravelRepublic - This is called on every tab load
function checkForValidUrl(tab)  {  
	
	//page recognition
	if (tab.url.indexOf('hotels/hotel-availability') > -1){
		if(tab.url.indexOf('/hotels/hotel-availability.aspx?sid')> -1 && tab.url.indexOf('#ready') > -1){
			chrome.tabs.sendMessage(tab.id, {action : 'getAllHotelsDisplayed'}, function(source) {
				//console.log(source);
			});
		}
		else if(tab.url.indexOf('/hotels/hotel-availability-details.aspx?id=')){
			chrome.tabs.sendMessage(tab.id, {action : 'getSingleHotelDisplayed'}, function(source) {
				//console.log(source);
			});
		}
				
		if(tab.url.indexOf('#ready') > -1){
			//alert("hotel availability page");
			
			if(!hotelListenerActivated){	
				//keep track if listener is activated for hotels
				hotelListenerActivated = true;
				
																
				chrome.webRequest.onCompleted.addListener(
					function(details){						
						
						//capture user selected accommodation details 
						if(details.url.indexOf("/hotels/hotel-details.aspx?sid=") > -1 && details.method.toUpperCase() === "GET"){
					   		//get hotel and room id
					   		var roomNumber = details.url.slice(details.url.lastIndexOf("=")+1);
					   		roomNumber = roomNumber.split(',');
					   		var estabId = details.url.slice(details.url.indexOf("estabid=")+8,details.url.lastIndexOf("&"));
					   		//console.log("room # - "+roomNumber+"\nestab Id - "+estabId);
					   		hotelBookingData = "";
					   		
					   		//parse and find from availability data what user has selected
							for(i=0;i<hotelAvailabilityData.length;i++){
								//console.log("hotel name - "+ hotelAvailabilityData[i].estabName);
								if(hotelAvailabilityData[i].estabId === estabId){
									hotelBookingData = "<h4><i>Last hotel selection - </i>" +hotelAvailabilityData[i].estabName+"</h4><table><tbody><tr><th>Room Type</th><th>Board type</th><th>Cost</th></tr>";
									for(j=0;j<hotelAvailabilityData[i].rooms.length;j++){
										if(roomNumber.indexOf(hotelAvailabilityData[i].rooms[j].roomId) > -1){											
											hotelBookingData += "<tr><td>" +hotelAvailabilityData[i].rooms[j].roomTitle+"</td><td>"+ hotelAvailabilityData[i].rooms[j].boardType+"</td><td>"+
												hotelAvailabilityData[i].rooms[j].roomCost +"</td></tr>";
											
										}
									}
									hotelBookingData +="</tbody></table>";
									//hotelAvailabilityData = "";
									break;
								}	
							}		
				   		}
						
					},
					{urls: ["<all_urls>"]}	
				);
			}
	
		}
	}
	
	else if (tab.url.indexOf('hotels/hotel-details.aspx') > -1){
		//alert("hotel summary page");
		
		//capture details on hotels summary page
		chrome.webRequest.onCompleted.addListener(
			function(details){
				if(details.url.indexOf("/include/controls/transactional/ajax/gethoteldetails.aspx?") > -1){
					//alert("hotel details retrieved on summary page");
					/*
					chrome.tabs.sendMessage(tab.id, {action : 'getHotelsDisplayed'}, function(source) {
						//console.log(source);
					});*/
				}
					
			},
			{urls: ["<all_urls>"]}	
		);
	}

	else if(tab.url.indexOf('/flights/flight-availability.aspx?') > -1){
		chrome.tabs.sendMessage(tab.id, {action : 'captureFlightDetails'}, function(source) {
			//console.log(source);
		});
		
		if(!flightListenerActivated){
			//keep track if listener is activated for flights
			flightListenerActivated = true;

			chrome.webRequest.onCompleted.addListener(
				function(details){
					if(details.url.indexOf("/flights/flight-details.aspx?sid=") > -1){
						var fId = details.url.slice(details.url.indexOf("fid=")+4,details.url.lastIndexOf("&ssid"));
						//console.log(fId);
						flightBookingData ="";
						
						//find the selected flight details from datastructure
						for(i=0;i<flightAvailabilityData.length;i++){
							if(flightAvailabilityData[i].flightId == fId){
								flightBookingData = "<h4><i>Last flight selection:</i></h4><table><tr><th>Outbound</th><th>Inbound</th><th>Cost pp</th></tr><tr><td>"+flightAvailabilityData[i].outFlight.date+"<br>"+flightAvailabilityData[i].outFlight.time+"<br>"+flightAvailabilityData[i].outFlight.route+"<br>"+flightAvailabilityData[i].outFlight.stop+
														"</td><td>"+flightAvailabilityData[i].inFlight.date+"<br>"+flightAvailabilityData[i].inFlight.time+"<br>"+flightAvailabilityData[i].inFlight.route+"<br>"+flightAvailabilityData[i].inFlight.stop+
														"</td><td>"+flightAvailabilityData[i].price+"</td></tr><table>";
								break;
							}
						}
						
						//flightAvailabilityData ="";
					}
				},
				{urls: ["<all_urls>"]}
			);	
		}						
	}	
	
	else if ((tab.url.indexOf('/book/') > -1) && !((tab.url.indexOf('#personEditor') > -1) || (tab.url.indexOf('#flightDetails') > -1) ||			//mobile : non-angular
													(tab.url.indexOf('#addressEntry') > -1) || (tab.url.indexOf('#entry') > -1) ||
													(tab.url.indexOf('#autocompleteEntry') > -1) || (tab.url.indexOf('#dateTimeEntry ') > -1) ||
													(tab.url.indexOf('/Outbound/') > -1) || (tab.url.indexOf('#flight-section') > -1) ||     //transfer : mobile : angular
													(tab.url.indexOf('/passenger/') > -1) || (tab.url.indexOf('#passenger-section') > -1)||		//holidays : mobile: angular
													(tab.url.indexOf('//www.') > -1) || (tab.url.indexOf('//m.travelrepublic') > -1) || (tab.url.indexOf('//m.dnatatravel') > -1)		//booking page on Live
												  ) 
												&& autofiller){												  	
		//alert("booking form");

		chrome.tabs.sendMessage(tab.id, {action : 'autoFiller', email : localStorage.getItem('Email')+'@'+localStorage.getItem('EmailDomain')}, function(source) {
			console.log(source);
		});
	}
	
	else if (tab.url.indexOf('/BookingEngine/bkcomplete.aspx') > -1 || tab.url.indexOf('/booking/booking-complete.aspx') > -1 || tab.url.indexOf('booking/complete/') > -1){
		//alert("booking completion page");
		
		var environment = tab.url.split("//");
		environment = environment[1].split(".");
		if(tab.url.indexOf('//m') == -1){
			environment = environment[0];
		}
		else{
			environment = environment[1];
		}
			
		if(environment == "www" || environment =='travelrepublic'){
			environment = "";
		}
		else{
			environment = environment +".";
		}
		//console.log("environment : "+ environment);
		
		var bookingId;
		if( tab.url.indexOf('booking/complete/') > -1 ){	//mobile:angular booking complete page
			bookingId = tab.url.substring(tab.url.lastIndexOf('/')+1);
			//console.log("Booking id computed from URL :" +bookingId);
			launchDerwent(environment,bookingId);
		}
		else{
			chrome.tabs.sendMessage(tab.id, {action : 'getBookingId'}, function(source) {
				//console.log("Booking id returned from content script :" +source);
				bookingId = source;	
				launchDerwent(environment,bookingId);			
			});
		}	
		
		//console.log("Booking id:" +bookingId);
		
	}
	//derwent booking page
	else if(/derwent\.travelrepublic\.com[\/]+Booking\/boBookingDetails\.aspx\?/.test(tab.url)){
		
		chrome.tabs.sendMessage(tab.id, {action : 'bookingDetails'}, function(source) {
			
		});
	}	
	//derwent report page for FSC, Autobook
	else if(/derwent\.travelrepublic\.com[\/]+Reporting\/rpOrderRequired/.test(tab.url)){
		
		chrome.tabs.sendMessage(tab.id, {action : 'bookingHighlight', bookingId : launchBookingId});
		launchBookingId = "";
	}
	else if (tab.url.indexOf('travelrepublic') > -1){          
		//alert("We're on TravelRepublic!");  
		
	}
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	//get the displayed available hotel data from content script
  	if(request.task == "parsedHotelData"){
  		hotelAvailabilityData = request.hotelData;
    	//console.log(hotelAvailabilityData);
  	}
	//get the displayed available flights data from content script
    else if (request.task == "parsedFlightData"){
    	flightAvailabilityData = request.flightData;
    	//console.log(flightAvailabilityData);
    }
    //launch FSC Manager
    else if (request.task == "launchBookingManager"){
    	launchBookingId = request.bookingId;
    	chrome.tabs.create({url:request.URL,active:true});
    }  
});
  
//open a booking in derwent
function launchDerwent(environment,bookingId){
	var derwentUrl = "http://" + environment +"uk.derwent.travelrepublic.com/Booking/boBookingDetails.aspx?BookingID="+bookingId;
	chrome.tabs.create({url:derwentUrl,active:true});
}

//code for context menu
chrome.contextMenus.create({
    "title": "Translate to English",
    "contexts": [ 
		"selection",
		//"link"
	],
	"onclick" : translateText
});
		
		
function translateText(text) {
	var currentUrl = text.pageUrl;

	if (currentUrl.indexOf('travelrepublic.es') > -1){
		sourceLanguage = 'es';
		callTranslateApi(text.selectionText);
	}
	else if (currentUrl.indexOf('travelrepublic.it') > -1){
		sourceLanguage = 'it';
		callTranslateApi(text.selectionText);
	}
	else if (currentUrl.indexOf('travelrepublic.de') > -1){
		sourceLanguage = 'de';
		callTranslateApi(text.selectionText);
	}
	else if (currentUrl.indexOf('travelrepublic.at') > -1){
		sourceLanguage = 'de-at';
		callTranslateApi(text.selectionText);
	}
	else if ((currentUrl.indexOf('travelrepublic.ie') > -1) || (currentUrl.indexOf('travelrepublic.co.uk') > -1) || (currentUrl.indexOf('dnatatravel.com') > -1 )){
		sourceLanguage = 'en';
		alert("It is already in English :)");
	}
	else{
		sourceLanguage ='';
		alert("Sorry, Translate isn't supported on non-TR/Derwent page");
	}
	
}

function callTranslateApi(text){
	//ajax call to fetch english text
		jQuery.ajax({
			
			url: 'http://mymemory.translated.net/api/get?',
		    dataType: 'json',
		    type: "GET",
		    accepts: "application/json", 
			data : "q=" + text + "&langpair=" + sourceLanguage + "|en",
		    beforeSend: function(x){
		    	x.setRequestHeader("Content-Type","application/json");
		    	//console.log("Selected text is - " + text.selectionText + "\n Language code - "+sourceLanguage);
		    },
		    success: function(data, textStatus, jqXHR) {
	            // Calls Success. If data found on the service then it would be inside "DATA" variable
		    	//console.log("translated text :"+ data["responseData"]["translatedText"]);
		    	alert(data["responseData"]["translatedText"]);
		    },
		    error: function(xhr,error,code) {
	            // SOMETHING WRONG WITH YOUR CALL.
				alert("translation service failed"); 
			},
		    complete: function() {
		    	//alert("Process Completed.");
		    }
		});
}
  
//Omnibox suggestion for urls
chrome.omnibox.onInputChanged.addListener(function (typedText, suggestResults){
	//console.log("you typed : " +typedText);
	
	var targetUrls = ["https://www.travelrepublic.co.uk","https://www.travelrepublic.ie","https://www.travelrepublic.es","https://www.travelrepublic.it","https://www.travelrepublic.at","https://www.travelrepublic.de","http://uk.derwent.travelrepublic.com"
	];
	//var environment = ["pp", "bolt", "cavendish", "fraser", "greene", "harris", "johnson", "lewis", "linford", "nash", "owens", "powell", "regis"];
	var suggestions = [];
	
	if(typedText.length > 1){
		for(var i=0; i<targetUrls.length; i++){
			if(suggestions.length  === 5 ){
				break;
			}
			else if( targetUrls[i].search(typedText) > -1){
				suggestions.push({content:targetUrls[i], description: targetUrls[i]});
			}
		}
	}
		
	if(suggestions.length > 0){
	    suggestResults(suggestions);
    }
        
});

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(function(text){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	    chrome.tabs.update(tabs[0].id, {url: text});
	});
});
