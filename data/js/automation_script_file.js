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

		AutomationHelpers.runWorker('getPrivacySettings', "http://www.facebook.com/settings/?tab=privacy", true);
        AutomationHelpers.runWorker('getUserInfo', facebookInfoURL, true);
    });
});

AutomationHelpers.registerWorker('getPrivacySettings', function() {
	// http://www.facebook.com/settings/?tab=privacy
	$(document).ready(function() {
		// Default share privacy?
		AutomationHelpers.returnValue("Default Privacy",$('.selectedButton').text());
		
		// Pane links 1 and 2 go to relevant panes. The 3rd is the mass "limit audience for past posts" functionality.
		var editSettingsPanes = $('.fbPrivacyIndexPageItem a[rel="dialog"]');
		
		AutomationHelpers.simulateClick(editSettingsPanes[0]);
		
		// Wait for dialog
		firstSettingTimer = setInterval(function() {
			// TODO: timeout when this doesn't work after enough times
			if ($('.pop_dialog .uiButtonText:visible').length == 5) {
				console.log('.pop_dialog:visible');
				clearInterval(firstSettingTimer);
				
				var settingsOnDialog1 = $('.pop_dialog .uiButtonText:visible').get();
				console.log(settingsOnDialog1);
				console.log(JSON.stringify(settingsOnDialog1));
				const settingsTable = [
					"Who can find you",
					"Who can send friend requests",
					"Who can send inbox messages",
					"Who can post on your timeline",
					"Who can see posts by others"
				];
				for (var setting in settingsTable) {
					AutomationHelpers.returnValue(settingsTable[setting],settingsOnDialog1[setting].textContent);
				}
				
				openSecondSettingsPane();
			}
		}, 500);
		
		function openSecondSettingsPane() {
			AutomationHelpers.simulateClick(editSettingsPanes[1]);
			
			// Wait for dialog to change
			var secondSettingTimer = setInterval(function() {
				if ($('.pop_dialog .prs').length == 5) {
					clearInterval(secondSettingTimer);
					AutomationHelpers.returnValue("Timeline Review", $('#profile_review_setting').text());
					AutomationHelpers.returnValue("Tag Review", $('#tag_review_setting').text());
					AutomationHelpers.returnValue("Maximum timeline visibility", $('.pop_dialog .uiButtonText:visible').text());
					AutomationHelpers.returnValue("Tag Suggestions", $('#tag_suggestion_setting').text());
					AutomationHelpers.returnValue("Friends can check you in", $('#checkin_tags_setting').text());
				}
			});
		}
		
	});
});

AutomationHelpers.registerWorker('setPrivacySettings', function() {
	AutomationHelpers.forSetting("Who can find you", function (val) {
		// Pane links 1 and 2 go to relevant panes. The 3rd is the mass "limit audience for past posts" functionality.
		var editSettingsPanes = $('.fbPrivacyIndexPageItem a[rel="dialog"]');
		
		AutomationHelpers.simulateClick(editSettingsPanes[0]);
		
		AutomationHelpers.pollUntilTrue(function() {
			return $('.pop_dialog .uiSelectorButton:visible').length > 0;
		}, function() {
			AutomationHelpers.simulateClick($('.pop_dialog .uiSelectorButton').get()[0]);
		
			AutomationHelpers.pollUntilTrue(function() {
				return $('.pop_dialog .fbPrivacyAudienceSelectorOption:visible').length > 0;
			}, function() {
				var elemToClick = $('.pop_dialog .fbPrivacyAudienceSelectorOption[data-label="' + val + '"]:visible').get();
				AutomationHelpers.simulateClick(elemToClick);
			});	
		});
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

AutomationHelpers.runWorker('setPrivacySettings', "http://www.facebook.com/settings/?tab=privacy", true);

// AutomationHelpers.runWorker('grabUserPage', "http://www.facebook.com", true);