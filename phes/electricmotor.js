// Gleichstrom-Elektromotor
// Java-Applet (26.11.1997) umgewandelt
// 23.09.2014 - 20.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind in einer eigenen Datei (zum Beispiel electricmotor_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorNorth = "#ff0000";                                // Farbe für Nordpol
var colorSouth = "#00ff00";                                // Farbe für Südpol
var colorContact = "#c0c0c0";                              // Farbe für Kontakte (ohne Strom)
var colorInsulator = "#000000";                            // Farbe für Isolator
var colorPlus = "#ff0000";                                 // Farbe für Pluspol
var colorMinus = "#0000ff";                                // Farbe für Minuspol
var	colorCurrent1 = "#ff0000";                             // Farbe für Strom (Drähte)
var colorCurrent2 = "#ff4040";                             // Farbe für Strom (Kontakte)
var	colorField = "#0000ff";                                // Farbe für Magnetfeld
var colorForce = "#000000";                                // Farbe für Lorentzkraft

// Sonstige Konstanten:

var PI = Math.PI;                                          // Abkürzung für pi
var PI2 = 2*Math.PI;                                       // Abkürzung für 2 pi
var DEG = Math.PI/180;                                     // Winkelgrad
var PHI = 305*DEG;                                         // Azimutwinkel (Bogenmaß, zwischen 3 pi/2 und 2 pi)  
var THETA = 20*DEG;                                        // Höhenwinkel (Bogenmaß, zwischen 0 und pi/2)
var XM1 = 40;                                              // x-Koordinate für Hufeisenmagnet
var YM1 = 0, YM2 = 300, YM3 = 400;                         // y-Koordinaten für Hufeisenmagnet
var ZM1 = 90, ZM2 = 110;                                   // z-Koordinaten für Hufeisenmagnet
var XW1 = -80;                                             // x-Koordinate für Drähte
var ZW1 = 10, ZW2 = 70;                                    // z-Koordinaten für Stromquelle und Drähte
var YA1 = 80, YA2 = 200;                                   // y-Koordinaten für Leiterschleife
var ZA1 = 8, ZA2 = 30;                                     // z-Koordinaten für Leiterschleife
var XC1 = 6;                                               // x-Koordinate für Kontakte und Kommutator
var YC1 = 6;                                               // y-Koordinate für Kontakte und Kommutator
var ZC1 = 30, ZC2 = 42;                                    // z-Koordinaten für Kontakte
var U0 = 160, V0 = 250;                                    // Bildschirmkoordinaten des Ursprungs
var INSMAX = 15*DEG;                                       // Winkel für Isolator
var THICK = 3;                                             // Liniendicke für dicke Linien

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var bu1, bu2, bu3;                                         // Schaltknöpfe (Reset, Start/Pause/Weiter, Umpolen)
var sl;                                                    // Schieberegler (Drehzahl)
var lb;                                                    // Ausgabefeld für Drehzahl
var cb1, cb2, cb3;                                         // Optionsfelder (Stromrichtung, Magnetfeld, Lorentzkraft)
var on;                                                    // Flag für Bewegung
var t0;                                                    // Anfangszeitpunkt
var omega;                                                 // Kreisfrequenz (1/s)
var direction;                                             // Drehrichtung (1 für Gegenuhrzeigersinn, -1 für Uhrzeigersinn)
var current;                                               // Stromrichtung (0, 1, -1)
var alpha;                                                 // Drehwinkel (Bogenmaß)
var sinAlpha, cosAlpha;                                    // Trigonometrische Werte
var uRot, vRot;                                            // Aktuelle Koordinaten für rotierende Teile

var a1, a2, b1, b2, b3, c1, c2, c3;                        // Koeffizienten für Parallelprojektion

// Die Lage im Raum wird durch ein kartesisches Koordinatensystem (x, y, z) beschrieben.
// (Ursprung im Mittelpunkt des Kommutators, x-y-Ebene waagrecht (Drehachse als y-Achse), z-Achse nach oben)
// Die Berechnung der Bildschirmkoordinaten (u, v) erfolgt durch die Gleichungen
// u = U0 + a1 * x + a2 * y  und  v = V0 + b1 * x + b2 * y + b3 * z.
// Der Vektor (c1, c2, c3) gibt die Richtung zum Betrachter an.

var polygonN, polygonS;                                    // Polygone für Hufeisenmagnet (Nord- bzw. Südpol)
var polygonContact1, polygonContact2;                      // Polygone für Schleifkontakte (oben bzw. unten)
var pointContact1, pointContact2;                          // Innere Punkte des Schleifkontakt-Polygone
var aEllipse, bEllipse;                                    // Große und kleine Halbachse der Kommutator-Ellipsen (Pixel)
var deltaEllipse;                                          // Drehwinkel der Kommutator-Ellipsen (Bogenmaß)
var pgInsulator1, pgInsulator2;                            // Polygone für Isolierschicht des Kommutators 

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
  bu2 = getElement("bu2",text02[1]);                       // Schaltknopf (Start/Pause/Weiter)
  bu2.state = 1;                                           // Anfangszustand (vor Start der Animation)
  bu3 = getElement("bu3",text03);                          // Schaltknopf (Umpolen)
  sl = getElement("sl");                                   // Schieberegler (Drehzahl)
  sl.value = 10;                                           // Anfangszustand (6 U/min; T = 10 s)
  lb = getElement("lb");                                   // Ausgabefeld für Drehzahl
  reactionSlider();                                        // Festlegung von omega, Ausgabe der Drehzahl
  cb1 = getElement("cb1");                                 // Optionsfeld (Stromrichtung)
  getElement("lb1",text04);                                // Erklärender Text (Stromrichtung)
  cb2 = getElement("cb2");                                 // Optionsfeld (Magnetfeld)
  getElement("lb2",text05);                                // Erklärender Text (Magnetfeld)
  cb3 = getElement("cb3");                                 // Optionsfeld (Lorentzkraft)
  getElement("lb3",text06);                                // Erklärender Text (Lorentzkraft)
  cb1.checked = cb2.checked = cb3.checked = true;          // Optionsfelder eingeschaltet
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // Übersetzer
    
  on = true;                                               // Animation angeschaltet
  t0 = new Date();                                         // Anfangszeitpunkt
  setInterval(paint,40);                                   // Timer-Intervall 0,040 s
  
  direction = 1;                                           // Anfangswert für Drehrichtung (Gegenuhrzeigersinn)
  alpha = 0;                                               // Anfangswert für Winkel
  
  calcCoeff();                                             // Koeffizienten für Projektion berechnen
  initPolygons();                                          // Polygone vorbereiten
  calcEllipse();                                           // Berechnungen für Ellipse (Kommutator)
  
  bu1.onclick = reactionReset;                             // Reaktion auf Resetknopf
  bu2.onclick = reactionStart;                             // Reaktion auf Schaltknopf Start/Pause/Weiter
  bu3.onclick = reactionReverse;                           // Reaktion auf Schaltknopf Umpolen
  sl.onchange = reactionSlider;                            // Reaktion auf Schieberegler
  sl.onclick = reactionSlider;                             // Reaktion auf Schieberegler
  
  } // Ende der Methode start
  
// Zustandsfestlegung für Schaltknopf Start/Pause/Weiter:
// st ... Gewünschter Zustand
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
  setButton2State(st);                                     // Neuen Zustand speichern, Text ändern
  }
  
// Reaktion auf Resetknopf:
// Seiteneffekt bu2.state, alpha, on
   
function reactionReset () {
  setButton2State(0);                                      // Zustand des Schaltknopfs Start/Pause/Weiter
  alpha = 0;                                               // Winkel zurücksetzen
  on = false;                                              // Animation abgeschaltet
  }
  
// Reaktion auf den Schaltknopf Start/Pause/Weiter:
// Seiteneffekt t0, bu2.state 

function reactionStart () {
  if (bu2.state != 1) t0 = new Date();                     // Falls Animation angeschaltet, neuer Anfangszeitpunkt
  switchButton2();                                         // Zustand des Schaltknopfs ändern
  on = (bu2.state == 1);                                   // Flag für Animation
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
  var s = (n*0.6).toFixed(1);                              // Zeichenkette für Wert der Drehzahl
  s = s.replace(".",decimalSeparator);                     // Eventuell Punkt durch Komma ersetzen
  if (n == 0) s = "0";                                     // Sonderfall 0 (ohne Nachkommastelle)
  lb.innerHTML = s+" "+rotationsPerMinute;                 // Drehzahl ausgeben (Umdrehungen pro Minute)
  }
  
//-------------------------------------------------------------------------------------------------

// Polygone initialisieren:
// Seiteneffekt polygonS

function initPolygons () {
  polygonS = new Array(8);                                 // Polygon für den Südpol des Hufeisenmagneten
  setPoint(polygonS,0,XM1,YM1,-ZM2);
  setPoint(polygonS,1,XM1,YM3,-ZM2);
  setPoint(polygonS,2,XM1,YM3,0);
  setPoint(polygonS,3,XM1,YM2,0);
  setPoint(polygonS,4,-XM1,YM2,0);
  setPoint(polygonS,5,-XM1,YM2,-ZM1);
  setPoint(polygonS,6,-XM1,YM1,-ZM1);
  setPoint(polygonS,7,-XM1,YM1,-ZM2);
  polygonN = new Array(9);                                 // Polygon für den Nordpol des Hufeisenmagneten
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
  polygonContact1 = new Array(7);                          // Polygon für den oberen Schleifkontakt 
  polygonContact2 = new Array(7);                          // Polygon für den unteren Schleifkontakt
  pointContact1 = initCuboid(polygonContact1,-XC1,XC1,-YC1,YC1,ZC1,ZC2);   // Innerer Punkt (oberer Schleifkontakt)
  pointContact2 = initCuboid(polygonContact2,-XC1,XC1,-YC1,YC1,-ZC2,-ZC1); // Innerer Punkt (unterer Schleifkontakt)
  pgInsulator1 = new Array(20);                            // Polygon für Isolierschicht (Vorderfläche Kommutator)
  pgInsulator2 = new Array(20);                            // Polygon für Isolierschicht (Mantelfläche Kommutator)
  for (i=0; i<20; i++) {                                   // Vorläufige Koordinaten
    pgInsulator1[i] = {u: 0, v: 0};
    pgInsulator2[i] = {u: 0, v: 0};
    }
  }

// Koeffizienten für Projektion berechnen:
// Seiteneffekt a1, a2, b1, b2, b3, c1, c2, c3
  
function calcCoeff () {
  a1 = -Math.sin(PHI); a2 = Math.cos(PHI);                 // Vektor (a1, a2, 0) für waagrechte Bildschirmkoordinate
  b1 = Math.sin(THETA)*a2; b2 = -Math.sin(THETA)*a1;       // Vektor (b1, b2, b3) für senkrechte Bildschirmkoordinate
  b3 = -Math.cos(THETA);
  c1 = a2*b3; c2 = -a1*b3; c3 = a1*b2-a2*b1;               // Vektor (c1, c2, c3) zum Betrachter (Kreuzprodukt)
  }
    
// Waagrechte Bildschirmkoordinate:
// (x,y,z) ... Räumliche Position
  
function screenU (x, y) {
  return U0+a1*x+a2*y;
  }

// Senkrechte Bildschirmkoordinate:
// (x,y,z) ... Räumliche Position
      
function screenV (x, y, z) {
  return V0+b1*x+b2*y+b3*z;
  }
  
// Berechnungen für Kommutator-Ellipsen:
// Seiteneffekt aEllipse, bEllipse, deltaEllipse

function calcEllipse () {
  var r = ZC1;                                             // Radius  
  // Die Hilfsgrößen c, d und m sind durch folgende Bedingungen bestimmt:
  // Ellipse durch (c|mc) mit unendlicher Steigung
  // Ellipse durch Punkt (0|d) mit Steigung m  
  var c = a1*r, d = -b3*r, m = b1/a1;   
  // Koeffizienten der Ellipsengleichung (c11 u^2 + 2 c12 uv + c22 v^2 + c0 = 0)  
  var c11 = c*c*m*m+d*d;                                   // Koeffizient von u^2
  var c12 = -m*c*c;                                        // Koeffizient von uv
  var c22 = c*c;                                           // Koeffizient von v^2
  var c0 = -c*c*d*d;                                       // Konstanter Summand  
  // Koeffizienten der biquadratischen Gleichung (a^4 + bq a^2 + cq = 0) für die große Halbachse a  
  var bq = -c*c*(1+m*m)-d*d;                               // Koeffizient von a^2
  var cq = c*c*d*d;                                        // Konstanter Summand
  var discr = bq*bq-4*cq;                                  // Diskriminante
  aEllipse = Math.sqrt((-bq-Math.sqrt(discr))/2);          // Große Halbachse (Pixel)
  bEllipse = c*d/aEllipse;                                 // Kleine Halbachse (Pixel)  
  deltaEllipse = Math.atan(2*c12/(c22-c11))/2;             // Drehwinkel (Bogenmaß, negativ)
  }
  
// Polygonecke festlegen (Version für nicht bewegte Teile):
// p ......... Array für Bildschirmkoordinaten der Polygonecken
// i ......... Index der Ecke
// (x,y,z) ... Räumliche Position
// Seiteneffekt p[i].u, p[i].v
  
function setPoint (p, i, x, y, z) {
  p[i]= {u: screenU(x,y), v: screenV(x,y,z)};
  }
  
// Polygonecke festlegen (Version für rotierende Teile):
// p ......... Array für Bildschirmkoordinaten der Polygonecken
// i ......... Index der Ecke
// (x,y,z) ... Räumliche Position für alpha = 0
// Seiteneffekt uRot, vRot, p[i].u, p[i].v
  
function setPointRot (p, i, x, y, z) {
  screenCoordsRot(x,y,z);                                  // Bildschirmkoordinaten berechnen
  p[i].u = uRot; p[i].v = vRot;                            // Koordinaten der Polygonecke festlegen
  }
 
// Vorbereitung eines Polygons für ein Quader-Schrägbild:
// p .......... Polygon für Umrandung
// xx1, xx2 ... Unter- und Obergrenze für x-Koordinate
// yy1, yy2 ... Unter- und Obergrenze für y-Koordinate
// zz1, zz2 ... Unter- und Obergrenze für z-Koordinate
// Rückgabewert: Innerer Punkt (Bildschirmkoordinaten u, v)
      
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
  
// Ausgangspunkt festlegen (Version für nicht bewegte Teile):
// (x,y,z) ... Räumliche Position

function moveTo (x, y, z) {
  ctx.moveTo(screenU(x,y),screenV(x,y,z));
  }
  
// Linie zu einem gegebenen Punkt vorbereiten (Version für nicht bewegte Teile):
// (x,y,z) ... Räumliche Position

function lineTo (x, y, z) {
  ctx.lineTo(screenU(x,y),screenV(x,y,z));
  }
  
// Bildschirmkoordinaten für rotierenden Teil:
// Seiteneffekt uRot, vRot

function screenCoordsRot (x, y, z) {
  var xx = x*cosAlpha-z*sinAlpha;                          // x-Koordinate nach Drehung
  var zz = x*sinAlpha+z*cosAlpha;                          // z-Koordinate nach Drehung
  uRot = U0+a1*xx+a2*y;                                    // Waagrechte Bildschirmkoordinate (Pixel)
  vRot = V0+b1*xx+b2*y+b3*zz;                              // Senkrechte Bildschirmkoordinate (Pixel)
  }
  
// Ausgangspunkt festlegen (Version für rotierende Teile):
// (x,y,z) ... Räumliche Position für alpha = 0
// Seiteneffekt uRot, vRot

function moveToRot (x, y, z) {
  screenCoordsRot(x,y,z);                                  // Bildschirmkoordinaten berechnen
  ctx.moveTo(uRot,vRot);                                   // Ausgangsposition festlegen
  }

// Linie zu einem gegebenen Punkt vorbereiten (Version für rotierende Teile):
// (x,y,z) ... räumliche Position für alpha = 0
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
  
// Pfeil auf einer vorhandenen Verbindungslinie (Version für nicht bewegte Teile):
// (x1,y1,z1) ... Räumliche Position des ersten Punkts
// (x2,y2,z2) ... Räumliche Position des zweiten Punkts
// q ............ Bruchteil
// d ............ Flag für Pfeil vom ersten zum zweiten Punkt
  
function arrowLine (x1, y1, z1, x2, y2, z2, q, d) {
  var u1 = screenU(x1,y1), v1 = screenV(x1,y1,z1);         // Bildschirmkoordinaten des ersten Punkts
  var u2 = screenU(x2,y2), v2 = screenV(x2,y2,z2);         // Bildschirmkoordinaten des zweiten Punkts
  var du = u2-u1, dv = v2-v1;                              // Verbindungsvektor
  if (d) arrow(u1,v1,u1+q*du,v1+q*dv,THICK);               // Entweder Pfeil vom ersten Punkt auf den zweiten Punkt zu ...
  else arrow(u2,v2,u2-q*du,v2-q*dv,THICK);                 // ... oder Pfeil vom zweiten Punkt auf den ersten Punkt zu
  }
  
// Pfeil auf einer vorhandenen Verbindungslinie (Version für rotierende Teile):
// (x1,y1,z1) ... Räumliche Position des ersten Punkts
// (x2,y2,z2) ... Räumliche Position des zweiten Punkts
// q ............ Bruchteil
// d ............ Flag für Pfeil vom ersten zum zweiten Punkt
  
function arrowLineRot (x1, y1, z1, x2, y2, z2, q, d) {
  var xx1 = x1*cosAlpha-z1*sinAlpha;                       // x-Koordinate des ersten Punkts nach der Drehung
  var zz1 = x1*sinAlpha+z1*cosAlpha;                       // z-Koordinate des ersten Punkts nach der Drehung
  var xx2 = x2*cosAlpha-z2*sinAlpha;                       // x-Koordinate des zweiten Punkts nach der Drehung
  var zz2 = x2*sinAlpha+z2*cosAlpha;                       // z-Koordinate des zweiten Punkts nach der Drehung
  arrowLine(xx1,y1,zz1,xx2,y2,zz2,q,d);                    // Pfeil zeichnen
  }
  
// Polygon zeichnen:
// p ... Array mit Koordinaten der Ecken
// c ... Füllfarbe

function drawPolygon (p, c) {
  newPath();                                               // Neuer Pfad (Standardwerte)
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.moveTo(p[0].u,p[0].v);                               // Zur ersten Ecke
  for (var i=1; i<p.length; i++)                           // Für alle weiteren Ecken ... 
    ctx.lineTo(p[i].u,p[i].v);                             // Linie zum Pfad hinzufügen
  ctx.closePath();                                         // Zurück zum Ausgangspunkt
  ctx.fill(); ctx.stroke();                                // Polygon ausfüllen und Rand zeichnen   
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
// c ...... Füllfarbe (optional)
// d ...... Drehwinkel (Bogenmaß, Gegenuhrzeigersinn, optional)
  
function ellipse (x, y, a, b, c, d) {
  if (a <= 0 || b <= 0) return;                  // Falls negative Halbachse, abbrechen
  if (c) ctx.fillStyle = c;                      // Füllfarbe ändern, falls definiert
  ctx.strokeStyle = "#000000";                   // Linienfarbe schwarz
  ctx.lineWidth = 1;                             // Liniendicke
  ctx.save();                                    // Grafikkontext speichern
  ctx.beginPath();                               // Neuer Pfad
  ctx.translate(x,y);                            // Ellipsenmittelpunkt als Ursprung des Koordinatensystems 
  if (d) ctx.rotate(-d);                         // Drehung, falls Drehwinkel definiert
  ctx.scale(a,b);                                // Skalierung in x- und y-Richtung
  ctx.arc(0,0,1,0,PI2,false);                    // Einheitskreis (wird durch Skalierung zur Ellipse)
  ctx.restore();                                 // Früheren Grafikkontext wiederherstellen
  if (c) ctx.fill();                             // Ellipse füllen, falls Füllfarbe definiert
  ctx.stroke();                                  // Rand zeichnen
  }
  
// Nordpol des Hufeisenmagneten zeichnen:

function magnetNorth () {
  drawPolygon(polygonN,colorNorth);                        // Polygon für obere Hälfte (Nordpol)
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
  
// Südpol des Hufeisenmagneten zeichnen:

function magnetSouth () {
  drawPolygon(polygonS,colorSouth);                        // Polygon für untere Hälfte (Südpol)
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
// (x,y,z) ... Räumliche Position des Buchsen-Mittelpunkts
// pos ....... Flag für Pluspol

function pole (x, y, z, pos) {
  var u = screenU(x,y), v = screenV(x,y,z);                // Bildschirmkoordinaten berechnen
  ctx.beginPath();                                         // Neuer Pfad
  ctx.arc(u,v,4,0,PI2,false);                              // Kreis vorbereiten 
  ctx.stroke();                                            // Kreis zeichnen
  ctx.fillStyle = (pos ? colorPlus : colorMinus);          // Farbe für Beschriftung
  ctx.fillText(pos ? "+" : "-",u-25,v+7);                  // Beschriftung links (Vorzeichen)
  }
  
// Obere Drähte und Stromquelle zeichnen:

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
  ctx.font = "normal normal bold 24px monospace";          // Zeichensatz für Plus- und Minuszeichen
  var pos = (direction > 0);                               // Flag für Pluspol oben
  pole(XW1,0,ZW1,pos);                                     // Obere Buchse der Stromquelle
  pole(XW1,0,-ZW1,!pos);                                   // Untere Buchse der Stromquelle
  if (!cb1.checked || current == 0) return;                // Falls Optionsfeld nicht aktiviert oder kein Strom, abbrechen
  arrowLine(XW1,0,ZW2,0,0,ZW2,0.65,pos);                   // Pfeil für Stromrichtung
  }
  
// Untere Drähte zeichnen:

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
  var pos = (direction > 0);                               // Flag für Pluspol oben  
  arrowLine(0,0,-ZW2,XW1,0,-ZW2,0.65,pos);                 // Pfeil für Stromrichtung
  }
  
// Kontakt zeichnen:
// pg ... Polygon
// pt ... Innerer Punkt

function contact (pg, pt) {
  var col = (current!=0 ? colorCurrent2 : colorContact);   // Farbe (mit bzw. ohne Strom) 
  drawPolygon(pg,col);                                     // Ausgefülltes Polygon mit Rand
  var u = pt.u, v = pt.v;                                  // Innerer Punkt
  lineP(u,v,pg,2);                                         // Linie vom inneren Punkt nach unten
  lineP(u,v,pg,4);                                         // Linie vom inneren Punkt nach rechts oben
  lineP(u,v,pg,6);                                         // Linie vom inneren Punkt nach links oben
  }
  
// Kommutator zeichnen:
  
function commutator () {
  var color = (current!=0 ? colorCurrent2 : colorContact); // Farbe für Ellipsen
  var u = screenU(0,YC1), v = screenV(0,YC1,0);            // Mittelpunkt der hinteren Ellipse berechnen
  ellipse(u,v,aEllipse,bEllipse,color,deltaEllipse);       // Hintere Ellipse zeichnen
  u = screenU(0,-YC1); v = screenV(0,-YC1,0);              // Mittelpunkt der vorderen Ellipse berechnen
  ellipse(u,v,aEllipse,bEllipse,color,deltaEllipse);       // Vordere Ellipse zeichnen
  // Die Isolierschicht wird näherungsweise durch zwei Polygone dargestellt, eines auf der Vorderfläche (pgInsulator1)
  // und eines auf der Mantelfläche (pgInsulator2).
  var dw = INSMAX/5;                                       // Winkel für Polygonecken (Bogenmaß)
  for (i=0; i<20; i++) {                                   // Für alle Polygonecken (Vorderfläche) ...
    var w = (i<10 ? (i-5)*dw : (i-15)*dw+PI);              // Winkel berechnen
    var xx = ZC1*Math.cos(w);                              // x-Koordinate der Polygonecke berechnen
    var zz = ZC1*Math.sin(w);                              // z-Koordinate der Polygonecke berechnen
    setPointRot(pgInsulator1,i,xx,-YC1,zz);                // Bildschirmkoordinaten der Ecke speichern 
    }
  // Durch die Variable seite wird festgestellt, welche Seite des Kommutators sichtbar ist.
  var seite = c1*cosAlpha+c3*sinAlpha;                     // Skalarprodukt
  for (i=0; i<10; i++) {                                   // Für die ersten 10 Polygonecken (Mantelfläche) ...
    var w = (i-5)*dw;                                      // Winkel berechnen
    if (seite > 0) w += PI;                                // Falls falsche Seite, pi addieren
    var xx = ZC1*Math.cos(w);                              // x-Koordinate der Polygonecke berechnen
    var zz = ZC1*Math.sin(w);                              // z-Koordinate der Polygonecke berechnen
    setPointRot(pgInsulator2,i,xx,-YC1,zz);                // Bildschirmkoordinaten für Ecke auf der Vorderseite speichern
    setPointRot(pgInsulator2,19-i,xx,YC1,zz);              // Bildschirmkoordinaten für Ecke auf der Rückseite speichern
    }
  drawPolygon(pgInsulator1,colorInsulator);                // Polygon auf der Vorderfläche zeichnen
  drawPolygon(pgInsulator2,colorInsulator);                // Polygon auf der Mantelfläche zeichnen
  }
  
// Ankerhälfte zeichnen:
// zPos ... Flag für positive z-Koordinate (in Ausgangsposition)

function armature (zPos) {
  var sign = (zPos ? 1 : -1);                              // Vorzeichen der z-Koordinate (in Ausgangsposition)
  var c = (current!=0 ? colorCurrent1 : "#000000");        // Farbe (mit bzw. ohne Strom)
  ctx.beginPath();                                         // Neuer Pfad  
  ctx.strokeStyle = c;                                     // Linienfarbe
  ctx.lineWidth = THICK;                                   // Liniendicke
  ctx.lineJoin = "round";                                  // Verbindung von Linien (statt Standardwert "miter")
  moveToRot(0,0,sign*ZA1);                                 // Ausgangspunkt (Kommutator) 
  lineToRot(0,YA1,sign*ZA1);                               // Kurzes Drahtstück vom Kommutator weg 
  lineToRot(0,YA1,sign*ZA2);                               // Kurzes Drahtstück von der Drehachse weg 
  lineToRot(0,YA2,sign*ZA2);                               // Längeres Drahtstück parallel zur Drehachse 
  lineToRot(0,YA2,0);                                      // Drahtstück zur Drehachse
  ctx.stroke();                                            // Linien zeichnen
  if (cb1.checked && current != 0) {                       // Falls Optionsfeld aktiviert und Stromfluss ...       
    var d = sign*current*direction;                        // Flag für Pfeilrichtung
    arrowLineRot(0,YA1,sign*ZA2,0,YA2,sign*ZA2,0.7,d<0);   // Pfeil für Stromrichtung
    }
  }
  
// Feldlinien des Magnetfelds zeichnen:
// i1 ... Erster Index
// i2 ... Letzter Index

function fieldLines (i1, i2) {
  if (!cb2.checked) return;                                // Falls Optionsfeld nicht aktiviert, abbrechen
  ctx.beginPath();                                         // Neuer Pfad
  ctx.lineWidth = THICK;                                   // Liniendicke
  ctx.strokeStyle = colorField;                            // Farbe für Magnetfeld
  var y0 = (YA2+YA1)/2;                                    // y-Koordinate für mittlere Feldlinie
  for (i=i1; i<=i2; i++) {                                 // Für alle Linien ...
    var y1 = y0+i*36;                                      // y-Koordinate berechnen
    moveTo(0,y1,-ZM1);                                     // Anfangspunkt berechnen
    lineTo(0,y1,ZM1);                                      // Linie vorbereiten
    }
  ctx.stroke();                                            // Linien zeichnen
  for (i=i1; i<=i2; i++) {                                 // Für alle Linien ...
    var y1 = y0+i*36;                                      // y-Koordinate berechnen
    arrowLine(0,y1,ZM1,0,y1,-ZM1,0.25,true);               // Obere Pfeilspitze zeichnen
    arrowLine(0,y1,ZM1,0,y1,-ZM1,0.85,true);               // Untere Pfeilspitze zeichnen
    }
  }
  
// Pfeil für Lorentzkraft zeichnen:
// zPos ... Flag für positive z-Koordinate (in Ausgangsposition)

function forceArrow (zPos) {
  if (!cb3.checked) return;                                // Falls Optionsfeld nicht aktiviert, abbrechen
  var y = (YA1+YA2)/2;                                     // y-Koordinate des Angriffspunkts
  var z = (zPos ? ZA2 : -ZA2);                             // z-Koordinate für alpha = 0
  var d = current*direction*40;                            // Vorzeichenbehaftete Pfeillänge
  if (!zPos) d = -d;
  ctx.strokeStyle = colorForce;                            // Farbe für Lorentzkraft
  if (current != 0) {                                      // Falls Strom fließt ...
    screenCoordsRot(0,y,z);                                // ... Bildschirmkoordinaten des Angriffspunkts berechnen
    arrow(uRot,vRot,uRot+a1*d,vRot+b1*d,THICK);            // ... Pfeil zeichnen
    }
  }  
  
// Grafikausgabe:
// Seiteneffekt alpha, cosAlpha, sinAlpha, current
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  magnetSouth();                                           // Südpol des Hufeisenmagneten
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // ... Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // ... Länge des Zeitintervalls (s)
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
        forceArrow(true); armature(true);                  // Hinterer Kraftpfeil, hintere Ankerhälfte
        fieldLines(-2,2);                                  // Alle Feldlinien
        armature(false); forceArrow(false);                // Vordere Ankerhälfte, vorderer Kraftpfeil 
        break;
      case 2:                                              // 2. Quadrant 
        armature(true); fieldLines(0,2);                   // Hintere Ankerhälfte, rechte Feldlinien
        forceArrow(true); forceArrow(false);               // Hinterer und vorderer Kraftpfeil
        fieldLines(-2,-1); armature(false);                // Rechte Feldlinien, vordere Ankerhälfte 
        break;
      case 3:                                              // 3. Quadrant
        forceArrow(false); armature(false);                // Hinterer Kraftpfeil, hintere Ankerhälfte
        fieldLines(-2,2);                                  // Alle Feldlinien
        armature(true); forceArrow(true);                  // Vordere Ankerhälfte, vorderer Kraftpfeil 
        break;
      case 4:                                              // 4. Quadrant
        armature(false); fieldLines(0,2);                  // Hintere Ankerhälfte, rechte Feldlinien
        forceArrow(false); forceArrow(true);               // Hinterer und vorderer Kraftpfeil
        fieldLines(-2,-1); armature(true);                 // Linke Feldlinien, vordere Ankerhälfte
        break;
      } // Ende switch
  else {                                                   // Falls Drehung im Uhrzeigersinn ...
    switch (qu) {                                          // Reihenfolge wegen gegenseitiger Verdeckung je nach Quadrant  
      case 4:                                              // 4. Quadrant 
        forceArrow(false); armature(false);                // Hinterer Kraftpfeil, hintere Ankerhälfte
        fieldLines(-2,2);                                  // Alle Feldlinien
        armature(true); forceArrow(true);                  // Vordere Ankerhälfte, vorderer Kraftpfeil
        break;
      case 3:                                              // 3. Quadrant
        armature(false); fieldLines(0,2);                  // Hintere Ankerhälfte, rechte Feldlinien
        forceArrow(false); forceArrow(true);               // Hinterer und vorderer Kraftpfeil
        fieldLines(-2,-1); armature(true);                 // Linke Feldlinien, vordere Ankerhälfte 
        break;
      case 2:                                              // 2. Quadrant
        forceArrow(true); armature(true);                  // Hinterer Kraftpfeil, hintere Ankerhälfte
        fieldLines(-2,2);                                  // Alle Feldlinien
        armature(false); forceArrow(false);                // Vordere Ankerhälfte, vorderer Kraftpfeil
        break;
      case 1:                                              // 1. Quadrant
        armature(true); fieldLines(0,2);                   // Hintere Ankerhälfte, rechte Feldlinien
        forceArrow(true); forceArrow(false);               // Hinterer und vorderer Kraftpfeil
        fieldLines(-2,-1); armature(false);                // Linke Feldlinien, vordere Ankerhälfte
        break;
      } // Ende switch
    } // Ende if - else 
  magnetNorth();                                           // Nordpol des Hufeisenmagneten 
  wires2();                                                // Untere Drähte  
  contact(polygonContact2,pointContact2);                  // Unterer Kontakt
  commutator();                                            // Kommutator
  contact(polygonContact1,pointContact1);                  // Oberer Kontakt
  wires1();                                                // Obere Drähte und Stromquelle
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen


