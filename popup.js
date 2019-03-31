const features = ['eye', 'mouth', 'tongue', 'stache', 'scream'];

$(document).ready(function() {
    chrome.storage.local.get(features, function(result) {
        console.log(result);
        for (const feature of features) {
            $(`#${feature}`).prop('checked', result[feature]);
        }
    });

    $('#featureSelectionForm').submit(function(event) {
        event.preventDefault();
        const featureSelection = {};
        for (const feature of features) {
            featureSelection[feature] = $(`#${feature}`).is(':checked');
        }
        chrome.storage.local.set(featureSelection, function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {type: 'redraw'}, function(res) {
                    window.close();
                });
            });
        });
    });
});