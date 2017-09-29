import React, { Component } from 'react';

let scroll;
let startX = 0;
let startY = 0;

let origX = 0;
let origY = 0;
let deltaX = 0;
let deltaY = 0;
let thisMount = null;

// let finalPosLeft = 0;
// let finalPosTop = 0;

class MovementModule extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {
    // revert the touch event to mousedown event for mobile
    const mouseEventTypes = {
      touchstart: 'mousedown',
      touchmove: 'mousemove',
      touchend: 'mouseup',
    };
    // for (const originalType in mouseEventTypes) { 
    for (let i = 0; i < mouseEventTypes.length; i++) {
      // document.addEventListener(originalType, (originalEvent) => {
      document.addEventListener(mouseEventTypes[i], (originalEvent) => {
        const event = document.createEvent('MouseEvents');
        const touch = originalEvent.changedTouches[0];
        event.initMouseEvent(
          mouseEventTypes[originalEvent.type],
          true, true, window, 0,
          touch.screenX, touch.screenY, touch.clientX, touch.clientY,
          touch.ctrlKey, touch.altKey, touch.shiftKey, touch.metaKey,
          0, null);
        originalEvent.target.dispatchEvent(event);
      });
    }
  }

  onDrag = (e) => {
    document.ontouchmove = (event) => {
      event.preventDefault();
    };

    scroll = this.getScrollOffsets();
    startX = e.clientX + scroll.x;
    startY = e.clientY + scroll.y;

    origX = thisMount.offsetLeft;
    origY = thisMount.offsetTop;
    deltaX = startX - origX;
    deltaY = startY - origY;

    document.addEventListener('mousemove', this.moveHandler, true);
    document.addEventListener('mouseup', this.upHandler, true);

    if (document.addEventListener) {
      document.addEventListener('mousemove', this.moveHandler, true);
      document.addEventListener('mouseup', this.upHandler, true);
    } else if (document.attachEvent) {
      thisMount.setCapture();
      thisMount.attachEvent('onmousemove', this.moveHandler);
      thisMount.attachEvent('onmouseup', this.upHandler);
      thisMount.attachEvent('onlosecapture', this.upHandler);
    }

    if (e.preventDefault) e.preventDefault();
    else e.returnValue = false;
  }

  getScrollOffsets = () => {
    const w = window;
    // w = w || window;
    if (w.pageXOffset != null) return { x: w.pageXOffset, y: w.pageYOffset };
    const d = w.document;
    if (document.compatMode === 'CSS1Compat') {
      return { x: d.documentElement.scrollLeft, y: d.documentElement.scrollTop };
    }

    return { x: d.body.scrollLeft, y: d.body.scrollTop };
  }

  moveHandler = (e) => {
    // if (!e) e = window.event;
    scroll = this.getScrollOffsets();
    thisMount.style.left = `${(e.clientX + scroll.x) - deltaX}px`;
    thisMount.style.top = `${(e.clientY + scroll.y) - deltaY}px`;
  }

  upHandler = (e) => {
    // if (!e) e = window.event;
    if (document.removeEventListener) {
      document.removeEventListener('mouseup', this.upHandler, true);
      document.removeEventListener('mousemove', this.moveHandler, true);
    } else if (document.detachEvnet) {
      thisMount.detachEvent('onlosecapture', this.upHandler);
      thisMount.detachEvent('onmouseup', this.upHandler);
      thisMount.detachEvent('onmousemove', this.moveHandler);
    }

    if (e.stopPropagation) e.stopPropagation();
    else e.cancelBubble = true;
  }

  youtubeParser = (url) => {
    let match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
  }

  render() {
    const { title, titleColor, titleHeight } = this.props;
    const { url, width, height } = this.props;
    const styles = {
      titleStyles: {
        height: titleHeight+'px',
        cursor: 'move',
        backgroundColor: titleColor,
        textAlign: 'center',
        lineHeight: titleHeight+'px',
      },
      iframeStyles: {
        'width': width+'px',
        'height': height+'px'
      }
    }

    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const embed_url = 'https://www.youtube.com/embed/' + url.match(regExp)[7];

    return (
      <div>
        <div ref={(div) => { thisMount = div; }} onMouseDown={this.onDrag} style={{ position: 'absolute' }}>
          <div style={styles.titleStyles}>
            <span>{title}</span>
          </div>
          <div className="embed-responsive embed-responsive-16by9">
            <iframe
              style={styles.iframeStyles}
              title="embed"
              className="embed-responsive-item"
              src={embed_url}
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    );
  }
}

export default MovementModule;
