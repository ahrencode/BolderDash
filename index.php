<html>

<head>

<title>bolderbash</title>

<link rel='stylesheet' type='text/css' href='style.css' />
<link href='http://fonts.googleapis.com/css?family=Syncopate' rel='stylesheet' type='text/css'>

<script type='text/javascript' src='jquery.min.js'></script>
<script type='text/javascript' src='main.js'></script>
<script type='text/javascript' src='jquery.cookie.js'></script>

<base target='_blank' />

</head>

<body>

<div id='header'>

    <img align='left' src='images/logo2.png' alt='' style='margin: 5px 0px 0px 0px; width: 128px;' />

    <div id='title'>bolderdash</div>

    <div id='dashactions'>
        <img id='markread' src='images/markread.png' alt='Mark Read' title='Mark All Read'
            align='absmiddle' />
        Refresh every:
        <select id='refreshrate' name='refreshrate'>
        <?php
            $savedfreq = $_COOKIE['bolderdash_tumblr_refresh_freq'] or $freq = 30;
            foreach( array(30, 60, 300, 900, 1800, 3600) as $freq )
            {
                $seltxt = ($freq == $savedfreq) ? "selected='selected'" : "";
                print "<option value='$freq' $seltxt>$freq seconds</option>\n";
            }
        ?>
        </select>
    </div>

    <div style='clear: both;'></div>

</div>

<div id='loginform'>
<div id='loginformin'>

    <form>

        <div class='loginfield'>
            <input type='text' id='login' name='login'
                value='<?php isset($_COOKIE['bolderdash_tumblr_login']) ?
                            print $_COOKIE['bolderdash_tumblr_login'] : print ''; ?>'
            />
            <br />
            Your Tumblr Login (Email Address)
        </div>
        <div class='loginfield'>
            <input type='password' id='password' name='password' /><br />
            Your Tumblr Password
        </div>

        <input id='loginbutton' class='button' type='button' value='Get Your Dashboard' />

        <div id='logindisclaimer'>
            I do not save your password anywhere. Period.<br />
            [ <a href='http://l.ravi.be/dCBEqC'>Hey! This is insecure!</a> ]
        </div>

    </form>

</div>
</div>

<div id='notice'></div>

<div id='dashboard'>
    <div id='dashentries'></div>
    <div id='previewcallout' class="callout"></div>
    <div id='preview'>
        <div id='previewheader'></div>
        <center><img id='previewphoto' src='' alt='' /></center>
        <div id='previewtext'>
            <div style='height: 150px; padding: 50px 30px; font-size: 13pt; color: #444444; line-height: 140%; text-align: center;'>
                Click on a title or photo thumbnail to the right to see a preview of the post here
            </div>
        </div>
        <div id='previewfooter'></div>
    </div>
    <div style='clear: both;'></div>
</div>

<div id='entrytemplate'>
    <div class="dashentry dashentrynew">
        <div class="postauthor">
            <img class='rootavatar' src="" alt="" />
            <img class='proximalavatar' src="" alt="" />
        </div>
        <div class="callout"></div>
        <div class="poststuff">
            <div class='postmeta'>
                <img class='posttype' align='middle' src='' alt='' />
                <a class='tumblrlink' href=''><img src='images/tumblr.png' alt='Original'
                    title='View post in Tumblr' /></a>
                </div>
            <div class='posttext'>
                <div class='posttexttitle'></div>
                <div class='posttextbody'></div>
            </div>
            <div class='photothumb'><img align='middle' src='' alt='' /></div>
        </div>
    </div>
    <div style='float: left; margin-left: -35px; margin-top: 45px; padding-top: 0px;'>
        <img class='postnew' width=60 src='images/new6.png' alt='' />
    </div>
    <div style="clear: both;"></div>
</div>

<div id='error'>

    <h2>Problems, Mate</h2>

    <div id='errormsg'>
    </div>

    <div id='errordismiss'>
        DISMISS
    </div>

</div>

</body>

</html>

