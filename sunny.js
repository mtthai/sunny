var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    playerVars: { 'autoplay': 1,
                  'controls': 0,
                  'disablekb' : 1,
                  'iv_load_policy' : 3,
                  'modestbranding' : 0,
                  'showinfo' : 0,
                  'enablejsapi': 1
    },
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    player.destroy();
    loadAudio();
  }
}

function startVid(){
  var start = convertTime($("#start").val());
  var end = convertTime($("#end").val());
  var URL = parseURL($("#vidURL").val());
  var title = $("#title").val();

  player.loadVideoById({'videoId': URL,
             'startSeconds': start,
             'endSeconds': end});
             
  setUpTitleCard(title);
  setTimeout(function(){
    $("#saveButton").toggle();
  }, (((Number(end)-Number(start))*1000) + 5000));
}

function startVidById(start, end, vid, title){
  var URL = parseURL(vid);
  
  player.loadVideoById({'videoId': URL,
             'startSeconds': start,
             'endSeconds': end});
  
  setUpTitleCard(title);
}

function setUpTitleCard(title){
  $("#inputform, #description, #footer").hide();
  $("#player, #titleCard").show();
  
  $("#titleCard").text('"' + title + '"');
}

function saveVid(){
  var start = convertTime($("#start").val());
  var end = convertTime($("#end").val());
  var URL = parseURL($("#vidURL").val());
  var title = $("#title").val();
  var ID = makeId();
  
  checkForSameId(ID).then(function(data){
    if(!data){
      writeVidData(start, end, URL, title, ID);
      prompt("Share It!", window.location.href + "?" + ID);
    }
    else {
      saveVid();
    }
  });
  
}

function writeVidData(start, end, URL, title, ID){
  firebase.database().ref('vidID/' + ID).set({
    startTime: start,
    endTime: end,
    ytURL: URL,
    titleCard: title
  });
}

function playSharedVid(){
  var vidid = window.location.href.split('?').pop();
  firebase.database().ref('/vidID/' + vidid).once('value', function(snapshot) {
    var start = snapshot.val().startTime;
    var end = snapshot.val().endTime;
    var ytURL = snapshot.val().ytURL;
    var titleCard = snapshot.val().titleCard;

    startVidById(start, end, ytURL, titleCard);
  });
}

function loadAudio(){
  var titleMusic = new Audio('Its Always Sunny in Philadelphia Theme.mp3');
  titleMusic.play();
}

function convertTime(time){
  var num = time.split(':'),
    s = 0, m = 1;
      
  while (num.length > 0) {
    s += m * parseInt(num.pop(), 10);
    m *= 60;
  }
  
  return s;
}

function makeId()
{
  var id = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 6; i++ )
      id += possible.charAt(Math.floor(Math.random() * possible.length));

  return id;
}

function parseURL(URL){
  return URL.split('v=').pop();
}

function checkForSameId(id){
  return new Promise(function (resolve, reject){
    firebase.database().ref('/vidID/').once("value", function(snapshot){
      resolve(snapshot.hasChild(id));
    });
  });
}

