// For rendering all the reactions we have


(function() {

  var fb_instance;

  $(document).ready(function(){
    render_reactions();
  });

  function get_confession_text(chatroom) {
      for (var cid in chatroom.confession) {
          return chatroom.confession[cid].text;
      }
      return false;
  }

  function get_reactions(chatroom) {
    var reactions = [];
    for (var cid in chatroom.reactions) {
        reactions[reactions.length] = chatroom.reactions[cid];
    }
    return reactions;
  }

  function render_single_reaction(data) {
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
      $(video).addClass("quilt-elem");

      var text = document.createElement("div");
      $(text).html(data.text);
      $(video).mouseenter(function() { $("#reaction-event-text").html(data.text); }).mouseleave(function() { $("#reaction-event-text").html(""); });
      $("#fq-reaction-container").append(video);
  }


  function render_reactions() {
    fb_instance = new Firebase("https://jpa66nbhph5.firebaseio-demo.com/");
    fb_instance.on('value', function(snapshot) {
        var chatrooms = snapshot.val().chatrooms;
        var all_reactions = [];
        for (var chat_id in chatrooms) {
            console.log("processing chatroom");
            if (chat_id.indexOf("fquilt") != -1 && chatrooms.hasOwnProperty(chat_id)) {
                var text = get_confession_text(chatrooms[chat_id]);
                console.log("processing reactionroom");
                console.log(text);

                var reactions = get_reactions(chatrooms[chat_id]);
                console.log("reactions-- " + reactions.length);
                for (var i=0; i<reactions.length; i++) {
                  reactions[i].text = text;
                  all_reactions[all_reactions.length] = reactions[i];
                }
            }
        }
        for (var i=0; i<all_reactions.length; i++) {
          render_single_reaction(all_reactions[i]);
        }
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
