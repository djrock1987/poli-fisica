// Schiefer Wurf
// Java-Applet (13.09.2000) umgewandelt
// 25.12.2014 - 11.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel projectile_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorGround = "#ffc040";                               // Farbe für Untergrund
var colorPosition = "#ff0000";                             // Farbe für Position
var colorVelocity = "#ff00ff";                             // Farbe für Geschwindigkeit
var colorAcceleration = "#0000ff";                         // Farbe für Beschleunigung
var colorForce = "#008020";                                // Farbe für Kraft
var colorAngle = "#00ffff";                                // Farbe für Winkelmarkierung
colorClock1 = "#808080";                                   // Farbe für Gehäuse der Digitaluhr
colorClock2 = "#000000";                                   // Farbe für Anzeige der Digitaluhr
colorClock3 = "#ff0000";                                   // Farbe für Ziffern der Digitaluhr

// Sonstige Konstanten:

var PI2 = 2*Math.PI;                                       // Abkürzung für 2 pi
var DEG = Math.PI/180;                                     // 1 Grad (Bogenmaß)
var FONT1 = "normal normal bold 12px sans-serif";          // Normaler Zeichensatz
var FONT2 = "normal normal bold 16px monospace";           // Zeichensatz für Digitaluhr
var xU = 50, yU = 270;                                     // Position des Ursprungs (Pixel)

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var bu1, bu2;                                              // Schaltknöpfe (Zurück, Start)
var cbSlow;                                                // Optionsfeld (Zeitlupe)
var ipH, ipV, ipW, ipM, ipG;                               // Eingabefelder
var rbY, rbV, rbA, rbF, rbE;                               // Radiobuttons
var on;                                                    // Flag für Bewegung
var slow;                                                  // Flag für Zeitlupe
var t0;                                                    // Anfangszeitpunkt
var t;                                                     // Aktuelle Zeit (s)
var timer;                                                 // Timer für Animation

var g;                                                     // Fallbeschleunigung (m/s²)
var h0;                                                    // Ausgangshöhe (m)
var v0, v0x, v0y;                                          // Anfangsgeschwindigkeit (Betrag und Komponenten, m/s)
var alpha0;                                                // Wurfwinkel (Bogenmaß)
var m;                                                     // Masse (kg)
var x, y;                                                  // Koordinaten (m)
var x0, y0;                                                // Koordinaten (Pixel)
var pix;                                                   // Umrechnungsfaktor (Pixel pro Meter)
var tW;                                                    // Flugdauer (s)
var w;                                                     // Wurfweite (m)
var hMax;                                                  // Maximale Höhe (m)
var vyMax;                                                 // Maximum von vy (Betrag, m/s)
var e;                                                     // Gesamtenergie (J)
var nrSize;                                                // Dargestellte physikalische Größe
var pos1, pos2;                                            // Textpositionen (je nach Sprache)   

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
  bu2 = getElement("bu2",text02[0]);                       // Startknopf
  bu2.state = 0;                                           // Zunächst Zustand vor dem Start
  cbSlow = getElement("cbSlow");                           // Optionsfeld Zeitlupe
  cbSlow.checked = false;                                  // Zeitlupe zunächst abgeschaltet
  getElement("lbSlow",text03);                             // Erklärender Text (Zeitlupe)
  getElement("ipHa",text04);                               // Erklärender Text (Ausgangshöhe)
  ipH = getElement("ipHb");                                // Eingabefeld (Ausgangshöhe)
  getElement("ipHc",meter);                                // Einheit (Ausgangshöhe)
  getElement("ipVa",text05);                               // Erkärender Text (Anfangsgeschwindigkeit)
  ipV = getElement("ipVb");                                // Eingabefeld (Anfangsgeschwindigkeit)
  getElement("ipVc",meterPerSecond);                       // Einheit (Anfangsgeschwindigkeit)
  getElement("ipWa",text06);                               // Erklärender Text (Winkel)
  ipW = getElement("ipWb");                                // Eingabefeld (Winkel)
  getElement("ipWc",degree);                               // Einheit (Winkel)
  getElement("ipMa",text07);                               // Erklärender Text (Masse)
  ipM = getElement("ipMb");                                // Eingabefeld (Masse)
  getElement("ipMc",kilogram);                             // Einheit (Masse)
  getElement("ipGa",text08);                               // Erklärender Text (Fallbeschleunigung)
  ipG = getElement("ipGb");                                // Eingabefeld (Fallbeschleunigung)
  getElement("ipGc",meterPerSecond2);                      // Einheit (Fallbeschleunigung)
  rbY = getElement("rbY");                                 // Radiobutton (Position)
  getElement("lbY",text09);                                // Erklärender Text (Position)
  rbV = getElement("rbV");                                 // Radiobutton (Geschwindigkeit)
  getElement("lbV",text10);                                // Erklärender Text (Geschwindigkeit)
  rbA = getElement("rbA");                                 // Radiobutton (Beschleunigung)
  getElement("lbA",text11);                                // Erklärender Text (Beschleunigung)
  rbF = getElement("rbF");                                 // Radiobutton (Kraft)
  getElement("lbF",text12);                                // Erklärender Text (Kraft)
  rbE = getElement("rbE");                                 // Radiobutton (Energie)
  getElement("lbE",text13);                                // Erklärender Text (Energie)
  rbY.checked = true; nrSize = 1;                          // Zunächst Position ausgewählt
  getElement("author",author);                             // Autor (eventuell Übersetzer)
    
  on = slow = false;                                       // Animation und Zeitlupe zunächst abgeschaltet
  h0 = 5; v0 = 5; alpha0 = 45*DEG; m = 1; g = 9.81;        // Anfangswerte der Eingabefelder
  updateInput();                                           // Eingabefelder aktualisieren 
  enableInput(true);                                       // Eingabe zunächst möglich
  t = 0;                                                   // Zeitvariable (s)  
  calculation();                                           // Berechnungen (Seiteneffekt!)
  calcPos12();                                             // Berechnung von pos1 und pos2
  paint();                                                 // Zeichnen    
  bu1.onclick = reactionReset;                             // Reaktion auf Schaltknopf (Zurück)
  bu2.onclick = reactionStart;                             // Reaktion auf Schaltknopf (Start/Pause/Weiter)
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld (Zeitlupe)
  ipH.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabefeld Ausgangshöhe)
  ipV.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabefeld Geschwindigkeit)
  ipW.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabefeld Winkel)
  ipM.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabefeld Masse)
  ipG.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabefeld Fallbeschleunigung)
  rbY.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Position)
  rbV.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Geschwindigkeit)
  rbA.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Beschleunigung)
  rbF.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Kraft)
  rbE.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Energie)

  } // Ende der Methode start
  
// Zustandsfestlegung für Schaltknopf Start/Pause/Weiter:
  
function setButton2State (st) {
  bu2.state = st;                                          // Zustand speichern
  bu2.innerHTML = text02[st];                              // Text aktualisieren
  }
  
// Umschalten des Schaltknopfs Start/Pause/Weiter:
  
function switchButton2 () {
  var st = bu2.state;                                      // Momentaner Zustand
  if (st == 0) st = 1;                                     // Falls Ausgangszustand, starten
  else st = 3-st;                                          // Wechsel zwischen Animation und Unterbrechung
  setButton2State(st);                                     // Neuen Zustand speichern, Text ändern
  }
  
// Aktivierung bzw. Deaktivierung der Eingabefelder:
// p ... Flag für mögliche Eingabe

function enableInput (p) {
  ipH.readOnly = !p;
  ipV.readOnly = !p;
  ipW.readOnly = !p;
  ipM.readOnly = !p;
  ipG.readOnly = !p; 
  }
  
// Reaktion auf Resetknopf:
   
function reactionReset () {
  setButton2State(0);                                      // Zustand des Schaltknopfs Start/Pause/Weiter
  enableInput(true);                                       // Eingabefelder aktivieren
  stopAnimation();                                         // Animation stoppen
  t = 0;                                                   // Zeitvariable zurücksetzen
  reaction();                                              // Eingegebene Werte übernehmen und rechnen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf den Schaltknopf Start:

function reactionStart () {
  switchButton2();                                         // Zustand des Schaltknopfs ändern
  enableInput(false);                                      // Eingabefelder deaktivieren
  if (bu2.state == 1) startAnimation();                    // Entweder Animation starten bzw. fortsetzen ...
  else stopAnimation();                                    // ... oder stoppen
  reaction();                                              // Eingegebene Werte übernehmen und rechnen
  }
  
// Reaktion auf Optionsfeld Zeitlupe:
// Seiteneffekt slow

function reactionSlow () {
  slow = cbSlow.checked;                                   // Flag setzen
  }
  
// Hilfsroutine: Eingabe übernehmen und rechnen
// Seiteneffekt h0, v0, alpha0, m, g, v0x, v0y, tW, w, hMax, vyMax, e, pix

function reaction () {
  input();                                                 // Eingegebene Werte übernehmen (eventuell korrigiert)
  calculation();                                           // Berechnungen
  }
  
// Reaktion auf Tastendruck (nur auf Enter-Taste):
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten übernehmen und rechnen                          
  paint();                                                 // Neu zeichnen
  }

// Reaktion auf Radiobutton:

function reactionRadioButton () {
  if (rbY.checked) nrSize = 1;                             // Entweder Position ...
  else if (rbV.checked) nrSize = 2;                        // ... oder Geschwindigkeit ...
  else if (rbA.checked) nrSize = 3;                        // ... oder Beschleunigung ...
  else if (rbF.checked) nrSize = 4;                        // ... oder Kraft ...
  else nrSize = 5;                                         // ... oder Energie ausgewählt
  if (!on) paint();                                        // Falls Animation nicht läuft, neu zeichnen
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

// Berechnung von Textpositionen:
// Seiteneffekt pos1, pos2

function calcPos12 () {
  ctx.font = FONT1;                                        // Normaler Zeichensatz
  pos1 = ctx.measureText(text18).width;                    // Länge von "Wurfweite" (Pixel) 
  pos1 = Math.max(pos1,ctx.measureText(text19).width);     // Länge von "Maximalhöhe", falls größer
  pos1 = Math.max(pos1,ctx.measureText(text20).width);     // Länge von "Wurfdauer", falls größer
  pos1 += 260;                                             // Textposition
  pos2 = ctx.measureText(text26).width;                    // Länge von "Kinetische Energie" (Pixel)
  pos2 = Math.max(pos2,ctx.measureText(text27).width);     // Länge von "Potentielle Energie", falls größer
  pos2 = Math.max(pos2,ctx.measureText(text28).width);     // Länge von "Gesamtenergie", falls größer
  pos2 += 260;                                             // Textpositionen
  }

// Umrechnungsfaktor (Pixel/Einheit):
// maxReal .... Maximale Streckenlänge (m)
// maxPixel ... Maximale Streckenlänge (Pixel)
// maxPixel sollte möglichst durch 100 teilbar sein.
  
function getFactor (maxReal, maxPixel) {
  var q = maxPixel/maxReal; 
  var f = maxPixel;
  while (true) {
    f /= 2; if (f < q) break;
    f /= 2.5; if (f < q) break;
    f /= 2; if (f < q) break;
    }
  return f;
  }
  
// Schrittweite für Markierungen (in m):
    
function getStep1 () {
  var limit = 5, step1 = 1;
  while (true) {
    if (pix >= limit) return step1;
    limit /= 10; step1 *= 10;
    }
  }
  
// Schrittweite für beschriftete Markierungen (in m):
  
function getStep2 () {
  var limit = 50, step1 = 1;
  while (true) {
    if (pix >= limit) return step1;
    limit /= 2; step1 *= 2;
    if (pix >= limit) return step1;
    limit /= 2.5; step1 = 5*step1/2;
    if (pix >= limit) return step1;
    limit /= 2; step1 *= 2;
    }
  }

// Berechnungen:
// Seiteneffekt v0x, v0y, tW, w, hMax, vyMax, e, pix

function calculation () {
  v0x = v0*Math.cos(alpha0);                               // Waagrechte Geschwindigkeitskomponente am Anfang (m/s)
  v0y = v0*Math.sin(alpha0);                               // Senkrechte Geschwindigkeitskomponente am Anfang (m/s)
  if (Math.cos(alpha0) < 1e-10) v0x = 0;                   // Eventuelle Rundungsfehler vermeiden
  tW = (v0y+Math.sqrt(v0y*v0y+2*g*h0))/g;                  // Wurfdauer (s)
  w = v0x*tW;                                              // Wurfweite (m)
  if (v0y > 0) {                                           // Falls Wurf nach oben ...
    var t = v0y/g;                                         // ... Zeitpunkt für maximale Höhe (s)
    hMax = h0+v0y*t-g*t*t/2;                               // ... Maximale Höhe (m)
    }
  else hMax = h0;                                          // ... Sonst maximale Höhe gleich Ausgangshöhe (m)
  vyMax = Math.abs(v0y-g*tW);                              // Maximalbetrag der senkrechten Geschwindigkeitskomponente (m/s)
  e = m*v0*v0/2+m*g*h0;                                    // Gesamtenergie (J)
  pix = getFactor(Math.max(w,hMax),300);                   // Umrechnungsfaktor (Pixel pro m)
  if (pix*hMax > 220) pix /= 2;                            // Falls zu wenig Platz, Umrechnungsfaktor halbieren
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
// Seiteneffekt h0, v0, alpha0, m, g

function input () {
  h0 = inputNumber(ipH,3,true,0,100);                      // Ausgangshöhe (m)
  v0 = inputNumber(ipV,3,true,0,100);                      // Anfangsgeschwindigkeit (m/s) 
  alpha0 = inputNumber(ipW,3,true,-90,90)*DEG;             // Winkel (Eingabe in Grad, Umrechnung in Bogenmaß)
  m = inputNumber(ipM,3,true,0.1,10);                      // Masse (kg)
  g = inputNumber(ipG,3,true,1,100);                       // Fallbeschleunigung (m/s²)
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ipH.value = ToString(h0,3,true);                         // Eingabefeld für Ausgangshöhe
  ipV.value = ToString(v0,3,true);                         // Eingabefeld für Anfangsgeschwindigkeit
  ipW.value = ToString(alpha0/DEG,3,true);                 // Eingabefeld für Winkel
  ipM.value = ToString(m,3,true);                          // Eingabefeld für Masse
  ipG.value = ToString(g,3,true);                          // Eingabefeld für Fallbeschleunigung
  }
   
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
  }
  
// Linie zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// c ........ Farbe (optional, Defaultwert schwarz)
// w ........ Liniendicke (optional, Defaultwert 1)

function line (x1, y1, x2, y2, c, w) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  if (c) ctx.strokeStyle = c;                              // Linienfarbe festlegen
  if (w) ctx.lineWidth = w;                                // Liniendicke festlegen
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Rechteck mit schwarzem Rand:
// (x,y) ... Koordinaten der Ecke links oben (Pixel)
// w ....... Breite (Pixel)
// h ....... Höhe (Pixel)
// c ....... Füllfarbe (optional)

function rectangle (x, y, w, h, c) {
  if (c) ctx.fillStyle = c;                                // Füllfarbe
  newPath();                                               // Neuer Pfad
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausfüllen
  ctx.strokeRect(x,y,w,h);                                 // Rand zeichnen
  }

// Kreisscheibe mit schwarzem Rand:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... Füllfarbe (optional)

function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                // Füllfarbe
  newPath();                                               // Neuer Pfad
  ctx.arc(x,y,r,0,PI2,true);                               // Kreis vorbereiten
  if (c) ctx.fill();                                       // Kreis ausfüllen, falls gewünscht
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
  ctx.fillStyle = ctx.strokeStyle;                         // Füllfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                                     // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                                   // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                                       // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                                   // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                                         // Zurück zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen 
  }
    
// Digitaluhr:

function clock () {
  var x = 140, y = 30;                                     // Position des Mittelpunkts (Pixel)
  rectangle(x-60,y-15,120,30,colorClock1);                 // Rechteck für Gehäuse
  rectangle(x-50,y-10,100,20,colorClock2);                 // Rechteck für Anzeige
  ctx.font = FONT2;                                        // Zeichensatz für Ziffern
  ctx.fillStyle = colorClock3;                             // Farbe für Ziffern                
  var s = ToString(t,3,true) + " "+secondUnicode;          // Zeichenkette
  ctx.textAlign = "center";                                // Textausrichtung zentriert
  ctx.fillText(s,x,y+5);                                   // Zeit ausgeben
  ctx.font = FONT1;                                        // Normaler Zeichensatz
  }    
  
// Koordinatenberechnung, Kugel:
// Seiteneffekt x, y, x0, y0

function ball () {
  x = v0x*t; y = h0+v0y*t-g*t*t/2;                         // Momentane Position (m)
  if (y < 0) y = 0;                                        // Falls Wurf beendet, y-Koordinate 0
  x0 = xU+pix*x; y0 = yU-pix*y;                            // Momentane Position (Pixel)
  circle(x0,y0,3.5,"#000000");                             // Ausgefüllter Kreis
  }
  
// Koordinatensystem:

function axes () {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  arrow(xU-10,yU,xU+355,yU);                               // Waagrechte Achse
  arrow(xU,yU+10,xU,yU-255);                               // Senkrechte Achse
  var step1 = getStep1();                                  // Schrittweite für Ticks 
  var step2 = getStep2();                                  // Schrittweite für beschriftete Ticks
  ctx.textAlign = "center";                                // Textausrichtung zentriert
  ctx.fillStyle = "#000000";                               // Textfarbe schwarz
  for (var i=1; i<=330/pix; i++) {                         // Für alle Ticks der waagrechten Achse ... 
    var x = xU+i*pix;                                      // x-Koordinate (Pixel)
    var d = (i%step2==0 ? 5 : 2);                          // Halbe Strichlänge
    if (i%step1 == 0) line(x,yU-d,x,yU+d);                 // Tick zeichnen
    if (i%step2 == 0) ctx.fillText(""+i,x,yU+18);          // Tick beschriften    
    }
  ctx.textAlign = "right";                                 // Textausrichtung rechtsbündig
  for (var i=1; i<=220/pix; i++) {                         // Für alle Ticks der senkrechten Achse ... 
    var y = yU-i*pix;                                      // y-Koordinate (Pixel)
    var d = (i%step2==0 ? 5 : 2);                          // Halbe Strichlänge
    if (i%step1 == 0) line(xU-d,y,xU+d,y);                 // Tick zeichnen
    if (i%step2 == 0) ctx.fillText(""+i,xU-7,y+4);         // Tick beschriften
    }
  ctx.textAlign = "center";                                // Textausrichtung zentriert
  ctx.fillText(symbolX,xU+350,yU+18);                      // Name der waagrechten Koordinate (x)
  ctx.fillText(text14,xU+350,yU+30);                       // Einheitsangabe (in m)
  ctx.fillText(symbolY,xU-20,yU-245);                      // Name der senkrechten Koordinate (y)
  ctx.fillText(text14,xU-20,yU-230);                       // Einheitsangabe (in m)
  }
      
// Wurfparabel (Näherung durch Polygonzug):

function orbit () {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.strokeStyle = colorPosition;                         // Farbe für Position
  if (v0x < 1e-10) {                                       // Falls senkrechter Wurf ...
    line(xU,yU,xU,yU-hMax*pix); return;                    // ... Senkrechte Linie
    }
  var gH = g/2;                                            // Halbe Fallbeschleunigung
  var xx = xU, yy = yU-h0*pix;                             // Anfangsposition (Pixel)
  ctx.moveTo(xx,yy);                                       // Anfangspunkt des Polygonzugs
  var t = 0;                                               // Zeitvariable (s)
  while (t < tW) {                                         // Solange Wurf nicht zu Ende ...
    xx++;                                                  // Waagrechte Koordinate erhöhen (Pixel)
    var x = (xx-xU)/pix;                                   // x-Koordinate des neuen Punkts (m)
    t = x/v0x;                                             // Zeit für neuen Punkt (s)
    var y = h0+t*(v0y-gH*t);                               // y-Koordinate des neuen Punkts (m)
    yy = yU-y*pix;                                         // Senkrechte Koordinate (Pixel)
    ctx.lineTo(xx,yy);                                     // Strecke zum Polygonzug hinzufügen
    }
  ctx.stroke();                                            // Polygonzug zeichnen
  }
  
// Grafiktext (Wert einer Größe):
// beg ..... Text vor der Zahl
// val ..... Zahl
// end ..... Text nach der Zahl (z. B. Einheit)
// (x,y) ... Position
  
function writeValue (beg, val, end, x, y) {
  var s = beg+ToString(val,3,false)+end;
  ctx.fillText(s,x,y);
  }
  
// Darstellung der Position: Zahlenwerte, Markierungen auf den Achsen

function position () {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = colorPosition;                           // Farbe für Position
  var x1 = 220, x2 = 240, x3 = 320;                        // Positionsangaben
  ctx.fillText(text15,x1,25);                              // Text (Position)
  writeValue(symbolX+" = ",x," "+meterUnicode,x2,40);      // Wert der x-Koordinate (m)
  ctx.fillText(text16,x3,40);                              // Text (waagrecht)
  writeValue(symbolY+" = ",y," "+meterUnicode,x2,55);      // Wert der y-Koordinate (m)
  ctx.fillText(text17,x3,55);                              // Text (senkrecht)
  ctx.fillText(text18,x1,80);                              // Text (Wurfweite)
  writeValue("",w," "+meterUnicode,pos1,80);               // Wert der Wurfweite (m)                      
  ctx.fillText(text19,x1,95);                              // Text (Maximale Höhe)
  writeValue("",hMax," "+meterUnicode,pos1,95);            // Wert der maximalen Höhe (m)
  ctx.fillText(text20,x1,120);                             // Text (Dauer)
  writeValue("",tW," "+secondUnicode,pos1,120);            // Wert der Wurfdauer (s)
  line(x0,yU-5,x0,yU+5,colorPosition);                     // Markierung auf der x-Achse
  line(xU-5,y0,xU+5,y0,colorPosition);                     // Markierung auf der y-Achse
  }
      
// Winkelmarkierung:
// x, y ... Scheitel
// a ...... Winkel gegenüber der Waagrechten (Bogenmaß, kann auch negativ sein) 

function angle (x, y, a) {
  var r = 20;                                              // Radius (Pixel)
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = colorAngle;                              // Füllfarbe
  ctx.moveTo(x,y);                                         // Scheitel als Anfangspunkt
  ctx.lineTo(x+r,y);                                       // Linie nach rechts
  ctx.arc(x,y,r,0,-a,a>0);                                 // Kreisbogen
  ctx.closePath();                                         // Zurück zum Scheitel
  ctx.fill(); ctx.stroke();                                // Kreissektor ausfüllen, Rand zeichnen
  }
    
// Darstellung der Geschwindigkeit: Vektorpfeil, Zerlegung in Komponenten, Zahlenwerte

function velocity () {
  var vy = v0y-g*t;                                        // Senkrechte Geschwindigkeitskomponente (m/s)
  var alpha = Math.atan(vy/v0x);                           // Neigungswinkel (Bogenmaß)
  angle(x0,y0,alpha);                                      // Winkelmarkierung
  orbit();                                                 // Wurfbahn
  var l = vyMax*10;                                        // Maximale Pfeillänge, falls 10 Pixel für 1 m/s
  var f = (l>120 ? l/120 : 1);                             // Faktor (mindestens gleich 1)
  var dxPix = v0x*10/f;                                    // Waagrechte Komponente (Pixel)
  var dyPix = vy*10/f;                                     // Senkrechte Komponente (Pixel) 
  ctx.strokeStyle = colorVelocity;                         // Farbe für Geschwindigkeit
  arrow(x0,y0,x0+dxPix,y0-dyPix,3);                        // Dicker Pfeil für Geschwindigkeit
  arrow(x0,y0,x0+dxPix,y0);                                // Dünner Pfeil für waagrechte Komponente
  arrow(x0,y0,x0,y0-dyPix);                                // Dünner Pfeil für senkrechte Komponente
  ctx.fillText(text21,220,25);                             // Text (Geschwindigkeitskomponenten)
  var w1 = ctx.measureText(symbolVelocity).width;          // Breite des Geschwindigkeitssymbols (v, Pixel)                     
  var w2 = 2*w1+ctx.measureText("  ").width;               // Abstand (Pixel)
  var mps = " "+meterPerSecondUnicode;                     // Einheit m/s mit Leerzeichen davor
  ctx.fillText(symbolVelocity,240,40);                     // Geschwindigkeitssymbol (v)
  ctx.fillText(symbolX,240+w1,45);                         // Index (x)
  writeValue("= ",v0x,mps,240+w2,40);                      // Gleichheitszeichen und Zahlenwert mit Einheit m/s
  ctx.fillText(text16,330,40);                             // Text (waagrecht)    
  ctx.fillText(symbolVelocity,240,55);                     // Geschwindigkeitssymbol (v)
  ctx.fillText(symbolY,240+w1,60);                         // Index (y)
  writeValue("= ",vy,mps,240+w2,55);                       // Gleichheitszeichen und Zahlenwert mit Einheit m/s
  ctx.fillText(text17,330,55);                             // Text (senkrecht)
  ctx.fillText(text22,220,80);                             // Text (Geschwindigkeitsbetrag)
  var v = Math.sqrt(v0x*v0x+vy*vy);                        // Betrag der Geschwindigkeit (m/s)
  writeValue("",v,mps,240,95);                             // Zahlenwert (Geschwindigkeitsbetrag in m/s)
  ctx.fillText(text23,220,120);                            // Text (Winkel gegenüber der Waagrechten)
  writeValue("",alpha/DEG,degreeUnicode,350,120);          // Zahlenwert (Winkel in Grad)
  ctx.strokeStyle = "#000000";                             // Farbe schwarz
  line(x0+dxPix,y0,x0+dxPix,y0-dyPix);                     // Senkrechte Hilfslinie
  line(x0,y0-dyPix,x0+dxPix,y0-dyPix);                     // Waagrechte Hilfslinie
  }
  
// Darstellung der Beschleunigung: Vektorpfeil, Zahlenwert

function acceleration () {
  var len = (g<30 ? g*4 : 120);                            // Pfeillänge (Pixel)
  ctx.strokeStyle = colorAcceleration;                     // Farbe für Beschleunigung
  arrow(x0,y0,x0,y0+len,3);                                // Pfeil für Beschleunigung
  ctx.fillText(text24,220,25);                             // Text (Beschleunigung)
  writeValue("",g," "+meterPerSecond2Unicode,330,25);      // Zahlenwert (Beschleunigung in m/s²)
  }
  
// Darstellung der Kraft: Vektorpfeil, Zahlenwert

function force () {
  var len = (g<30/m ? g*4*m : 120);                        // Pfeillänge (Pixel)
  ctx.strokeStyle = colorForce;                            // Farbe für Kraft
  arrow(x0,y0,x0,y0+len,3);                                // Pfeil für Kraft
  ctx.fillText(text25,220,25);                             // Text (Kraft)
  writeValue("",m*g," "+newtonUnicode,330,25);             // Zahlenwert (Kraft in N)
  }
    
// Darstellung der Energie: Zahlenwerte

function energy () {
  var ePot = m*g*y;                                        // Potentielle Energie (J)
  var j = " "+jouleUnicode;                                // Einheit J mit Leerzeichen davor
  ctx.fillStyle = colorVelocity;                           // Farbe für Geschwindigkeit
  ctx.fillText(text26,220,25);                             // Text (kinetische Energie)
  writeValue("",e-ePot,j,pos2,25);                         // Zahlenwert (kinetische Energie in J)
  ctx.fillStyle = colorPosition;                           // Farbe für Position
  ctx.fillText(text27,220,40);                             // Text (potentielle Energie)
  writeValue("",ePot,j,pos2,40);                           // Zahlenwert (potentielle Energie in J)
  ctx.fillStyle = "#000000";                               // Schriftfarbe schwarz
  ctx.fillText(text28,220,65);                             // Text (Gesamtenergie)
  writeValue("",e,j,pos2,65);                              // Zahlenwert (Gesamtenergie in J)
  }
  
// Grafikausgabe: 
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // ... Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // ... Länge des Zeitintervalls (s)
    if (slow) dt /= 10;                                    // ... Falls Zeitlupe, Zeitintervall durch 10 dividieren
    t += dt;                                               // ... Zeitvariable aktualisieren
    t0 = t1;                                               // ... Neuer Anfangszeitpunkt
    if (t > tW) t = tW;                                    // ... Am Ende des Wurfs Zeitvariable stoppen
    }
  ctx.font = FONT1;                                        // Normaler Zeichensatz
  var vv = yU+3;                                           // Oberer Rand des Untergrunds (Pixel)
  rectangle(0,vv,width,height-vv,colorGround);             // Untergrund
  ball();                                                  // Geworfene Kugel
  axes();                                                  // Koordinatensystem
  clock();                                                 // Digitaluhr
  if (nrSize != 2) orbit();                                // Wurfbahn (Winkelmarkierung vorher zeichnen!)
  ctx.textAlign = "left";                                  // Ab hier Textausrichtung immer linksbündig
  switch (nrSize) {                                        // Je nach dargestellter Größe ...
    case 1: position(); break;                             // Position
    case 2: velocity(); break;                             // Geschwindigkeit
    case 3: acceleration(); break;                         // Beschleunigung
    case 4: force(); break;                                // Kraft
    case 5: energy(); break;                               // Energie
    }
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen





