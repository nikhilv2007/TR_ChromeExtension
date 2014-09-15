
chrome.windows.getCurrent(function(win) {	
	chrome.tabs.query({'windowId': win.id, 'active': true}, function(activeTab) {
		
		//display contents in popup
		document.getElementById('email').value = localStorage.getItem('Email');
		document.getElementById('emailDomain').value = localStorage.getItem('EmailDomain');
		popupContent();
		
		//display show all rooms button on hotel search results page
		if((activeTab[0].url.indexOf('hotels/hotel-availability.aspx') > -1 || activeTab[0].url.indexOf('holidays/holiday-hotel-availability.aspx') > -1) && activeTab[0].url.indexOf('#ready') > -1){
			document.getElementById('hotelRooms').style.display = 'inline';

		}
		else{
			document.getElementById('hotelRooms').style.display = 'none';
		}
			
  	}); 
});

function popupContent(){
	//get data from background page 
	chrome.runtime.getBackgroundPage(function (backgroundPage) {
	    document.getElementById('autofiller').checked = backgroundPage.autofiller;
	    document.getElementById('hotelData').innerHTML = backgroundPage.hotelBookingData;
		document.getElementById('flightData').innerHTML = backgroundPage.flightBookingData;
	});
}

function showAllRooms(){
	//logic to expand all room options 	for all hotels.
	chrome.tabs.query({'highlighted': true, 'active': true}, function(activeTab) {
		chrome.tabs.sendMessage(activeTab[0].id,{action:'showAllRooms'},function(source){
		});
	});
}

function showPayAtHotelRoom(){
	//logic to expand all room options 	for all hotels.
	chrome.tabs.query({'highlighted': true, 'active': true}, function(activeTab) {
		chrome.tabs.sendMessage(activeTab[0].id,{action:'showPayAtHotelRoom'},function(source){
		});
	});
}

function showDepositRoom(){
	//logic to expand all room options 	for all hotels.
	chrome.tabs.query({'highlighted': true, 'active': true}, function(activeTab) {
		chrome.tabs.sendMessage(activeTab[0].id,{action:'showDepositRoom'},function(source){
		});
	});
}

function updateEmailId(){
	localStorage.setItem('Email', document.getElementById('email').value);
	localStorage.setItem('EmailDomain', document.getElementById('emailDomain').value);
}

function updateAutofiller(){
	//set data in background page
	chrome.runtime.getBackgroundPage(function (backgroundPage) {
	    backgroundPage.autofiller = document.getElementById('autofiller').checked;
	});
}

function showCookie(){
	//console.log("checkbox status has changed!!!");
	if (document.getElementById('chkCookies').checked){
		chrome.tabs.query({'highlighted': true, 'active': true}, function(activeTab) {
			chrome.tabs.sendMessage(activeTab[0].id,{action:'getCookies'},function(source){
				if (source != null){
					//console.log("returned cookie from content script -"+source);
					cookieList = source.split(';');
					var cookieString = "";
					for ( var i=0; i< cookieList.length; i++){
						if (cookieList[i] != " " && cookieList[i]){
							cookieString += "<li><input type='text' style='width:350px' value='"+cookieList[i].trim()+"'></input></li>";	
						}						
					}
					
					document.getElementById("cookieList").innerHTML = cookieString;	
					document.getElementById('setCookie').style.display = "inline";
				}
				else {
					document.getElementById("cookieList").innerHTML = "No cookies or not a TR page";
				}
			});
		});
	}
	else{
		document.getElementById("cookieList").innerHTML = "";
	}	
	
}

function setCookie(){
	var cookieString = "";
	var inputValue = document.querySelectorAll('#cookieList input');
	for (var i=0; i<inputValue.length ; i++){
		cookieString += inputValue[i].value +"; ";
	}
	cookieString = cookieString.slice(0,(cookieString.length-2));
	//console.log(cookieString);
	
	chrome.tabs.query({'highlighted': true, 'active': true}, function(activeTab) {
		chrome.tabs.sendMessage(activeTab[0].id,{action:'setCookie', cookieValue:cookieString},function(source){
		});
	});
}

window.addEventListener('load', function(evt) {

   	// Bind our showAllRooms function to the Show All Rooms button click event
   	document.getElementById('btnShowAllRooms').addEventListener('click', showAllRooms);
   	
   	// Bind our showPayAtHotel function to the Show Pay@Hotel button click event
   	document.getElementById('btnPayAtHotelRoom').addEventListener('click', showPayAtHotelRoom);
   	
   	// Bind our showPayAtHotel function to the Show Pay@Hotel button click event
   	document.getElementById('btnDepositRoom').addEventListener('click', showDepositRoom);
   	
   	//Update email id
   	document.getElementById('email').addEventListener('keyup', updateEmailId);
   	document.getElementById('emailDomain').addEventListener('keyup', updateEmailId);
   	
   	//autofiller checkbox update
   	document.getElementById('autofiller').addEventListener('change', updateAutofiller);
   	
   	document.getElementById('chkCookies').addEventListener('change',showCookie);
   	document.getElementById('setCookie').addEventListener('click', setCookie);
});
