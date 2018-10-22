// Kreisbewegung mit konstanter Winkelgeschwindigkeit
// Java-Applet (25.03.2007) umgewandelt
// 16.11.2014 - 13.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabh�ngige Texte sind einer eigenen Datei (zum Beispiel circularmotion_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorBody = "#ffffff";                                 // Farbe des Pendelk�rpers
var colorPosition = "#ff0000";                             // Farbe f�r Position
var colorVelocity = "#ff00ff";                             // Farbe f�r Geschwindigkeit
var colorAcceleration = "#0000ff";                         // Farbe f�r Beschleunigung
var colorForce = "#008000";                                // Farbe f�r Kraft

// Sonstige Konstanten:

var MX = 150, MY = 160;                                    // Kreismittelpunkt 
var DX = 310, DY = 160;                                    // Ursprung Diagramm
var DEG = Math.PI/180;                                     // Winkelgrad (Bogenma�)
var FONT1 = "normal normal bold 12px sans-serif";          // Zeichensatz

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var bu1, bu2;                                              // Schaltkn�pfe (Reset, Start/Pause/Weiter)
var cbSlow;                                                // Optionsfeld (Zeitlupe)
var ipR, ipT, ipM;                                         // Eingabefelder (Radius, Umlaufdauer, Masse)
var rb1, rb2, rb3, rb4;                                    // Radiobuttons (betrachtete Gr��e)
var on;                                                    // Flag f�r Bewegung
var slow;                                                  // Flag f�r Zeitlupe
var t0;                                                    // Anfangszeitpunkt
var t;                                                     // Aktuelle Zeit (s)
var tU;                                                    // Zeit f�r Diagramm-Ursprung (s)
var timer;                                                 // Timer f�r Animation
var nrSize;                                                // Nummer der betrachteten Gr��e (0 bis 3)
var r, rPix;                                               // Radius (m bzw. Pixel)
var tPer;                                                  // Umlaufdauer (s)
var m;                                                     // Masse (kg)
var omega;                                                 // Winkelgeschwindigkeit (1/s)  
var phi, sinPhi, cosPhi;                                   // Drehwinkel (Bogenma�, trigonometrische Werte)
var x, y, xPix, yPix;                                      // Position (m bzw. Pixel)
var v, vPix;                                               // Geschwindigkeit (m/s bzw. Pixel)
var a, aPix;                                               // Beschleunigung (m/s� bzw. Pixel)
var f, fPix;                                               // Kraft (N bzw. Pixel)
var pixL, pixV, pixA, pixF, pixT;                          // Umrechnungsfaktoren (Pixel pro SI-Einheit)
var pixSI;                                                 // Umrechnungsfaktor (Pixel pro SI-Einheit allgemein)

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
  cbSlow.checked = false;                                  // Zeitlupe zun�chst abgeschaltet
  getElement("lbSlow",text03);                             // Erkl�render Text (Zeitlupe)
  getElement("ipRa",text04);                               // Erkl�render Text (Radius)
  ipR = getElement("ipRb");                                // Eingabefeld (Radius)
  getElement("ipRc",meter);                                // Einheit (Radius)
  getElement("ipTa",text05);                               // Erkl�render Text (Umlaufdauer)
  ipT = getElement("ipTb");                                // Eingabefeld (Umlaufdauer)
  getElement("ipTc",second);                               // Einheit (Umlaufdauer)
  getElement("ipMa",text06);                               // Erkl�render Text (Masse)
  ipM = getElement("ipMb");                                // Eingabefeld (Masse)
  getElement("ipMc",kilogram);                             // Einheit (Masse)
  rb1 = getElement("rb1");                                 // Radiobutton (Position)
  getElement("lb1",text07);                                // Erkl�render Text (Position)
  rb1.checked = true;                                      // Radiobutton ausw�hlen
  rb2 = getElement("rb2");                                 // Radiobutton (Geschwindigkeit)
  getElement("lb2",text08);                                // Erkl�render Text (Geschwindigkeit)
  rb3 = getElement("rb3");                                 // Radiobutton (Beschleunigung)
  getElement("lb3",text09);                                // Erkl�render Text (Beschleunigung)
  rb4 = getElement("rb4");                                 // Radiobutton (Kraft)
  getElement("lb4",text10);                                // Erkl�render Text (Kraft)
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // �bersetzer
  
  r = 2; tPer = 5; m = 1;                                  // Startwerte (Radius, Umlaufdauer, Masse)                  
  nrSize = 0;                                              // Position ausgew�hlt
  t = tU = 0;                                              // Zeitvariablen (s)
  updateInput();                                           // Eingabefelder aktualisieren 
  calculation();                                           // Berechnungen (Seiteneffekt!)
  paint();                                                 // Zeichnen    
  slow = false;                                            // Zeitlupe zun�chst abgeschaltet
  bu1.onclick = reactionReset;                             // Reaktion auf Resetknopf
  bu2.onclick = reactionStart;                             // Reaktion auf Startknopf
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld Zeitlupe
  ipR.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Radius)
  ipT.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Umlaufdauer)
  ipM.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Masse)
  rb1.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Position)
  rb2.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Geschwindigkeit)
  rb3.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Beschleunigung)
  rb4.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Kraft)
      
  } // Ende der Methode start
  
// Zustandsfestlegung f�r Schaltknopf Start/Pause/Weiter:
  
function setButton2State (st) {
  bu2.state = st;                                          // Zustand speichern
  bu2.innerHTML = text02[st];                              // Text aktualisieren
  }
  
// Umschalten des Schaltknopfs Start/Pause/Weiter:
  
function switchButton2 () {
  var st = bu2.state;                                      // Momentaner Zustand
  if (st == 0) st = 1;                                     // Falls Ausgangszustand, starten
  else st = 3-st;                                          // Wechsel zwischen Animation und Unterbrechung
  setButton2State(st);                                     // Neuen Zustand speichern, Text �ndern
  }
  
// Aktivierung bzw. Deaktivierung der Eingabefelder:
// p ... Flag f�r m�gliche Eingabe

function enableInput (p) {
  ipR.readOnly = !p;                                       // Eingabefeld f�r Radius
  ipT.readOnly = !p;                                       // Eingabefeld f�r Umlaufdauer
  ipM.readOnly = !p;                                       // Eingabefeld f�r Masse
  }
  
// Reaktion auf Resetknopf:
// Seiteneffekt bu2, t, tU, on, timer, r, tPer, m, pixL, rPix, omega, v, pixV, vPix, a, pixA, aPix, f, pixF, fPix, pixT, t0
   
function reactionReset () {
  setButton2State(0);                                      // Zustand des Schaltknopfs Start/Pause/Weiter
  enableInput(true);                                       // Eingabefelder aktivieren
  stopAnimation();                                         // Animation abschalten
  t = tU = 0;                                              // Zeitvariablen zur�cksetzen
  reaction();                                              // Eingegebene Werte �bernehmen und rechnen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf den Schaltknopf Start/Pause/Weiter:
// Seiteneffekt bu2, t, tU, on, timer, t0, r, tPer, m, pixL, rPix, omega, v, pixV, vPix, a, pixA, aPix, f, pixF, fPix, pixT

function reactionStart () {
  switchButton2();                                         // Zustand des Schaltknopfs �ndern
  enableInput(false);                                      // Eingabefelder deaktivieren
  if (bu2.state == 1) startAnimation();                    // Entweder Animation starten bzw. fortsetzen ...
  else stopAnimation();                                    // ... oder stoppen
  reaction();                                              // Eingegebene Werte �bernehmen und rechnen
  }
  
// Reaktion auf Optionsfeld Zeitlupe:
// Seiteneffekt slow

function reactionSlow () {
  slow = cbSlow.checked;                                   // Flag setzen
  }
  
// Hilfsroutine: Eingabe �bernehmen und rechnen
// Seiteneffekt r, tPer, m, pixL, rPix, omega, v, pixV, vPix, a, pixA, aPix, f, pixF, fPix, pixT 

function reaction () {
  input();                                                 // Eingegebene Werte �bernehmen (eventuell korrigiert)
  calculation();                                           // Berechnungen
  }
  
// Reaktion auf Tastendruck (nur auf Enter-Taste):
// Seiteneffekt pixL, rPix, omega, v, pixV, vPix, a, pixA, aPix, f, pixF, fPix, pixT, t, t0, tU, phi, sinPhi, cosPhi, xPix, yPix
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten �bernehmen und rechnen                          
  paint();                                                 // Neu zeichnen
  }

// Reaktion auf Radiobutton:
// Seiteneffekt nrSize

function reactionRadioButton () {
  if (rb1.checked) nrSize = 0;                             // Entweder Position ...
  else if (rb2.checked) nrSize = 1;                        // ... oder Geschwindigkeit ...
  else if (rb3.checked) nrSize = 2;                        // ... oder Beschleunigung ...
  else nrSize = 3;                                         // ... oder Kraft ausw�hlen
  if (!on) paint();                                        // Falls Animation nicht l�uft, neu zeichnen
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

// Umrechnungsfaktor (Pixel/Einheit):
// maxReal .... Maximaler Wert (Einheit)
// maxPixel ... Maximale Streckenl�nge (Pixel, im Idealfall durch 100 teilbar)
// R�ckgabewert: 5-fache, 2-fache oder 1-fache Zehnerpotenz mal maximale Streckenl�nge
  
function pix (maxReal, maxPixel) {
  var f = maxPixel;                                        // Startwert
  if (maxReal < 1) {                                       // Falls maximaler Wert kleiner als 1 ...                                     
    var n = Math.ceil(-Math.log(maxReal)/Math.LN10);       // Zehnerexponent von 1/maxReal (aufgerundet)
    for (var i=0; i<n; i++) f *= 10;                       // Multiplikation mit der entsprechenden Zehnerpotenz
    }
  var q = maxPixel/maxReal; 
  while (true) {                                           // Endlosschleife 
    f /= 2; if (f <= q) break;                             // 5-mal Zehnerpotenz
    f /= 2.5; if (f <= q) break;                           // 2-mal Zehnerpotenz
    f /= 2; if (f <= q) break;                             // 1-mal Zehnerpotenz
    }
  return f;
  }
  
// Unterteilung der senkrechten Achse (Zehnerexponent):
// pix ... Umrechnungsfaktor (Pixel pro Einheit, darf nicht gleich 0 sein!) 
  
function exponent10 (pix) {
  var q = 50/pix;
  var log = Math.log(q)/Math.LN10;                         // Zehnerlogarithmus von q
  return Math.round(log);
  }
    
// Unterteilung der senkrechten Achse (Abschnitt):
// pix ... Umrechnungsfaktor (Pixel pro Einheit, darf nicht gleich 0 sein!)
  
function segment (pix) {
  var n = exponent10(pix);
  var dy = Math.pow(10,n);  	
  return dy*pix;
  }
  
// Hilfsroutine: Zeichenkette f�r Vergleichsl�nge (m)
  
function stringBaseLine () {
  var n = exponent10(pixL);
  var l = Math.pow(10,n);
  n = -n; if (n < 0) n = 0;
  var s = l.toFixed(n).replace(".",decimalSeparator);
  return s+" "+meterUnicode;
  }
  
// Zeichenkette f�r Beschriftung (senkrechte Achse bzw. Vergleichsl�nge/Vergleichspfeil)
// n ... Zahl der Abschnitte
// e ... Flag f�r Einheit
// h ... Flag f�r Halbierung der Abschnitte
  
function stringTick (n, e, h) {
  var digits = exponent10(pixSI);
  var wert = n*Math.pow(10,digits);
  digits = Math.max(-digits,0);
  if (h) digits++;
  var s = ToString(wert,digits,true);                      // Zeichenkette f�r Zahlenwert
  if (!e || nrSize == 0) return s;                         // Keine Einheit anh�ngen ...
  else if (nrSize == 1) return s+" "+meterPerSecond;       // ... oder Einheit m/s anh�ngen ...
  else if (nrSize == 2) return  s+" "+meterPerSecond2;     // ... oder Einheit m/s� anh�ngen ...
  else return s+" "+newton;                                // ... oder Einheit N anh�ngen
  }

// Berechnungen:
// Seiteneffekt pixL, rPix, omega, v, pixV, vPix, a, pixA, aPix, f, pixF, fPix, pixT  

function calculation () {
  pixL = pix(r,100);                                       // Umrechnungsfaktor L�nge (Pixel pro m)
  rPix = r*pixL;                                           // Radius (Pixel)
  omega = 2*Math.PI/tPer;                                  // Winkelgschwindigkeit (1/s)
  v = r*omega;                                             // Geschwindigkeit (m/s) 
  pixV = pix(v,100);                                       // Umrechnungsfaktor Geschwindigkeit (Pixel pro m/s)
  vPix = v*pixV;                                           // Geschwindigkeit (Pixel)
  a = v*omega;                                             // Zentripetalbeschleunigung (m/s�)
  pixA = pix(a,100);                                       // Umrechnungsfaktor Beschleunigung (Pixel pro m/s�)
  aPix = a*pixA;                                           // Zentripetalbeschleunigung (Pixel)
  f = m*a;                                                 // Zentripetalkraft (N)
  pixF = pix(f,100);                                       // Umrechnungsfaktor Kraft (Pixel pro N)
  fPix = f*pixF;                                           // Zentripetalkraft (Pixel)
  pixT = 20;                                               // Umrechnungsfaktor Zeit (Pixel pro s)
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
// Seiteneffekt r, tPer, m

function input () {
  r = inputNumber(ipR,3,true,0.1,10);                      // Radius (m)
  tPer = inputNumber(ipT,3,true,1,10);                     // Umlaufdauer (s)
  m = inputNumber(ipM,3,true,0.1,10);                      // Masse (kg)
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ipR.value = ToString(r,3,true);                          // Eingabefeld f�r Radius (m)
  ipT.value = ToString(tPer,3,true);                       // Eingabefeld f�r Umlaufdauer (s)
  ipM.value = ToString(m,3,true);                          // Eingabefeld f�r Masse (kg)
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
// c ....... F�llfarbe (optional)

function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                // F�llfarbe
  newPath();                                               // Neuer Pfad
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  if (c) ctx.fill();                                       // Kreis ausf�llen, falls gew�nscht
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
  ctx.fillStyle = ctx.strokeStyle;                         // F�llfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                                     // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                                   // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                                       // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                                   // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                                         // Zur�ck zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen 
  }
  
// Hilfsroutine: Vergleichspfeil (SI-Einheit)
    
function arrowComparison (c) {
  var s = stringTick(1,true,false);                        // Zeichenkette (Zehnerpotenz mit Einheit)
  var a = segment(pixSI);                                  // L�nge des Pfeils (Pixel)
  ctx.strokeStyle = c;                                     // Farbe �bernehmen
  arrow(MX,350,MX+a,350,3);                                // Pfeil zeichnen
  alignText(s,1,MX+a/2,340);                               // Beschriftung �ber dem Pfeil (zentriert)    
  }
    
// Hilfsroutine: Pfeil (vom K�rper weg), Hilfslinien
// c ....... Farbe
// (x,y) ... Koordinaten der Pfeilspitze
    
function arrows (c, x, y) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  line(x,y,x,yPix);                                        // Senkrechte Hilfslinie      
  line(x,y,xPix,y);                                        // Waagrechte Hilfslinie
  ctx.strokeStyle = c;                                     // Farbe �bernehmen
  arrow(xPix,yPix,x,y,3);                                  // Dicker Pfeil (vom K�rper weg)
  arrow(xPix,yPix,x,yPix,1);                               // D�nner Pfeil f�r waagrechte Komponente
  arrow(xPix,yPix,xPix,y,1);                               // D�nner Pfeil f�r senkrechte Komponente
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
  
// Zentrierter Text mit Index:
// s1 ...... Normaler Text
// s2 ...... Index
// (x,y) ... Position
    
function centerTextIndex (s1, s2, x, y) {
  var w1 = ctx.measureText(s1).width;                      // Breite von s1 (Pixel) 
  var w2 = ctx.measureText(s2).width;                      // Breite von s2 (Pixel)
  var x0 = x-(w1+w2)/2;                                    // x-Koordinate f�r Beginn
  alignText(s1,0,x0,y);                                    // Normaler Text
  alignText(s2,0,x0+w1+1,y+5);                             // Index
  }
  
// Zentrierte Ausgabe von zwei Texten mit Indizes:
// s1 ...... Erster normaler Text
// s2 ...... Erster Index
// s3 ...... Zweiter normaler Text
// s4 ...... Zweiter Index
// (x,y) ... Position
  
function center2TextIndex (s1, s2, s3, s4, x, y) {
  var w1 = ctx.measureText(s1).width;                      // Breite des ersten normalen Textes (Pixel) 
  var w2 = ctx.measureText(s2).width;                      // Breite des ersten Index (Pixel)                  
  var w3 = ctx.measureText(s3).width;                      // Breite des zweiten normalen Textes (Pixel)
  var w4 = ctx.measureText(s4).width;                      // Breite des zweiten Index (Pixel)
  var x0 = x-(w1+w2+w3+w4)/2;                              // x-Koordinate f�r Beginn 
  alignText(s1,0,x0,y);                                    // Erster normaler Text
  alignText(s2,0,x0+w1+1,y+5);                             // Erster Index
  alignText(s3,0,x0+w1+w2,y);                              // Zweiter normaler Text
  alignText(s4,0,x0+w1+w2+w3+1,y+5);                       // Zweiter Index
  }
  
// Ausgabe eines Zahlenwertes:
// s1 ...... Bezeichnung der Gr��e
// s2 ...... Index der Bezeichnung
// w ....... Zahlenwert
// u ....... Einheit
// n ....... Anzahl der g�ltigen Ziffern
// (x,y) ... Position
  
function writeValue (s1, s2, w, u, n, x, y) {
  var w1 = ctx.measureText(s1).width;                      // Breite der Gr��enbezeichnung (Pixel)
  var w2 = ctx.measureText(s2).width;                      // Breite des Index (Pixel)
  alignText(s1,0,x,y);                                     // Bezeichnung der Gr��e
  alignText(s2,0,x+w1,y+5);                                // Index
  var s = " = "+w.toPrecision(n)+" "+u;                    // Zeichenkette (Gleichheitszeichen, Zahlenwert und Einheit)
  s = s.replace(".",decimalSeparator);                     // Eventuell Punkt durch Komma ersetzen
  alignText(s,0,x+w1+w2,y);                                // Restliche Ausgabe
  }
    
// Hilfsroutine: Ausgabe von Betrag und Komponenten
// t ...... Bezeichnung der Gr��e
// s ...... Symbol der Gr��e
// u ...... Einheit
// b ...... Betrag
// x, y.... Komponenten
// posY ... Abstand vom oberen Rand (Pixel)
    
function writeValuesXY (t, s, u, b, x, y, posY) {
  var posX1 = DX+20;                                       // x-Koordinate f�r Zahlenangaben 
  var posX2 = DX+150;                                      // x-Koordinate f�r Erl�uterungen 
  alignText(t,0,DX,posY);                                  // Bezeichnung der Gr��e ausgeben
  posY += 20;                                              // Zur n�chsten Zeile
  writeValue(s,"",b,u,3,posX1,posY);                       // Betrag ausgeben
  alignText(text23,0,posX2,posY);                          // Erl�uterung (Betrag)
  posY += 20;                                              // Zur n�chsten Zeile
  writeValue(s,symbolX,x,u,3,posX1,posY);                  // x-Komponente ausgeben
  alignText(text21,0,posX2,posY);                          // Erl�uterung (in x-Richtung)
  posY += 20;                                              // Zur n�chsten Zeile
  writeValue(s,symbolY,y,u,3,posX1,posY);                  // y-Komponente ausgeben
  alignText(text22,0,posX2,posY);                          // Erl�uterung (in y-Richtung)
  }
  
// Waagrechte Achse mit Ticks und Beschriftung f�r Diagramm:
// (x,y) ... Ursprung
  
function horizontalAxis (x, y) {
  newPath();                                               // Neuer Grafikpfad 
  arrow(x-20,y,x+240,y);                                   // Waagrechte Achse zeichnen
  var t0 = Math.ceil(tU);                                  // Zeit f�r ersten Tick (s)
  var x0 = x+pixT*(t0-tU);                                 // Position des ersten Ticks             
  for (var i=0; i<=10; i++) {                              // F�r alle Ticks ...                    
    var xT = x0+i*pixT;                                    // Waagrechte Koordinate des Ticks
    line(xT,y-3,xT,y+3);                                   // Tick zeichnen
    if (xT >= x+5 && xT <= x+215                           // Falls Tick nicht zu weit links oder zu weit rechts ... 
    && (t0+i <= 100 || (t0+i)%2 == 0))                     // ... und Platz f�r Beschriftung vorhanden ...
      alignText(""+(t0+i),1,xT,y+13);                      // ... Beschriftung vornehmen 
      }
    alignText(symbolTime,1,DX+230,DY+18);                  // Beschriftung (t)
    alignText(text16,1,DX+230,DY+30);                      // Angabe der Einheit (s)
    }
      
// Senkrechte Achse mit Ticks und Beschriftung f�r Diagramm:
// (x,y) ..... Ursprung (Pixel)
// yMin ...... Unteres Ende der Achse (Pixel)
// yMax ...... Oberes Ende der Achse (Pixel)
  
function verticalAxis (x, y, yMin, yMax) { 
  arrow(x,yMin,x,yMax);                                    // Senkrechte Achse zeichnen
  var dyPix = segment(pixSI);                              // Abstand zwischen zwei Ticks (vorl�ufig)
  var bigDist = false;                                     // Flag f�r gro�en Abstand 
  if (dyPix > 50) {                                        // Falls Abstand zu gro� ...
    dyPix /= 2;                                            // ... Abstand halbieren
    bigDist = true;                                        // ... Flag �ndern
    }
  var i0 = Math.floor((y-yMax)/dyPix-0.5);                 // Maximaler Betrag f�r Laufindex 
  for (var i=-i0; i<=i0; i++) {                            // F�r alle Ticks ...
    var yT = y-i*dyPix;                                    // Senkrechte Koordinate des Ticks 
    if (yT > yMin-10) continue;                            // Falls Tick zu weit unten, weiter zum n�chsten Tick
    if (yT < yMax+10) break;                               // Falls Tick zu weit oben, abbrechen
    if (yT == y) continue;                                 // Falls Tick auf t-Achse, weiter zum n�chsten Tick    
    line(x-3,yT,x+3,yT);                                   // Tick zeichnen
    var ii = (bigDist ? i/2.0 : i);                        // Index gegebenenfalls halbieren
    alignText(stringTick(ii,false,bigDist),2,x-5,yT+5);    // Beschriftung vornehmen
    }
  }
  
// Sinuskurve (N�herung durch Polygonzug):
// (x,y) ... Nullpunkt (Pixel)
// per ..... Periode (Pixel)
// ampl .... Amplitude (Pixel)
// xMin .... Minimaler x-Wert (Pixel)
// xMax .... Maximaler x-Wert (Pixel)

function sinus (x, y, per, ampl, xMin, xMax) {
  var omega = 2*Math.PI/per;                               // Hilfsgr��e
  var xx = xMin;                                           // x-Koordinate des Anfangspunktes
  var yy = y-ampl*Math.sin(omega*(xx-x));                  // y-Koordinate des Anfangspunktes
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.moveTo(xx,yy);                                       // Anfangspunkt des Polygonzugs 
  while (xx < xMax) {                                      // Solange rechter Rand nicht erreicht ...
    xx++; yy = y-ampl*Math.sin(omega*(xx-x));              // Koordinaten des n�chsten Punktes
    ctx.lineTo(xx,yy);                                     // Strecke zum Grafikpfad hinzuf�gen
    }
  ctx.stroke();                                            // Kurve zeichnen
  }
    
// Diagramm mit zwei Kurven:
// typ1, typ2 ... Sinus (0), Cosinus (1), -Sinus (2), -Cosinus (3)
// (x,y) ........ Ursprung (Pixel)
// yMax ......... Amplitude (SI-Einheit)

function diagram (typ1, typ2, x, y, yMax) { 
  horizontalAxis(x,y);                                     // Waagrechte Achse (Zeit-Achse)
  verticalAxis(x,y,y+130,y-140);                           // Senkrechte Achse
  var per = tPer*pixT;                                     // Periode (Pixel)
  var ampl = yMax*pixSI;                                   // Amplitude (Pixel)
  sinus(x-(typ1*tPer/4+tU)*pixT,y,per,ampl,x,x+200);       // Erste Sinuskurve 
  sinus(x-(typ2*tPer/4+tU)*pixT,y,per,ampl,x,x+200);       // Zweite Sinuskurve
  }
  
// Markierung des momentanen Wertes durch einen Kreis:
// v ....... Wert
// (x,y) ... Position des Ursprungs
// c ....... Farbe
  
function markMomWert (v, x, y, c) {
  x += (t-tU)*pixT; y -= v*pixSI;                          // Koordinaten
  circle(x,y,2.5,c);                                       // Kreis zeichnen
  }
  
// Grafik-Ausgabe zur Position:

function drawPosition () {
  pixSI = pixL;                                            // Umrechnungsfaktor (Pixel pro m)
  diagram(1,0,DX,DY,r);                                    // Diagramm (x und y als Funktion von t)
  alignText(symbolsXY,1,DX+20,DY-125);                     // Beschriftung der senkrechten Achse (x, y)
  alignText(text17,1,DX+20,DY-110);                        // Angabe der Einheit (m)
  ctx.fillStyle = colorPosition;                           // Farbe f�r Position
  alignText(text11,0,DX,350);                              // �berschrift: Position 
  var x = r*cosPhi, y = r*sinPhi;                          // Koordinaten (m)
  writeValue(symbolX,"",x,meterUnicode,3,DX+20,370);       // Ausgabe der x-Koordinate
  alignText(text21,0,DX+150,370);                          // Erl�uterung (x-Richtung)
  writeValue(symbolY,"",y,meterUnicode,3,DX+20,390);       // Ausgabe der y-Koordinate
  alignText(text22,0,DX+150,390);                          // Erl�uterung (y-Richtung)
  line(xPix,yPix,xPix,MY);                                 // Senkrechte Hilfslinie     
  line(xPix,yPix,MX,yPix);                                 // Waagrechte Hilfslinie
  ctx.strokeStyle = colorPosition;                         // Farbe f�r Position
  arrow(MX,MY,xPix,yPix,3);                                // Dicker Pfeil (Radiusvektor)
  arrow(MX,MY,xPix,MY,1);                                  // D�nner Pfeil (x-Komponente)
  arrow(MX,MY,MX,yPix,1);                                  // D�nner Pfeil (y-Komponente)
  markMomWert(x,DX,DY,colorPosition);                      // Momentaner x-Wert im Diagramm
  markMomWert(y,DX,DY,colorPosition);                      // Momentaner y-Wert im Diagramm 
  }
  
// Hilfsroutine f�r Geschwindigkeit, Beschleunigung und Kraft: 
// Pfeile mit Hilfslinien, Markierungen im Diagramm, Vergleichspfeil
// (xA,yA) ... Position der Pfeilspitze
// compX ..... x-Komponente
// compY ..... y-Komponente
// c ......... Farbe

function drawVAF (xA, yA, compX, compY, c) {
  arrows(c,xA,yA);                                         // Pfeile mit Hilfslinien
  markMomWert(compX,DX,DY,c);                              // Momentaner Wert der x-Komponente im Diagramm
  markMomWert(compY,DX,DY,c);                              // Momentaner Wert von y-Komponente im Diagramm
  arrowComparison(c);                                      // Vergleichspfeil
  }
      
// Grafik-Ausgabe zur Geschwindigkeit:

function drawVelocity () {
  pixSI = pixV;                                            // Umrechnungsfaktor (Pixel pro m/s)
  diagram(2,1,DX,DY,v);                                    // Diagramm (v_x und v_y als Funktion von t)
  var sv = symbolVelocity;                                 // Abk�rzung f�r Geschwindigkeit
  center2TextIndex(sv,symbolX," , "+sv,symbolY,            // Beschriftung der senkrechten Achse (v_x, v_y)
    DX+30,DY-120);  
  alignText(text18,1,DX+30,DY-100);                        // Angabe der Einheit (m/s)
  ctx.fillStyle = colorVelocity;                           // Farbe f�r Geschwindigkeit
  alignText(text13,0,DX,310);                              // �berschrift (Winkelgeschwindigkeit)
  writeValue(symbolAngVel,"",omega,radPerSecond,3,DX+20,330); // Ausgabe der Winkelgeschwindigkeit
  var vx = -v*sinPhi, vy = v*cosPhi;                       // Geschwindigkeitskomponenten
  writeValuesXY(text12,sv,meterPerSecond,v,vx,vy,360);     // Ausgabe der Geschwindigkeitskomponenten
  var xA = xPix-vPix*sinPhi, yA = yPix-vPix*cosPhi;        // Koordinaten der Pfeilspitze
  drawVAF(xA,yA,vx,vy,colorVelocity);                      // Pfeile und Markierungen      
  }
      
// Grafik-Ausgabe zur (Zentripetal-)Beschleunigung:
  
function drawAcceleration () {
  pixSI = pixA;                                            // Umrechnungsfaktor (Pixel pro m/s�)
  diagram(3,2,DX,DY,a);                                    // Diagramm (a_x und a_y als Funktion von t)
  var sa = symbolAcceleration;                             // Abk�rzung f�r Beschleunigung
  center2TextIndex(sa,symbolX," , "+sa,symbolY,            // Beschriftung der senkrechten Achse (a_x, a_y)
    DX+30,DY-120);
  alignText(text19,1,DX+30,DY-100);                        // Angabe der Einheit (m/s�)
  ctx.fillStyle = colorAcceleration;                       // Farbe f�r Beschleunigung     
  var ax = -a*cosPhi, ay = -a*sinPhi;                      // Beschleunigungskomponenten
  writeValuesXY(text14,sa,meterPerSecond2,a,ax,ay,340);    // Ausgabe der Beschleunigungskomponenten
  var xA = xPix-aPix*cosPhi, yA = yPix+aPix*sinPhi;        // Koordinaten der Pfeilspitze
  drawVAF(xA,yA,ax,ay,colorAcceleration);                  // Pfeile und Markierungen
  }
      
// Grafik-Ausgabe zur (Zentripetal-)Kraft:
  
function drawForce () {
  pixSI = pixF;                                            // Umrechnungsfaktor (Pixel pro N)
  diagram(3,2,DX,DY,f);                                    // Diagramm (F_x und F_y als Funktion von t)
  var sf = symbolForce;                                    // Abk�rzung f�r Kraft
  center2TextIndex(sf,symbolX," , "+sf,symbolY,            // Beschriftung der senkrechten Achse (F_x, F_y)            
    DX+25,DY-120);
  alignText(text20,1,DX+25,DY-100);                        // Angabe der Einheit (N)
  ctx.fillStyle = colorForce;                              // Farbe f�r Kraft      
  var fx = -f*cosPhi, fy = -f*sinPhi;                      // Kraftkomponenten
  writeValuesXY(text15,sf,newton,f,fx,fy,340);             // Ausgabe der Kraftkomponenten 
  var xA = xPix-fPix*cosPhi, yA = yPix+fPix*sinPhi;        // Koordinaten der Pfeilspitze
  drawVAF(xA,yA,fx,fy,colorForce);                         // Pfeile und Markierungen
  }

// Grafikausgabe:
// Seiteneffekt t, t0, tU, phi, sinPhi, cosPhi, xPix, yPix 
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausf�llen
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // ... Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // ... L�nge des Zeitintervalls (s)
    if (slow) dt /= 10;                                    // ... Falls Zeitlupe, Zeitintervall durch 10 dividieren
    t += dt;                                               // ... Zeitvariable aktualisieren
    t0 = t1;                                               // ... Neuer Anfangszeitpunkt
    tU = (t<5 ? 0 : t-5);                                  // Zeit f�r Ursprung eines Diagramms
    }
  ctx.font = FONT1;                                        // Zeichensatz
  ctx.fillStyle = ctx.strokeStyle = "#000000";             // F�llfarbe schwarz
  alignText(symbolX,1,MX+115,MY+15);                       // Beschriftung x-Achse
  alignText(symbolY,2,MX-10,MY-110);                       // Beschriftung y-Achse
  arrow(MX-120,MY,MX+120,MY);                              // x-Achse
  arrow(MX,MY+120,MX,MY-120);                              // y-Achse
  circle(MX,MY,rPix);                                      // Kreisbahn
  phi = t*omega;                                           // Phasenwinkel (Bogenma�)
  sinPhi = Math.sin(phi); cosPhi = Math.cos(phi);          // Trigonometrische Werte
  xPix = MX+rPix*cosPhi; yPix = MY-rPix*sinPhi;            // Koordinaten (Pixel)                                 
  circle(xPix,yPix,5,colorBody);                           // K�rper
  var a = segment(pixL);                                   // Vergleichsl�nge
  line(MX,380,MX+a,380);                                   // Waagrechte Linie
  line(MX,377,MX,383);                                     // Linkes Ende der Linie
  line(MX+a,377,MX+a,383);                                 // Rechtes Ende der Linie
  var s = stringBaseLine();                                // Zeichenkette f�r Vergleichsl�nge
  ctx.fillStyle = "#000000";                               // Schriftfarbe schwarz
  alignText(s,1,MX+a/2,375);                               // Beschriftung f�r Vergleichsl�nge
  switch (nrSize) {                                        // Je nach ausgew�hlter Gr��e ...
    case 0: drawPosition(); break;                         // ... Grafik-Ausgabe zur Position
    case 1: drawVelocity(); break;                         // ... Grafik-Ausgabe zur Geschwindigkeit
    case 2: drawAcceleration(); break;                     // ... Grafik-Ausgabe zur Beschleunigung
    case 3: drawForce(); break;                            // ... Grafik-Ausgabe zur Kraft
    }
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen

