const dataDir = require("self").data;
const observers = require("observer-service");
const panel = require("panel");
const pageWorker = require("page-worker");
const tabs = require('tabs');
const url = require("url");

const main = require("main");

var automationScript = require('automation_script')['automationScript'];
var automatorPane = require('automator_pane_manager').automatorPane;

const testSettings = {
	"Who can find you": "Everyone"
};

var workersRunning = [];

var returnedValues = {};

exports['runAutomation'] = function() {    
    var automationWorkers = {};
	returnedValues = {};

    function workerMessageHandler(msg) {
        if (msg.type) {
            switch(msg.type) {
                case "raise_error":
					main.raiseError(msg.error);
					break;
                case "register_worker":
                    automationWorkers[msg.id] = msg.func.toString();
                    break;
                case "run_worker":
                    spawnWorkerForPage(msg.url, msg.id, msg.visual);
					workersRunning.push(msg.id);
                    break;
                case "return_value":
					returnedValues[msg.key] = msg.value;
                    break;
				case "fetch_setting":
					this.port.emit("fetch_setting_callback",{
						callback_id: msg.callback_id,
						value: testSettings[msg.setting_name]
					});
					break;
				case "finish_automation":
					var workerIdx = workersRunning.indexOf(msg.worker_id);
					if (workerIdx != -1)
						workersRunning.splice(workerIdx,1);
					if (workersRunning.length == 0)
						main.finishAutomation(returnedValues);
					break;
            }
        }
        
        if (msg.error) {
            automatorPane.showError(msg.error);
            return;
        }
        // if (msg.url)
        //     console.log('URL: ' + msg.url);
    }

    function spawnWorkerForPage(url, workerScript, visual) {
        var pageWorkerParams = {
        // panel.Panel({ ///*
            width: 500,
            height: 500, //*/ 
            contentURL: url,
            contentScriptFile: [dataDir.url('js/lib/jquery-1.6.2.min.js'),
								dataDir.url('js/lib/uuid.js'),
								dataDir.url('js/automation_helpers.js')],
            contentScriptWhen: 'ready',
            onMessage: workerMessageHandler
        };
        
        if (workerScript)
            pageWorkerParams.contentScript = automationWorkers[workerScript];
        else
            pageWorkerParams.contentScriptFile.push(dataDir.url('js/automation_script_file.js'));
        
        
        if (visual) {
            tabs.open({
                url: url,
                onReady: function(tab) {
                    tab.attach(pageWorkerParams);
                }
            });
        }
        else {
            pageWorker.Page(pageWorkerParams);      
        }
    }
    
    // Start at "dummy" page, Google in this case.
    spawnWorkerForPage("http://google.com");
}