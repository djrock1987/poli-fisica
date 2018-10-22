// Federpendel
// Java-Applet (24.05.1998) umgewandelt
// 10.10.2014 - 13.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabh�ngige Texte sind einer eigenen Datei (zum Beispiel springpendulum_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorClock1 = "#808080";                               // Farbe der Digitaluhr (au�en)
var colorClock2 = "#000000";                               // Hintergrundfarbe der Anzeige
var colorClock3 = "#ff0000";                               // Farbe der Ziffern
var colorElongation = "#ff0000";                           // Farbe f�r Elongation
var colorVelocity = "#ff00ff";                             // Farbe f�r Geschwindigkeit
var colorAcceleration = "#0000ff";                         // Farbe f�r Beschleunigung
var colorForce = "#008020";                                // Farbe f�r Kraft
var colorBody = "#ffffff";                                 // Farbe des Pendelk�rpers

// Sonstige Konstanten:

var FONT1 = "normal normal bold 12px sans-serif";          // Zeichensatz
var ax = 100, ay = 50;                                     // Position der Aufh�ngung (Pixel)
var py0 = 180;                                             // y-Koordinate der Gleichgewichtslage (Pixel)
var xD = 220, yD1 = py0, yD2 = 160;                        // Koordinaten f�r Diagramme (Pixel)
var tPix = 20;                                             // Umrechnungsfaktor (Pixel pro s)

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var bu1, bu2;                                              // Schaltkn�pfe (Reset, Start/Pause/Weiter)
var cbSlow;                                                // Optionsfeld Zeitlupe
var ipD, ipM, ipG, ipA;                                    // Eingabefelder
var rbY, rbV, rbA, rbF, rbE;                               // Radiobuttons
var on;                                                    // Flag f�r Bewegung
var slow;                                                  // Flag f�r Zeitlupe
var t0;                                                    // Anfangszeitpunkt
var t;                                                     // Aktuelle Zeit (s)
var tU;                                                    // Zeit f�r Diagramm-Ursprung (s)
var timer;                                                 // Timer f�r Animation
var D;                                                     // Federkonstante (N/m)
var m;                                                     // Masse (kg)
var g;                                                     // Fallbeschleunigung (m/s�)
var A;                                                     // Amplitude (m)
var omega;                                                 // Kreisfrequenz (1/s)
var T;                                                     // Schwingungsdauer (s)
var phi, sinPhi, cosPhi;                                   // Phase (Bogenma�) und trigonometrische Werte
var yPix;                                                  // Umrechnungsfaktor (Pixel pro SI-Einheit)
var py;                                                    // y-Koordinate des Pendelk�rpers (Pixel)
var nrSize;                                                // Nummer der dargestellten physikalischen Gr��e

// Element der Schaltfl�che (aus HTML-Datei):
// id ..... ID im HTML-Befehl
// text ... Text (optional)

function getElement (id, text) {
  var e = document.getElementById(id);                     // Element
  if (text) e.innerHTML = text;                            // Text festlegen, falls definiert
  return e;                                                // R�ckgabewert
  } 

// Start:

function start () {
  canvas = getElement("cv");                               // Zeichenfl�che
  width = canvas.width; height = canvas.height;            // Abmessungen (Pixel)
  ctx = canvas.getContext("2d");                           // Grafikkontext
  bu1 = getElement("bu1",text01);                          // Resetknopf
  bu2 = getElement("bu2",text02[0]);                       // Startknopf
  bu2.state = 0;                                           // Anfangszustand (vor Start der Animation)
  cbSlow = getElement("cbSlow");                           // Optionsfeld (Zeitlupe)
  cbSlow.checked = false;                                  // Zeitlupe abgeschaltet
  getElement("lbSlow",text03);                             // Erkl�render Text (Zeitlupe)
  getElement("ipDa",text04);                               // Erkl�render Text (Federkonstante)
  ipD = getElement("ipDb");                                // Eingabefeld (Federkonstante)
  getElement("ipDc",newtonPerMeter);                       // Einheit (Federkonstante)
  getElement("ipMa",text05);                               // Erkl�render Text (Masse)
  ipM = getElement("ipMb");                                // Eingabefeld (Masse)
  getElement("ipMc",kilogram);                             // Einheit (Masse)
  var ipgx = getElement("ipGx");                           // Zus�tzliche Zeile (Fallbeschleunigung)
  if (ipgx) ipgx.innerHTML = text06x;                      // Erkl�render Text, 1. Zeile (Fallbeschleunigung)
  getElement("ipGa",text06);                               // Erkl�render Text, 2. Zeile (Fallbeschleunigung) 
  ipG = getElement("ipGb");                                // Eingabefeld (Fallbeschleunigung)
  getElement("ipGc",meterPerSecond2);                      // Einheit (Fallbeschleunigung)
  getElement("ipAa",text07);                               // Erkl�render Text (Amplitude)
  ipA = getElement("ipAb");                                // Eingabefeld (Amplitude)
  getElement("ipAc",meter);                                // Einheit (Amplitude)
  rbY = getElement("rbY");                                 // Radiobutton (Elongation)
  getElement("lbY",text08);                                // Erkl�render Text (Elongation)
  rbY.checked = true;                                      // Radiobutton ausw�hlen
  rbV = getElement("rbV");                                 // Radiobutton (Geschwindigkeit)
  getElement("lbV",text09);                                // Erkl�render Text (Geschwindigkeit)
  rbA = getElement("rbA");                                 // Radiobutton (Beschleunigung)
  getElement("lbA",text10);                                // Erkl�render Text (Beschleunigung)
  rbF = getElement("rbF");                                 // Radiobutton (Kraft)
  getElement("lbF",text11);                                // Erkl�render Text (Kraft)
  rbE = getElement("rbE");                                 // Radiobutton (Energie)
  getElement("lbE",text12);                                // Erkl�render Text (Energie)
  getElement("author",author);                             // Autor
  
  D = 20;                                                  // Anfangswert Federkonstante (N/m)
  m = 5;                                                   // Anfangswert Masse (kg)
  g = 9.81;                                                // Anfangswert Fallbeschleunigung (m/s�)
  A = 0.05;                                                // Anfangswert Amplitude (m)

  updateInput();                                           // Eingabefelder aktualisieren 
  calculation();                                           // Berechnungen (Seiteneffekt!)
    
  on = false;                                              // Animation abgeschaltet
  slow = false;                                            // Zeitlupe abgeschaltet
  t = tU = 0;                                              // Aktuelle Zeit (s)
    
  bu1.onclick = reactionReset;                             // Reaktion auf Resetknopf
  bu2.onclick = reactionStart;                             // Reaktion auf Startknopf
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld Zeitlupe
  ipD.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Pendell�nge)
  ipM.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Fallbeschleunigung)
  ipG.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Masse)
  ipA.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Amplitude)
  rbY.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton Elongation
  rbV.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton Geschwindigkeit
  rbA.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton Beschleunigung
  rbF.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton Kraft
  rbE.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton Energie
  nrSize = 0;                                              // Elongation ausgew�hlt
  paint();                                                 // Zeichnen  
    
  } // Ende der Methode start
  
// Zustandsfestlegung f�r Schaltknopf Start/Pause/Weiter:
// Seiteneffekt bu2.state
  
function setButton2State (st) {
  bu2.state = st;                                          // Zustand speichern
  bu2.innerHTML = text02[st];                              // Text aktualisieren
  }
  
// Umschalten des Schaltknopfs Start/Pause/Weiter:
// Seiteneffekt bu2.state
  
function switchButton2 () {
  var st = bu2.state;                                      // Momentaner Zustand
  if (st == 0) st = 1;                                     // Falls Ausgangszustand, starten
  else st = 3-st;                                          // Wechsel zwischen Animation und Unterbrechung
  setButton2State(st);                                     // Neuen Zustand speichern, Text �ndern
  }
  
// Aktivierung bzw. Deaktivierung der Eingabefelder:
// p ... Flag f�r m�gliche Eingabe

function enableInput (p) {
  ipD.readOnly = !p;                                       // Eingabefeld f�r Federkonstante
  ipM.readOnly = !p;                                       // Eingabefeld f�r Masse
  ipG.readOnly = !p;                                       // Eingabefeld f�r Fallbeschleunigung
  ipA.readOnly = !p;                                       // Eingabefeld f�r Amplitude
  }
  
// Reaktion auf Resetknopf:
// Seiteneffekt bu2.state, on, timer , t, tU, slow, D, m, g, A, omega, T
   
function reactionReset () {
  setButton2State(0);                                      // Zustand des Schaltknopfs Start/Pause/Weiter
  enableInput(true);                                       // Eingabefelder aktivieren
  stopAnimation();                                         // Animation stoppen
  t = tU = 0;                                              // Zeitvariable zur�cksetzen
  on = false;                                              // Animation abgeschaltet
  slow = cbSlow.checked;                                   // Flag f�r Zeitlupe
  reaction();                                              // Eingegebene Werte �bernehmen und rechnen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf den Schaltknopf Start/Pause/Weiter:
// Seiteneffekt t0, bu2.state, on, timer, slow, D, m, g, A, omega, T 

function reactionStart () {
  if (bu2.state != 1) t0 = new Date();                     // Falls Animation angeschaltet, neuer Anfangszeitpunkt
  switchButton2();                                         // Zustand des Schaltknopfs �ndern
  enableInput(false);                                      // Eingabefelder deaktivieren
  if (bu2.state == 1) startAnimation();                    // Entweder Animation starten bzw. fortsetzen ...
  else stopAnimation();                                    // ... oder stoppen
  slow = cbSlow.checked;                                   // Flag f�r Zeitlupe
  reaction();                                              // Eingegebene Werte �bernehmen und rechnen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf Optionsfeld Zeitlupe:
// Seiteneffekt slow

function reactionSlow () {
  slow = cbSlow.checked;                                   // Flag setzen
  }
  
// Hilfsroutine: Eingabe �bernehmen und rechnen
// Seiteneffekt D, m, g, A, omega, T

function reaction () {
  input();                                                 // Eingegebene Werte �bernehmen (eventuell korrigiert)
  calculation();                                           // Berechnungen
  }
  
// Reaktion auf Tastendruck (nur auf Enter-Taste):
// Seiteneffekt D, m, g, A
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten �bernehmen und rechnen                          
  paint();                                                 // Neu zeichnen
  }

// Reaktion auf Radiobutton:
// Seiteneffekt nrSize

function reactionRadioButton () {
  if (rbY.checked) nrSize = 0;                             // Entweder Elongation ...
  else if (rbV.checked) nrSize = 1;                        // ... oder Geschwindigkeit ...
  else if (rbA.checked) nrSize = 2;                        // ... oder Beschleunigung ...
  else if (rbF.checked) nrSize = 3;                        // ... oder Kraft ...
  else nrSize = 4;                                         // ... oder Energie ausw�hlen
  paint();                                                 // Neu zeichnen
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
// Seiteneffekt omega, T

function calculation () {
  omega = Math.sqrt(D/m);                                  // Kreisfrequenz (1/s)
  T = 2*Math.PI/omega;                                     // Schwingungsdauer (s)
  }
  
// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }
  
// Eingabe einer Zahl
// ef .... Eingabefeld
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)
// min ... Minimum des erlaubten Bereichs
// max ... Maximum des erlaubten Bereichs
// R�ckgabewert: Zahl oder NaN
  
function inputNumber (ef, d, fix, min, max) {
  var s = ef.value;                                        // Zeichenkette im Eingabefeld
  s = s.replace(",",".");                                  // Eventuell Komma in Punkt umwandeln
  var n = Number(s);                                       // Umwandlung in Zahl, falls m�glich
  if (isNaN(n)) n = 0;                                     // Sinnlose Eingaben als 0 interpretieren 
  if (n < min) n = min;                                    // Falls Zahl zu klein, korrigieren
  if (n > max) n = max;                                    // Falls Zahl zu gro�, korrigieren
  ef.value = ToString(n,d,fix);                            // Eingabefeld eventuell korrigieren
  return n;                                                // R�ckgabewert
  }
   
// Gesamte Eingabe:
// Seiteneffekt D, m, g, A

function input () {
  D = inputNumber(ipD,3,false,5,50);                      // Federkonstante (N/m)
  m = inputNumber(ipM,3,false,1,10);                      // Masse (kg)
  g = inputNumber(ipG,3,false,1,100);                     // Masse (kg)
  A = inputNumber(ipA,3,false,0.01,0.1);                  // Amplitude (m)
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ipD.value = ToString(D,3,false);                         // Eingabefeld f�r Federkonstante (N/m)
  ipM.value = ToString(m,3,false);                         // Eingabefeld f�r Masse (kg)
  ipG.value = ToString(g,3,false);                         // Eingabefeld f�r Fallbeschleunigung (m/s�)
  ipA.value = ToString(A,3,false);                         // Eingabefeld f�r Amplitude (m)
  }
  
//-------------------------------------------------------------------------------------------------

// Neuer Pfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Pfad
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
  
// Pfeil zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// w ........ Liniendicke (optional)
// Zu beachten: Die Farbe wird durch ctx.strokeStyle bestimmt.

function arrow (x1, y1, x2, y2, w) {
  if (!w) w = 1;                                           // Falls Liniendicke nicht definiert, Defaultwert                          
  var dx = x2-x1, dy = y2-y1;                              // Vektorkoordinaten
  var length = Math.sqrt(dx*dx+dy*dy);                     // L�nge
  if (length == 0) return;                                 // Abbruch, falls L�nge 0
  dx /= length; dy /= length;                              // Einheitsvektor
  var s = 2.5*w+7.5;                                       // L�nge der Pfeilspitze 
  var xSp = x2-s*dx, ySp = y2-s*dy;                        // Hilfspunkt f�r Pfeilspitze         
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
  ctx.beginPath();                                         // Neuer Pfad f�r Pfeilspitze
  ctx.lineWidth = 1;                                       // Liniendicke zur�cksetzen
  ctx.fillStyle = ctx.strokeStyle;                         // F�llfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                                     // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                                   // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                                       // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                                   // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                                         // Zur�ck zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen 
  }

// Rechteck mit schwarzem Rand:
// (x,y) ... Koordinaten der Ecke links oben (Pixel)
// w ....... Breite (Pixel)
// h ....... H�he (Pixel)
// c ....... F�llfarbe (optional)

function rectangle (x, y, w, h, c) {
  if (c) ctx.fillStyle = c;                                // F�llfarbe
  newPath();                                               // Neuer Pfad
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausf�llen
  ctx.strokeRect(x,y,w,h);                                 // Rand zeichnen
  }
  
// Kreisscheibe mit schwarzem Rand:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... F�llfarbe (optional)

function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                // F�llfarbe
  newPath();                                               // Neuer Pfad
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausf�llen
  ctx.stroke();                                            // Rand zeichnen
  }
  
// Feder ohne Enden zeichnen (N�herung durch Polygonzug):

function spring () {
  var per = (py-ay-25)/10.0;                               // Periode (Pixel)
  var ampl = 10;                                           // Halbe Breite (Pixel)
  var omega = 2*Math.PI/per;                               // Hilfsgr��e
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.moveTo(ax,ay+10);                                    // Anfangspunkt (oben)
  for (var y=ay+11; y<=py-15; y++) {                       // F�r alle y-Koordinaten ...
    var x = ax+ampl*Math.sin(omega*(y-ay-10));             // x-Koordinate berechnen
    if (y > py-16) x = Math.max(x,ax);                     // x-Koordinate bei der letzten Teilstrecke korrigieren
    ctx.lineTo(x,y);                                       // Teilstrecke vorbereiten
    }
  ctx.stroke();                                            // Polygonzug f�r Feder zeichnen
  }

// Federpendel zeichnen:

function springpendulum () {
  rectangle(ax-50,ay-5,100,5,"#000000");                   // Decke
  line(ax,ay,ax,ay+10);                                    // Oberes Ende der Feder
  spring();                                                // Feder (ohne Enden)
  line(ax,py-15,ax,py-5);                                  // Unteres Ende der Feder
  circle(ax,py,5,colorBody);                               // Pendelk�rper
  line(ax-40,py0,ax-20,py0);                               // Markierung f�r Gleichgewichtslage (links)
  line(ax+20,py0,ax+40,py0);                               // Markierung f�r Gleichgewichtslage (rechts)
  }
  
// Digitaluhr zeichnen:

function clock (x, y) {
  rectangle(x-60,y-16,120,32,colorClock1);                 // Geh�use
  rectangle(x-50,y-10,100,20,colorClock2);                 // Hintergrund der Anzeige
  ctx.fillStyle = "#ff0000";                               // Farbe f�r Ziffern
  ctx.font = "normal normal bold 16px monospace";          // Zeichensatz
  ctx.textAlign = "center";                                // Zentrierte Ausgabe
  var n = Math.floor(t/1000);                              // Zahl der Zeitabschnitte zu je 1000 s
  var s = (t-n*1000).toFixed(3)+" "+second;                // Zeitangabe (Einheit s, alle 1000 s Neuanfang)
  s = s.replace(".",decimalSeparator);                     // Eventuell Punkt durch Komma ersetzen
  while (s.length < 9) s = " "+s;                          // Eventuell Leerzeichen am Anfang erg�nzen
  ctx.fillText(s,x,y+5);                                   // Ausgabe der Zeit
  }
  
// Text ausrichten (Zeichensatz FONT1):
// s ....... Zeichenkette
// t ....... Typ (0 f�r linksb�ndig, 1 f�r zentriert, 2 f�r rechtsb�ndig)
// (x,y) ... Position (Pixel)

function alignText (s, t, x, y) {
  ctx.font = FONT1;                                        // Zeichensatz
  if (t == 0) ctx.textAlign = "left";                      // Je nach Wert von t linksb�ndig ...
  else if (t == 1) ctx.textAlign = "center";               // ... oder zentriert ...
  else ctx.textAlign = "right";                            // ... oder rechtsb�ndig
  ctx.fillText(s,x,y);                                     // Text ausgeben
  }
  
// Waagrechte Achse (mit Beschriftung und Ticks) f�r Diagramm:
// (x,y) ... Ursprung (Pixel)
  
function horizontalAxis (x, y) {
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz 
  arrow(x-20,y,x+240,y);                                   // Pfeil zeichnen
  alignText(symbolTime,1,x+230,y+15);                      // Beschriftung (t)
  alignText(text21,1,x+230,y+27);                          // Beschriftung (in s)  
  var t0 = Math.ceil(tU);                                  // Zeit (s) f�r ersten Tick
  var x0 = Math.round(x+tPix*(t0-tU));                     // x-Koordinate des ersten Ticks            
  for (i=0; i<=10; i++) {                                  // F�r alle Ticks ...
    var xs = x0+i*tPix;                                    // x-Koordinate berechnen
    ctx.moveTo(xs,y-3); ctx.lineTo(xs,y+3);                // Tick vorbereiten
    if (xs >= x+5 && xs <= x+215                           // Falls Tick nicht zu weit links oder zu weit rechts ... 
    && (t0+i <= 100 || (t0+i)%2 == 0))                     // und Zeit (s) kleiner als 100 oder geradzahlig ...
      alignText(""+(t0+i),1,xs,y+13);                      // ... Tick beschriften
    }
  ctx.stroke();                                            // Ticks zeichnen
  }
    
// Senkrechte Achse (mit Beschriftung und Ticks) f�r Diagramm:
// (x,y) ... Ursprung (Pixel)
// yLow .... Unteres Ende der Achse (Pixel)
// yHigh ... Oberes Ende der Achse (Pixel)
// maxSI ... Maximalwert (SI-Einheit)
// Seiteneffekt yPix
  
function verticalAxis (x, y, yLow, yHigh, maxSI) {
  var pot10 = Math.pow(10,Math.floor(Math.log(maxSI)/Math.LN10));    // N�chstkleinere Zehnerpotenz zu maxSI
  var q = maxSI/pot10;                                     // Verh�ltnis (zwischen 1 und 10)
  var n;                                                   // Zahl der Ticks
  if (q > 5) n = 10; else if (q > 2) n = 5; else n = 2;    // "Glatter" Wert f�r Zahl der Ticks 
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  arrow(x,yLow,x,yHigh);                                   // Pfeil zeichnen
  var n0 = (nrSize<4 ? -n : 0);                            // Nummer des untersten Ticks 
  ctx.beginPath();                                         // Neuer Pfad                       
  for (i=n0; i<=n; i++) {                                  // F�r alle Ticks ...
    var ys = y-i*100/n;                                    // y-Koordinate des Ticks
    ctx.moveTo(x-3,ys); ctx.lineTo(x+3,ys);                // Tick vorbereiten
    var s = Number(i*pot10).toPrecision(1);                // Zeichenkette f�r Beschriftung 
    if (Math.abs(i*pot10) >= 10)                           // Falls n�tig ...
      s = ""+Math.round(i*pot10);                          // ... Zehnerpotenzschreibweise verhindern
    s = s.replace(".",decimalSeparator);                   // Eventuell Punkt in Komma verwandeln
    if ((n < 10 || i%2 == 0) && i != 0)                    // Falls sinnvoll ... 
      alignText(s,2,x-3,ys+4);                             // ... Tick beschriften
    }
  ctx.stroke();                                            // Ticks zeichnen
  yPix = 100/n/pot10;                                      // Umrechnungsfaktor aktualisieren
  }
  
// Sinuskurve (N�herung durch Polygonzug):
// (x,y) ... Nullpunkt (Pixel)
// per ..... Periode (Pixel)
// ampl .... Amplitude (Pixel)
// xMin .... Minimaler x-Wert (Pixel)
// xMax .... Maximaler x-Wert (Pixel)

function sinus (x, y, per, ampl, xMin, xMax) {
  var omega = 2*Math.PI/per;                               // Hilfsgr��e
  newPath();                                               // Neuer Pfad (Standardwerte)
  var xx = xMin;                                           // x-Koordinate f�r linken Rand
  ctx.moveTo(xx,y-ampl*Math.sin(omega*(xx-x)));            // Anfangspunkt 
  while (xx < xMax) {                                      // Solange rechter Rand noch nicht erreicht ...
    xx++;                                                  // x-Koordinate erh�hen
    ctx.lineTo(xx,y-ampl*Math.sin(omega*(xx-x)));          // Neue Teilstrecke vorbereiten
    }
  ctx.stroke();                                            // Polygonzug f�r Kurve zeichnen
  }
  
// Diagramm zeichnen:

function diagram (type, x, y, yMax) {
  horizontalAxis(x,y);                                     // Waagrechte Achse mit Beschriftung und Ticks
  verticalAxis(x,y,y+120,y-135,yMax);                      // Senkrechte Achse mit Beschriftung und Ticks   
  sinus(x-type*T*5-tU*tPix,y,T*tPix,yMax*yPix,x,x+200);    // Sinuskurve  
  }
  
// Markierung in Diagramm f�r momentanen Wert:
// val ..... Zahlenwert (SI-Einheit)
// (x,y) ... Ursprung (Pixel)
// c ....... Farbe
  
function drawMomVal (val, x, y, c) {
  x += (t-tU)*tPix; y -= val*yPix;                         // Mittelpunktskoordinaten (Pixel)
  circle(x,y,2,c);                                         // Kleiner Kreis mit Rand
  }
  
// Ausgabe eines Zahlenwerts:
// s ........ Bezeichnung der Gr��e
// v ........ Zahlenwert
// u ........ Einheit
// n ........ Zahl der g�ltigen Ziffern
// (x1,y) ... Position des Texts (Pixel)
// (x2,y) ... Position des Zahlenwerts (Pixel)
  
function writeValue (s, v, u, n, x1, x2, y) {
  alignText(s+":",0,x1,y);                                 // Bezeichnung der Gr��e
  s = v.toPrecision(n);                                    // Runden mit gew�nschter Genauigkeit
  s = s.replace(".",decimalSeparator);                     // Eventuell Komma statt Punkt
  alignText(s+" "+u,0,x2,y);                               // Zahl mit Einheit
  }
  
// Zeichnung zur Elongation:
// Diagramm zur Zeitabh�ngigkeit der Elongation, Linie f�r Elongation, Zahlenwerte

function drawElongation () {
  var s = A*cosPhi;                                        // Momentaner Wert der Elongation (m) 
  diagram(1,xD,yD1,A);                                     // Diagramm zeichnen
  alignText(symbolElongation,1,xD-25,yD1-130);             // Beschriftung (Symbol f�r Elongation)
  alignText(text22,1,xD-25,yD1-118);                       // Beschriftung (Einheit m)
  line(ax,py0,ax,py,colorElongation,3);                    // Dicke Linie zur Darstellung der Elongation
  drawMomVal(s,xD,yD1,colorElongation);                    // Momentanen Wert im Diagramm markieren 
  ctx.fillStyle = colorElongation;                         // Farbe f�r Elongation (Zahlenwerte)  
  writeValue(text14,s,meterUnicode,3,xD,xD+200,height-50);         // Momentanen Wert angeben
  writeValue("("+text13,A,meterUnicode+")",3,xD,xD+200,height-30); // Maximalen Wert angeben
  }
  
// Zeichnung zur Geschwindigkeit:
// Diagramm zur Zeitabh�ngigkeit der Geschwindigkeit, Pfeil f�r Geschwindigkeitsvektor, Zahlenwerte

function drawVelocity () {
  var vMax = A*omega;                                      // Maximaler Betrag der Geschwindigkeit (m/s)
  var v = -vMax*sinPhi;                                    // Momentaner Wert der Geschwindigkeit (m/s)
  diagram(2,xD,yD1,vMax);                                  // Diagramm zeichnen
  alignText(symbolVelocity,1,xD-28,yD1-130);               // Beschriftung (Symbol f�r Geschwindigkeit)
  alignText(text23,1,xD-28,yD1-118);                       // Beschriftung (Einheit m/s)
  ctx.strokeStyle = colorVelocity;                         // Farbe f�r Geschwindigkeit
  arrow(ax,py,ax,py-v*yPix,3);                             // Pfeil f�r Geschwindigkeitsvektor
  drawMomVal(v,xD,yD1,colorVelocity);                      // Momentanen Wert im Diagramm markieren
  var mps = meterPerSecond;                                // Abk�rzung f�r Einheit m/s
  writeValue(text15,v,mps,3,xD,xD+180,height-50);          // Momentanen Wert angeben
  writeValue("("+text13,vMax,mps+")",3,xD,xD+180,height-30); // Maximalen Wert angeben
  }
  
// Zeichnung zur Beschleunigung:
// Diagramm zur Zeitabh�ngigkeit der Beschleunigung, Pfeil f�r Beschleunigungsvektor, Zahlenwerte

function drawAcceleration () {
  var aMax = A*omega*omega;                                // Maximaler Betrag der Beschleunigung (m/s�)
  var a = -aMax*cosPhi;                                    // Momentaner Wert der Beschleunigung (m/s�)
  diagram(3,xD,yD1,aMax);                                  // Diagramm zeichnen
  alignText(symbolAcceleration,1,xD-28,yD1-130);           // Beschriftung (Symbol f�r Beschleunigung)
  alignText(text24,1,xD-28,yD1-118);                       // Beschriftung (Einheit m/s�)
  ctx.strokeStyle = colorAcceleration;                     // Farbe f�r Beschleunigung
  arrow(ax,py,ax,py-a*yPix,3);                             // Pfeil f�r Beschleunigungsvektor
  drawMomVal(a,xD,yD1,colorAcceleration);                  // Momentanen Wert im Diagramm markieren
  var mps2 = meterPerSecond2Unicode;                       // Abk�rzung f�r Einheit m/s�
  writeValue(text16,a,mps2,3,xD,xD+180,height-50);         // Momentanen Wert angeben
  writeValue("("+text13,aMax,mps2+")",3,xD,xD+180,height-30);  // Maximalen Wert angeben
  }
  
// Zeichnung zur Kraft:
// Diagramm zur Zeitabh�ngigkeit der Kraft, Pfeil f�r Kraftvektor, Zahlenwerte

function drawForce () {
  var fMax = m*A*omega*omega;                              // Maximaler Betrag der Kraft (N)
  var f = -fMax*cosPhi;                                    // Momentaner Wert der Kraft (N)
  diagram(3,xD,yD1,fMax);                                  // Diagramm zeichnen
  alignText(symbolForce,1,xD-28,yD1-130);                  // Beschriftung (Symbol f�r Kraft)
  alignText(text25,1,xD-28,yD1-118);                       // Beschriftung (Einheit N)
  ctx.strokeStyle = colorForce;                            // Farbe f�r Kraft
  arrow(ax,py,ax,py-f*yPix,3);                             // Pfeil f�r Kraftvektor
  drawMomVal(f,xD,yD1,colorForce);                         // Momentanen Wert im Diagramm markieren
  writeValue(text17,f,newton,3,xD,xD+180,height-50);       // Momentanen Wert angeben
  writeValue("("+text13,fMax,newton+")",3,xD,xD+180,height-30); // Maximalen Wert angeben
  }
  
// Diagramm zur Zeitabh�ngigkeit der potentiellen und kinetischen Energie:
// (x,y) ... Ursprung (Pixel)
// e ....... Gesamtenergie (J)

function diagramEnergy (x, y, e) {
  horizontalAxis(x,y);                                     // Waagrechte Achse mit Beschriftung und Ticks
  verticalAxis(x,y,y+20,y-125,e);                          // Senkrechte Achse mit Beschriftung und Ticks
  var x1 = x+200;                                          // x-Koordinate f�r rechten Rand (Pixel)
  var y1 = y-e*yPix;                                       // y-Koordinate f�r Gesamtenergie (Pixel)
  ctx.beginPath();                                         // Neuer Pfad
  ctx.moveTo(x,y1); ctx.lineTo(x1,y1);                     // Waagrechte Linie f�r Gesamtenergie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  var xx = x-tU*tPix;                                      // x-Koordinate des verschobenen Ursprungs (Pixel)
  var per = T*10;                                          // Periode f�r Sinuskurven (Pixel)
  var ampl = e*yPix/2;                                     // Amplitude f�r Sinuskurven (Pixel)
  sinus(xx-T*2.5,y-ampl,per,ampl,x,x+200);                 // Sinuskurve f�r potentielle Energie
  sinus(xx-T*7.5,y-ampl,per,ampl,x,x+200);                 // Sinuskurve f�r kinetische Energie
  }
  
// Zentrierter Text mit Index:
// s1 ...... Normaler Text
// s2 ...... Index
// (x,y) ... Position
    
function centerTextIndex (s1, s2, x, y) {
  var w1 = ctx.measureText(s1).width;                      // Breite von s1 (Pixel) 
  var w2 = ctx.measureText(s2).width;                      // Breite von s2 (Pixel)
  var x0 = x-(w1+w2)/2;                                    // x-Koordinate der Mitte (Pixel)
  alignText(s1,0,x0,y);                                    // Normalen Text ausgeben
  alignText(s2,0,x0+w1+1,y+5);                             // Index ausgeben
  }
  
// Zeichnung zur Energie:

function drawEnergy () {
  var e = A*omega; e = m*e*e/2;                            // Gesamtenergie (J)
  var part = cosPhi*cosPhi;                                // Bruchteil f�r potentielle Energie
  var eP = e*part, eK = e-eP;                              // Potentielle und kinetische Energie (J)
  diagramEnergy(xD,yD2,e);                                 // Diagramm zur Zeitabh�ngigkeit der beiden Energieformen 
  centerTextIndex(symbolEnergy,symbolPotential,xD-30,yD2-125); // Beschriftung links (potentielle Energie) 
  alignText(text26,1,xD-30,yD2-108);                       // Beschriftung links (Einheit J)
  centerTextIndex(symbolEnergy,symbolKinetic,xD+30,yD2-125);   // Beschriftung rechts (kinetische Energie)
  alignText(text26,1,xD+30,yD2-108);                       // Beschriftung rechts (Einheit J)
  ctx.fillStyle = colorElongation;                         // Farbe f�r potentielle Energie (bzw. Elongation)
  writeValue(text18,eP,joule,3,xD,xD+200,height-70);       // Momentaner Wert der potentiellen Energie    
  ctx.fillStyle = colorVelocity;                           // Farbe f�r kinetische Energie
  writeValue(text19,eK,joule,3,xD,xD+200,height-50);       // Momentaner Wert der kinetischen Energie
  ctx.fillStyle = "#000000";                               // Farbe f�r Gesamtenergie
  writeValue(text20,e,joule,3,xD,xD+200,height-30);        // Wert der Gesamtenergie
  var dy = part*100;                                       // H�he des Rechtecks f�r potentielle Energie (Pixel)
  rectangle(300,205,50,dy,colorElongation);                // Rechteck f�r potentielle Energie
  if (part > 0.001 || on)                                  // Falls potentielle Energie nicht zu klein ...
    alignText(text18,0,360,220);                           // ... Beschriftung potentielle Energie
  rectangle(300,205+dy,50,100-dy,colorVelocity);           // Rechteck f�r kinetische Energie
  if (part < 0.999 || on)                                  // Falls kinetische Energie nicht zu klein ... 
    alignText(text19,0,360,300);                           // ... Beschriftung potentielle Energie
  drawMomVal(eP,xD,yD2,colorElongation);                   // Markierung f�r momentane potentielle Energie
  drawMomVal(eK,xD,yD2,colorVelocity);                     // Markierung f�r momentane kinetische Energie
  }
  
// Grafikausgabe:
// Seiteneffekt t, t0, tU, phi, sinPhi, cosPhi, py
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausf�llen
  ctx.font = FONT1;                                        // Zeichensatz
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // ... Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // ... L�nge des Zeitintervalls (s)
    if (slow) dt /= 10;                                    // ... Falls Zeitlupe, Zeitintervall durch 10 dividieren
    t += dt;                                               // ... Zeitvariable aktualisieren
    t0 = t1;                                               // ... Neuer Anfangszeitpunkt
    tU = (t<5 ? 0 : t-5);                                  // Zeit f�r Ursprung eines Diagramms
    }
  phi = omega*t;                                           // Phasenwinkel (Bogenma�)
  cosPhi = Math.cos(phi); sinPhi = Math.sin(phi);          // Trigonometrische Werte
  py = py0-500*A*cosPhi;                                   // Position des Pendelk�rpers (Pixel)
  springpendulum();                                        // Federpendel zeichnen
  clock(ax,340);                                           // Digitaluhr zeichnen
  switch (nrSize) {                                        // Je nach betrachteter Gr��e
    case 0: drawElongation(); break;                       // ... Zeichnung zur Elongation
    case 1: drawVelocity(); break;                         // ... Zeichnung zur Geschwindigkeit
    case 2: drawAcceleration(); break;                     // ... Zeichnung zur Beschleunigung
    case 3: drawForce(); break;                            // ... Zeichnung zur Kraft
    case 4: drawEnergy(); break;                           // ... Zeichnung zur Energie
    }
  var s = text27+":  "+T.toPrecision(3)+" "+second;        // Zeichenkette f�r Schwingungsdauer
  s = s.replace(".",decimalSeparator);                     // Eventuell Komma statt Punkt
  ctx.fillStyle = "#000000";                               // Farbe f�r Text
  alignText(s,1,ax,height-30);                             // Zeichenkette f�r Schwingungsdauer ausgeben
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen

