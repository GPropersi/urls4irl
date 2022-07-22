// UI Interactions
$(document).ready(function () {

    // Instantiate UTubDeck with user's accessible UTubs
    radioHTML = '';
    buttonHTML = '';
    for (i in UTubs) {
        radioHTML += '<label for="UTub' + UTubs[i].id + '" class="draw"><input type="radio" id="UTub' + UTubs[i].id + '" name="UTubSelection" value="' + UTubs[i].name + '"><b>' + UTubs[i].name + '</b></label>';
        buttonHTML += '<button type="button" class="UTub btn btn-secondary text-left m-1" id="UTub' + UTubs[i].id + '"><b>' + UTubs[i].name + '</b></button>';
    }
    $('#UTubDeck').find('form')[0].innerHTML = radioHTML;

    // User selected a UTub, display data
    $('input[type=radio]').on('click', function () {
        $('.active').toggleClass('active');
        $(this).parent().toggleClass('active');

        // Reset
        $('#TubImage').remove();

        // Find which UTub was requested
        let selectedUTubID = findUTubID();

        // Pull data from db
        $.getJSON('/home?UTubID=' + selectedUTubID, function (UTubJSON) { buildUTub(UTubJSON) });
    })

    // Selected URL
    $('#centerPanel').on('click', function (e) {
        var selectedCard = $(e.target).closest('div.card');
        if (selectedCard.hasClass("selected")) {    // Already selected, user would like to unselect
            selectedCard.removeClass("selected");
        } else {                                    // Unselected, user would like to select a different URL
            $('#centerPanel').find('div.card').removeClass("selected");
            selectedCard.addClass("selected");
        }

        var selectedURLid = selectedCard.attr("urlid")

        selectURL(selectedURLid);
    });

    // Selected Tag
    $('#TagDeck').on('click', function (e) {
        let label;
        let input;
        let clickedTagID;
        if (e.target.nodeName.toLowerCase() == 'label') {
            // Label clicked. Reset input var. Also toggles checkbox and assigns clickedTagID
            label = $(e.target);
            input = label.children();
            input.prop("checked", !input.prop("checked"));
        } else {
            // Input clicked
            input = $(e.target);
            label = input.parent();
        }

        if (input[0].id == 'selectAll') {

            if (e.target.nodeName.toLowerCase() == 'label') {
                e.preventDefault();
            }

            // Toggle all filter tags
            $('input[type=checkbox]').prop("checked", input[0].checked);

            // Hide/Show all tag spans
            spanObjs = $('span.tag')
            $($(spanObjs)).toggle()
        } else {
            clickedTagID = parseInt(label.attr("tagid"));

            // Hide/Show corresponding tag span
            spanObjs = $('span[tagid="' + clickedTagID + '"]')
            $($(spanObjs)).toggle()
        }

        // Update URLs displayed as a result of checkbox filtering
        updateURLDeck();
    });

    // Modal show/hide
    // $('.btn').on('click', function (e) {
    //     let href = e.target.href;
    //     console.log(href)
    //     let param = href.split("/").slice(3,href.length)
    //     let str = '/';
    //     param.map(i => str += i + "/")
    //     console.log(str)

    //     let addUrl = $.get(str, function (formHtml) {
    //         $('#Modal .modal-content').html(formHtml);
    //         $('#Modal').modal();
    //         $('#submit').click(function (event) {
    //             event.preventDefault();

    //             $('.invalid-feedback').remove();
    //             $('.alert').remove();
    //             $('.form-control').removeClass('is-invalid');
    //             let request = $.ajax({
    //                 url: "/add_url/" + utubID,
    //                 type: "POST",
    //                 data: $('#ModalForm').serialize(),
    //             });

    //             request.done(function(addUrlSuccess, textStatus, xhr) {
    //                 if (xhr.status == 200) {
    //                     $('#Modal').modal('hide');
    //                     getUtubInfo(addUrlSuccess.utubID);
    //                 }; 
    //             });

    //             request.fail(function(xhr, textStatus, error) {
    //                 if (xhr.status == 409 || xhr.status == 400) {
    //                     const flashMessage = xhr.responseJSON.error;
    //                     const flashCategory = xhr.responseJSON.category;

    //                     let flashElem = flashMessageBanner(flashMessage, flashCategory);
    //                     flashElem.insertBefore('#modal-body').show();
    //                 } else if (xhr.status == 404) {
    //                     ModalFormErrorGenerator(xhr.responseJSON);
    //                 }; 
    //                 console.log("Failure. Status code: " + xhr.status + ". Status: " + textStatus);
    //                 console.log("Error: " + error);
    //             });
    //         });
    //     });
    // })

    // Selected User (only if creator)
    $('select').change(function () {
        // Update href
        $('#removeUserTemp').attr("action", '/remove_user/' + selectedUTubID + '/' + $(this)[0].value)
    })

    // Update UTub description (only if creator)
    $('#UTubInfo').on('input', function () {
        //handle update in db
    })

    // Update URL description
    $('#URLInfo').on('input', function () {
        //handle update in db
    })

    // Navbar animation
    $('.first-button').on('click', function () {

        $('.animated-icon1').toggleClass('open');
    });
    $('.second-button').on('click', function () {

        $('.animated-icon2').toggleClass('open');
    });
    $('.third-button').on('click', function () {

        $('.animated-icon3').toggleClass('open');
    });
});


// Functions

function findUTubID() {
    // Find which UTub was requested
    radioButton = $('input[type=radio]:checked')[0];
    $('#UTubHeader')[0].innerHTML = radioButton.value;
    str = radioButton.id;
    return str.charAt(str.length - 1);
}

function dictURLs() {
    let URLs = $('#listURLs').find('.card-title').map(i => i.innerHTML)
    return 1
}

function dictURLs() {
    return $('#listURLs').find('.card-title').map(i => i.innerHTML)
}

function buildUTub(selectedUTub) {

    //Use local variables, pass them in to the subsequent functions as required
    var selectedUTubID = selectedUTub.id;
    var dictURLs = selectedUTub.urls;
    var dictTags = selectedUTub.tags;
    var dictUsers = selectedUTub.members;
    var creator = selectedUTub.created_by;

    // Clear 
    resetUTubs();

    // Center panel
    buildURLDeck(dictURLs, dictTags);

    // LH panels
    buildTagDeck(dictTags);

    // RH panels
    // Update UTub description, not yet implemented on backend
    // $('#UTubInfo')[0].innerHTML = selectedUTub.description;

    gatherUsers(dictUsers, creator);

    let currentUserID = $('#welcome').attr('user_id');

    // Update hrefs
    $('#addURL').attr("href", "/add_url/" + selectedUTubID);
    $('#addUser').attr("href", "/add_user/" + selectedUTubID);
    $('#deleteUTubTemp').attr("action", "/delete_utub/" + selectedUTubID + "/" + currentUserID);
}

// Build center panel URL-tag list for selectedUTub
function buildURLDeck(dictURLs, dictTags) {
    let card = document.createElement('div');
    setAttributes(card, { "id": "-group", "class": "board-list", "ondrop": "dropIt(event)", "ondragover": "allowDrop(event)", "ondragstart": "dragStart(event)" });

    let html = '';
    let cardHead = '<div class="col-md-12 col-lg-4 col-xl-3 mb-3"><div class="card url" draggable="true"',
        cardInt1 = '><img class="card-img-top" src="..." alt="Card image cap">', // Potential option to show static image preview of destination site
        cardInt2 = '><div class="card-body"><h5 class="card-title">',
        cardInt3 = '</h5><p class="card-text">',
        cardInt4 = '</p></div></div></div>';

    for (let i in dictURLs) {
        // Build tag html strings 
        let tagArray = dictURLs[i].url_tags;
        let tagString = '';
        for (let j in tagArray) { // Find applicable tags in dictionary to apply to URL card
            let tag = dictTags.find(function (e) {
                if (e.id === tagArray[j]) {
                    return e.tag_string
                }
            });
            tagString += '<span class="tag" tagid="' + tag.id + '">' + tag.tag_string + '</span>';
        }

        // Assemble url list items
        html += cardHead + 'urlid="' + dictURLs[i].url_id + '" ' + cardInt2 + dictURLs[i].url_string + cardInt3 + tagString + cardInt4;
    }
    card.innerHTML = html;

    // $("#boardlists")[0].insertBefore(card, $("#boardlists")[0].firstChild);

    $('#listURLs')[0].innerHTML = html;
}

function updateURLDeck() {
    let urlList = $('div.url');
    for (let i = 0; i < urlList.length; i++) {
        let tagList = $(urlList[i]).find('span.tag');

        // If no tags associated with this URL, ignore. Unaffected by filter functionality
        if (tagList.length === 0) { continue; }

        // If all tags for given URL are style="display: none;", hide parent URL card
        let inactiveTagBool = tagList.map(i => tagList[i].style.display == 'none' ? true : false)
        // Manipulate mapped Object
        let boolArray = Object.entries(inactiveTagBool);
        boolArray.pop();
        boolArray.pop();

        // Default to hide URL
        let hideURLBool = true;
        boolArray.forEach(e => hideURLBool &= e[1])

        // If url <div.card.url> has no tag <span>s in activeTagIDs, hide card column (so other cards shift into its position)
        if (hideURLBool) { $(urlList[i]).parent().hide(); }
        // If tag reactivated, show URL
        else { $(urlList[i]).parent().show(); }
    }
}

// Build LH panel tag list in selectedUTub
function buildTagDeck(dictTags) {
    let html = '<label for="selectAll"><input id="selectAll" type="checkbox" name="selectAll" checked> Select All </label>';

    // Alpha sort tags based on tag_string
    dictTags.sort(function (a, b) {
        const tagA = a.tag_string.toUpperCase(); // ignore upper and lowercase
        const tagB = b.tag_string.toUpperCase(); // ignore upper and lowercase
        if (tagA < tagB) {
            return -1;
        }
        if (tagA > tagB) {
            return 1;
        }

        // tags must be equal
        return 0;
    });

    if (dictTags) {
        // Loop through all tags and provide checkbox input for filtering
        for (let i in dictTags) {
            let tagText = dictTags[i].tag_string;
            let tagID = dictTags[i].id;
            html += '<label for="' + tagText + '" tagid=' + tagID + '><input class="tagCheckbox" type="checkbox" name="' + tagText + '" checked> ' + tagText + ' </label>';
        }
    } else {
        html += '<h5>No Tags Applied to any URLs in this UTub</h5>'     // No tags in UTub
    }
    $('#listTags')[0].innerHTML = html
}

// Creates option dropdown menu of users in RH UTub information panel
function gatherUsers(dictUsers, creator) {
    html = '<option disabled selected value> -- Select a User -- </option>';
    for (let i in dictUsers) {
        let user = dictUsers[i];
        if (user.id == creator) {
            $('#UTubOwner')[0].innerHTML = user.username;
        } else {
            html += '<option value=' + user.id + '>' + user.username + '</option>'
        }
    }
    $('#UTubUsers')[0].innerHTML = html;
}

function selectURL(selectedURLid) {
    // Need to implement URL description display in card when selected
    // Find notes for selected URL
    // $('#URLInfo')[0].innerHTML = selectedURL.notes;
    let selectedUTubID = findUTubID();

    // Update hrefs
    $('#addTags').attr("href", "/add_tag/" + selectedUTubID + "/" + selectedURLid);
    $('#EditURL').attr("onclick", "editURL(" + selectedUTubID + "," + selectedURLid + ")");
    $('#DeleteURL').attr("href", "/delete_url/" + selectedUTubID + "/" + selectedURLid);
}

function resetUTubs() {
    // Reset tag deck
    tags = [];

    // Empty URL description
    $('#URLInfo')[0].innerHTML = '';

    // Empty TagsDeck
    $('#listTags')[0].innerHTML = '';
    tagsObj = {};

    // Update hrefs
    $('#addTags').attr("href", "#");
    $('#EditURL').attr("href", "#");
    $('#DeleteURL').attr("href", "#");
}

function accessLink() {
    if (!selectedURL.url_string.startsWith('https://')) {
        window.open('https://' + selectedURL.url_string, "_blank");
    } else {
        window.open(selectedURL.url_string, "_blank");
    }
}

function editURL(selectedUTubID, selectedURLid) {
    var URLli = "li[urlid=" + selectedURLid + "]";   // Find URL HTML with selected ID
    var liHTML = $(URLli).html().split('<span');     // Store pre-edit values
    var URLString = liHTML[0];
    var tags = liHTML.slice(1);
    tags = tags.map(i => '<span' + i)
    var tagString = liHTML.slice(1).map(i => '<span' + i).join('');

    $(URLli).html('');                               // Clear li
    $('<input></input>').attr({                      // Replace with temporary input
        'type': 'text',
        'id': 'edit_url',
        'urlid': selectedURLid,
        'size': '30',
        'value': URLString
    }).appendTo($(URLli));
    $(URLli).html($(URLli).html() + tagString);
    $('#edit_url').focus();

    $(document).on("blur", '#edit_url', function () {
        var urlText = $(this).val();
        var selectedURLid = $(this).attr('urlid');
        let request = $.ajax({
            type: 'post',
            url: "/edit_url/" + selectedUTubID + "/" + selectedURLid
        });
        console.log($('#edit_url'))
        request.done(function (response, textStatus, xhr) {
            if (xhr.status == 200) {
            }
        }
        )
    });
}

function openModal(formRoute) {
    console.log(formRoute)
    $.get(formRoute, function (formHtml) {
        $('#Modal .modal-content').html(formHtml);
        $('#Modal').modal('show');
    })
}