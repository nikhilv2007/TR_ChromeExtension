var timeOutInterval, 	depositRoomCount = pAHRoomCount = 0,	roomType = 'none';
var displayedHotelData;
chrome.extension.onMessage.addListener(function(request, sender, callback){
	
    if (request.action == 'getSingleHotelDisplayed'){
        if(request.trigger == 'tabOnActivated'){
        	captureSingleHotelData();
        	return;
        }
                 
        // create an observer instance
		var observer = new MutationObserver(function(mutations) {
			captureSingleHotelData();
		});
				
		var target = document.getElementById('inlineResultsPanel');		
		var config = { childList: true, subtree: true}; //attributes: true, childList: true, characterData: true };
		observer.observe(target, config);
		
		captureSingleHotelData();              	
    }
    
    else if (request.action == 'getAllHotelsDisplayed'){
    	if(request.trigger == 'tabOnActivated'){
    		captureAllHotelsData();
    		return;
    	}
    	// create an observer instance
		var observer = new MutationObserver(function(mutations) {
			captureAllHotelsData();
		});
				
		var target = document.getElementById('pagePanel');
		var config = { childList: true, subtree: true}; //attributes: true, childList: true, characterData: true };
		observer.observe(target, config);
		
    }
    
    else if(request.action == 'showAllRooms'){
    	//console.log("No Of caption elements -" +document.getElementsByClassName("caption").length);
    	//logic for show/hide rooms
    	showAllRooms('cam','habit','room');
    	
    }
    
    else if(request.action == 'showPayAtHotelRoom'){
    	//show all rooms
    	//showAllRooms('Visualizza','Mostrar','Show');
    	
    	if(document.querySelectorAll('.payAtHotelIcon').length == 0){
    		alert("No pay @ hotel room(s) on this page");
    	}
	   	else{
	   		if(roomType == 'payAtHotel'){
	   			pAHRoomCount = pAHRoomCount+1;
	   			if(pAHRoomCount > document.querySelectorAll('.payAtHotelIcon').length - 1){
	   				pAHRoomCount %= document.querySelectorAll('.payAtHotelIcon').length;
	   			}
	   		}
	   		else{
	   			pAHRoomCount = 0;
	   		}
	   	
	    	var position = getPosition(document.querySelectorAll('.payAtHotelIcon')[pAHRoomCount]);
	    	//console.log('coordinates for PAH room no '+ pAHRoomCount+' are ' + position.x +', ' +position.y);
	    	window.scrollTo(position.x, position.y);
	    	roomType = 'payAtHotel';
	    }
    }
    
    else if(request.action == 'showDepositRoom'){
    	//show all rooms
    	//showAllRooms('Visualizza','Mostrar','Show');
    	
    	if(document.querySelectorAll('.depositLowIcon').length == 0){
    		alert("No deposit room(s) on this page");
    	}
    	else{
    		if(roomType == 'deposit'){
	   			depositRoomCount = depositRoomCount+1;
	   			if(depositRoomCount > document.querySelectorAll('.depositLowIcon').length - 1){
	   				depositRoomCount %= document.querySelectorAll('.depositLowIcon').length;
	   			}
	   		}
	   		else{
	   			depositRoomCount = 0;
	   		}
	   		
    		var position = getPosition(document.querySelectorAll('.depositLowIcon')[depositRoomCount]);
	    	//console.log('coordinates for deposit room no '+ depositRoomCount+' are ' + position.x +', ' +position.y);
	    	window.scrollTo(position.x, position.y);
	    	roomType = 'deposit';
    	}
    	
    }
    
    else if(request.action =='captureFlightDetails'){
    	//console.log(document.getElementById("flightAvailability"));
		if(request.trigger == 'tabOnActivated'){
			captureAllFlights();
			return;
		}
		
		captureAllFlights();
		
		// create an observer instance
		var observer = new MutationObserver(function(mutations) {
			captureAllFlights();
		});
				
		// select the target node
		var target = document.querySelector('#flightAvailability');
		  
		// configuration of the observer:
		var config = { childList: true, subtree: true, characterData: true}; //attributes: true, childList: true, characterData: true };
		 
		// pass in the target node, as well as the observer options
		observer.observe(target, config);
		
		// later, you can stop observing
		//observer.disconnect();
		
		//callback("returned from captureFlightDetails part of content scripts");		
    }  
      
    else if(request.action == 'autoFiller'){
    	//alert("inside auto filler");
    	
    	//Loop until elements on booking page are loaded and filled
      	timeOutInterval = setInterval(function(){bookingFormInject(request.email);},3000);
      	//chrome.alarms.create("bookingPageLoad",{delayInMinutes:0.05});
    	
    	//callback(document.documentElement.innerHTML); 	
    }
	else if (request.action == 'getBookingId'){
		//Check booking numbers
		var bookingId = '0';
		//alert("start booking id extract");
		if (document.querySelector(".trp-color-primary") != null) {
			//alert(" web single, mobile booking ");
			bookingId = document.querySelector(".trp-color-primary").innerHTML;
			//callback(document.querySelector(".trp-color-primary").innerHTML);			
		}
		else{
			//alert("web multi booking");
			bookingId = document.querySelector(".textOrange").innerHTML; //textOrange
			//callback(document.querySelector(".textOrange").innerHTML);
		}
		bookingId = bookingId.split("/");
		//alert(bookingId[1]);
		callback(bookingId[1]);
    }
    
    else if (request.action == 'bookingDetails'){
    	//Derwent: booking details page

    	//enable FSC(failed security check) manager link 
    	var mydiv = document.getElementById("_ctl0_cphMain_conBookingInfo_lblBookingStatus");

		if(mydiv.innerText == "Failed Security Check"){
			var aTag = document.createElement('a');
			aTag.setAttribute('style',"cursor: hand;");
			aTag.setAttribute('id','launchFSCManager');
			aTag.innerHTML = " FSC Manager";
			
			//Booking notes section by default
			document.getElementById('_ctl0_cphMain_conBookingNotes_rptBookingNotes__ctl0_tdSubject').appendChild(aTag) || mydiv.appendChild(aTag);
			
			document.getElementById('launchFSCManager').addEventListener('click', launchBookingManager);
		}
		
		//Rerun failed booking
		else if(document.getElementById('_ctl0_cphMain_conBookingNotes_rptBookingNotes__ctl0_tdSubject').innerText.indexOf('Booking Failed') > -1){
			var aTag = document.createElement('a');
			aTag.setAttribute('style',"cursor: hand;");
			aTag.setAttribute('id','rerunAutoBooker');
			aTag.innerHTML = " Rerun Autobooker";
			
			//Booking notes section by default
			document.getElementById('_ctl0_cphMain_conBookingNotes_rptBookingNotes__ctl0_tdSubject').appendChild(aTag) || mydiv.appendChild(aTag);
			
			document.getElementById('rerunAutoBooker').addEventListener('click', launchBookingManager);
		}
		/*
		//BlackListed Booking
		if(document.getElementById('_ctl0_cphMain_trImportantNotes') && /blacklisted/i.test(document.getElementById('_ctl0_cphMain_trImportantNotes').innerText)){
			console.log("Backlisted");
		}
		*/
    }
    
    //highlight bookings in derwent
    else if (request.action == 'bookingHighlight' && request.bookingId != ""){
    	/*if(document.getElementById('ddlOffice').value !== "0-0"){
    		
			//set office = "All Offices"
	    	document.getElementById('ddlOffice').value = "0-0"; 
	    	//trigger change event on select option
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent('change', true, true);
			document.getElementById('ddlOffice').dispatchEvent(evt);
			
			var highlightInterval = setInterval(function(){
				alert("inside highlight interval function()");
				//clearInterval(highlightInterval);
				var elements = document.getElementsByTagName("a");
				for (var i = 0; i < elements.length; i++) {
					
				    if (elements[i].getAttribute("href").indexOf(request.bookingId) > -1) {
				    	elements[i].setAttribute('style','background-color: yellow;');
				    	elements[i].scrollIntoView(true);
				        break;
				    }
				}
			},4000);
    	}
    	else{
    		var elements = document.getElementsByTagName("a");
			for (var i = 0; i < elements.length; i++) {
				
			    if (elements[i].getAttribute("href").indexOf(request.bookingId) > -1) {
			    	elements[i].setAttribute('style','background-color: yellow;');
			    	elements[i].scrollIntoView(true);
			        break;
			    }
			}
    	}*/       	
    	var elements = document.getElementsByTagName("a");
		for (var i = 0; i < elements.length; i++) {
			
		    if (elements[i].getAttribute("href").indexOf(request.bookingId) > -1) {
		    	elements[i].setAttribute('style','background-color: yellow;');
		    	elements[i].scrollIntoView(true);
		        break;
		    }
		}
    }
    
    else if (request.action == 'getCookies'){
    	//alert("returning cookies");
    	callback(document.cookie);
    }
    
    else if (request.action == 'setCookie'){
    	//console.log(request.cookieValue);
    	var newCookieList = request.cookieValue.split(';');
    	for (var i=0; i<newCookieList.length; i++){
    		cookieValue = newCookieList[i].substr(newCookieList[i].indexOf('=')+1);
    		cookieName = newCookieList[i].split('=')[0].trim();
    		sourceCookieValue = getCookie(cookieName);
    		
    		//if new cookie name found, create new cookie
    		if(sourceCookieValue == ""){
    			setCookie(cookieName, cookieValue, 1);
    		}
    		//if cookie value is changed, set the new value
    		else if(sourceCookieValue != cookieValue){
    			setCookie(cookieName, cookieValue, -1);
    			setCookie(cookieName, cookieValue, 1);
    		}
    	}    	
    }
});

function captureSingleHotelData(){
	displayedHotelData = [];
 
  	//code to extract data on individual hotel page(hotel-availability-details)
    var displayedRoomData =[];
    var roomsList = document.getElementsByClassName('room-row roomRow');
    for(j=0;j< roomsList.length;j++){
		//console.log("room "+j+" - "+roomsList[j].getAttribute("data-id"));
		displayedRoomData.push({
			roomId:roomsList[j].getAttribute("data-id"),
			roomTitle:roomsList[j].querySelector('tr div').innerHTML,
			boardType:roomsList[j].querySelectorAll('tr div')[1].innerHTML,
			roomCost:roomsList[j].getAttribute("data-roomcost")
		});
	}
	displayedHotelData.push({
		estabId:document.querySelector('div[class="panelResults hotelResult"]').getAttribute("data-id"),
		estabName:document.getElementsByClassName("new-hotel-name")[0].innerHTML,
		rooms:displayedRoomData
	});
    sendHotelData();
}

function captureAllHotelsData(){
	displayedHotelData = [];
    //code to extract data when multiple hotels are displayed
    var hotelsList = document.getElementsByClassName("hotelResult hotel-availability-listing clearfix");
	for(i=0;i<hotelsList.length;i++){
		var displayedRoomData =[];
		//console.log("estab id for index " +i+ " - "+hotelsList[i].getAttribute("data-id") + ":"+ hotelsList[i].getElementsByClassName("viewDetailsLink")[0].innerHTML);
		var roomsList = document.getElementsByClassName("hotelResult hotel-availability-listing clearfix")[i].getElementsByClassName("room-row roomRow");
		for(j=0;j< roomsList.length;j++){
			//console.log("room "+j+" - "+roomsList[j].getAttribute("data-id"));
			displayedRoomData.push({
				roomId:roomsList[j].getAttribute("data-id"),
				roomTitle:roomsList[j].querySelector('tr div').innerHTML,
				boardType:roomsList[j].querySelectorAll('tr div')[1].innerHTML,
				roomCost:roomsList[j].getAttribute("data-roomcost")
			});
		}
		displayedHotelData.push({
			estabId:hotelsList[i].getAttribute("data-id"),
			estabName:hotelsList[i].getElementsByClassName("viewDetailsLink")[0].innerHTML,
			rooms:displayedRoomData
		});
	}
	sendHotelData();	
}

function sendHotelData(){
	chrome.runtime.sendMessage({task:"parsedHotelData", hotelData:displayedHotelData}, function(response) {
 		displayedHotelData = [];			  	
	});
}

function showAllRooms(italian,spanish,english){
	for (var captionLength = document.getElementsByClassName("caption").length -1, i=0;i<21;captionLength--,i++){
    	//console.log(captionLength);
    	if (document.getElementsByClassName("caption")[captionLength].innerHTML.indexOf(italian) > -1 || document.getElementsByClassName("caption")[captionLength].innerHTML.indexOf(spanish) > -1 || document.getElementsByClassName("caption")[captionLength].innerHTML.indexOf(english) > -1){
    		document.getElementsByClassName("caption")[captionLength].click();
    	}
    		
    }
}

//function to retrieve coordinates of an HTML element
function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;
  
    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        //yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        yPosition += element.offsetTop;
        
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}

function captureAllFlights(){
	var flightList = document.getElementsByClassName("flightResult");
	//console.log("No of flights displayed: "+flightList.length);
			
 	//parse the data from DOM and store in datastructure
 	var displayedFlightData = [];
 	for(i=0; i<flightList.length; i++){
 		displayedFlightData.push({outFlight:{date:flightList[i].getElementsByClassName("flightLeg")[0].querySelectorAll('p')[0].innerText, time:flightList[i].getElementsByClassName("flightLeg")[0].querySelectorAll('p')[1].innerText, route:flightList[i].getElementsByClassName("flightLeg")[0].querySelectorAll('p')[2].innerText, stop:flightList[i].getElementsByClassName("flightLeg")[0].querySelectorAll('p')[3].innerText},   	//flightList[i].getElementsByClassName("flightLeg")[0].innerText.replace("Outbound Flight",""),
 									inFlight:{date:flightList[i].getElementsByClassName("flightLeg")[1].querySelectorAll('p')[0].innerText, time:flightList[i].getElementsByClassName("flightLeg")[1].querySelectorAll('p')[1].innerText, route:flightList[i].getElementsByClassName("flightLeg")[1].querySelectorAll('p')[2].innerText, stop:flightList[i].getElementsByClassName("flightLeg")[1].querySelectorAll('p')[3].innerText},		//flightList[i].getElementsByClassName("flightLeg")[1].innerText.replace("Return Flight",""),
					 				flightId:document.getElementsByClassName('flightSelector')[i].getAttribute('data-id'),
					 				price:document.getElementsByClassName('flightLeadPrice')[i].innerText});
 	}
 			
 	chrome.runtime.sendMessage({task:"parsedFlightData", flightData:displayedFlightData}, function(response) {
 		displayedFlightData =[];			  	
	});
}

/*
chrome.alarms.onAlarm.addListener(function(alarmDetails){
	if (alarmDetails.name == "bookingPageLoad"){
		bookingFormInject("abcd@123.com");
	}
});
*/

function bookingFormInject(userEmailId){
	//console.log('booking form page loaded');
	var dnataPage = (document.URL.indexOf('dnata')> -1)? true:false;
	
	if(document.getElementById('conTitle') != null){
		clearInterval(timeOutInterval);
		//chrome.alarms.clear("bookingPageLoad", function(wasCleared){});
			
		//implementation for search address function
	    if(document.getElementById('conAddress') != null){
		    document.getElementById('conAddress').value = 'myAddress';
		    document.getElementById('conTown').value = 'myTown';
		    document.getElementById('conCounty').value = 'myCountry';
	    }
	    
		//new way of search; search concurrently for postcode as well as address
	    if (document.getElementById('conPostcodeSelector') != null) {
	    	//dummy step to locate the address field and enter value
	    	document.getElementById('conPostcodeSelector').value = 'Travel Republic Ltd';
	    	document.getElementById('conPostcodeSelector').value = '';
	    	
	    	//actual key press mimicking for address field
		    mimickKeyboardEnter('Travel Republic Ltd', 'Id', 'conPostcodeSelector', 0);
			
			//select address from suggestion list
			setTimeout(function(){        
				if(document.getElementsByClassName('ui-menu-item').length > 0){
					document.getElementsByClassName('ui-menu-item')[0].click();
				}
			},3000);
		}
		//old way of address search by clustered postcode
		else if(document.getElementById('conPostCode') != null){
			document.getElementById('conPostCode').value = 'kt2 6nh';
		    if(document.getElementById('postCodeSearch') != null){
		    	document.getElementById('postCodeSearch').click();
		    		
				setTimeout(function(){selectAddressUK();},5000);	
		    	
		    }
		}
		//lead contact details section
		document.getElementById('conTitle').value = 'Mr';
		//document.getElementById('conFirstName').value = '';
	    //document.getElementById('conLastName').value = '';
	    if (document.getElementById('conEmail') != null){
	    	document.getElementById('conEmail').value = userEmailId;
	    	if(document.getElementById('conEmailConfirm') != null){
		    	document.getElementById('conEmailConfirm').value = userEmailId;
		    }
	    }
	    
	    if(document.getElementById('conHomeP') != null){
	    	document.getElementById('conHomeP').value = '12345';
	    }
	    
	    if(document.getElementById('comMobileP') != null){
	    	document.getElementById('comMobileP').value = '09876';
	    }
	    		
	    //Payment section
	    if(document.getElementById("cardType") != null){
	    	//select card from dropdown
		    var selections = document.getElementById("cardType");
		    if(dnataPage){
		    	selections.value = getOptionValue(document.getElementById("cardType"), "Mastercard");
		    }
		    else{
		    	selections.value = getOptionValue(document.getElementById("cardType"), "Visa");
		    }
		    //trigger change event on select option
		    var evt = document.createEvent("HTMLEvents");
		    evt.initEvent('change', true, true);
		    selections.dispatchEvent(evt);
			
			//enter card details
			if(document.getElementById('cardNumber') != null){
				if(dnataPage){
					document.getElementById('cardNumber').value = '5123456789012346';
				    document.getElementById('expMonth').value = '05';
				    document.getElementById('expYear').value = '2017';
				    document.getElementById('secDigits').value = '123';					
				}
				else{
					document.getElementById('cardNumber').value = '4444333322221111';
				    document.getElementById('expMonth').value = '01';
				    document.getElementById('expYear').value = '2030';
				    document.getElementById('secDigits').value = '111';
				}
			}
	    }
		    		
		//transfers section
		if(document.getElementById('outboundFlightNo') != null){
			document.getElementById('outboundFlightNo').value = 'out123';
		}
		if(document.getElementById('inboundFlightNumber') != null){
			document.getElementById('inboundFlightNumber').value = 'in123';
		}
		if(document.getElementById('hotelName') != null){
			document.getElementById('hotelName').value = 'Hotel Name';
			document.getElementById('hotelAddress').value = 'Hotel Address';
		}
		
		//car park section
		if(document.getElementById('carMake') != null){
			document.getElementById('carMake').value = 'Car Make';
			document.getElementById('carModel').value = 'Car Model';
			document.getElementById('carColour').value = 'Car Colour';
			document.getElementById('carRegistration').value = 'Car Registration';		
		}	
		
		//car hire section
		if(document.getElementById('0Title')!= null){
			//do nothing
		}	
		
	    //checkboxes at page bottom
	    if(document.getElementById('chkAgreeToConditions') != null){
	    	//console.log("checking T&C checkbox");
	    	document.getElementById('chkAgreeToConditions').checked = true;
	    }
	    
	    if(document.getElementById('chkEmailsignup') != null){
	    	document.getElementById('chkEmailsignup').checked = true;
	    }
	    
	    if(document.getElementById('importantDetailsDisclaimer') != null){
	    	document.getElementById('importantDetailsDisclaimer').checked = true;
	    	document.getElementById('lstRefererSource').value = '1';
	    }
	}
	
	//for mobilesite booking form implemented on angular.js
	else if(document.getElementsByName('title').length > 0){
		clearInterval(timeOutInterval);
		//chrome.alarms.clear("bookingPageLoad", function(wasCleared){});
		
		if(document.getElementsByName('title')[0].getAttribute('class').indexOf("ng-invalid") >= 0){
			//mimickKeyboardEnter('', 'Name', 'title', 0);
			mimickKeyboardEnter('Mr', 'Name', 'title', 0);
					
			//document.getElementsByName('firstName')[0].value = '';
			//document.getElementsByName('lastName')[0].value = '';
			//mimickKeyboardEnter('', 'Name', 'homePhoneNumber', 0);
			mimickKeyboardEnter('12345', 'Name', 'homePhoneNumber', 0);
			//mimickKeyboardEnter('', 'Name', 'email', 0);
			mimickKeyboardEnter(userEmailId, 'Name', 'email', 0);
			
			//outbound flight details
			if(document.getElementsByName('outboundFlightNumber').length > 0){
				//mimickKeyboardEnter('', 'Name', 'outboundFlightNumber', 0);
				mimickKeyboardEnter('AA123', 'Name', 'outboundFlightNumber', 0);
			}
			
			//Address details for non UK domain
			if(document.getElementsByName('postCode').length > 0){
				//mimickKeyboardEnter('', 'Name', 'postCode', 0);
				mimickKeyboardEnter('PC123', 'Name', 'postCode', 0);
				//mimickKeyboardEnter('', 'Name', 'address', 0);
				mimickKeyboardEnter('address', 'Name', 'address', 0);
				//mimickKeyboardEnter('', 'Name', 'cityTown', 0);
				mimickKeyboardEnter('cityTown', 'Name', 'cityTown', 0);
			}
			
			//return flight details
			if(document.getElementsByName('inboundFlightNumber').length > 0){
				//mimickKeyboardEnter('', 'Name', 'inboundFlightNumber', 0);
				mimickKeyboardEnter('ZZ987', 'Name', 'inboundFlightNumber', 0);
			}
			
			//hotel details
			if(document.getElementsByName('hotelName').length > 0){
				//mimickKeyboardEnter('', 'Name', 'hotelName', 0);
				mimickKeyboardEnter('Hotel Name', 'Name', 'hotelName', 0);
				//mimickKeyboardEnter('', 'Name', 'hotelAddress', 0);
				mimickKeyboardEnter('Hotel Address', 'Name', 'hotelAddress', 0);
			}
			
			//simulatedClick(document.getElementsByClassName('checkbox-btn ng-scope ng-isolate-scope')[2]);
		}
		
		//mimic keyboard text entry for postcode field	on UK domain
		if(document.querySelectorAll('[ng-model="term"]').length > 0){
			mimickKeyboardEnter('', 'querySelectorAll', '[ng-model="term"]', 0);
       		mimickKeyboardEnter('KT2 6NH', 'querySelectorAll', '[ng-model="term"]', 0);
			
			setTimeout(function(){        
				if(document.getElementsByClassName('cmb-text ng-binding').length > 0){
					document.getElementsByClassName('cmb-text ng-binding')[0].click();
					
					setTimeout(function(){ 
						for(var i = document.getElementsByClassName('cmb-text ng-binding').length-1; i >= 0 ; i--){
							if(document.getElementsByClassName('cmb-text ng-binding')[i].innerHTML.indexOf("Travel Republic") > -1){
								document.getElementsByClassName('cmb-text ng-binding')[i].click();
								break;
							}
						}
					},3000);				
				}
			},3000);
       	}
       	
       	
       	//payment section
       	var selections = document.getElementsByName('paymentType')[0];
       	
       	if(dnataPage){
		   	selections.value = getOptionValue(selections, "Mastercard");
		}
		else{
		   	selections.value = getOptionValue(selections, "Visa");
		}
		//trigger change event on select option
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent('change', true, true);
		selections.dispatchEvent(evt);
			
		//enter card details
		if(document.getElementsByName('cardNumber').length > 0){
			if(dnataPage){
				//mimickKeyboardEnter('','Name', 'cardNumber', 0);
				//mimickKeyboardEnter('','Name', 'securityCode', 0);
			    document.getElementsByName('expiryMonth')[0].value = getOptionValue(document.getElementsByName('expiryMonth')[0], '05');
			    document.getElementsByName('expiryMonth')[0].dispatchEvent(evt);
			    document.getElementsByName('expiryYear')[0].value = getOptionValue(document.getElementsByName('expiryYear')[0], '2017');
			    document.getElementsByName('expiryYear')[0].dispatchEvent(evt);
			    mimickKeyboardEnter('5123456789012346','Name', 'cardNumber', 0);
			    mimickKeyboardEnter('123','Name', 'securityCode', 0);			    					
			}
			else{
				//mimickKeyboardEnter('','Name', 'cardNumber', 0);
				//mimickKeyboardEnter('','Name', 'securityCode', 0);
				document.getElementsByName('expiryMonth')[0].value = '1';
				document.getElementsByName('expiryMonth')[0].dispatchEvent(evt);
			    document.getElementsByName('expiryYear')[0].value = '10';
			    document.getElementsByName('expiryYear')[0].dispatchEvent(evt);
			    mimickKeyboardEnter('4444333322221111','Name', 'cardNumber', 0);
				mimickKeyboardEnter('111','Name', 'securityCode', 0);
			}
		}
		//check agree to TR terms & conditions
		if(document.querySelector('[model="cm.booking.UserData.Contact.AgreeToConditions"]') != null){
			document.querySelector('[model="cm.booking.UserData.Contact.AgreeToConditions"]').click();
		}
		
		//check promotion mail opt out
		if(document.querySelector('[model="booking.UserData.Contact.EmailOptOut"]') != null){
			document.querySelector('[model="booking.UserData.Contact.EmailOptOut"]').click();
		}
	}
}

function selectAddressUK(){
	//for website
	if(document.getElementById('pcaAddressFinder') != null){
		document.getElementById('pcaAddressFinder').value = 'Travel Republic Ltd, Clarendon House, 147 London Road|Kingston upon Thames||KT2  6NH';
		document.getElementsByClassName('trp-btn matchAddress')[0].click();
	}
	else{
		console.log("address values not loaded yet");
	}
}

function mimickKeyboardEnter(textValue, elementAttribute, elementAttributeValue, elementIndex){
	var textarea = '';
	
	var textEvent = document.createEvent('TextEvent');
   	textEvent.initTextEvent ('textInput', true, true, null, textValue, 9, "en-US");
     
    switch(elementAttribute.toUpperCase()){
    	case 'ID':
    		textarea = document.getElementById(elementAttributeValue);
    		break;
    	case 'NAME':
    		textarea = document.getElementsByName(elementAttributeValue)[elementIndex];
    		break;
    	case 'CLASS':
    		textarea = document.getElementsByClassName(elementAttributeValue)[elementIndex];
    		break;
		case 'QUERYSELECTORALL':
			textarea = document.querySelectorAll(elementAttributeValue)[elementIndex];
    		break;
    	default:
    		alert("invalid element attribute passed");
    }           
    	
    textarea.dispatchEvent(textEvent);
}

function simulatedClick(target, options) {

	var event = target.ownerDocument.createEvent('MouseEvents'),
    options = options || {};

    //Set your default options to the right of ||
    var opts = {
    	type: options.type                  || 'click',
        canBubble:options.canBubble             || true,
        cancelable:options.cancelable           || true,
        view:options.view                       || target.ownerDocument.defaultView, 
        detail:options.detail                   || 1,
        screenX:options.screenX                 || 0, //The coordinates within the entire page
        screenY:options.screenY                 || 0,
        clientX:options.clientX                 || 0, //The coordinates within the viewport
        clientY:options.clientY                 || 0,
        ctrlKey:options.ctrlKey                 || false,
        altKey:options.altKey                   || false,
        shiftKey:options.shiftKey               || false,
        metaKey:options.metaKey                 || false, //I *think* 'meta' is 'Cmd/Apple' on Mac, and 'Windows key' on Win. Not sure, though!
        button:options.button                   || 0, //0 = left, 1 = middle, 2 = right
        relatedTarget:options.relatedTarget     || null,
  	};

    //Pass in the options
    event.initMouseEvent(
 		opts.type,
        opts.canBubble,
        opts.cancelable,
        opts.view, 
        opts.detail,
        opts.screenX,
        opts.screenY,
        opts.clientX,
        opts.clientY,
        opts.ctrlKey,
        opts.altKey,
        opts.shiftKey,
        opts.metaKey,
        opts.button,
        opts.relatedTarget
  	);

    //Fire the event
    target.dispatchEvent(event);
}

//function to send data to background.js to open FSC manager in new tab and highlight the booking page
function launchBookingManager(){
	var Url;
	if(document.getElementById("_ctl0_cphMain_conBookingInfo_lblBookingStatus").innerText === "Failed Security Check"){
		Url = document.URL.slice(0,document.URL.indexOf('/Booking')) +"/Reporting/rpOrderRequiredSecurity.aspx";
	}
	else if(document.getElementById('_ctl0_cphMain_conBookingNotes_rptBookingNotes__ctl0_tdSubject').innerText.indexOf('Booking Failed') > -1){
		Url = document.URL.slice(0,document.URL.indexOf('/Booking')) +"/Reporting/rpOrderRequiredAuto.aspx";
	}
	
	var bookingId = document.URL.split('=')[1];
	chrome.runtime.sendMessage({task:"launchBookingManager", URL:Url, bookingId:bookingId});
}

// return option value for the specified text displayed
function getOptionValue(domElement, textDisplayed) {
    for (var i = 0; i < domElement.options.length; i++) {
        if (domElement.options[i].text.indexOf(textDisplayed) > -1) {
            return domElement.options[i].value;
        }
    }
}
function setCookie(name, value, days) {
	var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString ();
    document.cookie = name + "=" + value +
    expires + "; path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
} 