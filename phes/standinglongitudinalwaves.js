// Stehende Längswellen
// Java-Applet (08.06.1998) umgewandelt
// 07.10.2014 - 14.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel standinglongitudinalwaves_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorElongation = "#ff0000";                           // Farbe für Elongation
var colorPressure = "#ff00ff";                             // Farbe für Druck
var colorParticle = "#0000ff";                             // Farbe der Teilchen

// Sonstige Konstanten:

var cReal = 343.5;                                         // Schallgeschwindigkeit real (20 °C, m/s)
var c = 2000;                                              // Schallgeschwindigkeit der Animation (Pixel/s)
var length = 300;                                          // Rohrlänge (Pixel)
var left = 60;                                             // Abstand vom linken Rand (Pixel)

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var rboo, rbco, rbcc;                                      // Radiobuttons (Rohrtyp)
var lbosc;                                                 // Ausgabefeld für Bezeichnung der Eigenschwingung
var bu1, bu2;                                              // Schaltknöpfe (Tiefer, Höher)
var ipl;                                                   // Eingabefeld (Rohrlänge)
var opwl, opfr;                                            // Ausgabefelder (Wellenlänge, Frequenz)
var t0;                                                    // Bezugszeitpunkt
var t;                                                     // Aktuelle Zeit (s)
var type;                                                  // Rohrtyp (0,1,2)
var nrOsc;                                                 // Nummer der Eigenschwingung
var lengthReal;                                            // Rohrlänge real (m)
var lambdaReal;                                            // Wellenlänge (m)
var lambda;                                                // Wellenlänge (Pixel)
var lambda4;                                               // Abkürzung für lambda/4
var nyReal;                                                // Frequenz real (Hz)
var omega;                                                 // Kreisfrequenz der Animation (1/s)
var k;                                                     // Wellenzahl (1/Pixel)
var aMax;                                                  // Maximale Amplitude (Pixel)
var cos;                                                   // cos(omega*t)
var xT, yT;                                                // Koordinaten (spezielles Teilchen)

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
  getElement("form",text01);                               // Erklärender Text (Rohrform)
  rboo = getElement("rboo");                               // Radiobutton (beidseitig offen)
  getElement("lboo",text02);                               // Erklärender Text (beidseitig offen)
  rboo.checked = true;                                     // Radiobutton ausgewählt
  rbco = getElement("rbco");                               // Radiobutton (einseitig offen)
  getElement("lbco",text03);                               // Erklärender Text (einseitig offen)
  rbcc = getElement("rbcc");                               // Radiobutton (beidseitig geschlossen)
  getElement("lbcc",text04);                               // Erklärender Text (beidseitg geschlossen)
  getElement("harmonic",text05);                           // Erklärender Text (Eigenschwingung)
  lbosc = getElement("lbosc");                             // Ausgabefeld (Bezeichnung der Eigenschwingung)
  bu1 = getElement("bu1",text07);                          // Schaltknopf (Tiefer)
  bu2 = getElement("bu2",text08);                          // Schaltknopf (Höher)
  getElement("ipLa",text09);                               // Erklärender Text (Rohrlänge)
  ipl = getElement("ipLb");                                // Eingabefeld (Rohrlänge)
  getElement("ipLc",meter);                                // Einheit (Rohrlänge)
  getElement("opWa",text10);                               // Erklärender Text (Wellenlänge)
  opwl = getElement("opWb");                               // Ausgabefeld (Wellenlänge)
  getElement("opWc",meter);                                // Einheit (Wellenlänge)
  getElement("opFa",text11);                               // Erklärender Text (Frequenz)
  opfr = getElement("opFb");                               // Ausgabefeld (Frequenz)
  getElement("opFc",hertz);                                // Einheit (Frequenz)
  getElement("author",author);                             // Autor
  
  type = 0;                                                // Anfangswert für Rohrtyp (beidseitig offen)
  nrOsc = 0;                                               // Anfangswert für Nummer der Eigenschwingung (Grundschwingung)
  lengthReal = 1;                                          // Anfangswert für Rohrlänge (m)
  t = 0;                                                   // Anfangswert für Zeitvariable
  t0 = new Date();                                         // Bezugszeitpunkt
  ipl.value = ToString(lengthReal,3,false);                // Eingabefeld (Rohrlänge) aktualisieren
  newOscillation();                                        // Schaltknopf "Tiefer" deaktivieren, Berechnungen
  setInterval(paint,40);                                   // Timer-Intervall 0,040 s
  
  rboo.onclick = reactionRadioButton;                      // Reaktion auf Radiobutton "beidseitig offen"
  rbco.onclick = reactionRadioButton;                      // Reaktion auf Radiobutton "einseitig offen"
  rbcc.onclick = reactionRadioButton;                      // Reaktion auf Radiobutton "beidseitig geschlossen"
  bu1.onclick = reactionLower;                             // Reaktion auf Schaltknopf "Tiefer"
  bu2.onclick = reactionHigher;                            // Reaktion auf Schaltknopf "Höher"
  ipl.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabefeld für Rohrlänge)
  
  canvas.onmousedown = function (e) {                      // Reaktion auf Drücken der Maustaste
    reactionDown(e.clientX,e.clientY);                     // Aufruf der gemeinsamen Methode                     
    }
    
  canvas.ontouchstart = function (e) {                     // Reaktion auf Berührung
    var obj = e.changedTouches[0];
    reactionDown(obj.clientX,obj.clientY);                 // Aufruf der gemeinsamen Methode
    }
    
  } // Ende der Methode start
  
// Reaktion auf Anklicken eines Radiobuttons:
// Seiteneffekt type, lengthReal, lambdaReal, lambda, lambda4, omega, k, nyReal, aMax, xT, yT

function reactionRadioButton () {
  if (rboo.checked) type = 0;                              // Wert für beidseitig offenes Rohr                  
  else if (rbco.checked) type = 1;                         // Wert für einseitig offenes Rohr
  else type = 2;                                           // Wert für beidseitg geschlossenes Rohr
  reaction();                                              // Eingegebenen Wert übernehmen, Berechnungen
  }
  
// Reaktion auf Anklicken des Schaltknopfs "Tiefer":
// Seiteneffekt nrOsc, lengthReal, lambdaReal, lambda, lambda4, omega, k, nyReal, aMax, xT, yT

function reactionLower () {
  if (nrOsc < 1) return;                                   // Falls Grundschwingung, abbrechen
  nrOsc--;                                                 // Nummer der Eigenschwingung erniedrigen
  newOscillation();                                        // Eingabe, Schaltknöpfe (de-)aktivieren, Berechnungen, Ausgabe
  }
  
// Reaktion auf Anklicken des Schaltknopfs "Höher":
// Seiteneffekt nrOsc, lengthReal, lambdaReal, lambda, lambda4, omega, k, nyReal, aMax, xT, yT

function reactionHigher () {
  if (nrOsc > 4) return;                                   // Falls 5. Oberschwingung, abbrechen
  nrOsc++;                                                 // Nummer der Eigenschwingung erhöhen
  newOscillation();                                        // Eingabe, Schalknöpfe (de-)aktivieren, Berechnungen, Ausgabe
  }
  
// Hilfsroutine: Eingabe übernehmen, rechnen, Ausgabefelder aktualisieren
// Seiteneffekt lengthReal, lambdaReal, lambda, lambda4, omega, k, nyReal, aMax, xT, yT 

function reaction () {
  input();                                                 // Eingegebene Werte übernehmen (eventuell korrigiert)
  calculation();                                           // Berechnungen, Ausgabefelder aktualisieren
  }
  
// Reaktion auf Tastendruck (nur auf Enter-Taste):
// Seiteneffekt lengthReal, lambdaReal, lambda, lambda4, omega, k, nyReal, aMax, xT, yT
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten übernehmen, rechnen, Ausgabe aktualisieren
  }
  
// Reaktion auf Mausklick oder Berühren mit dem Finger (Auswahl):
// x, y ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt xT, yT

function reactionDown (x, y) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  x -= re.left; y -= re.top;                               // Koordinaten bezüglich Zeichenfläche
  if (x >= left && x <= left+length && y >= 30 && y <= 90) // Falls Position im Bereich des Rohrs ... 
    {xT = x; yT = y;}                                      // ... Koordinaten des besonderen Teilchens festlegen,
  else xT = yT = -1;                                       // ... andernfalls negative (sinnlose) Koordinaten festlegen 
  }
   
//-------------------------------------------------------------------------------------------------

// Neue Eigenschwingung:
// Eingabe übernehmen, Ausgabefelder aktualisieren, Schaltknöpfe aktivieren bzw. deaktivieren
// Seiteneffekt lengthReal, lambdaReal, lambda, lambda4, omega, k, nyReal, aMax, xT, yT

function newOscillation () {
  input();
  lbosc.innerHTML = text06[nrOsc];                         // Ausgabefeld für Eigenschwingung aktualisieren
  bu1.disabled = (nrOsc < 1);                              // Schaltknopf "Tiefer" aktivieren oder deaktivieren
  bu2.disabled = (nrOsc > 4);                              // Schaltknopf "Höher" aktivieren oder deaktivieren
  calculation();                                           // Berechnungen, Ausgabefelder aktualisieren
  }

// Berechnungen, Aktualisierung der Ausgabefelder für Wellenlänge und Frequenz:
// Seiteneffekt lambdaReal, lambda, lambda4, omega, k, nyReal, aMax, xT, yT

function calculation () {
  var factor = (type==1 ? 4.0/(2*nrOsc+1) : 2.0/(nrOsc+1));// Faktor für Wellenlänge
  lambdaReal = factor*lengthReal;                          // Reale Wellenlänge (m)
  lambda = factor*length;                                  // Wellenlänge (Pixel)
  lambda4 = lambda/4;                                      // Viertel der Wellenlänge (Pixel)
  omega = c/(lambda*2*Math.PI);                            // Kreisfrequenz der Animation (1/s) 
  k = 2*Math.PI/lambda;                                    // Wellenzahl (1/Pixel)
  nyReal = cReal/lambdaReal;                               // Reale Frequenz (Hz)
  var s = lambdaReal.toPrecision(3);                       // Zeichenkette für Wellenlänge (m)
  opwl.innerHTML = s.replace(".",decimalSeparator);        // Ausgabefeld für Wellenlänge aktualisieren
  if (nyReal < 1000) s = nyReal.toPrecision(3);            // Zeichenkette für Frequenz (Hz) entweder mit 3 gültigen Ziffern ...
  else s = nyReal.toFixed(0);                              // ... oder auf eine ganze Zahl gerundet
  opfr.innerHTML = s.replace(".",decimalSeparator);        // Ausgabefeld für Frequenz aktualisieren
  aMax = lambda/24;                                        // Maximale Amplitude (Pixel)
  xT = yT = -1;                                            // Sinnlose Koordinaten für besonderes Teilchen
  }
  
// Berechnung der momentanen Position eines Teilchens (Pixel):
// x0 ... Ruhelage (Pixel)
  
function position (x0) {
  var arg = (x0-left)*k;                                   // Argument (Bogenmaß)
  var a = aMax*(type==0 ? Math.cos(arg) : Math.sin(arg));  // Amplitude (Pixel)
  return x0+a*cos;                                         // Rückgabewert  
  } 
  
// Berechnung der momentanen Druckabweichung (Pixel):
// x0 ... Ruhelage (Pixel)
  
function dpPixel (x0) {
  var arg = (x0-left)*k;                                   // Argument (Bogenmaß)
  var a = aMax*(type==0 ? Math.sin(arg) : -Math.cos(arg)); // Amplitude (Pixel)
  return a*cos;                                            // Rückgabewert
  } 
  
// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag für Nachkommastellen (im Gegensatz zu gültigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }
  
// Eingabe einer Zahl:
// ef .... Eingabefeld
// d ..... Zahl der Stellen
// fix ... Flag für Nachkommastellen (im Gegensatz zu gültigen Ziffern)
// min ... Minimum des erlaubten Bereichs
// max ... Maximum des erlaubten Bereichs
// Rückgabewert: Zahl oder NaN
// Wirkung auf Eingabefeld
  
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
   
// Eingabe:
// Seiteneffekt lengthReal

function input () {
  lengthReal = inputNumber(ipl,3,false,0.1,10);            // Reale Wellenlänge (m)
  }
  
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad (Standardwerte):

function newPath () {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
  }
  
// Linie zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// c ........ Farbe (optional, Defaultwert schwarz)

function line (x1, y1, x2, y2, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  if (c) ctx.strokeStyle = c;                              // Linienfarbe festlegen, falls angegeben
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
  ctx.lineWidth = 1;                                       // Liniendicke zurücksetzen
  ctx.fillStyle = ctx.strokeStyle;                         // Füllfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                                     // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                                   // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                                       // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                                   // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                                         // Zurück zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen 
  }
  
// Kreisscheibe mit schwarzem Rand zeichnen:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... Füllfarbe (optional)

function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                // Füllfarbe
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausfüllen
  ctx.stroke();                                            // Rand zeichnen
  }

// Markierungen für Knoten und Bäuche zeichnen:
// n ... Nummer der Darstellung (0 für Rohr, 1 für Elongation, 2 für Druckabweichung)
// y ... Höhe (Pixel)

function drawMarks (n, y) {
  ctx.fillStyle = "#000000";                               // Farbe schwarz
  var iMax = Math.round(length/lambda4);                   // Maximaler Index für Markierungen
  var leftNode = (type >= 1);                              // Flag für Schwingungsknoten am linken Rand
  if (n == 2) leftNode = !leftNode;                        // Flag für Druckknoten am linken Rand
  for (var i=0; i<=iMax; i++) {                            // Für alle Markierungen ...
    var xM = left+i*lambda4;                               // x-Koordinate der Markierung (Pixel)
    line(xM,y-3,xM,y+3);                                   // Kurzer Strich
    if (n == 0) continue;                                  // Falls keine Bezeichnung, weiter zur nächsten Markierung
    var s = symbolNode;                                    // Symbol für Schwingungs- oder Druckknoten
    if (leftNode && i%2 == 1 || !leftNode && i%2 == 0)     // Falls Bedingung für Bauch erfüllt ...
      s = symbolAntinode;                                  // ... Symbol für Schwingungs- oder Druckbauch
    ctx.fillText(s,xM-3,y+13);                             // Symbol ausgeben
    } // Ende der for-Schleife
  }
  
// Senkrechte Reihe von Teilchen zeichnen:
// x ...... Gleichgewichtslage (Pixel)
// yMin ... Minimaler Wert der senkrechten Bildschirmkoordinate (Pixel)
// yMax ... Maximaler Wert der senkrechten Bildschirmkoordinate (Pixel)
  
function seriesParticles (x, yMin, yMax) {
  ctx.fillStyle = colorParticle;                           // Farbe für Teilchen
  var posX = position(x);                                  // Waagrechte Bildschirmkoordinate (Pixel)
  for (var y=yMin; y<=yMax; y+=20) circle(posX,y,2);       // Reihe der Teilchen zeichnen
  }  
  	  
// Rohr mit Teilchen zeichnen:
// Seiteneffekt cos

function drawTube () {
  cos = Math.cos(omega*t);                                 // Hilfsgröße cos(omega*t)
  ctx.fillStyle = "#000000";                               // Füllfarbe schwarz
  ctx.fillRect(left,27,length,3);                          // Oberer Rand
  ctx.fillRect(left,90,length,3);                          // Unterer Rand 
  if (type >= 1) ctx.fillRect(left-3,27,3,66);             // Linker Rand
  if (type == 2) ctx.fillRect(left+length,27,3,66);        // Rechter Rand
  drawMarks(0,27);                                         // Markierungen oben 
  drawMarks(0,92);                                         // Markierungen unten
  for (var x=left+10; x<=left+length-10; x+=20)            // Für die erste, dritte, fünfte Reihe usw. ...              
    seriesParticles(x,40,80);                              // Teilchen zeichnen
  for (x=left; x<=left+length; x+=20)                      // Für die zweite, vierte, sechste Reihe usw. ...
    seriesParticles(x,50,70);                              // Teilchen zeichnen
  if (yT < 0) return;                                      // Falls kein besonderes Teilchen, abbrechen                            
  var x = position(xT);                                    // Aktuelle Position (Pixel)  
  line(xT,yT,x,yT,colorElongation);                        // Waagrechte Linie für momentane Auslenkung 
  circle(x,yT,2,colorElongation);                          // Besonderes Teilchen 
  }
  
// Sinuskurve (Näherung durch Polygonzug):
// (x,y) ... Nullpunkt (Pixel)
// per ..... Periode (Pixel)
// ampl .... Amplitude (Pixel)
// xMin .... Minimaler x-Wert (Pixel)
// xMax .... Maximaler x-Wert (Pixel)

function drawSinus (x, y, per, ampl, xMin, xMax) {
  var k = 2*Math.PI/per;                                   // Hilfsgröße
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.lineWidth = 1;                                       // Liniendicke
  ctx.moveTo(xMin,y-ampl*Math.sin(k*(xMin-x)));            // Anfangspunkt
  for (var xx=xMin+1; xx<=xMax; xx++)                      // Für alle Teilstrecken ...
    ctx.lineTo(xx,y-ampl*Math.sin(k*(xx-x)));              // Linie hinzufügen
  ctx.stroke();                                            // Polygonzug für Kurve zeichnen
  }
       
// Diagramm:
// n .... Art des Diagramms (1 für Elongation, 2 für Druckabweichung)
// x0 ... x-Wert für Beginn der Sinuskurve
// y0 ... y-Wert des Ursprungs
  
function drawDiagram (n, x0, y0) {
  var right = left+length;                                 // Rechter Rand (Pixel)
  ctx.strokeStyle = ctx.fillStyle = "#000000";             // Farbe schwarz
  var s = (n==1 ? text12 : text13);                        // Überschrift zum Diagramm
  ctx.fillText(s,left+50,y0-55);                           // Überschrift ausgeben
  arrow(left-10,y0,right+30,y0);                           // Waagrechte Achse
  ctx.fillText(symbolPosition,right+20,y0+12);             // Beschriftung der waagrechten Achse
  arrow(left,y0+65,left,y0-65);                            // Senkrechte Achse
  s = (n==1?symbolDeltaX:symbolDeltaP);                    // Symbol für Auslenkung bzw. Druckunterschied
  ctx.fillText(s,left-21,y0-55);                           // Beschriftung der senkrechten Achse
  drawSinus(x0,y0,lambda,aMax,left,right);                 // Kurve für Extrema          
  drawSinus(x0,y0,lambda,-aMax,left,right);                // Kurve für entgegengesetzte Extrema
  var c = (n==1 ? colorElongation : colorPressure);        // Farbe des Diagramms
  ctx.strokeStyle = c;                                     // Linienfarbe
  drawSinus(x0,y0,lambda,aMax*cos,left,right);             // Kurve für momentane Situation
  drawMarks(n,y0);                                         // Markierungen zeichnen        
  if (xT < 0) return;                                      // Falls kein besonderes Teilchen, abbrechen
  var y = y0-(n==1 ? position(xT)-xT : dpPixel(xT));       // Senkrechte Bildschirmkoordinate (Pixel)
  if (n == 1) circle(xT,y,2,c);                            // Falls erstes Diagramm, Markierung für momentane Auslenkung 
  line(xT,y0,xT,y,c);                                      // Senkrechte Linie zeichnen
  }

// Grafikausgabe:
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  t = (new Date()-t0)/1000;                                // Zeitvariable (s) aktualisieren
  if (xT >= left) line(xT,20,xT,height-20,"#c0c0c0");      // Falls besonderes Teilchen, senkrechte Linie zeichnen
  ctx.font = "normal normal bold 12px sans-serif";         // Zeichensatz
  drawTube();                                              // Rohr mit Teilchen zeichnen
  var x0 = (type==0 ? left-lambda4 : left);                // Hilfsgröße für Sinuskurve
  drawDiagram(1,x0,185);                                   // Diagramm zur Elongation zeichnen
  x0 = (type==0 ? left : left+lambda4);                    // Hilfsgröße für Sinuskurve       
  drawDiagram(2,x0,330);                                   // Diagramm zur Druckabweichung zeichnen
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen

