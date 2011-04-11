var debug           = 1;
var start           = 2;
var fresh_entries   = [];
var last_load_id    = 0;
var last_visible_id = 0;

$(document).ready
(
    function()
    {
        $('#errordismiss').click
        (
            function()
            {
                $('#error').fadeOut
                (
                    'slow',
                    function()
                    {
                        $('BODY > DIV').not('#error').css('visibility', 'visible');
                    }
                );
            }
        );

        $('#loginbutton').click( function() { load_dash(1); } );

        $('#markread').click(mark_all_read);
        $('#refreshrate').change
        (
            function()
            {
                $.cookie('bolderdash_tumblr_refresh_freq',
                            $('#refreshrate').val(),
                            { expires: 365 });
                load_dash(0);
            }
        );

        $('.noticemoreposts').live
        (
                'click',
                function()
                {
                    mark_all_read();
                    $('html, body').animate({scrollTop:0}, 'slow');
                    hide_preview();
                    show_new_entries();
                }
        );

        $('.photothumb, .posttexttitle').live
        (
            'click',
            function()
            {
                if( $(this).data('id') == $('#preview').data('id') )
                    return;

                $('#post' + $(this).data('id')).find('.postnew').hide();

                $('#preview').data('id', $(this).data('id'));

                $('#previewfooter').html('');
                $('#previewheader').html('');
                $('#previewtext').html('');
                $('#previewtext').addClass('previewtext' + $(this).data('type'));

                var post = $(this);

                ['header', 'footer', 'text', 'photo'].forEach
                (
                    function(section)
                    {
                        $('#preview'+section).hide();

                        if( ! $(post).data(section) )
                            return;

                        if( section == 'photo' )
                            $('#previewphoto').attr('src', $(post).data('photo'));
                        else
                        {
                            content = $(post).data(section);
                            if( section == 'header' && $(post).data('link') )
                                content = $(post).data('link') + content;
                            $('#preview'+section).html(content);
                        }

                        $('#preview'+section).show();
                    }
                );

                show_preview.call($(this));
            }
        );
    }
);

//------------------------------------------------------------------------------
function show_preview()
{
    var entrytop = $(this).offset().top;
    //dbg('top of entry = ' + entrytop);
    $('#previewcallout').hide();
    $('#preview').hide();
    $('#previewcallout').css('margin-top', entrytop - 110);
    $('#preview').css('margin-top', entrytop - 140);
    $('#previewcallout').delay(200).fadeIn(200);
    $('#preview').delay(200).fadeIn(200);
}

//------------------------------------------------------------------------------
function hide_preview()
{
    $('#previewcallout').hide();
    $('#preview').hide();
}

//------------------------------------------------------------------------------
function load_dash(is_first)
{
    dbg("Refreshing...");

    var login = $('#login').val();
    var password = $('#password').val();

    if( login == '' || login.indexOf('@') == -1 || password == '' )
    {
        show_error("Can't do much without a legitimate login or password. Sorry.");
        return;
    }

    set_notice_class_html('noticeupdating', 'Checking for new...');

    $.post(                                                                                                             
        "tumblr.php",
        { action: 'getdash', user: login, password: password, start: start, num: 50 },
        function(data, stat)
        {
            if( (data = check_ajax_return(data, stat)) == false )
            {
                set_notice_class_html('', 'last check failed');
            }
            else
            {
                add_entries(data, is_first);

                $('#notice').removeClass('noticeupdating');

                if( is_first )
                {
                    $.cookie('bolderdash_tumblr_login', login, { expires: 365 });
                    $('#loginform').hide();
                    $('#dashboard').fadeIn();
                    $('#dashactions').show();
                    $('#notice').show();
                    show_new_entries();
                    $('#preview').fadeIn(200);
                } 
                else
                {
                    if( fresh_entries.length > 0 )
                        set_notice_class_html('noticemoreposts', 'See ' + fresh_entries.length + ' more');
                    else
                        set_notice_class_html('', 'No new posts');
                }
            }

            if( load_dash.curtimer != 'undefined' )
                clearTimeout(load_dash.curtimer);
            dbg("Refreshing in " + ($('#refreshrate').val() * 1000));
            load_dash.curtimer = setTimeout(load_dash, $('#refreshrate').val() * 1000);
        }
    );

    start -= 4;
}

//------------------------------------------------------------------------------
function set_notice_class_html(classname, html)
{
    $('#notice').removeClass();
    if( classname != '' )
        $('#notice').addClass(classname);
    $('#notice').html(html);
}

//------------------------------------------------------------------------------
function add_entries(entries, is_first)
{
    eval(entries);
    dbg(tumblr_api_read);
    var caughtup    = 0;
    var numposts    = tumblr_api_read.posts.length - 1;

    for( var i = numposts; i >= 0; i-- )
    {
        var post    = tumblr_api_read.posts[i];

        dbg("Got post with slug " + post.slug + " id " + post.id);

        // for the first page load (when a user signs in to our page, we want to
        // show some historical entries as well, even if they have been read in
        // a previous session. see FIRST_LOAD comment below.
        if( ! is_first && post.id <= last_load_id )
        {
            dbg("Seen this one already (last loaded id = " + last_load_id + ")");
            continue;
        }

        last_load_id = post.id;

        reblogged   = 0;
        if( post['reblogged-root-name'] )
        {
            reblogged = 1;
            var rootuser    = post['reblogged-root-name'];
            var rootavatar  = post.reblogged_root_avatar_url_64;
            var proxuser    = post.tumblelog.name;
            var proxavatar  = post.tumblelog.avatar_url_30;
        }
        else
        {
            var rootuser    = post.tumblelog.name;
            var rootavatar  = post.tumblelog.avatar_url_64;
        }

        var entry = $('#entrytemplate').clone().removeAttr('id');
        $(entry).attr('id', 'post'+post.id);
        $(entry).data('id', post.id);
        $(entry).addClass('dashentryout');

        // for the first page load (when a user signs in to our page, we want to
        // show some historical entries as well, even if they have been read in
        // a previous session. see FIRST_LOAD comment above.
        if( is_first && post.id <= last_load_id )
            $(entry).removeClass('dashentrynew');

        $(entry).find('.rootavatar').attr('src', rootavatar);
        $(entry).find('.rootavatar').attr('alt', rootuser);
        $(entry).find('.rootavatar').attr('title', rootuser);

        if( reblogged )
        {
            $(entry).find('.proximalavatar').attr('src', proxavatar);
            $(entry).find('.proximalavatar').attr('alt', proxuser);
            $(entry).find('.proximalavatar').attr('title', proxuser);
            //$(entry).find('.proximalavatar').fadeIn(2000);
            $(entry).find('.proximalavatar').css('display', 'block');
        }

        //$(entry).find('.poststuff').addClass('type' + post.type);
        $(entry).find('.posttype').attr('src', 'images/'+post.type+'.png');
        $(entry).find('.tumblrlink').attr('href', post.url);

        var title   = "";
        var body    = "";

        if( post.type == 'photo' )
        {
            $(entry).find('.photothumb IMG').attr('src', post['photo-url-75']);
            $(entry).find('.posttext').css('width', '200px');
            body = post['photo-caption'];
            $(entry).find('.photothumb').data('id', post.id);
            $(entry).find('.photothumb').data('type', post.type);
            $(entry).find('.photothumb').data('photo', post['photo-url-400']);
            $(entry).find('.photothumb').data('footer', post['photo-caption']);
            $(entry).find('.photothumb').css('display', 'block');
        }
        else
        {
            if( post.type == 'quote' )
            {
                title   = post['quote-source'];
                body    = post['quote-text'];
            }
            else if( post.type == 'regular' )
            {
                title   = post['regular-title'];
                body    = post['regular-body'];
            }
            else if( post.type == 'link' )
            {
                title   = post['link-text'];
                body    = post['link-description'];
                link    = '<a class="previewlink" href="' + post['link-url'] +
                            '"><img src="images/rtarrow.png" alt="&raquo;" /></a>';
                $(entry).find('.posttexttitle').data('link', link);
            }
            else if( post.type == 'video' )
            {
                title   = post['video-caption'];
                body    = post['video-player'];
            }
            else if( post.type == 'answer' )
            {
                title   = post.question;
                body    = post.answer;
            }

            if( post.type == 'quote' || post.type == 'video' )
                $(entry).find('.posttexttitle').data('footer', title);
            else
                $(entry).find('.posttexttitle').data('header', title);
            $(entry).find('.posttexttitle').data('text', body);

            $(entry).find('.posttexttitle').data('id', post.id);
            $(entry).find('.posttexttitle').data('type', post.type);

            $(entry).find('.posttexttitle').html(strip_and_shorten(title));
            $(entry).find('.posttexttitle').css('display', 'block');
        }

        if( post.type != 'video' )
            $(entry).find('.posttextbody').html(strip_and_shorten(body));

        fresh_entries.push(entry);
    }
}

//------------------------------------------------------------------------------
function show_new_entries()
{
    console.log("Unhiding " + fresh_entries.length + " new entries...");
    var num_entries = fresh_entries.length;
    while( fresh_entries.length > 0 )
    {
        var entry = fresh_entries.shift();
        last_visible_id = $(entry).data('id');
        $(entry).prependTo('#dashentries');
        $(entry).hide().delay(200*(num_entries-fresh_entries.length)).fadeIn(1000);
    }
    set_notice_class_html('', 'Loaded ' + num_entries + ' posts');
}

//------------------------------------------------------------------------------
function mark_all_read()
{
    $.cookie('bolderdash_tumblr_last_read_id', last_visible_id, { expires: 365 });
    $('.postnew').hide();
}

//------------------------------------------------------------------------------
function strip_and_shorten(str)
{
    var newstr = $('<p>' + str + '</p>').text(); // strip all tags
    if( newstr.length > 127 )
        newstr = newstr.substr(0, 127) + "...";
    return(newstr);
}

//------------------------------------------------------------------------------
function check_ajax_return(response, stat)
{
    try
    {
        var respobj = JSON.parse(response);
    }
    catch(e)
    {
        var respbody = $('<html>'+response+'</html>').filter('body');
        show_error("Failed to parse response:" + strip_and_shorten(respbody) + "<br/>You should reload the page.");
        return(false);
    }

    if( respobj.debug && window.console )
        dbg(respobj.debug);

    if( respobj.status == 0 )
    {
        show_error(strip_and_shorten(respobj.data));
        return(false);
    }

    if( respobj.data )
        return(respobj.data);
    else
        return(true);
}

//------------------------------------------------------------------------------
function show_error(msg)
{
    $('BODY > DIV').not('#error').css('visibility', 'hidden');
    $('#errormsg').html(msg);
    $('#error').fadeIn('slow');
}

//------------------------------------------------------------------------------
function dbg(thing)
{
    if( ! debug )
        return;
    if( window.console ) console.log(thing);
}

