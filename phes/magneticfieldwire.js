// Magnetfeld eines geraden stromdurchflossenen Leiters
// Java-Applet (18.09.2000) umgewandelt
// 06.11.2014 - 18.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// ****************************************************************************

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel magneticfieldwire_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorBase = "#ffc800";                                 // Farbe für Unterlage
var colorPlus = "#ff0000";                                 // Farbe für Pluspol
var colorMinus = "#0000ff";                                // Farbe für Minuspol
var colorWire = "#00ffff";                                 // Farbe für Draht
var colorElectron = "#008020";                             // Farbe für Elektronen
var	colorCurrent = "#ff0000";                              // Farbe für Strom
var colorNeedle = "#ff00ff";                               // Farbe für Fuß der Magnetnadel
var	colorNorth = "#ff0000";                                // Farbe für Nordpol
var colorSouth = "#00ff00";                                // Farbe für Südpol
var colorField = "#0000ff";                                // Farbe für Magnetfeld

// Konstanten:

var DEG = Math.PI/180;                                     // 1 Grad (Bogenmaß)
var theta = 20*DEG;                                        // Höhenwinkel (Blickrichtung) 
var phi = 160*DEG;                                         // Azimutwinkel (Blickrichtung)

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var bu;                                                    // Schaltknopf (Umpolen)
var t0;                                                    // Anfangszeitpunkt
var t;                                                     // Zeitvariable (s)    
var uU, vU;                                                // Koordinaten des Ursprungs (Pixel)
var a1, a2;                                                // Koeffizienten für Projektion (nach rechts)
var b1, b2, b3;                                            // Koeffizienten für Projektion (nach oben)
var c1, c2, c3;                                            // Koeffizienten für Projektion (zum Betrachter)
var dir;                                                   // Stromrichtung (1 nach oben, -1 nach unten)
var needleN, needleS;                                      // Polygone für Magnetnadel
var xMN, yMN;                                              // Position der Magnetnadel (Mittelpunkt)
var uMN, vMN;                                              // Zugehörige Bildschirmkoordinaten  
var dxA, dyA;                                              // Hilfsgrößen für Pfeilspitzen         
var drag;                                                  // Flag für Zugmodus
var dvMouse;                                               // Hilfsgröße für Bewegung der Magnetnadel (Pixel)                                    
var posEl;                                                 // Array für Elektronenpositionen

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
  bu = getElement("bu",text01);                            // Schaltknopf (Umpolen)
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // Übersetzer
  
  uU = width/2; vU = height/2;                             // Ursprung des Koordinatensystems
  dir = 1;                                                 // Stromrichtung zunächst nach oben
  dxA = 3; dyA = 2;                                        // Hilfsgrößen für Pfeilspitzen  
  drag = false;                                            // Zugmodus zunächst deaktiviert
  calcCoeff();                                             // Koeffizienten für Parallelprojektion
  xMN = 0; yMN = 100;                                      // Anfangsposition der Magnetnadel
  uMN = coordsU(xMN,yMN); vMN = coordsV(xMN,yMN,0);        // Zugehörige Bildschirmkoordinaten
  needleN = new Array(3); needleS = new Array(3);          // Polygone für Magnetnadel
  t0 = new Date();                                         // Anfangszeitpunkt
  t = 0;                                                   // Startwert für Zeitvariable
  initElectrons();                                         // Array für Elektronenpositionen initialisieren
  setInterval(paint,40);                                   // Timer für Animation aktivieren  
  bu.onclick = reactionButton;                             // Reaktion auf Schaltknopf (Umpolen)
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Drücken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Berührung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Berührung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers            
  }

// Reaktion auf Drücken der Maustaste:
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen (Auswahl)                    
  }
  
// Reaktion auf Berührung:
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Berührpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen (Auswahl)
  if (drag) e.preventDefault();                            // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Loslassen der Maustaste:
// Seiteneffekt drag
  
function reactionMouseUp (e) {   
  drag = false;                                            // Zugmodus deaktivieren                             
  }
  
// Reaktion auf Ende der Berührung:
// Seiteneffekt drag
  
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
  
// Hilfsroutine: Reaktion auf Mausklick oder Berühren mit dem Finger (Auswahl):
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt drag, dvMouse 

function reactionDown (u, v) {
  drag = false;                                            // Zugmodus deaktivieren
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel) 
  if (Math.abs(u-uMN) <= 10 && v >= vMN+5 && v <= vMN+35) {// Falls Position in der Nähe der Magnetnadel ... 
    drag = true;                                           // ... Zugmodus aktivieren
    dvMouse = v-vMN;                                       // ... Hilfsgröße für Bewegung der Magnetnadel ermitteln
    }
  }
  
// Reaktion auf Bewegung von Maus oder Finger (Änderung):
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt uMN, vMN, xMNm yMN 

function reactionMove (u, v) {
  if (!drag) return;                                       // Falls Zugmodus nicht aktiviert, abbrechen
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel)
  uMN = u; vMN = v-dvMouse;                                // Bildschirmkoordinaten für Magnetnadel
  // Lineares Gleichungssystem zur Berechnung von xMN und yMN:
  // a1 * xMN + a2 * yMN = uMN - uU
  // b1 * xMN + b2 * yMN = vMN - vU 
  var det = a1*b2-b1*a2;                                   // Determinante
  var r1 = uMN-uU, r2 = vMN-vU;                            // Inhomogener Teil des Gleichungssystems
  xMN = (r1*b2-r2*a2)/det;                                 // x-Koordinate der Magnetnadel
  yMN = (a1*r2-b1*r1)/det;                                 // y-Koordinate der Magnetnadel
  var rad = Math.sqrt(xMN*xMN+yMN*yMN);                    // Entfernung von der Mittellinie des Drahts
  var f = 1;                                               // Faktor zur Korrektur der Position
  if (rad == 0) xMN = rad = 30;                            // Vermeidung einer Division durch 0
  if (rad < 30) f = 30/rad;                                // Faktor für innerste Position (Berührung des Drahts)
  if (rad > 130) f = 130/rad;                              // Faktor für äußerste Position (Berührung des Tischrands)
  if (rad < 30 || rad > 130) {                             // Falls Position zu weit innen oder außen, ...
    xMN *= f; yMN *= f;                                    // ... Korrektur der räumlichen Koordinaten
    uMN = coordsU(xMN,yMN);                                // ... Korrektur der waagrechten Bildschirmkoordinate
    vMN = coordsV(xMN,yMN,0);                              // ... Korrektur der senkrechten Bildschirmkoordinate
    } 
  }
  
// Reaktion auf den Schaltknopf (Umpolen):
// Seiteneffekt dir, dxA, dyA

function reactionButton () {
  dir = -dir;                                              // Stromrichtung umkehren
  dxA = 3*dir; dyA = 2*dir;                                // Hilfsgrößen für Pfeilspitzen
  }
    
//-------------------------------------------------------------------------------------------------

// Koeffizienten für Parallelprojektion:
// Seiteneffekt a1, a2, b1, b2, b3, c1, c2, c3

function calcCoeff () {
  var sin = Math.sin(theta), cos = Math.cos(theta);        // Trigonometrische Werte
  a1 = Math.sin(phi); a2 = -Math.cos(phi);                 // Koeffizienten für Richtung nach rechts 
  b1 = -sin*a2; b2 = sin*a1; b3 = cos;                     // Koeffizienten für Richtung nach oben           
  c1 = -cos*a2; c2 = cos*a1; c3 = -sin;                    // Koeffizienten für Projektionsrichtung
  }
  
// Waagrechte Bildschirmkoordinate:
// x, y ... Räumliche Koordinaten (z irrelevant)

function coordsU (x, y) {
  return uU+a1*x+a2*y;
  }

// Senkrechte Bildschirmkoordinate:
// x, y, z ... Räumliche Koordinaten
// Wichtig: Die z-Achse zeigt nach unten.
  
function coordsV (x, y, z) {
  return vU+b1*x+b2*y+b3*z;
  }
  
// Array für Elektronenpositionen initialisieren:
// Seiteneffekt posEl

function initElectrons () {
  var l = Math.floor(coordsV(0,0,150)-coordsV(0,0,-150));  // Drahtlänge (Pixel)
  var nEl = l+4;                                           // Zahl der Elektronen
  posEl = new Array(nEl);                                  // Neues Array
  for (var i=0; i<nEl; i++) {                              // Für alle Elektronen ...
    var rn1 = 3*Math.random()-1.5;                         // Zufallsabweichung waagrecht (-1.5 bis +1.5)
    var rn2 = 2*Math.random()-1;                           // Zufallsabweichung senkrecht (-1 bis +1)
    posEl[i] = {u: uU-6+4*(i%4)+rn1, v: i+rn2};            // Neues Objekt mit Attributen u, v
    }
  }
  
// Polygonecke setzen:
// p ...... Array der Ecken
// i ...... Index
// x, y ... Räumliche Koordinaten (z = 0 vorausgesetzt)

function setPoint (p, i, x, y) {
  p[i] = {u: coordsU(x,y), v: coordsV(x,y,0)};             // Neues Objekt mit Attributen u, v
  }

// Polygone für Magnetnadel aktualisieren:
// Seiteneffekt needleN, needleS

function updatePolygons () {
  var alpha = Math.atan2(yMN,xMN);                         // Winkel für Position der Magnetnadel (Bogenmaß)
  var sin = Math.sin(alpha), cos = Math.cos(alpha);        // Trigonometrische Werte
  var dx1 = dir*50*sin, dy1 = -dir*50*cos;                 // Abweichung in Längsrichtung
  var dx2 = dir*8*cos, dy2 = dir*8*sin;                    // Abweichung in Querrichtung
  setPoint(needleN,0,xMN+dx1,yMN+dy1);                     // Spitze Nordpol
  setPoint(needleN,1,xMN+dx2,yMN+dy2);                     // Ecke in der Nähe der Drehachse
  setPoint(needleN,2,xMN-dx2,yMN-dy2);                     // Andere Ecke in der Nähe der Drehachse
  setPoint(needleS,0,xMN-dx1,yMN-dy1);                     // Spitze Südpol
  setPoint(needleS,1,xMN-dx2,yMN-dy2);                     // Andere Ecke in der Nähe der Drehachse
  setPoint(needleS,2,xMN+dx2,yMN+dy2);                     // Andere Ecke in der Nähe der Drehachse
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
  
// Rechteck (ohne Rand):
// (x,y) ... Koordinaten der Ecke links oben (Pixel)
// w ....... Breite (Pixel)
// h ....... Höhe (Pixel)
// c ....... Füllfarbe

function rectangle (x, y, w, h, c) {
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausfüllen
  }
  
// Polygon mit schwarzem Rand zeichnen:
// p ... Array mit Koordinaten der Ecken
// c ... Füllfarbe

function polygon (p, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.moveTo(p[0].u,p[0].v);                               // Zur ersten Ecke
  for (var i=1; i<p.length; i++)                           // Für alle weiteren Ecken ... 
    ctx.lineTo(p[i].u,p[i].v);                             // Linie zum Grafikpfad hinzufügen
  ctx.closePath();                                         // Zurück zum Ausgangspunkt
  ctx.fill(); ctx.stroke();                                // Polygon ausfüllen und Rand zeichnen   
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
  
// Halbe Ellipse (Bogen, zugehöriger Sektor optional)
// (x,y) ... Mittelpunkt (Pixel)
// a, b .... Halbachsen (Pixel)
// n ....... Nummer (0 für untere Hälfte, 1 für obere Hälfte)
// arc ..... Randfarbe (optional) 
// fill .... Füllfarbe (optional)

function halfEllipse (x, y, a, b, n, arc, fill) {
  ctx.save();                                              // Grafikkontext speichern
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.translate(x,y);                                      // Ursprung verschieben
  ctx.scale(a,b);                                          // Skalieren
  ctx.arc(0,0,1,n*Math.PI,(n+1)*Math.PI,false);            // Halbkreis (wird durch Skalierung zur Halbellipse)
  ctx.restore();                                           // Grafikkontext wiederherstellen
  if (arc) {ctx.strokeStyle = arc; ctx.stroke();}          // Bogen zeichnen, falls gewünscht
  if (fill) {ctx.fillStyle = fill; ctx.fill();}            // Sektor ausfüllen, falls gewünscht
  }
  
// Ausgefüllte Ellipse, eventuell ganz oder halb berandet
// (x,y) ... Mittelpunkt (Pixel)
// a, b .... Halbachsen waagrecht/senkrecht (Pixel)
// c ....... Füllfarbe
// low ..... Flag für unteren Rand
// high .... Flag für oberen Rand
  
function ellipse (x, y, a, b, c, low, high) {
  a = Math.abs(a); b = Math.abs(b);                        // Halbachsen dürfen nicht negativ sein
  var col1 = (low ? "#000000" : undefined);                // Farbe für unteren Rand
  var col2 = (high ? "#000000" : undefined);               // Farbe für oberen Rand
  halfEllipse(x,y,a,b,0,col1,c);                           // Untere Halbellipse (eventuell mit Bogen)
  halfEllipse(x,y,a,b,1,col2,c);                           // Obere Halbellipse (eventuell mit Bogen)
  }
  
// Schrägbild eines Zylinders:
// x,y,z ... Mittelpunkt der Grundfläche (räumliche Koordinaten)
// r ....... Radius
// h ....... Höhe
// c ....... Farbe

function cylinder (x, y, z, r, h, c) {
  var  a = r, b = r*Math.abs(c3);                          // Halbachsen (Pixel)
  var u = coordsU(x,y);                                    // Waagrechte Bildschirmkoordinate der Mittelpunkte
  var vLow = coordsV(x,y,z);                               // Senkrechte Bildschirmkoordinate des unteren Mittelpunkts
  var vHigh = coordsV(x,y,z-h);                            // Senkrechte Bildschirmkoordinate des oberen Mittelpunkts
  var uL = u-a, uR = u+a;                                  // Waagrechte Bildschirmkoordinaten links/rechts 
  rectangle(uL,vHigh,2*a,vLow-vHigh,c);                    // Rechteck
  ellipse(u,vLow,a,b,c,true,false);                        // Untere Ellipse (untere Hälfte mit Rand)
  ellipse(u,vHigh,a,b,c,true,true);                        // Obere Ellipse (mit komplettem Rand)
  line(uL,vLow,uL,vHigh);                                  // Linke Begrenzung
  line(uR,vLow,uR,vHigh);                                  // Rechte Begrenzung
  }
  
// Draht, unterer Teil (zwischen z = 40 und z = 150):

function wire1 () {
  cylinder(0,0,150,10,110,colorWire);                      // Drahtstück
  var vLow = coordsV(0,0,150);                             // Unteres Ende 
  electrons(true);                                         // Bewegte Elektronen
  var c = (dir>0 ? colorPlus : colorMinus);                // Farbe für Vorzeichen 
  rectangle(uU+20,vLow-21,11,3,c);                         // Waagrechter Balken (+/-)
  if (dir > 0) rectangle(uU+24,vLow-25,3,11,c);            // Senkrechter Balken (+)
  }

// Draht, oberer Teil (zwischen z = -150 und z = 30):

function wire2 () {
  cylinder(0,0,30,10,180,colorWire);                       // Drahtstück
  var vHigh = coordsV(0,0,-150);                           // Oberes Ende
  electrons(false);                                        // Bewegte Elektronen
  var c = (dir>0 ? colorMinus : colorPlus);                // Farbe für Vorzeichen
  rectangle(uU+20,vHigh+19,11,3,c);                        // Waagrechter Balken (+/-)
  if (dir < 0) rectangle(uU+24,vHigh+15,3,11,c);           // Senkrechter Balken (+)
  ctx.strokeStyle = colorCurrent;                          // Farbe für Stromrichtung
  arrow(uU,vU-50+dir*10,uU,vU-50-dir*10,3);                // Pfeil für Stromrichtung
  }
  
// Elektronen im oberen oder unteren Drahtstück zeichnen:
// low ... Flag für unteres Drahtstück
    
function electrons (low) {
  var v0 = coordsV(0,0,-150);                              // v-Koordinate für das obere Ende des gesamten Drahts
  var vHigh = coordsV(0,0,low?40:-150);                    // v-Koordinate für das obere Ende des Drahtstücks
  var vLow = coordsV(0,0,low?150:30);                      // v-Koordinate für das untere Ende des Drahtstücks
  var l = posEl.length-4;                                  // Gesamtlänge des Drahts (Pixel)
  var dv = l*t/10;                                         // Verschiebung gegenüber der Anfangsposition
  if (dir < 0) dv = l-dv;                                  // Falls Bewegung nach oben, Verschiebung korrigieren
  ctx.fillStyle = colorElectron;                           // Farbe für Elektronen
  for (var i=0; i<posEl.length; i++) {                     // Für alle Elektronen ...
    var pos = posEl[i];                                    // Anfangsposition des Elektrons
    var v = v0+(pos.v+dv)%l;                               // Senkrechte Bildschirmkoordinate
    var outside = (low ? v<vHigh : v>vLow);                // Elektron außerhalb des Drahtstücks? 
    if (outside) continue;                                 // In diesem Fall weiter zum nächsten Elektron                     
    circle(pos.u,v,0.5);                                   // Elektron zeichnen
    }
  }
      
// Magnetnadel zeichnen:

function magneticNeedle () {
  cylinder(xMN,yMN,30,20,5,colorNeedle);                       // Grundplatte
  cylinder(xMN,yMN,25,2,16,colorNeedle);                       // Fortsetzung nach oben
  var v0 = coordsV(xMN,yMN,10);                                // Senkrechte Bildschirmkoordinate
  line(uMN,vMN,uMN,v0);                                        // Weitere Fortsetzung nach oben (ganz dünn)
  updatePolygons();                                            // Polygone vorbereiten
  polygon(needleN,colorNorth);                                 // Dreieck für Nordpol
  polygon(needleS,colorSouth);                                 // Dreieck für Südpol
  circle(uMN,vMN,2,"#000000");                                 // Drehachse
  }
  
// Feldlinien (vorderer oder hinterer Teil):
// z ...... z-Koordinate
// r ...... Radius
// near ... Flag für vorne/hinten

function mfLine (z, r, near) {
  var vM = coordsV(0,0,z);                                 // Senkrechte Bildschirmkoordinate
  var aE = Math.abs(r), bE = Math.abs(r*c3);                         // Halbachsen
  var n = (near ? 0 : 1);                                  // Nummer für untere oder obere Halbellipse
  ctx.lineWidth = 2;                                       // Liniendicke
  halfEllipse(uU,vM,aE,bE,n,colorField);                   // Halbellipse zeichnen
  var w = 30*DEG;                                          // Winkel für Pfeilspitzen (Bogenmaß)
  var u0 = uU-aE*Math.cos(w);                              // Waagrechte Bildschirmkoordinate für Pfeilspitze links vorne
  var v0 = vM+bE*Math.sin(w);                              // Senkrechte Bildschirmkoordinate für Pfeilspitze links vorne
  if (near)                                                // Falls vordere Position ...
    arrow(u0-dxA,v0-dyA,u0+dxA,v0+dyA,2);                  // ... Pfeilspitze links vorne
  else {                                                   // Falls hintere Position ...
    u0 = 2*uU-u0; v0 = 2*vM-v0;                            // ... Punktspiegelung durchführen
    arrow(u0+dxA,v0+dyA,u0-dxA,v0-dyA,2);                  // ... Pfeilspitze rechts hinten
    }
  ctx.lineWidth = 1;                                       // Liniendicke zurücksetzen
  }

// Feldlinien (Hälfte):
// near ... Flag für vorne/hinten

function mfLines (near) {
  mfLine(-60,30,near);                                     // Innere Feldlinie oben
  mfLine(-60,60,near);                                     // Mittlere Feldlinie oben
  mfLine(-60,120,near);                                    // Äußere Feldlinie oben
  mfLine(0,Math.sqrt(xMN*xMN+yMN*yMN),near);               // Feldlinie zur Magnetnadel
  }
  
// Zeichenfläche aktualisieren:

function paint () {
  var t1 = new Date();                                     // Neuer Zeitpunkt
  var dt = (t1-t0)/1000;                                   // Länge des Zeitintervalls (s)
  t += dt; if (t > 10) t -= 10;                            // Zeitvariable aktualisieren (nach 10 s zurücksetzen)
  t0 = t1;                                                 // Anfangszeitpunkt aktualisieren
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen 
  wire1();                                                 // Unteres Drahtstück
  cylinder(0,0,40,150,10,colorBase);                       // Unterlage
  mfLines(false);                                          // Feldlinien hinten
  if (c1*xMN+c2*yMN >= 0) {                                // Falls Magnetnadel auf der Vorderseite ...
    wire2(); mfLines(true);                                // Zuerst oberes Drahtstück und Feldlinien vorne
    magneticNeedle();                                      // Anschließend Magnetnadel
    }
  else {                                                   // Falls Magnetnadel auf der Rückseite ... 
    magneticNeedle();                                      // Zuerst Magnetnadel
    wire2(); mfLines(true);                                // Anschließend oberes Drahtstück und Feldlinien vorne
    }  
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen



