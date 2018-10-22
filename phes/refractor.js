// Keplersches Fernrohr
// Java-Applet (08.03.2000) umgewandelt
// 10.01.2016 - 11.01.2016

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabh�ngige Texte sind in einer eigenen Datei (zum Beispiel refractor_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var color1 = "#0000ff";                                    // Farbe f�r Sehwinkel Objektiv
var color2 = "#00ff00";                                    // Farbe f�r Sehwinkel Okular
var	colorLens = "#00ffff";                                 // Farbe f�r Linse
var	colorLight = "#ff0000";                                // Farbe f�r Lichtstrahlen
var	colorStars = "#ffff00";                                // Farbe f�r Sterne

// Sonstige Konstanten:

var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz
var DEG = Math.PI/180;                                     // 1 Grad (Bogenma�)
var V0 = 130;                                              // Senkrechte Koordinate der optischen Achse (Pixel)
var PIX = 250;                                             // Pixel pro m
var N = 1.6;                                               // Brechungsindex

var pleiades = [                                           // Polarkoordinaten der Sterne
  [11,3.1], [4,2.7], [2,4.6], [6,0.2], [6,1.2], [8,1]];    // (Radius in Pixeln, Winkel im Bogenma�)

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var ip1, ip2;                                              // Eingabefelder
var op1, op2, op3;                                         // Ausgabefelder

var drag;                                                  // Flag f�r Zugmodus
var uL1;                                                   // Waagrechte Koordinate Objektiv (Pixel)
var uL2;                                                   // Waagrechte Koordinate Okular (Pixel)
var f1;                                                    // Objektivbrennweite (m)
var f2;                                                    // Okularbrennweite (m)
var a1;                                                    // Halbe Dicke Objektiv (Pixel)
var a2;                                                    // Halbe Dicke Okular (Pixel)
var b1;                                                    // Halber Durchmesser Objektiv (Pixel)
var b2;                                                    // Halber Durchmesser Okular (Pixel)
var m0;                                                    // Steigung der Lichtstrahlen vor dem Objektiv
var m2;                                                    // Steigung der Lichtstrahlen nach dem Okular
var ang1;                                                  // Sehwinkel Objektiv (Bogenma�)
var ang2;                                                  // Sehwinkel Okular (Bogenma�)

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
  getElement("lb1",text01);                                // Erkl�render Text (Brennweiten)
  getElement("ip1a",text02);                               // Erkl�render Text (Objektiv)
  ip1 = getElement("ip1b");                                // Eingabefeld (Objektivbrennweite)              
  getElement("ip1c",meter);                                // Einheit (Objektivbrennweite)
  getElement("ip2a",text03);                               // Erkl�render Text (Okular)
  ip2 = getElement("ip2b");                                // Eingabefeld (Okularbrennweite)
  getElement("ip2c",meter);                                // Einheit (Okularbrennweite)
  getElement("lb2",text04);                                // Erkl�render Text (Sehwinkel)
  getElement("op1a",text02);                               // Erkl�render Text (Objektiv)
  op1 = getElement("op1b");                                // Ausgabefeld (Sehwinkel Objektiv)
  getElement("op1c",degree);                               // Einheit (Sehwinkel Objektiv)
  getElement("op2a",text03);                               // Erkl�render Text (Okular)
  op2 = getElement("op2b");                                // Ausgabefeld (Sehwinkel Okular)
  getElement("op2c",degree);                               // Einheit (Sehwinkel Okular)
  getElement("op3a",text05);                               // Erkl�render Text (Vergr��erung)
  op3 = getElement("op3b");                                // Ausgabefeld (Vergr��erung)
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // �bersetzer
  
  f1 = 0.5; f2 = 0.1;                                      // Startwerte der Brennweiten (m)
  m0 = Math.tan(4*DEG);                                    // Startwert f�r Steigung der einfallenden Lichtstrahlen
  updateInput();                                           // Eingabefelder aktualisieren
  reaction();                                              // Berechnungen, Ausgabe, Zeichnen
  drag = false;                                            // Zugmodus zun�chst deaktiviert
  
  ip1.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Objektivbrennweite)
  ip2.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Okularbrennweite)  
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Dr�cken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Ber�hrung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Ber�hrung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers        
  }

// Reaktion auf Dr�cken der Maustaste:
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen                    
  }
  
// Reaktion auf Ber�hrung:
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Ber�hrpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen
  if (drag) e.preventDefault();                            // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Loslassen der Maustaste:
  
function reactionMouseUp (e) {                                             
  drag = false;                                            // Zugmodus deaktivieren                             
  }
  
// Reaktion auf Ende der Ber�hrung:
  
function reactionTouchEnd (e) {             
  drag = false;                                            // Zugmodus deaktivieren
  }
  
// Reaktion auf Bewegen der Maus:
  
function reactionMouseMove (e) {            
  if (!drag) return;                                       // Abbrechen, falls Zugmodus nicht aktiviert
  reactionMove(e.clientX,e.clientY);                       // Position ermitteln, rechnen und neu zeichnen
  }
  
// Reaktion auf Bewegung des Fingers:
  
function reactionTouchMove (e) {            
  if (!drag) return;                                       // Abbrechen, falls Zugmodus nicht aktiviert
  var obj = e.changedTouches[0];                           // Liste der neuen Fingerpositionen     
  reactionMove(obj.clientX,obj.clientY);                   // Position ermitteln, rechnen und neu zeichnen
  e.preventDefault();                                      // Standardverhalten verhindern                          
  }  
  
// Hilfsroutine: Reaktion auf Mausklick oder Ber�hren mit dem Finger (Auswahl):
// u, v ... Bildschirmkoordinaten bez�glich Viewport
// Seiteneffekt drag 

function reactionDown (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)
  if (u < uL2 && u != uL1) drag = true;                    // Falls sinnvolle Position, Zugmodus aktivieren
  }
  
// Reaktion auf Bewegung von Maus oder Finger (�nderung):
// u, v ... Bildschirmkoordinaten bez�glich Viewport
// Seiteneffekt m0, f1, f2, uL1, uL2, a1, a2, b1, b2, m2, ang1, ang2

function reactionMove (u, v) {
  if (!drag) return;                                       // Falls kein Zugmodus, abbrechen
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)
  if (u == uL1) return;                                    // Falls Linsenebene Objektiv, abbrechen
  m0 = Math.atan((v-V0)/(uL1-u));                          // Steigung der Lichtstrahlen vor dem Objektiv
  reaction();                                              // Eingabe, Berechnungen, Ausgabe, neu zeichnen
  }
      
// Reaktion auf Tastendruck (nur auf Enter-Taste):
// Seiteneffekt f1, f2, uL1, uL2, a1, a2, b1, b2, m0, m2, ang1, ang2
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten �bernehmen, rechnen, Ausgabe, neu zeichnen                          
  }
  
// Reaktion auf Eingabe oder Ziehen der Maus:
// Seiteneffekt f1, f2, uL1, uL2, a1, a2, b1, b2, m0, m2, ang1, ang2

function reaction () {
  f1 = inputNumber(ip1,2,true,0.05,0.5);                   // Eingabe Objektivbrennweite
  f2 = inputNumber(ip2,2,true,0.05,0.5);                   // Eingabe Okularbrennweite
  calculation1();
  calculation2();
  paint();   
  }
  
//-------------------------------------------------------------------------------------------------

// Aktualisierung der Eingabefelder:

function updateInput () {
  ip1.value = ToString(f1,2,true);                         // Eingabefeld Objektivbrennweite
  ip2.value = ToString(f2,2,true);                         // Eingabefeld Okularbrennweite
  }

// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  if (n == 1000) s = "1000";                               // Ausnahme, um "1,00e+3" zu verhindern
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
  
// Berechnungen nach �nderung der Brennweite:
// Seiteneffekt uL1, uL2, a1, a2, b1, b2

function calculation1 () {    
  var  l2 = 0.5*PIX*(f1+f2);                               // Halbe L�nge des Fernrohrs (Pixel)
  uL1 = 250-l2; uL2 = 250+l2;                              // Waagrechte Koordinaten der Linsenmittelpunkte (Pixel)
  var r1 = 2*(N-1)*f1*PIX;                                 // Kr�mmungsradius Objektiv (Pixel) 
  var r2 = 2*(N-1)*f2*PIX;                                 // Kr�mmungsradius Okular (Pixel)
  var limit = 0.5*PIX;                                     // Obergrenze f�r halben Linsendurchmesser (Pixel)
  b1 = 0.6*r1; if (b1 > limit) b1 = limit;                 // Halber Durchmesser Objektiv (Pixel)
  b2 = 0.6*r2; if (b2 > limit) b2 = limit;                 // Halber Durchmesser Okular (Pixel)
  a1 = r1-Math.sqrt(r1*r1-b1*b1);                          // Halbe Dicke Objektiv (Pixel)
  a2 = r2-Math.sqrt(r2*r2-b2*b2);                          // Halbe Dicke Okular (Pixel)   
  }
  
// Berechnungen nach �nderung der Strahlrichtung:
// Seiteneffekt m0, m2, ang1, ang2
// Aktualisierung der Ausgabefelder op1, op2, op3

function calculation2 () {
  var limit = 0.9*b2/((f1+f2)*PIX);                        // Obergrenze f�r Steigung der einfallenden Lichtstrahlen
  if (m0 > limit) m0 = limit;                              // Zu gro�e (positive) Steigung verhindern
  else if (m0 < -limit) m0 = -limit;                       // Zu kleine (negative) Steigung verhindern
  ang1 = Math.atan(m0);                                    // Sehwinkel Objektiv (Bogenma�) 
  m2 = -m0*f1/f2;                                          // Steigung der Lichtstrahlen nach dem Okular 
  ang2 = Math.atan(m2);                                    // Sehwinkel Okular (Bogenma�)
  op1.innerHTML = ToString(ang1/DEG,1,true);               // Ausgabefeld f�r Sehwinkel Objektiv aktualisieren
  op2.innerHTML = ToString(ang2/DEG,1,true);               // Ausgabefeld f�r Sehwinkel Okular aktualisieren
  var s = (ang1!=0 ? ToString(ang2/ang1,2,false) : "---"); // Zeichenkette f�r Vergr��erung
  op3.innerHTML = s;                                       // Ausgabefeld f�r Vergr��erung aktualisieren
  }
  
//-------------------------------------------------------------------------------------------------
  
// Neuer Pfad mit Standardwerten:
// w ... Liniendicke (optional, Defaultwert 1)

function newPath(w) {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = (w ? w : 1);                             // Liniendicke
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
  
// Ausgef�llter Kreis:
// (x,y) ... Mittelpunkt (Pixel)
// r ....... Radius (Pixel)
// c ....... F�llfarbe

function circle (x, y, r, c) {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausf�llen
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
  
// Winkelmarkierung im Gegenuhrzeigersinn:
// x, y ... Scheitel
// r ...... Radius
// a0 ..... Startwinkel (Bogenma�)
// a ...... Winkelbetrag (Bogenma�)
// c ...... F�llfarbe 

function angle (x, y, r, a0, a, c) {
  newPath();                                               // Neuer Pfad
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.moveTo(x,y);                                         // Scheitel als Anfangspunkt
  ctx.lineTo(x+r*Math.cos(a0),y-r*Math.sin(a0));           // Linie auf dem ersten Schenkel
  ctx.arc(x,y,r,2*Math.PI-a0,2*Math.PI-a0-a,true);         // Kreisbogen
  ctx.closePath();                                         // Zur�ck zum Scheitel
  ctx.fill(); ctx.stroke();                                // Kreissektor ausf�llen, Rand zeichnen
  }
  
// Linse:
// x ... x-Koordinate der Linsenebene (Pixel)
// a ... Halbe Dicke (Pixel)
// b ... Halber Durchmesser (Pixel)
  	
function lens (x, a, b) {
  var r = (a*a+b*b)/(2*a);                                 // Kr�mmungsradius (Pixel)
  var r2 = 2*r;                                            // Durchmesser (Pixel)
  var phi = Math.asin(b/r);                                // Maximaler Winkel (Bogenma�)
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.arc(x+a-r,V0,r,phi,2*Math.PI-phi,true);              // Kreisbogen rechts
  ctx.arc(x-a+r,V0,r,Math.PI+phi,Math.PI-phi,true);        // Kreisbogen links
  ctx.fillStyle = colorLens;                               // F�llfarbe
  ctx.fill();                                              // Inneres der Linse ausf�llen
  ctx.stroke();                                            // Rand zeichnen
  }
  
// Lichtstrahl:
// t1 ... Achsenabschnitt (Objektiv, Pixel)

function ray (t1) {
  var du = uL1-20;                                         // Differenz waagrechte Koordinate (links vom Objektiv)
  var u0 = uL1-du, v0 = V0-t1+m0*du;                       // Anfangspunkt (links vom Objektiv) 
  var u1 = uL1, v1 = V0-t1;                                // Punkt auf Linsenebene des Objektivs
  var m1 = (m0*f1*PIX-t1)/(f1*PIX);                        // Steigung zwischen den beiden Linsenebenen
  var u2 = uL2;                                            // Waagrechte Koordinate der Okular-Linsenebene 
  var t2 = t1+m1*(uL2-uL1);                                // Achsenabschnitt in Okular-Linsenebene 
  if (Math.abs(t2) >= b2) return;                          // Falls au�erhalb des Okulars, abbrechen
  var v2 = V0-t2;                                          // Senkrechte Koordinate f�r Punkt in Okular-Linsenebene
  var u3 = uL2+du, v3 = V0-t2-m2*du;                       // Endpunkt (rechts vom Okular)
  line(u0,v0,u1,v1,colorLight);                            // Linker Rand bis Linsenebene Objektiv
  line(u1,v1,u2,v2,colorLight);                            // Zwischen den beiden Linsenebenen
  line(u2,v2,u3,v3,colorLight);                            // Linsenebene Okular bis rechter Rand
  }
  
// Mittelpunktsstrahl Objektiv (schwarz, durchgezogen):

function ray1 () {
  var du = uL1-20;                                         // Differenz waagrechte Koordinate (links vom Objektiv)
  line(uL1-du,V0+m0*du,uL1,V0);                            // Linker Rand bis Linsenebene Objektiv
  }
  
// Mittelpunktsstrahl Okular (schwarz, gestrichelt): 

function ray2 () {
  var sin = Math.sin(ang2), cos = Math.cos(ang2);          // Trigonometrische Werte f�r Sehwinkel Okular
  for (var i=-10; i<10; i++) {                             // F�r alle Indizes ...
    var u0 = uL2-i*10*cos, v0 = V0+i*10*sin;               // Anfangspunkt f�r kurze Linie
    var u1 = uL2-(i+0.6)*10*cos, v1 = V0+(i+0.6)*10*sin;   // Endpunkt f�r kurze Linie
    line(u0,v0,u1,v1);                                     // Kurze Linie zeichnen
    }    
  }
  
// Brennweiten (Doppelpfeile mit Beschriftung):

function f1f2 () {
  var uu = uL1+PIX*f1;                                     // Position des gemeinsamen Brennpunkts (Pixel)     
  arrow(uu,30,uL1,30);                                     // Pfeil nach links f�r Objektivbrennweite
  arrow(uL1,30,uu,30);                                     // Pfeil nach rechts f�r Objektivbrennweite
  arrow(uu,30,uL2,30);                                     // Pfeil nach rechts f�r Okularbrennweite                    
  arrow(uL2,30,uu,30);                                     // Pfeil nach links f�r Okularbrennweite
  var duF = ctx.measureText(symbolFocalLength).width;      // Breite des Brennweiten-Symbols (Pixel)
  var du1 = ctx.measureText("1").width;                    // Breite des Index 1 (Pixel)
  var du2 = ctx.measureText("2").width;                    // Breite des Index 2 (Pixel)
  var u0 = uL1+PIX*f1/2-(duF+du1)/2;                       // Waagrechte Koordinate f�r Beschriftung (f_1)
  ctx.fillText(symbolFocalLength,u0,45);                   // Brennweiten-Symbol (f) f�r Objektiv 
  ctx.fillText("1",u0+duF,50);                             // Index 1 f�r Objektiv
  u0 = uL2-PIX*f2/2-(duF+du2)/2;                           // Waagrechte Koordinate f�r Beschriftung (f_2)
  ctx.fillText(symbolFocalLength,u0,45);                   // Brennweiten-Symbol (f) f�r Okular
  ctx.fillText("2",u0+duF,50);                             // Index 2 f�r Okular
  } 
  
// Sternkonstellation (Plejaden):
// (u,v) ... Bildmitte (Pixel)
// m ....... Vergr��erungsfaktor (mit Vorzeichen)

function stars (u, v, m) {
  circle(u,v,60,"#000000");                                // Schwarzer Hintergrund (kreisf�rmig)
  for (var i=0; i<pleiades.length; i++) {                  // F�r alle Sterne ...
    var r = pleiades[i][0];                                // Abstand vom Mittelpunkt (Pixel) 
    var phi = pleiades[i][1];                              // Winkel (Bogenma�)
    var uS = u+m*r*Math.cos(phi);                          // Waagrechte Bildschirmkoordinate (Pixel)
    var vS = v-m*r*Math.sin(phi);                          // Senkrechte Bildschirmkoordinate (Pixel)
    circle(uS,vS,1.5,colorStars);                          // Stern (ausgef�llter Kreis)
    }
  }

// Grafikausgabe:
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausf�llen
  ctx.font = FONT;                                         // Zeichensatz
  ctx.textAlign = "left";                                  // Textausrichtung
  lens(uL1,a1,b1);                                         // Objektiv
  lens(uL2,a2,b2);                                         // Okular
  var a = Math.abs(ang1);                                  // Sehwinkel Objektiv (Bogenma�)
  var a0 = (ang1 >= 0 ? Math.PI : Math.PI-a);              // Startwinkel Objektiv (Bogenma�) 
  angle(uL1,V0,40,a0,a,color1);                            // Winkelmarkierung Objektiv
  a = Math.abs(ang2);                                      // Sehwinkel Okular (Bogenma�)
  a0 = (ang2 >= 0 ? Math.PI : Math.PI-a);                  // Startwinkel Okular (Bogenma�)
  angle(uL2,V0,40,a0,a,color2);                            // Winkelmarkierung Okular      
  line(20,V0,480,V0);                                      // Optische Achse 
  for (var i=-10; i<=10; i++) {                            // F�r alle Indizes ...
    var y1 = V0-i*10-3, y2 = y1+6;                         // Senkrechte Koordinaten f�r kurze Linien
    line(uL1,y1,uL1,y2);                                   // Linie f�r Linsenebene Objektiv
    line(uL2,y1,uL2,y2);                                   // Linie f�r Linsenebene Okular
    }     
  for (i=-3; i<=3; i++) ray(i*b1/4);                       // Lichtstrahlen
  ray1();                                                  // Mittelpunktsstrahl Objektiv (durchgezogen)
  ray2();                                                  // Mittelpunktsstrahl Okular (gestrichelt)
  f1f2();                                                  // Doppelpfeile f�r Brennweiten
  stars(100,300,1);                                        // Sterne real
  stars(400,300,-f1/f2);                                   // Sterne im Fernrohr
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der HTML-Seite Startmethode ausf�hren




