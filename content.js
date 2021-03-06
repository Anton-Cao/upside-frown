const API_KEY = 'AIzaSyDvyBWKAH2nmRGRemjhjvJwcuJJZphf_Ik';

async function getFaceData(uri) {
    if (uri.includes('undefined')) return {};

    const cachedRes = localStorage.getItem(uri);
    if (cachedRes) {
        return JSON.parse(cachedRes);
    }

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
    const res = await $.ajax(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
        data: JSON.stringify(req),
        contentType: 'application/json',
        type: 'POST',
    });

    localStorage.setItem(uri, JSON.stringify(res));

    return res;
}

// https://stackoverflow.com/a/14781678/9246435
function absolutePath(uri) {
    var link = document.createElement("a");
    link.href = uri;
    return link.href;
}

// https://plainjs.com/javascript/styles/get-the-position-of-an-element-relative-to-the-document-24/
function absX(relX) {
    return relX + (window.pageXOffset || document.documentElement.scrollLeft);
}

function absY(relY) {
    return relY + (window.pageYOffset || document.documentElement.scrollTop);
}

/**
 * Given a length in terms of the original size of the image, scales it down to the display size
 * @param {img element} image 
 * @param {Number} length 
 */
function scale(image, length) {
    return length * image.width / image.naturalWidth;
}

function addEye(imageObj, eyePosition, eyeWidth) {
    const pupilWidth = Math.ceil(eyeWidth / 3);
    const image = imageObj.get(0);
    const rect = image.getBoundingClientRect();

    const imageLeft = absX(rect.left);
    const imageTop = absY(rect.top);

    // draw eye
    const eyeX = imageLeft + scale(image, eyePosition['x']) - eyeWidth / 2;
    const eyeY = imageTop + scale(image, eyePosition['y']) - eyeWidth / 2;
    const eye = document.createElement('span');
    $(eye).css('position', 'absolute');
    $(eye).css('top', eyeY);
    $(eye).css('left', eyeX);
    $(eye).css('width', eyeWidth);
    $(eye).css('height', eyeWidth);
    $(eye).css('background-color', 'white');
    $(eye).css('border-radius', '50%')
    $(eye).css('z-index', 99);
    $(eye).addClass('upside-frown')
    $(eye).addClass('eye');
    document.body.appendChild(eye);

    // draw pupil
    const pupilX = imageLeft + scale(image, eyePosition['x']) - pupilWidth / 2;
    const pupilY = imageTop + scale(image, eyePosition['y']) - pupilWidth / 2;
    const pupil = document.createElement('span');
    $(pupil).css('position', 'absolute');
    $(pupil).css('top', pupilY);
    $(pupil).css('left', pupilX);
    $(pupil).css('width', pupilWidth);
    $(pupil).css('height', pupilWidth);
    $(pupil).css('background-color', 'black');
    $(pupil).css('border-radius', '50%');
    $(pupil).css('z-index', 100);
    $(pupil).addClass('pupil');
    $(pupil).addClass('upside-frown');
    $(pupil).attr('data-eye-width', eyeWidth);
    $(pupil).attr('data-eye-x', pupilX);
    $(pupil).attr('data-eye-y', pupilY);
    document.body.appendChild(pupil);
}

function addFlippedMouth(imageObj, lowerLip, upperLip, mouthCenter, mouthLeft, mouthRight) {
    const image = imageObj.get(0);
    const rect = image.getBoundingClientRect();
    const imageLeft = absX(rect.left);
    const imageTop = absY(rect.top);

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.style.zIndex = 98;
    canvas.style.position = 'absolute';
    canvas.style.top = imageTop + 'px';
    canvas.style.left = imageLeft + 'px';
    canvas.style.pointerEvents = 'none';
    canvas.className = 'upside-frown';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.rotate(Math.PI);
    ctx.drawImage(image, mouthLeft['x'], upperLip['y'],
        mouthRight['x'] - mouthLeft['x'], lowerLip['y'] - upperLip['y'],
        -scale(image, mouthRight['x']), -scale(image, lowerLip['y']),
        scale(image, mouthRight['x'] - mouthLeft['x']), scale(image, lowerLip['y'] - upperLip['y']));
}

function addTongue(imageObj, position, height, width) {
    const image = imageObj.get(0);
    const rect = image.getBoundingClientRect();

    const imageLeft = absX(rect.left);
    const imageTop = absY(rect.top);

    const x = imageLeft + scale(image, position['x']) - width / 2;
    const y = imageTop + scale(image, position['y']);
    const tongue = document.createElement('span');
    $(tongue).css('position', 'absolute');
    $(tongue).css('top', y);
    $(tongue).css('left', x);
    $(tongue).css('height', height);
    $(tongue).css('width', width);
    $(tongue).css('background-color', '#ff5177');
    $(tongue).css('border-radius', '0% 0% 50% 50%');
    $(tongue).css('border', '1px solid #f72a56');
    $(tongue).css('z-index', 99);
    $(tongue).css('display', 'none');
    $(tongue).addClass('tongue');
    $(tongue).addClass('upside-frown');
    document.body.appendChild(tongue);
}

function addMustache(imageObj, mouth_center, upper_lip, width, height) {
    const image = imageObj.get(0);
    const rect = image.getBoundingClientRect();

    const imageLeft = absX(rect.left);
    const imageTop = absY(rect.top);
    const moustacheX = imageLeft + scale(image, mouth_center['x']) - width / 2;
    const moustacheY = imageTop + scale(image, upper_lip['y']) - height / 2;
    const moustache = document.createElement('span');

    $(moustache).css('position', 'absolute');
    $(moustache).css('background-image', 'url(http://www.pngmart.com/files/7/Fake-Moustache-PNG-Clipart.png)');
    $(moustache).css('background-repeat', 'no-repeat');
    $(moustache).css('background-position', 'center');
    $(moustache).css('background-size', 'cover');
    $(moustache).css('top', moustacheY);
    $(moustache).css('left', moustacheX);
    $(moustache).css('width', width);
    $(moustache).css('height', height);
    $(moustache).css('z-index', 100);
    $(moustache).addClass('moustache');
    $(moustache).addClass('upside-frown');
    $(moustache).attr('data-moustache-width', width);
    $(moustache).attr('data-moustache-height', height);
    $(moustache).attr('data-moustache-x', moustacheX);
    $(moustache).attr('data-moustache-y', moustacheY);
    document.body.appendChild(moustache);
}

async function processImage(imageObj) {
    const image = imageObj.get(0);
    imageObj.css('border', '2px solid orange');
    const uri = absolutePath(imageObj.attr('src'));
    const res = await getFaceData(uri); 
    if (!('responses' in res)) {
        imageObj.css('border-color', 'red');
        return;
    }
    let faceFound = false;
    for (const face of res['responses']) {
        if (!('faceAnnotations' in face)) continue;
        for (const annotation of face['faceAnnotations']) {
            if (annotation['detectionConfidence'] < 0.5) continue;
            faceFound = true;
            const typeToPosition = {}; // dictionary that maps facial feature to position
            for (const landmark of annotation['landmarks']) {
                typeToPosition[landmark['type']] = landmark['position'];
            }
            // draw eyes
            for (const side of ['LEFT', 'RIGHT']) {
                if ((side + '_EYE') in typeToPosition) {
                    let width = 12; // default value
                    if ((side + '_EYE_RIGHT_CORNER') in typeToPosition && (side + '_EYE_LEFT_CORNER') in typeToPosition) {
                        width = typeToPosition[side + '_EYE_RIGHT_CORNER']['x'] - typeToPosition[side + '_EYE_LEFT_CORNER']['x'];
                        width *= image.width / image.naturalWidth;
                        width *= 1.25;
                    }
                    chrome.storage.local.get(['eye'], function (result) {
                        if (result.eye) {
                            addEye(imageObj, typeToPosition[side + '_EYE'], width);
                        }
                    });
                }
            }

            const lowerLip = typeToPosition['LOWER_LIP'];
            const upperLip = typeToPosition['UPPER_LIP'];
            const mouthCenter = typeToPosition['MOUTH_CENTER'];
            const mouthLeft = typeToPosition['MOUTH_LEFT'];
            const mouthRight = typeToPosition['MOUTH_RIGHT'];
            if (lowerLip && upperLip && mouthCenter && mouthLeft && mouthRight) {
                chrome.storage.local.get(['mouth', 'tongue'], function(result) {
                    if (result.mouth) {
                        // draw flipped mouth
                        addFlippedMouth(imageObj, lowerLip, upperLip, mouthCenter, mouthLeft, mouthRight);
                    }
                    if (result.tongue) {
                        // draw tongue
                        const mouthWidth = scale(image, mouthRight['x'] - mouthLeft['x']);
                        addTongue(imageObj, lowerLip, mouthWidth, mouthWidth / 2);
                    }
                });
            }

            // stick out tongue on hover
            imageObj.hover(function () {
                if ($(".tongue:first").is(":hidden")) {
                    $(".tongue").slideDown();
                }
            }, function () {
                $('.tongue').slideUp();
            });

            // play audio on click
            imageObj.click(function () {
                chrome.storage.local.get(['scream'], function (result) {
                    if (result.scream) {
                        $('#scream-audio')[0].play();
                    }
                });
            });

            // mustache
            if ('MOUTH_CENTER' in typeToPosition && 'MOUTH_RIGHT' in typeToPosition) {
                let width = scale(image, mouthRight['x'] - mouthLeft['x']);
                let height = width * .33;
                chrome.storage.local.get(['stache'], function (result) {
                    if (result.stache) {
                        addMustache(imageObj, typeToPosition['MOUTH_CENTER'], typeToPosition['UPPER_LIP'], width, height);
                    }
                });
            }
        }
    }
    imageObj.css('border-color', faceFound ? 'green' : 'red');
}

function drawFaces() {
    $('.upside-frown').remove(); // clear existing faces

    $('img').each(async function () {
        await processImage($(this));
    });
}

$(window).on('load', function () {
    let audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Wilhelm_Scream.ogg');
    audioElement.setAttribute('id', 'scream-audio');
    document.body.appendChild(audioElement);

    drawFaces();

    /*
    $('a').each(function () {
        const image = $(this).css('background-image');
        if (image != 'none') {
            console.log(image);
            $(this).css('border', '2px solid red');
        }
    });
    */

    $(document).mousemove(function (event) {
        $('.pupil').each(function () {
            const eyeWidth = $(this).attr('data-eye-width');
            const eyeX = Number($(this).attr('data-eye-x'));
            const eyeY = Number($(this).attr('data-eye-y'));
            const mouseX = event.pageX;
            const mouseY = event.pageY;
            const dx = mouseX - eyeX;
            const dy = mouseY - eyeY;
            const hypotenuse = Math.pow(Math.pow(dx, 2) + Math.pow(dy, 2), 0.5);
            const shift = Math.min(eyeWidth / 4, hypotenuse);
            $(this).css('top', eyeY + dy / hypotenuse * shift);
            $(this).css('left', eyeX + dx / hypotenuse * shift);
        });
    });
});

$(window).resize(function () {
    drawFaces();
});

chrome.runtime.onMessage.addListener(
    function(message, sender, sendReponse) {
        if (message.type === 'redraw') {
            drawFaces();
        }
        sendResponse('received');
    }
)
