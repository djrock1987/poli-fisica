// Ersatzkraft mehrerer Kr�fte
// Java-Applet (02.11.1998) umgewandelt
// 11.04.2014 - 08.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabh�ngige Texte sind einer eigenen Datei (zum Beispiel resultant_de.js) abgespeichert.  

var colorBackground = "#ffff00";                 // Hintergrundfarbe
var colorBody = "#ffffff";                       // Farbe f�r K�rper
var colorForces = "#0000ff";                     // Farbe f�r Einzelkr�fte
var colorResultant = "#ff0000";                  // Farbe f�r Gesamtkraft
var canvas, ctx;                                 // Zeichenfl�che, Grafikkontext
var width, height;                               // Abmessungen der Zeichenfl�che
var ch;                                          // Auswahlliste
var bu1;                                         // Schaltknopf 1 (Gesamtkraft ermitteln)
var bu2;                                         // Schaltknopf 2 (Konstruktion l�schen)
var mx, my;                                      // Koordinaten des Mittelpunkts
var force;                                       // Array f�r Einzelkr�fte
var sum;                                         // Array f�r Zwischensummen
var angle;                                       // Array f�r Winkel
var numberForces;                                // Zahl der Einzelkr�fte
var nr;                                          // Nummer der ausgew�hlten Einzelkraft (-1 bis numberForces-1)      
var on;                                          // Flag f�r Bewegung
var t0;                                          // Anfangszeitpunkt (s)
var t;                                           // Aktuelle Zeit (s)

// Element der Schaltfl�che (aus HTML-Datei):
// id ..... ID im HTML-Befehl
// text ... Text (optional)

function getElement (id, text) {
  var e = document.getElementById(id);           // Element
  if (text) e.innerHTML = text;                  // Text festlegen, falls definiert
  return e;                                      // R�ckgabewert
  } 

// Start:

function start () {
  canvas = getElement("cv");                     // Zeichenfl�che
  width = canvas.width;                          // Breite der Zeichenfl�che 
  height = canvas.height;                        // H�he der Zeichenfl�che
  ctx = canvas.getContext("2d");                 // Grafikkontext
  getElement("number",text01);                   // Erkl�render Text (Zahl der Einzelkr�fte)
  ch = getElement("ch");                         // Auswahlliste (Zahl der Einzelkr�fte, 2 bis 5)
  ch.selectedIndex = 0;                          // Erster Eintrag (2 Kr�fte) ausgew�hlt
  bu1 = getElement("bu1",text02);                // Schaltknopf 1 (Gesamtkraft ermitteln)
  bu2 = getElement("bu2",text03);                // Schaltknopf 2 (Konstruktion l�schen)
  getElement("author",author);
  getElement("translator",translator);
  
  mx = width/2; my = height/2;                   // Koordinaten des Mittelpunkts
  force = new Array(5);                          // Array f�r Einzelkr�fte
  sum = new Array(5);                            // Array f�r Zwischensummen
  for (var i=0; i<5; i++) sum[i] = {x: 0, y: 0}; // Mit Nullvektoren f�llen
  angle = new Array(5);                          // Array f�r Winkel
  numberForces = 2;                              // Zahl der Einzelkr�fte 
  nr = -1;                                       // Keine Kraft ausgew�hlt
  force[0] = {x: 25, y: 50};                     // Defaultwert f�r 1. Kraft
  force[1] = {x: -40, y: 30};                    // Defaultwert f�r 2. Kraft
  force[2] = {x: -35, y: 5};                     // Defaultwert f�r 3. Kraft
  force[3] = {x: -10, y: -60};                   // Defaultwert f�r 4. Kraft
  force[4] = {x: 10, y: -35};                    // Defaultwert f�r 5. Kraft
  order();                                       // Falls n�tig, Nummerierung �ndern
  on = false;                                    // Animation abgeschaltet
  paint();                                       // Zeichnen
  setInterval(paint,40);                         // Timer-Intervall 0,040 s
  
  ch.onchange = reactionChoice;                  // Reaktion auf Auswahl  
  bu1.onclick = reactionButton1;                 // Reaktion auf Schaltknopf 1 (Gesamtkraft ermitteln)
  bu2.onclick = reactionButton2;                 // Reaktion auf Schaltknopf 2 (Konstruktion l�schen)
  
  canvas.onmousedown = function (e) {            // Reaktion auf Dr�cken der Maustaste
    reactionDown(e.clientX,e.clientY);           // Auswahl eines Kraftpfeils (nr)
    }
    
  canvas.ontouchstart = function (e) {           // Reaktion auf Ber�hrung
    var obj = e.changedTouches[0];
    reactionDown(obj.clientX,obj.clientY);       // Auswahl eines Kraftpfeils (nr)
    if (nr != -1) e.preventDefault();            // Standardverhalten verhindern
    }
      
  canvas.onmouseup = function (e) {              // Reaktion auf Loslassen der Maustaste
    nr = -1;                                     // Kein Kraftpfeil ausgew�hlt
    }
    
  canvas.ontouchend = function (e) {             // Reaktion auf Ende der Ber�hrung
    nr = -1;                                     // Kein Kraftpfeil ausgew�hlt
    //e.preventDefault();                          // Standardverhalten verhindern (?) 
    }
    
  canvas.onmousemove = function (e) {            // Reaktion auf Bewegen der Maus
    if (nr == -1) return;                        // Keine Reaktion, wenn kein Kraftpfeil ausgew�hlt
    reactionMove(e.clientX,e.clientY);           // Position ermitteln und neu zeichnen
    }
    
  canvas.ontouchmove = function (e) {            // Reaktion auf Bewegung mit Finger
    if (nr == -1) return;                        // Keine Reaktion, wenn kein Kraftpfeil ausgew�hlt
    var obj = e.changedTouches[0];
    reactionMove(obj.clientX,obj.clientY);       // Position ermitteln und neu zeichnen
    e.preventDefault();                          // Standardverhalten verhindern                          
    }
  
  } // Ende der Methode start
  
// Reaktion auf Auswahlliste:

function reactionChoice () {
  t = 0; on = false;                             // Animation abgeschaltet
  numberForces = 2+ch.selectedIndex;             // Zahl der Einzelkr�fte 
  var inside = totalForce();                     // Berechnung der Vektorsummen, Zeichnung ganz zu sehen?
  var i = numberForces-1;                        // Letzter Index der Arrays
  while (!inside) {                              // Solange Zeichnung zu gro� ...
    force[i].x *= 0.9; force[i].y *= 0.9;        // Letzte Einzelkraft verkleinern       
    inside = totalForce();                       // Neue �berpr�fung: Zeichnung ganz zu sehen?
    if (i > 1) i--; else i = numberForces-1;     // Kraft mit n�chstkleinerem Index verkleinern
    } 
  order();                                       // Falls n�tig, Nummerierung der Einzelkr�fte �ndern
  paint();                                       // Zeichnen
  }
  
// Reaktion auf Schaltknopf 1 (Gesamtkraft ermitteln):

function reactionButton1 () {
  t0 = new Date();                               // Anfangszeitpunkt (s) 
  on = true;                                     // Animation einschalten
  order();                                       // Falls n�tig, Nummerierung der Einzelkr�fte �ndern
  }
  
// Reaktion auf Schaltknopf 2 (Konstruktion l�schen):

function reactionButton2 () {
  t = 0;                                         // Aktuelle Zeit (s)
  on = false;                                    // Animation abschalten
  }
  
// Hilfsroutine (Abstandsquadrat):
// i ... Index
// x ... x-Koordinate Mauszeiger
// y ... y-Koordinate Mauszeiger
  
function distance2 (i, x, y) {
  var dx = x-(mx+force[i].x);                    // Differenz der x-Koordinaten
  var dy = y-(my-force[i].y);                    // Differenz der y-Koordinaten
  return dx*dx+dy*dy;                            // Abstandsquadrat (Pythagoras)
  } 
  
// Reaktion auf Mausklick oder Ber�hren mit dem Finger (Auswahl eines Kraftpfeils):
// Seiteneffekt nr

function reactionDown (x, y) {
  var r = canvas.getBoundingClientRect();        // Lage der Zeichenfl�che bez�glich Viewport
  x -= r.left; y -= r.top;                       // Koordinaten bez�glich Zeichenfl�che
  var min = 10000;                               // Minimaler Abstand (gro�e Zahl)
  for (var i=0; i<numberForces; i++) {           // F�r alle Einzelkr�fte ...
    var d2 = distance2(i,x,y);                   // Abstandsquadrat berechnen
    if (d2 < min) {nr = i; min = d2;}            // Falls kleinerer Abstand, nr und min aktualisieren  
    }
  if (min > 100) nr = -1;                        // Falls Abstand zu gro�, keine Kraft ausw�hlen
  }
  
// Reaktion auf Bewegung von Maus oder Finger (�nderung eines Kraftpfeils):
// Seiteneffekt force, sum

function reactionMove (x, y) {
  var r = canvas.getBoundingClientRect();        // Lage der Zeichenfl�che bez�glich Viewport
  x -= r.left; y -= r.top;                       // Koordinaten bez�glich Zeichenfl�che
  if (nr == -1) return;                          // Abbruch, wenn keine Kraft ausgew�hlt
  var xOld = force[nr].x, yOld = force[nr].y;    // Bisherigen Kraftvektor speichern
  if (x < 10 || x > height-10) return;           // Bei ungeeigneter x-Koordinate abbrechen
  if (y < 10 || y > height-10) return;           // Bei ungeeigneter y-Koordinate abbrechen
  force[nr].x = x-mx; force[nr].y = my-y;        // Ausgew�hlte Einzelkraft ab�ndern
  var inside = totalForce();                     // Berechnung der Vektorsummen; Zeichnung ganz zu sehen?
  if (!inside) {                                 // Falls Zeichnung nicht ganz zu sehen ...
    force[nr].x = xOld; force[nr].y = yOld;      // Bisherigen Kraftvektor wiederherstellen
    totalForce();                                // Erneute Berechnung der Vektorsummen
    }
  paint();                                       // Zeichnen
  }
  
//-----------------------------------------------------------------------------

// Kr�fte vertauschen:
// i, j ... Indizes
// Seiteneffekt force, angle

function swap (i, j) {
  var h = force[i].x;                            // x-Koordinaten vertauschen 
  force[i].x = force[j].x; force[j].x = h;
  h = force[i].y;                                // y-Koordinaten vertauschen 
  force[i].y = force[j].y; force[j].y = h;
  h = angle[i];                                  // Winkel vertauschen
  angle[i] = angle[j]; angle[j] = h;
  }
    
// Kr�fte im Gegenuhrzeigersinn ordnen:
// Seiteneffekt, angle, sum

function order () {
  var angle0 = Math.atan2(force[0].y,force[0].x);          // Winkel der Kraft mit Index 0
  if (angle0 < 0) angle0 += 2*Math.PI;                     // Eventuell korrigieren
  angle[0] = 0;                                            // Winkel f�r 1. Kraft
  for (var i=1; i<numberForces; i++) {                     // F�r alle weiteren Kr�fte ...
    angle[i] = Math.atan2(force[i].y,force[i].x)-angle0;   // Winkelunterschied
    if (angle[i] < -2*Math.PI) angle[i] += 4*Math.PI;      // Eventuell korrigieren   
    else if (angle[i] < 0) angle[i] += 2*Math.PI;
    } 
  for (var i=1; i<numberForces-1; i++)                     // Aufsteigend sortieren (Bubblesort)
    for (var j=1; j<numberForces-i; j++)
      if (angle[j] > angle[j+1]) swap(j,j+1);
  totalForce();                                            // Berechnung der Vektorsummen
  }
  
// Vektorsummen und Gesamtkraft berechnen:
// R�ckgabewert gibt an, ob die Zeichnung ganz innerhalb der Zeichenfl�che ist
// Seiteneffekt sum

function totalForce () {
  sum[0].x = force[0].x; sum[0].y = force[0].y;            // 1. Kraftvektor �bertragen
  for (var i=1; i<numberForces; i++) {                     // F�r alle weiteren Kr�fte ...          
    sum[i].x = sum[i-1].x+force[i].x;                      // Summe der x-Koordinaten
    sum[i].y = sum[i-1].y+force[i].y;                      // Summe der y-Koordinaten
    if (Math.abs(sum[i].x) > width/2-10) return false;     // x-Koordinaten ungeeignet?
    if (Math.abs(sum[i].y) > height/2-10) return false;    // y-Koordinaten ungeeignet?
    }
  return true;                                             // Zeichnung ganz innerhalb
  }
  
// Pfeil zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// w ........ Liniendicke (optional)

function arrow (x1, y1, x2, y2, w) {
  if (!w) w = 1;                                 // Falls Liniendicke nicht definiert, Defaultwert                          
  var dx = x2-x1, dy = y2-y1;                    // Vektorkoordinaten
  var length = Math.sqrt(dx*dx+dy*dy);           // L�nge
  if (length == 0) return;                       // Abbruch, falls L�nge 0
  dx /= length; dy /= length;                    // Einheitsvektor
  var s = 2.5*w+7.5;                             // L�nge der Pfeilspitze 
  var xSp = x2-s*dx, ySp = y2-s*dy;              // Hilfspunkt f�r Pfeilspitze         
  var h = 0.5*w+3.5;                             // Halbe Breite der Pfeilspitze
  var xSp1 = xSp-h*dy, ySp1 = ySp+h*dx;          // Ecke der Pfeilspitze
  var xSp2 = xSp+h*dy, ySp2 = ySp-h*dx;          // Ecke der Pfeilspitze
  xSp = x2-0.6*s*dx; ySp = y2-0.6*s*dy;          // Einspringende Ecke der Pfeilspitze
  ctx.beginPath();                               // Neuer Pfad
  ctx.lineWidth = w;                             // Liniendicke
  ctx.moveTo(x1,y1);                             // Anfangspunkt
  if (length < 5) ctx.lineTo(x2,y2);             // Falls kurzer Pfeil, weiter zum Endpunkt, ...
  else ctx.lineTo(xSp,ySp);                      // ... sonst weiter zur einspringenden Ecke
  ctx.stroke();                                  // Linie zeichnen
  if (length < 5) return;                        // Falls kurzer Pfeil, keine Spitze
  ctx.beginPath();                               // Neuer Pfad f�r Pfeilspitze
  ctx.fillStyle = ctx.strokeStyle;               // F�llfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                           // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                         // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                             // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                         // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                               // Zur�ck zum Anfangspunkt
  ctx.fill();                                    // Pfeilspitze zeichnen 
  }
  
// Pfeil zeichnen, vereinfachte Version:
// x, y ... Anfangspunkt
// v ...... Vektor (Koordinaten x, y)
// w ...... Liniendicke (optional)

function arrowV (x, y, v, w) {
  arrow(x,y,x+v.x,y-v.y,w);
  }
  
// Grafikausgabe:

function paint () {
  ctx.fillStyle = colorBackground;               // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                // Hintergrund ausf�llen
  ctx.beginPath();                               // Neuer Pfad
  ctx.fillStyle = colorBody;                     // F�llfarbe f�r K�rper
  ctx.strokeStyle = "#000000";                   // Randfarbe
  ctx.lineWidth = 1.5;                           // Liniendicke       
  ctx.arc(mx,my,5,0,2*Math.PI,true);             // Kreis f�r K�rper vorbereiten
  ctx.fill(); ctx.stroke();                      // Kreis mit Rand zeichnen
  ctx.beginPath();                               // Neuer Pfad
  ctx.strokeStyle = colorForces;                 // Farbe f�r Einzelkr�fte
  t = (new Date()-t0)/1000;                      // Aktuelle Zeit (s)
  for (var i=0; i<numberForces; i++) {           // F�r alle Einzelkr�fte ...
    arrowV(mx,my,force[i]);                      // Pfeil zeichnen
    if (i > 0 && on) {                           // Gegebenenfalls Parallelverschiebung
      var part;                                  // Bruchteil der Verschiebung                                 
      if (t < i*2-2) part = 0;                   // Verschiebung hat noch nicht begonnen
      else if (t < i*2) part = (t-i*2+2)/2.0;    // Bruchteil berechnen
      else part = 1;                             // Verschiebung schon beendet
      var x0 = mx+part*(sum[i].x-force[i].x);    // x-Koordinate des verschobenen Anfangspunkts 
      var y0 = my-part*(sum[i].y-force[i].y);    // y-Koordinate des verschobenen Anfangspunkts
      arrowV(x0,y0,force[i]);                    // Verschobenen Pfeil zeichnen          
      }
    }
  if (t > numberForces*2-1 && on) {              // Falls Zeitpunkt zum Zeichnen der Gesamtkraft erreicht ...
    ctx.strokeStyle = colorResultant;            // Farbe f�r Gesamtkraft
    arrowV(mx,my,sum[numberForces-1],2);         // Pfeil f�r Gesamtkraft
    }
  }
  
document.addEventListener("DOMContentLoaded",start,false);