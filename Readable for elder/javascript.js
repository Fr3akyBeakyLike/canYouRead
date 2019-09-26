    // **********************************************
    // *** Update or verify the following values. ***
    // **********************************************

    var subscriptionKey = "YourKeyHere";
    var endpoint = "https://westeurope.api.cognitive.microsoft.com/";
    var uriBase = endpoint + "face/v1.0/detect";
    var webcamStream;

    // Request parameters.
    var params = {
      "returnFaceId": "true",
      "returnFaceLandmarks": "true",
      "returnFaceAttributes": "age,glasses,exposure"
    };

    // ***********************************************************************
    // *** function startWebcam                                           ***
    // *** ask permision from user and start webcam, then                 ***
    // *** enable the button to take a snapshot                           ***
    // ***********************************************************************
    function startWebcam() {
      var vid = document.querySelector('video');
      // request cam
      navigator.mediaDevices.getUserMedia({
          video: true
        })
        .then(stream => {
          // save stream to variable at top level so it can be stopped lateron
          webcamStream = stream;
          // show stream from the webcam on te video element
          vid.srcObject = stream;
          // returns a Promise to indicate if the video is playing
          return vid.play();
        })
        .then(() => {
          // enable the 'take a snap' button
          var btn = document.querySelector('#takeSnap');
          btn.disabled = false;
          // when clicked
          btn.onclick = e => {
            takeSnap()
              .then(blob => {
                analyseImage(blob, params, showResults);
              })
          };
        })
        .catch(e => console.log('error: ' + e));
    }

    // ***********************************************************************
    // *** function takeSnap                                              ***
    // *** show snapshotimage from webcam                                 ***
    // *** convert image to blob                                          ***
    // ***********************************************************************

    function takeSnap() {
      // get video element
      var vid = document.querySelector('video');
      // get canvas element
      var canvas = document.querySelector('canvas');
      // get its context
      var ctx = canvas.getContext('2d');
      // set its size to the one of the video
      canvas.width = vid.videoWidth;
      canvas.height = vid.videoHeight;
      // show snapshot on canvas
      ctx.drawImage(vid, 0, 0);
      // show spinner image below
      document.querySelector('#spinner').classList.remove('hidden');
      return new Promise((res, rej) => {
        // request a Blob from the canvas
        canvas.toBlob(res, 'image/jpeg');
      });
    }

    // ***********************************************************************
    // *** function stopWebcam                                             ***
    // *** stop webcam                                                     ***
    // *** disable snapshot button                                         ***
    // ***********************************************************************

    function stopWebcam() {
      var vid = document.querySelector('video');
      vid.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      // disable snapshot button
      document.querySelector('#takeSnap').disabled = true;
    }


    // ***********************************************************************
    // *** function analyseImage                                           ***
    // *** analyse image using cognitive services of Microsoft             ***
    // *** img - image to analyse                                          ***
    // *** params - object containing params to send                       ***
    // *** processingFunction - name of function to call to process the response ***
    // ***********************************************************************

    function analyseImage(image, params, proccessingFunction) {

      // create API url by adding params
      var paramString = Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&');
      var urlWithParams = uriBase + "?" + paramString;

      // do API call
      fetch(urlWithParams, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": subscriptionKey
          },
          processData: false,
          body: image,
        })
        // then turn response into json
        .then(response => response.json())
        // then go to processingFunction
        .then(json => proccessingFunction(json))
        // show alert window if something goes wrong
        .catch(error => alert(error.message));
    }

    // Function working with the json

    function showResults(json) {

      // hide spinner image onto the canvas
      document.querySelector('#spinner').classList.add('hidden');
      // show results in responseArea
      document.querySelector('#responseArea').textContent = JSON.stringify(json, null, 2);

      var el = document.getElementById("answer");

      // Eyes are fine
      if (json[0].faceLandmarks.eyeLeftBottom.y - json[0].faceLandmarks.eyeLeftTop.y <= 13) {
        document.getElementById("answer").innerHTML = ("The textsize is not correct, try again")
        document.getElementById('one').style.fontSize = "larger"
        console.log("The textsize is not correct, try again")
      }
      // Your eyes are not fine
      else if (json[0].faceLandmarks.eyeLeftBottom.y - json[0].faceLandmarks.eyeLeftTop.y >= 13) {
        document.getElementById("answer").innerHTML = ("Your eyes are fine")
        el.classList.add("answerCorrect");
        console.log("Your eyes are fine")
      }
      // Have you considered wearing glasses? Not working yet
      else if (json[0].faceAttributes.glasses == "NoGlasses" && json[0].faceAttributes.age <= 30 && json[0].faceLandmarks.eyeLeftBottom.y - json[0].faceLandmarks.eyeLeftTop.y <= 13) {
        document.getElementById("answer").innerHTML = ("Have you considered wearing glasses?")
        console.log("Have you considered wearing glasses?")
      }

    }

    // Texts to read while taking a screenshot

    var displayText;
    displayText = Math.floor(Math.random() * 4 + 1);
    console.log(displayText);

    var displayTextArray;

    displayTextArray = [
      "AI will take over the world.",
      "Google is the world\'s biggest databank.",
      "AI is neither good nor evil. It's a tool. It's a technology for us to use.",
      "Even a cat has things it can do that AI cannot."
    ];

    var displayTextHere;
    displayTextHere = displayTextArray[displayText - 1];

    console.log(displayTextHere);

    document.getElementById("one").innerHTML = displayTextHere;