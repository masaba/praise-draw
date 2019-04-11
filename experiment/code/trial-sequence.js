/* 

Handles dynamic elements of praise-draw experiment with tracing/drawing elements
March 2019, Bria Long, brialorelle@gmail.com

*/
paper.install(window); // install paper.js library
socket = io.connect(); // for data sending

// Set global variables
var curTrial=0 // global variable, trial counter
var disableDrawing = false; //whether touch drawing is disabled or not
var strokeThresh = 3; // each stroke needs to be at least this many pixels long to be sent
// just open up these global variables
var maxTrials;
var stimList = [];

// current mode and session info
var version ="Praisedraw" + "_pilot"; // set experiment name
var sessionId=version + '_' Date.now().toString();

// set which consent/thankspages we're using
var consentPage = '#consentBing';
var thanksPage = "#thanksBing";


// HELPER FUNCTIONS - GENERAL
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// HELPER FUNCTIONS - EXPERIMENT SPECIFIC
// Make stimulus list function, called when startExp button is pressed
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


    // memory test equivalent
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
    distractor_video = "videos/distractor_" + getRandomInt(1,3) + ".mp4" // make global so we can grab it in datasaving function easily
    var distraction = {"exp_phase":"V","video": distractor_video} // get random distractor videos

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
    if (curTrial==0){
        console.log('curTrial=0, getting stimuli list first...')
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

// Switch what we show depending on the experiment phases
function showTrial(){
    // Tracing trials
    if (stimList[curTrial].exp_phase == 'T'){
        setUpDrawing()
        console.log('starting tracing trial')
    }
    // video only
    else if (stimList[curTrial].exp_phase == 'V'){
        // make sure irrelevant stuff is hiddden
        $('#testImageDiv').hide()
        $("#sketchpad").hide()
        // play video 500ms second later to account for loading time
        player = loadNextVideo()
        setTimeout(function() {playVideo(player);},500);
        console.log('starting video trial')
    }
    // drawing trials
    else if (stimList[curTrial].exp_phase == 'D'){
        $('#testImageDiv').hide()
        $("#sketchpad").show();
        setUpDrawing()
        console.log('starting drawing trial')
    }
    else if (stimList[curTrial].exp_phase == 'M'){
        $("#sketchpad").hide(); // hide the sketchpad
        $('#testImageDiv').children('img').attr('src', stimList[curTrial].image); // change test image
        $('#testImageDiv').fadeIn() // and show it
        console.log('starting memory check trial')
    }
}

// When the current trial is over
function increaseTrial(){
    if (stimList[curTrial].exp_phase=='D' | stimList[curTrial].exp_phase=='T'){
        saveSketchData() // save first!
        console.log('saving sketchpad data...')
    }
    curTrial=curTrial+1; // increase counter
    startTrial() // start next trial
}

// Video player functions
function loadNextVideo(){
    // reset cuevideodiv just in case
    $("#cueVideoDiv").html("<video id='cueVideo' class='video-js' playsinline poster='https://dummyimage.com/320x240/ffffff/fff' >  </video>");
    
    var player=videojs('cueVideo',
        {
            "controls": false, // don't want to show video controls so kids can't touch them
            "preload":"auto"
        },
        function() {
            this.volume(1); // 1 = max volume
        }
    );
    player.pause();
    player.volume(1); // set volume to max again just in case

    console.log(stimList[curTrial].video) // lets us know which video is playing
    player.src({ type: "video/mp4", src: stimList[curTrial].video }); // set source video in player to video from stimList
    player.load();
    return player; // gives back this object for use
}

function playVideo(player){
    player.ready(function() { // need to wait until video is ready
        $('#cueVideoDiv').fadeIn(); // show video div only after video is ready
        // make it fullscreen 
        player.requestFullscreen();
        this.play();
        // after video is done...
        this.on('ended', function () {

                console.log('video over, starting next trial...');
                $('#cueVideoDiv').fadeOut();
                setTimeout(function(){
                    player.dispose(); //dispose the old video and related eventlistener. Add a new video
                }, 500); // 500 = 500ms

                // add slight delay between something new and start of new trials
                setTimeout(function () {
                    increaseTrial();
                }, 500); // 500 = 500ms
        });
    });
}

// to set up the drawing elements on a trial 
function setUpDrawing(){
    var imgSize = "70%"; 
    disableDrawing = false; 
    $('#sketchpad').css({"background": "", "opacity":""});

     //for all tracing trials, show the tracing image on the canvas
    if (stimList[curTrial].exp_phase == "T"){
        var imageurl = "url('" + stimList[curTrial].image + "')";
        $('#sketchpad').css("background-image", imageurl)
            .css("background-size",imgSize)
            .css("background-repeat", "no-repeat")
            .css("background-position","center center");
        $("#keepGoing").show(); // button 

    // for all tracing trials, no background image
    }else if (stimList[curTrial].exp_phase == "D"){
       $('#sketchpad').css('background-image','');
    }
    else if(curTrial == maxTrials-1){
        $("#keepGoing").hide();
    }

    // always show progress bar (with keep going button) and sketchpad
    $('#progressBar_Button').show()
    $('#sketchpad').show()
    // get start of drawing time after elements have been shown
    startTrialTime = Date.now()
};

// saving sketch data (stroke saving with same variables in window.onload block below)
function saveSketchData(){
    // downsamplesketchpad before saving .png (backup to all stroke data)
    var canvas = document.getElementById("sketchpad"),
        ctx=canvas.getContext("2d");

    tmpCanvas = document.createElement("canvas");
    tmpCanvas.width=150;
    tmpCanvas.height=150;
    destCtx = tmpCanvas.getContext('2d');
    destCtx.drawImage(canvas, 0,0,150,150)

    // what actually gets sent
    var dataURL = tmpCanvas.toDataURL();
    dataURL = dataURL.replace('data:image/png;base64,','');

    // change how we save condition/category depending on trial type 
    if (stimList[curTrial].exp_phase=='T'){  // if this was a tracing trial...
        condition = 'tracing';
        category = stimList[curTrial].category; // what were they tracing
        actor = 'none'
        tracing_set = 'none' // relevant to what the child sees during upcoming videos, not to their own tracing trials
    }
    else if (stimList[curTrial].exp_phase=='D'){ // if this was a drawing trial
        condition = stimList[curTrial-2].condition; // condition comes from test trial 2 trials ago! (could also be curTrial-3)
        category = 'animal'
        actor = stimList[curTrial-2].condition; // actor comes from test trial 2 trials ago! (could also be curTrial-3)
        tracing_set = stimList[curTrial-2].tracing_set; // tracing_set comes from test trial 2 trials ago! (could also be curTrial-3)
    }

    // now save the rest of the trial variables
    var exp_phase = stimList[curTrial].exp_phase; // tracing or drawing
    var CB = $('#CB').val(); // counterbalancing (1-8)
    var subID = $('#subID').val(); // subject ID
    var readable_date = new Date();
    var distraction = distractor_video // randomly selected one of three videos

    // fill up the 'current data' structure with all this info to send
    current_data = {
        dataType: 'finalImage', // could be finalImage or stroke (see other function)
        sessionId: sessionId, // each children's session, independent of subject ID
        imgData: dataURL, // actual .pngs that we're saving
        category: category, // what kids were asked to trace/draw
        condition: condition, // selective vs. overpraise (if in drawing trial, just 'tracing' if not)
        distractrion: distraction, // which distractor video we used
        actor: actor, // which actor they saw (if in drawing trial)
        tracing_set, tracing_set, // which set of tracings they saw (if in drawing trial)
        CB: CB, // counterbalancing
        subID: subID, // entered by experimenter at beginning
        date: readable_date, // today's date
        dbname:'kiddraw', // still in kiddraw database
        colname: version, // experiment name is "version", but praisedraw can have different versions
        trialNum: curTrial, // which trial number this was (including video/memory test, etc)
        startTrialTime: startTrialTime, // when this started (when sketchpad was shown)
        endTrialTime: Date.now()} // when trial was complete, e.g., now

    // send data to server to write to database
    socket.emit('current_data', current_data);
};

// to end & restart experiment
function endExperiment(){
    $('#keepGoing').hide();
    $('#sketchpad').hide();
    $(thanksPage).show();
    curTrial = -1;
    //wait for 1min and restart if we haven't already
    setTimeout(function(){
        if(curTrial == -1) {
            console.log("Restarting experiment since it's been 60 seconds...");
            restartExperiment()
        }
    }, 60000);
}

function restartExperiment() {
    window.location.reload(true);
    console.log('Reloading experiment')
}


// Bind certain functions to buttons only after the document has been loaded
window.onload = function() {

    document.ontouchmove = function(event){
        event.preventDefault();
    }

    // start experiment button
    $('.startExp').bind('touchstart mousedown',function (e) {
        e.preventDefault()
        console.log('touched start button');

        // make sure CB/subID have been entered before proceeding
        if ($("#CB").val().trim().length==0){
                alert("Please let the researcher enter your condition.");
            }
        else if($("#CB").val().trim()!>=0 && $("#CB").val().trim()!<=9){
            alert("Please enter a valid counterbalancing condition (1-8)");
        }
        else{
            startTrial();
        }

    });

    // next trial button
    $('#keepGoing').bind('touchstart mousedown',function(e) {
        e.preventDefault()

        // don't advance trials videos even if clicked
        if (stimList[curTrial].exp_phase=='V'){
            console.log('touched next trial button during video, do nothing');
        }
        else{
            console.log('touched next trial button, advancing');
            increaseTrial(); // save data and increase trial counter    
            project.activeLayer.removeChildren(); // clear sketchpad     
        }
    });


    /////////////  DRAWING RELATED TOOLS 
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

    // set up the paper.js library on the sketchpad element
    paper.setup('sketchpad');

    // Each time we send a stroke (when finger comes up  -- onTouchEnd)
    function sendStrokeData(path) {
       // get string that encodes the stroke
        path.selected = false
        var svgString = path.exportSVG({asString: true}); 

        // change how we save condition/category depending on trial type 
        if (stimList[curTrial].exp_phase=='T'){  // if this was a tracing trial...
            condition = 'tracing';
            category = stimList[curTrial].category; // what were they tracing
            actor = 'none'
            tracing_set = 'none' // relevant to what the child sees during upcoming videos, not to their own tracing trials
        }
        else if (stimList[curTrial].exp_phase=='D'){ // if this was a drawing trial...
            condition = stimList[curTrial-2].condition; // condition comes from test trial 2 trials ago! (could also be curTrial-3)
            category = 'animal'
            actor = stimList[curTrial-2].condition; // actor comes from test trial 2 trials ago! (could also be curTrial-3)
            tracing_set = stimList[curTrial-2].tracing_set; // tracing_set comes from test trial 2 trials ago! (could also be curTrial-3)
        }

        // now save the rest of the trial variables
        var exp_phase = stimList[curTrial].exp_phase; // tracing or drawing
        var CB = $('#CB').val(); // counterbalancing (1-8)
        var subID = $('#subID').val(); // subject ID
        var readable_date = new Date();
        var distraction = distractor_video // randomly selected one of three videos
        
        // output timing to console so we can sanity check
        console.log('time since we started the trial')
        console.log(endStrokeTime - startTrialTime)
        console.log("time of this stroke")
        console.log(endStrokeTime - startStrokeTime)


        stroke_data = {
            dataType: 'stroke', // could be finalImage or stroke (see other function)
            sessionId: sessionId, // each children's session, independent of subject ID
            svg: svgString, // actual strokes that are sent
            category: category, // what kids were asked to trace/draw
            condition: condition, // selective vs. overpraise (if in drawing trial, just 'tracing' if not)
            distractrion: distraction, // which distractor video we used
            actor: actor, // which actor they saw (if in drawing trial)
            tracing_set, tracing_set, // which set of tracings they saw (if in drawing trial)
            CB: CB, // counterbalancing
            subID: subID, // entered by experimenter at beginning
            date: readable_date, // today's date
            dbname:'kiddraw', // still in kiddraw database
            colname: version, // experiment name is "version", but praisedraw can have different versions
            trialNum: curTrial, // which trial number this was (including video/memory test, etc)
            startTrialTime: startTrialTime, // when this started (when sketchpad was shown)
            startStrokeTime: startStrokeTime, // when this stroke started
            endStrokeTime: endStrokeTime} // when it ended

        // send stroke data to server
        console.log(stroke_data)
        socket.emit('stroke',stroke_data);
    }

    // Touch event functions & listeners defined below
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
        path.simplify(3);
        path.flatten(1);

        // only send data if above some minimum stroke length threshold      
        var currStrokeLength = path.length;
        if (currStrokeLength > strokeThresh) {
            sendStrokeData(path);
           }

    }

    targetSketch = document.getElementById("sketchpad");
    targetSketch.addEventListener('touchstart', touchStart, false);
    targetSketch.addEventListener('touchmove', touchMove, false);
    targetSketch.addEventListener('touchend', touchEnd, false);


} // end of on document load function





