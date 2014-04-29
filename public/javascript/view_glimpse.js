// pull, render glimpse videos

(function() {

  var fb_instance = new Firebase("https://glowing-fire-2304.firebaseio.com/");

  $(document).ready(function(){
    $("#videos-container").hide();

    // see if there's a srcid in the url
    var url_segments = document.location.href.split("/#");
    if(url_segments[1]) {
        var srcid = url_segments[1];
        render_by_srcid(srcid);
    } else {
        var chat = fb_instance.child('chatrooms');
        chat.on('value', function(snapshot) {
            var chatrooms = snapshot.val()
            for (srcid in chatrooms) {
                render_by_srcid(srcid);
            }
        });
    }
  });


  var render_by_srcid = function(srcid) {
    var fb_vids = fb_instance.child('chatrooms').child(srcid);
    fb_vids.on('value', function(snapshot) {
        $("#loading-container").hide();
        $("#videos-container").show();

        var videos = snapshot.val().glimpses;
        for (var vid in videos) {
            render_video(videos[vid]);
        }
    });
  }

  var render_video = function(data) {
      // for video element
      var video_unit = document.createElement("div");
      $(video_unit).addClass("video-unit");
      var video = document.createElement("video");
      video.autoplay = true;
      video.controls = false; // optional
      video.loop = true;
      video.width = 240;
      var source = document.createElement("source");
      source.src =  URL.createObjectURL(base64_to_blob(data.v));
      source.type =  "video/webm";
      video.appendChild(source);
      $(video).addClass("img-rounded");
      var text = document.createElement("p");
      $(text).html(data.s);
      $(video_unit).append(video);
      $(video_unit).append(text);
      $("#videos-container").append(video_unit);
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

