// Ersatzkraft mehrerer Kräfte
// Java-Applet (02.11.1998) umgewandelt
// 11.04.2014 - 08.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel resultant_de.js) abgespeichert.  

var colorBackground = "#ffff00";                 // Hintergrundfarbe
var colorBody = "#ffffff";                       // Farbe für Körper
var colorForces = "#0000ff";                     // Farbe für Einzelkräfte
var colorResultant = "#ff0000";                  // Farbe für Gesamtkraft
var canvas, ctx;                                 // Zeichenfläche, Grafikkontext
var width, height;                               // Abmessungen der Zeichenfläche
var ch;                                          // Auswahlliste
var bu1;                                         // Schaltknopf 1 (Gesamtkraft ermitteln)
var bu2;                                         // Schaltknopf 2 (Konstruktion löschen)
var mx, my;                                      // Koordinaten des Mittelpunkts
var force;                                       // Array für Einzelkräfte
var sum;                                         // Array für Zwischensummen
var angle;                                       // Array für Winkel
var numberForces;                                // Zahl der Einzelkräfte
var nr;                                          // Nummer der ausgewählten Einzelkraft (-1 bis numberForces-1)      
var on;                                          // Flag für Bewegung
var t0;                                          // Anfangszeitpunkt (s)
var t;                                           // Aktuelle Zeit (s)

// Element der Schaltfläche (aus HTML-Datei):
// id ..... ID im HTML-Befehl
// text ... Text (optional)

function getElement (id, text) {
  var e = document.getElementById(id);           // Element
  if (text) e.innerHTML = text;                  // Text festlegen, falls definiert
  return e;                                      // Rückgabewert
  } 

// Start:

function start () {
  canvas = getElement("cv");                     // Zeichenfläche
  width = canvas.width;                          // Breite der Zeichenfläche 
  height = canvas.height;                        // Höhe der Zeichenfläche
  ctx = canvas.getContext("2d");                 // Grafikkontext
  getElement("number",text01);                   // Erklärender Text (Zahl der Einzelkräfte)
  ch = getElement("ch");                         // Auswahlliste (Zahl der Einzelkräfte, 2 bis 5)
  ch.selectedIndex = 0;                          // Erster Eintrag (2 Kräfte) ausgewählt
  bu1 = getElement("bu1",text02);                // Schaltknopf 1 (Gesamtkraft ermitteln)
  bu2 = getElement("bu2",text03);                // Schaltknopf 2 (Konstruktion löschen)
  getElement("author",author);
  getElement("translator",translator);
  
  mx = width/2; my = height/2;                   // Koordinaten des Mittelpunkts
  force = new Array(5);                          // Array für Einzelkräfte
  sum = new Array(5);                            // Array für Zwischensummen
  for (var i=0; i<5; i++) sum[i] = {x: 0, y: 0}; // Mit Nullvektoren füllen
  angle = new Array(5);                          // Array für Winkel
  numberForces = 2;                              // Zahl der Einzelkräfte 
  nr = -1;                                       // Keine Kraft ausgewählt
  force[0] = {x: 25, y: 50};                     // Defaultwert für 1. Kraft
  force[1] = {x: -40, y: 30};                    // Defaultwert für 2. Kraft
  force[2] = {x: -35, y: 5};                     // Defaultwert für 3. Kraft
  force[3] = {x: -10, y: -60};                   // Defaultwert für 4. Kraft
  force[4] = {x: 10, y: -35};                    // Defaultwert für 5. Kraft
  order();                                       // Falls nötig, Nummerierung ändern
  on = false;                                    // Animation abgeschaltet
  paint();                                       // Zeichnen
  setInterval(paint,40);                         // Timer-Intervall 0,040 s
  
  ch.onchange = reactionChoice;                  // Reaktion auf Auswahl  
  bu1.onclick = reactionButton1;                 // Reaktion auf Schaltknopf 1 (Gesamtkraft ermitteln)
  bu2.onclick = reactionButton2;                 // Reaktion auf Schaltknopf 2 (Konstruktion löschen)
  
  canvas.onmousedown = function (e) {            // Reaktion auf Drücken der Maustaste
    reactionDown(e.clientX,e.clientY);           // Auswahl eines Kraftpfeils (nr)
    }
    
  canvas.ontouchstart = function (e) {           // Reaktion auf Berührung
    var obj = e.changedTouches[0];
    reactionDown(obj.clientX,obj.clientY);       // Auswahl eines Kraftpfeils (nr)
    if (nr != -1) e.preventDefault();            // Standardverhalten verhindern
    }
      
  canvas.onmouseup = function (e) {              // Reaktion auf Loslassen der Maustaste
    nr = -1;                                     // Kein Kraftpfeil ausgewählt
    }
    
  canvas.ontouchend = function (e) {             // Reaktion auf Ende der Berührung
    nr = -1;                                     // Kein Kraftpfeil ausgewählt
    //e.preventDefault();                          // Standardverhalten verhindern (?) 
    }
    
  canvas.onmousemove = function (e) {            // Reaktion auf Bewegen der Maus
    if (nr == -1) return;                        // Keine Reaktion, wenn kein Kraftpfeil ausgewählt
    reactionMove(e.clientX,e.clientY);           // Position ermitteln und neu zeichnen
    }
    
  canvas.ontouchmove = function (e) {            // Reaktion auf Bewegung mit Finger
    if (nr == -1) return;                        // Keine Reaktion, wenn kein Kraftpfeil ausgewählt
    var obj = e.changedTouches[0];
    reactionMove(obj.clientX,obj.clientY);       // Position ermitteln und neu zeichnen
    e.preventDefault();                          // Standardverhalten verhindern                          
    }
  
  } // Ende der Methode start
  
// Reaktion auf Auswahlliste:

function reactionChoice () {
  t = 0; on = false;                             // Animation abgeschaltet
  numberForces = 2+ch.selectedIndex;             // Zahl der Einzelkräfte 
  var inside = totalForce();                     // Berechnung der Vektorsummen, Zeichnung ganz zu sehen?
  var i = numberForces-1;                        // Letzter Index der Arrays
  while (!inside) {                              // Solange Zeichnung zu groß ...
    force[i].x *= 0.9; force[i].y *= 0.9;        // Letzte Einzelkraft verkleinern       
    inside = totalForce();                       // Neue Überprüfung: Zeichnung ganz zu sehen?
    if (i > 1) i--; else i = numberForces-1;     // Kraft mit nächstkleinerem Index verkleinern
    } 
  order();                                       // Falls nötig, Nummerierung der Einzelkräfte ändern
  paint();                                       // Zeichnen
  }
  
// Reaktion auf Schaltknopf 1 (Gesamtkraft ermitteln):

function reactionButton1 () {
  t0 = new Date();                               // Anfangszeitpunkt (s) 
  on = true;                                     // Animation einschalten
  order();                                       // Falls nötig, Nummerierung der Einzelkräfte ändern
  }
  
// Reaktion auf Schaltknopf 2 (Konstruktion löschen):

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
  
// Reaktion auf Mausklick oder Berühren mit dem Finger (Auswahl eines Kraftpfeils):
// Seiteneffekt nr

function reactionDown (x, y) {
  var r = canvas.getBoundingClientRect();        // Lage der Zeichenfläche bezüglich Viewport
  x -= r.left; y -= r.top;                       // Koordinaten bezüglich Zeichenfläche
  var min = 10000;                               // Minimaler Abstand (große Zahl)
  for (var i=0; i<numberForces; i++) {           // Für alle Einzelkräfte ...
    var d2 = distance2(i,x,y);                   // Abstandsquadrat berechnen
    if (d2 < min) {nr = i; min = d2;}            // Falls kleinerer Abstand, nr und min aktualisieren  
    }
  if (min > 100) nr = -1;                        // Falls Abstand zu groß, keine Kraft auswählen
  }
  
// Reaktion auf Bewegung von Maus oder Finger (Änderung eines Kraftpfeils):
// Seiteneffekt force, sum

function reactionMove (x, y) {
  var r = canvas.getBoundingClientRect();        // Lage der Zeichenfläche bezüglich Viewport
  x -= r.left; y -= r.top;                       // Koordinaten bezüglich Zeichenfläche
  if (nr == -1) return;                          // Abbruch, wenn keine Kraft ausgewählt
  var xOld = force[nr].x, yOld = force[nr].y;    // Bisherigen Kraftvektor speichern
  if (x < 10 || x > height-10) return;           // Bei ungeeigneter x-Koordinate abbrechen
  if (y < 10 || y > height-10) return;           // Bei ungeeigneter y-Koordinate abbrechen
  force[nr].x = x-mx; force[nr].y = my-y;        // Ausgewählte Einzelkraft abändern
  var inside = totalForce();                     // Berechnung der Vektorsummen; Zeichnung ganz zu sehen?
  if (!inside) {                                 // Falls Zeichnung nicht ganz zu sehen ...
    force[nr].x = xOld; force[nr].y = yOld;      // Bisherigen Kraftvektor wiederherstellen
    totalForce();                                // Erneute Berechnung der Vektorsummen
    }
  paint();                                       // Zeichnen
  }
  
//-----------------------------------------------------------------------------

// Kräfte vertauschen:
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
    
// Kräfte im Gegenuhrzeigersinn ordnen:
// Seiteneffekt, angle, sum

function order () {
  var angle0 = Math.atan2(force[0].y,force[0].x);          // Winkel der Kraft mit Index 0
  if (angle0 < 0) angle0 += 2*Math.PI;                     // Eventuell korrigieren
  angle[0] = 0;                                            // Winkel für 1. Kraft
  for (var i=1; i<numberForces; i++) {                     // Für alle weiteren Kräfte ...
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
// Rückgabewert gibt an, ob die Zeichnung ganz innerhalb der Zeichenfläche ist
// Seiteneffekt sum

function totalForce () {
  sum[0].x = force[0].x; sum[0].y = force[0].y;            // 1. Kraftvektor übertragen
  for (var i=1; i<numberForces; i++) {                     // Für alle weiteren Kräfte ...          
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
  var length = Math.sqrt(dx*dx+dy*dy);           // Länge
  if (length == 0) return;                       // Abbruch, falls Länge 0
  dx /= length; dy /= length;                    // Einheitsvektor
  var s = 2.5*w+7.5;                             // Länge der Pfeilspitze 
  var xSp = x2-s*dx, ySp = y2-s*dy;              // Hilfspunkt für Pfeilspitze         
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
  ctx.beginPath();                               // Neuer Pfad für Pfeilspitze
  ctx.fillStyle = ctx.strokeStyle;               // Füllfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                           // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                         // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                             // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                         // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                               // Zurück zum Anfangspunkt
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
  ctx.fillRect(0,0,width,height);                // Hintergrund ausfüllen
  ctx.beginPath();                               // Neuer Pfad
  ctx.fillStyle = colorBody;                     // Füllfarbe für Körper
  ctx.strokeStyle = "#000000";                   // Randfarbe
  ctx.lineWidth = 1.5;                           // Liniendicke       
  ctx.arc(mx,my,5,0,2*Math.PI,true);             // Kreis für Körper vorbereiten
  ctx.fill(); ctx.stroke();                      // Kreis mit Rand zeichnen
  ctx.beginPath();                               // Neuer Pfad
  ctx.strokeStyle = colorForces;                 // Farbe für Einzelkräfte
  t = (new Date()-t0)/1000;                      // Aktuelle Zeit (s)
  for (var i=0; i<numberForces; i++) {           // Für alle Einzelkräfte ...
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
    ctx.strokeStyle = colorResultant;            // Farbe für Gesamtkraft
    arrowV(mx,my,sum[numberForces-1],2);         // Pfeil für Gesamtkraft
    }
  }
  
document.addEventListener("DOMContentLoaded",start,false);