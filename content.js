const API_KEY = 'AIzaSyDvyBWKAH2nmRGRemjhjvJwcuJJZphf_Ik';

async function getFaceData(uri) {
    if (uri.includes('undefined')) return {};

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
    const eyeY = imageTop + eyePosition['y'] * image.height / image.naturalHeight - eyeWidth / 2;
    const eye = document.createElement('span');
    $(eye).css('position', 'absolute');
    $(eye).css('top', eyeY);
    $(eye).css('left', eyeX);
    $(eye).css('width', eyeWidth);
    $(eye).css('height', eyeWidth);
    $(eye).css('background-color', 'white');
    $(eye).css('border-radius', '50%')
    $(eye).css('z-index', 99);
    document.body.appendChild(eye);

    // draw pupil
    const pupilX = imageLeft + eyePosition['x'] * image.width / image.naturalWidth - pupilWidth / 2;
    const pupilY = imageTop + eyePosition['y'] * image.height / image.naturalHeight - pupilWidth / 2;
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
    $(pupil).attr('data-eye-width', eyeWidth);
    $(pupil).attr('data-eye-x', pupilX);
    $(pupil).attr('data-eye-y', pupilY);
    document.body.appendChild(pupil);
}

async function processImage(imageObj) {
    const image = imageObj.get(0);
    imageObj.css('border', '2px solid red');
    const uri = absolutePath(imageObj.attr('src'));
    const res = await getFaceData(uri); if (!('responses' in res)) return;
    for (const face of res['responses']) {
        if (!('faceAnnotations' in face)) continue;
        for (const annotation of face['faceAnnotations']) {
            if (annotation['detectionConfidence'] < 0.8) continue;
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
                    addEye(imageObj, typeToPosition[side + '_EYE'], width);
                }
            }
            // flip mouth
            const lowerLip = typeToPosition['LOWER_LIP'];
            const upperLip = typeToPosition['UPPER_LIP'];
            const mouthCenter = typeToPosition['MOUTH_CENTER'];
            const mouthLeft = typeToPosition['MOUTH_LEFT'];
            const mouthRight = typeToPosition['MOUTH_RIGHT'];

            console.log(typeToPosition);

            if (lowerLip && upperLip && mouthCenter && mouthLeft && mouthRight) {
                const canvas = document.createElement('canvas');
                const rect = image.getBoundingClientRect();
                const imageLeft = absX(rect.left);
                const imageTop = absY(rect.top);

                canvas.width = image.width;
                canvas.height = image.height;
                canvas.style.zIndex = 98;
                canvas.style.position = 'absolute';
                canvas.style.top = imageTop + 'px';
                canvas.style.left = imageLeft + 'px';
                canvas.style.pointerEvents = 'none';
                document.body.appendChild(canvas);

                const ctx = canvas.getContext('2d');
                ctx.rotate(Math.PI);
                ctx.drawImage(image, mouthLeft['x'], upperLip['y'],
                    mouthRight['x'] - mouthLeft['x'], lowerLip['y'] - upperLip['y'],
                    -scale(image, mouthRight['x']), -scale(image, lowerLip['y']),
                    scale(image, mouthRight['x'] - mouthLeft['x']), scale(image, lowerLip['y'] - upperLip['y'])); 
            }

            // play audio on click
            imageObj.click(function () {
                $('#scream-audio')[0].play();
            });
        }
    }
}

$(window).on('load', function () {
    let audioElement = document.createElement('audio');
    audioElement.setAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Wilhelm_Scream.ogg');
    audioElement.setAttribute('id', 'scream-audio');
    document.body.appendChild(audioElement);

    $('img').each(async function () {
        await processImage($(this));
    });

    $('a').each(function () {
        const image = $(this).css('background-image');
        if (image != 'none') {
            console.log(image);
            $(this).css('border', '2px solid red');
        }
    });

    $(document).mousemove(function(event) {
        $('.pupil').each(function() {
            const eyeWidth = $(this).attr('data-eye-width');
            const eyeX = Number($(this).attr('data-eye-x'));
            const eyeY = Number($(this).attr('data-eye-y'));
            const mouseX = absX(event.pageX);
            const mouseY = absY(event.pageY); 
            const dx = mouseX - eyeX;
            const dy = mouseY - eyeY;
            const hypotenuse = Math.pow(Math.pow(dx, 2) + Math.pow(dy, 2), 0.5);
            const shift = Math.min(eyeWidth / 4, hypotenuse);
            $(this).css('top', eyeY + dy / hypotenuse * shift);
            $(this).css('left', eyeX + dx / hypotenuse * shift); 
        });
    });
});
