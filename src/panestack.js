'use strict';

(function($){
    function trimObj(obj){
        if(typeof obj !== 'object') return obj;

        let _obj = {};
        for(let i in obj){
            if(typeof obj[i] === 'boolean' || obj[i]) _obj[i] = obj[i];
        }
        return _obj;
    }

    //Simple helper function to append px
    function pixels(n){
        return n + 'px';
    }

    function getHeight($obj){
        return parseFloat($obj.css('height')) - parseFloat($obj.css('border-top-width')) - parseFloat($obj.css('border-bottom-width')) - parseFloat($obj.css('padding-top')) - parseFloat($obj.css('padding-bottom'));
    }

    function getWidth($obj){
        return parseFloat($obj.css('width')) - parseFloat($obj.css('border-left-width')) - parseFloat($obj.css('border-right-width')) - parseFloat($obj.css('padding-left')) - parseFloat($obj.css('padding-right'));
    }

    function getHandle(side, width, css_class){
        let $handle = $('<div></div>').css('position', 'absolute').css('background-color', 'transparent');
        if(css_class) $handle.addClass(css_class);
        if(!side) return $handle;
        side = side.toLowerCase();

        if(side == 'top' || side == 'bottom'){
            $handle.css('left', '0px').css('width', '100%').css(side, '0px').css('height', width).css('cursor', 'row-resize');
        }
        else if(side == 'left' || side == 'right'){
            $handle.css('top', '0px').css('bottom', '0px').css(side, '0px').css('width', width).css('cursor', 'col-resize');
        }

        return $handle;
    }

    function verticalResize(e){
        e.preventDefault();
        e.stopImmediatePropagation();

        var delta = e.pageY - e.data.y;
        if(delta > 0){
            e.data.$right.css('height', pixels(e.data.rightHeight - delta));
            e.data.$left.css('height', pixels(e.data.leftHeight + delta));
        }
        else if(delta < 0){
            e.data.$left.css('height', pixels(e.data.leftHeight + delta));
            e.data.$right.css('height', pixels(e.data.rightHeight - delta));
        }

        return false;
    }

    function horizontalResize(e){
        e.preventDefault();
        e.stopImmediatePropagation();

        var delta = e.pageX - e.data.x;

        if(delta > 0){
            e.data.$right.css('width', pixels(e.data.rightWidth - delta));
            e.data.$left.css('width', pixels(e.data.leftWidth + delta));
        }
        else if(delta < 0){
            e.data.$left.css('width', pixels(e.data.leftWidth + delta));
            e.data.$right.css('width', pixels(e.data.rightWidth - delta));
        }

        return false;
    }

    function bindHandle($leftPane, $resizeHandle, $rightPane){
        $resizeHandle.data('_ps_leftpane', $leftPane);
        $resizeHandle.data('_ps_rightpane', $rightPane);

        $resizeHandle.on('mousedown', function(e){
            var $this = $(this);
            var $panestack = $this.parent().parent();

            $panestack.on('mouseup.panestack_mouse mouseleave.panestack_mouse', function(e){
                $(this).off('.panestack_mouse');
            });

            var data = {
                orientation: $panestack.data('_ps_orientation'),
                $left: $this.data('_ps_leftpane'),
                $right: $this.data('_ps_rightpane'),
                x: e.pageX,
                y: e.pageY
            }

            if(data.orientation == 'vertical'){
                data.leftHeight = parseFloat(data.$left.css('height'));
                data.rightHeight = parseFloat(data.$right.css('height'));
                $panestack.on('mousemove.panestack_mouse', data, verticalResize);
            }
            else{
                data.leftWidth = parseFloat(data.$left.css('width'));
                data.rightWidth = parseFloat(data.$right.css('width'));
                $panestack.on('mousemove.panestack_mouse', data, horizontalResize);
            }
        });
    }

    let defaultOptions = {
        paneClass: 'pane',
        verticalClass: 'vertical',
        resizeHandleClass: 'pane-resize-handle',
        resizeHandleWidth: 3,
        dividerColor: '#ddd'
    }

    $.fn.panestack = function(options){
        options = $.extend({}, defaultOptions, trimObj(options));
        if(typeof options.resizeHandleWidth !== 'number' || options.resizeHandleWidth <= 0 || options.resizeHandleWidth >= 10) options.resizeHandleWidth = 3;

        this.each(function(){
            let $this = $(this);
            $this.css('box-sizing', 'border-box');

            let is_vertical = $this.hasClass(options.verticalClass);

            if(is_vertical) $this.data('_ps_orientation', 'vertical');
            else $this.data('_ps_orientation', 'horizontal');

            let total_space = is_vertical ? getHeight($this) : getWidth($this);

            let panestack = {};
            panestack.total_scale = 0;

            //Work out the scales
            $this.contents().each(function(){
                var $child = $(this);

                if($child.hasClass(options.resizeHandleClass)) return; //Ignore resize handles

                if(!$child.hasClass(options.paneClass)) {
                    this.parentElement.removeChild(this);
                    return;
                }
                var scale = this.dataset.scale ? Number(this.dataset.scale) : 1;
                if(isNaN(scale)) scale = 1;

                this.dataset.scale = scale;

                panestack.total_scale += scale;
            });

            let $panes = $this.children('.' + options.paneClass);
            let lastChildIndex = $panes.length - 1;

            $panes.each(function(n){
                let $pane = $(this);
                $pane.css('box-sizing', 'border-box');
                $pane.css('position', 'relative');
                $pane.css('margin', '0px');

                let is_first = n == 0;
                let is_last = n == lastChildIndex;

                if(is_vertical){
                    let height = total_space * (this.dataset.scale / panestack.total_scale);
                    height = Math.floor(height * 10) / 10;
                    $pane.css('width', '100%');
                    $pane.css('height', pixels(height));
                    $pane.css('float', 'none');

                    if(!is_first){
                        let $handle = getHandle('top', options.resizeHandleWidth, options.resizeHandleClass);
                        $handle.css('border-top', $pane.css('border-top'));
                        $pane.css('border-top', 'none');
                        $pane.append($handle);
                        bindHandle($($panes[n - 1]), $handle, $pane);
                    }

                    if(!is_last){
                        let $handle = getHandle('bottom', options.resizeHandleWidth, options.resizeHandleClass);
                        $handle.css('border-bottom', $pane.css('border-bottom'));
                        $pane.css('border-bottom', 'none');
                        $pane.append($handle);
                        bindHandle($pane, $handle, $($panes[n + 1]));
                    }
                }
                else{
                    let width = total_space * (this.dataset.scale / panestack.total_scale);
                    width = Math.floor(width * 10) / 10;
                    $pane.css('width', pixels(width));
                    $pane.css('float', 'left');

                    if(!is_first){
                        let $handle = getHandle('left', options.resizeHandleWidth, options.resizeHandleClass);
                        $handle.css('border-left', $pane.css('border-left'));
                        $pane.css('border-left', 'none');
                        $pane.append($handle);
                        bindHandle($($panes[n - 1]), $handle, $pane);
                    }

                    if(!is_last){
                        let $handle = getHandle('right', options.resizeHandleWidth, options.resizeHandleClass);
                        $handle.css('border-right', $pane.css('border-right'));
                        $pane.css('border-right', 'none');
                        $pane.append($handle);
                        bindHandle($pane, $handle, $($panes[n + 1]));
                    }
                }
            });

            let height = getHeight($this);

            $panes.each(function(){
                if(!is_vertical){
                    $(this).css('height', pixels(height));
                }
            });
        });

        if(!this.setOrientation) this.setOrientation = setOrientation;

        return this;
    }

    function setOrientation(){
        return this;
    }
})(jQuery);
