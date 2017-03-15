# Farsight
JavaScript viewport framework - enables you cool scrolling animations and much more.

## Architecture
Much like WOWJS this script will enable you to activate Animate.css or custom css animations while you scroll. But unlike WOWJS you are able to create parallax effects, reading through paragraphs percentage information and many more by utilizing two powerful classes that expand the expected functionality. Using farsight.Viewport you are able to know how far you scrolled the content, both vertically and horizontally, if you reached the end of the content or if you are scrolling up or down, left or right. You are able to tune to scrolling and resize events and receive the calculated variables. You can connect farsight.ActiveElements to the farsight.Viewport and know which DOM element is visible and what percentage of it's size it is displayed in the Viewport, so you can either activate an animation or shift the opacity or the position of that element via a callback depending how far is it into the Viewport. Farsight works not only with the window as the viewport, but you can initialize multiple instances on different scrollable content.

### farsight.Viewport class
On each resize and scroll it calculates the position of the viewport relative to the scrollable content. Default viewport is the window and default "pane" is the body DOM element.
### farsight.ActiveElement class
Needs to be connected to the Viewport in order to calculate DOM elements position relative to the viewport.
### Farsight class
Is the body of default usage of this script and initializes a farsight instance of the Viewport and binds all the selected elements as ActiveElements to the Viewport's events. It parses all the selected element's attributes in order to automatize the process. 
