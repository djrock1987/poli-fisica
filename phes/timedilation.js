// Beispiel zur Zeitdilatation
// Java-Applet (15.11.1997) umgewandelt
// 27.07.2015 - 22.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel timedilation_de.js) abgespeichert.

// Farben:

var colorBackground1 = "#000000";                           // Farbe für Hintergrund (oben)
var colorBackground2 = "#ffff00";                           // Farbe für Hintergrund (unten)
var	colorClock1 = "#00ffff";                                // Farbe für Uhr (Kreisfläche)
var colorClock2 = "#0000ff";                                // Farbe für Uhrzeiger
var colorStars = "#ffff00";                                 // Farbe für Sterne
var	colorRocket = "#ff0000";                                // Farbe für Rakete
var colorAlien = "#00ff00";                                 // Farbe für Alien

// Weitere Konstanten:

var dist = 5;                                              // Entfernung (Lichtstunden)
var nStars = 50;                                           // Zahl der Sterne
var v0min = -6;                                            // Niedrigste Geschwindigkeitsstufe
var v0max = 18;                                            // Höchste Geschwindigkeitsstufe
var FONT1 = "normal normal bold 12px sans-serif";          // Zeichensatz

// Attribute:

var buSlower, buFaster;                                    // Obere Schaltknöpfe (Geschwindigkeit)
var bu1, bu2;                                              // Untere Schaltknöpfe (Reset, Start/Pause/Weiter)
var canvas;                                                // Zeichenfläche
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var ctx;                                                   // Grafikkontext
var T;                                                     // Flugzeit (Erd-System, in Stunden)
var timer;                                                 // Timer für Animation
var t;                                                     // Zeit (Erd-System, in Stunden)
var v0;                                                    // Geschwindigkeitsstufe
var v;                                                     // Geschwindigkeit (Bruchteil von c)
var beta;                                                  // Faktor für Zeitdilatation
var polygonR;                                              // Array der Ecken-Koordinaten für Rakete
var x, y, r;                                               // Arrays für Positionen und Größen der Sterne
var on;                                                    // Flag für Bewegung
var rClock, rBig, rSmall;                                  // Radius der Uhren, Längen der Zeiger
var xcl1, ycl1, xcl2, ycl2;                                // Koordinaten-Arrays für Markierungsstriche der Uhren
var xT0, xT1, xT2, xT3;                                    // Positionen für Texte und Zahlenwerte

// Element der Schaltfläche (aus HTML-Datei):
// id ..... ID im HTML-Befehl
// text ... Text (optional)

function getElement (id, text) {
  var e = document.getElementById(id);                     // Element
  if (text) e.innerHTML = text;                            // Text festlegen, falls definiert
  return e;                                                // Rückgabewert
  } 

// Start-Methode:    

function start () {
  buSlower = getElement("buSlower",text01);                // Schaltknopf (Langsamer)
  buFaster = getElement("buFaster",text02);                // Schaltknopf (Schneller)
  bu1 = getElement("buReset",text03);                      // Schaltknopf (Reset)
  bu2 = getElement("buStart",text04[0]);                   // Schaltknopf (Start/Pause/Weiter)
  bu2.state = 0;                                           // Zustand vor dem Start
  getElement("author",author);                             // Autor
  canvas = getElement("cv");                               // Zeichenfläche
  width = canvas.width; height = canvas.height;            // Abmessungen (Pixel)
  ctx = canvas.getContext("2d");                           // Grafikkontext
  initStars();                                             // Sternpositionen und -radien
  polygonR = new Array(9);                                 // Polygon für Rakete
  initClocks();                                            // Vorbereitung der Uhren                        
  on = false;                                              // Animation zunächst abgeschaltet
  t = 0;                                                   // Zeitvariable (in Wirklichkeit h, in Animation s)
  v0 = 7;                                                  // Voreingestellte Geschwindigkeitsstufe (v = 0,8 c)
  calculation();                                           // Berechnungen durchführen
  paint();                                                 // Zeichnen
  
  buReset.onclick = reactionReset;                         // Reaktion auf Schaltknopf Reset
  buStart.onclick = reactionStart;                         // Reaktion auf Schaltknopf Start/Pause/Weiter
  buSlower.onclick = reactionSlower;                       // Reaktion auf Schaltknopf Langsamer
  buFaster.onclick = reactionFaster;                       // Reaktion auf Schaltknopf Schneller
  
  } // Ende der Methode start
  
// Reaktion auf den Schaltknopf Langsamer:
// Seiteneffekt v0, v, beta, T, buSlower, buFaster, t, t0, on, timer, polygonR, xT0, xT1, xT2, xT3 
  
function reactionSlower () {
  v0--; calculation();
  paint();
  }
  
// Reaktion auf den Schaltknopf Schneller:
// Seiteneffekt v0, v, beta, T, buSlower, buFaster, t, t0, on, timer, polygonR, xT0, xT1, xT2, xT3 
  
function reactionFaster () {
  v0++; calculation();
  paint();
  }
  
// Zustandsfestlegung für Schaltknopf Start/Pause/Weiter:
// st ... Gewünschter Zustand (0, 1 oder 2)
// Seiteneffekt bu2.state, Schaltknopftext
  
function setButton2State (st) {
  bu2.state = st;                                          // Zustand speichern
  bu2.innerHTML = text04[st];                              // Text aktualisieren
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
// Seiteneffekt bu2.state, t, on, timer, v, beta, T, buSlower, buFaster, t0, polygonR, xT0, xT1, xT2, xT3 
   
function reactionReset () {
  setButton2State(0);                                      // Zustand des Schaltknopfs Start/Pause/Weiter
  stopAnimation();                                         // Animation stoppen
  t = 0;                                                   // Zeitvariable zurücksetzen
  calculation();                                           // Berechnungen durchführen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf den Schaltknopf Start/Pause/Weiter:
// Seiteneffekt bu2.state, on, timer, t0, buSlower, buFaster

function reactionStart () {
  switchButton2();                                         // Zustand des Schaltknopfs ändern
  if (bu2.state == 1) startAnimation();                    // Entweder Animation starten bzw. fortsetzen ...
  else stopAnimation();                                    // ... oder stoppen
  buSlower.disabled = true;                                // Schaltknopf Langsamer deaktivieren
  buFaster.disabled = true;                                // Schaltknopf Schneller deaktivieren
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

// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag für Nachkommastellen (im Gegensatz zu gültigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }

// Berechnungen zur Vorbereitung des Neustarts:
// Seiteneffekt v, beta, T, buSlower, buFaster
  
function calculation () {
  v = speed(v0);                                           // Neue Geschwindigkeit
  beta = Math.sqrt(1-v*v);                                 // Verlängerungsfaktor
  T = dist/v;                                              // Flugzeit im Erd-System
  buSlower.disabled = (v0 <= v0min);                       // Schaltknopf Langsamer aktivieren/deaktivieren
  buFaster.disabled = (v0 >= v0max);                       // Schaltknopf Schneller aktivieren/deaktivieren
  }
  
// Vorbereitung der Sternhimmeldarstellung:
// Seiteneffekt x, y, r
   
function initStars () {
  x = new Array(nStars); y = new Array(nStars);            // Arrays für Koordinaten
  r = new Array(nStars);                                   // Array für Radien
  for (var i=0; i<nStars; i++) {                           // Für alle Sterne ...
    x[i] = 10+(width-20)*Math.random();                    // x-Koordinate (Pixel)
    y[i] = 10+(height-50-20)*Math.random();                // y-Koordinate (Pixel)
    r[i] = 1+3*Math.random()*Math.random();                // Radius (Pixel)
    }
  }
    
// Berechnung der Geschwindigkeit:
// v0 ... Geschwindigkeitsstufe (v0min bis v0max)
// Rückgabewert: Geschwindigkeit als Bruchteil der Lichtgeschwindigkeit

function speed (v0) {
  if (v0 < v0min) v0 = v0min;                              // Zu niedrige Geschwindigkeitsstufe korrigieren 
  if (v0 > v0max) v0 = v0max;                              // Zu hohe Geschwindigkeitsstufe korrigieren
  var c = (v0%2==0 ? 1 : 0.5);                             // Hilfsgröße
  if (v0 < 0) return c*Math.pow(10,Math.ceil((v0-2)/2));   // Entweder Geschwindigkeit unter 0,1 c ...    
  else if (v0 <= 8) return (v0+1)/10;                      // ... oder Geschwindigkeit von 0,1 c bis 0,9 c ...
  else return 1-c*Math.pow(10,Math.ceil((6-v0)/2));        // ... oder Geschwindigkeit über 0,9 c
  }
  
// Vorbereitung der Uhren:
// Seiteneffekt rClock, rBig, rSmall, xcl1, ycl1, xcl2, ycl2
  
function initClocks () {
  rClock = 20;                                             // Radius Gehäuse (Pixel) 
  var dr = 4;                                              // Länge der Markierungsstriche (Pixel) 
  rBig = rClock-dr;                                        // Länge des großen Zeigers (Pixel) 
  rSmall = rClock-2*dr;                                    // Länge des kleinen Zeigers (Pixel)
  xcl1 = new Array(12); ycl1 = new Array(12);              // Arrays für äußere Enden der Markierungsstriche
  xcl2 = new Array(12); ycl2 = new Array(12);              // Arrays für innere Enden der Markierungsstriche
  for (var i=0; i<12; i++) {                               // Für alle Ziffern ...
    var angle = i*Math.PI/6;                               // Winkel (Vielfaches von 30°) 
    var sin = Math.sin(angle), cos = Math.cos(angle);      // Trigonometrische Werte
    xcl1[i] = rClock*sin; ycl1[i] = -rClock*cos;           // Äußeres Ende des Markierungsstrichs 
    xcl2[i] = rBig*sin; ycl2[i] = -rBig*cos;               // Inneres Ende des Markierungsstrichs
    }
  }
  
// Breite für zwei Zeichenketten untereinander:
// s1 ... Obere Zeichenkette
// s2 ... Untere Zeichenkette
// Rückgabewert: Breite der längeren Zeichenkette (Pixel)
  
function widthText (s1, s2) {
  var l1 = ctx.measureText(s1).width;                      // Breite der oberen Zeichenkette (Pixel)
  var l2 = ctx.measureText(s2).width;                      // Breite der unteren Zeichenkette (Pixel)
  return Math.max(l1,l2);                                  // Maximum als Rückgabewert
  }
  
// Positionen von Text und Zahlenwerten:
// Seiteneffekt xT0, xT1, xT2, xT3
  
function positionsText () {
  var br1 = widthText(text05,text07);                      // Maximale Breite für Flugstrecke und Geschwindigkeit
  var br2 = widthText(text06,"0,999999 c");                // Maximale Breite der zugehörigen Zahlenwerte
  var br3 = widthText(text08,text10);                      // Maximale Breite für Flugzeit in einem gegebenen System
  var br4 = ctx.measureText("50000,00000"+text09).width;   // Maximale Breite der zugehörigen Zahlenwerte
  var leer = (width-br1-br2-br3-br4)/9;                    // Freier Platz zwischen Erläuterung und Zahlenwert
  xT0 = 2*leer;                                            // Position für Flugstrecke und Geschwindigkeit
  xT1 = xT0+br1+leer;                                      // Position für zugehörige Zahlenwerte
  xT2 = xT1+br2+3*leer;                                    // Position für Flugzeit in einem gegebenen System
  xT3 = xT2+br3+leer;                                      // Position für zugehörige Zahlenwerte
  }  
    
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
  }
  
// Linie:
// (x1,y1) ... Anfangspunkt
// (x2,y2) ... Endpunkt
// c ......... Farbe (optional)
// w ......... Liniendicke (optional, Defaultwert 1)

function line (x1, y1, x2, y2, c, w) {
  ctx.beginPath();                                         // Neuer Grafikpfad
  if (c) ctx.strokeStyle = c;                              // Linienfarbe, falls angegeben
  ctx.lineWidth = (w ? w : 1);                             // Liniendicke, falls angegeben
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }

// Kreisscheibe mit Rand:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... Füllfarbe (optional)
// w ....... Liniendicke (optional)
// c2 ...... Randfarbe (optional, Defaultwert schwarz)

function circle (x, y, r, c, w, c2) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  if (c) ctx.fillStyle = c;                                // Füllfarbe, falls definiert
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausfüllen
  if (!w) return;                                          // Abbrechen, falls Liniendicke nicht definiert
  ctx.lineWidth = w;                                       // Liniendicke
  ctx.strokeStyle = (c2 ? c2 : "#000000");                 // Randfarbe  
  ctx.stroke();                                            // Rand zeichnen
  }
  
// Ausgefüllte Ellipse (ohne Rand):
// (x,y) ... Mittelpunkt (Pixel)
// a ....... Waagrechte Halbachse (Pixel)
// b ....... Senkrechte Halbachse (Pixel)
  
function ellipse (x, y, a, b) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.moveTo(x,y-b);                                       // Anfangspunkt (oberer Scheitel)
  ctx.quadraticCurveTo(x+a,y-b,x+a,y);                     // Weiter zum rechten Scheitel
  ctx.quadraticCurveTo(x+a,y+b,x,y+b);                     // Weiter zum unteren Scheitel
  ctx.quadraticCurveTo(x-a,y+b,x-a,y);                     // Weiter zum linken Scheitel
  ctx.quadraticCurveTo(x-a,y-b,x,y-b);                     // Zurück zum oberen Scheitel
  ctx.fill();                                              // Ellipse ausfüllen
  }
  
// Polygon zeichnen:
// p ... Array mit Koordinaten der Ecken
// c ... Füllfarbe

function drawPolygon (p, c) {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.lineWidth = 1;                                       // Liniendicke
  ctx.moveTo(p[0].u,p[0].v);                               // Zur ersten Ecke
  for (var i=1; i<p.length; i++)                           // Für alle weiteren Ecken ... 
    ctx.lineTo(p[i].u,p[i].v);                             // Linie zum Pfad hinzufügen
  ctx.closePath();                                         // Zurück zum Ausgangspunkt
  ctx.fill(); ctx.stroke();                                // Polygon ausfüllen und Rand zeichnen   
  }
  
// Darstellung eines Sterns:
// i ... Index

function star (i) {
  circle(x[i],y[i],r[i],colorStars);                       // Kreisscheibe (ohne Rand)
  }
  
// Darstellung einer Uhr:
// (mx,my) ... Mittelpunkt
// t ......... Zeit

function clock (mx, my, t) {
  circle(mx,my,rClock,colorClock1,1,colorClock2);          // Ziffernblatt
  for (var i=0; i<12; i++)                                 // Für alle Ziffern ...
    line(mx+xcl1[i],my+ycl1[i],mx+xcl2[i],my+ycl2[i],colorClock2); // Markierungsstrich zeichnen
  var angle = t*Math.PI/6;                                 // Winkel für kleinen Zeiger (Bogenmaß) 
  var sin = Math.sin(angle), cos = Math.cos(angle);        // Trigonometrische Werte
  line(mx,my,mx+rSmall*sin,my-rSmall*cos,colorClock2);     // Kleinen Zeiger zeichnen
  angle *= 12;                                             // Winkel für großen Zeiger (Bogenmaß)
  sin = Math.sin(angle); cos = Math.cos(angle);            // Trigonometrische Werte
  line(mx,my,mx+rBig*sin,my-rBig*cos,colorClock2);         // Großen Zeiger zeichnen
  }
  
// Darstellung der Rakete und des kleinen grünen Männchens:
// (x,y) ... Position (bezogen auf Mittelpunkt der Uhr)
// Seiteneffekt polygonR

function rocket (x, y) {
  // Umriss der Rakete:
  polygonR[0] = {u: x+100, v: y};                          // Spitze (rechts)
  polygonR[1] = {u: x+50, v: y-25};                        // Ecke links oben von der Spitze
  polygonR[2] = {u: x-50, v: y-25};                        // Ecke weiter links
  polygonR[3] = {u: x-60, v: y-35};                        // Ecke weiter links oben
  polygonR[4] = {u: x-100, v: y-35};                       // Ecke ganz links oben
  polygonR[5] = {u: x-100, v: y+35};                       // Ecke ganz links unten
  polygonR[6] = {u: x-60, v: y+35};                        // Ecke weiter rechts
  polygonR[7] = {u: x-50, v: y+25};                        // Ecke weiter rechts oben
  polygonR[8] = {u: x+50, v: y+25};                        // Ecke links unten von der Spitze
  drawPolygon(polygonR,colorRocket);                       // Ausgefülltes Polygon
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  line(x-100,y,x-50,y,"#000000",2);                        // Stabilisierungsfläche
  // Kleines grünes Männchen (Alien):
  circle(x+50,y-10,5,colorAlien);                          // Kopf
  ellipse(x+50,y+3,5,8);                                   // Rumpf
  line(x+50,y+5,x+45,y+18,colorAlien,2);                   // Linkes Bein
  line(x+50,y+5,x+55,y+18,colorAlien,2);                   // Rechtes Bein
  line(x+50,y+5,x+40,y,colorAlien,2);                      // Linker Arm
  line(x+50,y+5,x+60,y,colorAlien,2);                      // Rechter Arm
  line(x+50,y+5,x+45,y-20,colorAlien);                     // Linker Fühler, unterer Teil
  line(x+45,y-20,x+42,y-21,colorAlien);                    // Linker Fühler, oberer Teil
  line(x+50,y+5,x+55,y-20,colorAlien);                     // Rechter Fühler, unterer Teil
  line(x+55,y-20,x+58,y-17,colorAlien);                    // Rechter Fühler, oberer Teil
  circle(x+48,y-11,1,"#000000");                           // Linkes Auge
  circle(x+52,y-11,1,"#000000");                           // Rechtes Auge
  }
  
// Grafik-Ausgabe:
// Seiteneffekt t, t0, on, timer, polygonR, xT0, xT1, xT2, xT3

function paint () {
  ctx.fillStyle = colorBackground1;                        // Hintergrundfarbe für Weltall
  ctx.fillRect(0,0,width,height-50);                       // Ausgefülltes Rechteck
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // Länge des Zeitintervalls (s)
    t += dt;                                               // Zeitvariable aktualisieren
    t0 = t1;                                               // Neuer Anfangszeitpunkt
    }
  if (t > T) {                                             // Falls Flug beendet ...
    t = T;                                                 // Zeitvariable korrigieren
    stopAnimation();                                       // Animation stoppen
    }
  for (var i=0; i<nStars; i++) star(i);                    // Sterne zeichnen
  clock(100,200,t);                                        // Feste Uhr links 
  clock(width-100,200,t);                                  // Feste Uhr rechts
  var x = 100+(width-200)*t/T;                             // Waagrechte Koordinate der bewegten Uhr (Pixel)
  rocket(x,100);                                           // Rakete 
  clock(x,100,t*beta);                                     // Bewegte Uhr
  if (t > 0) return;                                       // Falls Zahlenwerte schon ausgegeben, abbrechen
  ctx.fillStyle = colorBackground2;                        // Hintergrundfarbe für Zahlenwerte 
  ctx.fillRect(0,height-50,width,50);                      // Ausgefülltes Rechteck  
  ctx.font = FONT1;                                        // Zeichensatz
  ctx.textAlign = "left";                                  // Linksbündige Ausrichtung
  ctx.fillStyle = "#000000";                               // Schriftfarbe schwarz
  positionsText();                                         // Positionen für Text und Zahlenwerte berechnen
  ctx.fillText(text05,xT0,270);                            // Erläuterung Flugstrecke
  ctx.fillText(text06,xT1,270);                            // Zahlenwert Flugstrecke (5 Lichtstunden)
  ctx.fillStyle = "#ff0000";                               // Schriftfarbe rot
  ctx.fillText(text07,xT0,290);                            // Erläuterung Geschwindigkeit
  ctx.fillText(ToString(v,6,true)+" c",xT1,290);           // Zahlenwert Geschwindigkeit (ausgedrückt durch c)
  ctx.fillStyle = "#000000";                               // Schriftfarbe schwarz
  ctx.fillText(text08,xT2,270);                            // Erläuterung Flugzeit im Erd-System
  ctx.fillText(ToString(T,6,true)+" "+text09,xT3,270);     // Zahlenwert Flugzeit im Erd-System
  ctx.fillText(text10,xT2,290);                            // Erläuterung Flugzeit im Raketen-System
  ctx.fillText(ToString(T*beta,6,true)+" "+text09,xT3,290);// Zahlenwert Flugzeit im Raketen-System
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen


