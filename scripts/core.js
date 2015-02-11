var params = new Object(); //For creating a URL for testing the selected params
var getOs = -1, listOs;

var validateURL = new RegExp(/^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/);

var formUrl = function() {
	var urlStr = 'http://browserstack.com/start#os=' + params.os + '&os_version=' + params.os_version + '&browser=' + params.browser + '&browser_version=' + params.browser_version + '&full_screen=true&url=' + params.url + '&start=true';

	if($('#oses option:selected').index() > 0 && $('#browsers option:selected').index() > 0 && $('#browsers_ver option:selected').index() > 0) {
		if($('#testUrl').val() != '' && !validateURL.test($('#testUrl').val())) {
			$('.test-btn').attr('disabled', true);	
		} else {
			$('.test-btn').removeAttr('disabled');
		}
	} else {
		$('.test-btn').attr('disabled', true);
	}
	$('.url-i').text(urlStr);
	return urlStr;
}

var rewriteURL = function () {
	//Setting default URL for the object
	chrome.tabs.query({active:true, currentWindow:true},function(tabs){
		params.url = tabs[0].url;
		formUrl();
	});
}

rewriteURL(); //Put the default page URL first

$.getJSON('http://www.browserstack.com/list-of-browsers-and-platforms.json?product=live', function(data) {	
	//Appending OS's to the dropdown list 
	for(listOs = 0; listOs < data.desktop.length; listOs++) {
		$('#oses').append('<option data-os="' + data.desktop[listOs].os + '" data-os-ver="' + data.desktop[listOs].os_version +'" value="' + data.desktop[listOs].os_display_name + '">' + data.desktop[listOs].os_display_name + '</option>');
	}
	$('#oses').removeAttr('disabled');

	
	//On change of the OS's append the respective browsers to the browser list
	$('#oses').change(function() {
		$('#browsers, #browsers_ver').find('option').not(':first-child').remove();
		$('#browsers_ver').attr('disabled', true);

		var currentSelOs = $('#oses option:selected');
		console.log(currentSelOs);
		
		getOs = currentSelOs.index() - 1; //Remove 1 if causes problem in mapping

		if(getOs <= -1) {
			$('#browsers, #browsers_ver').attr('disabled', true);
		} else {
			$('#browsers').removeAttr('disabled');

			var getUniqueBrowsers = []; //To push unique browsers to the list

			//Fetching unique browsers and pushing them to an array
			for(var browser = 0; browser < data.desktop[getOs].browsers.length; browser++) {
				if(getUniqueBrowsers.indexOf(data.desktop[getOs].browsers[browser].browser) <= -1) {
					getUniqueBrowsers.push(data.desktop[getOs].browsers[browser].browser);
				}
			}

			//Printing unique browsers to the select list
			for(var iterateUniqueBrowsers = 0; iterateUniqueBrowsers < getUniqueBrowsers.length; iterateUniqueBrowsers++) {
				$('#browsers').append('<option data-browser-name="' + getUniqueBrowsers[iterateUniqueBrowsers] + '" value="' + getUniqueBrowsers[iterateUniqueBrowsers] + '">' + getUniqueBrowsers[iterateUniqueBrowsers] + '</option>');
			}

			//Assigning values to the URL object
			params.os = currentSelOs.attr('data-os');
			params.os_version = currentSelOs.attr('data-os-ver');

			formUrl();

			$('.os-i').text(currentSelOs.attr('data-os'));
			$('.os-ver-i').text(currentSelOs.attr('data-os-ver'));
		}
	});

	

	$('#browsers').change(function() {
		//Caching some vars
		var currentSelBro = $('#browsers option:selected');
		var broVer = $('#browsers_ver');

		//Removes options before appending
		broVer.find('option').not(':first-child').remove();
		
		//Assigns disable if no browsers are selected
		if(currentSelBro.index() != 0) {
			broVer.removeAttr('disabled');
		} else {
			broVer.attr('disabled', true); 
		}
		
		//Append browsers based on browser versions
		for(var browserVersion = 0; browserVersion < data.desktop[getOs].browsers.length; browserVersion++) {
			if(data.desktop[getOs].browsers[browserVersion].browser == currentSelBro.text()) {
				broVer.append('<option data-browser-name="' + data.desktop[getOs].browsers[browserVersion].display_name + '" data-browser-ver="' + data.desktop[getOs].browsers[browserVersion].browser_version + '" value="' + data.desktop[getOs].browsers[browserVersion].display_name + '">' + data.desktop[getOs].browsers[browserVersion].display_name + '</option>');
			}
		}

		//Pushing values to URL obj
		params.browser = currentSelBro.attr('data-browser-name');
		formUrl();

		$('.browser-i').text(currentSelBro.attr('data-browser-name'));
	});
	

	//Push browser version to the object
	$('#browsers_ver').change(function() {
		params.browser_version = $('#browsers_ver option:selected').attr('data-browser-ver');
		formUrl();

		$('.browser-ver-i').text($('#browsers_ver option:selected').attr('data-browser-ver'));
	});


	//Forms the URL if specified by the user
	$('#testUrl').on('input', function() {
		if($(this).val().trim() == '') {
			rewriteURL();
		} else {
			params.url = $(this).val();
		}
		formUrl();
	});

	$('.test-btn').click(function() {
		window.open(formUrl());
	});
});
