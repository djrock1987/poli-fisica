// Gekoppelte Pendel
// Java-Applet (05.07.1998) umgewandelt
// 04.11.2014 - 14.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabh�ngige Texte sind einer eigenen Datei (zum Beispiel coupledpendula_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var color1 = "#ff0000";                                    // Farbe f�r linkes Pendel
var color2 = "#0000ff";                                    // Farbe f�r rechtes Pendel

// Sonstige Konstanten:

var FONT1 = "normal normal bold 12px sans-serif";          // Zeichensatz
var DEG = Math.PI/180;                                     // 1 Grad (Bogenma�)
var G = 9.81;                                              // Fallbeschleunigung (m/s�)
var L = 1;                                                 // Pendell�nge (m)
var lPix = 240;                                            // Fadenl�nge (Pixel)
var D = 1;                                                 // Federkonstante (N/m)
var M = 1;                                                 // Masse eines Pendelk�rpers (kg)
var ay = 40;                                               // H�he der Aufh�ngung (Pixel) 

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var bu1, bu2;                                              // Schaltkn�pfe (Reset, Start/Pause/Weiter)
var cbSlow;                                                // Optionsfeld (Zeitlupe)
var ip1, ip2;                                              // Eingabefelder (Anfangspositionen)
var on;                                                    // Flag f�r Bewegung
var slow;                                                  // Flag f�r Zeitlupe
var t0;                                                    // Anfangszeitpunkt
var t;                                                     // Aktuelle Zeit (s)
var timer;                                                 // Timer f�r Animation
var omega1, omega2;                                        // Eigen-Kreisfrequenzen links/rechts (1/s)
var alpha1, alpha2;                                        // Auslenkungswinkel links/rechts (Bogenma�)
var alpha01;                                               // Anfangsposition links (Bogenma�)
var alpha02;                                               // Anfangsposition rechts (Bogenma�)
var a1, a2;                                                // Hilfsgr��en                       
var polygon1, polygon2;                                    // Polygone f�r Pendelk�rper (rechteckig)

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
  getElement("ip0",text04);                                // Erkl�render Text (Anfangspositionen)
  ip1 = getElement("ip1a");                                // Eingabefeld (Anfangsposition 1)
  getElement("ip1b",degree);                               // Einheit (Anfangsposition 1)
  ip2 = getElement("ip2a");                                // Eingabefeld (Anfangsposition 2)
  getElement("ip2b",degree);                               // Einheit (Anfangsposition 2)
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // �bersetzer
  
  polygon1 = new Array(4);                                 // Polygon f�r Pendel 1
  polygon2 = new Array(4);                                 // Polygon f�r Pendel 2
  t = 0;                                                   // Anfangswert f�r Zeitvariable
  on = slow = false;                                       // Bewegung und Zeitlupe zun�chst abgeschaltet
  alpha01 = -10*DEG; alpha02 = 0;                          // Anfangspositionen von Pendel 1 bzw. Pendel 2
  calculation();                                           // Berechnungen
  updateInput();                                           // Eingabefelder aktualisieren    
  bu1.onclick = reactionReset;                             // Reaktion auf Schaltknopf (Reset)
  bu2.onclick = reactionStart;                             // Reaktion auf Schaltknopf (Start/Pause/Weiter)
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld (Zeitlupe)
  ip1.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Anfangsposition 1)
  ip2.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Anfangsposition 2)
  paint();                                                 // Zeichnen  
    
  } // Ende der Methode start
  
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
  ip1.readOnly = !p;                                       // Eingabefeld f�r Anfangsposition von Pendel 1
  ip2.readOnly = !p;                                       // Eingabefeld f�r Anfangsposition von Pendel 2
  }
  
// Reaktion auf Resetknopf:
// Seiteneffekt bu2.state, on, timer, t, slow, alpha01, alpha02, omega1, omega2, a1, a2, t0, alpha1, alpha2, polygon1, polygon2
   
function reactionReset () {
  setButton2State(0);                                      // Zustand des Schaltknopfs Start/Pause/Weiter
  enableInput(true);                                       // Eingabefelder aktivieren
  stopAnimation();                                         // Animation stoppen
  t = 0;                                                   // Zeitvariable zur�cksetzen
  on = false;                                              // Animation abgeschaltet
  reaction();                                              // Eingegebene Werte �bernehmen und rechnen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf den Schaltknopf Start/Pause/Weiter:
// Seiteneffekt t0, bu2.state, on, timer, slow, alpha01, alpha02, omega1, omega2, a1, a2, slow, t, alpha1, alpha2, polygon1, polygon2

function reactionStart () {
  if (bu2.state != 1) t0 = new Date();                     // Falls Animation angeschaltet, neuer Anfangszeitpunkt
  switchButton2();                                         // Zustand des Schaltknopfs �ndern
  enableInput(false);                                      // Eingabefelder deaktivieren
  if (bu2.state == 1) startAnimation();                    // Entweder Animation starten bzw. fortsetzen ...
  else stopAnimation();                                    // ... oder stoppen
  reaction();                                              // Eingegebene Werte �bernehmen und rechnen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf Optionsfeld Zeitlupe:
// Seiteneffekt slow

function reactionSlow () {
  slow = cbSlow.checked;                                   // Flag setzen
  }
  
// Hilfsroutine: Eingabe �bernehmen und rechnen
// Seiteneffekt alpha01, alpha02, omega1, omega2, a1, a2, slow

function reaction () {
  input();                                                 // Eingegebene Werte �bernehmen (eventuell korrigiert)
  calculation();                                           // Berechnungen
  slow = cbSlow.checked;                                   // Flag f�r Zeitlupe setzen
  }
  
// Reaktion auf Tastendruck (nur auf Enter-Taste):
// Seiteneffekt alpha01, alpha02, omega1, omega2, a1, a2, slow, t, t0, alpha1, alpha2, polygon1, polygon2
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten �bernehmen und rechnen                          
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
// Seiteneffekt omega1, omega2, a1, a2

function calculation () {
  omega1 = Math.sqrt(G/L);                                 // 1. Eigen-Kreisfrequenz (parallele Schwingung)
  omega2 = Math.sqrt(G/L+2*D/M);                           // 2. Eigen-Kreisfrequenz (antiparallele Schwingung)
  a1 = (alpha01+alpha02)/2;                                // Hilfsgr��e 
  a2 = (alpha01-alpha02)/2;                                // Hilfsgr��e
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
// Seiteneffekt alpha01, alpha02

function input () {
  alpha01 = inputNumber(ip1,1,true,-10,10)*DEG;            // Anfangsposition von Pendel 1 (Bogenma�)
  alpha02 = inputNumber(ip2,1,true,-10,10)*DEG;            // Anfangsposition von Pendel 2 (Bogenma�)
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ip1.value = ToString(alpha01/DEG,1,true);                // Anfangsposition von Pendel 1 (Gradma�)
  ip2.value = ToString(alpha02/DEG,1,true);                // Anfangsposition von Pendel 2 (Gradma�)
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
  
// Polygon zeichnen:
// p ... Array mit Koordinaten der Ecken
// c ... F�llfarbe

function polygon (p, c) {
  newPath();                                               // Neuer Grafikpfad
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.moveTo(p[0].u,p[0].v);                               // Erste Ecke als Anfangspunkt
  for (var i=1; i<p.length; i++)                           // F�r alle weiteren Ecken ...
    ctx.lineTo(p[i].u,p[i].v);                             // Linie zum Pfad hinzuf�gen
  ctx.closePath();                                         // Zur�ck zum Ausgangspunkt
  ctx.fill(); ctx.stroke();                                // Polygon ausf�llen und Rand zeichnen   
  }
  
// Festlegung einer Ecke eines Polygons:
// p ....... Array mit Koordinaten der Ecken
// i ....... Index
// (x,y) ... Koordinaten
  
function setPoint (p, i, x, y) {
  p[i] = {u: x, v: y};                                     // Objekt mit Koordinaten der Ecke
  }
  
// Pendel:
// ax ...... x-Koordinate der Aufh�ngung (Pixel)
// alpha ... Winkel gegen�ber der Senkrechten (Bogenma�)
// p ....... Array f�r Koordinaten der Polygonecken (Seiteneffekt)
// c ....... Farbe

function pendulum (ax, alpha, p, c) {
  var cos = Math.cos(alpha);                               // Cosinuswert
  var sin = Math.sin(alpha);                               // Sinuswert
  var px = ax+lPix*sin, py = ay+lPix*cos;                  // Unteres Fadenende
  line(ax,ay,px,py);                                       // Faden zeichnen       
  var c10 = 10*cos, s10 = 10*sin;                          // Hilfsgr��en
  var c30 = 30*cos, s30 = 30*sin;                          // Hilfsgr��en
  setPoint(p,0,px-c10,py+s10);                             // Ecke 0 des Pendelk�rpers
  setPoint(p,1,px-c10+s30,py+s10+c30);                     // Ecke 1 des Pendelk�rpers
  setPoint(p,2,px+c10+s30,py-s10+c30);                     // Ecke 2 des Pendelk�rpers
  setPoint(p,3,px+c10,py-s10);                             // Ecke 3 des Pendelk�rpers
  polygon(p,c);                                            // Pendelk�rper zeichnen
  }
  
// Feder:
// (x0,y0) ... Anfangspunkt
// (x1,y0) ... Endpunkt

function spring (x0, y0, x1, y1) {
  var dx = x1-x0, dy = y1-y0;                              // Verbindungsvektor f�r gesamte Feder 
  var l = Math.sqrt(dx*dx+dy*dy);                          // Gesamtl�nge (Pixel)
  if (l < 20) return;                                      // Falls Gesamtl�nge zu klein, abbrechen
  var q = 10/l;                                            // Federanfang als Bruchteil der Gesamtl�nge
  var u0 = x0+q*dx;                                        // Anfang des gewundenen Teils, x-Koordinate 
  var v0 = y0+q*dy;                                        // Anfang des gewundenen Teils, y-Koordinate 
  var u1 = x1-q*dx;                                        // Ende des gewundenen Teils, x-Koordinate
  var v1 = y1-q*dy;                                        // Ende des gewundenen Teils, y-Koordinate
  var du = u1-u0, dv = v1-v0;                              // Verbindungsvektor f�r gewundenen Teil
  l = Math.sqrt(du*du+dv*dv);                              // L�nge des gewundenen Teils (Pixel)
  var n = 10;                                              // Zahl der Windungen
  var m = 5;                                               // Schrittweite (Grad) 
  var iMax = n*360/m;                                      // Maximalwert des Z�hlers
  var br = 10;                                             // Halbe Breite der Feder (Pixel)
  newPath();                                               // Neuer Grafikpfad
  ctx.moveTo(x0,y0);                                       // Anfangspunkt der gesamten Feder (links)
  ctx.lineTo(u0,v0);                                       // Federanfang (links)
  for (var i=1; i<=iMax; i++) {                            // F�r alle Abschnitte des gewundenen Teils ...
    var a = i/iMax;                                        // Hilfsgr��e (Bruchteil in L�ngsrichtung) 
    var b = (br/l)*Math.sin(i*m*DEG);                      // Hilfsgr��e (Pixel in Querrichtung)
    var u = u0+a*du+b*dv, v = v0+a*dv-b*du;                // Koordinaten des neuen Punkts
    ctx.lineTo(u,v);                                       // Linie zum Grafikpfad hinzuf�gen
    }
  ctx.lineTo(x1,y1);                                       // Federende (rechts)
  ctx.stroke();                                            // Feder zeichnen
  }
  
// Diagramm f�r Elongation:
// (x0,y0) ... Ursprung (Pixel)
// nr ........ Nummer (1 f�r linkes, 2 f�r rechtes Pendel)

function diagram (x0, y0, nr) {
  var width = 200, height = 100;                           // Abmessungen (Pixel)
  var dt = 20;                                             // Zeit f�r halbe Diagrammbreite (s)
  var pixT = width/(2*dt);                                 // Umrechnungsfaktor f�r waagrechte Achse (Pixel pro s)
  var pixY = 200;                                          // Umrechnungsfaktor f�r senkrechte Achse
  var a = a1, b = (nr==1 ? a2 : -a2);                      // Amplituden (Bogenma�)
  arrow(x0,y0,x0+width,y0);                                // Waagrechte Achse zeichnen
  ctx.fillText(symbolTime,x0+width-8,y0+14);               // Beschriftung der waagrechten Achse
  if (t < dt)                                              // Falls noch sichtbar ... 
    arrow(x0,y0+height/2,x0,y0-height/2);                  // ... Senkrechte Achse zeichnen
  var t0 = t-Math.min(t,dt);                               // Zeit f�r Anfangspunkt
  var yy = a*Math.cos(omega1*t0)+b*Math.cos(omega2*t0);    // Auslenkung f�r Anfangspunkt
  var x = x0, y = y0-pixY*yy;                              // Koordinaten des Anfangspunktes
  newPath();                                               // Neuer Grafikpfad f�r Polygonzug (N�herung f�r Kurve) 
  ctx.moveTo(x,y);                                         // Anfangspunkt
  while (x < x0+width-20) {                                // Solange x-Koordinate nicht zu gro� ...                                
    x++;                                                   // x-Koordinate erh�hen
    var tt = (x-x0)/pixT+t0;                               // Zeit
    yy = a*Math.cos(omega1*tt)+b*Math.cos(omega2*tt);      // Auslenkung
    y = y0-pixY*yy;                                        // y-Koordinate
    ctx.lineTo(x,y);                                       // Teilstrecke zum Grafikpfad hinzuf�gen
    }
  ctx.stroke();                                            // Polygonzug zeichnen
  var c = (nr==1 ? color1 : color2);                       // Farbe des Pendels
  ctx.strokeStyle = ctx.fillStyle = c;                     // Linien- und F�llfarbe
  ctx.strokeRect(x0-10,y0-height/2-10,width+20,height+20); // Rahmen zeichnen
  yy = a*Math.cos(omega1*t)+b*Math.cos(omega2*t);          // Momentane Elongation
  circle(x0+Math.min(width/2,t*pixT),y0-pixY*yy,2.5);      // Kreis als Markierung
  }
  
// Grafikausgabe:
// Seiteneffekt t, t0, alpha1, alpha2, polygon1, polygon2
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausf�llen
  ctx.font = FONT1;                                        // Zeichensatz
  ctx.fillStyle = "#000000";                               // Farbe f�r Decke
  ctx.fillRect(30,ay-10,240,10);                           // Decke zeichnen
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // ... Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // ... L�nge des Zeitintervalls (s)
    if (slow) dt /= 10;                                    // ... Falls Zeitlupe, Zeitintervall durch 10 dividieren
    t += dt;                                               // ... Zeitvariable aktualisieren
    t0 = t1;                                               // ... Neuer Anfangszeitpunkt
    }
  var cos1 = Math.cos(omega1*t);                           // Cosinuswert f�r Eigenschwingung 1 
  var cos2 = Math.cos(omega2*t);                           // Cosinuswert f�r Eigenschwingung 2
  alpha1 = a1*cos1+a2*cos2;                                // Winkel gegen�ber der Senkrechten (Pendel 1)
  alpha2 = a1*cos1-a2*cos2;                                // Winkel gegen�ber der Senkrechten (Pendel 2)
  pendulum(80,alpha1,polygon1,color1);                     // Pendel 1 (links)
  pendulum(220,alpha2,polygon2,color2);                    // Pendel 2 (rechts)
  var fx1 = (polygon1[2].u+polygon1[3].u)/2;               // Linkes Ende der Feder, x-Koordinate
  var fy1 = (polygon1[2].v+polygon1[3].v)/2;               // Linkes Ende der Feder, y-Koordinate
  var fx2 = (polygon2[0].u+polygon2[1].u)/2;               // Rechtes Ende der Feder, x-Koordinate
  var fy2 = (polygon2[0].v+polygon2[1].v)/2;               // Rechtes Ende der Feder, y-Koordinate
  spring(fx1,fy1,fx2,fy2);                                 // Feder                    
  diagram(320,125,1);                                      // Diagramm f�r Pendel 1 (oben)
  diagram(320,290,2);                                      // Diagramm f�r Pendel 2 (unten)
  ctx.textAlign = "left";                                  // Textausrichtung linksb�ndig
  ctx.fillStyle = color1;                                  // Farbe f�r Pendel 1
  ctx.fillText(text05,40,340);                             // Beschriftung f�r Pendel 1 (links)        
  ctx.fillText(text05,315,55);                             // Beschriftung f�r Pendel 1 (oberes Diagramm)    
  ctx.fillStyle = color2;                                  // Farbe f�r Pendel 2
  ctx.fillText(text06,180,340);                            // Beschriftung f�r Pendel 2 (rechts)
  ctx.fillText(text06,315,220);                            // Beschriftung f�r Pendel 2 (unteres Diagramm)
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen



