// Newtons Wiege (Demonstration von Impuls- und Energieerhaltung)
// Java-Applet (04.11.1997) umgewandelt
// 18.04.2014 - 11.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Konstanten:

var colorBackground = "#ffff00";                 // Hintergrundfarbe
var	color1 = "#c0c0c0";                          // Farbe für Gestell (hellgrau)
var color2 = "#808080";                          // Farbe für Gestell (dunkelgrau)
var color3 = "#a0a0a0";                          // Farbe für Gestell (mittelgrau)
var	colorBall = "#2040ff";                       // Farbe für Kugeln

var A = 120, B = 80, C = 200;                    // Abmessungen in x-, y- und z-Richtung 
var D = 10;                                      // Dicke
var R = 20;                                      // Radius der Pendelkörper
var L = 150;                                     // Pendellänge
var AMPL = 0.4;                                  // Amplitude (Bogenmaß)
var T = 2;                                       // Schwingungsdauer (s)
var phi = 58*Math.PI/180;                        // Azimutwinkel (Bogenmaß)  
var theta = 20*Math.PI/180;                      // Höhenwinkel (Bogenmaß)
var u0, v0;                                      // Bildschirmmitte (Pixel)  
var a1, a2, b1, b2, b3;                          // Koeffizienten für Projektion
var poly1, poly2, poly3, poly4,                  // Arrays für Bildschirmkoordinaten der Polygonecken
    poly5, poly6, poly7, poly8;
var s1, s2;                                      // Arrays für Bildschirmkoordinaten der Aufhängepunkte 
var canvas, ctx;                                 // Zeichenfläche, Grafikkontext
var bu1, bu2;                                    // Schaltknöpfe
var ch;                                          // Auswahlliste

// Veränderliche Attribute:

var on;                                          // Flag für Bewegung
var t0;                                          // Anfangszeitpunkt (s)
var t;                                           // Aktuelle Zeit (s)
var sin, cos;                                    // Trigonometrische Werte des Phasenwinkels

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
  u0 = canvas.width/2; v0 = 300;                 // Bildschirmmitte
  ctx = canvas.getContext("2d");                 // Grafikkontext
  bu1 = getElement("bu1",text01);                // Resetknopf
  bu2 = getElement("bu2",text02);                // Startknopf
  getElement("number",text03);                   // Erklärender Text (Zahl der ausgelenkten Kugeln)
  ch = getElement("ch");                         // Auswahlliste
  ch.selectedIndex = 0;                          // Eine Kugel ausgelenkt
  getElement("author",author);                   // Autor
  getElement("translator",translator);           // Übersetzer
  
  on = false;                                    // Animation abgeschaltet
  t0 = new Date();                               // Anfangszeitpunkt
  setInterval(paint,40);                         // Timer-Intervall 0,040 s  
  calcCoeff();                                   // Koeffizienten für Projektion
  initPolygons();                                // Polygone festlegen
  coordsSuspension();                            // Aufhängepunkte ermitteln
  paint();                                       // Zeichnen
  
  bu1.onclick = reactionButton1;                 // Reaktion auf Resetknopf
  bu2.onclick = reactionButton2;                 // Reaktion auf Startknopf
  ch.onchange = reactionChoice;                  // Reaktion auf Auswahl
  
  } // Ende der Methode start
  
// Reaktion auf Resetknopf:
  
function reactionButton1 () {on = false; t = 0;}

// Reaktion auf Startknopf:
  
function reactionButton2 () {on = true; t0 = new Date();}

// Reaktion auf Auswahl:

function reactionChoice () {on = false; t = 0;}

//-----------------------------------------------------------------------------

// Koeffizienten für Projektion berechnen:
// Seiteneffekt a1, a2, b1, b2, b3
  
function calcCoeff () {
  a1 = -Math.sin(phi); a2 = Math.cos(phi);
  b1 = -Math.sin(theta)*a2; b2 = Math.sin(theta)*a1; b3 = Math.cos(theta);
  }
    
// Waagrechte Bildschirmkoordinate:
  
function screenU (x, y) {
  return u0+a1*x+a2*y;
  }

// Senkrechte Bildschirmkoordinate:
      
function screenV (x, y, z) {
  return v0-b1*x-b2*y-b3*z;
  }
       
// Polygonecke festlegen:
// p ......... Array für Bildschirmkoordinaten der Polygonecken
// i ......... Index der Ecke
// x, y, z ... Koordinaten im Raum
  
function setPoint (p, i, x, y, z) {
  p[i]= {u: screenU(x,y), v: screenV(x,y,z)};
  }
  
// Polygone für Gestell festlegen:
// Seiteneffekt poly1 bis poly8

function initPolygons () {
  poly1 = new Array(8);                          // U-förmige Fläche (links)
  setPoint(poly1,0,A+D,-B-D,C+2*D);
  setPoint(poly1,1,A+D,-B-D,0);
  setPoint(poly1,2,A+D,B+D,0);
  setPoint(poly1,3,A+D,B+D,C+2*D);
  setPoint(poly1,4,A+D,B,C+2*D);
  setPoint(poly1,5,A+D,B,D);
  setPoint(poly1,6,A+D,-B,D);
  setPoint(poly1,7,A+D,-B,C+2*D);
  poly2 = new Array(4);                          // Rechtecksfläche (hinten)
  setPoint(poly2,0,A+D,-B-D,C+2*D);
  setPoint(poly2,1,A+D,-B,C+2*D);
  setPoint(poly2,2,-A-D,-B,C+2*D);
  setPoint(poly2,3,-A-D,-B-D,C+2*D);
  poly3 = new Array(8)                           // U-förmige Fläche (hinten)
  setPoint(poly3,0,A+D,-B,C+2*D);
  setPoint(poly3,1,A+D,-B,D);
  setPoint(poly3,2,A,-B,D);
  setPoint(poly3,3,A,-B,C+D);
  setPoint(poly3,4,-A,-B,C+D);
  setPoint(poly3,5,-A,-B,D);
  setPoint(poly3,6,-A-D,-B,D);
  setPoint(poly3,7,-A-D,-B,C+2*D);
  poly4 = new Array(4);                          // Rechtecksfläche (links unten)
  setPoint(poly4,0,A+D,-B,D);
  setPoint(poly4,1,A+D,B,D);
  setPoint(poly4,2,A,B,D);
  setPoint(poly4,3,A,-B,D); 
  poly5 = new Array(8);                          // U-förmige Fläche (vorne)
  setPoint(poly5,0,A+D,B+D,0);
  setPoint(poly5,1,A,B+D,0);
  setPoint(poly5,2,A,B+D,C+D);
  setPoint(poly5,3,-A,B+D,C+D);
  setPoint(poly5,4,-A,B+D,0);
  setPoint(poly5,5,-A-D,B+D,0);
  setPoint(poly5,6,-A-D,B+D,C+2*D);
  setPoint(poly5,7,A+D,B+D,C+2*D); 
  poly6 = new Array(4);                          // Rechtecksfläche (vorne oben)
  setPoint(poly6,0,A+D,B,C+2*D);
  setPoint(poly6,1,A+D,B+D,C+2*D);
  setPoint(poly6,2,-A-D,B+D,C+2*D);
  setPoint(poly6,3,-A-D,B,C+2*D);
  poly7 = new Array(8);                          // U-förmige Fläche (rechts)
  setPoint(poly7,0,-A,-B-D,C+D);
  setPoint(poly7,1,-A,-B-D,0);
  setPoint(poly7,2,-A,B+D,0);
  setPoint(poly7,3,-A,B+D,C+D);
  setPoint(poly7,4,-A,B,C+D);
  setPoint(poly7,5,-A,B,D);
  setPoint(poly7,6,-A,-B,D);
  setPoint(poly7,7,-A,-B,C+D); 
  poly8 = new Array(4);                          // Rechtecksfläche (rechts unten)
  setPoint(poly8,0,-A,-B,D);
  setPoint(poly8,1,-A,B,D);
  setPoint(poly8,2,-A-D,B,D);
  setPoint(poly8,3,-A-D,-B,D); 
  }
  
// Bildschirmkoordinaten der Aufhängepunkte ermitteln:
// Seiteneffekt s1, s2;

function coordsSuspension () {
  s1 = new Array(5);                             // Array für Aufhängepunkte hinten
  s2 = new Array(5);                             // Array für Aufhängepunkte vorne
  for (var i=0; i<5; i++) {                      // Für alle fünf Pendel ...
  	var x0 = -4*R+i*2*R, y0 = B+D/2, z0 = C+D;   // Koordinaten im Raum
  	s1[i] = {u: screenU(x0,-y0), v: screenV(x0,-y0,z0)};  // Bildschirmkoordinaten für hintere Aufhängung
  	s2[i] = {u: screenU(x0,y0), v: screenV(x0,y0,z0)};    // Bildschirmkoordinaten für vordere Aufhängung
  	}
  }
  
//-----------------------------------------------------------------------------

// Polygon zeichnen:
// p ... Array mit Koordinaten der Ecken
// c ... Füllfarbe

function drawPolygon (p, c) {
  ctx.beginPath();                               // Neuer Pfad
  ctx.strokeStyle = "#000000";                   // Linienfarbe schwarz
  ctx.fillStyle = c;                             // Füllfarbe
  ctx.lineWidth = 1;                             // Liniendicke
  ctx.moveTo(p[0].u,p[0].v);                     // Zur ersten Ecke
  for (var i=1; i<p.length; i++)                 // Für alle weiteren Ecken ... 
    ctx.lineTo(p[i].u,p[i].v);                   // Linie zum Pfad hinzufügen
  ctx.closePath();                               // Zurück zum Ausgangspunkt
  ctx.fill(); ctx.stroke();                      // Polygon ausfüllen und Rand zeichnen   
  }
  
// Linie zum Pfad hinzufügen:
// p ...... Punkt (Bildschirmkoordinaten, gegeben als Objekt mit Attributen u und v)
// u, v ... Bildschirmkoordinaten des zweiten Punkts

function addLine (p, u, v) {
  ctx.moveTo(p.u,p.v); ctx.lineTo(u,v);
  }
  
// Einzelnes Pendel zeichnen:
// i ... Index (0 bis 4)

function drawPendulum (i) {
  var k = ch.selectedIndex+1;                    // Zahl der ausgelenkten Kugeln
  var x0 = -4*R+i*2*R;                           // Mittlere x-Koordinate des Kugelmittelpunkts
  var y0 = B+D/2;                                // y-Koordinate Aufhängungen (Betrag)
  var z0 = C+D;                                  // z-Koordinate Aufhängungen
  var moving = ((t < 0.25*T || t >= 0.75*T) && i < k)  
    || (t >= 0.25*T && t < 0.75*T && i >= 5-k);  // Bedingung für bewegte Kugel 
  var px = (moving ? x0-L*sin : x0);             // x-Koordinate Kugelmittelpunkt
  var pz = (moving ? z0-L*cos : z0-L);           // z-Koordinate Kugelmittelpunkt	
  var u0 = screenU(px,0), v0 = screenV(px,0,pz); // Bildschirmkoordinaten Kugelmittelpunkt
  ctx.beginPath();                               // Neuer Pfad
  ctx.lineStyle = "#000000";                     // Linienfarbe schwarz
  ctx.lineWidth = 1;                             // Liniendicke
  addLine(s1[i],u0,v0);                          // Hinterer Faden
  addLine(s2[i],u0,v0);                          // Vorderer Faden
  ctx.stroke();                                  // Fäden zeichnen
  ctx.beginPath();                               // Neuer Pfad
  ctx.fillStyle = colorBall;                     // Füllfarbe
  ctx.arc(u0,v0,R,0,2*Math.PI,true);             // Kreis für Pendelkörper vorbereiten
  ctx.fill(); ctx.stroke();                      // Pendelkörper zeichnen
  }
  
// Kleine Korrektur für Polygon poly3: Die Fäden der hinteren Aufhängungen ragen etwas ins Polygon hinein.
    
function correctPolygon () {
  var u1 = screenU(A,-B), v1 = screenV(A,-B,C+D+2);
  var u2 = screenU(-A,-B), v2 = screenV(-A,-B,C+D+2);
  ctx.beginPath();
  ctx.strokeStyle = color2;
  ctx.lineWidth = 2;
  ctx.moveTo(u1,v1); ctx.lineTo(u2,v2);
  ctx.stroke();
  }

// Grafikausgabe:
  
function paint () {
  ctx.fillStyle = colorBackground;               // Hintergrundfarbe
  ctx.fillRect(0,0,canvas.width,canvas.height);  // Hintergrund ausfüllen
  t = (on ? (new Date()-t0)/1000 : 0);           // Aktuelle Zeit (s)
  while (t >= T) t -= T;                         // 0 <= t < T erzwingen
  var phi = AMPL*Math.cos(2*Math.PI/T*t);        // Phasenwinkel (Bogenmaß)
  sin = Math.sin(phi); cos = Math.cos(phi);      // Trigonometrische Werte aktualisieren  
  drawPolygon(poly8,color3);                     // Rechtecksfläche (rechts unten)
  drawPolygon(poly7,color1);                     // U-förmige Fläche (rechts)
  drawPolygon(poly3,color2);                     // U-förmige Fläche (hinten)
  for (var i=0; i<5; i++) drawPendulum(i);       // Pendel
  drawPolygon(poly6,color3);                     // Rechtecksfläche (vorne oben)
  drawPolygon(poly4,color3);                     // Rechtecksfläche (links unten)
  drawPolygon(poly2,color3);                     // Rechtecksfläche (hinten oben)
  drawPolygon(poly1,color1);                     // U-förmige Fläche (links)
  drawPolygon(poly5,color2);                     // U-förmige Fläche (vorne)
  correctPolygon();                              // Kleine Korrektur
  }
  
document.addEventListener("DOMContentLoaded",start,false);