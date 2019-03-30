const API_KEY = 'AIzaSyDvyBWKAH2nmRGRemjhjvJwcuJJZphf_Ik';

function getFaceData(uri) {
    const image = {
        'source': {
            'imageUri': uri
        }
    }
    const req = {
        'requests': [
            {
                'image': image,
                'features': [{ 'type': 'FACE_DETECTION' }]
            }
        ]
    };
    const res = $.ajax(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
        data: JSON.stringify(req),
        contentType: 'application/json',
        type: 'POST',
        async: false,
    });
    return res;
}

// https://stackoverflow.com/a/14781678/9246435
function absolutePath(uri) {
    var link = document.createElement("a");
    link.href = uri;
    return link.href;
}

function addPupil(imageObj, landmark) {
    const rect = imageObj.getBoundingClientRect();
    const absX = imageObj.
}

function processImage(imageObj) {
    imageObj.css('border', '2px solid red'); 
    const uri = absolutePath(imageObj.attr('src'));
    const res = getFaceData(uri);
    for (const face of res['responses']) {
        if (face['detectionConfidence'] < 0.8) continue;
        for (const landmark of face['landmarks']) {
            if (landmark['type'].contains('PUPIL')) {
                addPupil(imageObj, landmark);
            }
        }
    }
}

$(document).ready(function () {
    $('img').each(function () {
        processImage($(this));
    });

    $('a').each(function () {
        const image = $(this).css('background-image');
        if (image != 'none') {
            console.log(image);
            $(this).css('border', '2px solid red');
        }
    });

});
