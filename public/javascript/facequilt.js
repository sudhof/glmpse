// Initial code by Borui Wang, updated by Graham Roth
// For CS247, Spring 2014

(function() {

  var cur_video_blob = null;
  var fb_instance;
  var fb_reactions = null;
  var mediaRecorder = null;

  $(document).ready(function(){
    $("#facequilt-webcam-directions").hide();
    $("#facequilt-webcam-stream").hide();
    $("#add-text-form").hide();
    $(".addtext").click(function() { $(".addtext").hide(); $("#add-text-form").slideDown(); } );
    // reactions are being loaded in connect_to_chat now
    //render_reactions();
    connect_to_chat_firebase();
  });

  function render_reactions() {
    $('.reaction-blob').each(function(index) {
      var base64_data = $(this).html();
      // for video element
      var video = document.createElement("video");
      video.autoplay = true;
      video.controls = false; // optional
      video.loop = true;
      video.width = 120;

      var source = document.createElement("source");
      source.src =  URL.createObjectURL(base64_to_blob(base64_data));
      source.type =  "video/webm";

      video.appendChild(source);

      $(video).addClass("img-rounded");

      $(this).parent().prepend(video);

    });
  }

  function display_new_reaction(data, chat_id) {
      // for video element
      var video = document.createElement("video");
      video.autoplay = true;
      video.controls = false; // optional
      video.loop = true;
      video.width = 120;
      var source = document.createElement("source");
      source.src =  URL.createObjectURL(base64_to_blob(data.v));
      source.type =  "video/webm";
      video.appendChild(source);
      $(video).addClass("img-rounded");
      $("#" + chat_id).prepend(video);
  }

  function connect_to_chat_firebase(){
    /* Include your Firebase link here!*/
    fb_instance = new Firebase("https://jpa66nbhph5.firebaseio-demo.com/");

      // we're only recording video, not audio
      var mediaConstraints = {
        video: true,
        audio: false
      };

      // callback for when we get video stream from user.
      var onMediaSuccess = function(stream) {
        // create video element, attach webcam stream to video element
        var video_width= 160;
        var video_height= 120;
        var webcam_stream = document.getElementById('facequilt-webcam-stream');
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
        var video_container = document.getElementById('facequilt-video-container');
        mediaRecorder = new MediaStreamRecorder(stream);
        var index = 1;

        mediaRecorder.mimeType = 'video/webm';
        // mediaRecorder.mimeType = 'image/gif';
        // make recorded media smaller to save some traffic (80 * 60 pixels, 3*24 frames)
        mediaRecorder.video_width = video_width/2;
        mediaRecorder.video_height = video_height/2;

        mediaRecorder.ondataavailable = function (blob) {
            //console.log("new data available!");
            video_container.innerHTML = "";

            // convert data into base 64 blocks
            blob_to_base64(blob,function(b64_data){
              console.log("sending to reactions");
              fb_reactions.push({v: b64_data});
            });
        };
      }

      // callback if there is an error when we try and get the video stream
      var onMediaError = function(e) {
        console.error('media error', e);
      }

      // get video stream from user. see https://github.com/streamproc/MediaStreamRecorder
      navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

    $('.addreaction').each(function() {
      // listen for new events
      var chat_id = $(this).attr('chatid');
      // get access to this chatroom
      var fb_chat_room = fb_instance.child('chatrooms').child(chat_id);
      var reactions = fb_chat_room.child('reactions');
      // listen for events
      reactions.on("child_added", function(snapshot) {
        display_new_reaction(snapshot.val(), chat_id);
      });
    });

    $('.addreaction').click(function() {
      var chat_id = $(this).attr('chatid');

      // get access to this chatroom
      var fb_chat_room = fb_instance.child('chatrooms').child(chat_id);
      fb_reactions = fb_chat_room.child('reactions');
      
      // listen for events
      //fb_reactions.on("child_added", function(snapshot) {
      //  display_new_reaction(snapshot.val(), chat_id);
      //});
      
      $("#facequilt-webcam-directions").show();
      $("#facequilt-webcam-stream").show();

      // counter
      var time = 3;
      var second_counter = document.getElementById('facequilt-second-counter');
      var second_counter_update = setInterval(function () {
          second_counter.innerHTML = --time;
          if (time == 0) {
            window.clearInterval(second_counter_update);
            console.log("recording");
            mediaRecorder.start(1500);
            second_counter.innerHTML = "Recording!"
            // hide the video stream in 1500 milliseconds
            setTimeout(function() {
              $("#facequilt-webcam-directions").hide();
              $("#facequilt-webcam-stream").hide();
            },1500);

          }
      }, 1000);

    });
  }

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
