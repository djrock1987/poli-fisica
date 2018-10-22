// Interferenz zweier Kreis- oder Kugelwellen
// Java-Applet (22.05.1999) umgewandelt
// 27.12.2014 - 06.03.2016

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel interference_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorWaveLow = "#c0c0c0";                              // Farbe für Wellental
var colorWaveHigh = "#000000";                             // Farbe für Wellenberg
var color1 = "#ff0000";                                    // Farbe für Maximum
var	color2 = "#0000ff";                                    // Farbe für Minimum
var colorPoint = "#ff00ff";                                // Farbe für betrachteten Punkt

// Sonstige Konstanten:

var height0 = 300;                                         // Höhe der Zeichenfläche ohne Textbereich (Pixel)
var FONT1 = "normal normal bold 12px sans-serif";          // Zeichensatz
var PI2 = 2*Math.PI;                                       // Abkürzung für 2 pi
var pix = 10;                                              // Umrechnungsfaktor (Pixel pro cm)
var T = 5;                                                 // Schwingungsdauer (s)

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var bu;                                                    // Schaltknopf (Pause/Weiter)
var cbSlow;                                                // Optionsfeld (Zeitlupe)
var ipD, ipWL;                                             // Eingabefelder
var iFix;                                                  // Gespeichertes Bild
var active;                                                // Flag für Zugmodus
var on;                                                    // Flag für Bewegung
var slow;                                                  // Flag für Zeitlupe
var t0;                                                    // Anfangszeitpunkt
var t;                                                     // Aktuelle Zeit (s)
var timer;                                                 // Timer für Animation
var xM, yM;                                                // Koordinaten des Mittelpunkts (Pixel)
var dC;                                                    // Entfernung der Zentren (cm)
var lambda, lambdaPix;                                     // Wellenlänge (cm bzw. Pixel)
var xC1, xC2, yC;                                          // Koordinaten der Wellenzentren (Pixel)
var nCircles;                                              // Zahl der Kreise
var xP, yP;                                                // Koordinaten des Bezugspunkts (Pixel)    
var ds;                                                    // Gangunterschied (Pixel)

// Element der Schaltfläche (aus HTML-Datei):
// id ..... ID im HTML-Befehl
// text ... Text (optional)

function getElement (id, text) {
  var e = document.getElementById(id);                     // Element
  if (text) e.innerHTML = text;                            // Text festlegen, falls definiert
  return e;                                                // Rückgabewert
  } 

// Start:

function start () {
  canvas = getElement("cv");                               // Zeichenfläche
  width = canvas.width; height = canvas.height;            // Abmessungen (Pixel)
  ctx = canvas.getContext("2d");                           // Grafikkontext
  bu = getElement("bu",text01[0]);                         // Schaltknopf (Pause/Weiter)
  bu.state = 0;                                            // Anfangszustand
  cbSlow = getElement("cbSlow");                           // Optionsfeld (Zeitlupe)
  cbSlow.checked = slow = false;                           // Zeitlupe zunächst abgeschaltet
  getElement("lbSlow",text02);                             // Erklärender Text (Zeitlupe)
  getElement("ipDa",text03);                               // Erklärender Text (Entfernung)
  getElement("ipDb",text04);                               // Erklärender Text, Fortsetzung (Entfernung)
  ipD = getElement("ipDc");                                // Eingabefeld (Entfernung)
  getElement("ipDd",centimeter);                           // Einheit (Entfernung)
  getElement("ipWa",text05);                               // Erklärender Text (Wellenlänge)
  ipWL = getElement("ipWb");                               // Eingabefeld (Wellenlänge)
  getElement("ipWc",centimeter);                           // Einheit (Wellenlänge)
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // Übersetzer
  
  t = 0;                                                   // Zeitvariable (s)  
  xM = width/2; yM = height0/2;                            // Koordinaten des Mittelpunkts (Pixel)
  yC = yM;                                                 // y-Koordinate der Wellenzentren (Pixel)
  dC = 10;                                                 // Startwert für Entfernung der Wellenzentren (cm) 
  lambda = 4;                                              // Startwert für Wellenlänge (cm)
  xP = xM; yP = yM-50;                                     // Anfangsposition des Bezugspunkts (Pixel) 
  ds = 0;                                                  // Startwert für Gangunterschied
  active = false;                                          // Zugmodus zunächst deaktiviert
  updateInput();                                           // Eingabefelder aktualisieren 
  calculation(); calcDiff();                               // Berechnungen
  paintFix();                                              // Gleichbleibender Teil der Grafik
  startAnimation();                                        // Animation starten
  bu.onclick = reactionButton;                             // Reaktion auf Schaltknopf (Pause/Weiter)
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld (Zeitlupe)
  ipD.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabefeld Entfernung)
  ipWL.onkeydown = reactionEnter;                          // Reaktion auf Enter-Taste (Eingabefeld Wellenlänge)
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Drücken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Berührung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Berührung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers    
  } // Ende der Methode start
  
// Reaktion auf Drücken der Maustaste:
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen (Auswahl)                    
  }
  
// Reaktion auf Berührung:
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Berührpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen (Auswahl)
  if (active) e.preventDefault();                          // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Loslassen der Maustaste:
  
function reactionMouseUp (e) {   
  active = false;                                          // Zugmodus deaktivieren                             
  }
  
// Reaktion auf Ende der Berührung:
  
function reactionTouchEnd (e) { 
  active = false;                                          // Zugmodus deaktivieren
  }
  
// Reaktion auf Bewegen der Maus:
  
function reactionMouseMove (e) {            
  if (!active) return;                                     // Abbrechen, falls Zugmodus nicht aktiviert
  reactionMove(e.clientX,e.clientY);                       // Position ermitteln, rechnen und neu zeichnen
  }
  
// Reaktion auf Bewegung des Fingers:
  
function reactionTouchMove (e) {            
  if (!active) return;                                     // Abbrechen, falls Zugmodus nicht aktiviert
  var obj = e.changedTouches[0];                           // Liste der neuen Fingerpositionen     
  reactionMove(obj.clientX,obj.clientY);                   // Position ermitteln, rechnen und neu zeichnen
  e.preventDefault();                                      // Standardverhalten verhindern                          
  } 
  
// Hilfsroutine: Reaktion auf Mausklick oder Berühren mit dem Finger
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt active

function reactionDown (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche
  var dx = u-xP, dy = v-yP;                                // Koordinatendifferenzen (Pixel)
  if (dx*dx+dy*dy < 100) active = true;                    // Falls Position nahe am Bezugspunkt, Zugmodus aktivieren 
  } 
  
// Hilfsroutine: Reaktion auf Bewegen der Maus oder des Fingers
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt active 

function reactionMove (u, v) {
  if (!active) return;                                     // Abbruch, falls Zugmodus nicht aktiviert
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel) 
  if (u > width || v > height0) return;                    // Abbruch, falls Position außerhalb der Zeichnung
  xP = u; yP = v;                                          // Position des Bezugspunkts aktualisieren
  calcDiff();                                              // Phasendifferenz aktualisieren
  if (!on) paint();                                        // Falls Animation nicht läuft, neu zeichnen
  }
  
// Zustandsfestlegung für Schaltknopf Pause/Weiter:
  
function setButtonState (st) {
  bu.state = st;                                           // Zustand speichern
  bu.innerHTML = text01[st];                               // Text aktualisieren
  }
  
// Umschalten des Schaltknopfs Pause/Weiter:
  
function switchButton () {
  var st = bu.state;                                       // Momentaner Zustand (0 oder 1)
  setButtonState(1-st);                                    // Neuen Zustand speichern, Text ändern
  }
    
// Reaktion auf den Schaltknopf Pause/Weiter:
// Seiteneffekt on, timer, t0, dC, lambda, xC1, xC2, lambdaPix, nCircles, ds

function reactionButton () {
  switchButton();                                          // Zustand des Schaltknopfs ändern
  if (bu.state == 0) startAnimation();                     // Entweder Animation fortsetzen ...
  else stopAnimation();                                    // ... oder stoppen
  reaction();                                              // Eingegebene Werte übernehmen und rechnen
  }
  
// Reaktion auf Optionsfeld Zeitlupe:
// Seiteneffekt slow

function reactionSlow () {
  slow = cbSlow.checked;                                   // Flag setzen
  }
  
// Hilfsroutine: Eingabe übernehmen und rechnen
// Seiteneffekt dC, lambda, xC1, xC2, lambdaPix, nCircles, ds, iFix 

function reaction () {
  input();                                                 // Eingegebene Werte übernehmen (eventuell korrigiert)
  calculation();                                           // Berechnungen
  calcDiff();                                              // Berechnung der Phasendifferenz
  paintFix();                                              // Gleichbleibender Teil der Grafik
  if (!on) paint();                                        // Falls Animation nicht läuft, neu zeichnen
  }
  
// Reaktion auf Tastendruck (nur auf Enter-Taste):
// Seiteneffekt dC, lambda, xC1, xC2, lambdaPix, nCircles, ds, iBG, t
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten übernehmen und rechnen                          
  //if (!on) paint();                                        // Falls Animation nicht läuft, neu zeichnen
  }
 
// Animation starten oder fortsetzen:
// Seiteneffekt on, timer, t0

function startAnimation () {
  on = true;                                               // Animation angeschaltet
  timer = setInterval(paint,40);                           // Timer mit Intervall 0,040 s aktivieren
  t0 = new Date();                                         // Neuer Anfangszeitpunkt 
  }
  
// Animation stoppen:
// Seiteneffekt on, timer

function stopAnimation () {
  on = false;                                              // Animation abgeschaltet
  clearInterval(timer);                                    // Timer deaktivieren
  }

//-------------------------------------------------------------------------------------------------

// Berechnungen:
// Seiteneffekt xC1, xC2, lambdaPix, nCircles

function calculation () {
  var d0 = pix*dC/2;                                       // Halber Abstand der Wellenzentren (Pixel)
  xC1 = xM-d0; xC2 = xM+d0;                                // x-Koordinaten der Wellenzentren (Pixel)
  lambdaPix = lambda*pix;                                  // Wellenlänge (Pixel)
  var dx = width/2+d0;                                     // Maximale Differenz der x-Koordinaten (Wellenzentrum/Bezugspunkt)
  var dy = height0/2;                                      // Maximale Differenz der y-Koordinaten (Wellenzentrum/Bezugspunkt)
  nCircles = Math.ceil(Math.sqrt(dx*dx+dy*dy)/lambdaPix);  // Zahl der zu zeichnenden Kreise
  }
  
// Berechnung des Gangunterschieds:
// Seiteneffekt ds

function calcDiff () {
  var dx1 = xP-xC1;                                        // Differenz der x-Koordinaten (linkes Wellenzentrum, Pixel) 
  var dx2 = xP-xC2;                                        // Differenz der x-Koordinaten (rechtes Wellenzentrum, Pixel)
  var dy = yP-yC;                                          // Differenz der y-Koordinaten (Pixel)
  var s1 = Math.sqrt(dx1*dx1+dy*dy);                       // Abstand des Bezugspunkts vom linken Wellenzentrum (Pixel)
  var s2 = Math.sqrt(dx2*dx2+dy*dy);                       // Abstand des Bezugspunkts vom rechten Wellenzentrum (Pixel)
  ds = Math.abs(s1-s2);                                    // Gangunterschied (Pixel)
  }
  
// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag für Nachkommastellen (im Gegensatz zu gültigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }
  
// Eingabe einer Zahl
// ef .... Eingabefeld
// d ..... Zahl der Stellen
// fix ... Flag für Nachkommastellen (im Gegensatz zu gültigen Ziffern)
// min ... Minimum des erlaubten Bereichs
// max ... Maximum des erlaubten Bereichs
// Rückgabewert: Zahl oder NaN
  
function inputNumber (ef, d, fix, min, max) {
  var s = ef.value;                                        // Zeichenkette im Eingabefeld
  s = s.replace(",",".");                                  // Eventuell Komma in Punkt umwandeln
  var n = Number(s);                                       // Umwandlung in Zahl, falls möglich
  if (isNaN(n)) n = 0;                                     // Sinnlose Eingaben als 0 interpretieren 
  if (n < min) n = min;                                    // Falls Zahl zu klein, korrigieren
  if (n > max) n = max;                                    // Falls Zahl zu groß, korrigieren
  ef.value = ToString(n,d,fix);                            // Eingabefeld eventuell korrigieren
  return n;                                                // Rückgabewert
  }
   
// Gesamte Eingabe:
// Seiteneffekt dC, lambda

function input () {
  dC = inputNumber(ipD,1,true,5,30);                       // Entfernung der Wellenzentren (cm) 
  lambda = inputNumber(ipWL,1,true,2,20);                  // Wellenlänge (cm)
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ipD.value = ToString(dC,1,true);                         // Eingabefeld für Entfernung der Wellenzentren
  ipWL.value = ToString(lambda,1,true);                    // Eingabefeld für Wellenlänge
  }
   
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
  }
  
// Linie zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// c ........ Farbe (optional, Defaultwert schwarz)
// w ........ Liniendicke (optional, Defaultwert 1)

function line (x1, y1, x2, y2, c, w) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  if (c) ctx.strokeStyle = c;                              // Linienfarbe festlegen
  if (w) ctx.lineWidth = w;                                // Liniendicke festlegen
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Rechteck mit schwarzem Rand:
// (x,y) ... Koordinaten der Ecke links oben (Pixel)
// w ....... Breite (Pixel)
// h ....... Höhe (Pixel)
// c ....... Füllfarbe (optional)

function rectangle (x, y, w, h, c) {
  if (c) ctx.fillStyle = c;                                // Füllfarbe
  newPath();                                               // Neuer Pfad
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausfüllen
  ctx.strokeRect(x,y,w,h);                                 // Rand zeichnen
  }

// Kreis (ausgefüllt oder Rand):
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... Farbe
// f ....... Flag für ausgefüllten Kreis

function circle (x, y, r, c, f) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.arc(x,y,r,0,PI2,true);                               // Kreis vorbereiten
  if (f) {ctx.fillStyle = c; ctx.fill();}                  // Entweder ausgefüllter Kreis ...
  else {ctx.strokeStyle = c; ctx.stroke();}                // ... oder Kreisrand
  }
  
// Hyperbel (Näherung durch Polygonzug):
// diff ... Entfernungsdifferenz (doppelte reelle Halbachse, Pixel)
// c ...... Farbe

function hyperbola (diff, c) {
  var nHyp = 90;                                           // Zahl der Punkte pro Hyperbelast
  var dPhi = Math.PI/nHyp;                                 // Winkelabstand (Bogenmaß)
  var dcH = dC*pix/2;                                      // Halbe Entfernung der Wellenzentren (Pixel) 
  var a = diff/2;                                          // Reelle Halbachse (Pixel)
  var b = Math.sqrt(dcH*dcH-a*a);                          // Imaginäre Halbachse (Pixel)
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.strokeStyle = c;                                     // Linienfarbe übernehmen
  var x0 = a, y0 = 0;                                      // Anfangspunkt (rechts)
  for (var i=1; i<nHyp/2; i++) {                           // Für alle Punkte ...
    var phi = i*dPhi;                                      // Parameter (Bogenmaß)
    var x1 = a/Math.cos(phi);                              // x-Koordinate des neuen Punkts
    var y1 = b*Math.tan(phi);                              // y-Koordinate des neuen Punkts
    ctx.moveTo(xM+x0,yM+y0);                               // Punkt rechts unten
    ctx.lineTo(xM+x1,yM+y1);                               // Linie nach rechts unten
    ctx.moveTo(xM+x0,yM-y0);                               // Punkt rechts oben (Symmetrie!)
    ctx.lineTo(xM+x1,yM-y1);                               // Linie nach rechts oben (Symmetrie!)
    ctx.moveTo(xM-x0,yM+y0);                               // Punkt links unten (Symmetrie!)
    ctx.lineTo(xM-x1,yM+y1);                               // Linie nach links unten (Symmetrie!)
    ctx.moveTo(xM-x0,yM-y0);                               // Punkt links oben (Symmetrie!)
    ctx.lineTo(xM-x1,yM-y1);                               // Linie nach links oben (Symmetrie!)
    x0 = x1; y0 = y1;                                      // Neue Koordinaten als alte Koordinaten übernehmen
    }
  ctx.stroke();                                            // Hyperbel zeichnen
  }
  
// Grafik, gleichbleibender Teil:

function paintFix () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen                  
  line(xM,0,xM,height0,color1);                            // Mittelsenkrechte
  for (var i=1; i<=dC/lambda; i++)                         // Hyperbeln für konstruktive Interferenz
    hyperbola(i*lambdaPix,color1);
  for (var i=0; i+0.5<=dC/lambda; i++)                     // Hyperbeln für destruktive Interferenz 
    hyperbola((i+0.5)*lambdaPix,color2);
  iFix = ctx.getImageData(0,0,width,height);               // Bild speichern
  }
      
// Grafik, veränderlicher Teil:

function paintVar () {
  var nConstr = t/T;                                       // Hilfsgröße für konstruktive Interferenz 
  var n0 = Math.floor(nConstr); nConstr -= n0;             // Ganzzahligen Anteil subtrahieren
  var nDestr = t/T+0.5;                                    // Hilfsgröße für destruktive Interferenz
  n0 = Math.floor(nDestr); nDestr -= n0;                   // Ganzzahligen Anteil subtrahieren
  for (var i=0; i<nCircles; i++) {                         // Für alle Wellentäler ...
    var r = (nDestr+i)*lambdaPix;                          // Radius (Pixel) 
    circle(xC1,yC,r,colorWaveLow,false);                   // Kreis um linkes Zentrum (Wellental)
    circle(xC2,yC,r,colorWaveLow,false);                   // Kreis um rechtes Zentrum (Wellental)
    }
  for (var i=0; i<nCircles; i++) {                         // Für alle Wellenberge ...             
    var r = (nConstr+i)*lambdaPix;                         // Radius (Pixel) 
    circle(xC1,yC,r,colorWaveHigh,false);                  // Kreis um linkes Zentrum (Wellenberg)              
    circle(xC2,yC,r,colorWaveHigh,false);                  // Kreis um rechtes Zentrum (Wellenberg)
    }
  circle(xP,yP,2.5,colorPoint,true);                       // Kreis für Bezugspunkt
  line(xP,yP,xC1,yC,colorPoint);                           // Linke Verbindungsstrecke
  line(xP,yP,xC2,yC,colorPoint);                           // Rechte Verbindungsstrecke  
  circle(xC1,yC,2.5,"#000000",true);                       // Linkes Wellenzentrum
  circle(xC2,yC,2.5,"#000000",true);                       // Rechtes Wellenzentrum  
  rectangle(0,height0,width,height-height0,colorBackground); // Bereich für Zahlenangaben löschen
  ctx.textAlign = "left";                                  // Textausrichtung linksbündig
  ctx.fillStyle = "#000000";                               // Schriftfarbe schwarz
  var lStr = ctx.measureText(text07).width;                // Platzbedarf (Pixel)
  lStr = Math.max(lStr,ctx.measureText(text08).width);
  lStr = Math.max(lStr,ctx.measureText(text06).width);
  lStr += 60;
  var xText = (width-lStr)/2;                              // Position für Textbeginn
  var xDeltaS = xText+lStr/2;                              // Position für Delta s    
  ctx.fillText(text06,xText,325);                          // Text (Gangunterschied)
  lStr = ctx.measureText(text06).width;                    // Platzbedarf (Gangunterschied, Pixel)
  xDeltaS = Math.max(xDeltaS,xText+lStr+20);               // Position für Zahlenwert des Gangunterschieds
  var str = symbolPhaseDifference+" = ";                   // Beginn der Zeichenkette für den Gangunterschied
  str += ToString(ds/lambdaPix,1,true);                    // Zahlenwert hinzufügen
  str += " "+symbolWavelength;                             // Leerzeichen und Lambda hinzufügen
  ctx.fillText(str,xDeltaS+15,325);                        // Zeichenkette ausgeben
  var ds10 = Math.round(10*ds/lambdaPix);                  // Hilfsgröße
  if (ds10%10 == 0) {                                      // Falls konstruktive Interferenz ...
    ctx.fillStyle = color1;                                // ... Farbe für Maximum
    ctx.fillText(text07,xText,345);                        // ... Text (konstruktive Interferenz, Amplitude maximal)
    }
  if (ds10%10 == 5) {                                      // Falls destruktive Interferenz ...
    ctx.fillStyle = color2;                                // ... Farbe für Minimum
    ctx.fillText(text08,xText,345);                        // ... Text (destruktive Interferenz, Amplitude minimal)
    }
  }

// Grafikausgabe:
// Seiteneffekt t  
  
function paint () {
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // ... Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // ... Länge des Zeitintervalls (s)
    if (slow) dt /= 5;                                     // ... Falls Zeitlupe, Zeitintervall durch 5 dividieren
    t += dt;                                               // ... Zeitvariable aktualisieren
    t0 = t1;                                               // ... Neuer Anfangszeitpunkt
    }
  ctx.font = FONT1;                                        // Zeichensatz
  ctx.putImageData(iFix,0,0);                              // Gespeicherte Grafik übertragen
  paintVar();                                              // Veränderlichen Teil der Grafik zeichnen
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen




