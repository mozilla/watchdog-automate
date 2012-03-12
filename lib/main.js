const dataDir = require("self").data;
const notifications = require("notifications");
const panel = require("panel");
const widgets = require("widget");

const automation = require("automation");

var automatePanel = panel.Panel({
  contentURL: dataDir.url("panel.html"),
  contentScriptFile: [dataDir.url("js/panel.js")],
  onMessage: function(msg) {
	  if (msg.type == 'start_automate') {
		notifications.notify({
			title: "Watchdog Automator",
			text: "Starting Facebook settings collection"
		});
		automation.runAutomation();
	  }
  }
});

var widget = widgets.Widget({  id: "privacy-watchdog-automate-link",  
						label: "Watchdog Facebook Automator",
						contentURL: dataDir.url("gear.png"),
						panel: automatePanel
					});

exports['raiseError'] = function(errorStr) {
	  notifications.notify({
	    title: "Watchdog Automator",
		iconURL: dataDir.url('error.png'),
	    text: errorStr
	});
};

exports['finishAutomation'] = function(results) {
	automatePanel.port.emit('populateSettings',results);
	notifications.notify({
		title: "Watchdog Automator",
		text: "Facebook settings collected! Click to view.",
		onClick: function() {
			automatePanel.show();
		}
	});
};