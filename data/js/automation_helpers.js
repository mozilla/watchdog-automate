AutomationHelpers = function() {
	var callbackDict = {};
	
	self.port.on("fetch_setting_callback", function(msg) {
		getAndRmCallback(msg.callback_id)(msg.value);
	});
	
	function saveCallback(callback) {
		// Gen random UUID to associate with this callback
		const randUUID = uuid.v4();
		callbackDict[randUUID] = callback;
		return randUUID;
	}
	
	function getAndRmCallback(callbackID) {
		var callback = callbackDict[callbackID];
		delete callbackDict[callbackID];
		return callback;
	}
	
	// TODO
	function callAndRmCallback(callbackID) {
		var callbackFunc = getAndRmCallback(callbackID);
		// callbackFunc.apply({},)
	}
	
    return {
            openNewTab: function(url) {
            },
			// Call a function at an interval until it returns something truthy or after maxTries attempts.
			pollUntilTrue: function(pollFunc,successCallback,pollInterval,maxTries,failureCallback) {
				// Poll by .5 sec by default
				if (!pollInterval)
					pollInterval = 500;
				if (!maxTries)
					maxTries = 50;
				var tries = 0;
				var pollID = setInterval(function() {
					if (pollFunc()) {
						clearInterval(pollID);
						if (successCallback)
							successCallback();
						return;
					}
					maxTries++;
					if (tries >= maxTries) {
						clearInterval(pollID);
						if (failureCallback)
							failureCallback();
					}
				}, pollInterval);
			},
			forSetting: function(setting,callback) {

				// TODO: self.port.emit?
				self.postMessage({
					type: 'fetch_setting',
					setting_name: setting,
					callback_id: saveCallback(callback)
				});
			},
			finishAutomation: function(workerID) {
				self.postMessage({
					type: 'finish_automation',
					worker_id: workerID
				});
			},
			registerError: function(error) {
				self.postMessage({
					type: 'raise_error',
					error: error
				});
			},
            registerWorker: function(id, func) {
                self.postMessage({
                    type: 'register_worker',
                    id: id,
                    func: 'var __automate = ' + func.toString() + '; __automate();'
                });
            },
            returnValue: function(key,val) {
                self.postMessage({
                    type: 'return_value',
                    key: key,
                    value: val
                });
            },
            runWorker: function(id, url, visual) {
                self.postMessage({
                    type: 'run_worker',
                    id: id,
                    url: url,
                    visual: visual
                });
            },
            waitForReady: function(callback) {
                $(unsafeWindow.document).bind('ready.watchdog', function() {
                        $(unsafeWindow.document).unbind('ready.watchdog');
                        callback();
                    });
            },
            simulateClick: function(elements) {
				if (!elements) return;
                if (!elements.length) elements = [elements];
                for (var elemIdx = 0; elemIdx < elements.length; elemIdx++) {
                    var evt = window.document.createEvent('MouseEvents');
                    evt.initMouseEvent('click', true, true, window.document.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                    elements[elemIdx].dispatchEvent(evt);
                }
            }
        };  
}();