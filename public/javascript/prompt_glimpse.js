// adapted from code by Borui Wang and Graham Roth

(function() {

  var mediaRecorder = null;
  var nseconds = 4;
  var srcid = "na";
  var fb_instance = new Firebase("https://glowing-fire-2304.firebaseio.com/");
  var fb_vids = null;

  $(document).ready(function(){

    $("#recording-container").hide();
    $("#uploading-container").hide();
    $("#confirmation-container").hide();
    $("#connect-media-container").hide();

    // see if there's a srcid in the url
    var url_segments = document.location.href.split("/#");
    if(url_segments[1]) {
      srcid = url_segments[1];
    }
    console.log("srcid " + srcid);

    fb_vids = fb_instance.child('chatrooms').child(srcid).child('glimpses');
    prompt_video_recording();

    // we're only recording video, not audio
    var mediaConstraints = {
        video: true,
        audio: false
    };
    // callback for when we trigger video stream from user.
    var onMediaSuccess = function(stream) {
        // create video element, attach webcam stream to video element
        var video_width= 320;
        var video_height= 240;
        var webcam_stream = document.getElementById('webcam-stream');
        var video = document.createElement('video');
        webcam_stream.innerHTML = "";
        // adds these properties to the video
        video = mergeProps(video, {
            controls: false,
            width: video_width,
            height: video_height,
            src: URL.createObjectURL(stream)
        });
        video.play();
        webcam_stream.appendChild(video);

        // now record stream
        var video_container = document.getElementById('video-container');
        console.log("now initializing media recorder");
        mediaRecorder = new MediaStreamRecorder(stream);
        var index = 1;
        mediaRecorder.mimeType = 'video/webm';
        // mediaRecorder.mimeType = 'image/gif';
        // make recorded media smaller to save some traffic (80 * 60 pixels, 3*24 frames)
        mediaRecorder.video_width = video_width/2;
        mediaRecorder.video_height = video_height/2;
        // trigger upload
        mediaRecorder.ondataavailable = function (blob) {
            $("#recording-container").hide();
            $("#uploading-container").show();
            video_container.innerHTML = "";
            // convert data into base 64 blocks
            blob_to_base64(blob,function(b64_data){
              console.log("pushing to firebase");
              fb_vids.push({v: b64_data, s: srcid});
              display_confirmation(blob);
            });
        };
    }
    // callback if there is an error when we try and get the video stream
    var onMediaError = function(e) {
    console.error('media error', e);
    }
    // get video stream from user. see https://github.com/streamproc/MediaStreamRecorder
    navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

  });

    var display_confirmation = function(blob) {
        $("#uploading-container").hide();
        $("#confirmation-container").show();
        var video = document.createElement("video");
        video.autoplay = true;
        video.controls = false; // optional
        video.loop = true;
        video.width = 240;
        var source = document.createElement("source");
        source.src =  URL.createObjectURL(blob);
        source.type =  "video/webm";
        video.appendChild(source);
        $(video).addClass("img-rounded"); 
        $("#uploaded-video-container").append(video);
    }

  var prompt_video_recording = function() {
    $("#recording-prompt button").click(trigger_recording);
    $("#recording-prompt h1").click(trigger_recording);
  }

  var trigger_recording = function() {
    $("#recording-container").show();
    $("#prompt-container").hide();
    if (mediaRecorder) {
        mediaRecorder.start(nseconds*1000);
    } else {
        // tell user to activate camera
        $("#connect-media-container").show();
        $("#recording-container").hide();
        
        // wait for recorder to become activated
        var wait_for_media = setInterval(function() {
            console.log("waiting for activation");
            if (mediaRecorder) {
                window.clearInterval(wait_for_media);
                $("#connect-media-container").hide();
                $("#recording-container").show();
                mediaRecorder.start(nseconds*1000);
            }
        }, 100);
    }

  };

  // some handy methods for converting blob to base 64 and vice versa
  // for performance bench mark, please refer to http://jsperf.com/blob-base64-conversion/5
  // note useing String.fromCharCode.apply can cause callstack error
  var blob_to_base64 = function(blob, callback) {
    var reader = new FileReader();
    reader.onload = function() {
      var dataUrl = reader.result;
      var base64 = dataUrl.split(',')[1];
      callback(base64);
    };
    reader.readAsDataURL(blob);
  };

  var base64_to_blob = function(base64) {
    var binary = atob(base64);
    var len = binary.length;
    var buffer = new ArrayBuffer(len);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < len; i++) {
      view[i] = binary.charCodeAt(i);
    }
    var blob = new Blob([view]);
    return blob;
  };

})();

