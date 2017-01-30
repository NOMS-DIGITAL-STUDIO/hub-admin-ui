/* global $ */
/* global GOVUK */


$(document).ready(function () {
    // Use GOV.UK selection-buttons.js to set selected
    // and focused states for block labels
    var $blockLabels = $(".block-label input[type='radio'], .block-label input[type='checkbox']");
    new GOVUK.SelectionButtons($blockLabels); // eslint-disable-line

    // Use GOV.UK shim-links-with-button-role.js to trigger a link styled to look like a button,
    // with role="button" when the space key is pressed.
    GOVUK.shimLinksWithButtonRole.init();

    // Show and hide toggled content
    // Where .block-label uses the data-target attribute
    // to toggle hidden content
    var showHideContent = new GOVUK.ShowHideContent();
    showHideContent.init();


    // Reset Dynamic display elements
    $('#uploadSuccess').hide();
    $('#uploadFailure').hide();

    $('form').ajaxForm(function (data, status, ajaxObject) {

        //  alert('status: ' + status);
        //  alert('ajaxObject: ' + ajaxObject);

        if (ajaxObject.status === 201) {
            $('#uploadSuccess').show();
            $('#uploadSuccessNotes').html(data.filename + " - '" + data.title + "' - uploaded at " + data.timestamp).show();
        } else {
            $('#uploadFailure').show();
        }

        $('form').resetForm();
    });
});


// todo handle form post manually
// $(function () {
//     $('#upload').on('click', function () {
//
//         //alert('pressed upload');
//
//         // Execute POST to /api/upload
//
//         // Handle response
//     });
// });
