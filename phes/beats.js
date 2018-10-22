// Schwebungen
// To do: Unterbrochene Linien?

// Java-Applet (21.10.2001) umgewandelt
// 29.12.2015 - 05.01.2016

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel beats_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var color1 = "#ff0000";                                    // Farbe für einfallende Welle
var color2 = "#0000ff";                                    // Farbe für reflektierte Welle
var color3 = "#000000";                                    // Farbe für resultierende stehende Welle
var color4 = "#808080";                                    // Farbe für Einhüllende

// Sonstige Konstanten:

var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz
var U0 = 40;                                               // Waagrechte Bildschirmkoordinate Ursprung
var V01 = 60, V02 =160, V03 = 300;                         // Senkrechte Bildschirmkoordinaten Ursprung   
var AMPL = 30;                                             // Amplitude (Pixel)
var PI2 = 2*Math.PI;                                       // Abkürzung für 2 pi
var PIX_MS = 10;                                           // Umrechnungsfaktor (Pixel pro Millisekunde)

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var bu1, bu2;                                              // Schaltknöpfe (Reset, Start/Pause/Weiter)
var cbSlow;                                                // Optionsfeld (Zeitlupe)
var ip1, ip2;                                              // Eingabefelder (Frequenzen)

var omega1;                                                // Kreisfrequenz der 1. Welle (1/s)
var omega2;                                                // Kreisfrequenz der 2. Welle (1/s)
var omegaMod;                                              // Modulations-Kreisfrequenz (1/s)
var t0;                                                    // Bezugszeitpunkt
var t;                                                     // Zeitvariable (ms -> s)
var on;                                                    // Flag für Bewegung
var slow;                                                  // Flag für Zeitlupe

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
  bu2 = getElement("bu2");                                 // Schaltknopf (Start/Pause/Weiter)
  setButton2State(0);                                      // Anfangszustand (vor dem Start)
  cbSlow = getElement("cbSlow");                           // Optionsfeld (Zeitlupe)
  cbSlow.checked = false;                                  // Zeitlupe zunächst abgeschaltet
  getElement("lbSlow",text03);                             // Erklärender Text (Zeitlupe)
  getElement("lb1",text04);                                // Erklärender Text (Frequenzen)
  getElement("ip1a",text05);                               // Erklärender Text (1. Welle)
  ip1 = getElement("ip1b");                                // Eingabefeld (Frequenz der 1. Welle)
  getElement("ip1c",hertz);                                // Einheit (Frequenz der 1. Welle)
  getElement("ip2a",text06);                               // ErklärenderText (2. Welle)
  ip2 = getElement("ip2b");                                // Eingabefeld (Frequenz der 2. Welle)
  getElement("ip2c",hertz);                                // Einheit (Frequenz der 2. Welle)
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // Übersetzer

  t0 = new Date();                                         // Bezugszeitpunkt
  t = 0;                                                   // Zeitvariable (s) 
  on = slow = false;                                       // Animation zunächst abgeschaltet
  omega1 = PI2*500;                                        // Startwert Kreisfrequenz 1
  omega2 = PI2*550;                                        // Startwert Kreisfrequenz 2
  omegaMod = Math.abs((omega1-omega2)/2);                  // Modulations-Kreisfrequenz
  updateInput();                                           // Eingabefelder aktualisieren  
  paint();                                                 // Zeichnen
  
  bu1.onclick = reactionReset;                             // Reaktion auf Schaltknopf (Reset)
  bu2.onclick = reactionStart;                             // Reaktion auf Schaltknopf (Start/Pause/Weiter)
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld (Zeitlupe)
  ip1.onkeydown = reactionEnter;                           // Reaktion auf Entertaste (Frequenz der 1. Welle)
  ip2.onkeydown = reactionEnter;                           // Reaktion auf Entertaste (Frequenz der 2. Welle)
  
  } // Ende der Methode start
  
// Zustandsfestlegung für Schaltknopf Start/Pause/Weiter:
  
function setButton2State (st) {
  bu2.state = st;                                          // Zustand speichern
  bu2.innerHTML = text02[st];                              // Text aktualisieren
  }
  
// Umschalten des Schaltknopfs Start/Pause/Weiter:
// Seiteneffekt t, bu2.state
  
function switchButton2 () {
  var st = bu2.state;                                      // Bisheriger Zustand (0, 1 oder 2)
  if (st == 0) st = 1;                                     // Falls Ausgangszustand, starten
  else st = 3-st;                                          // Sonst Wechsel zwischen Animation und Pause
  setButton2State(st);                                     // Neuen Zustand speichern, Text ändern
  ip1.disabled = ip2.disabled = (st>0);                    // Eingabefelder aktivieren oder deaktivieren
  }
    
// Reaktion auf Resetknopf:
// Seiteneffekt bu2.state, t, on, slow
   
function reactionReset () {
  setButton2State(0);                                      // Zustand des Schaltknopfs Start/Pause/Weiter
  input();                                                 // Eingabe
  ip1.disabled = ip2.disabled = false;                     // Eingabefelder aktivieren
  t = 0;                                                   // Zeitvariable zurücksetzen
  on = false;                                              // Animation abgeschaltet
  slow = cbSlow.checked;                                   // Flag für Zeitlupe
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf den Schaltknopf Start/Pause/Weiter:
// Seiteneffekt bu2.state, on, slow, timer, t0

function reactionStart () {
  switchButton2();                                         // Zustand des Schaltknopfs ändern
  input();                                                 // Eingabe
  slow = cbSlow.checked;                                   // Flag für Zeitlupe
  if (bu2.state == 1) startAnimation();                    // Animation entweder starten bzw. fortsetzen ...
  else stopAnimation();                                    // ... oder unterbrechen
  }
  
// Reaktion auf Optionsfeld Zeitlupe:
// Seiteneffekt slow

function reactionSlow () {
  slow = cbSlow.checked;                                   // Flag setzen
  }
  
// Reaktion auf Tastendruck (nur auf Enter-Taste):
// Seiteneffekt omega1, omega2, omegaMod
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    input();                                               // ... Daten übernehmen und rechnen                          
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
// Seiteneffekt omega1, omega2, omegaMod

function input () {
  omega1 = PI2*inputNumber(ip1,0,true,100,1000);           // Kreisfrequenz der 1. Welle (1/s)
  omega2 = PI2*inputNumber(ip2,0,true,100,1000);           // Kreisfrequenz der 2. Welle (1/s)
  omegaMod = Math.abs((omega1-omega2)/2);                  // Modulations-Kreisfrequenz (1/s)
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ip1.value = ToString(omega1/PI2,0,true);                 // Eingabefeld für 1. Frequenz (Hz)
  ip2.value = ToString(omega2/PI2,0,true);                 // Eingabefeld für 2. Frequenz (Hz)
  }
   
//-------------------------------------------------------------------------------------------------

// Neuer Pfad mit Standardwerten:

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
  
// Kreisscheibe mit schwarzem Rand:
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
  
// Koordinatensystem (Achsen und Beschriftung der Zeitachse):
// (x,y) ... Bildschirmkoordinaten des Ursprungs (Pixel)
// dy....... Halbe Länge der senkrechten Achse (Pixel)  

function cosy (x, y, dy) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  arrow(x-10,y,x+420,y);                                   // Waagrechte Achse
  arrow(x,y+dy,x,y-dy);                                    // Senkrechte Achse
  ctx.textAlign = "center";                                // Textausrichtung
  ctx.fillText(symbolTime,x+415,y+15);                     // Beschriftung der waagrechten Achse (Zeit t)
  }
  
// Hilfsroutine: Text mit Index (rechtsbündig)
// s ....... Zeichenkette ('_' zwischen normalem Text und Index)
// (x,y) ... Position (Pixel)

function writeTextIndex (s, x, y) {
  ctx.textAlign = "right";                                 // Textausrichtung
  var i = s.indexOf("_");                                  // Position des Unterstrichs oder -1
  var s1 = (i>=0 ? s.substring(0,i) : s);                  // Zeichenkette für normalen Text
  var s2 = (i>=0 ? s.substring(i+1) : "");                 // Zeichenkette für Index
  var w2 = ctx.measureText(s2).width;                      // Breite des Index (Pixel)
  ctx.fillText(s1,x-w2,y);                                 // Normaler Text
  ctx.fillText(s2,x,y+5);                                  // Index
  }

// Alle drei Koordinatensysteme zeichnen:
  
function coordSystems () {
  cosy(U0,V01,40);                                         // Oberes Koordinatensystem
  cosy(U0,V02,40);                                         // Mittleres Koordinatensystem
  cosy(U0,V03,80);                                         // Unteres Koordinatensystem
  writeTextIndex(symbolElongation1,U0-5,V01-30);           // Beschriftung der senkrechten Achse (y_1)
  writeTextIndex(symbolElongation2,U0-5,V02-30);           // Beschriftung der senkrechten Achse (y_2)
  writeTextIndex(symbolElongation,U0-5,V03-70);            // Beschriftung der senkrechten Achse (y)
  }
  
//------------------------------------------------>
  
// Alle drei Graphen zeichnen:
  
function curves () {
  var t0 = (t < 200/PIX_MS ? 0 : t-200/PIX_MS);            // Zeitpunkt entsprechend senkrechter Achse (ms)   
  var u0 = U0;                                             // Waagrechte Bildschirmkoordinate (Pixel)                                          
  var tS = t0/1000;                                        // Zeitpunkt entsprechend senkrechter Achse (s)                                       
  var e1 = AMPL*Math.sin(omega1*tS);                       // Elongation für 1. Welle (Pixel)
  var e2 = AMPL*Math.sin(omega2*tS);                       // Elongation für 2. Welle (Pixel)
  var ee = 2*AMPL*Math.cos(omegaMod*tS);                   // Elongation für Einhüllende (Pixel)
  var v01 = V01-e1;                                        // Senkrechte Bildschirmkoordinate 1. Welle (Pixel)
  var v02 = V02-e2;                                        // Senkrechte Bildschirmkoordinate 2. Welle (Pixel)
  var v03 = V03-e1-e2;                                     // Senkrechte Bildschirmkoordinate Gesamtwelle (Pixel)
  var v04 = V03-ee, v05 = V03+ee;                          // Senkrechte Bildschirmkoordinate Einhüllende (Pixel)
  while (u0 < U0+400) {                                    // Solange rechter Rand noch nicht erreicht ...            
    var u1 = u0+1;                                         // Waagrechte Bildschirmkoordinate (Pixel)
    tS = (t0+(u1-U0)/PIX_MS)/1000;                         // Zeitpunkt entsprechend senkrechter Achse (s)
    e1 = AMPL*Math.sin(omega1*tS);                         // Elongation für 1. Welle (Pixel)
    var v11 = V01-e1;                                      // Senkrechte Bildschirmkoordinate 1. Welle (Pixel) 
    line(u0,v01,u1,v11,color1);                            // Linie für 1. Welle
    e2 = AMPL*Math.sin(omega2*tS);                         // Elongation für 2. Welle (Pixel)
    var v12 = V02-e2;                                      // Senkrechte Bildschirmkoordinate 2. Welle (Pixel)
    line(u0,v02,u1,v12,color2);                            // Linie für 2. Welle
    var v13 = V03-e1-e2;                                   // Senkrechte Bildschirmkoordinate Gesamtwelle (Pixel)
    line(u0,v03,u1,v13,color3);                            // Linie für Gesamtwelle
    ee = 2*AMPL*Math.cos(omegaMod*tS);                     // Elongation für Gesamtwelle (Pixel)
    var v14 = V03-ee, v15 = V03+ee;                        // Senkrechte Bildschirmkoordinaten Einhüllende (Pixel)
    line(u0,v04,u1,v14,color4);                            // Linie für 1. Einhüllende
    line(u0,v05,u1,v15,color4);                            // Linie für 2. Einhüllende
    u0 = u1; v01 = v11; v02 = v12; v03 = v13;              // Neue Koordinaten als alte Koordinaten
    v04 = v14; v05 = v15;                                  // Neue Koordinaten als alte Koordinaten
    } // Ende while
  }
  
// Markierungen für aktuelle Werte:
  
function marks () {
  var t0 = (t < 200/PIX_MS ? 0 : t-200/PIX_MS);            // Zeitpunkt entsprechend senkrechter Achse (ms)
  var u = U0+(t-t0)*PIX_MS;                                // Waagrechte Bildschirmkoordinate (Pixel)
  var tS = t/1000;                                         // Zeitvariable in Sekunden umrechnen
  var e1 = AMPL*Math.sin(omega1*tS);                       // Elongation für 1. Welle (Pixel)
  var e2 = AMPL*Math.sin(omega2*tS);                       // Elongation für 2. Welle (Pixel)
  var v1 = V01-e1;                                         // Senkrechte Bildschirmkoordinate 1. Welle (Pixel)
  var v2 = V02-e2;                                         // Senkrechte Bildschirmkoordinate 2. Welle (Pixel)
  var v3 = V03-e1-e2;                                      // Senkrechte Bildschirmkoordinate Gesamtwelle (Pixel)
  circle(u,v1,2.5,color1);                                 // Markierung für 1. Welle
  circle(u,v2,2.5,color2);                                 // Markierung für 2. Welle
  circle(u,v3,2.5,color3);                                 // Markierung für Gesamtwelle
  }

// Grafikausgabe:
// Seiteneffekt t, t0
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // Länge des Zeitintervalls (s)
    if (slow) dt /= 10;                                    // Falls Zeitlupe, Zeitintervall durch 10 dividieren
    t += dt;                                               // Zeitvariable aktualisieren
    t0 = t1;                                               // Neuer Bezugszeitpunkt
    }
  ctx.font = FONT;                                         // Zeichensatz
  coordSystems();                                          // Koordinatensysteme
  curves();                                                // Kurven
  marks();                                                 // Markierungen für aktuelle Werte
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen

