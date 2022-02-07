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
        let $handle = $('<div></div>').css('position', 'absolute');
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
            let total_space = is_vertical ? getHeight($this) : getWidth($this);

            let panestack = {};
            panestack.total_scale = 0;

            //Work out the scales
            $this.contents().each(function(){
                $child = $(this);

                if($child.hasClass(options.resizeHandleClass)) return; //Ignore resize handles

                if(!$child.hasClass(options.paneClass)) {
                    this.parentElement.removeChild(this);
                    return;
                }
                let scale = this.dataset.scale ? Number(this.dataset.scale) : 1;
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
                        $pane.append($handle);
                    }

                    if(!is_last){
                        let $handle = getHandle('bottom', options.resizeHandleWidth, options.resizeHandleClass);
                        $pane.append($handle);
                    }
                }
                else{
                    let width = total_space * (this.dataset.scale / panestack.total_scale);
                    width = Math.floor(width * 10) / 10;
                    $pane.css('width', pixels(width));
                    $pane.css('float', 'left');

                    if(!is_first){
                        let $handle = getHandle('left', options.resizeHandleWidth, options.resizeHandleClass);
                        $pane.append($handle);
                    }

                    if(!is_last){
                        let $handle = getHandle('right', options.resizeHandleWidth, options.resizeHandleClass);
                        $pane.append($handle);
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
