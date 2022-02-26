# Panestack JS
JQuery plugin to create and manage stacks or groups of panes

## Usage
A panestack is a group of panes. It is either vertical or horizontal. Panes in a vertical panestack resize vertically and those in a horizontal panestack resize horizontally. To create a panestack just use **.panestack()** as below.

##### HTML
    <div class="pane-container" style="height:500px">
            <div class="pane">
                Left
            </div>
            <div class="pane pane-container vertical">
                <div class="pane">
                    Center Top
                </div>
                <div class="pane">
                    Middle
                </div>
                <div class="pane">
                    Center Bottom
                </div>
            </div>
            <div class="pane">
                Right
            </div>
        </div>


##### Javascript

    $( '.pane-container' ).panestack( options )

## Options

#### .paneClass ####
*default = 'pane'*

Class used to specify an element (usually a div) as a pane. Direct children of panestacks must have this class, otherwise they will be automatically removed.

#### .verticalClass ####
*default = 'vertical'*

Class used to specify a panestack's orientation as vertical.

## Support
You are probably doing better than me at the moment. Please donate if you like the idea or find the library useful. Bitcoin ID: bc1qnk6hwxu725elt6tptmk4w9akht77amf43ewekh