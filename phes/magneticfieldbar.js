// Magnetfeld eines Stabmagneten
// Java-Applet (20.04.2001) umgewandelt
// 02.03.2016 - 06.03.2016

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// ****************************************************************************

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel magneticfieldbar_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var	colorNorth = "#ff0000";                                // Farbe für Nordpol
var colorSouth = "#00ff00";                                // Farbe für Südpol
var colorField = "#0000ff";                                // Farbe für Magnetfeld

// Konstanten:

var LM = 100, LMH = LM/2;                                  // Länge und halbe Länge des Magneten (Pixel)
var WM = 20, WMH = WM/2;                                   // Breite und halbe Breite des Magneten (Pixel)
var HM = 10, HMH = HM/2;                                   // Höhe und halbe Höhe des Magneten (Pixel)
var DEM = 5;                                               // Abstand der Elementarmagnete (Pixel)
var LN = 20;                                               // Halbe Länge der Magnetnadel (Pixel)

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var bu1, bu2;                                              // Schaltknöpfe
var drag;                                                  // Flag für Zugmodus
var ux, uy;                                                // Mittelpunkt des Stabmagneten (Pixel)
var iFix;                                                  // Gespeicherte Bilddaten
var dir;                                                   // Orientierung des Magneten (1 oder -1)
var needle;                                                // Array für Position der Magnetnadel (relativ zur Bildmitte)
var field;                                                 // Array für Feldstärkevektor  
var begin;                                                 // Flag für ersten Aufruf von paint

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
  bu1 = getElement("bu1",text01);                          // Schaltknopf (Feldlinien löschen)
  bu2 = getElement("bu2",text02);                          // Schaltknopf (Magnet umdrehen)
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // Übersetzer
  
  dir = 1;                                                 // Nordpol des Stabmagneten zunächst links
  ux = width/2; uy = height/2;                             // Mittelpunkt des Stabmagneten (Pixel) 
  drag = false;                                            // Zugmodus zunächst abgeschaltet
  field = new Array(3);                                    // Array für Feldstärkevektor 
  needle = new Array(2);                                   // Array für Position der Magnetnadel
  initNeedle();                                            // Anfangsposition der Magnetnadel
  begin = true;                                            // Flag für ersten Aufruf der paint-Methode
  paint();                                                 // Zeichnen

  bu1.onclick = reactionButton1;                           // Reaktion auf oberen Schaltknopf (Feldlinien löschen)
  bu2.onclick = reactionButton2;                           // Reaktion auf unteren Schaltknopf (Magnet umdrehen)
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Drücken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Berührung  
  canvas.onmouseup = reactionUp;                           // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionUp;                          // Reaktion auf Ende der Berührung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers            
  }

// Reaktion auf Drücken der Maustaste:
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen (Magnetnadel)                    
  }
  
// Reaktion auf Berührung:
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Berührpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen (Magnetnadel)
  if (drag) e.preventDefault();                            // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Bewegen der Maus:
  
function reactionMouseMove (e) {            
  if (!drag) return;                                       // Abbrechen, falls Zugmodus nicht aktiviert
  reactionMove(e.clientX,e.clientY);                       // Hilfsroutine aufrufen (Magnetnadel)
  }
  
// Reaktion auf Bewegung des Fingers:
  
function reactionTouchMove (e) {            
  if (!drag) return;                                       // Abbrechen, falls Zugmodus nicht aktiviert
  var obj = e.changedTouches[0];                           // Liste der neuen Fingerpositionen     
  reactionMove(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen (Magnetnadel)
  e.preventDefault();                                      // Standardverhalten verhindern                          
  }  
  
// Hilfsroutine: Reaktion auf Mausklick oder Berühren mit dem Finger (Auswahl):
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt drag 

function reactionDown (u, v) {
  drag = false;                                            // Zugmodus deaktivieren
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel) 
  var dx = ux+needle[0]-u, dy = uy-needle[1]-v;            // Koordinatendifferenzen waagrecht/senkrecht
  if (dx*dx+dy*dy <= 100) drag = true;                     // Falls Abstand genügend klein, Zugmodus aktivieren
  }
  
// Reaktion auf Bewegung von Maus oder Finger (Änderung):
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt needle, iFix, begin, field

function reactionMove (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel)
  var h1 = new Array(2), h2 = new Array(3);                // Arrays für Position und Feldstärkevektor
  h1[0] = u-ux; h1[1] = uy-v;                              // Bildschirmkoordinaten Mittelpunkt Magnetnadel
  if (isInside(h1[0],h1[1],5)) return;                     // Falls Nadelmittelpunkt innerhalb des Magneten oder zu nahe, abbrechen
  calcField(h1,h2);                                        // Feldstärkevektor berechnen (Ergebnis in h2) 
  var w = Math.atan2(h2[1],h2[0]);                         // Winkel zur x-Achse (Bogenmaß)
  var dx = LN*Math.cos(w), dy = LN*Math.sin(w);            // Koordinatendifferenzen (Pixel)
  if (isInside(h1[0]+dx,h1[1]+dy,0)) return;               // Falls Nadelspitze innerhalb des Magneten, abbrechen
  if (isInside(h1[0]-dx,h1[1]-dy,0)) return;               // Falls andere Nadelspitze innerhalb des Magneten, abbrechen
  needle[0] = h1[0]; needle[1] = h1[1];                    // Neue Position übernehmen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf Loslassen der Maustaste oder Ende der Berührung:
// Seiteneffekt iFix, drag

function reactionUp () {
  ctx.putImageData(iFix,0,0);                              // Gespeicherte Grafik nochmal übertragen
  fieldLine(needle[0],needle[1]);                          // Aktuelle Feldlinie hinzufügen  
  iFix = ctx.getImageData(0,0,width,height);               // Veränderte Grafik speichern
  compass();                                               // Magnetnadel
  drag = false;                                            // Zugmodus deaktivieren
  }
  
// Reaktion auf oberen Schaltknopf (Feldlinien löschen):
// Seiteneffekt begin, needle, iFix, field

function reactionButton1 () {
  begin = true;                                            // Flag für ersten Aufruf der paint-Methode
  initNeedle();                                            // Anfangsposition Magnetnadel
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf unteren Schaltknopf (Magnet umdrehen):
// Seiteneffekt begin, dir, needle, iFix, field

function reactionButton2 () {
  begin = true;                                            // Flag für ersten Aufruf der paint-Methode
  dir = -dir;                                              // Orientierung des Stabmagneten
  initNeedle();                                            // Anfangsposition Magnetnadel
  paint();                                                 // Neu zeichnen
  }
    
//-------------------------------------------------------------------------------------------------

// Anfangsposition der Magnetnadel:
// Seiteneffekt needle

function initNeedle () {
  needle[0] = 100; needle[1] = 0;
  }

// Polygonecke festlegen:
// p ....... Array für Ecken des Polygons
// (x,y) ... Bildschirmkoordinaten (Pixel)
// c ....... Füllfarbe
// Seiteneffekt p

function setVertex (p, i, x, y) {
  p[i] = {u: x, v: y};
  }
  
// Hilfsroutine für calcField: Magnetfeld eines Leiterstücks zum Feldvektor hinzufügen
// Berechnung nach Biot-Savart (rechteckige Leiterschleifen) 
// (x,y,z) ... Position des Leiterstücks
// dir ....... Stromrichtung (0 bis 5)
// pos ....... Array der Dimension 2 für Bezugspunkt
// field ..... Array der Dimension 3 für Ergebnis (Feldstärkevektor)
    
function addField (x, y, z, dir, pos, field) {
  var  rx = pos[0]-x, ry = pos[1]-y, rz = -z;              // Koordinatendifferenzen
  var r3 = rx*rx+ry*ry+rz*rz;                              // Quadrat des Abstands 
  r3 = r3*Math.sqrt(r3);                                   // Dritte Potenz des Abstands 
  var fx = rx/r3, fy = ry/r3, fz = rz/r3;                  // Änderung des Feldstärkevektors                                  
  switch (dir) {                                           // Je nach Stromrichtung (rechteckige Leiterschleife) ...
    case 0: field[1] -= fz; field[2] += fy; break;         // Strom in positiver x-Richtung
    case 1: field[0] += fz; field[2] -= fx; break;         // Strom in positiver y-Richtung
    case 2: field[0] -= fy; field[1] += fx; break;         // Strom in positiver z-Richtung
    case 3: field[1] += fz; field[2] -= fy; break;         // Strom in negativer x-Richtung
    case 4: field[0] -= fz; field[2] += fx; break;         // Strom in negativer y-Richtung
    case 5: field[0] += fy; field[1] -= fx; break;         // Strom in negativer z-Richtung
    }
  }

// Magnetfeld des Stabmagneten:
// Berechnung nach Biot-Savart (rechteckige Leiterschleifen)
// pos ..... Array der Dimension für Bezugspunkt
// field ... Array der Dimension 3 für Ergebnis (Feldstärkevektor)
    
function calcField (pos, field) {
  var d = DEM/2;                                           // Halber Abstand der Elementarmagnete
  field[0] = field[1] = 0;                                 // Startwerte für Feldstärkevektor
  var iMax = Math.floor(LM/DEM)-1;                         // Größter Index für x-Richtung 
  var jMax = Math.floor(WM/DEM)-1;                         // Größter Index für y-Richtung 
  var kMax = Math.floor(HM/DEM)-1;                         // Größter Index für z-Richtung
  for (var i=-iMax; i<=+iMax; i+=2) {                      // Für alle Indizes der x-Richtung ...
    var id = i*d;                                          // x-Koordinate
    for (var k=-kMax; k<=+kMax; k+=2) {                    // Für alle Indizes der z-Richtung ...
      var kd = k*d;                                        // z-Koordinate
      addField(id,-WMH,kd,dir>0?5:2,pos,field);            // Feld eines Stroms in y-Richtung
      addField(id,+WMH,kd,dir>0?2:5,pos,field);            // Feld eines Stroms in y-Richtung (umgekehrt)
      }
    for (var j=-jMax; j<=+jMax; j+=2) {                    // Für alle Indizes der y-Richtung ...
      var jd = j*d;                                        // y-Koordinate
      addField(id,jd,+HMH,dir>0?4:1,pos,field);            // Feld eines Stroms in z-Richtung
      addField(id,jd,-HMH,dir>0?1:4,pos,field);            // Feld eines Stroms in z-Richtung (umgekehrt)
      }     
    }
  }
  
// Überprüfung, ob Position innerhalb des Stabmagneten:
// (x,y) ... Position (bezüglich Mittelpunkt)
// dMin .... Mindestabstand
  
function isInside (x, y, dMin) {
  return (Math.abs(x) <= LMH+dMin && Math.abs(y) <= WMH+dMin);
  }
   
//------------------------------------------------------------------------------------------------- 

// Neuer Grafikpfad:
// c ... Linienfarbe (optional, Defaultwert schwarz)

function newPath (c) {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.lineWidth = 1;                                       // Liniendicke 1
  ctx.strokeStyle = (c ? c : "#000000");                   // Linienfarbe schwarz
  }
  
// Linie vorbereiten:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt

function line (x1, y1, x2, y2) {
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    // Linie vorbereiten
  }
  
// Ausgefülltes Rechteck mit schwarzem Rand:
// x ... Abstand vom linken Rand (Pixel)
// y ... Abstand vom oberen Rand (Pixel)
// w ... Breite (Pixel)
// h ... Höhe (Pixel)
// c ... Füllfarbe

function rectangle(x, y, w, h, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausfüllen 
  ctx.strokeRect(x,y,w,h);                                 // Rand zeichnen
  }
  
// Waagrechter Pfeil für Feldlinie:
// y ... y-Koordinate (bezüglich Mittelpunkt, Pixel)
  
function horizontalArrow (y) {
  if (Math.abs(y) <= WMH && Math.round(y)%5 != 0)          // Falls Position innerhalb des Magneten ... 
    return;                                                // ... eventuell abbrechen
  var dirArrow = (Math.abs(y)<=WMH ? -dir : dir);          // Pfeilrichtung (1 für Pfeil nach rechts oder -1 für Pfeil nach links)
  var vSp = uy-y;                                          // Senkrechte Bildschirmkoordinate der Spitze
  var u12 = ux-dirArrow;                                   // Waagrechte Bildschirmkoordinate der seitlichen Ecken
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.fillStyle = colorField;                              // Füllfarbe
  ctx.moveTo(ux+dirArrow,vSp);                             // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(u12,vSp-3.5);                                 // Weiter zu einem der beiden seitlichen Punkte
  ctx.lineTo(ux+dirArrow*5,vSp);                           // Weiter zur Spitze
  ctx.lineTo(u12,vSp+3.5);                                 // Weiter zum anderen der beiden seitlichen Punkte
  ctx.closePath();                                         // Zurück zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen 
  }
  
// Ausgefüllter Kreis:
// (x,y) ... Mittelpunkt (Pixel)
// r ....... Radius (Pixel)
// c ....... Füllfarbe

function circle (x, y, r, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.fill();                                              // Kreis ausfüllen
  }
  
// Polygon:
// p ... Array mit Koordinaten der Ecken
// c ... Füllfarbe

function polygon (p, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.moveTo(p[0].u,p[0].v);                               // Zur ersten Ecke
  for (var i=1; i<p.length; i++)                           // Für alle weiteren Ecken ... 
    ctx.lineTo(p[i].u,p[i].v);                             // Linie zum Pfad hinzufügen
  ctx.closePath();                                         // Zurück zum Ausgangspunkt
  ctx.fill(); ctx.stroke();                                // Polygon ausfüllen und Rand zeichnen   
  }
  
// Magnetnadel:

function compass () {
  var u0 = ux+needle[0];                                   // Waagrechte Bildschirmkoordinate Mittelpunkt
  var v0 = uy-needle[1];                                   // Senkrechte Bildschirmkoordinate Mittelpunkt
  var w = Math.atan2(field[1],field[0]);                   // Feldrichtung (Bogenmaß, vorläufig)
  if (dir < 0) w += Math.PI;                               // Orientierung des Stabmagneten berücksichtigen
  var cos = Math.cos(w), sin = Math.sin(w);                // Trigonometrische Werte
  var dx0 = dir*LN*cos, dy0 = -dir*LN*sin;                 // Koordinatendifferenzen Längsrichtung
  var dx1 = 4*sin, dy1 = 4*cos;                            // Koordinatendifferenzen Querrichtung
  var pNorth = new Array(3);                               // Array für Ecken (Nordpol)
  setVertex(pNorth,0,u0-dx0,v0-dy0);                       // Spitze Nordpol
  setVertex(pNorth,1,u0-dx1,v0-dy1);                       // Zweite Ecke Nordpol
  setVertex(pNorth,2,u0+dx1,v0+dy1);                       // Dritte Ecke Nordpol
  polygon(pNorth,colorNorth);                              // Ausgefülltes Dreieck mit Rand (Nordpol)
  var pSouth = new Array(3);                               // Array für Ecken (Südpol)
  setVertex(pSouth,0,u0+dx0,v0+dy0);                       // Spitze Südpol
  setVertex(pSouth,1,u0+dx1,v0+dy1);                       // Zweite Ecke Südpol
  setVertex(pSouth,2,u0-dx1,v0-dy1);                       // Dritte Ecke Südpol
  polygon(pSouth,colorSouth);                              // Ausgefülltes Dreieck mit Rand (Südpol)
  circle(u0,v0,2,"#000000");                               // Mittelpunkt
  }
  
// Hilfsroutine: Teil einer Feldlinie
// pos ..... Array der Dimension 2 für aktuelle Position
// field ... Array der Dimension 3 für Feldstärkevektor
// dir ..... Richtung (1 vom Magnet weg, -1 zum Magnet hin)
// Seiteneffekt field, pos

function partFieldLine (pos, field, dir) {
  var x0 = pos[0];                                         // x-Koordinate Anfangspunkt (bezüglich Mittelpunkt)
  var v0 = uy-pos[1];                                      // Senkrechte Bildschirmkoordinate Anfangspunkt
  calcField(pos,field);                                    // Berechnung des Feldstärkevektors
  var w = Math.atan2(field[1],field[0]);                   // Winkel zur x-Achse (Bogenmaß)
  pos[0] += dir*Math.cos(w); pos[1] += dir*Math.sin(w);    // Position des Linienendpunkts
  var x1 = pos[0];                                         // x-Koordinate Endpunkt (bezüglich Mittelpunkt)
  var v1 = uy-pos[1];                                      // Senkrechte Bildschirmkoordinate Endpunkt  
  line(ux+x0,v0,ux+x1,v1);                                 // Linie rechts
  line(ux-x0,v0,ux-x1,v1);                                 // Linie links (symmetrisch)
  }
  
// Einzelne Feldlinie:
// (x,y) .... Gegebener Punkt (Pixel)
// Seiteneffekt field, pos
  
function fieldLine (x, y) {
  x = Math.abs(x);                                         // Position in der rechten Halbebene erzwingen
  var pos = new Array(2);                                  // Array für Position 
  var field = new Array(3);                                // Array für Feldstärkevektor
  var yA1, yA2;                                            // y-Koordinaten der Pfeile (bezüglich Mittelpunkt)
  newPath(colorField);                                     // Neuer Grafikpfad
  pos[0] = x; pos[1] = y;                                  // Anfangsposition übernehmen 
  for (var i=0; i<1000; i++) {                             // Für alle Indizes ...
    partFieldLine(pos,field,1);                            // Linienstück (vom Magneten weg)
    if (pos[0] < 0) {yA1 = pos[1]; break;}                 // Falls Symmetrieebene überschritten, y-Koordinate speichern und abbrechen
    }
  pos[0] = x; pos[1] = y;                                  // Anfangsposition wiederherstellen
  for (i=0; i<1000; i++) {                                 // Für alle Indizes ...
    partFieldLine(pos,field,-1);                           // Linienstück (zum Magneten hin)
    if (pos[0] < 0) {yA2 = pos[1]; break;}                 // Falls Symmetrieebene überschritten, y-Koordinate speichern und abbrechen
    }
  ctx.stroke();                                            // Feldlinie zeichnen
  if (yA1) horizontalArrow(yA1);                           // Eventuell Pfeilspitze oberhalb des Stabmagneten
  if (yA2) horizontalArrow(yA2);                           // Eventuell Pfeilspitze innerhalb des Stabmagneten
  }
  
// Gleichbleibender Teil der Grafik:

function paintFix () {
  rectangle(0,0,width,height,colorBackground);             // Hintergrund
  rectangle(ux-LM/4*(1+dir),uy-WMH,LMH,WM,colorNorth);     // Nordpol Stabmagnet
  rectangle(ux-LM/4*(1-dir),uy-WMH,LMH,WM,colorSouth);     // Südpol Stabmagnet
  }
  
// Zeichenfläche aktualisieren:
// Seiteneffekt iFix, begin, field

function paint () {
  if (begin) {                                             // Falls erster Aufruf von paint ...
    paintFix();                                            // Hintergrund und Stabmagnet (gleichbleibend)
    iFix = ctx.getImageData(0,0,width,height);             // Grafik im Hintergrund speichern
    begin = false;                                         // Flag für ersten Aufruf von paint löschen
    }
  ctx.putImageData(iFix,0,0);                              // Gespeichertes Bild übertragen
  if (drag)                                                // Falls Zugmodus ... 
    fieldLine(needle[0],needle[1]);                        // Aktuelle Feldlinie
  calcField(needle,field);                                 // Berechnung des Feldstärkevektors
  compass();                                               // Magnetnadel
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen



