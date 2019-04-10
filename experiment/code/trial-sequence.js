/* 

Handles dynamic elements of standard kidddraw task
March 2019 Praise-draw

left to do:
## change size of videos that are being shown so they are full screen (check on ipad)
## change the kind of data that is sent on each trial (will not always be drawing!)

*/
paper.install(window);
socket = io.connect(); // for data sending

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
    var tryit = {"exp_phase":"D","category":"try it out!"}
    var trace1 = {"exp_phase":"T","category":"this square", "video": "trace_square.mp4", "image":"images/square.png"}
    var trace2 = {"exp_phase":"T","category":"this shape", "video": "trace_shape.mp4","image":"images/shape.png"}

    // difference combinations of overpraise v selective teacher videos
    var overpraise_karen_set1 = {"exp_phase":"V","condition":"overpraise","actor": "karen","tracing_set":"set1","video": "videos/overpraise_karen_set1.mp4"}
    var overpraise_karen_set2 = {"exp_phase":"V","condition":"overpraise","actor": "karen","tracing_set":"set2","video": "videos/overpraise_karen_set2.mp4"}

    var selectivepraise_karen_set1 = {"exp_phase":"V","condition":"selective","actor": "karen","tracing_set":"set1","video": "videos/selectivepraise_karen_set1.mp4"}
    var selectivepraise_karen_set2 = {"exp_phase":"V","condition":"selective","actor": "karen","tracing_set":"set2","video": "videos/selectivepraise_karen_set2.mp4"}

    var overpraise_linda_set1 = {"exp_phase":"V","condition":"overpraise","actor": "linda","tracing_set":"set1","video": "videos/overpraise_linda_set1.mp4"}
    var overpraise_linda_set2 = {"exp_phase":"V","condition":"overpraise","actor": "linda","tracing_set":"set2","video": "videos/overpraise_linda_set2.mp4"}

    var selectivepraise_linda_set1 = {"exp_phase":"V","condition":"selective","actor": "linda","tracing_set":"set1","video": "videos/selectivepraise_linda_set1.mp4"}
    var selectivepraise_linda_set2 = {"exp_phase":"V","condition":"selective","actor": "linda","tracing_set":"set2","video": "videos/selectivepraise_linda_set2.mp4"}


    //// memory test equivalent
    var overpraise_karen_set1_mem = {"exp_phase":"M","condition":"overpraise","actor": "karen","tracing_set":"set1","image": "test_images/overpraise_karen_set1.png"}
    var overpraise_karen_set2_mem = {"exp_phase":"M","condition":"overpraise","actor": "karen","tracing_set":"set2","image": "test_images/overpraise_karen_set2.png"}

    var selectivepraise_karen_set1_mem = {"exp_phase":"M","condition":"selective","actor": "karen","tracing_set":"set1","image": "test_images/selectivepraise_karen_set1.png"}
    var selectivepraise_karen_set2_mem = {"exp_phase":"M","condition":"selective","actor": "karen","tracing_set":"set2","image": "test_images/selectivepraise_karen_set2.png"}

    var overpraise_linda_set1_mem = {"exp_phase":"M","condition":"overpraise","actor": "linda","tracing_set":"set1","image": "test_images/overpraise_linda_set1.png"}
    var overpraise_linda_set2_mem = {"exp_phase":"M","condition":"overpraise","actor": "linda","tracing_set":"set2","image": "test_images/overpraise_linda_set2.png"}

    var selectivepraise_linda_set1_mem = {"exp_phase":"M","condition":"selective","actor": "linda","tracing_set":"set1","image": "test_images/selectivepraise_linda_set1.png"}
    var selectivepraise_linda_set2_mem = {"exp_phase":"M","condition":"selective","actor": "linda","tracing_set":"set2","image": "test_images/selectivepraise_linda_set2.png"}

    // drawing element
    var drawing = {"exp_phase":"D"}

    // videos before drawing starts vary with teachers
    var drawing_start_linda = {"exp_phase":"V","actor": "linda","video": "videos/linda_test.mp4"}
    var drawing_start_karen = {"exp_phase":"V","actor": "karen","video": "videos/karen_test.mp4"}

    // distraction video
    var distraction = {"exp_phase":"V","video": "videos/distractor_" + getRandomInt(1,3) + ".mp4"} // get random distractor videos


    // Change which of these are presented depending on counterbaancing order
    if (CB==1){
        var teacher1 = selectivepraise_karen_set1
        var memory_check_1 = selectivepraise_karen_set1_mem
        var drawing_start_1 = drawing_start_karen

        var teacher2 = overpraise_linda_set2
        var memory_check_2 = overpraise_linda_set2_mem
        var drawing_start_2 = drawing_start_linda
    }
    else if (CB==2){
        var teacher1 = selectivepraise_karen_set2
        var memory_check_1 = selectivepraise_karen_set2_mem
        var drawing_start_1 = drawing_start_karen

        var teacher2 = overpraise_linda_set1
        var memory_check_2 = overpraise_linda_set1_mem
        var drawing_start_2 = drawing_start_linda
    }
    else if (CB==3){
        var teacher1 = selectivepraise_linda_set1
        var memory_check_1 = selectivepraise_linda_set1_mem
        var drawing_start_1 = drawing_start_linda

        var teacher2 = overpraise_karen_set2
        var memory_check_2 = overpraise_karen_set2_mem
        var drawing_start_2 = drawing_start_karen
    }
    else if (CB==4){
        var teacher1 = selectivepraise_linda_set2
        var memory_check_1 = selectivepraise_linda_set2_mem
        var drawing_start_1 = drawing_start_linda

        var teacher2 = overpraise_karen_set1
        var memory_check_2 = overpraise_karen_set1_mem
        var drawing_start_2 = drawing_start_karen
        
    }
    if (CB==5){ 
        var teacher1 = overpraise_karen_set1
        var memory_check_1 = overpraise_karen_set1_mem
        var drawing_start_1 = drawing_start_karen
       
        var teacher2 = selectivepraise_linda_set2
        var memory_check_2 = selectivepraise_linda_set2_mem
        var drawing_start_2 = drawing_start_linda

    }
    else if (CB==6){
        var teacher1 = overpraise_karen_set2
        var memory_check_1 = overpraise_karen_set2_mem
        var drawing_start_1 = drawing_start_karen
        
        var teacher2 = selectivepraise_linda_set1
        var memory_check_2 = selectivepraise_linda_set1_mem
        var drawing_start_2 = drawing_start_linda

    }
    else if (CB==7){
        var teacher1 = overpraise_linda_set1
        var memory_check_1 = overpraise_linda_set1_mem
        var drawing_start_1 = drawing_start_linda

        var teacher2 = selectivepraise_karen_set2
        var memory_check_2 = selectivepraise_karen_set2_mem
        var drawing_start_2 = drawing_start_karen

    }
    else if (CB==8){
        var teacher1 = overpraise_linda_set2
        var memory_check_1 = overpraise_linda_set2_mem
        var drawing_start_1 = drawing_start_linda

        var teacher2 = selectivepraise_karen_set1
        var memory_check_2 = selectivepraise_karen_set1_mem
        var drawing_start_2 = drawing_start_karen

    }

    // stimList.push(tryIt);//
    stimList.push(trace1); // 
    stimList.push(trace2); // 
    stimList.push(teacher1); // 
    stimList.push(memory_check_1); //
    stimList.push(drawing_start_1); // 
    stimList.push(drawing); // 
    stimList.push(distraction); // 
    stimList.push(teacher2); // 
    stimList.push(memory_check_2); // 
    stimList.push(drawing_start_2); // 
    stimList.push(drawing); //     

    maxTrials = stimList.length
}


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
        // make sure irrelevant stuff is viddent
        $('#testImageDiv').hide()
        $("#sketchpad").hide()
        // play video 1 second later
        player = loadNextVideo()
        setTimeout(function() {playVideo(player);},1000);
    }
    // drawing trials
    else if (stimList[curTrial].exp_phase == 'D'){
        $('#testImageDiv').hide()
        $("#sketchpad").show();
        setUpDrawing()
    }
    else if (stimList[curTrial].exp_phase == 'M'){
        $("#sketchpad").hide();
        setUpMemoryTest() // NOT DONE YET
    }
}

function setUpMemoryTest(){
    $('#testImageDiv').children('img').attr('src', stimList[curTrial].image);
    $('#testImageDiv').fadeIn()
}


// video player functions
function playVideo(player){
    player.ready(function() { // need to wait until video is ready
        $('#cueVideoDiv').fadeIn(); // show video div only after video is ready
        player.requestFullscreen();
        this.play();
        this.on('ended', function () {

            // only want to start drawing if we are not on the "something new" video
                console.log('video over, starting next trial...');
                $('#cueVideoDiv').fadeOut();
                setTimeout(function(){
                    player.dispose(); //dispose the old video and related eventlistener. Add a new video
                }, 500);

                // add slight delay between something new and start of new trials
                setTimeout(function () {
                    increaseTrial();
                }, 1000);
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
    player.src({ type: "video/mp4", src: stimList[curTrial].video });
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
    $('#keepGoing').hide();
    $('#sketchpad').hide();
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
    if (stimList[curTrial].exp_phase=='D' | stimList[curTrial].exp_phase=='T'){
        saveSketchData() // save first!
        // console.log('curTrial was ' curTrial)
        console.log('saving sketch data')
    }
    curTrial=curTrial+1; // increase counter
    startTrial()
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
        // don't advance during videos even if clicked
        if (stimList[curTrial].exp_phase=='V'){
            console.log('touched next trial button during video, do nothing');
        }
        else{
            console.log('touched next trial button, advancing');
            increaseTrial(); // save data and increase trial counter    
            project.activeLayer.removeChildren(); // clear sketch pad     
        }
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
        var imageName = stimList[curTrial].image; // 
        var CB = $('#CB').val(); // counterbalancing (1,2)
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





