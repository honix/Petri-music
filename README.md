# Petri-music

Dive in to - https://honix.github.io/Petri-music/index.html

Theoretical part - https://en.wikipedia.org/wiki/Petri_net

### Message
There is circles, boxes and links. I call those nodes, gates and wires.

Node can hold integer value (markers) and they make sounds when marker is coming. Vertical position of node defines note. Background is showing piano scheme.

Gates (boxes with rhythm bar) has inputs and outputs. If all input nodes has more or one markers, then gate decrement them and increment values of output nodes. Incrementing produces sound.

You can connect node with gate or gate with node. No more no less.

### Controls 
* Create node (circle) - drag orange node down
* Create gate (box) - drag orange box down
* Connect - drag from right side triangle and release mouse at target object
* Delete selected object - Delete keyboard button
* Increment/Decrement nodes value - hover and mousewheel
* Increment/Decrement boxes time offset - hover and mousewheel
