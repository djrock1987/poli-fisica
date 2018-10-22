// Hebelgesetz
// Java-Applet (02.11.1997), umgewandelt in HTML5/Javascript
// 02.04.2016 - 05.04.2016

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel lever_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorLever1 = "#00ff00";                               // Farbe für Hebel (1)
var colorLever2 = "#ffc040";                               // Farbe für Hebel (2)
var colorLever3 = "#c0c0c0";                               // Farbe für Stativ
var	colorLeft = "#ff0000";                                 // Farbe für linksseitige Drehmomente
var colorRight = "#0000ff";                                // Farbe für rechtsseitige Drehmomente

// Sonstige Konstanten:

var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz
var N = 11;                                                // Zahl der Felder pro Hebelarm
var DX = 20;                                               // Größe eines Felds (Pixel)
var DY = 6;                                                // Halbe Hebelbreite (Pixel)

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var mx, my;                                                // Position Drehachse (Pixel)
var left, right;                                           // Arrays für Zahl der Massenstücke (links/rechts)
var pgLever;                                               // Array für Polygonecken (ganzer Hebel)
var pgField;                                               // Doppelt indiziertes Array für Polygonecken (einzelne Felder)
var leftTorque, rightTorque;                               // Links- und rechtsseitiges Drehmoment
var cos, sin;                                              // Trigonometrische Werte für Drehmatrix
var hole;                                                  // Array für Koordinaten der Löcher
var drag;                                                  // Flag für Zugmodus
var mouseX, mouseY;                                        // Position Mauszeiger (Pixel)

// Start:
	
function start () {
  canvas = document.getElementById("cv");                  // Zeichenfläche
  width = canvas.width; height = canvas.height;            // Abmessungen (Pixel)
  ctx = canvas.getContext("2d");                           // Grafikkontext
  mx = width/2; my = 80;                                   // Position Drehachse (Pixel)
  left = new Array(N); right = new Array(N);               // Arrays für Zahl der Massenstücke links/rechts
  pgLever = new Array(4);;                                 // Array für Polygonecken (ganzer Hebel)
  pgField = new Array(N);                                  // Arrays für Polygonecken (einzelne Felder)
  for (var i=0; i<N; i++)                                  // Für alle Indizes ...
    pgField[i] = new Array(4);                             // Array für Ecken eines einzelnen Feldes
  for (var i=0; i<N; i++)                                  // Für alle Indizes ...
    left[i] = right[i] = 0;                                // Zunächst keine Massenstücke
  left[3] = 4; right[6] = 2;                               // Anfangssituation
  hole = new Array(2*N-1);                                 // Array für Koordinaten der Löcher
  drag = false;                                            // Flag für Zugmodus
  calculation();                                           // Berechnungen
  paint();                                                 // Zeichnen
  
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Drücken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Berührung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Berührung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers   
  }
  
// Reaktion auf Drücken der Maustaste:
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen                    
  }
  
// Reaktion auf Berührung:
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Berührpunkte, erster Punkt
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen
  if (drag) e.preventDefault();                            // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Loslassen der Maustaste:
  
function reactionMouseUp (e) {                                             
  drag = false;                                            // Zugmodus deaktivieren 
  reactionUp(e.clientX,e.clientY);                         // Hilfsroutine aufrufen                           
  }
  
// Reaktion auf Ende der Berührung:
  
function reactionTouchEnd (e) {             
  drag = false;                                            // Zugmodus deaktivieren
  var obj = e.changedTouches[0];                           // Liste der Berührpunkte, erster Punkt
  reactionUp(obj.clientX,obj.clientY);                     // Hilfsroutine aufrufen
  }
  
// Reaktion auf Bewegen der Maus:
  
function reactionMouseMove (e) { 
  if (!drag) return;                                       // Abbrechen, falls Zugmodus nicht aktiviert
  reactionMove(e.clientX,e.clientY);                       // Position ermitteln, rechnen und neu zeichnen   
  }
  
// Reaktion auf Bewegung des Fingers:
  
function reactionTouchMove (e) {   
  if (!drag) return;                                       // Abbrechen, falls Zugmodus nicht aktiviert
  var obj = e.changedTouches[0];                           // Liste der neuen Fingerpositionen, erster Punkt     
  reactionMove(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen
  e.preventDefault();                                      // Standardverhalten verhindern    
  }
  
// Hilfsroutine für reactionDown und reactionMove: Massenstück hinzufügen oder wegnehmen
// (u,v) ... Mausposition (Pixel)
// add ... +1 für Hinzufügen oder -1 für Wegnehmen
// Seiteneffekt left, right

function updateLeftRight (u, v, add) {
  if (add != 1 && add != -1) return;                       // Falls unzulässiger Wert, abbrechen
  var pos = number(u,v);                                   // Nummer eines Lochs
  if (pos >= 0 && pos < N-1) {                             // Falls linke Seite des Hebels ...
    var i = N-1-pos;                                       // Index im Array left 
    if (add == 1 && left[i] < 10) left[i]++;               // Gegebenenfalls Massenstück hinzufügen
    if (add == -1 && left[i] > 0) left[i]--;               // Gegebenenfalls Massenstück wegnehmen
    }
  if (pos > N-1 && pos <= 2*N-2) {                         // Falls rechte Seite des Hebels ...
    i = pos+1-N;                                           // Index im Array right
    if (add == 1 && right[i] < 10) right[i]++;             // Gegebenenfalls Massenstück hinzufügen
    if (add == -1 && right[i] > 0) right[i]--;             // Gegebenenfalls Massenstück wegnehmen
    }
  }
  
// Hilfsroutine: Reaktion auf Mausklick oder Berühren mit dem Finger:
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt mouseX, mouseY, drag, left, right, leftTorque, rightTorque, cos, sin, pgLever, pgField, hole

function reactionDown (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel) 
  mouseX = u; mouseY = v;                                  // Position Mauszeiger
  drag = true;                                             // Flag für Zugmodus
  updateLeftRight(u,v,-1);                                 // Gegebenenfalls Massenstück wegnehmen
  calculation();                                           // Berechnungen 
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf Bewegung von Maus oder Finger:
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt mouseX, mouseY, leftTorque, rightTorque, cos, sin, pgLever, pgField, hole

function reactionMove (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel)
  mouseX = u; mouseY = v;                                  // Position Mauszeiger
  calculation();                                           // Berechnungen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf Loslassen der Maustaste oder Ende der Berührung:
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt mouseX, mouseY, left, right, drag, leftTorque, rightTorque, cos, sin, pgLever, pgField, hole
  
function reactionUp (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel)  
  mouseX = u; mouseY = v;                                  // Position Mauszeiger
  updateLeftRight(u,v,1);                                  // Gegebenenfalls Massenstück hinzufügen
  drag = false;                                            // Flag für Zugmodus
  calculation();                                           // Berechnungen
  paint();                                                 // Neu zeichnen
  }
  
//-------------------------------------------------------------------------------------------------

// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag für Nachkommastellen (im Gegensatz zu gültigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }

// Drehung eines Punktes um die Drehachse:
// (x,y) ... ursprünglicher Punkt (Koordinaten bezüglich Drehachse)
// Drehwinkel durch globale Variable sin und cos gegeben
// Ergebnisse in Fensterkoordinaten

function rotatePoint (x, y) {
  return {u: mx+cos*x-sin*y, v: my-sin*x-cos*y};
  }
  
// Festlegen einer Polygonecke:
// p ....... Array für Ecken des Polygons
// i ....... Index der Ecke
// (x,y) ... Koordinaten
  
function setVertex (p, i, x, y) {
  p[i] = rotatePoint(x,y);
  }
  
// Festlegen der Ecken eines (eventuell gedrehten) Rechtecks:

function setRectangle (pg, xL, xR) {
  setVertex(pg,0,xL,-DY);                                  // Ecke links unten 
  setVertex(pg,1,xR,-DY);                                  // Ecke rechts unten
  setVertex(pg,2,xR,DY);                                   // Ecke rechts oben
  setVertex(pg,3,xL,DY);                                   // Ecke links oben
  }

// Berechnungen:
// Seiteneffekt leftTorque, rightTorque, cos, sin, pgLever, pgField, hole

function calculation () {
  leftTorque = rightTorque = 0;                            // Startwert für links-/rechtsseitiges Drehmoment
  for (var i=1; i<N; i++) leftTorque += i*left[i];         // Linksseitiges Drehmoment
  for (i=1; i<N; i++) rightTorque += i*right[i];           // Rechtsseitiges Drehmoment
  if (leftTorque > rightTorque)  {cos = 0.96; sin = 0.28;} // Linksseitiges Drehmoment größer
  else if (leftTorque == rightTorque) {cos = 1; sin = 0;}  // Gleichgewicht
  else {cos = 0.96; sin = -0.28;}                          // Rechtsseitiges Drehmoment größer
  setRectangle(pgLever,-N*DX,N*DX);                        // Ecken des ganzen Hebels festlegen
  for (i=0; i<N; i++)                                      // Für alle andersfarbigen Felder ...
    setRectangle(pgField[i],(1-N+2*i)*DX,(2-N+2*i)*DX);    // Ecken festlegen
  for (i=0; i<2*N-1; i++) {                                // Für alle Indizes des Arrays hole ...
    var h = (i+1-N)*DX;                                    // Position relativ zum Mittelpunkt (ohne Drehung)
    hole[i] = rotatePoint(h,0);                            // Position des Lochs speichern
    }
  }
  
// Nummer einer Aufhängung (abhängig von Mausposition):
// (x,y) ... Mausposition (Pixel)
// Rückgabewert: 0 bis N-2 für linke Seite, N bis 2N-2 für rechte Seite, bei Misserfolg -1

function number (x, y) {
  for (var i=0; i<2*N-1; i++) {                            // Für alle Indizes des Arrays hole ...
    if (i == N-1) continue;                                // Index für Mittelpunkt überspringen
    var dx = x-hole[i].u, dy = y-hole[i].v;                // Koordinatendifferenzen (Pixel)
    var n = 0;                                             // Startwert für Zahl der Massenstücke
    if (i < N-1) n = left[N-1-i];                          // Zahl der Massenstücke für linke Seite des Hebels
    if (i > N-1) n = right[i+1-N];                         // Zahl der Massenstücke für rechte Seite des Hebels
    if (dx >= -5 && dx <= +5 && dy >= -5 && dy <= n*10+5)  // Falls Position im Bereich der hängenden Massenstücke ... 
      return i;                                            // Rückgabewert
    }
  return -1;                                               // Rückgabewert bei Misserfolg
  }
  
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
  }
  
// Linie:
// (x1,y1) ... Anfangspunkt (Koordinaten bezüglich Mittelpunkt)
// (x2,y2) ... Endpunkt (Koordinaten bezüglich Mittelpunkt)
// c ......... Farbe (optional)
// w ......... Liniendicke (optional, Defaultwert 1)

function line (x1, y1, x2, y2, c, w) {
  ctx.beginPath();                                         // Neuer Grafikpfad
  if (c) ctx.strokeStyle = c;                              // Linienfarbe, falls angegeben
  ctx.lineWidth = (w ? w : 1);                             // Liniendicke, falls angegeben
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Achsenparalleles Rechteck mit schwarzem Rand:
// (x,y) ... Ecke links oben
// w ....... Breite
// h ....... Höhe
// c ....... Füllfarbe

function rectangle (x, y, w, h, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausfüllen
  ctx.strokeRect(x,y,w,h);                                 // Rechtecksrand (schwarz)
  }
  
// Ausgefülltes Polygon mit schwarzem Rand:
// p ... Array der Ecken
// c ... Füllfarbe
     
function polygon (p, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte) 
  ctx.moveTo(p[0].u,p[0].v);                               // Anfangspunkt
  for (var i=1; i<p.length; i++)                           // Für alle weiteren Punkte ...
    ctx.lineTo(p[i].u,p[i].v);                             // Verbindungslinie zum Grafikpfad hinzufügen
  ctx.closePath();                                         // Zurück zum Anfangspunkt
  ctx.fillStyle = c;                                       // Füllfarbe 
  ctx.fill();                                              // Polygon ausfüllen
  ctx.stroke();                                            // Schwarzer Rand
  }
  
// Ausgefüllter schwarzer Kreis:
// pt ... Mittelpunkt (Koordinaten u, v, Pixel)
// r .... Radius (Pixel)

function circle (pt, r) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.arc(pt.u,pt.v,r,0,2*Math.PI,true);                   // Kreis vorbereiten
  ctx.fillStyle = "#000000";                               // Füllfarbe
  ctx.fill();                                              // Kreis ausfüllen
  }
  
// Einzelnes Massenstück:
// (x,y) ... Position der Aufhängung (Pixel)

function mass (x, y) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  line(x,y,x,y+5);                                         // Faden
  rectangle(x-4,y+5,8,5,"#000000");                        // Massenstück
  }
  
// Massenstücke:
// dx ... Position der Aufhängung relativ zum Mittelpunkt (ohne Drehung, Pixel)
// n .... Anzahl
// c .... Farbe

function masses (dx, n, c) {
  if (n <= 0) return;                                      // Falls Anzahl nicht positiv, abbrechen
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  var pt = rotatePoint(dx,0);                              // Position der Aufhängung unter Berücksichtigung der Drehung
  var x = pt.u, y = pt.v;                                  // Koordinaten der Aufhängung
  line(x,y,x,y+5);                                         // Oberster Faden
  for (var i=0; i<n; i++) {                                // Für alle Massenstücke ...
    var yy = y+i*10+5;                                     // Senkrechte Koordinate
    line(x,yy,x,yy+5);                                     // Faden
    rectangle(x-4,yy+5,8,5,c);                             // Massenstück
    }
  } 
  
// Hebel mit Massenstücken:

function lever () {
  rectangle(mx-5,my-20,10,140,colorLever3);                // Stativ
  line(mx-150,my+120,mx+150,my+120);                       // Boden
  polygon(pgLever,colorLever1);                            // Hebel insgesamt
  for (var i=0; i<N; i++) polygon(pgField[i],colorLever2); // Andersfarbige Felder
  for (i=1; i<N; i++) masses(-i*DX,left[i],colorLeft);     // Massenstücke links   
  for (i=1; i<N; i++) masses(i*DX,right[i],colorRight);    // Massenstücke rechts
  circle(0,0,2.5);                                         // Drehachse
  for (i=0; i<2*N-1; i++) circle(hole[i],2);               // Löcher zum Aufhängen von Massenstücken 
  circle(hole[N-1],3);                                     // Drehachse 
  }
  
// Text mit Index:
// s ....... Zeichenkette ('_' als Trennzeichen zwischen normalem Text und Index)
// (x,y) ... Position (Pixel)
// Rückgabewert: x-Koordinate zum Weiterschreiben (nach Text, Index und Leerzeichen)

function textIndex (s, x, y) {
  var i = s.indexOf("_");                                  // Index für Unterstrich
  var s1 = (i>=0 ? s.substring(0,i) : s);                  // Zeichenkette vor dem Unterstrich (normaler Text)
  var s2 = (i>=0 ? s.substring(i+1) : "");                 // Zeichenkette nach dem Unterstrich (Index)
  ctx.textAlign = "left";                                  // Textausrichtung
  ctx.fillText(s1,x,y);                                    // Normalen Text ausgeben
  x += ctx.measureText(s1).width;                          // x-Koordinate für Index
  if (i >= 0) ctx.fillText(s2,x,y+4);                      // Index ausgeben
  return x+ctx.measureText(s2+" ").width;                  // Rückgabewert
  }
  
// Zeichenkette für Größenangabe:
// v ... Zahlenwert
// n ... Anzahl der Nachkommastellen
// u ... Einheit

function size (v, n, u) {
  return ToString(v,n,true)+" "+u;
  }
  
// Zeichenkette für Berechnung der Drehmomente der linken Seite:

function termLeft () {
  var s = "= ";                                            // Gleichheitszeichen und Leerzeichen
  var first = true;                                        // Flag für ersten Summanden
  for (var i=N; i>=1; i--) {                               // Für alle Indizes (von links nach rechts) ...
    var f = left[i];                                       // Kraft (N)                         
    if (f > 0) {                                           // Falls Summand größer als 0 ...
      if (!first) s += " + ";                              // Falls nötig, Pluszeichen hinzufügen
      s += size(f,1,newton)+" "+symbolMult+" "+size(i/10,2,meter); // Produkt (Kraft mal Hebelarm) hinzufügen
      first = false;                                       // Flag für ersten Summanden
      } 
    }
  return s+" =";                                           // Rückgabewert                                         
  }
  
// Zeichenkette für Berechnung der Drehmomente der rechten Seite:

function termRight () {
  var s = "= ";                                            // Gleichheitszeichen und Leerzeichen
  var first = true;                                        // Flag für ersten Summanden
  for (var i=1; i<=N; i++) {                               // Für alle Indizes (von links nach rechts) ...
    var f = right[i];                                      // Kraft (N)
    if (f > 0) {                                           // Falls Summand größer als 0 ...
      if (!first) s += " + ";                              // Falls nötig, Pluszeichen hinzufügen
      s += size(f,1,newton)+" "+symbolMult+" "+size(i/10,2,meter); // Produkt (Kraft mal Hebelarm) hinzufügen
      first = false;                                       // Flag für ersten Summanden
      } 
    }
  return s+" =";                                           // Rückgabewert
  }
  
// Ausgabe: Berechnung der Drehmomente
// nr ... 0 für linksseitig oder 1 für rechtsseitig

function output (nr) {
  if (nr != 0 && nr != 1) return;                          // Bei sinnlosem Wert von nr abbrechen
  ctx.fillStyle = (nr==0 ? colorLeft : colorRight);        // Schriftfarbe
  ctx.textAlign = "left";                                  // Textausrichtung
  var s = (nr==0 ? text01 : text02);                       // Überschrift
  var x = 20;                                              // Position waagrecht (Pixel)
  ctx.fillText(s,x,260+nr*70);                             // Erklärender Text (links- oder rechtsseitiges Drehmoment)
  s = (nr==0 ? symbolTorqueLeft : symbolTorqueRight);      // Symbol für links- oder rechtsseitiges Drehmoment
  x = textIndex(s,x,280+nr*70);                            // Symbol ausgeben (im Allgemeinen mit Index)
  var s1 = (nr==0 ? termLeft() : termRight());             // Zeichenkette für Berechnungszeile
  var torque = (nr==0 ? leftTorque : rightTorque)/10;      // Betrag des Drehmoments (einseitig)
  var s2 = "= "+ToString(torque,1,true)+" "+newton+meter;  // Zeichenkette für Ergebniszeile    
  if (torque != 0 && ctx.measureText(s1).width < 500) {    // Falls Drehmoment ungleich 0 und Term nicht zu lang ...
    ctx.fillText(s1,x,280+nr*70);                          // Rechenausdruck für Drehmoment (einseitig)
    ctx.fillText(s2,x,300+nr*70);                          // Ergebnis
    }
  else ctx.fillText(s2,x,280+nr*70);                       // Andernfalls Ergebnis ohne Rechenausdruck
  }
  
// Zeichnen:
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  ctx.font = FONT;                                         // Zeichensatz
  lever();                                                 // Hebel mit Massenstücken
  output(0);                                               // Ausgabe: Berechnung des linksdrehenden Drehmoments
  output(1);                                               // Ausgabe: Berechnung des rechtsdrehenden Drehmoments
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  ctx.textAlign = "right";                                 // Textausrichtung
  ctx.fillText(author,width-30,height-30);                 // Autor (und Übersetzer)
  if (drag) mass(mouseX,mouseY);                           // Bewegtes Massenstück 
  }

document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen


