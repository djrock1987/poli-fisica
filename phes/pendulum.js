// Fadenpendel
// Java-Applet (21.05.1998) umgewandelt
// 14.09.2014 - 13.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel pendulum_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorClock1 = "#808080";                               // Farbe der Digitaluhr (außen)
var colorClock2 = "#000000";                               // Hintergrundfarbe der Anzeige
var colorClock3 = "#ff0000";                               // Farbe der Ziffern
var colorElongation = "#ff0000";                           // Farbe für Elongation
var colorVelocity = "#ff00ff";                             // Farbe für Geschwindigkeit
var colorAcceleration = "#0000ff";                         // Farbe für Beschleunigung
var colorForce = "#008020";                                // Farbe für Kraft
var colorBody = "#ffffff";                                 // Farbe des Pendelkörpers

// Sonstige Konstanten:

var DEG = Math.PI/180;                                     // Winkelgrad
var ax = 120, ay = 30;                                     // Position der Aufhängung (Pixel)
var xD = 260;                                              // x-Koordinate Ursprung
var yD1 = 180, yD2 = 165;                                  // y-Koordinate Ursprung
var FONT1 = "normal normal bold 12px sans-serif";          // Zeichensatz
var tPix = 20;                                             // Umrechnungsfaktor (Pixel pro s)

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var bu1, bu2;                                              // Schaltknöpfe (Reset, Start/Pause/Weiter)
var cbSlow;                                                // Optionsfeld Zeitlupe
var ipL, ipG, ipM, ipA;                                    // Eingabefelder
var rbY, rbV, rbA, rbF, rbE;                               // Radiobuttons
var on;                                                    // Flag für Bewegung
var slow;                                                  // Flag für Zeitlupe
var t0;                                                    // Anfangszeitpunkt
var t;                                                     // Aktuelle Zeit (s)
var tU;                                                    // Zeit für Diagramm-Ursprung (s)
var l;                                                     // Pendellänge (m)
var lPix;                                                  // Pendellänge (Pixel)
var g;                                                     // Fallbeschleunigung (m/s²)
var m;                                                     // Masse (kg)
var omega;                                                 // Kreisfrequenz (rad/s)
var tPer;                                                  // Schwingungsdauer (s)
var phi;                                                   // Phasenwinkel (Bogenmaß)
var sinPhi, cosPhi;                                        // Trigonometrische Werte
var alpha0;                                                // Maximaler Auslenkungswinkel (Bogenmaß)
var alpha;                                                 // Momentaner Auslenkungswinkel (Bogenmaß)
var sinAlpha, cosAlpha;                                    // Trigonometrische Werte
var yPix;                                                  // Umrechnungsfaktor (Pixel pro SI-Einheit)
var px, py;                                                // Position des Pendelkörpers (Pixel)
var nrSize;                                                // Nummer der betrachteten Größe

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
  bu2.state = 0;                                           // Anfangszustand (vor Start der Animation)
  cbSlow = getElement("cbSlow");                           // Optionsfeld (Zeitlupe)
  cbSlow.checked = false;                                  // Zeitlupe abgeschaltet
  getElement("lbSlow",text03);                             // Erkärender Text (Zeitlupe)
  getElement("ipLa",text04);                               // Erklärender Text (Pendellänge)
  ipL = getElement("ipLb");                                // Eingabefeld (Pendellänge)
  getElement("ipLc",meter);                                // Einheit (Pendellänge)
  var ipgx = getElement("ipGx");                           // Zusätzliche Zeile (Fallbeschleunigung)
  if (ipgx) ipgx.innerHTML = text05x;                      // Erklärender Text, zusätzliche Zeile (Fallbeschleunigung)
  getElement("ipGa",text05);                               // Erklärender Text (Fallbeschleunigung)
  ipG = getElement("ipGb");                                // Eingabefeld (Fallbeschleunigung)
  getElement("ipGc",meterPerSecond2);                      // Einheit (Fallbeschleunigung)
  getElement("ipMa",text06);                               // Erklärender Text (Masse)
  ipM = getElement("ipMb");                                // Eingabefeld (Masse)
  getElement("ipMc",kilogram);                             // Einheit (Masse)
  getElement("ipAa",text07);                               // Erklärender Text (Amplitude)
  ipA = getElement("ipAb");                                // Eingabefeld (Amplitude)
  getElement("ipAc",degree);                               // Einheit (Amplitude)
  rbY = getElement("rbY");                                 // Radiobutton (Elongation)
  getElement("lbY",text08);                                // Erklärender Text (Elongation)
  rbY.checked = true;                                      // Radiobutton auswählen
  rbV = getElement("rbV");                                 // Radiobutton (Geschwindigkeit)
  getElement("lbV",text09);                                // Erklärender Text (Geschwindigkeit)
  rbA = getElement("rbA");                                 // Radiobutton (Beschleunigung)
  getElement("lbA",text10);                                // Erklärender Text (Beschleunigung)
  rbF = getElement("rbF");                                 // Radiobutton (Kraft)
  getElement("lbF",text11);                                // Erklärender Text (Kraft)
  rbE = getElement("rbE");                                 // Radiobutton (Energie)
  getElement("lbE",text12);                                // Erklärender Text (Energie)
  getElement("author",author);                             // Autor

  l = 5;                                                   // Anfangswert Pendellänge (m)
  g = 9.81;                                                // Anfangswert Fallbeschleunigung (m/s²)
  m = 1;                                                   // Anfangswert Masse (kg)
  alpha0 = 10*DEG;                                         // Anfangswert Winkelamplitude (Bogenmaß) 
  updateInput();                                           // Eingabefelder aktualisieren 
  calculation();                                           // Berechnungen (Seiteneffekt!)
    
  on = false;                                              // Animation abgeschaltet
  slow = false;                                            // Zeitlupe abgeschaltet
  t = 0;                                                   // Aktuelle Zeit (s)
  t0 = new Date();                                         // Anfangszeitpunkt
  setInterval(paint,40);                                   // Timer-Intervall 0,040 s
  
  bu1.onclick = reactionReset;                             // Reaktion auf Resetknopf
  bu2.onclick = reactionStart;                             // Reaktion auf Startknopf
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld Zeitlupe
  ipL.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Pendellänge)
  ipG.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Fallbeschleunigung)
  ipM.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Masse)
  ipA.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Amplitude)
  rbY.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton Elongation
  rbV.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton Geschwindigkeit
  rbA.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton Beschleunigung
  rbF.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton Kraft
  rbE.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton Energie
  nrSize = 0;                                              // Elongation ausgewählt  
    
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
  ipL.readOnly = !p;                                       // Eingabefeld für Pendellänge
  ipG.readOnly = !p;                                       // Eingabefeld für Fallbeschleunigung
  ipM.readOnly = !p;                                       // Eingabefeld für Masse
  ipA.readOnly = !p;                                       // Eingabefeld für Winkelamplitude
  }
  
// Reaktion auf Resetknopf:
// Seiteneffekt t, tU, on, slow
   
function reactionReset () {
  setButton2State(0);                                      // Zustand des Schaltknopfs Start/Pause/Weiter
  enableInput(true);                                       // Eingabefelder aktivieren
  t = tU = 0;                                              // Zeitvariable zurücksetzen
  on = false;                                              // Animation abgeschaltet
  slow = cbSlow.checked;                                   // Flag für Zeitlupe
  reaction();                                              // Eingegebene Werte übernehmen und rechnen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf den Schaltknopf Start/Pause/Weiter:
// Seiteneffekt t, tU, on, slow, l, g, m, alpha0, omega, tPer, lPix, phi, sinPhi, cosPhi, alpha, sinAlpha, cosAlpha, px, py

function reactionStart () {
  if (bu2.state != 1) t0 = new Date();                     // Falls Animation angeschaltet, neuer Anfangszeitpunkt
  switchButton2();                                         // Zustand des Schaltknopfs ändern
  enableInput(false);                                      // Eingabefelder deaktivieren
  on = (bu2.state == 1);                                   // Flag für Animation
  slow = cbSlow.checked;                                   // Flag für Zeitlupe
  reaction();                                              // Eingegebene Werte übernehmen und rechnen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf Optionsfeld Zeitlupe:
// Seiteneffekt slow

function reactionSlow () {
  slow = cbSlow.checked;                                   // Flag setzen
  }
  
// Hilfsroutine: Eingabe übernehmen und rechnen
// Seiteneffekt l, g, m, alpha0, omega, tPer, lPix

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
// Seiteneffekt nrSize

function reactionRadioButton () {
  if (rbY.checked) nrSize = 0;                             // Entweder Elongation ...
  else if (rbV.checked) nrSize = 1;                        // ... oder Geschwindigkeit ...
  else if (rbA.checked) nrSize = 2;                        // ... oder Beschleunigung ...
  else if (rbF.checked) nrSize = 3;                        // ... oder Kraft ...
  else nrSize = 4;                                         // ... oder Energie auswählen
  }

//-------------------------------------------------------------------------------------------------

// Berechnungen:
// Seiteneffekt omega, tPer, lPix

function calculation () {
  omega = Math.sqrt(g/l);                                  // Kreisfrequenz (rad/s)
  tPer = 2*Math.PI/omega;                                  // Schwingungsdauer (s)
  lPix = 25*l;                                             // Pendellänge (Pixel)
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
// Seiteneffekt l, g, m, alpha0

function input () {
  l = inputNumber(ipL,3,true,0.5,10);                     // Pendellänge (m)
  g = inputNumber(ipG,2,true,1,100);                      // Fallbeschleunigung (m/s²)
  m = inputNumber(ipM,3,true,1,10);                       // Masse (kg)
  alpha0 = DEG*inputNumber(ipA,1,true,2,20);              // Winkelamplitude (Bogenmaß)
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ipL.value = ToString(l,3,true);                          // Eingabefeld für Pendellänge (m)
  ipG.value = ToString(g,2,true);                          // Eingabefeld für Fallbeschleunigung (m/s²)
  ipM.value = ToString(m,3,true);                          // Eingabefeld für Masse (kg)
  ipA.value = ToString(alpha0/DEG,1,true);                 // Eingabefeld für Winkelamplitude (°)
  }
   
//-------------------------------------------------------------------------------------------------

// Neuer Pfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
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
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausfüllen
  ctx.stroke();                                            // Rand zeichnen
  }
  
// Pendel zeichnen:
// Seiteneffekt alpha, sinAlpha, cosAlpha, px, py

function pendulum () {
  alpha = alpha0*cosPhi;                                   // Auslenkung (Bogenmaß)                      
  sinAlpha = Math.sin(alpha);                              // Sinuswert 
  cosAlpha = Math.cos(alpha);                              // Cosinuswert
  px = ax+lPix*sinAlpha;                                   // x-Koordinate des Pendelkörpers (Pixel)
  py = ay+lPix*cosAlpha;                                   // y-Koordinate des Pendelkörpers (Pixel)
  newPath();                                               // Neuer Pfad mit Standardwerten
  ctx.moveTo(ax,ay);                                       // Anfangspunkt (Aufhängung)
  ctx.lineTo(px,py);                                       // Weiter zum Mittelpunkt des Pendelkörpers
  ctx.closePath();                                         // Pfad schließen
  ctx.stroke();                                            // Linie für Schnur zeichnen
  circle(px,py,5,colorBody);                               // Pendelkörper
  }
  
// Digitaluhr zeichnen:

function clock (x, y) {
  rectangle(x-60,y-16,120,32,colorClock1);                 // Gehäuse
  rectangle(x-50,y-10,100,20,colorClock2);                 // Hintergrund der Anzeige
  ctx.fillStyle = "#ff0000";                               // Farbe für Ziffern
  ctx.font = "normal normal bold 16px monospace";          // Zeichensatz
  ctx.textAlign = "center";                                // Zentrierte Ausgabe
  var n = Math.floor(t/1000);                              // Zahl der Zeitabschnitte zu je 1000 s
  var s = (t-n*1000).toFixed(3)+" "+second;                // Zeitangabe (Einheit s, alle 1000 s Neuanfang)
  s = s.replace(".",decimalSeparator);                     // Eventuell Punkt durch Komma ersetzen
  while (s.length < 9) s = " "+s;                          // Eventuell Leerzeichen am Anfang ergänzen
  ctx.fillText(s,x,y+5);                                   // Ausgabe der Zeit
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
  
// Vektorpfeil vom Pendelkörper aus:
// r ..... Länge des Pfeils
// phi ... Winkel gegenüber der Waagrechten (Bogenmaß, Gegenuhrzeigersinn)
  
function arrowPendulum (r, phi) {
  var x = px+r*Math.cos(phi);                              // x-Koordinate der Pfeilspitze
  var y = py-r*Math.sin(phi);                              // y-Koordinate der Pfeilspitze 
  arrow(px,py,x,y,3);                                      // Pfeil zeichnen
  }
  
// Text ausrichten (Zeichensatz FONT1):
// s ....... Zeichenkette
// t ....... Typ (0 für linksbündig, 1 für zentriert, 2 für rechtsbündig)
// (x,y) ... Position (Pixel)

function alignText (s, t, x, y) {
  ctx.font = FONT1;                                        // Zeichensatz
  if (t == 0) ctx.textAlign = "left";                      // Je nach Wert von t linksbündig ...
  else if (t == 1) ctx.textAlign = "center";               // ... oder zentriert ...
  else ctx.textAlign = "right";                            // ... oder rechtsbündig
  ctx.fillText(s,x,y);                                     // Text ausgeben
  }
  
// Waagrechte Achse (mit Beschriftung und Ticks) für Diagramm:
// (x,y) ... Ursprung (Pixel)
  
function horizontalAxis (x, y) {
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz 
  arrow(x-20,y,x+240,y);                                   // Pfeil zeichnen
  alignText(symbolTime,1,x+230,y+15);                      // Beschriftung (t)
  alignText(text21,1,x+230,y+27);                          // Beschriftung (in s)  
  var t0 = Math.ceil(tU);                                  // Zeit (s) für ersten Tick
  var x0 = Math.round(x+tPix*(t0-tU));                     // x-Koordinate des ersten Ticks             
  for (i=0; i<=10; i++) {                                  // Für alle Ticks ...
    var xs = x0+i*tPix;                                    // x-Koordinate berechnen
    ctx.moveTo(xs,y-3); ctx.lineTo(xs,y+3);                // Tick vorbereiten
    if (xs >= x+5 && xs <= x+215                           // Falls Tick nicht zu weit links oder zu weit rechts ... 
    && (t0+i <= 100 || (t0+i)%2 == 0))                     // und Zeit (s) kleiner als 100 oder geradzahlig ...
      alignText(""+(t0+i),1,xs,y+13);                      // ... Tick beschriften
    }
  ctx.stroke();                                            // Ticks zeichnen
  }
    
// Senkrechte Achse (mit Beschriftung und Ticks) für Diagramm:
// (x,y) ... Ursprung (Pixel)
// yLow .... Unteres Ende der Achse (Pixel)
// yHigh ... Oberes Ende der Achse (Pixel)
// maxSI ... Maximalwert (SI-Einheit)
// Seiteneffekt yPix
  
function verticalAxis (x, y, yLow, yHigh, maxSI) {
  var pot10 = Math.pow(10,Math.floor(Math.log(maxSI)/Math.LN10));    // Nächstkleinere Zehnerpotenz zu maxSI
  var q = maxSI/pot10;                                     // Verhältnis (zwischen 1 und 10)
  var n;                                                   // Zahl der Ticks
  if (q > 5) n = 10; else if (q > 2) n = 5; else n = 2;    // "Glatter" Wert für Zahl der Ticks 
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  arrow(x,yLow,x,yHigh);                                   // Pfeil zeichnen
  var n0 = (nrSize<4 ? -n : 0);                            // Nummer des untersten Ticks 
  ctx.beginPath();                                         // Neuer Pfad                       
  for (i=n0; i<=n; i++) {                                  // Für alle Ticks ...
    var ys = y-i*100/n;                                    // y-Koordinate des Ticks
    ctx.moveTo(x-3,ys); ctx.lineTo(x+3,ys);                // Tick vorbereiten
    var s = Number(i*pot10).toPrecision(1);                // Zeichenkette für Beschriftung 
    if (Math.abs(i*pot10) >= 10)                           // Falls nötig ...
      s = ""+Math.round(i*pot10);                          // ... Zehnerpotenzschreibweise verhindern
    s = s.replace(".",decimalSeparator);                   // Eventuell Punkt in Komma verwandeln
    if ((n < 10 || i%2 == 0) && i != 0)                    // Falls sinnvoll ... 
      alignText(s,2,x-3,ys+4);                             // ... Tick beschriften
    }
  ctx.stroke();                                            // Ticks zeichnen
  yPix = 100/n/pot10;                                      // Umrechnungsfaktor aktualisieren
  }
      
// Sinuskurve (Näherung durch Polygonzug):
// (x,y) ... Nullpunkt (Pixel)
// per ..... Periode (Pixel)
// ampl .... Amplitude (Pixel)
// xMin .... Minimaler x-Wert (Pixel)
// xMax .... Maximaler x-Wert (Pixel)

function sinus (x, y, per, ampl, xMin, xMax) {
  var omega = 2*Math.PI/per;                               // Hilfsgröße
  newPath();                                               // Neuer Pfad (Standardwerte)
  var xx = xMin;                                           // x-Koordinate für linken Rand
  ctx.moveTo(xx,y-ampl*Math.sin(omega*(xx-x)));            // Anfangspunkt 
  while (xx < xMax) {                                      // Solange rechter Rand noch nicht erreicht ...
    xx++;                                                  // x-Koordinate erhöhen
    ctx.lineTo(xx,y-ampl*Math.sin(omega*(xx-x)));          // Neue Teilstrecke vorbereiten
    }
  ctx.stroke();                                            // Polygonzug für Kurve zeichnen
  }
  
// Diagramm zeichnen:

function diagram (type, x, y, yMax) {
  horizontalAxis(x,y);                                     // Waagrechte Achse mit Beschriftung und Ticks
  verticalAxis(x,y,y+120,y-135,yMax);                      // Senkrechte Achse mit Beschriftung und Ticks   
  sinus(x-type*tPer*5-tU*tPix,y,tPer*tPix,yMax*yPix,x,x+200);   // Sinuskurve  
  }
  
// Markierung in Diagramm für momentanen Wert:
// val .... Zahlenwert (SI-Einheit)
// x, y ... Ursprung
// c ...... Farbe
  
function drawMomVal (val, x, y, c) {
  x += (t-tU)*tPix; y -= val*yPix;                         // Mittelpunktskoordinaten (Pixel)
  circle(x,y,2,c);                                         // Kleiner Kreis mit Rand
  }
  
// Ausgabe eines Zahlenwerts:
// s ........ Bezeichnung der Größe
// v ........ Zahlenwert
// u ........ Einheit
// n ........ Zahl der gültigen Ziffern
// (x1,y) ... Position des Texts (Pixel)
// (x2,y) ... Position des Zahlenwerts (Pixel)
  
function writeValue (s, v, u, n, x1, x2, y) {
  alignText(s+":",0,x1,y);                                 // Bezeichnung der Größe
  s = v.toPrecision(n);                                    // Runden mit gewünschter Genauigkeit
  s = s.replace(".",decimalSeparator);                     // Eventuell Komma statt Punkt
  alignText(s+" "+u,0,x2,y);                               // Zahl mit Einheit
  }
  
// Zentrierter Text mit Index:
// s1 ...... Normaler Text
// s2 ...... Index
// (x,y) ... Position
    
function centerTextIndex (s1, s2, x, y) {
  var w1 = ctx.measureText(s1).width;                      // Breite von s1 (Pixel) 
  var w2 = ctx.measureText(s2).width;                      // Breite von s2 (Pixel)
  var x0 = x-(w1+w2)/2;                                    // x-Koordinate der Mitte
  alignText(s1,0,x0,y);                                    // Normalen Text ausgeben
  alignText(s2,0,x0+w1+1,y+5);                             // Index ausgeben
  }
  
// Zeichnung zur Elongation:
// Diagramm für Zeitabhängigkeit der Elongation, Kreisbogen für Elongation, Zahlenwerte

function drawElongation () {
  var sMax = l*alpha0;                                     // Maximaler Betrag der Elongation (m)
  var s = sMax*cosPhi;                                     // Momentaner Wert der Elongation (m) 
  diagram(1,xD,yD1,sMax);                                  // Diagramm zeichnen
  alignText(symbolElongation,1,xD-25,yD1-130);             // Beschriftung (Symbol für Elongation)
  alignText(text22,1,xD-25,yD1-118);                       // Beschriftung (Einheit m)
  ctx.beginPath();                                         // Neuer Pfad
  ctx.lineWidth = 3;                                       // Liniendicke
  ctx.strokeStyle = colorElongation;                       // Farbe für Kreisbogen
  var pos = (alpha >= 0);                                  // Flag für Auslenkung nach rechts
  var w0 = (pos ? Math.PI/2 : Math.PI/2-alpha);            // Startwinkel für Kreisbogen (Bogenmaß)
  var w1 = (pos ? Math.PI/2-alpha : Math.PI/2);            // Endwinkel für Kreisbogen (Bogenmaß)
  ctx.arc(ax,ay,lPix,w0,w1,true);                          // Kreisbogen vorbereiten
  ctx.stroke();                                            // Kreisbogen zeichnen
  drawMomVal(s,xD,yD1,colorElongation);                    // Momentanen Wert im Diagramm markieren 
  ctx.fillStyle = colorElongation;                         // Farbe für Elongation (Zahlenwerte)  
  writeValue(text14,s,meterUnicode,3,xD,xD+200,height-50); // Momentanen Wert angeben
  writeValue("("+text13,sMax,meterUnicode+")",3,xD,xD+200,height-30);  // Maximalen Wert angeben
  }
  
// Zeichnung zur Geschwindigkeit:
// Diagramm für Zeitabhängigkeit der Geschwindigkeit, Pfeil für Geschwindigkeitsvektor, Zahlenwerte

function drawVelocity () {
  var vMax = l*alpha0*omega;                               // Maximaler Betrag der Geschwindigkeit (m/s)
  var v = -vMax*sinPhi;                                    // Momentaner Wert der Geschwindigkeit (m/s)
  diagram(2,xD,yD1,vMax);                                  // Diagramm zeichnen
  alignText(symbolVelocity,1,xD-28,yD1-130);               // Beschriftung (Symbol für Geschwindigkeit)
  alignText(text23,1,xD-28,yD1-118);                       // Beschriftung (Einheit m/s)
  ctx.strokeStyle = colorVelocity;                         // Farbe für Geschwindigkeit
  arrowPendulum(v*yPix,alpha0*cosPhi);                     // Vektorpfeil für Geschwindigkeit
  drawMomVal(v,xD,yD1);                                    // Momentanen Wert im Diagramm markieren
  ctx.fillStyle = colorVelocity;                           // Farbe für Geschwindigkeit (Zahlenwerte)    
  writeValue(text15,v,meterPerSecond,3,xD,xD+200,height-50);    // Momentanen Wert angeben
  writeValue("("+text13,vMax,meterPerSecond+")",3,xD,xD+200,height-30);   // Maximalen Wert angeben
  }
  
// Zeichnung zur Tangentialbeschleunigung:
// Diagramm für Zeitabhängigkeit der Beschleunigung, Pfeil für Beschleunigungsvektor, Zahlenwerte
  
function drawAcceleration () {
  var aMax = l*alpha0*omega*omega;                         // Maximaler Betrag der Tangentialbeschleunigung (m/s²)
  var a = -aMax*cosPhi;                                    // Momentaner Wert der Tangentialbeschleunigung (m/s²)
  diagram(3,xD,yD1,aMax);                                  // Diagramm zeichnen
  centerTextIndex(symbolAcceleration,symbolTangential,xD-30,yD1-130);     // Beschriftung (Symbol für Tangentialbeschleunigung) 
  alignText(text24,1,xD-30,yD1-113);                       // Beschriftung (Einheit m/s²)
  ctx.strokeStyle = colorAcceleration;                     // Farbe für Beschleunigung
  arrowPendulum(a*yPix,alpha0*cosPhi);                     // Vektorpfeil für Tangentialbeschleunigung
  drawMomVal(a,xD,yD1);                                    // Momentanen Wert im Diagramm markieren
  ctx.fillStyle = colorAcceleration;                       // Farbe für Beschleunigung (Zahlenwerte) 
  var mps2 = meterPerSecond2Unicode;   
  writeValue(text16,a,mps2,3,xD-30,xD+220,height-50);     // Momentanen Wert angeben
  writeValue("("+text13,aMax,mps2+")",3,xD-30,xD+220,height-30); // Maximalen Wert angeben
  }
      
// Zeichnung zur Tangentialkraft:
// Diagramm für Zeitabhängigkeit der Kraft, Pfeil für Kraftvektor, Zahlenwerte
  
function drawForce () {
  var fMax = m*l*alpha0*omega*omega;                       // Maximaler Betrag der Tangentialkraft (N)
  var f = -fMax*cosPhi;                                    // Momentaner Wert der Tangentialkraft (N)
  diagram(3,xD,yD1,fMax);                                  // Diagramm zeichnen
  centerTextIndex(symbolForce,symbolTangential,xD-30,yD1-130);  // Beschriftung (Symbol für Tangentialkraft)
  alignText(text25,1,xD-30,yD1-113);                       // Beschriftung (Einheit N) 
  ctx.strokeStyle = colorForce;                            // Farbe für Kraft
  arrowPendulum(f*yPix,alpha0*cosPhi);                     // Vektorpfeil für Tangentialkraft
  drawMomVal(f,xD,yD1);                                    // Momentanen Wert im Diagramm markieren
  ctx.fillStyle = colorForce;                              // Farbe für Kraft (Zahlenwerte)    
  writeValue(text17,f,newton,3,xD-30,xD+220,height-50);    // Momentanen Wert angeben
  writeValue("("+text13,fMax,newton+")",3,xD-30,xD+220,height-30);   // Maximalen Wert angeben
  }
      
// Diagramm für Zeitabhängigkeit der potentiellen und kinetischen Energie:
// (x,y) .... Ursprung (Pixel)
// e ........ Gesamtenergie (J)

function diagramEnergy (x, y, e) {
  horizontalAxis(x,y);                                     // Waagrechte Achse mit Beschriftung und Ticks
  verticalAxis(x,y,y+20,y-125,e);                          // Senkrechte Achse mit Beschriftung und Ticks
  var x1 = x+200;                                          // x-Koordinate für rechten Rand (Pixel)
  var y1 = y-e*yPix;                                       // y-Koordinate für Gesamtenergie (Pixel)
  ctx.beginPath();                                         // Neuer Pfad
  ctx.moveTo(x,y1); ctx.lineTo(x1,y1);                     // Waagrechte Linie für Gesamtenergie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  var xx = x-tU*tPix;                                      // x-Koordinate des verschobenen Ursprungs (Pixel)
  var per = tPer*10;                                       // Periode für Sinuskurven (Pixel)
  var ampl = e*yPix/2;                                     // Amplitude für Sinuskurven (Pixel)
  sinus(xx-tPer*2.5,y-ampl,per,ampl,x,x+200);              // Sinuskurve für potentielle Energie
  sinus(xx-tPer*7.5,y-ampl,per,ampl,x,x+200);              // Sinuskurve für kinetische Energie
  }
      
// Zeichnung für Energie:

function drawEnergy () {
  var e = l*alpha0*omega; e = m*e*e/2;                     // Gesamtenergie (J)
  var part = cosPhi*cosPhi;                                // Bruchteil für potentielle Energie
  var eP = e*part, eK = e-eP;                              // Potentielle und kinetische Energie (J)
  diagramEnergy(xD,yD2,e);                                 // Diagramm für Zeitabhängigkeit der beiden Energieformen 
  centerTextIndex(symbolEnergy,symbolPotential,xD-30,yD2-125);  // Beschriftung links (potentielle Energie) 
  alignText(text26,1,xD-30,yD2-108);                       // Beschriftung links (Einheit J)
  centerTextIndex(symbolEnergy,symbolKinetic,xD+30,yD2-125);    // Beschriftung rechts (kinetische Energie)
  alignText(text26,1,xD+30,yD2-108);                       // Beschriftung rechts (Einheit J)
  ctx.fillStyle = colorElongation;                         // Farbe für potentielle Energie (bzw. Elongation)
  writeValue(text18,eP,joule,3,xD,xD+200,height-70);       // Momentaner Wert der potentiellen Energie    
  ctx.fillStyle = colorVelocity;                           // Farbe für kinetische Energie
  writeValue(text19,eK,joule,3,xD,xD+200,height-50);       // Momentaner Wert der kinetischen Energie
  ctx.fillStyle = "#000000";                               // Farbe für Gesamtenergie
  writeValue(text20,e,joule,3,xD,xD+200,height-30);        // Wert der Gesamtenergie
  var dy = part*100;                                       // Höhe des Rechtecks für potentielle Energie (Pixel)
  rectangle(300,205,50,dy,colorElongation);                // Rechteck für potentielle Energie
  if (part > 0.001 || on)                                  // Falls potentielle Energie nicht zu klein ...
    alignText(text18,0,360,220);                           // ... Beschriftung potentielle Energie
  rectangle(300,205+dy,50,100-dy,colorVelocity);           // Rechteck für kinetische Energie
  if (part < 0.999 || on)                                  // Falls kinetische Energie nicht zu klein ... 
    alignText(text19,0,360,300);                           // ... Beschriftung potentielle Energie
  drawMomVal(eP,xD,yD2,colorElongation);                   // Markierung für momentane potentielle Energie
  drawMomVal(eK,xD,yD2,colorVelocity);                     // Markierung für momentane kinetische Energie
  }

// Grafikausgabe:
// Seiteneffekt t, tU, phi, sinPhi, cosPhi, alpha, sinAlpha, cosAlpha, px, py
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  rectangle(ax-50,ay-5,100,5,"#000000");                   // Aufhängung (Decke)
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // ... Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // ... Länge des Zeitintervalls (s)
    if (slow) dt /= 10;                                    // ... Falls Zeitlupe, Zeitintervall durch 10 dividieren
    t += dt;                                               // ... Zeitvariable aktualisieren
    t0 = t1;                                               // ... Neuer Anfangszeitpunkt
    }
  tU = (t<5 ? 0 : t-5);                                    // Zeit für Diagramm-Ursprung (s)
  phi = omega*t;                                           // Phasenwinkel (Bogenmaß) 
  sinPhi = Math.sin(phi); cosPhi = Math.cos(phi);          // Trigonometrische Werte
  pendulum();                                              // Pendel zeichnen
  clock(ax,340);                                           // Digitaluhr zeichnen
  switch (nrSize) {                                        // Je nach betrachteter Größe ...
    case 0: drawElongation(); break;                       // ... Zeichnung zur Elongation
    case 1: drawVelocity(); break;                         // ... Zeichnung zur Geschwindigkeit
    case 2: drawAcceleration(); break;                     // ... Zeichnung zur Tangentialbeschleunigung
    case 3: drawForce(); break;                            // ... Zeichnung zur Tangentialkraft
    case 4: drawEnergy(); break;                           // ... Zeichnung zur Energie
    }
  var s = text27+":  "+tPer.toPrecision(3)+" "+second;     // Zeichenkette für Schwingungsdauer
  s = s.replace(".",decimalSeparator);                     // Eventuell Komma statt Punkt
  ctx.fillStyle = "#000000";                               // Farbe für Text
  alignText(s,1,ax,height-30);                             // Zeichenkette für Schwingungsdauer ausgeben
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen

