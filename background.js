const features = ['eye', 'mouth', 'tongue', 'stache', 'scream'];

chrome.runtime.onInstalled.addListener(function() {
    const featureSelection = {};
    for (const feature of features) {
        featureSelection[feature] = true;
    }
    chrome.storage.local.set(featureSelection);
});