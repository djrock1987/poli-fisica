// Zerfallsgesetz der Radioaktivität
// Java-Applet (16.07.1998) umgewandelt
// 21.12.2014 - 23.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// ****************************************************************************

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel lawdecay_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorActive = "#ff0000";                               // Farbe für unzerfallene Kerne
var colorDecayed = "#000000";                              // Farbe für zerfallene Kerne
var colorTime = "#0000ff";                                 // Farbe für Zeit
var colorDiagram = "#0000ff";                              // Farbe für Diagramm

// Konstanten:

var FONT1 = "normal normal bold 12px sans-serif";          // Zeichensatz
var THL = 20;                                              // Halbwertszeit (s)
var N0 = 1000;                                             // Gesamtzahl der Atomkerne
var XD = 50, YD = 370;                                     // Ursprung des Koordinatensystems (Pixel)
var PIXT = 40;                                             // Umrechnungsfaktor (Pixel pro Halbwertszeit)
var PIXN = 100;                                            // Umrechnungsfaktor (Pixel pro 100 %)

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var bu1, bu2, bu3;                                         // Schaltknöpfe
var on;                                                    // Flag für Animation
var t0;                                                    // Anfangszeitpunkt
var timer;                                                 // Timer für Animation
var t;                                                     // Zeitvariable
var timeDecay;                                             // Array der Zerfallszeiten (s)
var decayed;                                               // Array von Flags für Zerfall
var number;                                                // Zahl der nicht zerfallenen Kerne
var xyDiagram;                                             // Array von Positionen im Diagramm (Pixel)

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
  bu1 = getElement("bu1",text01);                          // Schaltknopf (Reset)
  bu2 = getElement("bu2");                                 // Schaltknopf (Start)
  setButton2State(0);                                      // Zustand vor Start
  bu3 = getElement("bu3",text03);                          // Schaltknopf (Diagramm)
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // Übersetzer
  
  reset();                                                 // Ausgangssituation
  paint0();                                                // Zeichnung beginnen
  writeValues();                                           // Aktuelle Werte zu Beginn
  bu1.onclick = reactionReset;                             // Reaktion auf Schaltknopf (Reset)
  bu2.onclick = reactionStart;                             // Reaktion auf Schaltknopf (Start/Pause/Weiter) 
  bu3.onclick = reactionDiagram;                           // Reaktion auf Schaltknopf (Diagramm) 
  }
  
// Zustandsfestlegung für Schaltknopf Start/Pause/Weiter:
// st ... Gewünschter Zustand (0, 1 oder 2)
// Seiteneffekt bu2.state, Schaltknopftext
  
function setButton2State (st) {
  bu2.state = st;                                          // Zustand speichern
  bu2.innerHTML = text02[st];                              // Text aktualisieren
  }
  
// Umschalten des Schaltknopfs Start/Pause/Weiter:
// Seiteneffekt bu2.state, Schaltknopftext
  
function switchButton2 () {
  var st = bu2.state;                                      // Momentaner Zustand
  if (st == 0) st = 1;                                     // Falls Ausgangszustand, starten
  else st = 3-st;                                          // Wechsel zwischen Animation und Unterbrechung
  setButton2State(st);                                     // Neuen Zustand speichern, Text ändern
  }
  
// Reaktion auf Resetknopf:
// Seiteneffekt bu2.state, ??? t, on, timer
   
function reactionReset () {
  setButton2State(0);                                      // Zustand des Schaltknopfs Start/Pause/Weiter
  stopAnimation();                                         // Animation stoppen
  reset();                                                 // Anfangszustand wiederherstellen
  paint0();                                                // Neue Zeichnung beginnen
  writeValues();                                           // Aktuelle Werte zu Beginn
  }
  
// Reaktion auf den Schaltknopf Start/Pause/Weiter:
// Seiteneffekt bu2.state, ??? on, timer, t0

function reactionStart () {
  switchButton2();                                         // Zustand des Schaltknopfs ändern
  if (bu2.state == 1) startAnimation();                    // Entweder Animation starten bzw. fortsetzen ...
  else stopAnimation();                                    // ... oder stoppen
  if (bu2.state == 2) savePoint();                         // Falls Pause, Koordinaten speichern
  paint();                                                 // Zeichnung aktualisieren
  }
  
// Reaktion auf den Schaltknopf Diagramm:

function reactionDiagram () {
  diagram();                                               // Diagramm-Kurve einzeichnen
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

// Messwertpaar in Diagramm:
// (x,y) ... Ursprung (Pixel)
// Seiteneffekt xyDiagram; Messwerte durch globale Variable t, number gegeben

function savePoint () {
  if (t > 150) return;                                     // Abbruch, falls Punkt außerhalb des Diagramms
  var n = xyDiagram.length;                                // Bisherige Zahl der Messwertpaare 
  xyDiagram[n] = {                                         // Neues Messwertpaar
    x: Math.round(XD+t/THL*PIXT),                          // x-Koordinate (Pixel) 
    y: Math.round(YD-number/N0*PIXN)                       // y-Koordinate (Pixel)
    };   
  }

// Ausgangssituation:
// Seiteneffekt on, t, timeDecay, decayed, number, xyDiagram

function reset () {
  var randNr, f = -THL/Math.LN2;                           // Faktor entsprechend Halbwertszeit
  on = false; t = 0;                                       // Flag für Animation und Zeitvariable zurücksetzen
  timeDecay = new Array(N0);                               // Neues Array für Zerfallszeiten
  decayed = new Array(N0);                                 // Neues Array für Zerfall-Flags
  number = N0;                                             // Anfangswert für Zahl der unzerfallenen Kerne
  xyDiagram = new Array(0);                                // Neues Array für Messwertpaare
  savePoint();                                             // Messwertpaar für t = 0 (Anfangszustand)
  for (var i=0; i<N0; i++) {                               // Für alle Kerne ...
    do randNr = Math.random();                             // Zufallszahl  
      while (randNr == 0 || randNr == 1);                  // 0 und 1 verhindern
    timeDecay[i] = f*Math.log(randNr);                     // Zerfallszeit (s)
    decayed[i] = false;
    }
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
  
// Kreisscheibe zeichnen:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... Füllfarbe (optional)

function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                // Füllfarbe
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausfüllen
  }
  
// Hilfsroutine: Prozentangabe (rechtsbündig):
// s ... Zahl der Prozente (Zeichenkette)
// x ... x-Koordinate der senkrechten Achse (Pixel)
// y ... y-Koordinate (Pixel)
  	
function writePercent (s, x, y) {
  s = s.replace(".",decimalSeparator);                     // Eventuell Punkt durch Komma ersetzen
  write(s,x-17,y,"right");                                 // Zahlenwert (rechtsbündig)
  write("%",x-15,y,"left");                                // Prozentsymbol (linksbündig)
  }
  
// Hilfsroutine: Ausgabe einer Zeichenkette mit Index

function writeTextIndex (s, x, y) {
  var s1 = s;                                              // Gesamte Zeichenkette  
  var i = s1.indexOf("_");                                 // Position des Unterstrichs (für eventuellen Index)
  if (i >= 0) s1 = s.substring(0,i);                       // Teil-Zeichenkette vor dem Index
  var s2 = "";                                             // Leere Zeichenkette 
  if (i >= 0) s2 = s.substring(i+1);                       // Teil-Zeichenkette für Index
  var l1 = ctx.measureText(s1).width;                      // Länge der Zeichenkette vor dem Index (Pixel)
  write(s1,x,y,"left");                                    // Zeichenkette vor dem Index ausgeben
  if (i >= 0) write(s2,x+l1,y+5);                          // Index ausgeben
  }
  
// Koordinatensystem zeichnen:
  
function cosy () {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.textAlign = "center";                                // Textausrichtung zentriert
  arrow(XD-10,YD,XD+320,YD);                               // Waagrechte Achse 
  ctx.fillText(symbolTime,XD+315,YD+15);                   // Waagrechte Achse beschriften (t)     
  for (var i=1; i<=7; i++) {                               // Für alle Ticks der waagrechten Achse ...
    var xT = XD+i*PIXT;                                    // x-Koordinate (Pixel)
    line(xT,YD+3,xT,YD-3);                                 // Tick zeichnen
    var s = (i>1 ? ""+i+"T" : "T");                        // Zeichenkette (Vielfaches von T) 
    ctx.fillText(s,XD+i*PIXT,YD+15);                       // Tick beschriften
    }
  arrow(XD,YD+10,XD,YD-125);                               // Senkrechte Achse
  for (var i=0; i<=4; i++) {                               // Für alle Ticks der senkrechten Achse ...
    var y0 = YD-PIXN*Math.pow(2,-i);                       // Senkrechte Koordinate (Pixel)
    line(XD-3,y0,XD+3,y0);                                 // Tick zeichnen
    }
  writeTextIndex(symbolQuotient,XD-30,YD-115);             // Senkrechte Achse beschriften (N/N_0)
  writePercent("100",XD,YD-95);                            // Beschriftung 100 %
  writePercent("50",XD,YD-45);                             // Beschriftung 50 %
  writePercent("25",XD,YD-20);                             // Beschriftung 25 %
  writePercent("12.5",XD,YD-8);                            // Beschriftung 12,5 %
  }
  
// Atomkern zeichnen:
// i ... Index (0 bis N0-1)
// c ... Farbe

function drawNucleus (i, c) {
  var x = 50+8*(i%40), y = 30+8*Math.floor(i/40);          // Koordinaten des Mittelpunkts (Pixel)
  circle(x,y,2.5,c);                                       // Kreis zeichnen
  }
  
// Zeichnung beginnen:

function paint0 () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen 
  ctx.font = FONT1;                                        // Zeichensatz
  for (var i=0; i<N0; i++) drawNucleus(i,colorActive);     // Atomkerne
  cosy();                                                  // Koordinatensystem
  }
  
// Diagramm (Exponentialfunktion):

function diagram () {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.strokeStyle = colorDiagram;                          // Linienfarbe
  var xx = XD, yy = YD-PIXN;                               // Koordinaten des Anfangspunkts (t = 0, N/N0 = 1)
  ctx.moveTo(xx,yy);                                       // Anfangspunkt des Polygonzugs festlegen
  while (xx < XD+300) {                                    // Solange rechtes Ende noch nicht erreicht ...
    xx++;                                                  // Waagrechte Koordinate erhöhen
    yy = YD-PIXN*Math.exp(-(xx-XD)/PIXT*Math.LN2);         // Senkrechte Koordinate berechnen
    ctx.lineTo(xx,yy);                                     // Linie zum Polygonzug hinzufügen
    }  
  ctx.stroke();                                            // Polygonzug zeichnen (als Näherung für die Kurve)
  }

// Text ausgeben:
// s ....... Zeichenkette
// (x,y) ... Position (Pixel) 
// a ....... Ausrichtung (optional, "left", "center" oder "right")
  
function write (s, x, y, a) {
  if (a) ctx.textAlign = a;                                // Neue Textausrichtung, falls definiert
  ctx.fillText(s,x,y);                                     // Text ausgeben
  }
  
// Hilfsroutine: Singular/Plural usw. von Kern  
    
function textNuclei (n) {
  if (n == 0) return text07[0];                            // Anzahl gleich 0
  else if (n == 1) return text07[1];                       // Anzahl gleich 1 (Singular)
  else if (n == 2) return text07[2];                       // Anzahl gleich 2 (eventuell Dual)
  else return text07[3];                                   // Anzahl größer als 2 (Plural)
  }
  
// Aktuelle Werte ausgeben:

function writeValues () {
  var x0 = 100, y0 = 250;                                  // Linke obere Ecke (Pixel)
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(x0,y0,250,55);                              // Rechteckigen Bereich löschen
  var x1 = x0+180, x2 = x0+190;                            // Positionen waagrecht (Pixel)
  var y1 = y0+10, y2 = y0+30, y3 = y0+50;                  // Positionen senkrecht (Pixel)
  ctx.fillStyle = colorTime;                               // Farbe für Zeit 
  write(text04,x0,y1,"left");                              // Text (Zeit) 
  var s = Number(t/THL).toFixed(2);                        // Zeit (als Vielfaches der Halbwertszeit) 
  s = s.replace(".",decimalSeparator);                     // Eventuell Punkt durch Komma ersetzen
  write(s,x1,y1,"right");                                  // Zahlenwert für Zeit 
  write(symbolHalfLife,x2,y1,"left");                      // Symbol für Halbwertszeit
  ctx.fillStyle = colorActive;                             // Farbe für unzerfallene Kerne
  write(text05,x0,y2);                                     // Text (unzerfallene Kerne)
  write(""+number,x1,y2,"right");                          // Anzahl der unzerfallenen Kerne
  write(textNuclei(number),x2,y2,"left");                  // Text (Kern[e])
  ctx.fillStyle = colorDecayed;                            // Farbe für zerfallene Kerne
  write(text06,x0,y3);                                     // Text (zerfallene Kerne)
  var nd = N0-number;                                      // Anzahl der zerfallenen Kerne
  write(""+nd,x1,y3,"right");                              // Anzahl der zerfallenen Kerne ausgeben
  write(textNuclei(nd),x2,y3,"left");                      // Text (Kern[e])
  }
  
// Zeichnung aktualisieren:

function paint () { 
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // ... Aktuelle Zeit
    t += (t1-t0)/1000;                                     // ... Zeitvariable aktualisieren
    t0 = t1;                                               // ... Neuer Anfangszeitpunkt
    }
  for (var i=0; i<N0; i++) {                               // Für alle Atomkerne ...
    if (decayed[i]) continue;                              // Falls Kern schon früher zerfallen, weiterzählen
    if (t < timeDecay[i]) continue;                        // Falls Zerfallszeit noch nicht erreicht, weiterzählen
    decayed[i] = true;                                     // Flag für erfolgten Zerfall setzen
    number--;                                              // Anzahl der unzerfallenen Kerne aktualisieren
    drawNucleus(i,colorDecayed);                           // Farbänderung für zerfallenen Kern
    } 
  writeValues();                                           // Aktuelle Werte ausgeben
  ctx.fillStyle = colorDiagram;                            // Farbe für Diagramm
  for (var i=0; i<xyDiagram.length; i++) {                 // Für alle gespeicherten Messwertpaare ...
    var p = xyDiagram[i];                                  // Objekt mit x- und y-Koordinate
    ctx.fillRect(p.x-2,p.y-2,4,4);                         // Rechteck zeichnen
    }
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen




