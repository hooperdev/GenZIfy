const chunkMarker = "<chunk/>";
const minecraft = {id: "n_Dv4JMiwK8", length: 3600};
const subwaysurfers = {id:"ChBg4aowzX8", length: 3600};
const gta = {id:"vVJuMq1CMNo", length: 360};
const baking = {id:"WHLgY6qvvW8", length: 600};
var youtubePlayer;


// Load the YouTube IFrame API player code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
function onYouTubeIframeAPIReady() {
    youtubePlayer = new YT.Player('video', {
        width : '560', 
        height : '315',
        events: {
            'onReady': onPlayerReady,
        }
    });
}

function onPlayerReady(event) { 
    event.target.playVideo();
    event.target.mute();
    event.target.setLoop(true);

}

function genzify() {

    var textIsReady = false;
    var videoIsReady = false;

    // Visual stuff
    var videoarea = document.getElementById("video-area");
    videoarea.style.display = "grid";
    videoarea.scrollIntoView({ behavior: "smooth" });
    const textbox = document.getElementById("maintextbox");
    textbox.select();
    var text = textbox.value;
    var textChunks = [];

    // Choose video
    chooseVideo();

    youtubePlayer.addEventListener("onStateChange", function(event) {
        if (event.data == YT.PlayerState.PLAYING) {
            videoIsReady = true;
            if(textIsReady && videoIsReady)
                beginTTS(textChunks);
        }
     });

    parseText(text).then(chunks => {
        textIsReady = true;
        textChunks = chunks;
        if(textIsReady && videoIsReady)
            beginTTS(chunks);
    });
    
}

function chooseVideo() {
    var video = minecraft;
    var videoSelect = document.getElementsByName("video-select");
    if (videoSelect[0].checked)
        video = minecraft;
    else if (videoSelect[1].checked)
        video = subwaysurfers;
    else if (videoSelect[2].checked)
        video = gta;
    else if(videoSelect[3].checked)
        video = baking;
    youtubePlayer.loadVideoById(video.id, video.length, "large");
}

// Returns a speech synthesis ready string with breaks inserted where necessary.
async function parseText(text) {
    var chunks = [];

    const maxNumCharsPerChunk = 30;
    var currentChunk = "";
    const words = text.split(" ");
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        // If the word ends with a period, question mark, or exclamation mark, then it's the end of a sentence.
        const pattern = /\w*[.!?]\w*/;
        if (pattern.test(word)) {
            chunks.push(currentChunk + word);
            currentChunk = "";
        }
        else if (currentChunk.length + word.length > maxNumCharsPerChunk) {
            chunks.push(currentChunk);
            currentChunk = word + " ";
        }
        else {
            currentChunk += word + " ";
        }
    }

    // If chunks is empty, then the text was less than maxNumCharsPerChunk. In this case, just return the text.
    if (chunks.length == 0) {
        chunks.push(text);
    }
    return chunks;
}

function beginTTS(chunks) {
    var synth = new SpeechSynthesisUtterance();
    var voices = window.speechSynthesis.getVoices();
    synth.voice = voices[0];
    var synthString = chunkMarker + chunks.join(chunkMarker); // Chunk marker at the start so that the first chunk is displayed.
    synth.text = synthString;

    var currentChunkIndex = 0;
    var previousWordEnd = 0;
    synth.onboundary= function (e) {
        var unspokenText = synthString.substring(previousWordEnd, e.charIndex);
        if(unspokenText.includes(chunkMarker)) {
            displaytextChunk(chunks[currentChunkIndex]);
            currentChunkIndex++;
        }
        previousWordEnd = e.charIndex + e.charLength;
    }
    window.speechSynthesis.speak(synth);
}

function displaytextChunk(textChunk) {
    var textbox = document.getElementById("overlay-text");
    textbox.innerText = textChunk;
}