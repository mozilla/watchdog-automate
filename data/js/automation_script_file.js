AutomationHelpers.registerWorker('grabUserPage', function () {
    $(document).ready(function() {    
        if ($('.UIPage_LoggedOut').length > 0) {
            self.postMessage({
                error: 'Not logged in!'
            });
            return;
        }
        
        // TODO: make this work for users that don't have a facebook username.
        // Need to redirect to http://www.facebook.com/profile.php?id=<id>&sk=info

        var facebookInfoURL = $('li.tinyman > a').attr('href').split('?')[0] + '/info';

        AutomationHelpers.runWorker('getUserInfo', facebookInfoURL, true);
    });
});

AutomationHelpers.registerWorker('getUserInfo', function() {
    $(document).ready(function() {    
        
        
        // Click every privacy edit button
        AutomationHelpers.simulateClick($('.profileEditButton').get());
        
		function mapToDataLabel(idx,elem) {
			return $(elem).attr('data-label');
		}
		
        function collectData() {
            var contactElems = $('#edit_contact_info').find('.checked');
			contacts = contactElems.map(mapToDataLabel);
			for (var contactX = 0; contactX < contacts.length; contactX++) {
				var contactName = $(contactElems[contactX]).parents('tr').find('td.data').text();
				
				// Limit to e-mail addresses
				if (contactName.indexOf('@') != -1)
    				AutomationHelpers.returnValue('Contact: ' + contactName,contacts[contactX]);	
			}
            
			var eduWork = $('#pagelet_edit_eduwork').find('.checked');
			eduWork = eduWork.map(mapToDataLabel);
			AutomationHelpers.returnValue('Work',eduWork[0]);
			AutomationHelpers.returnValue('Higher Education',eduWork[1]);
			AutomationHelpers.returnValue('Secondary Education',eduWork[2]);
			
			var hometownLocation = $('#edit_hometown').find('.checked');
			hometownLocation = hometownLocation.map(mapToDataLabel);
			AutomationHelpers.returnValue('Hometown',hometownLocation[0]);
			AutomationHelpers.returnValue('Current Location',hometownLocation[1]);
			
			var relationshipStatus = $('#edit_relationship_info').find('.checked')[0];
			AutomationHelpers.returnValue('Relationship status',$(relationshipStatus).attr('data-label'));
			

			
			var quotesSelector = $('[data-contextselector="#pagelet_quotes .uiHeader"]').find('.checked').get()[0];
			AutomationHelpers.returnValue('Favorite quotes',$(quotesSelector).attr('data-label'));				
        }
        
        // Wait for half a second after the last object loads.
        
        var waitForLoad = null;
        
        $('#timeline_tab_content').bind('DOMSubtreeModified.watchdog', function() {
            console.log('DOM update, newtimeout');
            unsafeWindow.clearTimeout(waitForLoad);
            waitForLoad = unsafeWindow.setTimeout(collectData,3000);
            
            $('#timeline_tab_content').unbind('DOMSubtreeModified.watchdog');
        });
    });
});

AutomationHelpers.runWorker('grabUserPage', "http://www.facebook.com", true);