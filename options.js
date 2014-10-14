
window.addEventListener('load', function(evt) {
	document.getElementById('email').value = localStorage.getItem('Email');
	document.getElementById('emailDomain').value = localStorage.getItem('EmailDomain');
	chrome.runtime.getBackgroundPage(function (backgroundPage) {
	    document.getElementById('autofiller').checked = backgroundPage.autofiller;	    
	});
	
	//Update email id
   	document.getElementById('email').addEventListener('change', updateEmailId);
   	document.getElementById('emailDomain').addEventListener('change', updateEmailId);
   	
   	//autofiller checkbox update
   	document.getElementById('autofiller').addEventListener('change', updateAutofiller);
   	
});

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

/*
// Saves options to chrome.storage
function save_options() {
  var color = document.getElementById('color').value;
  var likesColor = document.getElementById('like').checked;
  chrome.storage.sync.set({
    favoriteColor: color,
    likesColor: likesColor
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    favoriteColor: 'red',
    likesColor: true
  }, function(items) {
    document.getElementById('color').value = items.favoriteColor;
    document.getElementById('like').checked = items.likesColor;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
    
*/