// Starting configuration type, changes based on blutton click
var configtype="";
    
// Services list based on configuration type
var singleconfig = [ "nginx", "app", "appupload", "availabilitymonitor", "internalapi", "jobretryservice", "publicapi", "sentinel", "pngexport", "datasetsserviceapi", "provisioner", "resourceproxy", "queueproxy", "mmqueue", "edabroker", "idebroker", "ideworker", "securebroker", "edaworker", "secureworker", "datasetsserviceworker0", "datasetsservicequickworker0", "datasetsserviceworker1", "datasetsservicequickworker1", "mongo", "redis", "gluster", "rsyslog", "predictionoptimizationapi", "predictionoptimizationui", "logstash", "diagnostics" ];
        
var services = new Object;
services["app"]         = [ "nginx", "app", "appupload", "availabilitymonitor", "internalapi", "jobretryservice", "publicapi", "predictionapi", "pngexport", "datasetsserviceapi", "provisioner", "resourceproxy", "queueproxy", "mmqueue", "edabroker", "idebroker", "ideworker", "securebroker", "edaworker", "securebroker", "rsyslog", "predictionoptimizationapi", "predictionoptimizationui", "logstash", "diagnostics" ];
services["data"]        = [ "mongo", "redis", "gluster" ];
services["model"]       = [ "secureworker", "edaworker", "datasetsserviceworker0", "datasetsservicequickworker0", "datasetsserviceworker1", "datasetsservicequickworker1" ];
services["prediction"]  = [ "dedicatedpredictionapi", "dedicatedpredictionnginx" ];
services["dataslave"]   = [ "mongo", "redis", "sentinel", "gluster" ];
services["datamaster"]  = [ "mongo", "sentinel", "gluster" ];
services["modelonly"]   = [ "secureworker" ];
    
// List the types of nodes
var types = ["app","data","prediction","model"];
    
    
function flipit(where) {
    $("#" + where).toggle();
    var state = ( $("#" + where + " input").prop('disabled') == true ) ? false : true;
    $("#" + where + " input").prop('disabled', state);
//    console.log("Flipped:> " + where + " inputs to disabled:" + state)
}
    
function flipitselect(where) {
    $("#" + where).toggle();
    var state = ( $("#" + where + " input").prop('disabled') == true ) ? false : true;
    $("#" + where + " input").prop('disabled', state);
    $("#" + where + " select").prop('disabled', state);
    console.log("Flipped:> " + where + " inputs/selects to disabled:" + state)
}
    
$(document).ready(function() {
    // When the check box is checked, do this!
    $("#webserverssl").click(function () { flipit("webkeyfiles"); });
    $("#predictionssl").click(function () { flipit("predictionkeyfiles"); });
    $("#remotelogging").click(function () { flipit("remotelogginginfo"); });
    $("#enablesmpt").click(function () { flipitselect("smtpconfig"); });
    $("#dedicatedpredictionserver").click(function () { flipit("dpsconfig"); });
    $("#enableha").click(function () { flipit("haconfig"); });
    $("#advanced").click(function(e){ $("#advancedoptions").toggle() });
    
    // Item click actions
    // Based on the button click, determine which panel to show
    // and update the configtype var
    $('.show').click(function () {
        configtype = $(this).attr('data-target');
        for( var type in { singlenode_panel, multinode_panel, hadoop_panel }) {
            var inner = "#" + type;
            $(inner).hide();
            $(inner + " input").prop('disabled', true);
            $("#webkeyfiles input").prop('disabled', true);
            $("#predictionkeyfiles input").prop('disabled', true);
            $("#remotelogginginfo input").prop('disabled', true);
            $("#smtpconfig input").prop('disabled', true);
            $("#smtpconfig select").prop('disabled', true);
            $("#haconfig input").prop('disabled', true);
            $("#dpsconfig input").prop('disabled', true);

            if ( type.indexOf(configtype) !== -1 ) {
                $(inner).show();
                $(inner + " input").prop('disabled', false);
            }   
        }
    });
    
    // Generates the JSON array used to create the yaml file
    // All validation should have been done beofre this fires
    $("#create").click(function(e){
        e.preventDefault();

        var formData = $("#config").serializeJSON();
    
        if (configtype == "singlenode") {
            $.extend(formData.servers[0].services, singleconfig);
        }
        else if (configtype == "multinode") {
    
            for( var type in types) {
                var key = types[type];
                var services
                //console.log( "type " + type + ":>" + key + "\ntypeof:>" + typeof( formData.servers[key] ) + "\nServices:" + services[ key ] );
                //console.log(this)
                //console.log(formData)
                //$.extend(formData.servers[key].services, services[ key ]);
            }
        }
    
        var yaml = jsyaml.load( JSON.stringify(formData), { 'schema': 'FAILSAFE_SCHEMA' } );
        //var yaml = jsyaml.load( JSON.stringify(formData));

        //console.log(yaml);
        $("#generatedconfig").html( "---\n" + jsyaml.safeDump( yaml ) );
        $("#generatedconfig").show()
    });
    
    
    // Drag and Drop functionality
    // Add Sortability
    $( "#nodetype, #node1, #node2, #node3, #node4" ).sortable({
        connectWith: ".connectedSortable"
    }).disableSelection();
    
    var $nodetype = $( "#nodetype" ),
        $serverlist = $( "#serverlist" );
    
    // Make the nodetype items be dragable
    console.log( "Divs graggable within nodetype:>" + $( "div.nodeconfig", $nodetype ).length );

    $( "#nodetype" ).draggable({
        revert: "invalid", // when not dropped, the item will revert back to its initial position
        containment: "document",
        helper: "clone",
        cursor: "move",
    });

    $( "#nodetype" ).draggable({
        start: function( event, ui ) {
            alert("here i am!");
            //$(this).removeClass('dropped_config'); 
        },
        stop: function( event, ui ) {
            alert("i was there!");
            //$(this).removeClass('dropped_config'); 
        }
    });
    
    // Hide the config elements if dropped back into the nodetype area
    $( "#nodetype" ).droppable({
        drop: function( event, ui) {
            $( ui.draggable ).find(".app_values").hide();
            $( ui.draggable ).removeClass("dropped_config");
        }
    });
    
    // Let the nodes be droppable, accepting the nodetype items
    $( "#node1, #node2, #node3, #node4" ).droppable({
        drop: function( event, ui) {
            $( ui.draggable ).find(".app_values").show();
            $(ui.draggable).addClass("dropped_config");

            if ($( this ).find(".nodeconfig").length == 1) {
                console.log("Activating app: " + $(this).attr("id") + " # app hosts: " + $(this).find("div.apphost").length )
                
                $( "#" + $(this).attr("id") + "host" ).addClass("hidden");
    
                $(this).find("div.nodehost").removeClass("hidden");
                $(this).find("div.nodehost input").prop('disabled', false);
            }
            else if ($( this ).find(".nodeconfig").length > 1) {
    
                console.log("Activating host: " + $(this).attr("id") + " # app hosts: " + $(this).find("div.apphost").length )
    
                // Open the node's host input
                $( "#" + $(this).attr("id") + "host" ).removeClass("hidden");
    
                // Close the droppable's host input section
                $(ui.draggable).find("div.apphost" ).addClass("hidden")
                $(ui.draggable).find("div.apphost input").prop('disabled', true);
    
                // Make sure everything else in the droppable region is styled correctly
                $(this).find("div.apphost").each(function( i ) { this.style.display = "none" });
                $(this).find("div.apphost input").prop('disabled', true);
            }
    
            console.log(this)
        }
    });
    
    // Adding the onclick for new field functionality
    var maxnodes = 9;
    var mcount = 1;
    var pcount = 1;
    
    $("#addmodel, #addprediction").click(function(e){
        e.preventDefault();
        nodetype = $(this).attr('data-target');
        var count = ( nodetype == "model" ) ? mcount : pcount;
        if( count < maxnodes){ //max input box allowed
            count++; //text box increment
            $("#" + nodetype + "wrap").append("<div><input type=\"text\" name=\"servers[model][hosts][]\" class=\"defaultinput\" required placeholder=\"IP Address\" pattern=\"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$\" /><button type='button' class='remove" + nodetype + "'>Remove</button></div>");
        }
        if ( nodetype == "model" ) { mcount = count; } else { pcount = count; }
    });
    
    $("#modelwrap").on("click",".removemodel", function(e){ //user click on remove text
        e.preventDefault();
        $(this).parent('div').remove(); 
        mcount--;
    })
    
    $("#predictionwrap").on("click",".removeprediction", function(e){ //user click on remove text
        e.preventDefault();
        $(this).parent('div').remove(); 
        pcount--;
    })        
});