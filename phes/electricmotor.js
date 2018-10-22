// Gleichstrom-Elektromotor
// Java-Applet (26.11.1997) umgewandelt
// 23.09.2014 - 20.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabh�ngige Texte sind in einer eigenen Datei (zum Beispiel electricmotor_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorNorth = "#ff0000";                                // Farbe f�r Nordpol
var colorSouth = "#00ff00";                                // Farbe f�r S�dpol
var colorContact = "#c0c0c0";                              // Farbe f�r Kontakte (ohne Strom)
var colorInsulator = "#000000";                            // Farbe f�r Isolator
var colorPlus = "#ff0000";                                 // Farbe f�r Pluspol
var colorMinus = "#0000ff";                                // Farbe f�r Minuspol
var	colorCurrent1 = "#ff0000";                             // Farbe f�r Strom (Dr�hte)
var colorCurrent2 = "#ff4040";                             // Farbe f�r Strom (Kontakte)
var	colorField = "#0000ff";                                // Farbe f�r Magnetfeld
var colorForce = "#000000";                                // Farbe f�r Lorentzkraft

// Sonstige Konstanten:

var PI = Math.PI;                                          // Abk�rzung f�r pi
var PI2 = 2*Math.PI;                                       // Abk�rzung f�r 2 pi
var DEG = Math.PI/180;                                     // Winkelgrad
var PHI = 305*DEG;                                         // Azimutwinkel (Bogenma�, zwischen 3 pi/2 und 2 pi)  
var THETA = 20*DEG;                                        // H�henwinkel (Bogenma�, zwischen 0 und pi/2)
var XM1 = 40;                                              // x-Koordinate f�r Hufeisenmagnet
var YM1 = 0, YM2 = 300, YM3 = 400;                         // y-Koordinaten f�r Hufeisenmagnet
var ZM1 = 90, ZM2 = 110;                                   // z-Koordinaten f�r Hufeisenmagnet
var XW1 = -80;                                             // x-Koordinate f�r Dr�hte
var ZW1 = 10, ZW2 = 70;                                    // z-Koordinaten f�r Stromquelle und Dr�hte
var YA1 = 80, YA2 = 200;                                   // y-Koordinaten f�r Leiterschleife
var ZA1 = 8, ZA2 = 30;                                     // z-Koordinaten f�r Leiterschleife
var XC1 = 6;                                               // x-Koordinate f�r Kontakte und Kommutator
var YC1 = 6;                                               // y-Koordinate f�r Kontakte und Kommutator
var ZC1 = 30, ZC2 = 42;                                    // z-Koordinaten f�r Kontakte
var U0 = 160, V0 = 250;                                    // Bildschirmkoordinaten des Ursprungs
var INSMAX = 15*DEG;                                       // Winkel f�r Isolator
var THICK = 3;                                             // Liniendicke f�r dicke Linien

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var bu1, bu2, bu3;                                         // Schaltkn�pfe (Reset, Start/Pause/Weiter, Umpolen)
var sl;                                                    // Schieberegler (Drehzahl)
var lb;                                                    // Ausgabefeld f�r Drehzahl
var cb1, cb2, cb3;                                         // Optionsfelder (Stromrichtung, Magnetfeld, Lorentzkraft)
var on;                                                    // Flag f�r Bewegung
var t0;                                                    // Anfangszeitpunkt
var omega;                                                 // Kreisfrequenz (1/s)
var direction;                                             // Drehrichtung (1 f�r Gegenuhrzeigersinn, -1 f�r Uhrzeigersinn)
var current;                                               // Stromrichtung (0, 1, -1)
var alpha;                                                 // Drehwinkel (Bogenma�)
var sinAlpha, cosAlpha;                                    // Trigonometrische Werte
var uRot, vRot;                                            // Aktuelle Koordinaten f�r rotierende Teile

var a1, a2, b1, b2, b3, c1, c2, c3;                        // Koeffizienten f�r Parallelprojektion

// Die Lage im Raum wird durch ein kartesisches Koordinatensystem (x, y, z) beschrieben.
// (Ursprung im Mittelpunkt des Kommutators, x-y-Ebene waagrecht (Drehachse als y-Achse), z-Achse nach oben)
// Die Berechnung der Bildschirmkoordinaten (u, v) erfolgt durch die Gleichungen
// u = U0 + a1 * x + a2 * y  und  v = V0 + b1 * x + b2 * y + b3 * z.
// Der Vektor (c1, c2, c3) gibt die Richtung zum Betrachter an.

var polygonN, polygonS;                                    // Polygone f�r Hufeisenmagnet (Nord- bzw. S�dpol)
var polygonContact1, polygonContact2;                      // Polygone f�r Schleifkontakte (oben bzw. unten)
var pointContact1, pointContact2;                          // Innere Punkte des Schleifkontakt-Polygone
var aEllipse, bEllipse;                                    // Gro�e und kleine Halbachse der Kommutator-Ellipsen (Pixel)
var deltaEllipse;                                          // Drehwinkel der Kommutator-Ellipsen (Bogenma�)
var pgInsulator1, pgInsulator2;                            // Polygone f�r Isolierschicht des Kommutators 

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
  bu2 = getElement("bu2",text02[1]);                       // Schaltknopf (Start/Pause/Weiter)
  bu2.state = 1;                                           // Anfangszustand (vor Start der Animation)
  bu3 = getElement("bu3",text03);                          // Schaltknopf (Umpolen)
  sl = getElement("sl");                                   // Schieberegler (Drehzahl)
  sl.value = 10;                                           // Anfangszustand (6 U/min; T = 10 s)
  lb = getElement("lb");                                   // Ausgabefeld f�r Drehzahl
  reactionSlider();                                        // Festlegung von omega, Ausgabe der Drehzahl
  cb1 = getElement("cb1");                                 // Optionsfeld (Stromrichtung)
  getElement("lb1",text04);                                // Erkl�render Text (Stromrichtung)
  cb2 = getElement("cb2");                                 // Optionsfeld (Magnetfeld)
  getElement("lb2",text05);                                // Erkl�render Text (Magnetfeld)
  cb3 = getElement("cb3");                                 // Optionsfeld (Lorentzkraft)
  getElement("lb3",text06);                                // Erkl�render Text (Lorentzkraft)
  cb1.checked = cb2.checked = cb3.checked = true;          // Optionsfelder eingeschaltet
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // �bersetzer
    
  on = true;                                               // Animation angeschaltet
  t0 = new Date();                                         // Anfangszeitpunkt
  setInterval(paint,40);                                   // Timer-Intervall 0,040 s
  
  direction = 1;                                           // Anfangswert f�r Drehrichtung (Gegenuhrzeigersinn)
  alpha = 0;                                               // Anfangswert f�r Winkel
  
  calcCoeff();                                             // Koeffizienten f�r Projektion berechnen
  initPolygons();                                          // Polygone vorbereiten
  calcEllipse();                                           // Berechnungen f�r Ellipse (Kommutator)
  
  bu1.onclick = reactionReset;                             // Reaktion auf Resetknopf
  bu2.onclick = reactionStart;                             // Reaktion auf Schaltknopf Start/Pause/Weiter
  bu3.onclick = reactionReverse;                           // Reaktion auf Schaltknopf Umpolen
  sl.onchange = reactionSlider;                            // Reaktion auf Schieberegler
  sl.onclick = reactionSlider;                             // Reaktion auf Schieberegler
  
  } // Ende der Methode start
  
// Zustandsfestlegung f�r Schaltknopf Start/Pause/Weiter:
// st ... Gew�nschter Zustand
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
  
// Reaktion auf Resetknopf:
// Seiteneffekt bu2.state, alpha, on
   
function reactionReset () {
  setButton2State(0);                                      // Zustand des Schaltknopfs Start/Pause/Weiter
  alpha = 0;                                               // Winkel zur�cksetzen
  on = false;                                              // Animation abgeschaltet
  }
  
// Reaktion auf den Schaltknopf Start/Pause/Weiter:
// Seiteneffekt t0, bu2.state 

function reactionStart () {
  if (bu2.state != 1) t0 = new Date();                     // Falls Animation angeschaltet, neuer Anfangszeitpunkt
  switchButton2();                                         // Zustand des Schaltknopfs �ndern
  on = (bu2.state == 1);                                   // Flag f�r Animation
  }
  
// Reaktion auf den Schaltknopf Umpolen:
// Seiteneffekt direction

function reactionReverse () {
  direction = -direction;                                  // Stromrichtung umkehren
  }
  
// Reaktion auf Schieberegler:
// Seiteneffekt omega

function reactionSlider () {
  var n = sl.value;                                        // Position des Schiebereglers
  omega = n*PI2/100;                                       // Kreisfrequenz (1/s)
  var s = (n*0.6).toFixed(1);                              // Zeichenkette f�r Wert der Drehzahl
  s = s.replace(".",decimalSeparator);                     // Eventuell Punkt durch Komma ersetzen
  if (n == 0) s = "0";                                     // Sonderfall 0 (ohne Nachkommastelle)
  lb.innerHTML = s+" "+rotationsPerMinute;                 // Drehzahl ausgeben (Umdrehungen pro Minute)
  }
  
//-------------------------------------------------------------------------------------------------

// Polygone initialisieren:
// Seiteneffekt polygonS

function initPolygons () {
  polygonS = new Array(8);                                 // Polygon f�r den S�dpol des Hufeisenmagneten
  setPoint(polygonS,0,XM1,YM1,-ZM2);
  setPoint(polygonS,1,XM1,YM3,-ZM2);
  setPoint(polygonS,2,XM1,YM3,0);
  setPoint(polygonS,3,XM1,YM2,0);
  setPoint(polygonS,4,-XM1,YM2,0);
  setPoint(polygonS,5,-XM1,YM2,-ZM1);
  setPoint(polygonS,6,-XM1,YM1,-ZM1);
  setPoint(polygonS,7,-XM1,YM1,-ZM2);
  polygonN = new Array(9);                                 // Polygon f�r den Nordpol des Hufeisenmagneten
  setPoint(polygonN,0,-XM1,YM3,ZM2);
  setPoint(polygonN,1,-XM1,YM1,ZM2);
  setPoint(polygonN,2,-XM1,YM1,ZM1);
  setPoint(polygonN,3,XM1,YM1,ZM1);
  setPoint(polygonN,5,-XM1,YM2,0);
  setPoint(polygonN,6,XM1,YM2,0);
  setPoint(polygonN,7,XM1,YM3,0);
  setPoint(polygonN,8,XM1,YM3,ZM2);
  var du = screenU(XM1,YM2)-polygonN[3].u;
  var dv = screenV(XM1,YM2,ZM1)-polygonN[3].v;
  var m = dv/du;
  var uS = polygonN[5].u;
  var vS = polygonN[3].v+m*(uS-polygonN[3].u);  
  polygonN[4] = {u: uS, v: vS};
  polygonContact1 = new Array(7);                          // Polygon f�r den oberen Schleifkontakt 
  polygonContact2 = new Array(7);                          // Polygon f�r den unteren Schleifkontakt
  pointContact1 = initCuboid(polygonContact1,-XC1,XC1,-YC1,YC1,ZC1,ZC2);   // Innerer Punkt (oberer Schleifkontakt)
  pointContact2 = initCuboid(polygonContact2,-XC1,XC1,-YC1,YC1,-ZC2,-ZC1); // Innerer Punkt (unterer Schleifkontakt)
  pgInsulator1 = new Array(20);                            // Polygon f�r Isolierschicht (Vorderfl�che Kommutator)
  pgInsulator2 = new Array(20);                            // Polygon f�r Isolierschicht (Mantelfl�che Kommutator)
  for (i=0; i<20; i++) {                                   // Vorl�ufige Koordinaten
    pgInsulator1[i] = {u: 0, v: 0};
    pgInsulator2[i] = {u: 0, v: 0};
    }
  }

// Koeffizienten f�r Projektion berechnen:
// Seiteneffekt a1, a2, b1, b2, b3, c1, c2, c3
  
function calcCoeff () {
  a1 = -Math.sin(PHI); a2 = Math.cos(PHI);                 // Vektor (a1, a2, 0) f�r waagrechte Bildschirmkoordinate
  b1 = Math.sin(THETA)*a2; b2 = -Math.sin(THETA)*a1;       // Vektor (b1, b2, b3) f�r senkrechte Bildschirmkoordinate
  b3 = -Math.cos(THETA);
  c1 = a2*b3; c2 = -a1*b3; c3 = a1*b2-a2*b1;               // Vektor (c1, c2, c3) zum Betrachter (Kreuzprodukt)
  }
    
// Waagrechte Bildschirmkoordinate:
// (x,y,z) ... R�umliche Position
  
function screenU (x, y) {
  return U0+a1*x+a2*y;
  }

// Senkrechte Bildschirmkoordinate:
// (x,y,z) ... R�umliche Position
      
function screenV (x, y, z) {
  return V0+b1*x+b2*y+b3*z;
  }
  
// Berechnungen f�r Kommutator-Ellipsen:
// Seiteneffekt aEllipse, bEllipse, deltaEllipse

function calcEllipse () {
  var r = ZC1;                                             // Radius  
  // Die Hilfsgr��en c, d und m sind durch folgende Bedingungen bestimmt:
  // Ellipse durch (c|mc) mit unendlicher Steigung
  // Ellipse durch Punkt (0|d) mit Steigung m  
  var c = a1*r, d = -b3*r, m = b1/a1;   
  // Koeffizienten der Ellipsengleichung (c11 u^2 + 2 c12 uv + c22 v^2 + c0 = 0)  
  var c11 = c*c*m*m+d*d;                                   // Koeffizient von u^2
  var c12 = -m*c*c;                                        // Koeffizient von uv
  var c22 = c*c;                                           // Koeffizient von v^2
  var c0 = -c*c*d*d;                                       // Konstanter Summand  
  // Koeffizienten der biquadratischen Gleichung (a^4 + bq a^2 + cq = 0) f�r die gro�e Halbachse a  
  var bq = -c*c*(1+m*m)-d*d;                               // Koeffizient von a^2
  var cq = c*c*d*d;                                        // Konstanter Summand
  var discr = bq*bq-4*cq;                                  // Diskriminante
  aEllipse = Math.sqrt((-bq-Math.sqrt(discr))/2);          // Gro�e Halbachse (Pixel)
  bEllipse = c*d/aEllipse;                                 // Kleine Halbachse (Pixel)  
  deltaEllipse = Math.atan(2*c12/(c22-c11))/2;             // Drehwinkel (Bogenma�, negativ)
  }
  
// Polygonecke festlegen (Version f�r nicht bewegte Teile):
// p ......... Array f�r Bildschirmkoordinaten der Polygonecken
// i ......... Index der Ecke
// (x,y,z) ... R�umliche Position
// Seiteneffekt p[i].u, p[i].v
  
function setPoint (p, i, x, y, z) {
  p[i]= {u: screenU(x,y), v: screenV(x,y,z)};
  }
  
// Polygonecke festlegen (Version f�r rotierende Teile):
// p ......... Array f�r Bildschirmkoordinaten der Polygonecken
// i ......... Index der Ecke
// (x,y,z) ... R�umliche Position f�r alpha = 0
// Seiteneffekt uRot, vRot, p[i].u, p[i].v
  
function setPointRot (p, i, x, y, z) {
  screenCoordsRot(x,y,z);                                  // Bildschirmkoordinaten berechnen
  p[i].u = uRot; p[i].v = vRot;                            // Koordinaten der Polygonecke festlegen
  }
 
// Vorbereitung eines Polygons f�r ein Quader-Schr�gbild:
// p .......... Polygon f�r Umrandung
// xx1, xx2 ... Unter- und Obergrenze f�r x-Koordinate
// yy1, yy2 ... Unter- und Obergrenze f�r y-Koordinate
// zz1, zz2 ... Unter- und Obergrenze f�r z-Koordinate
// R�ckgabewert: Innerer Punkt (Bildschirmkoordinaten u, v)
      
function initCuboid (p, xx1, xx2, yy1, yy2, zz1, zz2) {
  p[0] = {u: screenU(xx1,yy1), v: screenV(xx1,yy1,zz1)};
  p[1] = {u: screenU(xx2,yy1), v: screenV(xx2,yy1,zz1)};
  p[2] = {u: screenU(xx2,yy1), v: screenV(xx2,yy1,zz1)};
  p[3] = {u: screenU(xx2,yy2), v: screenV(xx2,yy2,zz1)};
  p[4] = {u: screenU(xx2,yy2), v: screenV(xx2,yy2,zz2)};
  p[5] = {u: screenU(xx1,yy2), v: screenV(xx1,yy2,zz2)}; 
  p[6] = {u: screenU(xx1,yy1), v: screenV(xx1,yy1,zz2)};
  return {u: screenU(xx2,yy1), v: screenV(xx2,yy1,zz2)};   // Innerer Punkt
  }
  
// Ausgangspunkt festlegen (Version f�r nicht bewegte Teile):
// (x,y,z) ... R�umliche Position

function moveTo (x, y, z) {
  ctx.moveTo(screenU(x,y),screenV(x,y,z));
  }
  
// Linie zu einem gegebenen Punkt vorbereiten (Version f�r nicht bewegte Teile):
// (x,y,z) ... R�umliche Position

function lineTo (x, y, z) {
  ctx.lineTo(screenU(x,y),screenV(x,y,z));
  }
  
// Bildschirmkoordinaten f�r rotierenden Teil:
// Seiteneffekt uRot, vRot

function screenCoordsRot (x, y, z) {
  var xx = x*cosAlpha-z*sinAlpha;                          // x-Koordinate nach Drehung
  var zz = x*sinAlpha+z*cosAlpha;                          // z-Koordinate nach Drehung
  uRot = U0+a1*xx+a2*y;                                    // Waagrechte Bildschirmkoordinate (Pixel)
  vRot = V0+b1*xx+b2*y+b3*zz;                              // Senkrechte Bildschirmkoordinate (Pixel)
  }
  
// Ausgangspunkt festlegen (Version f�r rotierende Teile):
// (x,y,z) ... R�umliche Position f�r alpha = 0
// Seiteneffekt uRot, vRot

function moveToRot (x, y, z) {
  screenCoordsRot(x,y,z);                                  // Bildschirmkoordinaten berechnen
  ctx.moveTo(uRot,vRot);                                   // Ausgangsposition festlegen
  }

// Linie zu einem gegebenen Punkt vorbereiten (Version f�r rotierende Teile):
// (x,y,z) ... r�umliche Position f�r alpha = 0
// Seiteneffekt uRot, vRot

function lineToRot (x, y, z) {
  screenCoordsRot(x,y,z);                                  // Bildschirmkoordinaten berechnen
  ctx.lineTo(uRot,vRot);                                   // Linie vorbereiten
  }  

//-------------------------------------------------------------------------------------------------

// Neuer Pfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
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
  
// Pfeil auf einer vorhandenen Verbindungslinie (Version f�r nicht bewegte Teile):
// (x1,y1,z1) ... R�umliche Position des ersten Punkts
// (x2,y2,z2) ... R�umliche Position des zweiten Punkts
// q ............ Bruchteil
// d ............ Flag f�r Pfeil vom ersten zum zweiten Punkt
  
function arrowLine (x1, y1, z1, x2, y2, z2, q, d) {
  var u1 = screenU(x1,y1), v1 = screenV(x1,y1,z1);         // Bildschirmkoordinaten des ersten Punkts
  var u2 = screenU(x2,y2), v2 = screenV(x2,y2,z2);         // Bildschirmkoordinaten des zweiten Punkts
  var du = u2-u1, dv = v2-v1;                              // Verbindungsvektor
  if (d) arrow(u1,v1,u1+q*du,v1+q*dv,THICK);               // Entweder Pfeil vom ersten Punkt auf den zweiten Punkt zu ...
  else arrow(u2,v2,u2-q*du,v2-q*dv,THICK);                 // ... oder Pfeil vom zweiten Punkt auf den ersten Punkt zu
  }
  
// Pfeil auf einer vorhandenen Verbindungslinie (Version f�r rotierende Teile):
// (x1,y1,z1) ... R�umliche Position des ersten Punkts
// (x2,y2,z2) ... R�umliche Position des zweiten Punkts
// q ............ Bruchteil
// d ............ Flag f�r Pfeil vom ersten zum zweiten Punkt
  
function arrowLineRot (x1, y1, z1, x2, y2, z2, q, d) {
  var xx1 = x1*cosAlpha-z1*sinAlpha;                       // x-Koordinate des ersten Punkts nach der Drehung
  var zz1 = x1*sinAlpha+z1*cosAlpha;                       // z-Koordinate des ersten Punkts nach der Drehung
  var xx2 = x2*cosAlpha-z2*sinAlpha;                       // x-Koordinate des zweiten Punkts nach der Drehung
  var zz2 = x2*sinAlpha+z2*cosAlpha;                       // z-Koordinate des zweiten Punkts nach der Drehung
  arrowLine(xx1,y1,zz1,xx2,y2,zz2,q,d);                    // Pfeil zeichnen
  }
  
// Polygon zeichnen:
// p ... Array mit Koordinaten der Ecken
// c ... F�llfarbe

function drawPolygon (p, c) {
  newPath();                                               // Neuer Pfad (Standardwerte)
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.moveTo(p[0].u,p[0].v);                               // Zur ersten Ecke
  for (var i=1; i<p.length; i++)                           // F�r alle weiteren Ecken ... 
    ctx.lineTo(p[i].u,p[i].v);                             // Linie zum Pfad hinzuf�gen
  ctx.closePath();                                         // Zur�ck zum Ausgangspunkt
  ctx.fill(); ctx.stroke();                                // Polygon ausf�llen und Rand zeichnen   
  }
  
// Verbindungslinie zweier Punkte:
// (u1,v1), (u2,v2) ... Bildschirmkoordinaten der Endpunkte

function line (u1, v1, u2, v2) {
  newPath();                                               // Neuer Pfad (Standardwerte)
  ctx.moveTo(u1,v1); ctx.lineTo(u2,v2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Verbindungslinie eines Punktes im Inneren eines Polygons mit einer Polygonecke:
// (u,v) ... Bildschirmkoordinaten des inneren Punkts
// p ....... Array der Polygonecken
// i ....... Index der Polygonecke

function lineP (u, v, p, i) {
  line(u,v,p[i].u,p[i].v);                                 // Linie zeichnen
  }
  
// Ellipse zeichnen:
// x, y ... Koordinaten des Mittelpunkts (Pixel)
// a, b ... Halbachsen waagrecht/senkrecht (Pixel)
// c ...... F�llfarbe (optional)
// d ...... Drehwinkel (Bogenma�, Gegenuhrzeigersinn, optional)
  
function ellipse (x, y, a, b, c, d) {
  if (a <= 0 || b <= 0) return;                  // Falls negative Halbachse, abbrechen
  if (c) ctx.fillStyle = c;                      // F�llfarbe �ndern, falls definiert
  ctx.strokeStyle = "#000000";                   // Linienfarbe schwarz
  ctx.lineWidth = 1;                             // Liniendicke
  ctx.save();                                    // Grafikkontext speichern
  ctx.beginPath();                               // Neuer Pfad
  ctx.translate(x,y);                            // Ellipsenmittelpunkt als Ursprung des Koordinatensystems 
  if (d) ctx.rotate(-d);                         // Drehung, falls Drehwinkel definiert
  ctx.scale(a,b);                                // Skalierung in x- und y-Richtung
  ctx.arc(0,0,1,0,PI2,false);                    // Einheitskreis (wird durch Skalierung zur Ellipse)
  ctx.restore();                                 // Fr�heren Grafikkontext wiederherstellen
  if (c) ctx.fill();                             // Ellipse f�llen, falls F�llfarbe definiert
  ctx.stroke();                                  // Rand zeichnen
  }
  
// Nordpol des Hufeisenmagneten zeichnen:

function magnetNorth () {
  drawPolygon(polygonN,colorNorth);                        // Polygon f�r obere H�lfte (Nordpol)
  var u1 = screenU(XM1,YM1);                               // Innerer Punkt links, waagrechte Bildschirmkoordinate
  var v1 = screenV(XM1,YM1,ZM2);                           // Innerer Punkt links, senkrechte Bildschirmkoordinate
  lineP(u1,v1,polygonN,1);                                 // Linie vom inneren Punkt nach links oben
  lineP(u1,v1,polygonN,3);                                 // Linie vom inneren Punkt nach unten
  lineP(u1,v1,polygonN,8);                                 // Linie vom inneren Punkt nach rechts oben
  var u2 = screenU(XM1,YM2);                               // Innerer Punkt rechts, waagrechte Bildschirmkoordinate
  var v2 = screenV(XM1,YM2,ZM1);                           // Innerer Punkt rechts, senkrechte Bildschirmkoordinate
  lineP(u2,v2,polygonN,4);                                 // Linie vom inneren Punkt nach links unten
  lineP(u2,v2,polygonN,6);                                 // Linie vom inneren Punkt nach unten
  }
  
// S�dpol des Hufeisenmagneten zeichnen:

function magnetSouth () {
  drawPolygon(polygonS,colorSouth);                        // Polygon f�r untere H�lfte (S�dpol)
  var u1 = screenU(XM1,YM1);                               // Innerer Punkt links, waagrechte Bildschirmkoordinate
  var v1 = screenV(XM1,YM1,-ZM1);                          // Innerer Punkt links, senkrechte Bildschirmkoordinate 
  lineP(u1,v1,polygonS,0);                                 // Linie vom inneren Punkt nach unten
  lineP(u1,v1,polygonS,6);                                 // Linie vom inneren Punkt nach links oben
  var u2 = screenU(XM1,YM2);                               // Innerer Punkt rechts, waagrechte Bildschirmkoordinate
  var v2 = screenV(XM1,YM2,-ZM1);                          // Innerer Punkt rechts, senkrechte Bildschirmkoordinate
  line(u1,v1,u2,v2);                                       // Linie zwischen den beiden inneren Punkten
  lineP(u2,v2,polygonS,3);                                 // Linie vom inneren Punkt nach oben
  lineP(u2,v2,polygonS,5);                                 // Linie vom inneren Punkt nach links oben
  }
    
// Buchse der Stromquelle mit Beschriftung:
// (x,y,z) ... R�umliche Position des Buchsen-Mittelpunkts
// pos ....... Flag f�r Pluspol

function pole (x, y, z, pos) {
  var u = screenU(x,y), v = screenV(x,y,z);                // Bildschirmkoordinaten berechnen
  ctx.beginPath();                                         // Neuer Pfad
  ctx.arc(u,v,4,0,PI2,false);                              // Kreis vorbereiten 
  ctx.stroke();                                            // Kreis zeichnen
  ctx.fillStyle = (pos ? colorPlus : colorMinus);          // Farbe f�r Beschriftung
  ctx.fillText(pos ? "+" : "-",u-25,v+7);                  // Beschriftung links (Vorzeichen)
  }
  
// Obere Dr�hte und Stromquelle zeichnen:

function wires1 () {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.lineWidth = THICK;                                   // Liniendicke
  var c = (current!=0 ? colorCurrent1 : "#000000");        // Farbe (mit bzw. ohne Strom)
  ctx.strokeStyle = c;                                     // Linienfarbe
  moveTo(XW1,0,ZW1+5);                                     // Ausgangspunkt (obere Buchse der Stromquelle)
  lineTo(XW1,0,ZW2);                                       // Weiter nach oben
  lineTo(0,0,ZW2);                                         // Weiter nach rechts
  lineTo(0,0,ZC2);                                         // Weiter nach unten (oberer Schleifkontakt)
  ctx.stroke();                                            // Linien zeichnen
  ctx.font = "normal normal bold 24px monospace";          // Zeichensatz f�r Plus- und Minuszeichen
  var pos = (direction > 0);                               // Flag f�r Pluspol oben
  pole(XW1,0,ZW1,pos);                                     // Obere Buchse der Stromquelle
  pole(XW1,0,-ZW1,!pos);                                   // Untere Buchse der Stromquelle
  if (!cb1.checked || current == 0) return;                // Falls Optionsfeld nicht aktiviert oder kein Strom, abbrechen
  arrowLine(XW1,0,ZW2,0,0,ZW2,0.65,pos);                   // Pfeil f�r Stromrichtung
  }
  
// Untere Dr�hte zeichnen:

function wires2 () {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.lineWidth = THICK;                                   // Liniendicke
  var c = (current!=0 ? colorCurrent1 : "#000000");        // Farbe (mit bzw. ohne Strom) 
  ctx.strokeStyle = c;                                     // Linienfarbe
  moveTo(XW1,0,-ZW1-5);                                    // Ausgangspunkt (untere Buchse der Stromquelle)
  lineTo(XW1,0,-ZW2);                                      // Weiter nach unten
  lineTo(0,0,-ZW2);                                        // Weiter nach rechts
  lineTo(0,0,-ZC2);                                        // Weiter nach oben (unterer Schleifkontakt)
  ctx.stroke();                                            // Linien zeichnen
  if (!cb1.checked || current == 0) return;                // Falls Optionsfeld nicht aktiviert oder kein Strom, abbrechen
  var pos = (direction > 0);                               // Flag f�r Pluspol oben  
  arrowLine(0,0,-ZW2,XW1,0,-ZW2,0.65,pos);                 // Pfeil f�r Stromrichtung
  }
  
// Kontakt zeichnen:
// pg ... Polygon
// pt ... Innerer Punkt

function contact (pg, pt) {
  var col = (current!=0 ? colorCurrent2 : colorContact);   // Farbe (mit bzw. ohne Strom) 
  drawPolygon(pg,col);                                     // Ausgef�lltes Polygon mit Rand
  var u = pt.u, v = pt.v;                                  // Innerer Punkt
  lineP(u,v,pg,2);                                         // Linie vom inneren Punkt nach unten
  lineP(u,v,pg,4);                                         // Linie vom inneren Punkt nach rechts oben
  lineP(u,v,pg,6);                                         // Linie vom inneren Punkt nach links oben
  }
  
// Kommutator zeichnen:
  
function commutator () {
  var color = (current!=0 ? colorCurrent2 : colorContact); // Farbe f�r Ellipsen
  var u = screenU(0,YC1), v = screenV(0,YC1,0);            // Mittelpunkt der hinteren Ellipse berechnen
  ellipse(u,v,aEllipse,bEllipse,color,deltaEllipse);       // Hintere Ellipse zeichnen
  u = screenU(0,-YC1); v = screenV(0,-YC1,0);              // Mittelpunkt der vorderen Ellipse berechnen
  ellipse(u,v,aEllipse,bEllipse,color,deltaEllipse);       // Vordere Ellipse zeichnen
  // Die Isolierschicht wird n�herungsweise durch zwei Polygone dargestellt, eines auf der Vorderfl�che (pgInsulator1)
  // und eines auf der Mantelfl�che (pgInsulator2).
  var dw = INSMAX/5;                                       // Winkel f�r Polygonecken (Bogenma�)
  for (i=0; i<20; i++) {                                   // F�r alle Polygonecken (Vorderfl�che) ...
    var w = (i<10 ? (i-5)*dw : (i-15)*dw+PI);              // Winkel berechnen
    var xx = ZC1*Math.cos(w);                              // x-Koordinate der Polygonecke berechnen
    var zz = ZC1*Math.sin(w);                              // z-Koordinate der Polygonecke berechnen
    setPointRot(pgInsulator1,i,xx,-YC1,zz);                // Bildschirmkoordinaten der Ecke speichern 
    }
  // Durch die Variable seite wird festgestellt, welche Seite des Kommutators sichtbar ist.
  var seite = c1*cosAlpha+c3*sinAlpha;                     // Skalarprodukt
  for (i=0; i<10; i++) {                                   // F�r die ersten 10 Polygonecken (Mantelfl�che) ...
    var w = (i-5)*dw;                                      // Winkel berechnen
    if (seite > 0) w += PI;                                // Falls falsche Seite, pi addieren
    var xx = ZC1*Math.cos(w);                              // x-Koordinate der Polygonecke berechnen
    var zz = ZC1*Math.sin(w);                              // z-Koordinate der Polygonecke berechnen
    setPointRot(pgInsulator2,i,xx,-YC1,zz);                // Bildschirmkoordinaten f�r Ecke auf der Vorderseite speichern
    setPointRot(pgInsulator2,19-i,xx,YC1,zz);              // Bildschirmkoordinaten f�r Ecke auf der R�ckseite speichern
    }
  drawPolygon(pgInsulator1,colorInsulator);                // Polygon auf der Vorderfl�che zeichnen
  drawPolygon(pgInsulator2,colorInsulator);                // Polygon auf der Mantelfl�che zeichnen
  }
  
// Ankerh�lfte zeichnen:
// zPos ... Flag f�r positive z-Koordinate (in Ausgangsposition)

function armature (zPos) {
  var sign = (zPos ? 1 : -1);                              // Vorzeichen der z-Koordinate (in Ausgangsposition)
  var c = (current!=0 ? colorCurrent1 : "#000000");        // Farbe (mit bzw. ohne Strom)
  ctx.beginPath();                                         // Neuer Pfad  
  ctx.strokeStyle = c;                                     // Linienfarbe
  ctx.lineWidth = THICK;                                   // Liniendicke
  ctx.lineJoin = "round";                                  // Verbindung von Linien (statt Standardwert "miter")
  moveToRot(0,0,sign*ZA1);                                 // Ausgangspunkt (Kommutator) 
  lineToRot(0,YA1,sign*ZA1);                               // Kurzes Drahtst�ck vom Kommutator weg 
  lineToRot(0,YA1,sign*ZA2);                               // Kurzes Drahtst�ck von der Drehachse weg 
  lineToRot(0,YA2,sign*ZA2);                               // L�ngeres Drahtst�ck parallel zur Drehachse 
  lineToRot(0,YA2,0);                                      // Drahtst�ck zur Drehachse
  ctx.stroke();                                            // Linien zeichnen
  if (cb1.checked && current != 0) {                       // Falls Optionsfeld aktiviert und Stromfluss ...       
    var d = sign*current*direction;                        // Flag f�r Pfeilrichtung
    arrowLineRot(0,YA1,sign*ZA2,0,YA2,sign*ZA2,0.7,d<0);   // Pfeil f�r Stromrichtung
    }
  }
  
// Feldlinien des Magnetfelds zeichnen:
// i1 ... Erster Index
// i2 ... Letzter Index

function fieldLines (i1, i2) {
  if (!cb2.checked) return;                                // Falls Optionsfeld nicht aktiviert, abbrechen
  ctx.beginPath();                                         // Neuer Pfad
  ctx.lineWidth = THICK;                                   // Liniendicke
  ctx.strokeStyle = colorField;                            // Farbe f�r Magnetfeld
  var y0 = (YA2+YA1)/2;                                    // y-Koordinate f�r mittlere Feldlinie
  for (i=i1; i<=i2; i++) {                                 // F�r alle Linien ...
    var y1 = y0+i*36;                                      // y-Koordinate berechnen
    moveTo(0,y1,-ZM1);                                     // Anfangspunkt berechnen
    lineTo(0,y1,ZM1);                                      // Linie vorbereiten
    }
  ctx.stroke();                                            // Linien zeichnen
  for (i=i1; i<=i2; i++) {                                 // F�r alle Linien ...
    var y1 = y0+i*36;                                      // y-Koordinate berechnen
    arrowLine(0,y1,ZM1,0,y1,-ZM1,0.25,true);               // Obere Pfeilspitze zeichnen
    arrowLine(0,y1,ZM1,0,y1,-ZM1,0.85,true);               // Untere Pfeilspitze zeichnen
    }
  }
  
// Pfeil f�r Lorentzkraft zeichnen:
// zPos ... Flag f�r positive z-Koordinate (in Ausgangsposition)

function forceArrow (zPos) {
  if (!cb3.checked) return;                                // Falls Optionsfeld nicht aktiviert, abbrechen
  var y = (YA1+YA2)/2;                                     // y-Koordinate des Angriffspunkts
  var z = (zPos ? ZA2 : -ZA2);                             // z-Koordinate f�r alpha = 0
  var d = current*direction*40;                            // Vorzeichenbehaftete Pfeill�nge
  if (!zPos) d = -d;
  ctx.strokeStyle = colorForce;                            // Farbe f�r Lorentzkraft
  if (current != 0) {                                      // Falls Strom flie�t ...
    screenCoordsRot(0,y,z);                                // ... Bildschirmkoordinaten des Angriffspunkts berechnen
    arrow(uRot,vRot,uRot+a1*d,vRot+b1*d,THICK);            // ... Pfeil zeichnen
    }
  }  
  
// Grafikausgabe:
// Seiteneffekt alpha, cosAlpha, sinAlpha, current
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausf�llen
  magnetSouth();                                           // S�dpol des Hufeisenmagneten
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // ... Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // ... L�nge des Zeitintervalls (s)
    alpha += direction*omega*dt;                           // ... Winkel alpha aktualisieren 
    t0 = t1;                                               // Neuer Anfangszeitpunkt
    }
  var n = Math.floor(alpha/PI2);                           // 0 < alpha < 2*pi erzwingen 
  alpha -= n*PI2;
  cosAlpha = Math.cos(alpha);                              // Cosinuswert
  sinAlpha = Math.sin(alpha);                              // Sinuswert
  if (cosAlpha > 0) current = -1;                          // Entweder Stromrichtung wie am Anfang ...
  if (cosAlpha < 0) current = 1;                           // ... oder umgekehrt
  if (Math.abs(cosAlpha) < Math.sin(INSMAX)) current = 0;  // Falls Isolator bei den Kontakten, kein Stromfluss 
  var qu = Math.floor(alpha*2/PI)+1;                       // Quadrant
  if (direction == 1)                                      // Falls Drehung im Gegenuhrzeigersinn ...
    switch (qu) {                                          // Reihenfolge wegen gegenseitiger Verdeckung je nach Quadrant 
      case 1:                                              // 1. Quadrant
        forceArrow(true); armature(true);                  // Hinterer Kraftpfeil, hintere Ankerh�lfte
        fieldLines(-2,2);                                  // Alle Feldlinien
        armature(false); forceArrow(false);                // Vordere Ankerh�lfte, vorderer Kraftpfeil 
        break;
      case 2:                                              // 2. Quadrant 
        armature(true); fieldLines(0,2);                   // Hintere Ankerh�lfte, rechte Feldlinien
        forceArrow(true); forceArrow(false);               // Hinterer und vorderer Kraftpfeil
        fieldLines(-2,-1); armature(false);                // Rechte Feldlinien, vordere Ankerh�lfte 
        break;
      case 3:                                              // 3. Quadrant
        forceArrow(false); armature(false);                // Hinterer Kraftpfeil, hintere Ankerh�lfte
        fieldLines(-2,2);                                  // Alle Feldlinien
        armature(true); forceArrow(true);                  // Vordere Ankerh�lfte, vorderer Kraftpfeil 
        break;
      case 4:                                              // 4. Quadrant
        armature(false); fieldLines(0,2);                  // Hintere Ankerh�lfte, rechte Feldlinien
        forceArrow(false); forceArrow(true);               // Hinterer und vorderer Kraftpfeil
        fieldLines(-2,-1); armature(true);                 // Linke Feldlinien, vordere Ankerh�lfte
        break;
      } // Ende switch
  else {                                                   // Falls Drehung im Uhrzeigersinn ...
    switch (qu) {                                          // Reihenfolge wegen gegenseitiger Verdeckung je nach Quadrant  
      case 4:                                              // 4. Quadrant 
        forceArrow(false); armature(false);                // Hinterer Kraftpfeil, hintere Ankerh�lfte
        fieldLines(-2,2);                                  // Alle Feldlinien
        armature(true); forceArrow(true);                  // Vordere Ankerh�lfte, vorderer Kraftpfeil
        break;
      case 3:                                              // 3. Quadrant
        armature(false); fieldLines(0,2);                  // Hintere Ankerh�lfte, rechte Feldlinien
        forceArrow(false); forceArrow(true);               // Hinterer und vorderer Kraftpfeil
        fieldLines(-2,-1); armature(true);                 // Linke Feldlinien, vordere Ankerh�lfte 
        break;
      case 2:                                              // 2. Quadrant
        forceArrow(true); armature(true);                  // Hinterer Kraftpfeil, hintere Ankerh�lfte
        fieldLines(-2,2);                                  // Alle Feldlinien
        armature(false); forceArrow(false);                // Vordere Ankerh�lfte, vorderer Kraftpfeil
        break;
      case 1:                                              // 1. Quadrant
        armature(true); fieldLines(0,2);                   // Hintere Ankerh�lfte, rechte Feldlinien
        forceArrow(true); forceArrow(false);               // Hinterer und vorderer Kraftpfeil
        fieldLines(-2,-1); armature(false);                // Linke Feldlinien, vordere Ankerh�lfte
        break;
      } // Ende switch
    } // Ende if - else 
  magnetNorth();                                           // Nordpol des Hufeisenmagneten 
  wires2();                                                // Untere Dr�hte  
  contact(polygonContact2,pointContact2);                  // Unterer Kontakt
  commutator();                                            // Kommutator
  contact(polygonContact1,pointContact1);                  // Oberer Kontakt
  wires1();                                                // Obere Dr�hte und Stromquelle
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen


