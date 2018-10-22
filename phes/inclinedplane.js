// Kräfte an der schiefen Ebene
// Java-Applet (24.02.1999) umgewandelt
// 28.09.2015 - 01.10.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel inclinedplane_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorPlane = "#ffc800";                                // Farbe für schiefe Ebene
var colorBlock = "#ffffff";                                // Farbe für Block
var colorSpringscale = "#8080ff";                          // Farbe für Gehäuse der Federwaage
var colorScale1 = "#ff0000";                               // Erste Farbe für Skala der Federwaage
var colorScale2 = "#ffffff";                               // Zweite Farbe für Skala der Federwaage
var colorWeight = "#ff00ff";                               // Farbe für Gewichtskraft
var colorParallel = "#0000ff";                             // Farbe für Hangabtriebskraft
var colorNormal1 = "#ff0000";                              // Farbe für Normalkraft
var colorNormal2 = "#c08040";                              // Farbe für Gegenkraft zur Normalkraft
var colorFriction = "#000000";                             // Farbe für Reibungskraft
var colorForce = "#008000";                                // Farbe für Zugkraft

// Sonstige Konstanten:

var DEG = Math.PI/180;                                     // 1 Grad (Bogenmaß)
var R = 5;                                                 // Federwaage, Außenradius Griff (Pixel)
var A1 = 45;                                               // Federwaage, Länge Gehäuse (Pixel)
var R1 = 5;                                                // Federwaage, Radius Gehäuse (Pixel)
var A2 = 4;                                                // Federwaage, Länge Feld (Pixel)
var R2 = 3;                                                // Federwaage, Radius Skala (Pixel)
var A3 = 4;                                                // Federwaage, gerader Teil Haken (Pixel)
var R3 = 3;                                                // Federwaage, Radius Haken (Pixel)

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var bu1, bu2;                                              // Schaltknöpfe (Reset, Start/Pause/Weiter)
var cbSlow;                                                // Optionsfeld (Zeitlupe)
var rb1, rb2;                                              // Radiobuttons
var ip1, ip2, ip3;                                         // Eingabefelder
var op1, op2, op3, op4;                                    // Ausgabefelder
var on;                                                    // Flag für Animation
var t;                                                     // Zeitvariable (s)
var timer;                                                 // Timer für Animation
var xM, yM;                                                // Position des Mittelpunkts (Pixel)
var alpha;                                                 // Neigungswinkel (Bogenmaß)
var fG;                                                    // Gewichtskraft (Newton)
var my;                                                    // Reibungszahl
var sin, cos;                                              // Trigonometrische Werte von alpha
var fH;                                                    // Hangabtriebskraft (N)
var fN;                                                    // Normalkraft (N)
var fR;                                                    // Reibungskraft (N)
var f;                                                     // Nötige Zugkraft (N)
var sFW;                                                   // Relative Position der Federwaage
var sBl;                                                   // Relative Position des Blocks
var polyPlane;                                             // Polygon für die schiefe Ebene
var polyBlock;                                             // Polygon für den Block
var poly0, poly1;                                          // Polygone für Federwaage
var v1x, v1y;                                              // Vektor für Federwaagen-Gehäuse (Längsrichtung, Pixel)
var v2x, v2y;                                              // Vektor für Federwaagen-Gehäuse (Querrichtung, Pixel)
var w1x, w2y;                                              // Vektor für Federwaagen-Feld (Längsrichtung, Pixel)
var w2x, w2y;                                              // Vektor für Federwaagen-Feld (Querrichtung, Pixel)
var dyFG;                                                  // Pfeillänge Gewichtskraft (Pixel)
var dxFH, dyFH;                                            // Komponenten Hangabtriebskraft (Pixel)
var dxFN, dyFN;                                            // Komponenten Normalkraft (Pixel)
var dxF, dyF;                                              // Komponenten Zugkraft (Pixel)

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
  bu1 = getElement("bu1",text01);                          // Resetknopf
  bu2 = getElement("bu2",text02[0]);                       // Startknopf
  bu2.state = 0;                                           // Zustand vor dem Start
  cbSlow = getElement("cbSlow");                           // Optionsfeld (Zeitlupe)
  cbSlow.checked = false;                                  // Zeitlupe zunächst abgeschaltet
  getElement("lbSlow",text03);                             // Erklärender Text (Zeitlupe)
  rb1 = getElement("rb1");                                 // Radiobutton (Federwaage)
  rb1.checked = true;                                      // Radiobutton ausgewählt
  getElement("lb1",text04);                                // Erklärender Text (Federwaage)
  rb2 = getElement("rb2");                                 // Radiobutton (Kraftvektoren)
  getElement("lb2",text05);                                // Erklärender Text (Kraftvektoren)
  getElement("ip1a",text06);                               // Erklärender Text (Neigungswinkel)
  ip1 = getElement("ip1b");                                // Eingabefeld (Neigungswinkel)
  getElement("ip1c",degree);                               // Einheit (Neigungswinkel)
  getElement("ip2a",text07);                               // Erklärender Text (Gewichtskraft)
  ip2 = getElement("ip2b");                                // Eingabefeld (Gewichtskraft)
  getElement("ip2c",newton);                               // Einheit (Gewichtskraft)
  getElement("op1a",text08);                               // Erklärender Text (Hangabtriebskraft)
  op1 = getElement("op1b");                                // Ausgabefeld (Hangabtriebskraft)
  getElement("op1c",newton);                               // Einheit (Hangabtriebskraft)
  getElement("op2a",text09);                               // Erklärender Text (Normalkraft)
  op2 = getElement("op2b");                                // Ausgabefeld (Normalkraft)
  getElement("op2c",newton);                               // Einheit (Normalkraft)
  getElement("ip3a",text10);                               // Erklärender Text (Reibungszahl)
  ip3 = getElement("ip3b");                                // Eingabefeld (Reibungszahl)
  getElement("op3a",text11);                               // Erklärender Text (Reibungskraft)
  op3 = getElement("op3b");                                // Ausgabefeld (Reibungskraft)
  getElement("op3c",newton);                               // Einheit (Reibungskraft)
  getElement("op4a",text12);                               // Erklärender Text (Zugkraft)
  op4 = getElement("op4b");                                // Ausgabefeld (Zugkraft)
  getElement("op4c",newton);                               // Einheit (Zugkraft)
  getElement("author",author);                             // Autor (und Übersetzer)
  
  xM = yM = height/2;                                      // Position des Mittelpunkts (Pixel)
  polyPlane = new Array(4);                                // Polygon für schiefe Ebene
  polyBlock = new Array(4);                                // Polygon für Block
  poly0 = new Array(4);                                    // Polygon für Gehäuse der Federwaage
  poly1 = new Array(4);                                    // Polygon für Skala der Federwaage
  alpha = 25*DEG;                                          // Voreinstellung Neigungswinkel (Bogenmaß)
  fG = 5;                                                  // Voreinstellung Gewichtskraft (Newton)
  my = 0;                                                  // Voreinstellung Reibungszahl
  sBl = -0.15;                                             // Relative Position des Blocks
  sFw = 0.1;                                               // Relative Position der Federwaage  
  updateInput();                                           // Eingabefelder aktualisieren 
  calculation();                                           // Berechnungen (Seiteneffekt!)
  updateOutput();                                          // Ausgabefelder aktualisieren
  t = 0;                                                   // Zeitvariable
  paint();                                                 // Zeichnen   
  on = false;                                              // Animation zunächst abgeschaltet
  slow = false;                                            // Zeitlupe zunächst abgeschaltet
  bu1.onclick = reactionReset;                             // Reaktion auf Resetknopf
  bu2.onclick = reactionStart;                             // Reaktion auf Startknopf
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld Zeitlupe
  ip1.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Neigungswinkel)
  ip2.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Gewichtskraft)
  ip3.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Reibungszahl)
  rb1.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Federwaage)
  rb2.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Kraftvektoren)
      
  } // Ende der Methode start
  
// Zustandsfestlegung für Schaltknopf Start/Pause/Weiter:
// Seiteneffekt bu2
  
function setButton2State (st) {
  bu2.state = st;                                          // Zustand speichern
  bu2.innerHTML = text02[st];                              // Text aktualisieren
  }
  
// Umschalten des Schaltknopfs Start/Pause/Weiter:
// Seiteneffekt bu2
  
function switchButton2 () {
  var st = bu2.state;                                      // Momentaner Zustand
  if (st == 0) st = 1;                                     // Falls Ausgangszustand, starten
  else st = 3-st;                                          // Wechsel zwischen Animation und Unterbrechung
  setButton2State(st);                                     // Neuen Zustand speichern, Text ändern
  }
  
// Aktivierung bzw. Deaktivierung der Eingabefelder:
// p ... Flag für mögliche Eingabe

function enableInput (p) {
  ip1.readOnly = !p;                                       // Eingabefeld für Neigungswinkel
  ip2.readOnly = !p;                                       // Eingabefeld für Gewichtskraft
  ip3.readOnly = !p;                                       // Eingabefeld für Reibungszahl
  }
  
// Reaktion auf Resetknopf:
// Seiteneffekt bu2, on, timer, t, alpha, fG, my, sin, cos, fN, fH, fR, f, dyFG, dxFN, dyFN, dxFH,dyFH, dxF, dyF, polyPlane, 
// v1x, v1y, v2x, v2y, w1x, w1y, w2x, w2y, sFW, sBl
   
function reactionReset () {
  setButton2State(0);                                      // Zustand des Schaltknopfs Start/Pause/Weiter
  enableInput(true);                                       // Eingabefelder aktivieren
  stopAnimation();                                         // Animation abschalten
  t = 0;                                                   // Zeitvariable zurücksetzen
  reaction();                                              // Eingabe, Berechnungen, Ausgabe
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf den Schaltknopf Start/Pause/Weiter:
// Seiteneffekt bu2, on, timer, t0, alpha, fG, my, sin, cos, fN, fH, fR, f, dyFG, dxFN, dyFN, dxFH,dyFH, dxF, dyF, polyPlane, 
// v1x, v1y, v2x, v2y, w1x, w1y, w2x, w2y

function reactionStart () {
  switchButton2();                                         // Zustand des Schaltknopfs ändern
  enableInput(false);                                      // Eingabefelder deaktivieren
  if (bu2.state == 1) startAnimation();                    // Entweder Animation starten bzw. fortsetzen ...
  else stopAnimation();                                    // ... oder stoppen
  reaction();                                              // Eingabe, Berechnungen, Ausgabe
  }
  
// Reaktion auf Optionsfeld Zeitlupe:
// Seiteneffekt slow

function reactionSlow () {
  slow = cbSlow.checked;                                   // Flag setzen
  }
  
// Hilfsroutine: Eingabe, Berechnungen, Ausgabe
// Seiteneffekt alpha, fG, my, sin, cos, fN, fH, fR, f, dyFG, dxFN, dyFN, dxFH,dyFH, dxF, dyF, polyPlane, 
// v1x, v1y, v2x, v2y, w1x, w1y, w2x, w2y

function reaction () {
  input();                                                 // Eingegebene Werte übernehmen (eventuell korrigiert)
  calculation();                                           // Berechnungen
  updateOutput();                                          // Ausgabefelder aktualisieren
  }
  
// Reaktion auf Tastendruck (nur auf Enter-Taste):
// Seiteneffekt alpha, fG, my, sin, cos, fN, fH, fR, f, dyFG, dxFN, dyFN, dxFH,dyFH, dxF, dyF, polyPlane, 
// v1x, v1y, v2x, v2y, w1x, w1y, w2x, w2y, t, sFW, sBl  
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten übernehmen und rechnen                          
  paint();                                                 // Neu zeichnen
  }

// Reaktion auf Radiobutton:
// Seiteneffekt t, sFW, sBl

function reactionRadioButton () {
  if (!on) paint();                                        // Falls Animation nicht läuft, neu zeichnen
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
// Seiteneffekt sin, cos, fN, fH, fR, f, dyFG, dxFN, dyFN, dxFH,dyFH, dxF, dyF, polyPlane, v1x, v1y, v2x, v2y, w1x, w1y, w2x, w2y

function calculation () {
  var pix = 12;                                            // Pixel pro N                                  
  sin = Math.sin(alpha);                                   // Sinus des Neigungswinkels 
  cos = Math.cos(alpha);                                   // Cosinus des Neigungswinkels
  var tan = sin/cos;                                       // Tangens des Neigungswinkels
  fN = fG*cos;                                             // Normalkraft (N) 
  fH = fG*sin;                                             // Hangabtriebskraft (N)
  fR = my*fN;                                              // Reibungskraft (N) 
  f = fH+fR;                                               // Nötige Zugkraft (N)
  dyFG = pix*fG;                                           // Gewichtskraft (Pixel)
  dxFN = pix*fN*sin; dyFN = pix*fN*cos;                    // Komponenten der Normalkraft (Pixel)
  dxFH = pix*fH*cos; dyFH = pix*fH*sin;                    // Komponenten der Hangabtriebskraft (Pixel)
  dxF = pix*f*cos; dyF = pix*f*sin;                        // Komponenten der Zugkraft (Pixel)
  if (cos > 1e-10) {                                       // Falls Ebene nicht senkrecht ...
    var x = Math.max(0,xM-yM/tan);                         // x-Koordinate der Ecke links unten (Pixel)
    var y = Math.max(0,yM-yM*tan);                         // y-Koordinate der Ecke rechts oben (Pixel)
    polyPlane[0] = {u: x, v: height};                      // Ecke links unten
    polyPlane[1] = {u: height, v: height};                 // Ecke rechts unten   
    polyPlane[2] = {u: height, v: y};                      // Ecke rechts oben
    if (alpha > Math.PI/4) {                               // Falls Ebene steiler als 45° ...
      x = xM+yM/tan;                                       // x-Koordinate der Ecke links oben
      polyPlane[3] = {u: x, v: 0};                         // Ecke links oben
      }
    else {                                                 // Falls Ebene höchstens 45° steil ...
      y = yM+yM*tan;                                       // y-Koordinate der Ecke links oben
      polyPlane[3] = {u: 0, v: y};                         // Ecke links oben
      }
    }
  else {                                                  // Falls Ebene senkrecht ...
    polyPlane[0] = {u: xM, v: height};                    // Ecke links unten
    polyPlane[1] = {u: height, v: height};                // Ecke rechts unten
    polyPlane[2] = {u: height, v: 0};                     // Ecke rechts oben
    polyPlane[3] = {u: xM, v: 0};                         // Ecke links oben
    }
  v1x = -A1*cos; v1y = A1*sin;                             // Vektor für Federwaagen-Gehäuse (Längsrichtung, Pixel) 
  v2x = R1*sin; v2y = R1*cos;                              // Vektor für Federwaagen-Gehäuse (Querrichtung, Pixel)  
  w1x = -A2*cos; w1y = A2*sin;                             // Vektor für Federwaagen-Feld (Längsrichtung, Pixel) 
  w2x = R2*sin; w2y = R2*cos;                              // Vektor für Federwaagen-Feld (Querrichtung, Pixel)             
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
// Seiteneffekt alpha, fG, my

function input () {
  alpha = inputNumber(ip1,0,true,0,90)*DEG;                // Neigungswinkel (Bogenmaß)
  fG = inputNumber(ip2,1,true,0,10);                       // Gewichtskraft (N)
  my = inputNumber(ip3,2,true,0,0.5);                      // Reibungszahl
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ip1.value = ToString(alpha/DEG,0,true);                  // Neigungswinkel
  ip2.value = ToString(fG,1,true);                         // Gewichtskraft
  ip3.value = ToString(my,2,true);                         // Reibungszahl
  }
  
// Aktualisierung der Ausgabefelder:

function updateOutput () {
  op1.innerHTML = ToString(fH,1,true);                     // Hangabtriebskraft (N)
  op2.innerHTML = ToString(fN,1,true);                     // Normalkraft (N)
  op3.innerHTML = ToString(fR,1,true);                     // Reibungskraft (N)
  op4.innerHTML = ToString(f,1,true);                      // Zugkraft (N)
  }
   
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
  }

// Kreisscheibe mit schwarzem Rand:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... Füllfarbe (optional)

function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                // Füllfarbe
  newPath();                                               // Neuer Pfad
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  if (c) ctx.fill();                                       // Kreis ausfüllen, falls gewünscht
  ctx.stroke();                                            // Rand zeichnen
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
  
// Pfeil zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// w ........ Liniendicke (optional)
// Zu beachten: Die Farbe wird durch ctx.strokeStyle bestimmt.

function arrow (x1, y1, x2, y2, w) {
  if (!w) w = 1;                                           // Falls Liniendicke nicht definiert, Defaultwert                          
  var dx = x2-x1, dy = y2-y1;                              // Vektorkoordinaten
  var length = Math.sqrt(dx*dx+dy*dy);                     // Länge
  if (length == 0) return;                                 // Abbruch, falls Länge 0
  dx /= length; dy /= length;                              // Einheitsvektor
  var s = 2.5*w+7.5;                                       // Länge der Pfeilspitze 
  var xSp = x2-s*dx, ySp = y2-s*dy;                        // Hilfspunkt für Pfeilspitze         
  var h = 0.5*w+3.5;                                       // Halbe Breite der Pfeilspitze
  var xSp1 = xSp-h*dy, ySp1 = ySp+h*dx;                    // Ecke der Pfeilspitze
  var xSp2 = xSp+h*dy, ySp2 = ySp-h*dx;                    // Ecke der Pfeilspitze
  xSp = x2-0.6*s*dx; ySp = y2-0.6*s*dy;                    // Einspringende Ecke der Pfeilspitze
  ctx.beginPath();                                         // Neuer Pfad
  ctx.lineWidth = w;                                       // Liniendicke
  ctx.moveTo(x1,y1);                                       // Anfangspunkt
  if (length < 5) ctx.lineTo(x2,y2);                       // Falls kurzer Pfeil, weiter zum Endpunkt, ...
  else ctx.lineTo(xSp,ySp);                                // ... sonst weiter zur einspringenden Ecke
  ctx.stroke();                                            // Linie zeichnen
  if (length < 5) return;                                  // Falls kurzer Pfeil, keine Spitze
  ctx.beginPath();                                         // Neuer Pfad für Pfeilspitze
  ctx.fillStyle = ctx.strokeStyle;                         // Füllfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                                     // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                                   // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                                       // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                                   // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                                         // Zurück zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen 
  }
  
// Polygon zeichnen:
// p ... Array mit Koordinaten der Ecken
// c ... Füllfarbe

function drawPolygon (p, c) {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.lineWidth = 1;                                       // Liniendicke
  ctx.moveTo(p[0].u,p[0].v);                               // Zur ersten Ecke
  for (var i=1; i<p.length; i++)                           // Für alle weiteren Ecken ... 
    ctx.lineTo(p[i].u,p[i].v);                             // Linie zum Pfad hinzufügen
  ctx.closePath();                                         // Zurück zum Ausgangspunkt
  ctx.fill(); ctx.stroke();                                // Polygon ausfüllen und Rand zeichnen   
  }
  
// Block zeichnen:
// s ... Relative Position (m, Bildmitte als Nullpunkt)

function block (s) {
  var w = 80, h = 40;                                      // Abmessungen (Pixel)
  var x0 = xM+s*500*cos;                                   // Ecke rechts unten, x-Koordinate
  var y0 = yM-s*500*sin;                                   // Ecke rechts unten, y-Koordinate
  polyBlock[0] = {u: x0, v: y0};                           // Ecke rechts unten              
  polyBlock[1] = {u: x0-h*sin, v: y0-h*cos};               // Ecke rechts oben
  polyBlock[2] = {u: x0-h*sin-w*cos, v: y0-h*cos+w*sin};   // Ecke links oben
  polyBlock[3] = {u: x0-w*cos, v: y0+w*sin};               // Ecke links unten
  drawPolygon(polyBlock,colorBlock);                       // Ausgefülltes Polygon   
  if (!rb1.checked) return;                                // Falls keine Federwaage, abbrechen   
  x0 -= 20*sin; y0 -= 20*cos;                              // Koordinaten für Öse
  line(x0,y0,x0+8*cos,y0-8*sin,"#000000",3);               // Öse zeichnen
  }
  
// Federwaage zeichnen:
// s ........ Relative Position des Griffs
// part ..... Bruchteil der maximal zulässigen Kraft
// Abmessungen (Pixel):
// Griff Radius R (5); Gehäuse A1 x 2 R1 (45 x 10);
// Pappröhre 10 A2 x 2 R2 (40 x 6); 10 Felder A2 x 2 R2 (4 x 6); Haken A3 (10), Radius R3 (3)
// Gesamtlänge minimal 65, maximal 105

function springscale (s, part) { 
  var gx = xM+s*500*cos-20*sin;                            // x-Koordinate Griffmittelpunkt
  var gy = yM-s*500*sin-20*cos;                            // y-Koordinate Griffmittelpunkt
  circle(gx,gy,R,colorSpringscale);                        // Griff (außen)
  circle(gx,gy,R-1,colorBackground);                       // Griff (innen)
  var x = gx-R1*cos, y = gy+R1*sin;                        // Gehäuse, Mittelpunkt der rechten Seite
  poly0[0] = {u: x+v2x, v: y+v2y};                         // Gehäuse, Ecke rechts unten
  poly0[1] = {u: x+v1x+v2x, v: y+v1y+v2y};                 // Gehäuse, Ecke links unten
  poly0[2] = {u: x+v1x-v2x, v: y+v1y-v2y};                 // Gehäuse, Ecke links oben
  poly0[3] = {u: x-v2x, v: y-v2y};                         // Gehäuse, Ecke rechts oben  
  for (var i=Math.floor(8-part*10); i<10; i++) {           // Für alle sichtbaren Felder der Skala ...
    var c1 = A1-10*A2, c2 = part*10+i;                     // Konstanten
    var x1 = x-c1*cos+c2*w1x;                              // Mittelpunkt der rechten Seite, x-Koordinate (Pixel)
    var y1 = y+c1*sin+c2*w1y;                              // Mittelpunkt der rechten Seite, y-Koordinate (Pixel)
    poly1[0] = {u: x1+w2x, v: y1+w2y};                     // Ecke rechts unten
    poly1[1] = {u: x1+w1x+w2x, v: y1+w1y+w2y};             // Ecke links unten
    poly1[2] = {u: x1+w1x-w2x, v: y1+w1y-w2y};             // Ecke links oben
    poly1[3] = {u: x1-w2x, v: y1-w2y};                     // Ecke rechts oben
    var c = (i%2==0 ? colorScale1 : colorScale2);          // Farbe (abwechselnd)
    drawPolygon(poly1,c);                                  // Ausgefülltes Polygon für Feld der Skala
    }
  drawPolygon(poly0,colorSpringscale);                     // Gehäuse
  var c3 = A1+part*10*A2;                                  // Konstante   
  x -= c3*cos; y += c3*sin;                                // Haken, Anfangspunkt des geraden Teils
  var ax = x, ay = y;                                      // Anfangspunkt speichern
  x -= A3*cos; y += A3*sin;                                // Haken, Endpunkt des geraden Teils
  line(ax,ay,x,y);                                         // Gerader Teil des Hakens
  x -= R3*cos; y += R3*sin;                                // Haken, Mittelpunkt des gebogenen Teils
  ctx.arc(x,y,R3,alpha-0.25*Math.PI,alpha+1.5*Math.PI,false);  // Kreisbogen vorbereiten 
  ctx.stroke();                                            // Gebogener Teil des Hakens
  }
  
// Kraftpfeile zeichnen:

function arrows () {
  var xBl = (polyBlock[0].u+polyBlock[2].u)/2;             // x-Koordinate Angriffspunkt
  var yBl = (polyBlock[0].v+polyBlock[2].v)/2;             // y-Koordinate Angriffspunkt
  line(xBl+dxFN,yBl+dyFN,xBl,yBl+dyFG);                    // Hilfslinie für Kräfteparallelogramm (rechts unten)
  line(xBl-dxFH,yBl+dyFH,xBl,yBl+dyFG);                    // Hilfslinie für Kräfteparallelogramm (links unten)
  ctx.strokeStyle = colorParallel;                         // Farbe für Hangabtriebskraft
  arrow(xBl,yBl,xBl-dxFH,yBl+dyFH);                        // Dünner Pfeil für Hangabtriebskraft
  ctx.strokeStyle = colorNormal1;                          // Farbe für Normalkraft
  arrow(xBl,yBl,xBl+dxFN,yBl+dyFN);                        // Dünner Pfeil für Normalkraft
  ctx.strokeStyle = colorWeight;                           // Farbe für Gewichtskraft
  arrow(xBl,yBl,xBl,yBl+dyFG,2.5);                         // Dicker Pfeil für Gewichtskraft
  ctx.strokeStyle = colorFriction;                         // Farbe für Reibungskraft
  arrow(xBl-dxFH,yBl+dyFH,xBl-dxF,yBl+dyF,2.5);            // Dicker Pfeil für Reibungskraft
  ctx.strokeStyle = colorNormal2;                          // Farbe für Gegenkraft zur Normalkraft
  arrow(xBl,yBl,xBl-dxFN,yBl-dyFN,2.5);                    // Dicker Pfeil für Gegenkraft zur Normalkraft
  ctx.strokeStyle = colorForce;                            // Farbe für Zugkraft
  arrow(xBl,yBl,xBl+dxF,yBl-dyF,2.5);                      // Dicker Pfeil für Zugkraft
  }
  
// Grafikausgabe:
// Seiteneffekt t, sFW, sBl
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // ... Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // ... Länge des Zeitintervalls (s)
    if (slow) dt /= 10;                                    // ... Falls Zeitlupe, Zeitintervall durch 10 dividieren
    t += dt;                                               // ... Zeitvariable aktualisieren
    t0 = t1;                                               // ... Neuer Anfangszeitpunkt
    }
  sFw = -0.6+0.1*t;                                        // Relative Position der Federwaage
  sBl = sFw-(0.13+f/125);                                  // Relative Position des Blocks
  drawPolygon(polyPlane,colorPlane);                       // Schiefe Ebene
  block(sBl);                                              // Block
  if (rb1.checked)                                         // Falls oberer Radiobutton gewählt ...
    springscale(sFw,(sFw-sBl-0.13)/0.08);                  // Federwaage
  else arrows();                                           // Sonst Kraftpfeile zeichnen
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen