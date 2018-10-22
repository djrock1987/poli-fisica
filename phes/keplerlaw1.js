// Erstes Kepler-Gesetz
// Java-Applet (25.03.2000) umgewandelt
// 27.01.2016 - 31.01.2016

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel keplerlaw1_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorSun = "#ff0000";                                  // Farbe für Sonne
var colorPlanet = "#0000ff";                               // Farbe für Planet

// Sonstige Konstanten:

var PI2 = 2*Math.PI;                                       // Abkürzung für 2 pi
var DEG = Math.PI/180;                                     // Grad (Bogenmaß)
var X0 = 220, Y0 = 170;                                    // Ellipsenmittelpunkt (Pixel)
var A_PIX = 120;                                           // Große Halbachse (Pixel)
var AU = 1.4959787e11;                                     // Astronomische Einheit (m)
var GAMMA = 6.672e-11;                                     // Gravitationskonstante (SI)
var MS = 1.993e30;                                         // Sonnenmasse (kg)
var PER = 10;                                              // Umlaufzeit für Simulation (s)
var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz  

var aPlanets = [                                           // Große Halbachsen (AE)
  0.387, 0.723, 1.000, 1.52, 5.20, 9.55,
  19.2, 30.1, 39.7, 17.9];

var epsPlanets = [                                         // Numerische Exzentritäten
  0.206, 0.007, 0.017, 0.093, 0.048, 0.056,
  0.046, 0.009, 0.252, 0.967];    

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var ch;                                                    // Auswahlliste (Planeten)
var ip1, ip2;                                              // Eingabefelder (große Halbachse, numerische Exzentrität)
var op1;                                                   // Oberes Ausgabefeld (kleine Halbachse)
var bu;                                                    // Schaltknopf (Pause/Weiter)
var cbSlow;                                                // Optionsfeld (Zeitlupe)
var op2, op3, op4;                                         // Untere Ausgabefelder (Entfernung von der Sonne)
var cb1, cb2, cb3;                                         // Optionsfelder (Bahnellipse, Achsen, Verbindungsstrecken)

var bPix;                                                  // Kleine Halbachse (Pixel)
var ePix;                                                  // Lineare Exzentrität (Pixel)
var a, b;                                                  // Halbachsen (AE)
var eps;                                                   // Numerische Exzentrität
var c1;                                                    // Hilfskonstante
var unknown;                                               // Flag für erfundenen Planeten
var on;                                                    // Flag für Bewegung
var t0;                                                    // Bezugszeitpunkt
var timer;                                                 // Timer für Animation
var t;                                                     // Zeitvariable (s)
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
  ch = getElement("ch");                                   // Auswahlliste (Planeten)
  initSelect(ch);                                          // Auswahlliste vorbereiten
  getElement("ip1a",text02);                               // Erklärender Text (Große Halbachse)     
  ip1 = getElement("ip1b");                                // Eingabefeld (Große Halbachse)
  getElement("ip1c",au);                                   // Einheit (Große Halbachse)
  getElement("ip2a",text03);                               // Erklärender Text (Numerische Exzentrität)    
  ip2 = getElement("ip2b");                                // Eingabefeld (Numerische Exzentrität)
  getElement("op1a",text04);                               // Erklärender Text (Kleine Halbachse)
  op1 = getElement("op1b");                                // Ausgabefeld (Kleine Halbachse)
  getElement("op1c",au);                                   // Einheit (Kleine Halbachse)
  bu = getElement("bu",text05[1]);                         // Schaltknopf (Pause/Weiter)
  setButtonState(0);                                       // Zustand festlegen (Animation)
  cbSlow = getElement("cbSlow");                           // Optionsfeld (Zeitlupe)
  cbSlow.checked = false;                                  // Zeitlupe zunächst abgeschaltet
  getElement("lbSlow",text06);                             // Erklärender Text (Zeitlupe)
  getElement("lb",text07);                                 // Erklärender Text (Entfernung von der Sonne)
  getElement("op2a",text08);                               // Erklärender Text (Aktuelle Entfernung)
  op2 = getElement("op2b");                                // Ausgabefeld (Aktuelle Entfernung)
  getElement("op2c",au);                                   // Einheit (Aktuelle Entfernung)
  getElement("op3a",text09);                               // Erklärender Text (Minimale Entfernung)
  op3 = getElement("op3b");                                // Ausgabefeld (Minimale Entfernung)
  getElement("op3c",au);                                   // Einheit (Minimale Entfernung)
  getElement("op4a",text10);                               // Erklärender Text (Maximale Entfernung)
  op4 = getElement("op4b");                                // Ausgabefeld (Maximale Entfernung)
  getElement("op4c",au);                                   // Einheit (Maximale Entfernung)
  cb1 = getElement("cb1a");                                // Optionsfeld (Bahnellipse)
  getElement("cb1b",text11);                               // Erklärender Text (Bahnellipse)
  cb2 = getElement("cb2a");                                // Optionsfeld (Achsen)
  getElement("cb2b",text12);                               // Erklärender Text (Achsen)
  cb3 = getElement("cb3a");                                // Optionsfeld (Verbindungsstrecken)
  getElement("cb3b",text13);                               // Erklärender Text (Verbindungsstrecken)  
  cb1.checked = false;                                     // Bahnellipse zunächst nicht zeichnen
  cb2.checked = false;                                     // Achsen zunächst nicht zeichnen
  cb3.checked = false;                                     // Verbindungsstrecken zunächst nicht zeichnen
  getElement("author",author);                             // Autor (und Übersetzer)
  
  a = aPlanets[0]; eps = epsPlanets[0];                    // Bahndaten (Merkur) 
  unknown = false;                                         // Planet aus Liste
  updateInput();                                           // Eingabefelder aktualisieren
  actionEnd();                                             // Berechnungen, Ausgabefelder aktualisieren
  t = 0;                                                   // Zeitvariable (s)
  slow = false;                                            // Zeitlupe zunächst abschalten
  startAnimation();                                        // Animation anschalten
  
  ch.onchange = reactionSelect;                            // Reaktion auf Auswahl (Planet)
  ip1.onkeydown = reactionEnter;                           // Reaktion auf Eingabe (Große Halbachse)
  ip2.onkeydown = reactionEnter;                           // Reaktion auf Eingabe (Numerische Exzentrität)
  bu.onclick = reactionButton;                             // Reaktion auf Schaltknopf (Pause/Weiter)
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld (Zeitlupe) 
  cb1.onchange = paint;                                    // Reaktion auf Optionsfeld (Bahnellipse)                                    
  cb2.onchange = paint;                                    // Reaktion auf Optionsfeld (Achsen)
  cb3.onchange = paint;                                    // Reaktion auf Optionsfeld (Verbindungsstrecken)
  } // Ende der Methode start
  
// Initialisierung der Auswahlliste:
  
function initSelect () {
  for (var i=0; i<text01.length; i++) {                    // Für alle Indizes ...
    var o = document.createElement("option");              // Neues option-Element
    o.text = text01[i];                                    // Text des Elements übernehmen 
    ch.add(o);                                             // Element zur Liste hinzufügen
    }
  }
  
// Reaktion auf Auswahl in der Liste:
// Seiteneffekt t, unknown, a, eps, b, bPix, ePix, c1, Wirkung auf Ein- und Ausgabefelder

function reactionSelect () {
  t = 0;                                                   // Zeitvariable zurücksetzen
  var i = ch.selectedIndex;                                // Index
  var n = aPlanets.length;                                 // Zahl der Planeten usw.
  if (i == n && !unknown) {                                // Falls leeres Feld ausgewählt ...
    i--; ch.selectedIndex = i;                             // Index korrigieren
    }
  if (i < n) {                                             // Falls normales Feld ausgewählt ...
    unknown = false;                                       // Flag für erfundenen Planeten löschen
    a = aPlanets[i];                                       // Große Halbachse (AE)
    eps = epsPlanets[i];                                   // Numerische Exzentrität
    updateInput();                                         // Eingabefelder aktualisieren
    }
  actionEnd();                                             // Berechnungen, Ausgabe, neu zeichnen
  }
      
// Reaktion auf Eingabe mit Enter-Taste:
// Seiteneffekt unknown, a, eps, b, bPix, ePix, c1, Wirkung auf Auswahlliste, Ein- und Ausgabefelder
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13) {                                    // Falls Entertaste (Chrome) ...
    input();                                               // Eingabe
    actionEnd();                                           // Berechnungen, Ausgabe, neu zeichnen
    }                      
  }
  
// Zustandsfestlegung für Schaltknopf Pause/Weiter:
  
function setButtonState (st) {
  bu.state = st;                                           // Zustand speichern
  bu.innerHTML = text05[st];                               // Text aktualisieren
  }
  
// Reaktion auf Schaltknopf Pause/Weiter:
// Seiteneffekt bu, on, slow, timer, t0

function reactionButton () {
  setButtonState(1-bu.state);                              // Zustand des Schaltknopfs ändern
  on = (bu.state == 0);                                    // Flag für Animation
  slow = cbSlow.checked;                                   // Flag für Zeitlupe
  if (on) startAnimation();                                // Animation entweder fortsetzen ...
  else stopAnimation();                                    // ... oder unterbrechen
  if (!on) paint();                                        // Falls nötig, neu zeichnen
  }
  
// Reaktion auf Optionsfeld Zeitlupe:
// Seiteneffekt slow

function reactionSlow () {
  slow = cbSlow.checked;                                   // Flag für Zeitlupe
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
// Seiteneffekt b, bPix, ePix, c1

function calculation () {
  b = a*Math.sqrt(1-eps*eps);                              // Kleine Halbachse (AE)
  bPix = A_PIX*b/a;                                        // Kleine Halbachse (Pixel)
  ePix = eps*A_PIX;                                        // Lineare Exzentrität (Pixel)
  c1 = Math.sqrt((1+eps)/(1-eps));                         // Hilfskonstante
  }
  
// Berechnung der exzentrischen Anomalie durch Intervallschachtelung:
// m ... mittlere Anomalie (Bogenmaß)
// Voraussetzung: 0 <= m <= 2*Math.PI
// Rückgabewert: Lösung der Keplergleichung (e - epsilon sin e = m) im Bogenmaß

function excAnomaly (m) {
  var eL = 0, eR = PI2;                                    // Startwerte für Intervallgrenzen
  while (eR-eL > 1e-5) {                                   // Solange Intervallbreite größer als Genauigkeit ...
    var e = (eL+eR)/2;                                     // Mitte des Intervalls
    if (e-eps*Math.sin(e) < m) eL = e;                     // Lösung entweder in der rechten Hälfte ...
    else eR = e;                                           // ... oder in der linken Hälfte des bisherigen Intervalls
    }
  return e;                                                // Rückgabewert
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
// d ..... Zahl der Nachkommastellen
// fix ... Flag für Nachkommastellen (im Gegensatz zu gültigen Ziffern)
// min ... Minimum des erlaubten Bereichs
// max ... Maximum des erlaubten Bereichs
// Rückgabewert: Zahl
  
function inputNumber (ef, d, fix, min, max) {
  var s = ef.value;                                        // Zeichenkette im Eingabefeld
  s = s.replace(decimalSeparator,".");                     // Eventuell Komma in Punkt umwandeln
  var n = Number(s);                                       // Umwandlung in Zahl, falls möglich
  if (isNaN(n)) n = 0;                                     // Sinnlose Eingaben als 0 interpretieren 
  if (n < min) n = min;                                    // Falls Zahl zu klein, korrigieren
  if (n > max) n = max;                                    // Falls Zahl zu groß, korrigieren
  ef.value = ToString(n,d,fix);                            // Eingabe verwenden (eventuell korrigiert)
  return n;                                                // Rückgabewert
  }
   
// Gesamte Eingabe:
// Seiteneffekt a, eps, unknown, b, bPix, ePix, c1, Wirkung auf Auswahlliste

function input () {
  a = inputNumber(ip1,3,false,0.1,100);                    // Große Halbachse (AE)
  eps = inputNumber(ip2,3,true,0,0.999);                   // Numerische Exzentrität
  unknown = true;                                          // Erfundener Planet
  ch.selectedIndex = aPlanets.length;                      // Leeres Feld auswählen
  actionEnd();                                             // Berechnungen, Ausgabe, neu zeichnen
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ip1.value = ToString(a,3,false);                         // Große Halbachse (AE)
  ip2.value = ToString(eps,3,true);                        // Numerische Exzentrität
  }

// Aktualisierung der Ausgabefelder:

function updateOutput () {
  op1.innerHTML = ToString(b,3,false);                     // Kleine Halbachse (AE)
  op3.innerHTML = ToString(a*(1-eps),3,false);             // Minimale Entfernung von der Sonne (AE)
  op4.innerHTML = ToString(a*(1+eps),3,false);             // Maximale Entfernung von der Sonne (AE)
  }
  
// Hilfsroutine: Berechnungen, Ausgabe, neu zeichnen
// Seiteneffekt b, bPix, ePix, c1

function actionEnd () {
  calculation();                                           // Berechnungen durchführen
  updateOutput();                                          // Ausgabefelder aktualisieren
  if (!on) paint();                                        // Neu zeichnen
  }
   
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke 1
  }
  
// Linie der Dicke 1:
// (x1,y1) ... Anfangspunkt
// (x2,y2) ... Endpunkt
// c ......... Farbe (optional)
// w ......... Liniendicke (optional)

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
  newPath();                                               // Neuer Pfad
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausfüllen
  ctx.stroke();                                            // Rand zeichnen
  }
  
// Ellipse zeichnen (nicht ausgefüllt):
// x, y ... Koordinaten des Mittelpunkts (Pixel)
// a, b ... Halbachsen waagrecht/senkrecht (Pixel)
  
function ellipse (x, y, a, b, d) {
  if (a <= 0 || b <= 0) return;                            // Falls negative Halbachse, abbrechen
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.save();                                              // Grafikkontext speichern
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.translate(x,y);                                      // Ellipsenmittelpunkt als Ursprung des Koordinatensystems 
  ctx.scale(a,b);                                          // Skalierung in x- und y-Richtung
  ctx.arc(0,0,1,0,PI2,false);                              // Einheitskreis (wird durch Skalierung zur Ellipse)
  ctx.restore();                                           // Früheren Grafikkontext wiederherstellen
  ctx.stroke();                                            // Rand zeichnen
  }
  
// Text ausrichten:
// s ....... Zeichenkette
// t ....... Typ (0 für linksbündig, 1 für zentriert, 2 für rechtsbündig)
// (x,y) ... Position (Pixel)

function alignText (s, t, x, y) {
  if (t == 0) ctx.textAlign = "left";                      // Je nach Wert von t linksbündig ...
  else if (t == 1) ctx.textAlign = "center";               // ... oder zentriert ...
  else ctx.textAlign = "right";                            // ... oder rechtsbündig
  ctx.fillText(s,x,y);                                     // Text ausgeben
  }
  
// Bahnellipse mit Beschriftung:

function orbit () {
  ellipse(X0,Y0,A_PIX,bPix);                               // Ellipse
  if (eps == 0) return;                                    // Falls Kreisbahn, abbrechen
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  alignText(text17,0,X0+A_PIX+7,Y0+4);                     // Beschriftung Perihel
  alignText(text18,2,X0-A_PIX-7,Y0+4);                     // Beschriftung Aphel
  }
  
// Achsen der Ellipse:

function axes () {
  line(X0-A_PIX,Y0,X0+A_PIX,Y0);                           // Große Achse
  line(X0,Y0-bPix,X0,Y0+bPix);                             // Kleine Achse
  }
  
// Sonne und Brennpunkte:

function sun () {
  var posL = X0-ePix;                                      // Position des linken Brennpunkts (Pixel)
  var posR = X0+ePix;                                      // Position des rechten Brennpunkts (Pixel)
  circle(posR,Y0,4.5,colorSun);                            // Sonne
  ctx.fillStyle = colorSun;                                // Schriftfarbe
  alignText(text14,1,posR,Y0-6);                           // Beschriftung Sonne
  if (!cb3.checked) return;                                // Falls Markierung der Brennpunkte unnötig, abbrechen
  circle(X0-ePix,Y0,1.5,"#000000");                        // Linker Brennpunkt
  circle(X0+ePix,Y0,1.5,"#000000");                        // Rechter Brennpunkt
  if (eps == 0)                                            // Falls Kreisbahn ...
    alignText("F = F'",1,X0,Y0+16);                        // Beschriftung für identische Brennpunkte
  else {                                                   // Falls keine Kreisbahn ...
    var extr = (ePix >= 10);                               // Flag für sehr langgestreckte Ellipse
    alignText(symbolFocus1,extr?1:0,posR,Y0+16);           // Beschriftung für rechten Brennpunkt
    alignText(symbolFocus2,1,posL,Y0+16);                  // Beschriftung für linken Brennpunkt
    }
  }
      
// Planet und Verbindungsstrecken:
// Wirkung auf Ausgabefeld op2

function planet () {
  var n = Math.floor(t/PER);                               // Zahl der vollständigen Umläufe 
  if (n > 0) t -= n*PER;                                   // 0 < t < PER erzwingen
  var e = excAnomaly(PI2*t/PER);                           // Exzentrische Anomalie (Bogenmaß)
  var phi1 = 2*Math.atan(c1*Math.tan(e/2));                // Positionswinkel bezüglich Sonne (Bogenmaß)
  var rRel = 1-eps*Math.cos(e);                            // Relativer Abstand zur Sonne
  var rPix = A_PIX*rRel;                                   // Abstand zur Sonne (Pixel)  
  var rAU = rRel*a;                                        // Abstand zur Sonne (AE)
  op2.innerHTML = ToString(rAU,3,false);                   // Aktuellen Abstand in AE ausgeben
  var x = X0+ePix+rPix*Math.cos(phi1);                     // x-Koordinate Planet (Pixel)
  var y = Y0-rPix*Math.sin(phi1);                          // y-Koordinate Planet (Pixel)
  circle(x,y,2.5,colorPlanet);                             // Planet
  var yy = (y<Y0 ? y-6 : y+16);                            // y-Koordinate für Beschriftung (Pixel)
  var i = ch.selectedIndex;                                // Index in der Auswahlliste
  var s = text15;                                          // Zeichenkette Planet
  if (i == 8) s = text01[8];                               // Zeichenkette Pluto
  if (i == 9) s = text16;                                  // Zeichenkette Komet
  alignText(s,1,x,yy);                                     // Beschriftung Planet/Zwergplanet/Komet
  if (!cb3.checked) return;                                // Falls Verbindungsstrecken unnötig, abbrechen
  line(X0-ePix,Y0,x,y);                                    // Verbindungsstrecke zum linken Brennpunkt 
  line(X0+ePix,Y0,x,y);                                    // Verbindungsstrecke zum rechten Brennpunkt 
  }
  
// Vergleichslänge:

function scale () {
  var len = A_PIX/a;                                       // Umrechnungsfaktor (Pixel pro AE)
  var s = "1";                                             // Zeichenkette für 1 AE (Normalfall)
  if (len > 400) {                                         // Falls Vergleichslänge 1 AE zu groß ...
    len /= 10;                                             // Umrechnungsfaktor durch 10 dividieren
    s = ToString(0.1,1,true);                              // Zeichenkette für 0,1 AE
    }
  else if (len < 40) {                                     // Falls Vergleichslänge 1 AE zu klein ...
    len *= 10;                                             // Umrechnungsfaktor mit 10 multiplizieren
    s = "10";                                              // Zeichenkette für 10 AE
    }    
  s += " "+auUnicode;                                      // Leerzeichen und Einheit AE hinzufügen  
  var xL = X0-len/2, xR = X0+len/2;                        // x-Koordinaten der Endpunkte (Pixel)
  var y = height-50;                                       // y-Koordinate der Linie (Pixel)
  line(xL,y,xR,y);                                         // Linie (Vergleichslänge)
  line(xL,y-5,xL,y+5);                                     // Kurzer Strich am linken Ende 
  line(xR,y-5,xR,y+5);                                     // Kurzer Strich am rechten Ende
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  alignText(s,1,X0,y+15);                                  // Beschriftung
  }
    
// Grafikausgabe:
// Seiteneffekt t, t0
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  ctx.font = FONT;                                         // Zeichensatz
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // ... Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // ... Länge des Zeitintervalls (s)
    if (slow) dt /= 10;                                    // ... Falls Zeitlupe, Zeitintervall durch 10 dividieren
    t += dt;                                               // ... Zeitvariable aktualisieren
    t0 = t1;                                               // ... Neuer Bezugszeitpunkt
    }
  if (cb1.checked) orbit();                                // Bahnellipse, falls gewünscht 
  if (cb2.checked) axes();                                 // Achsen der Ellipse, falls gewünscht
  sun();                                                   // Sonne und Brennpunkte 
  planet();                                                // Planet und Verbindungslinien
  scale();                                                 // Vergleichslänge
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen

