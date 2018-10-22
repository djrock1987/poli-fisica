// Leiterschaukel-Versuch zur Lorentzkraft
// Java-Applet (30.05.1998) umgewandelt
// 07.04.2014 - 17.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel lorentzforce_de.js) abgespeichert.

// Konstanten:

var colorBackground = "#ffff00";                 // Hintergrundfarbe
var colorNorth = "#ff8040";                      // Farbe für Nordpol
var colorSouth = "#00ff00";                      // Farbe für Südpol
var colorCurrent = "#ff0000";                    // Farbe für Strom
var colorPlus = "#ff0000";                       // Farbe für Pluspol
var colorMinus = "#0000ff";                      // Farbe für Minuspol
var colorField = "#0000ff";                      // Farbe für Magnetfeld
var colorForce = "#000000";                      // Farbe für Lorentzkraft

var mx = 40;                                     // Abmessungen des Magneten
var my1 = 160, my2 = 200;
var mz1 = 56, mz2 = 80;
var lx = 64, ly = 64, lz = 128;                  // Abmessungen des Leiters
var u0 = 360, v0 = 250;                          // Ursprung (Bildschirmkoordinaten)
var theta = 15*Math.PI/180;                      // Winkel gegenüber der x-y-Ebene
var phi = 30*Math.PI/180;                        // Winkel gegenüber der x-Achse

var a1, a2, b1, b2, b3;                          // Koeffizienten für Projektion
var p1, p2;                                      // Polygone für Hufeisenmagnet
var pM1, pM2, pM3, pM4;                          // Punkte im Inneren der Magnet-Polygone
var pL1, pL2, pL3, pL4, pL5, pL6, pL7, pL8,      // Punkte auf dem Leiter 
  pL9, pL10, pL11, pL12, pL13, pL14;
var pA1, pA2;                                    // Punkte der Aufhängung

var canvas, ctx;                                 // Zeichenfläche, Grafikkontext
var bu1, bu2, bu3;                               // Schaltknöpfe
var cb1, cb2, cb3;                               // Optionsfelder
var dirM;                                        // Richtung des Magnetfelds (+1 oder -1)
var dirC;                                        // Stromrichtung (+1 oder -1)
var on;                                          // Flag für eingeschalteten Strom
var alpha;                                       // Auslenkung (Bogenmaß)

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
  canvas = getElement("cv");                     // Zeichenfläche
  bu1 = getElement("bu1",text01);                // Schaltknopf (Ein/Aus)
  bu2 = getElement("bu2",text02);                // Schaltknopf (Umpolen)
  bu3 = getElement("bu3",text03);                // Schaltknopf (Magnet umdrehen)
  cb1 = getElement("cb1");                       // Optionsfeld (Stromrichtung)
  getElement("lb1",text04);                      // Erklärender Text (Stromrichtung)
  cb2 = getElement("cb2");                       // Optionsfeld (Magnetfeld)
  getElement("lb2",text05);                      // Erklärender Text (Magnetfeld)
  cb3 = getElement("cb3");                       // Optionsfeld (Lorentzkraft)
  getElement("lb3",text06);                      // Erklärender Text (Lorentzkraft)
  cb1.checked = true;                            // Stromrichtung sichtbar
  cb2.checked = true;                            // Magnetfeld sichtbar
  cb3.checked = true;                            // Lorentzkraft sichtbar  
  getElement("author",author);                   // Autor
  getElement("translator",translator);           // Übersetzer
  
  a1 = Math.sin(phi); a2 = -Math.cos(phi);       // Koeffizienten für Parallelprojektion
  b1 = -Math.sin(theta)*Math.cos(phi);
  b2 = -Math.sin(theta)*Math.sin(phi);
  b3 = -Math.cos(theta);
  dirM = dirC = 1;                               // Richtung von Magnetfeld und Strom
  on = false;                                    // Strom nicht eingeschaltet
  initPolygons();                                // Polygone und Punkte für Hufeisenmagnet festlegen
  initPoints();                                  // Punkte für Stromkreis festlegen
  ctx = canvas.getContext("2d");                 // Grafikkontext
  paint();                                       // Zeichnen
  
  bu1.onclick = function (e) {                   // Reaktion auf Schaltknopf "Ein/Aus"
    on = !on; paint();
    }
           
  bu2.onclick = function (e) {                   // Reaktion auf Schaltknopf "Umpolen"
    dirC = -dirC; paint();
    }
    
  bu3.onclick = function (e) {                   // Reaktion auf Schaltknopf "Magnet umdrehen"
    dirM = -dirM; paint();
    }
    
  cb1.onchange = function (e) {paint();}         // Reaktion auf Optionsfeld "Stromrichtung"
  
  cb2.onchange = function (e) {paint();}         // Reaktion auf Optionsfeld "Magnetfeld"
  
  cb3.onchange = function (e) {paint();}         // Reaktion auf Optionsfeld "Lorentzkraft"
  
  } // Ende der Methode start
  
// Bildschirmkoordinaten (orthogonale Parallelprojektion):
// x, y, z ... Räumliche Koordinaten des Punktes

function screenU (x, y) {return u0+a1*x+a2*y;}

function screenV (x, y, z) {return v0+b1*x+b2*y+b3*z;}

function screenCoords (x, y, z) {
  return {u: screenU(x,y), v: screenV(x,y,z)};
  }
  
// Festlegung einer Polygonecke:
// p ......... Array der Polygonecken
// i ......... Index
// x, y, z ... Räumliche Koordinaten
  
function setPoint (p, i, x, y, z) {
  p[i] = {u: screenU(x,y), v: screenV(x,y,z)};
  }
  
// Initialisierung der Polygone und Punkte (Hufeisenmagnet):
  
function initPolygons () {
  p1 = new Array(9);                             // Polygon für untere Hälfte
  setPoint(p1,0,-mx,my2,0);
  setPoint(p1,1,-mx,my2,-mz2);
  setPoint(p1,2,-mx,0,-mz2);
  setPoint(p1,3,mx,0,-mz2);
  setPoint(p1,4,mx,0,-mz1);
  setPoint(p1,5,mx,my1,-mz1);
  setPoint(p1,6,mx,my1,0);
  setPoint(p1,7,-mx,my1,0);
  setPoint(p1,8,-mx,my2,0);
  pM1 = screenCoords(-mx,my1,-mz1);              // Punkte im Inneren des Polygons
  pM2 = screenCoords(-mx,0,-mz1);
  p2 = new Array(10);                            // Polygon für obere Hälfte
  setPoint(p2,0,-mx,my2,0);
  setPoint(p2,1,-mx,my2,mz2);
  setPoint(p2,2,mx,my2,mz2);
  setPoint(p2,3,mx,0,mz2);
  setPoint(p2,4,mx,0,mz1); 
  setPoint(p2,5,-mx,0,mz1);
  var lambda = (pM2.u-p1[5].u)/(pM2.u-pM1.u);
  setPoint(p2,6,-mx,lambda*my1,mz1);
  setPoint(p2,7,mx,my1,0); 
  setPoint(p2,8,-mx,my1,0);
  setPoint(p2,9,-mx,my2,0);
  pM3 = screenCoords(-mx,my1,mz1);               // Punkte im Inneren des Polygons
  pM4 = screenCoords(-mx,0,mz2);
  }
  
 // Initialisierung der Punkte im Stromkreis:
  
function initPoints () {
  pL1 = screenCoords(-lx,ly,lz);
  pL4 = screenCoords(lx,ly,lz);
  pL5 = screenCoords(-lx,ly,lz+20);
  var dl = 240; 
  pL6 = screenCoords(-lx,ly+dl,lz+20);
  pL7 = screenCoords(-lx,ly+dl,-mz2+80);
  pL8 = screenCoords(-lx,ly+dl,-mz2+40); 
  pL9 = screenCoords(-lx,ly+dl,-mz2);
  pL10 = screenCoords(-30,ly+dl,-mz2); 
  pL11 = screenCoords(30,ly+dl,-mz2); 
  pL12 = screenCoords(lx,ly+dl,-mz2); 
  pL13 = screenCoords(lx,ly+dl,lz+20);
  pL14 = screenCoords(lx,ly,lz+20);
  pA1 = screenCoords(-lx-30,ly,lz); 
  pA2 = screenCoords(lx+30,ly,lz);
  }
  
// Neuer Pfad:
// w ... Liniendicke
// c ... Linienfarbe (optional)

function newPath (w, c) {
  if (!c) c = "#000000";
  ctx.beginPath();
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  }
  
// Anfangspunkt eines Pfades:

function moveTo (p) {ctx.moveTo(p.u,p.v);}
  
// Fortsetzung eines Pfades:

function lineTo (p) {ctx.lineTo(p.u,p.v);}
  
// Ausgefülltes Polygon mit schwarzem Rand:
// p ... Array der Ecken
     
function polygon (p) {
  newPath(1);                                    // Neuer Pfad (Liniendicke 1, Linienfarbe schwarz) 
  moveTo(p[0]);                                  // Anfangspunkt
  for (var i=1; i<p.length; i++) lineTo(p[i]);   // Verbindungslinien
  ctx.closePath();                               // Zurück zum Anfangspunkt
  ctx.fill(); ctx.stroke();                      // Ausfüllen, schwarzer Rand
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
  
// Dicken Pfeil zeichnen:
// p1 ....... Anfangspunkt
// p2 ....... Zielpunkt
// lambda ... Bruchteil (legt den Endpunkt fest)
      
function thickArrow (p1, p2, lambda) {
  var u = p1.u+lambda*(p2.u-p1.u);               // Waagrechte Koordinate des Endpunkts
  var v = p1.v+lambda*(p2.v-p1.v);               // Senkrechte Koordinate des Endpunkts
  arrow(p1.u,p1.v,u,v,3);                        // Pfeil zeichnen
  }
    
// Hufeisenmagnet (unterer Teil):

function magnetLow () {
  ctx.fillStyle = (dirM==1 ? colorSouth : colorNorth); // Füllfarbe
  polygon(p1);                                   // Ausgefülltes Polygon (Außenrand)
  newPath(1);                                    // Neuer Pfad für innere Linien
  moveTo(p1[7]);
  lineTo(pM1);
  lineTo(p1[5]);
  lineTo(pM1);
  lineTo(pM2);
  lineTo(p1[2]);
  lineTo(pM2);
  lineTo(p1[4]);
  ctx.stroke();                                  // Innere Linien zeichnen  
  }
      
// Hufeisenmagnet (oberer Teil):
      
function magnetHigh () {
  ctx.fillStyle = (dirM==1 ? colorNorth : colorSouth); // Füllfarbe
  polygon(p2);                                   // Ausgefülltes Polygon (Außenrand) 
  newPath(1);                                    // Neuer Pfad für innere Linien
  moveTo(p2[8]);
  lineTo(pM3);
  lineTo(p2[5]);
  moveTo(p2[1]);
  lineTo(pM4);
  moveTo(p2[5]);
  lineTo(pM4);
  lineTo(p2[3]);  
  ctx.stroke();                                  // Innere Linien zeichnen
  }

// Kleiner Kreis für Stromquelle und Schalter:
// m ... Mittelpunkt (Bildschirmkoordinaten)

function thickCircle (m) {
  var c = (on ? colorCurrent : "#000000");       // Farbe
  ctx.beginPath();                               // Neuer Pfad für äußeren Kreis
  ctx.fillStyle = c;                             // Füllfarbe
  ctx.arc(m.u,m.v,4,0,2*Math.PI,true);           // Äußeren Kreis vorbereiten
  ctx.fill();                                    // Äußeren Kreis ausfüllen
  ctx.beginPath();                               // Neuer Pfad für inneren Kreis
  ctx.fillStyle = colorBackground;               // Hintergrundfarbe als Füllfarbe
  ctx.arc(m.u,m.v,2.5,0,2*Math.PI,true);         // Inneren Kreis vorbereiten
  ctx.fill();                                    // Inneren Kreis ausfüllen
  }
  
// Anschlussdrähte, Stromquelle, Schalter, Aufhängung:
  
function wires () {
  newPath(3,on?colorCurrent:"#000000");
  moveTo(pL1);
  lineTo(pL5);
  lineTo(pL6);
  lineTo(pL7);
  moveTo(pL8);
  lineTo(pL9);
  lineTo(pL10);
  moveTo(pL11);
  lineTo(pL12);
  lineTo(pL13);
  lineTo(pL14);
  lineTo(pL4);
  moveTo(pL8);                                   // Schalter
  if (on) ctx.lineTo(pL7.u-5,pL7.v-10);
  else ctx.lineTo(pL7.u-20,pL7.v-6);
  ctx.stroke();
  thickCircle(pL7); thickCircle(pL8);
  thickCircle(pL10); thickCircle(pL11);          // Stromquelle
  var x = (dirC>0 ? pL11.u : pL10.u);            // Position Vorzeichen
  var y = (dirC>0 ? pL11.v : pL10.v);
  ctx.fillStyle = colorPlus;                     // Pluszeichen
  ctx.fillRect(x-5,y+14,11,3);
  ctx.fillRect(x-1,y+10,3,11);
  ctx.fillStyle = colorMinus;                    // Minuszeichen
  x = (dirC>0 ? pL10.u : pL11.u);
  y = (dirC>0 ? pL10.v : pL11.v);
  ctx.fillRect(x-5,y+14,11,3);
  newPath(3);                                    // Aufhängung
  moveTo(pA1); lineTo(pA2);
  ctx.stroke();  
  ctx.strokeStyle = (on ? colorCurrent : "#000000");
  if (!on || !cb1.checked) return;               // Abbruch, falls keine Strompfeile zu zeichnen
  if (dirC > 0) {                                // Pfeile für eine Stromrichtung
    thickArrow(pL5,pL6,0.5); 
    thickArrow(pL6,pL7,0.5);
    thickArrow(pL12,pL13,0.5); 
    thickArrow(pL13,pL14,0.5);
    }
  else {                                         // Pfeile für die umgekehrte Stromrichtung
    thickArrow(pL6,pL5,0.5); 
    thickArrow(pL7,pL6,0.5);
    thickArrow(pL13,pL12,0.5); 
    thickArrow(pL14,pL13,0.5);
    } 
  }
      
// Vorderer Teil der Leiterschaukel (ohne waagrechten Metallstab):

function conductorFG () {
  var y = ly-lz*Math.sin(alpha);                 // Räumliche Koordinaten 
  var z = lz*(1-Math.cos(alpha));
  pL2 = screenCoords(-lx,y,z);                   // Bildschirmkoordinaten
  newPath(3,on?colorCurrent:"#000000");          // Neuer Pfad
  moveTo(pL1); lineTo(pL2);                      // Linie vorbereiten
  ctx.stroke();                                  // Linie (Leiterstück) zeichnen
  }
      
// Hinterer Teil der Leiterschaukel (mit waagrechtem Metallstab):

function conductorBG () {
  var y = ly-lz*Math.sin(alpha);                 // Räumliche Koordinaten 
  var z = lz*(1-Math.cos(alpha));
  pL2 = screenCoords(-lx,y,z);                   // Bildschirmkoordinaten
  pL3 = screenCoords(lx,y,z);
  newPath(3,on?colorCurrent:"#000000");          // Neuer Grafikpfad
  moveTo(pL2); lineTo(pL3); lineTo(pL4);         // Linien vorbereiten
  ctx.stroke();                                  // Linien (Leiterstücke) zeichnen
  if (!on || !cb1.checked) return;               // Abbruch, falls keine Strompfeile zu zeichnen
  var lambda = (dirM > 0 ? 0.85 : 0.95);         // Parameter für Pfeil (waagrechter Metallstab)
  if (dirC > 0) thickArrow(pL3,pL2,lambda);      // Pfeil für Strom zum Betrachter (Metallstab)
  else thickArrow(pL2,pL3,lambda);               // Pfeil für Strom vom Betrachter weg (Metallstab)
  }
  
// Feldlinie:
// y ... Koordinate im räumlichen Koordinatensystem

function fieldLine (y) {
  var p1 = screenCoords(0,y,mz1);                // Bildschirmkoordinaten (erster Punkt) 
  var p2 = screenCoords(0,y,-mz1);               // Bildschirmkoordinaten (zweiter Punkt)
  newPath(3,colorField);                         // Neuer Grafikpfad
  moveTo(p1); lineTo(p2);                        // Linie vorbereiten
  ctx.stroke();                                  // Linie zeichnen
  if (dirM > 0) {                                // Falls Nordpol oben ...
    thickArrow(p1,p2,0.35);                      // ... Obere Pfeilspitze (nach unten)
    thickArrow(p1,p2,0.85);                      // ... Untere Pfeilspitze (nach unten)
    }
  else {                                         // Falls Nordpol unten ...
    thickArrow(p2,p1,0.3);                       // ... Untere Pfeilspitze (nach oben)
    thickArrow(p2,p1,0.8);                       // ... Obere Pfeilspitze (nach oben)
    }
  }
  
// Pfeil für Lorentzkraft:

function forceArrow () {
  var y = ly-lz*Math.sin(alpha);                           // Räumliche Koordinaten 
  var z = lz*(1-Math.cos(alpha));
  var lArrow = -dirC*dirM*50;                              // Pfeillänge (mit Vorzeichen)
  var u0 = screenU(0,y), v0 = screenV(0,y,z);              // Bildschirmkoordinaten
  var u1 = screenU(0,y+lArrow), v1 = screenV(0,y+lArrow,z);
  ctx.strokeStyle = colorForce;                            // Farbe für Kraftpfeil
  arrow(u0,v0,u1,v1,3);                                    // Pfeil zeichnen
  }
  
// Grafikausgabe:
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,canvas.width,canvas.height);            // Hintergrund zeichnen
  alpha = (on ? 15*dirC*dirM*Math.PI/180 : 0);             // Auslenkungswinkel (Bogenmaß)
  magnetLow();                                             // Unterer Teil des Hufeisenmagneten
  var dy = 24;                                             // Abstand der Feldlinien
  if (cb2.checked) {                                       // Falls Feldlinien gewünscht ...
    for (var y=ly+2*dy; y>ly-2.5*dy; y-=dy) {              // Für alle Feldlinien (hintere zuerst) ...
      if (y < ly-lz*Math.sin(alpha)) break;                // Falls Feldlinie vor Leiterschaukel, abbrechen
      fieldLine(y);                                        // Feldlinie zeichnen
      }
    }
  conductorBG();                                           // Hinterer Teil der Leiterschaukel
  if (cb2.checked) {                                       // Falls Feldlinien gewünscht ...
    for (var y=ly+2*dy; y>ly-2.5*dy; y-=dy) {              // Für alle Feldlinien (hintere zuerst) ...
      if (y >= ly-lz*Math.sin(alpha)) continue;            // Falls Feldlinie hinter Leiterschaukel, weiter zur nächsten 
      fieldLine(y);                                        // Feldlinie zeichnen
      }
    } 
  magnetHigh();                                            // Oberer Teil des Hufeisenmagneten
  if (cb3.checked && alpha < 0) forceArrow();              // Kraftpfeil nach links
  conductorFG();                                           // Vorderer Teil der Leiterschaukel
  wires();                                                 // Unbewegter Teil des Stromkreises
  if (cb3.checked && alpha > 0) forceArrow();              // Kraftpfeil nach rechts
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen

