const features = ['mouth', 'tongue', 'stache', 'scream'];

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
        chrome.storage.local.set(featureSelection);
    });
});