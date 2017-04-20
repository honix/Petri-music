
// petri-music.js
// petri-net + music

const nodeSize = 60,
      strokeW = 11,
      bg = 200,
      noteStep = 20

// notes

function hertzByNote(note) {
  return Math.pow(Math.pow(2,1/12), note-49) * 440
}

function hertzByPixel(pixel) {
  var pixel = 500 + pixel * -1
  return hertzByNote(Math.floor(pixel/noteStep)+20)
}


// objects

function newNode(x, y, value) {
  var env = new p5.Env()
  env.setADSR(0.01, 0.2, 0.5, 0.3)
  env.setRange(1.0, 0)

  var osc = new p5.Oscillator('triangle')
  osc.amp(env)
  osc.start()
  osc.freq(hertzByPixel(y))

  return {x: x, y: y, value: value || 0, tempValue: 0,
          env: env, osc: osc, sound: true}
}

function newGate(x, y, ins, outs, offset) {
  return {x: x, y: y, offset: offset || 30, triggered: false,
          ins: ins || [], outs: outs || []}
}

function newWave(x, y) {
  return {x: x, y: y, flate: nodeSize}
}


// saving

function saveState() {
  var state = 'nodes=['
  for(var i in nodes){
    var n = nodes[i]
    state += 'newNode(' + n.x +','+ n.y +','+ n.value + ')'
    state += ','
  }

  state += '];\ngates=['
  for(var i in gates){
    var n = gates[i]
    state += 'newGate(' + n.x +','+ n.y +',['
    for(var i in n.ins) {
      state += 'nodes[' + nodes.indexOf(n.ins[i]) + ']'
      state += ','
    }
    state += '],['
    for(var i in n.outs) {
      state += 'nodes[' + nodes.indexOf(n.outs[i]) + ']'
      state += ','
    }
    state += '],' + n.offset + ')'
    state += ','
  }
  state += '];'
  return state
}


//

function setup() {
  w = windowWidth
  h = windowHeight
  canvas = createCanvas(w, h)
  canvas.mousePressed(canvasMousePressed)
  strokeWeight(strokeW)
  fill(bg)

  time = performance.now()
  prevTime = time
  delta = 0.0
  frame = 0
  wire = false
  nodes = []
  waves = []
  gates = []
  // ui
  menu = {node: {x: width/2 - 50, y: 50},
          gate: {x: width/2 + 50, y: 50}}
  playButton = createButton('⏸');
  playButton.play = true
  playButton.position(20, 20);
  playButton.mousePressed(playButtonPress);
  clearButton = createButton('new');
  clearButton.style("font-size", "80%")
  clearButton.position(20, 75);
  clearButton.mousePressed(clearButtonPress);
  nodeDiv = createDiv('node settings')
  nodeDiv.position(80, 20);
  soundCheckbox = createCheckbox('sound', true);
  soundCheckbox.position(80, 40);
  soundCheckbox.changed(soundCheckboxChanged);
  // tepmorary
  template()
}


// events

function windowResized() {
  w = windowWidth
  h = windowHeight
  menu.node.x = width/2 - 50
  menu.gate.x = width/2 + 50
  resizeCanvas(w, h)
}

function playButtonPress() {
  if (playButton.play) {
    playButton.play = false
    playButton.elt.innerText = '▶'
    for(var n in nodes){
      nodes[n].value = min(max(nodes[n].value + nodes[n].tempValue, 0), 12)
      nodes[n].tempValue = 0
    }
  } else {
    playButton.play = true
    playButton.elt.innerText = '⏸'
  }
}

function clearButtonPress() {
  nodes = []
  gates = []
}

function soundCheckboxChanged() {
  if (soundCheckbox.checked())
    select.sound = true
  else
    select.sound = false
}

function mouseWheel(event) {
  var d = (event.delta > 0 ? -1 : 1)
  if (select = selector(nodes))
    select.value = max(0, select.value + d)
  else if (select = selector(gates))
    select.offset = max(min(59, select.offset - d*2), 0)
}

function canvasMousePressed() {
  if (select = (selector(nodes) || selector(gates))) {
    soundCheckbox.elt.firstChild.checked = select.sound
    if (select.x+25 < mouseX)
      wire = true
    return
  }
  else if (select = selector(menu)){
    if (select == menu.node){
      var n = newNode(menu.node.x, menu.node.y)
      n.px = select.px
      n.py = select.py
      nodes.push(n)
      select = n
    }
    else if (select == menu.gate){
      var g = newGate(menu.gate.x, menu.gate.y)
      g.px = select.px
      g.py = select.py
      gates.push(g)
      select = g
    }
  }
}

function mouseDragged() {
  if (select && !wire) {
    select.x = mouseX + select.px
    select.y = mouseY + select.py
  }
}

function mouseReleased() {
  if (select && !wire && select.env){
    select.osc.freq(hertzByPixel(select.y))
    makeSound(select)
  }
  if (wire) {
    wire = false
    var target
    if (target = selector(nodes)){
      if (!select.outs.includes(target)) select.outs.push(target)
    }
    else if (target = selector(gates)) {
      if (!target.ins.includes(select) && !select.ins) target.ins.push(select)
    }
  }
}


function keyPressed() {
  if (keyCode === DELETE && select) {
    removeObject(select)
    select = false
  }
}


// node functions

function makeSound(node) {
  if (node.sound) {
    node.env.play()
    waves.push(newWave(node.x, node.y))
  }
}


// selecting

function pointInsideNode(x, y, node) {
  var a = createVector(x, y),
      b = createVector(node.x, node.y)
  return a.dist(b) < nodeSize / 1.3
}

function selector(kind) {
  for(var n in kind){
    if (pointInsideNode(mouseX, mouseY, kind[n])) {
      var select = kind[n]
      select.px = select.x - mouseX
      select.py = select.y - mouseY
      return select
    }
  }
  return false
}


//

function removeObject(obj) {
  if (obj.ins) gates.splice(gates.indexOf(select),1)
  else {
    for(var g in gates){
      var ins = gates[g].ins
      var outs = gates[g].outs
      if (ins.includes(obj)) ins.splice(ins.indexOf(obj),1)
      if (outs.includes(obj)) outs.splice(outs.indexOf(obj),1)
    }
    nodes.splice(nodes.indexOf(select),1)
  }
}


// drawing

function drawNode(node) {
  triangle(node.x+35, node.y-5,
           node.x+40, node.y,
           node.x+35, node.y+5)
  ellipse(node.x, node.y, nodeSize, nodeSize)
  if (node.sound) {
    stroke(0,100,255)
    point(node.x-10, node.y-35)
    stroke(0)
  }
  if (node.value == 1)
    point(node.x, node.y)
  else {
    for(i = 0; i<node.value; i++){
      var rad = i / node.value * 2 * PI
      point(node.x + sin(rad) * nodeSize/5,
            node.y + cos(rad) * nodeSize/5)
    }
  }
}

function drawGate(gate) {
  strokeWeight(strokeW/2)
  noFill()
  for(var i in gate.ins)
    bezier(gate.ins[i].x+40, gate.ins[i].y,
           gate.ins[i].x + 100, gate.ins[i].y,
           gate.x - 100, gate.y,
           gate.x, gate.y)
  for(var i in gate.outs){
    if (gate.outs[i].x > gate.x)
      bezier(gate.x+30, gate.y,
             gate.x + 100, gate.y,
             gate.outs[i].x - 100, gate.outs[i].y,
             gate.outs[i].x, gate.outs[i].y)
    else {
      var vert = gate.outs[i].y > gate.y ? 150 : -150
      bezier(gate.x+30, gate.y,
             gate.x + 250, gate.y + vert,
             gate.outs[i].x - 250, gate.outs[i].y + vert,
             gate.outs[i].x, gate.outs[i].y)
    }
  }
  strokeWeight(strokeW)
  fill(200)
  triangle(gate.x+20, gate.y-5,
           gate.x+25, gate.y,
           gate.x+20, gate.y+5)
  rect(gate.x-15, gate.y-35, 30, 70)
  var oy = gate.y + gate.offset/60*70 - 35,
      ty = gate.y + frame%60/60*70 - 35
  stroke(0,100,255)
  line(gate.x-10, oy, gate.x+10, oy)
  stroke(255,100,0)
  strokeWeight(4)
  line(gate.x-10, ty, gate.x+10, ty)
  stroke(0)
  strokeWeight(strokeW)
}

function drawType(ar, drawFunc) {
    for(var g in ar){
      if (ar[g] == select) {
        stroke(0,0,150)
        drawFunc(ar[g])
        stroke(0,0,0)
      } else {
        drawFunc(ar[g])
      }
  }
}

function drawWaves() {
  for(var w in waves){
    if (waves[w].flate > nodeSize*2) {
      waves.splice(w, 1)
      continue
    }
    stroke(0,100,255,(nodeSize*2-waves[w].flate)/nodeSize*2*255)
    ellipse(waves[w].x, waves[w].y, waves[w].flate, waves[w].flate)
    waves[w].flate++
  }
}

function draw() {

  // update
  if (playButton.play) {
    prevTime = time
    time = performance.now()
    delta = time - prevTime
    prevFrame = frame
    frame += delta/16
  }

  for(var g in gates){
    if (!gates[g].triggered && (frame % 60 >= gates[g].offset)) {
      gates[g].triggered = true
      var i = gates[g].ins
      if (i.length && i.every(x => x.value)){
        i.forEach(x => x.tempValue--)
        for(var o in gates[g].outs){
          gates[g].outs[o].tempValue++
          makeSound(gates[g].outs[o])
        }
      }
    }
  }

  if (frame % 60 < prevFrame % 60) {
    for(var g in gates){
      gates[g].triggered = false
    }
    for(var n in nodes){
      nodes[n].value = min(max(nodes[n].value + nodes[n].tempValue, 0), 12)
      nodes[n].tempValue = 0
    }
  }

  // draw
  background(bg)

  strokeWeight(1)
  stroke(bg-25)
  fill(bg-25)
  for(y=0, n=1; y<height; y+=noteStep, n++){
    var note = n%12
    if (note == 1 || note == 3 || note == 6 || note == 8 || note == 10)
      rect(0, y, width, noteStep)
    line(0, y, width, y)
  }

  noFill()
  strokeWeight(strokeW)
  drawWaves()

  stroke(0)
  fill(200)
  drawType(gates, drawGate)
  drawType(nodes, drawNode)

  stroke(150,50,0)
  drawNode(menu.node)
  drawGate(menu.gate)
  stroke(0,0,0)

  if (wire) {
    strokeWeight(strokeW/2)
    line(select.x+30, select.y, mouseX, mouseY)
  }
}
