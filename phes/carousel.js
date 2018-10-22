// Modell eines Kettenkarussells
// Java-Applet (10.03.1999) umgewandelt
// 03.10.2016 - 20.10.2016

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel carousel_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorBall = "#ffffff";                                 // Farbe für Pendelkörper
var colorWeight = "#000000";                               // Farbe für Gewichtskraft
var colorRadialForce = "#ff0000";                          // Farbe für Zentripetalkraft
var colorTension = "#0000ff";                              // Farbe für Belastung des Fadens
var colorAngle = "#00ffff";                                // Farbe für Winkelmarkierung
var color1 = ["#00ffff","#ffafaf", "#00ff00", "#ffc800"];  // Farben für den unteren Teil
var color2 = ["#ff0000", "#00ffff", "#ffafaf", "#0000ff",  // Farben für den oberen Teil
              "#ffc800", "#ff00ff", "#00ff00", "#000000"];

// Sonstige Konstanten:

var DEG = Math.PI/180;                                     // Winkelgrad
var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz
var XM = 220, YM = 130;                                    // Ursprung (Pixel)
var SIN45 = Math.sqrt(0.5);                                // Hilfsgröße für 45°-Drehungen
var PIX = 100;                                             // Umrechnungsfaktor (Pixel pro m)

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var rb1, rb2, rb3, rb4;                                    // Radiobuttons
var bu;                                                    // Schaltknopf
var cbSlow;                                                // Optionsfeld Zeitlupe
var ip1, ip2, ip3, ip4;                                    // Eingabefelder

var nr;                                                    // Art der Darstellung (1 bis 4)
var theta, cosTh, sinTh;                                   // Höhenwinkel für Projektion (Bogenmaß) und trigonometrische Werte
var r0;                                                    // Abstand Aufhängung - Drehachse (m)
var r0Pix;                                                 // Abstand Aufhängung - Drehachse (Pixel)
var l;                                                     // Fadenlänge (m)
var m;                                                     // Masse (kg)
var fG;                                                    // Gewichtskraft (N)
var fR;                                                    // Zentripetalkraft (N)
var r;                                                     // Abstand Pendelkörper - Drehachse (m)
var phi, cosPhi, sinPhi;                                   // Drehwinkel (Bogenmaß) und trigonometrische Werte
var alpha;                                                 // Winkel gegenüber der Senkrechten (Bogenmaß)
var tPer;                                                  // Umlaufdauer (s)
var omega;                                                 // Kreisfrequenz (1/s)  
var pixF;                                                  // Umrechnungsfaktor für Kraftpfeile (Pixel pro Newton)
var zz;                                                    // Betrag der z-Koordinate der Pendelkörper (Pixel)             
var rK;                                                    // Kugelradius (Pixel)
var poly1, poly2, poly3;                                   // Arrays für Polygonecken
var on;                                                    // Flag für Bewegung
var slow;                                                  // Flag für Zeitlupe
var timer;                                                 // Timer für Animation
var t0;                                                    // Bezugszeitpunkt
var t;                                                     // Zeitvariable (s)

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
  rb1 = getElement("rb1");                                 // Radiobutton (nur Karussell)
  rb1.checked = true;                                      // Radiobutton zunächst ausgewählt
  getElement("lb1",text01);                                // Erklärender Text (Karussell)
  rb2 = getElement("rb2");                                 // Radiobutton (Karussell mit Kräften)
  getElement("lb2",text02);                                // Erklärender Text (Karussell mit Kräften)
  rb3 = getElement("rb3");                                 // Radiobutton (Skizze)
  getElement("lb3",text03);                                // Erklärender Text (Skizze)
  rb4 = getElement("rb4");                                 // Radiobutton (Zahlenwerte)
  getElement("lb4",text04);                                // Erklärender Text (Zahlenwerte)
  bu = getElement("bu",text05[0]);                         // Schaltknopf (Pause/Weiter)
  bu.state = 0;                                            // Anfangszustand (in Bewegung)
  cbSlow = getElement("cbSlow");                           // Optionsfeld (Zeitlupe)
  cbSlow.checked = false;                                  // Zeitlupe abgeschaltet
  getElement("lbSlow",text06);                             // Erkärender Text (Zeitlupe)
  getElement("ip1a",text07);                               // Erklärender Text (Umlaufzeit)
  ip1 = getElement("ip1b");                                // Eingabefeld (Umlaufzeit)
  getElement("ip1c",second);                               // Einheit (Umlaufzeit)
  getElement("ip2a",text08[0]);                            // Erklärender Text (Abstand Aufhängung - Drehachse, 1. Teil)
  getElement("ip2b",text08[1]);                            // Erklärender Text (Abstand Aufhängung - Drehachse, 2. Teil)
  ip2 = getElement("ip2c");                                // Eingabefeld (Abstand Aufhängung - Drehachse)
  getElement("ip2d",meter);                                // Einheit (Abstand Aufhängung - Drehachse)
  getElement("ip3a",text09);                               // Erklärender Text (Fadenlänge)
  ip3 = getElement("ip3b");                                // Eingabefeld (Fadenlänge)
  getElement("ip3c",meter);                                // Einheit (Fadenlänge)
  getElement("ip4a",text10);                               // Erklärender Text (Masse)
  ip4 = getElement("ip4b");                                // Eingabefeld (Masse)
  getElement("ip4c",kilogram);                             // Einheit (Masse)
  getElement("author",author);                             // Autor (und Übersetzer)
  
  t = 0;                                                   // Startwert Zeitvariable
  on = true;                                               // Animation zunächst angeschaltet 
  slow = false;                                            // Zeitlupe zunächst abgeschaltet
  nr = 1;                                                  // Zunächst Karussell ohne Kräfte
  theta = 20*DEG;                                          // Höhenwinkel für Projektion (Bogenmaß)
  cosTh = Math.cos(theta); sinTh = Math.sin(theta);        // Trigonometrische Werte        
  r0 = 0.8;                                                // Abstand der Aufhängungen von der Drehachse (m)
  l = 1;                                                   // Fadenlänge (m)
  tPer = 4;                                                // Umlaufdauer (s)
  m = 1;                                                   // Masse eines Pendelkörpers (kg)
  updateInput();                                           // Eingabefelder aktualisieren 
  calculation();                                           // Berechnungen
  poly1 = newPolygon(3);                                   // Array für Dreiecke der Oberseite
  poly2 = newPolygon(4);                                   // Array für kleine Rechtecke (oberer Teil)
  poly3 = newPolygon(4);                                   // Array für große Rechtecke (unterer Teil)
  setPoint(poly1,0,XM,YM-15*cosTh);                        // Gemeinsamer Punkt der Dreiecke
  startAnimation();                                        // Animation einschalten
  
  rb1.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton
  rb2.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton
  rb3.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton
  rb4.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton
  bu.onclick = reactionButton;                             // Reaktion auf Schaltknopf
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld Zeitlupe
  ip1.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Umlaufzeit)
  ip2.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Position Aufhängung)
  ip3.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Fadenlänge)
  ip4.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Masse)
         
  } // Ende der Methode start
    
// Reaktion auf den Schaltknopf Pause/Weiter:
// Seiteneffekt bu, on, timer, t0, slow, tPer, r0, l, m, omega, alpha, r, fG, fR, pixF, r0Pix, rK, zz, 
// t, phi, cosPhi, sinPhi, poly1, poly2, poly3 

function reactionButton () {
  var st = 1-bu.state;                                     // Neuer Wert von bu.state
  bu.state = st;                                           // Neuer Zustand des Schaltknopfs
  bu.innerHTML = text05[st];                               // Neuer Text des Schaltknopfs
  if (bu.state == 0) startAnimation();                     // Entweder Animation fortsetzen ...
  else stopAnimation();                                    // ... oder stoppen
  slow = cbSlow.checked;                                   // Flag für Zeitlupe
  reaction();                                              // Eingegebene Werte übernehmen und rechnen
  if (!on) paint();                                        // Falls nötig, neu zeichnen
  }
  
// Reaktion auf Optionsfeld Zeitlupe:
// Seiteneffekt slow

function reactionSlow () {
  slow = cbSlow.checked;                                   // Flag setzen
  }
  
// Hilfsroutine: Eingabe übernehmen und rechnen
// Seiteneffekt tPer, r0, l, m, omega, alpha, r, fG, fR, pixF, r0Pix, rK, zz 

function reaction () {
  input();                                                 // Eingegebene Werte übernehmen (eventuell korrigiert)
  calculation();                                           // Berechnungen
  }
  
// Reaktion auf Tastendruck (nur auf Enter-Taste):
// Seiteneffekt tPer, r0, l, m, omega, alpha, r, fG, fR, pixF, r0Pix, rK, zz, t, t0, phi, cosPhi, sinPhi, poly1, poly2, poly3
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten übernehmen und rechnen                          
  paint();                                                 // Neu zeichnen
  }

// Reaktion auf Radiobutton:
// Seiteneffekt nr, t, t0, phi, cosPhi, sinPhi, poly1, poly2, poly3

function reactionRadioButton () {
  if (rb1.checked) nr = 1;                                 // Entweder nur Karussell ...
  if (rb2.checked) nr = 2;                                 // ... oder Karussell mit Kräften ...
  if (rb3.checked) nr = 3;                                 // ... oder zweidimensionale Skizze ... 
  if (rb4.checked) nr = 4;                                 // ... oder Zahlenwerte
  if (!on) paint();                                        // Falls nötig, neu zeichnen
  }
  
// Animation starten oder fortsetzen:
// Seiteneffekt on, timer, t0

function startAnimation () {
  on = true;                                               // Animation angeschaltet
  timer = setInterval(paint,40);                           // Timer mit Intervall 0,040 s aktivieren
  t0 = new Date();                                         // Neuer Bezugszeitpunkt 
  }
  
// Animation stoppen:
// Seiteneffekt on, timer

function stopAnimation () {
  on = false;                                              // Animation abgeschaltet
  clearInterval(timer);                                    // Timer deaktivieren
  }

//-------------------------------------------------------------------------------------------------

// Berechnungen:
// Seiteneffekt omega, alpha, r, fG, fR, pixF, r0Pix, rK, zz

function calculation () {
  omega = 2*Math.PI/tPer;                                  // Winkelgeschwindigkeit (rad/s)
  if (r0 == 0) {                                           // Falls Aufhängungen auf Drehachse ...
    var a = 9.81/(l*omega*omega);                          // Hilfsgröße 
    if (a > 1) alpha = 0;                                  // Winkel für langsame Drehung
    else alpha = Math.acos(a);                             // Winkel für schnellere Drehung
    }
  else {                                                   // Andernfalls Winkelberechnung durch Intervallschachtelung
    var u = 0;                                             // Startwert für untere Intervallgrenze
    var o = Math.PI/2;                                     // Startwert für obere Intervallgrenze
    var mi = (u+o)/2;                                      // Startwert für Mitte des Intervalls
    while (o-u > 1e-10) {                                  // Solange Intervall noch zu groß ...
      a = 9.81*Math.tan(mi)-omega*omega*(r0+l*Math.sin(mi));  // Hilfsgröße (Funktionswert für Mitte des Intervalls)
      if (a > 0) o = mi;                                   // Falls Funktionswert positiv, linke Hälfte des bisherigen Intervalls 
      else u = mi;                                         // Falls Funktionswert negativ, rechte Hälfte des bisherigen Intervalls
      mi = (u+o)/2;                                        // Mitte des neuen Intervalls
      }
    alpha = mi;                                            // Ergebnis der Intervallschachtelung
    }
  r = r0+l*Math.sin(alpha);                                // Radius der Drehbewegung (m)
  fG = m*9.81;                                             // Gewichtskraft (N)                                 
  fR = m*r*omega*omega;                                    // Zentripetalkraft (N)
  pixF = 5/m;                                              // Umrechnungsfaktor für Kraftpfeile (Pixel pro Newton)
  r0Pix = r0*PIX;                                          // Abstand Aufhängung - Drehachse (Pixel)
  rK = 10; if (r0 < 0.5) rK = Math.max(2,r0*20);           // Radius Pendelkörper (Pixel)
  zz = -l*PIX*Math.cos(alpha);                             // Betrag der z-Koordinate der Pendelkörper (Pixel)
  }
  
// Neues Array für Ecken eines Polygons:
// n ... Eckenzahl

function newPolygon (n) {
  var p = new Array(n);                                    // Neues Array
  for (var i=0; i<n; i++) p[i] = {u: 0, v: 0};             // Vorläufige Werte
  return p;                                                // Rückgabewert
  }
  
// Setzen einer Polygonecke:
// p ...... Array der Polygonecken
// i ...... Index
// x, y ... Koordinaten (Pixel)
  	
function setPoint (p, i, x, y) {
  p[i].u = x; p[i].v = y;
  }
    
// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag für Nachkommastellen (im Gegensatz zu gültigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }
  
// Eingabe einer Zahl
// ef .... Eingabefeld
// d ..... Zahl der Stellen
// fix ... Flag für Nachkommastellen (im Gegensatz zu gültigen Ziffern)
// min ... Minimum des erlaubten Bereichs
// max ... Maximum des erlaubten Bereichs
// Rückgabewert: Zahl oder NaN
  
function inputNumber (ef, d, fix, min, max) {
  var s = ef.value;                                        // Zeichenkette im Eingabefeld
  s = s.replace(",",".");                                  // Eventuell Komma in Punkt umwandeln
  var n = Number(s);                                       // Umwandlung in Zahl, falls möglich
  if (isNaN(n)) n = 0;                                     // Sinnlose Eingaben als 0 interpretieren 
  if (n < min) n = min;                                    // Falls Zahl zu klein, korrigieren
  if (n > max) n = max;                                    // Falls Zahl zu groß, korrigieren
  ef.value = ToString(n,d,fix);                            // Eingabefeld eventuell korrigieren
  return n;                                                // Rückgabewert
  }
   
// Gesamte Eingabe:
// Seiteneffekt tPer, r0, l, m

function input () {
  tPer = inputNumber(ip1,2,true,2,10);                     // Umlaufdauer (s)
  r0 = inputNumber(ip2,2,true,0,1);                        // Abstand Aufhängung - Drehachse (m)
  l = inputNumber(ip3,2,true,0.5,1);                       // Fadenlänge (m)
  m = inputNumber(ip4,2,true,0.1,10);                      // Masse Pendelkörper (kg)
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ip1.value = ToString(tPer,2,true);                       // Eingabefeld für Umlaufdauer (s)
  ip2.value = ToString(r0,2,true);                         // Eingabefeld für Position der Aufhängungen (m)
  ip3.value = ToString(l,2,true);                          // Eingabefeld für Fadenlänge (m)
  ip4.value = ToString(m,2,true);                          // Eingabefeld für Masse (kg)
  }
   
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
  }
  
// Linie:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// c ........ Farbe (optional, Defaultwert schwarz)

function line (x1, y1, x2, y2, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  if (c) ctx.strokeStyle = c;                              // Linienfarbe festlegen, falls angegeben
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Kreisscheibe mit schwarzem Rand:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... Füllfarbe (optional)

function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                // Füllfarbe
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  if (c) ctx.fill();                                       // Kreis ausfüllen, falls gewünscht
  ctx.stroke();                                            // Rand zeichnen
  }
  
// Dicker Pfeil:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// c ........ Farbe (optional, Defaultwert schwarz)

function arrow (x1, y1, x2, y2, c) {
  w = 2;                                                   // Liniendicke                          
  var dx = x2-x1, dy = y2-y1;                              // Vektorkoordinaten
  var len = Math.sqrt(dx*dx+dy*dy);                        // Länge
  if (len == 0) return;                                    // Abbruch, falls Länge 0
  dx /= len; dy /= len;                                    // Einheitsvektor
  var s = 2.5*w+7.5;                                       // Länge der Pfeilspitze 
  var xSp = x2-s*dx, ySp = y2-s*dy;                        // Hilfspunkt für Pfeilspitze         
  var h = 0.5*w+3.5;                                       // Halbe Breite der Pfeilspitze
  var xSp1 = xSp-h*dy, ySp1 = ySp+h*dx;                    // Ecke der Pfeilspitze
  var xSp2 = xSp+h*dy, ySp2 = ySp-h*dx;                    // Ecke der Pfeilspitze
  xSp = x2-0.6*s*dx; ySp = y2-0.6*s*dy;                    // Einspringende Ecke der Pfeilspitze
  ctx.beginPath();                                         // Neuer Pfad
  ctx.lineWidth = w;                                       // Liniendicke
  ctx.strokeStyle = (c ? c : "#000000");                   // Farbe
  ctx.moveTo(x1,y1);                                       // Anfangspunkt
  if (len < 5) ctx.lineTo(x2,y2);                          // Falls kurzer Pfeil, weiter zum Endpunkt, ...
  else ctx.lineTo(xSp,ySp);                                // ... sonst weiter zur einspringenden Ecke
  ctx.stroke();                                            // Linie zeichnen
  if (len < 5) return;                                     // Falls kurzer Pfeil, keine Spitze
  ctx.beginPath();                                         // Neuer Pfad für Pfeilspitze
  ctx.fillStyle = ctx.strokeStyle;                         // Füllfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                                     // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                                   // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                                       // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                                   // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                                         // Zurück zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen 
  }
  
// Winkelmarkierung im Gegenuhrzeigersinn:
// (x,y) ... Scheitel (Pixel)
// r ....... Radius (Pixel)
// a0 ...... Startwinkel (Bogenmaß)
// a ....... Winkelbetrag (Bogenmaß)

function angle (x, y, r, a0, a) {
  newPath();                                               // Neuer Grafikpfad
  ctx.fillStyle = colorAngle;                              // Füllfarbe
  ctx.moveTo(x,y);                                         // Scheitel als Anfangspunkt
  ctx.lineTo(x+r*Math.cos(a0),y-r*Math.sin(a0));           // Linie auf dem ersten Schenkel
  ctx.arc(x,y,r,2*Math.PI-a0,2*Math.PI-a0-a,true);         // Kreisbogen
  ctx.closePath();                                         // Zurück zum Scheitel
  ctx.fill(); ctx.stroke();                                // Kreissektor ausfüllen, Rand zeichnen
  }
  
// Polygon:
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
  
// Hilfsroutine für die Methoden carouselTop und carouselBottom: Ecken eines Rechtecks festlegen
// p ......... Array der Polygonecken
// (u1,v1) ... Erster Punkt oben (Bildschirmkoordinaten)
// (u2,v2) ... Zweiter Punkt oben (Bildschirmkoordinaten)
// dv ........ Länge der senkrechten Seiten (Pixel)

function setPolygon (p, u1, v1, u2, v2, dv) {
  setPoint(p,0,u1,v1);                                     // Erster Punkt oben
  setPoint(p,1,u1,v1+dv);                                  // Punkt darunter
  setPoint(p,2,u2,v2+dv);                                  // Punkt daneben
  setPoint(p,3,u2,v2);                                     // Zweiter Punkt oben
  }
  
// Oberer Teil des Karussells:
// Seiteneffekt poly1, poly2

function carouselTop () {
  var xA = (r0Pix+20)*cosPhi, yA = (r0Pix+20)*sinPhi;      // Bezugspunkt A (Pixel)
  var dv = 15*cosTh;                                       // Senkrechte Rechtecksseite (Pixel) 
  for (var i=0; i<4; i++) {                                // Für die ersten vier Dreiecke ...
    var visible = (Math.cos(phi+(i+0.5)*Math.PI/4) >= 0);  // Flag für Sichtbarkeit
    var xB = (xA-yA)*SIN45, yB = (xA+yA)*SIN45;            // Neuer Bezugspunkt B (A um 45° gedreht)
    var hA = xA*sinTh, hB = xB*sinTh;                      // Weitere Hilfsgrößen
    var uA = XM+yA, vA = YM+hA-dv;                         // Bildschirmkoordinaten von Punkt A
    var uB = XM+yB, vB = YM+hB-dv;                         // Bildschirmkoordinaten von Punkt B
    var uC = XM-yA, vC = YM-hA-dv;                         // Bildschirmkoordinaten von Punkt C (gegenüber von Punkt A)
    var uD = XM-yB, vD = YM-hB-dv;                         // Bildschirmkoordinaten von Punkt D (gegenüber von Punkt B)
    if (visible) setPolygon(poly2,uA,vA,uB,vB,dv);         // Entweder Rechteck unterhalb von AB ...
    else setPolygon(poly2,uC,vC,uD,vD,dv);                 // ... oder gegenüberliegendes Rechteck unterhalb von CD festlegen
    var c1 = color2[i], c2 = color2[(i+4)%8];              // Farben für gegenüberliegende Dreiecke
    setPoint(poly1,1,uA,vA);                               // Dreiecksecke A 
    setPoint(poly1,2,uB,vB);                               // Dreiecksecke B    
    polygon(poly1,c1);                                     // Ausgefülltes Dreieck auf einer Seite
    setPoint(poly1,1,uC,vC);                               // Dreiecksecke C (gegenüber von A) 
    setPoint(poly1,2,uD,vD);                               // Dreiecksecke D (gegenüber von B)
    polygon(poly1,c2);                                     // Ausgefülltes Dreieck auf der anderen Seite
    polygon(poly2,visible?c2:c1);                          // Ausgefülltes Parallelogramm (Rechteck)
    xA = xB; yA = yB;                                      // Bisheriger Punkt B als neuer Punkt A 
    } // Ende for
  }
  
// Unterer Teil des Karussells:
// Seiteneffekt poly3

function carouselBottom () {
  var x = r0Pix*cosPhi/2, y = r0Pix*sinPhi/2;              // Bezugspunkt A (Pixel)
  var dv = 180*cosTh;                                      // Senkrechte Rechtecksseite (Pixel)
  for (var i=0; i<4; i++) {                                // Für die ersten vier Rechtecke ...
    var visible = (Math.cos(phi+(i+0.5)*Math.PI/4) >= 0);  // Flag für Sichtbarkeit
    if (!visible) {x = -x; y = -y;}                        // Gegebenenfalls Bezugspunkt an Drehachse spiegeln
    var uA = XM+y, vA = YM+x*sinTh;                        // Bildschirmkoordinaten von Punkt A
    var h = (x-y)*SIN45;                                   // Hilfsgröße für 45°-Spiegelung 
    y = (x+y)*SIN45; x = h;                                // Neuer Bezugspunkt (Pixel)
    var uB = XM+y, vB = YM+x*sinTh;                        // Bildschirmkoordinaten von Punkt B
    setPolygon(poly3,uA,vA,uB,vB,dv);                      // Rechteck unterhalb von AB festlegen
    polygon(poly3,color1[i%4]);                            // Ausgefülltes Parallelogramm (Rechteck)
    if (!visible) {x = -x; y = -y;}                        // Gegenfalls Spiegelung an Drehachse rückgängig machen
    } // Ende for
  }
 
// Pendel:
// near ... Flag für Vorderseite des Karussells

function pendula (near) {
  var rPix = r*PIX;                                        // Abstand Pendelkörper - Drehachse (Pixel)
  var x = r0Pix*cosPhi;                                    // x-Koordinate der Aufhängung von Pendel 0 (Pixel)
  var y = r0Pix*sinPhi;                                    // y-Koordinate der Aufhängung von Pendel 0 (Pixel) 
  var dv0 = pixF*fG*cosTh;                                 // Pfeillänge Gewichtskraft (Pixel)              
  for (var i=0; i<8; i++) {                                // Für alle 8 Pendel ...
    visible = (near && x>0 || !near && x<=0);              // Flag für Sichtbarkeit 
    if (visible) {                                         // Falls Pendel sichtbar ...
      var w = phi+i*Math.PI/4;                             // Momentaner Positionswinkel des Pendels (Bogenmaß)
      var cos = Math.cos(w), sin = Math.sin(w);            // Trigonometrische Werte
      var u0 = XM+y, v0 = YM+x*sinTh;                      // Bildschirmkoordinaten Aufhängung (Pixel)
      var xx = rPix*cos;                                   // x-Koordinate von Pendelkörper 0 (Pixel)
      var yy = rPix*sin;                                   // y-Koordinate von Pendelkörper 0 (Pixel)
      var u1 = XM+yy, v1 = YM+xx*sinTh-zz*cosTh;           // Bildschirmkoordinaten Pendelkörper (Pixel)
      line(u0,v0,u1,v1);                                   // Schnur	
      circle(u1,v1,rK,colorBall);                          // Pendelkörper	
      if (nr == 2) {                                       // Falls Kraftpfeile gewünscht ...
        arrow(u1,v1,u1,v1+dv0,colorWeight);                // Pfeil für Gewichtskraft
        var du = pixF*fR*sin;                              // Waagrechte Komponente Zentripetalkraft (Pixel)             
        var dv = pixF*fR*cos*sinTh;                        // Senkrechte Komponente Zentripetalkraft (Pixel)
        line(u1,v1+dv0,u1-du,v1-dv);                       // Linie des Kräfteparallelogramms
        line(u1-du,v1-dv,u1-du,v1-dv-dv0);                 // Linie des Kräfteparallelogramms
        arrow(u1,v1,u1-du,v1-dv,colorRadialForce);         // Pfeil für Zentripetalkraft 
        arrow(u1,v1,u1-du,v1-dv-dv0,colorTension);         // Pfeil für Belastung des Fadens
        } // Ende if (nr == 2)      
      } // Ende if (visible)
    var h = (x-y)*SIN45;                                   // Hilfsgröße für 45°-Drehung zum nächsten Pendel 
    y = (x+y)*SIN45; x = h;                                // Koordinaten der nächsten Aufhängung 
    } // Ende for
  if (nr == 2) scaleArrow();                               // Eventuell Vergleichspfeil
  }
  
// Zweidimensionale Skizze:

function sketch () {
  var u0 = 140;                                            // Waagrechte Koordinate der Drehachse (Pixel)
  var x0 = u0+r0Pix;                                       // Waagrechte Koordinate der Aufhängung (Pixel)
  if (alpha > 2*DEG) angle(x0,YM,15,270*DEG,alpha);        // Winkelmarkierung (außer bei sehr kleinen Winkeln)
  line(u0,40,u0,340);                                      // Drehachse 
  line(u0,YM,x0,YM);                                       // Obere waagrechte Linie (Drehachse bis Aufhängung)
  var x1 = u0+r*PIX, y1 = YM-zz;                           // Mittelpunkt Pendelkörper (Pixel)
  line(x0,YM,x0,y1);                                       // Senkrechte Linie (von Aufhängung abwärts) 
  line(x0,YM,x1,y1);                                       // Faden
  line(u0,y1,x1,y1);                                       // Untere waagrechte Linie (Drehachse bis Pendelkörper) 
  circle(x1,y1,rK,colorBall);                              // Pendelkörper  
  var dy = pixF*fG;                                        // Pfeillänge für Gewichtskraft (Pixel) 
  arrow(x1,y1,x1,y1+dy,colorWeight);                       // Pfeil für Gewichtskraft
  var dx = pixF*fR;                                        // Pfeillänge für Zentripetalkraft (Pixel)              
  line(x1,y1+dy,x1-dx,y1);                                 // Linie des Kräfteparallelogramms
  line(x1-dx,y1,x1-dx,y1-dy);                              // Linie des Kräfteparallelogramms
  arrow(x1,y1,x1-dx,y1,colorRadialForce);                  // Pfeil für Zentripetalkraft 
  arrow(x1,y1,x1-dx,y1-dy,colorTension);                   // Pfeil für Belastung des Fadens
  scaleArrow();                                            // Vergleichspfeil
  }
    
// Vergleichspfeil:
  
function scaleArrow () { 
  ctx.strokeStyle = "#000000";                             // Farbe   
  var n;                                                   // Variable für Zehnerpotenz (N)
  if (pixF > 20) n = 1;                                    // Entweder Pfeil für 1 N ...
  else if (pixF > 2) n = 10;                               // ... oder für 10 N ...
  else if (pixF > 0.2) n = 100;                            // ... oder für 100 N ...
  else n = 1000;                                           // ... oder für 1000 N
  var len = n*pixF;                                        // Länge des Pfeils (Pixel) 
  var v = height-30;                                       // Bildschirmkoordinate der Pfeilspitze (Pixel)
  arrow(20,v-len,20,v);                                    // Pfeil (senkrecht nach unten)
  ctx.fillText(""+n+" "+newton,25,v-len/2);                // Beschriftung
  }
      
// Hilfsroutine: Einzelner Zahlenwert
// t ... Erklärender Text
// a ... Zahl
// n ... Geltende Ziffern
// u ... Einheit
// y ... Höhe (Pixel)

function value (t, a, n, u, y) {
  ctx.fillText(t,80,y);                                    // Erklärender Text
  ctx.fillText(ToString(a,n,false)+" "+u,280,y);           // Zahlenwert mit Einheit
  }
      
// Zahlenwerte:

function values () {
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  value(text11,1/tPer,3,hertz,80);                         // Frequenz
  value(text12,omega,3,radPerSecond,100);                  // Winkelgeschwindigkeit
  value(text13,r,3,meter,140);                             // Radius
  value(text14,r*omega,3,meterPerSecond,180);              // Geschwindigkeit
  value(text15,alpha/DEG,3,degree,220);                    // Winkel
  value(text16,fG,3,newton,260);                           // Gewichtskraft
  value(text17,fR,3,newton,280);                           // Zentripetalkraft
  var f = Math.sqrt(fG*fG+fR*fR);                          // Belastung des Fadens (N)
  value(text18,f,3,newton,300);                            // Belastung des Fadens
  }

// Grafikausgabe:
// Seiteneffekt t, t0, phi, cosPhi, sinPhi, poly1, poly2, poly3 
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // ... Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // ... Länge des Zeitintervalls (s)
    t += (slow ? dt/10 : dt);                              // ... Zeitvariable aktualisieren
    t0 = t1;                                               // ... Neuer Bezugszeitpunkt
    }
  phi = Math.PI*(t/tPer);                                  // Momentaner Drehwinkel (Bogenmaß)
  cosPhi = Math.cos(phi); sinPhi = Math.sin(phi);          // Trigonometrische Werte
  ctx.font = FONT;                                         // Zeichensatz
  if (nr <= 2) {
    pendula(false);                                        // Hintere Pendel
    carouselBottom();                                      // Unterer Teil des Karussells  
    pendula(true);                                         // Vordere Pendel           
    carouselTop();                                         // Oberer Teil des Karussells
    }
  else if (nr == 3) sketch();                              // Skizze
  else if (nr == 4) values();                              // Zahlenwerte
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen


