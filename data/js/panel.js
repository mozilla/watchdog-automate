self.port.on('populateSettings', function(results) {
	document.getElementById('automationResults').style['display'] = 'block';
	document.getElementById('automationResults').value = JSON.stringify(results);
});

document.getElementById('startLink').addEventListener('click', function() {
	self.postMessage({
		type: 'start_automate'
	});	
});