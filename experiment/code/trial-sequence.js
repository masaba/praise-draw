/* 

Handles dynamic elements of standard kidddraw task
March 2019 Praise-draw

## progress: set up counterbalancing, basic trial structure

## stimListTest still has funny size; need to check what happens there
## remove all global 'clicked submit counters'; was bugging 
## add back cuevideodiv to index.html so we can play videos 
## need to center the drawing div (off now that we changed some divs....)
## change size of videos that are being shown so they are full screen
## log in console which kind of trial we are in for debugging purposes
## change the kind of data that is sent on each trial (will not always be drawing!)
## set up basic structure for the memory task trials



*/





paper.install(window);
socket = io.connect();

// Set global variables
var curTrial=0 // global variable, trial counter
var clickedSubmit=0; // whether an image is submitted or not
var tracing = true; //whether the user is in tracing trials or not
var maxTraceTrial = 2; //the max number of tracing trials
var numPracticeTrials = maxTraceTrial + 1; // number of tracing trials
var timeLimit=30;
var disableDrawing = false; //whether touch drawing is disabled or not
var language = "English";

// current mode and session info
var mode = "CDM";
var version =mode + "_praisedraw" + "_pilot"; // set experiment name
var sessionId=version + Date.now().toString();

var consentPage = '#consentBing';
var thanksPage = "#thanksBing";
var maxTrials;
var stimList = [];
var subID = $('#subID').val();

var strokeThresh = 3; // each stroke needs to be at least this many pixels long to be sent



// HELPER FUNCTIONS - GENERAL
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// shuffle the order of drawing trials
function shuffle (a)
{
    var o = [];
    for (var i=0; i < a.length; i++) {
        o[i] = a[i];
    }
    for (var j, x, i = o.length;
         i;
         j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}


// HELPER FUNCTIONS - TASK SPECIFIC

// Make stimulus list function, called later
function getStimuliList(){
    // Get counterbalancing order from formula (should be 1 through 8)
    var CB = $('#CB').val();

    
    // exp_phase variable types: T: tracing / warm up phase, V: video, D: drawing, M: memory_test

    // tracing trials
    var tryit = {"exp_phase":"T","category":"try it out!", "video": "trace_square.mp4", "image":"images/square.png"}
    var trace1 = {"exp_phase":"T","category":"this square", "video": "trace_square.mp4", "image":"images/square.png"}
    var trace2 = {"exp_phase":"T","category":"this shape", "video": "trace_shape.mp4","image":"images/shape.png"}

    // difference combinations of overpraise v selective teacher videos
    var overpraise_avery_set1 = {"exp_phase":"V","condition":"overpraise","actor": "avery","tracing_set":"set1","video": "videos/overpraise_avery_set1.mp4"}
    var overpraise_avery_set2 = {"exp_phase":"V","condition":"overpraise","actor": "avery","tracing_set":"set2","video": "videos/overpraise_avery_set2.mp4"}

    var selectivepraise_avery_set1 = {"exp_phase":"V","condition":"selective","actor": "avery","tracing_set":"set1","video": "videos/selective_avery_set1.mp4"}
    var selectivepraise_avery_set2 = {"exp_phase":"V","condition":"selective","actor": "avery","tracing_set":"set2","video": "videos/selective_avery_set2.mp4"}

    var overpraise_ellie_set1 = {"exp_phase":"V","condition":"overpraise","actor": "ellie","tracing_set":"set1","video": "videos/overpraise_ellie_set1.mp4"}
    var overpraise_ellie_set2 = {"exp_phase":"V","condition":"overpraise","actor": "ellie","tracing_set":"set2","video": "videos/overpraise_avery_set2.mp4"}

    var selectivepraise_ellie_set1 = {"exp_phase":"V","condition":"selective","actor": "ellie","tracing_set":"set1","video": "videos/selective_ellie_set1.mp4"}
    var selectivepraise_ellie_set2 = {"exp_phase":"V","condition":"selective","actor": "ellie","tracing_set":"set2","video": "videos/selective_ellie_set2.mp4"}


    // drawing element
    var drawing = {"exp_phase":"D"}

    // distraction video
    var distraction = {"exp_phase":"V","video": "videos/distraction.mp4"}

    // memory checks
    var memory_check_set1 = {"exp_phase":"M", "tracing_1" : "images/tracing1_set1.png","tracing_2":"images/tracing1_set1.png"}
    var memory_check_set2 = {"exp_phase":"M", "tracing_1" : "images/tracing1_set2.png","tracing_2":"images/tracing2_set2.png"}


    // Change which of these are presented depending on counterbaancing order
    
    // overpraise first, selective praise 2nd, avery=set1, ellie=set2
    
    // selective praise first, overpraise 2nd
    if (CB==1){
        var teacher1 = selectivepraise_avery_set1
        var memory_check_1 = memory_check_set1

        var teacher2 = overpraise_ellie_set2
        var memory_check_2 = memory_check_set2
        
    }
    else if (CB==2){
        var teacher1 = selectivepraise_avery_set2
        var memory_check_1 = memory_check_set2

        var teacher2 = overpraise_ellie_set1
        var memory_check_2 = memory_check_set1
       
    }
    else if (CB==3){
        var teacher1 = selectivepraise_ellie_set1
        var memory_check_1 = memory_check_set1

        var teacher2 = overpraise_avery_set2
        var memory_check_2 = memory_check_set2

    }
    else if (CB==4){
        var teacher1 = selectivepraise_ellie_set2
        var memory_check_1 = memory_check_set2

        var teacher2 = overpraise_avery_set1
        var memory_check_2 = memory_check_set1
        
    }
    if (CB==5){ 
        var teacher1 = overpraise_avery_set1
        var memory_check_1 = memory_check_set1
       
        var teacher2 = selectivepraise_ellie_set2
        var memory_check_2 = memory_check_set2
    }
    else if (CB==6){
        var teacher1 = overpraise_avery_set2
        var memory_check_1 = memory_check_set2
        
        var teacher2 = selectivepraise_ellie_set1
        var memory_check_2 = memory_check_set1

    }
    else if (CB==7){
        var teacher1 = overpraise_ellie_set1
        var memory_check_1 = memory_check_set1
        
        var teacher2 = selectivepraise_avery_set2
        var memory_check_2 = memory_check_set2

    }
    else if (CB==8){
        var teacher1 = overpraise_ellie_set2
        var memory_check_1 = memory_check_set2

        var teacher2 = selectivepraise_avery_set1
        var memory_check_2 = memory_check_set1

    }

    //
    // stimList.push(tryIt);//
    stimList.push(trace1); // 
    stimList.push(trace2); // 
    stimList.push(teacher1); // 
    stimList.push(drawing); // 
    stimList.push(distraction); // 
    stimList.push(teacher2); // 
    stimList.push(drawing); //     

    maxTrials = stimList.length + 1 
}



function showTaskChangeVideo(callback){
    console.log("time for something new")
    $('#photocue').hide();
    var player = loadChangeTaskVideo(); // change video
    // set volume again
    var video = document.getElementById('cueVideo');
    video.volume = 1;
    drawNext = 0;
    document.getElementById("drawingCue").innerHTML =  " &nbsp; &nbsp;  &nbsp; "
    setTimeout(function() {playVideo(player, drawNext);},1000);
};

// for each trial, incoporates trial counter
function startTrial(){
    clickedSubmit=0 // set back to 0
    if (curTrial==0){
        console.log('curTrial=0, getting stimuli')
        $("#landingPage").hide();
        $("#mainExp").show();
        getStimuliList()
        showTrial()
    }
    else if (curTrial>0 && curTrial<maxTrials) {
        showTrial()
    }
    else if (curTrial==maxTrials){
        endExperiment();
    }
}

// switch between experiment phases
function showTrial(){
    // Tracing trials
    if (stimList[curTrial].exp_phase == 'T'){
        setUpDrawing()
        console.log('starting tracing trial')
    }
    // video only
    else if (stimList[curTrial].exp_phase == 'V'){
        player = loadNextVideo()
        // set volume again
        var video = document.getElementById('cueVideo');
        video.volume = 1;
        drawNext = 0;
        // play video 1 second player
        setTimeout(function() {playVideo(player, drawNext);},1000);
    }
    // drawing trials
    else if (stimList[curTrial].exp_phase == 'D'){
        setUpDrawing()
    }
    else if (stimList[curTrial].exp_phase == 'M'){
        setUpMemoryTest() // NOT DONE YET
    }
}




// video player functions
function playVideo(player, drawNext){
    player.ready(function() { // need to wait until video is ready
        $('#cueVideoDiv').fadeIn(); // show video div only after video is ready

        this.play();
        this.on('ended', function () {

            // only want to start drawing if we are not on the "something new" video
            if (drawNext == 1) {
                console.log('video ends and drawing starts');
                $('#cueVideoDiv').fadeOut(); 
                setTimeout(function(){
                    player.dispose(); //dispose the old video and related eventlistener. Add a new video
                }, 500);
                setUpDrawing();

            }
            else {
                console.log('starting normal trials...something new');
                $('#cueVideoDiv').fadeOut();
                setTimeout(function(){
                    player.dispose(); //dispose the old video and related eventlistener. Add a new video
                }, 500);

                // add slight delay between something new and start of new trials
                setTimeout(function () {
                    showTrial();
                }, 1000);
            }
        });
    });
}


function loadNextVideo(){
    $("#cueVideoDiv").html("<video id='cueVideo' class='video-js' playsinline poster='https://dummyimage.com/320x240/ffffff/fff' >  </video>");
    var player=videojs('cueVideo',
        {
            "controls": false,
            "preload":"auto"
        },
        function() {
            this.volume(1);
        }
    );
    player.pause();
    player.volume(1); // set volume to max
    console.log(stimList[curTrial].video)
    player.src({ type: "video/mp4", src: "videos/" + stimList[curTrial].video });
    player.load();
    return player;
}

function setUpDrawing(){
    var imgSize = "70%";
    disableDrawing = false;
    $('#sketchpad').css({"background": "", "opacity":""});

    if (stimList[curTrial].exp_phase == "T"){
        //for all tracing trials, show the tracing image on the canvas
        var imageurl = "url('" + stimList[curTrial].image + "')";
        $('#sketchpad').css("background-image", imageurl)
            .css("background-size",imgSize)
            .css("background-repeat", "no-repeat")
            .css("background-position","center center");
        $("#keepGoing").show();

    }else if (stimList[curTrial].exp_phase == "D"){
       $('#sketchpad').css('background-image','');
    }
    else if(curTrial == maxTrials-1){
        $("#endMiddle").hide();
        $("#keepGoing").hide();
        $("#endGame").show();
    }

    $('#progressBar_Button').show()
    $('#sketchpad').show()
    startTrialTime = Date.now()

};

// saving data functions
function saveSketchData(){
    // downsamplesketchpad before saveing
    var canvas = document.getElementById("sketchpad"),
        ctx=canvas.getContext("2d");

    tmpCanvas = document.createElement("canvas");
    tmpCanvas.width=150;
    tmpCanvas.height=150;
    destCtx = tmpCanvas.getContext('2d');
    destCtx.drawImage(canvas, 0,0,150,150)

    var dataURL = tmpCanvas.toDataURL();
    dataURL = dataURL.replace('data:image/png;base64,','');
    var category = stimList[curTrial].category; // category name
    var condition = stimList[curTrial].condition; // should be S or P
    var imageName = stimList[curTrial].image; // actual image IF it was a P trial, saved in general even if not used for S trials...
    var age = $('.active').attr('id'); // age value
    var CB = $('#CB').val(); // counterbalancing (1,2)
    var whichValidation = whichValidation;
    var subID = $('#subID').val();
    var readable_date = new Date();

    current_data = {
        dataType: 'finalImage',
        sessionId: sessionId, // each children's session
        imgData: dataURL,
        category: category,
        condition: condition,
        imageName: imageName,
        age: age,
        CB: CB,
        whichValidation: whichValidation,
        subID: subID,
        date: readable_date,
        dbname:'kiddraw',
        colname: version,
        location: mode,
        trialNum: curTrial,
        startTrialTime: startTrialTime,
        endTrialTime: Date.now()} // when trial was complete, e.g., now};
    // send data to server to write to database
    socket.emit('current_data', current_data);
};

// experiment navigation functions

function restartExperiment() {
    window.location.reload(true);
}

function endExperiment(){
    $(thanksPage).show();
    curTrial = -1;
    //wait for 1min and restart
    setTimeout(function(){
        if(curTrial == -1) {
            console.log("restart after 60 seconds");
            restartExperiment()
        }
    }, 60000);
}

function increaseTrial(){
    saveSketchData() // save first!
    curTrial=curTrial+1; // increase counter
    startTrial()
}

function isDoubleClicked(element) {
    //if already clicked return TRUE to indicate this click is not allowed
    if (element.data("isclicked")) return true;

    //mark as clicked for 2 second
    element.data("isclicked", true);
    setTimeout(function () {
        element.removeData("isclicked");
    }, 2000);

    //return FALSE to indicate this click was allowed
    return false;
}

window.onload = function() {

    thanksPage = "#thanksBing";
    document.ontouchmove = function(event){
        event.preventDefault();
    }

    $('.startExp').bind('touchstart mousedown',function (e) {
        e.preventDefault()
        // if (isDoubleClicked($(this))) return;

        console.log('touched start button');

        if ($("#CB").val().trim().length==0){
                alert("Please let the researcher enter your condition.");
            }
        else if($("#CB").val().trim()!=1 && $("#CB").val().trim()!=2){
            alert("Please enter a valid counterbalancing condition (1,2)");
        }
        else{
            startTrial();
        }

    });

    $('#keepGoing').bind('touchstart mousedown',function(e) {
        e.preventDefault()
        if (isDoubleClicked($(this))) return;

        $('#keepGoing').removeClass('bounce')

        console.log('touched next trial button');
        increaseTrial(); // save data and increase trial counter
    

        $('#drawing').hide();
        project.activeLayer.removeChildren();
        startTrial();
    });

    $('.allDone').bind('touchstart mousedown',function(e) {
        e.preventDefault()
        // if (isDoubleClicked($(this))) return;

        console.log('touched endExperiment  button');
        increaseTrial(); // save data and increase trial counter
        
        $('#mainExp').hide();
        $('#drawing').hide();
        $('#keepGoing').removeClass('bounce')
        endExperiment();

    });

    $('.endRestart').bind('touchstart mousedown',function(e){
        e.preventDefault()
        // if (isDoubleClicked($(this))) return;

        console.log('restart to the landing page')
        restartExperiment()
    });


    $('#sendEmail').bind('touchstart mousedown',function(e){
        e.preventDefault()

        // if (isDoubleClicked($(this))) return;
        var email = $('#parentEmail').val()
        $.get("/send", {email:email}, function(data){
            if(data=="sent"){
                $('#email-form').hide()
                $('#emailSent').show()
            }else{
                alert('invalid email')
            }
        });
    });

    // for toggling between age buttons
    $('.ageButton').bind('touchstart mousedown',function(e){
        e.preventDefault()
        $('.ageButton').removeClass('active')
        $(this).addClass('active')
    });

    // Set up drawing canvas
    var canvas = document.getElementById("sketchpad"),
        ctx=canvas.getContext("2d");
    //landscape mode 00 inne
    if (window.innerWidth > window.innerHeight){
        canvas.height = window.innerHeight*.68;
        canvas.width = canvas.height;
    }
    // portrait mode -- resize to height
    else if(window.innerWidth < window.innerHeight){
        canvas.height = window.innerHeight*.68;
        canvas.width = canvas.height;
    }


    /////////////  DRAWING RELATED TOOLS 
    paper.setup('sketchpad');

    // Each time we send a stroke...
    function sendStrokeData(path) {
        path.selected = false

        var svgString = path.exportSVG({asString: true});
        var category = stimList[curTrial].category; // category name
        var condition = stimList[curTrial].condition; // should be S or P
        var imageName = stimList[curTrial].image; // actual image IF it was a P trial, saved in general even if not used for S trials...
        var age = $('.active').attr('id'); // age value
        var CB = $('#CB').val(); // counterbalancing (1,2)
        var whichValidation = whichValidation;
        var subID = $('#subID').val();
        
        var readable_date = new Date();
        
        console.log('time since we started the trial')
        console.log(endStrokeTime - startTrialTime)
        console.log("time of this stroke")
        console.log(endStrokeTime - startStrokeTime)

        stroke_data = {
            dataType: 'stroke',
            sessionId: sessionId,
            svg: svgString,
            category: category,
            condition: condition,
            imageName: imageName,
            age: age,
            CB: CB,
            whichValidation: whichValidation,
            subID: subID,
            date: readable_date,
            dbname:'kiddraw',
            colname: version,
            location: mode,
            trialNum: curTrial,
            startTrialTime: startTrialTime,
            startStrokeTime: startStrokeTime,
            endStrokeTime: endStrokeTime};

        // send stroke data to server
        console.log(stroke_data)
        socket.emit('stroke',stroke_data);
        
    }


///////////// TOUCH EVENT LISTENERS DEFINED HERE 

    function touchStart(ev) {
        if(disableDrawing){
            return;
        }

        startStrokeTime = Date.now()
        console.log("touch start");
        touches = ev.touches;
        if (touches.length>1){
            return; // don't do anything when simultaneous -- get out of this function
            console.log("detected multiple touches")
        }
        
        // Create new path 
        path = new Path();
        path.strokeColor = 'black';
        path.strokeCap = 'round'
        path.strokeWidth = 10;
        
        // add point to path
        var point = view.getEventPoint(ev); // should only ever be one
        path.add(point);
        view.draw();
    }

    function touchMove(ev) {
        if(disableDrawing){
            return;
        }

        // don't do anything when simultaneous touches
        var touches = ev.touches;
        if (touches.length>1){
            return; 
        }
        // add point to path
        var point = view.getEventPoint(ev); 
        path.add(point);
        view.draw();
    }

    function touchEnd(ev){
        if(disableDrawing){
            return;
        }
    // get stroke end time
        endStrokeTime = Date.now();
        console.log("touch end");  

        // simplify path
        //console.log("raw path: ", path.exportSVG({asString: true}));        
        path.simplify(3);
        path.flatten(1);
        //console.log("simpler path: ", path.exportSVG({asString: true}));

        // only send data if above some minimum stroke length threshold      
        //console.log('path length = ',path.length);
        var currStrokeLength = path.length;
        if (currStrokeLength > strokeThresh) {
            sendStrokeData(path);
           }

    }

    targetSketch = document.getElementById("sketchpad");
    targetSketch.addEventListener('touchstart', touchStart, false);
    targetSketch.addEventListener('touchmove', touchMove, false);
    targetSketch.addEventListener('touchend', touchEnd, false);



} // on document load





