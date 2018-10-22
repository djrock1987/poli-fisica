// Zweites Kepler-Gesetz
// Java-Applet (04.04.2000) umgewandelt
// 05.02.2016 - 10.02.2016

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel keplerlaw2_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorSun = "#ff0000";                                  // Farbe für Sonne
var colorPlanet = "#0000ff";                               // Farbe für Planet
var color1 = "#00ff00";                                    // Farbe für Sektor 1
var color2 = "#ff00ff";                                    // Farbe für Sektor 2

// Sonstige Konstanten:

var PI2 = 2*Math.PI;                                       // Abkürzung für 2 pi
var DEG = Math.PI/180;                                     // Grad (Bogenmaß)
var X0 = 220, Y0 = 220;                                    // Ellipsenmittelpunkt (Pixel)
var A_PIX = 120;                                           // Große Halbachse (Pixel)
var AU = 1.4959787e11;                                     // Astronomische Einheit (m)
var GAMMA = 6.672e-11;                                     // Gravitationskonstante (SI)
var MS = 1.993e30;                                         // Sonnenmasse (kg)
var PER = 10;                                              // Umlaufzeit für Simulation (s)
var FONT1 = "normal normal bold 12px sans-serif";          // Zeichensatz 1 (Vergleichslänge)
var FONT2 = "normal normal bold 15px monospace";           // Zeichensatz 2 (Uhren)
var C0 = GAMMA*MS/AU;                                      // Hilfskonstante

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
var ip1, ip2;                                              // Eingabefelder (große Halbachse, numerische Exzentrität
var bu;                                                    // Schaltknopf (Pause/Weiter)
var cbSlow;                                                // Optionsfeld (Zeitlupe)
var op1, op2, op3, op4;                                    // Ausgabefelder (Entfernung, akt./min./max. Geschwindigkeit)
var cb1, cb2;                                              // Optionsfelder (Sektoren, Geschwindigkeitsvektor)
var sl;                                                    // Schieberegler

var bPix;                                                  // Kleine Halbachse (Pixel)
var ePix;                                                  // Lineare Exzentrität (Pixel)
var a, b;                                                  // Halbachsen (AE)
var a2, b2;                                                // Halbachsenquadrate (AE^2)
var eps;                                                   // Numerische Exzentrität
var c1;                                                    // Hilfskonstante
var eTotal;                                                // Gesamtenergie/Planetenmasse (J/kg)
var vMin, vMax;                                            // Minimal- und Maximalgeschwindigkeit (m/s)
var phi1, phi2;                                            // Positionswinkel Sektorenmitte (bezüglich Sonne, Bogenmaß)
var phi1Min, phi2Min;                                      // Minimale Positionswinkel der Sektoren (bezüglich Sonne, Bogenmaß)
var phi1Max, phi2Max;                                      // Maximale Positionswinkel der Sektoren (bezüglich Sonne, Bogenmaß)
var part;                                                  // Bruchteil für Sektorenfläche
var nr;                                                    // Nummer des Sektors (1, 2 oder 0, mit Maus ausgewählt)
var t0S1, t0S2;                                            // Zeitpunkt des Eintritts in Sektor 1 bzw. 2
var tS1, tS2;                                              // Zeit seit dem Eintritt in Sektor 1 bzw. 2
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
  initSelect();                                            // Auswahlliste vorbereiten
  getElement("ip1a",text02);                               // Erklärender Text (Große Halbachse)     
  ip1 = getElement("ip1b");                                // Eingabefeld (Große Halbachse)
  getElement("ip1c",au);                                   // Einheit (Große Halbachse)
  getElement("ip2a",text03);                               // Erklärender Text (Numerische Exzentrität)    
  ip2 = getElement("ip2b");                                // Eingabefeld (Numerische Exzentrität)
  bu = getElement("bu",text04[1]);                         // Schaltknopf (Pause/Weiter)
  setButtonState(0);                                       // Zustand festlegen (Animation)
  cbSlow = getElement("cbSlow");                           // Optionsfeld (Zeitlupe)
  cbSlow.checked = false;                                  // Zeitlupe zunächst abgeschaltet
  getElement("lbSlow",text05);                             // Erklärender Text (Zeitlupe)
  getElement("op1a",text06[0]);                            // Erklärender Text, obere Zeile (Entfernung zur Sonne)
  getElement("op1b",text06[1]);                            // Erklärender Text, untere Zeile (Entfernung zur Sonne)
  op1 = getElement("op1c");                                // Ausgabefeld (Entfernung zur Sonne)
  getElement("op1d",au);                                   // Einheit (Entfernung zur Sonne)
  getElement("lb",text07);                                 // Erklärender Text (Geschwindigkeit)
  getElement("op2a",text08);                               // Erklärender Text (Aktuelle Geschwindigkeit)
  op2 = getElement("op2b");                                // Ausgabefeld (Aktuelle Geschwindigkeit)
  getElement("op2c",kilometerPerSecond);                   // Einheit (Aktuelle Geschwindigkeit)
  getElement("op3a",text09);                               // Erklärender Text (Minimale Geschwindigkeit)
  op3 = getElement("op3b");                                // Ausgabefeld (Minimale Geschwindigkeit)
  getElement("op3c",kilometerPerSecond);                   // Einheit (Minimale Geschwindigkeit)
  getElement("op4a",text10);                               // Erklärender Text (Maximale Geschwindigkeit)
  op4 = getElement("op4b");                                // Ausgabefeld (Maximale Geschwindigkeit)
  getElement("op4c",kilometerPerSecond);                   // Einheit (Maximale Geschwindigkeit)
  cb1 = getElement("cb1a");                                // Optionsfeld (Sektoren)
  getElement("cb1b",text11);                               // Erklärender Text (Sektoren)
  sl = getElement("sl");                                   // Schieberegler (Sektorengröße)
  sl.value = 4;                                            // Anfangsposition Schieberegler
  cb2 = getElement("cb2a");                                // Optionsfeld (Geschwindigkeitsvektor)
  getElement("cb2b",text12);                               // Erklärender Text (Geschwindigkeitsvektor)

  cb1.checked = true;                                      // Sektoren und Uhren zeichnen
  cb2.checked = false;                                     // Geschwindigkeitsvektor zunächst nicht zeichnen
  getElement("author",author);                             // Autor (und Übersetzer)
  
  a = aPlanets[0]; eps = epsPlanets[0];                    // Bahndaten (Merkur) 
  unknown = false;                                         // Planet aus Liste
  updateInput();                                           // Eingabefelder aktualisieren
  phi1 = 0;                                                // Positionswinkel Sektorenmitte 1 (bezüglich Sonne, Bogenmaß)
  phi2 = Math.PI;                                          // Positionswinkel Sektorenmitte 2 (bezüglich Sonne, Bogenmaß)
  part = 0.1;                                              // Bruchteil für Sektorenfläche
  nr = 0;                                                  // Zunächst kein Sektor ausgewählt
  actionEnd();                                             // Berechnungen, Ausgabefelder aktualisieren
  t = 0;                                                   // Zeitvariable (s)
  slow = false;                                            // Zeitlupe zunächst abgeschaltet
  startAnimation();                                        // Animation angeschaltet
  
  ch.onchange = reactionSelect;                            // Reaktion auf Auswahl (Planet)
  ip1.onkeydown = reactionEnter;                           // Reaktion auf Eingabe (Große Halbachse)
  ip2.onkeydown = reactionEnter;                           // Reaktion auf Eingabe (Numerische Exzentrität)
  bu.onclick = reactionButton;                             // Reaktion auf Schaltknopf (Pause/Weiter)
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld (Zeitlupe) 
  cb1.onchange = paint;                                    // Reaktion auf Optionsfeld (Sektoren)                                    
  cb2.onchange = paint;                                    // Reaktion auf Optionsfeld (Geschwindigkeitsvektor)
  sl.onchange = reactionSlider;                            // Reaktion auf Schieberegler
  sl.oninput = reactionSlider;                             // Reaktion auf Schieberegler
  sl.onclick = reactionSlider;                             // Reaktion auf Schieberegler
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Drücken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Berührung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Berührung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers        
  
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
// Seiteneffekt t, unknown, a, eps, phi1, phi2, b, a2, b2, bPix, ePix, c1, vMin, vMax, eTotal, t0, phi1Min, phi1Max, phi2Min, phi2Max, 
// t0S1, t0S2, tS1, tS2, Wirkung auf Ein- und Ausgabefelder

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
// Seiteneffekt a, eps, unknown, phi1, phi2, b, a2, b2, bPix, ePix, c1, vMin, vMax, eTotal, t, t0, phi1Min, phi1Max, phi2Min, phi2Max,
// t0S1, t0S2, tS1, tS2, Wirkung auf Auswahlliste, Ein- und Ausgabefelder
  
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
  bu.innerHTML = text04[st];                               // Text aktualisieren
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
  
// Reaktion auf Schieberegler:
// Seiteneffekt part, phi1, phi2 b, a2, b2, bPix, ePix, c1, vMin, vMax, eTotal, t, t0, phi1Min, phi1Max, phi2Min, phi2Max, t0S1, t0S2, tS1, tS2

function reactionSlider () {
  part = sl.value/40;                                      // Bruchteil für Sektoren
  actionEnd();                                             // Berechnungen, Ausgabe, neu zeichnen
  }
  
// Reaktion auf Drücken der Maustaste:
// Seiteneffekt nr
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen (Auswahl eines Sektors)                    
  }
  
// Reaktion auf Berührung:
// Seiteneffekt nr
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Berührpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen (Auswahl eines Sektors)
  if (nr != 0) e.preventDefault();                         // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Loslassen der Maustaste:
  
function reactionMouseUp (e) {                                             
  nr = 0;                                                  // Zugmodus deaktivieren                             
  }
  
// Reaktion auf Ende der Berührung:
  
function reactionTouchEnd (e) {             
  nr = 0;                                                  // Zugmodus deaktivieren
  }
  
// Reaktion auf Bewegen der Maus:
  
function reactionMouseMove (e) {            
  if (nr == 0) return;                                     // Abbrechen, falls Zugmodus nicht aktiviert
  reactionMove(e.clientX,e.clientY);                       // Position ermitteln, rechnen und neu zeichnen
  }
  
// Reaktion auf Bewegung des Fingers:
  
function reactionTouchMove (e) {            
  if (nr == 0) return;                                     // Abbrechen, falls Zugmodus nicht aktiviert
  var obj = e.changedTouches[0];                           // Liste der neuen Fingerpositionen     
  reactionMove(obj.clientX,obj.clientY);                   // Position ermitteln, rechnen und neu zeichnen
  e.preventDefault();                                      // Standardverhalten verhindern                          
  } 
  
// Hilfsroutine: Reaktion auf Mausklick oder Berühren mit dem Finger (Auswahl eines Sektors):
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt nr

function reactionDown (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel)  
  if (insideSector(1,u,v)) nr = 1;                         // Entweder Sektor 1 ...
  else if (insideSector(2,u,v)) nr = 2;                    // ... oder Sektor 2 ...
  else nr = 0;                                             // ... oder kein Sektor ausgewählt
  } 
  
// Hilfsroutine: Reaktion auf Bewegung von Maus oder Finger (Änderung):
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt phi1, phi2, t, t0, phi1Min, phi1Max, phi2Min, phi2Max, t0S1, t0S2, tS1, tS2

function reactionMove (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel)
  var w = atan2(Y0-v,u-X0-ePix);                           // Positionswinkel (Bogenmaß, zwischen 0 und 2 pi)
  if (nr == 1) {phi1 = w; moveSector(2);}                  // Entweder Sektor 1 ...
  if (nr == 2) {phi2 = w; moveSector(1);}                  // ... oder Sektor 2 drehen
  if (!on) paint();                                        // Falls Animation gestoppt, neu zeichnen
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
// Seiteneffekt b, a2, b2, bPix, ePix, c1, vMin, vMax, eTotal

function calculation () {
  b = a*Math.sqrt(1-eps*eps);                              // Kleine Halbachse (AE)
  a2 = a*a; b2 = b*b;                                      // Halbachsenquadrate (AE^2)
  bPix = A_PIX*b/a;                                        // Kleine Halbachse (Pixel)
  ePix = eps*A_PIX;                                        // Lineare Exzentrität (Pixel)
  c1 = Math.sqrt((1+eps)/(1-eps));                         // Hilfskonstante
  var v0 = b/(a*Math.sqrt(a/C0));                          // Hilfsgröße für Geschwindigkeit
  vMin = v0/(1+eps);                                       // Minimale Geschwindigkeit (m/s) 
  vMax = v0/(1-eps);                                       // Maximale Geschwindigkeit (m/s)
  eTotal = vMin*vMin/2-C0/(a*(1+eps));                     // Gesamtenergie/Planetenmasse (J/kg)
  }
  
// Berechnung der exzentrischen Anomalie durch Intervallschachtelung:
// m ... mittlere Anomalie (Bogenmaß, 0 <= m <= 2 pi vorausgesetzt)
// Rückgabewert: Lösung der Keplergleichung (e - epsilon sin e = m) im Bogenmaß (zwischen 0 und 2 pi)

function excentricAnomaly (m) {
  var eL = 0, eR = PI2;                                    // Startwerte für Intervallgrenzen
  while (eR-eL > 1e-5) {                                   // Solange Intervallbreite größer als Genauigkeit ...
    var e = (eL+eR)/2;                                     // Mitte des Intervalls
    if (e-eps*Math.sin(e) < m) eL = e;                     // Lösung entweder in der rechten Hälfte ...
    else eR = e;                                           // ... oder in der linken Hälfte des bisherigen Intervalls
    }
  return e;                                                // Rückgabewert
  }
  
// Hilfsroutine: Variante von Math.atan2 mit Werten zwischen 0 und 2 pi

function atan2 (dy, dx) {
  var w = Math.atan2(dy,dx);                               // Wert von Math.atan2
  return (w>=0 ? w : w+PI2);                               // Rückgabewert (eventuell korrigiert)
  }
  
// Positionswinkel bezüglich Sonne:
// e ... exzentrische Anomalie (Bogenmaß)
// Rückgabewert: Positionswinkel bezüglich Sonne (Gegenuhrzeigersinn, Bogenmaß, zwischen 0 und 2 pi)

function positionAngle (e) {
  var x = A_PIX*Math.cos(e), y = bPix*Math.sin(e);         // Position bezüglich Sonne (Pixel)
  return atan2(y,x-ePix);                                  // Rückgabewert
  }
  
// Relativer Positionswinkel:
// phi0 .... Gegebener Positionswinkel (bezüglich Sonne, Bogenmaß)
// (x,y) ... Position
// Rückgabewert: Positionswinkel, bezogen auf die durch phi0 gegebene Halbgerade von der Sonne weg (Bogenmaß, zwischen -pi und +pi)

function diff (phi0, x, y) {
  var d = Math.atan2(Y0-y,x-X0-ePix)-phi0;                 // Vorläufiger Positionswinkel
  while (d < -Math.PI) d += PI2;                           // Zu kleinen Wert verhindern
  while (d > Math.PI) d -= PI2;                            // Zu großen Wert verhindern
  return d;                                                // Rückgabewert
  }
  
// Überprüfung, ob Punkt innerhalb von Sektor:
// s ....... Nummer des Sektors (1 oder 2)
// (x,y) ... Position des Punkts (Pixel)

function insideSector (s, x, y) {
  var sector1 = (s == 1);                                     // Überprüfung, ob Sektor 1
  var phi = (sector1 ? phi1 : phi2);                          // Positionswinkel Sektorenmitte
  var phiMin = (sector1 ? phi1Min : phi2Min);                 // Positionswinkel Sektorenanfang
  if (phiMin > phi) phiMin -= PI2;                            // Wert größer als phi verhindern
  var phiMax = (sector1 ? phi1Max : phi2Max);                 // Positionswinkel Sektorenende
  if (phiMax < phi) phiMax += PI2;                            // Wert kleiner als phi verhindern
  if (diff(phiMin,x,y) > 0 && diff(phi,x,y) < 0) return true; // Punkt zwischen Anfang und Mitte des Sektors
  if (diff(phiMax,x,y) < 0 && diff(phi,x,y) > 0) return true; // Punkt zwischen Mitte und Ende des Sektors
  return false;                                               // Punkt außerhalb des Sektors
  }
  
// Drehung eines Sektors (falls nötig):
// s ... Nummer des zu drehenden Sektors (1 oder 2)
// Seiteneffekt phi1 bzw. phi2

function moveSector (s) {
  var s0 = 3-s;                                            // Nummer des anderen Sektors
  var dir = 0;                                             // Variable für Drehrichtung
  var sector1 = (s == 1);                                  // Überprüfung, ob Sektor 1
  var phi0 = (sector1 ? phi2 : phi1);                      // Positionswinkel für Mitte des festen Sektors
  var phiMin = (sector1 ? phi1Min : phi2Min);              // Positionswinkel für Anfang des zu drehenden Sektors
  var phiMax = (sector1 ? phi1Max : phi2Max);              // Positionswinkel für Ende des zu drehenden Sektors
  var x = X0+ePix+100*Math.cos(phiMin);                    // Punkt am Anfang des zu drehenden Sektors, x-Koordinate
  var y = Y0-100*Math.sin(phiMin);                         // Punkt am Anfang des zu drehenden Sektors, y-Koordinate
  if (insideSector(s0,x,y)) dir = 1;                       // Falls Punkt im festen Sektor, Drehung im Gegenuhrzeigersinn 
  x = X0+ePix+100*Math.cos(phiMax);                        // Punkt am Ende des zu drehenden Sektors, x-Koordinate
  y = Y0-100*Math.sin(phiMax);                             // Punkt am Ende des zu drehenden Sektors, y-Koordinate
  if (insideSector(s0,x,y)) dir = -1;                      // Falls Punkt im festen Sektor, Drehung im Uhrzeigersinn
  if (dir == 0) return;                                    // Falls keine Drehung nötig, abbrechen
  var e2 = 2*Math.atan(Math.tan(phi0/2)/c1);               // Exzentrische Anomalie für Mitte des festen Sektors
  if (e2 < 0) e2 += PI2;                                   // Negativen Wert verhindern
  var m2 = e2-eps*Math.sin(e2);                            // Mittlere Anomalie für Mitte des festen Sektors
  var m1 = m2+dir*part*PI2;                                // Mittlere Anomalie für Mitte des gedrehten Sektors
  if (m1 < 0) m1 += PI2;                                   // Negativen Wert verhindern
  if (m1 > PI2) m1 -= PI2;                                 // Wert über 2 pi verhindern
  var e1 = excentricAnomaly(m1);                           // Exzentrische Anomalie für Mitte des gedrehten Sektors
  var phiNew = 2*Math.atan(c1*Math.tan(e1/2));             // Positionswinkel für Mitte des gedrehten Sektors
  if (phiNew < 0) phiNew += PI2;                           // Negativen Wert verhindern
  if (sector1) phi1 = phiNew; else phi2 = phiNew;          // Positionswinkel für Mitte des gedrehten Sektors
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
// Seiteneffekt a, eps, unknown, Wirkung auf Auswahlliste

function input () {
  a = inputNumber(ip1,3,false,0.1,100);                    // Große Halbachse (AE)
  eps = inputNumber(ip2,3,true,0,0.999);                   // Numerische Exzentrität
  unknown = true;                                          // Erfundener Planet
  ch.selectedIndex = aPlanets.length;                      // Leeres Feld auswählen
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ip1.value = ToString(a,3,false);                         // Große Halbachse (AE)
  ip2.value = ToString(eps,3,true);                        // Numerische Exzentrität
  }

// Aktualisierung der Ausgabefelder:

function updateOutput () {
  op3.innerHTML = ToString(vMin/1000,3,false);             // Minimale Geschwindigkeit (km/s)
  op4.innerHTML = ToString(vMax/1000,3,false);             // Maximale Geschwindigkeit (km/s)
  }
  
// Hilfsroutine: Berechnungen, Ausgabe, neu zeichnen
// Seiteneffekt phi1, phi2 b, a2, b2, bPix, ePix, c1, vMin, vMax, eTotal, t, t0, phi1Min, phi1Max, phi2Min, phi2Max, t0S1, t0S2, tS1, tS2

function actionEnd () {
  phi1 = 0; phi2 = Math.PI;
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
  
// Ausgefülltes Rechteck:
// x, y ... Ecke links oben (Pixel)
// w, h ... Abmessungen (Pixel)
// c ...... Füllfarbe

function rectangle (x, y, w, h, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.fillRect(x,y,w,h);                                   // Ausgefülltes Rechteck
  ctx.strokeRect(x,y,w,h);                                 // Rand
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
  
// Pfeil zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// w ........ Liniendicke (optional, Defaultwert 1)
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
  
// Kreisscheibe mit schwarzem Rand:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... Füllfarbe (optional)

function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                // Füllfarbe
  newPath();                                               // Neuer Pfad
  ctx.arc(x,y,r,0,PI2,true);                               // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausfüllen
  ctx.stroke();                                            // Rand zeichnen
  }
  
// Achsenparallele Ellipse (nicht ausgefüllt):
// x, y ... Koordinaten des Mittelpunkts (Pixel)
// a, b ... Halbachsen waagrecht/senkrecht (Pixel)
  
function ellipse (x, y, a, b) {
  if (a <= 0 || b <= 0) return;                            // Falls negative Halbachse, abbrechen
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.save();                                              // Grafikkontext speichern
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.translate(x,y);                                      // Ellipsenmittelpunkt als Ursprung des Koordinatensystems 
  ctx.scale(a,b);                                          // Skalierung in x- und y-Richtung
  ctx.arc(0,0,1,0,PI2,false);                              // Einheitskreis (wird durch Skalierung zur Ellipse)
  ctx.restore();                                           // Früheren Grafikkontext wiederherstellen
  ctx.stroke();                                            // Ellipse zeichnen
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
  
// Hilfsroutine: Zeit seit dem Eintritt in einen Sektor
// s ....... Nummer des Sektors (1 oder 2)

function timeSector (s) {
  var t0 = (s==1 ? t0S1 : t0S2);                           // Zeit des Eintritts in den Sektor
  var dt = t-t0;                                           // Zeit seit dem Eintritt in den Sektor
  if (dt < 0) dt += PER;                                   // Negativen Wert verhindern
  return Math.min(dt,part*PER);                            // Rückgabewert (nicht über Maximalwert)
  }
      
// Planet, Verbindungsstrecke, Geschwindigkeitsvektor:
// Seiteneffekt tS1, tS2
// Wirkung auf Ausgabefelder op1, op2

function planet () {
  var n = Math.floor(t/PER);                               // Zahl der vollständigen Umläufe 
  if (n > 0) t -= n*PER;                                   // 0 <= t < PER erzwingen
  var e = excentricAnomaly(PI2*t/PER);                     // Exzentrische Anomalie (Bogenmaß)
  var phi = 2*Math.atan(c1*Math.tan(e/2));                 // Positionswinkel bezüglich Sonne (Bogenmaß)
  var rRel = 1-eps*Math.cos(e);                            // Relativer Abstand zur Sonne
  var rPix = A_PIX*rRel;                                   // Abstand zur Sonne (Pixel)  
  var rAU = rRel*a;                                        // Abstand zur Sonne (AE)
  op1.innerHTML = ToString(rAU,3,false);                   // Aktuellen Abstand in AE ausgeben
  var x = X0+ePix+rPix*Math.cos(phi);                      // x-Koordinate Planet (Pixel)
  var y = Y0-rPix*Math.sin(phi);                           // y-Koordinate Planet (Pixel)
  circle(x,y,2.5,colorPlanet);                             // Planet
  line(X0+ePix,Y0,x,y);                                    // Verbindungsstrecke zum rechten Brennpunkt (Sonne) 
  var eKin = eTotal+C0/rAU;                                // Kinetische Energie/Planetenmasse (J/kg)
  var v = Math.sqrt(2*eKin);                               // Geschwindigkeit (m/s)
  op2.innerHTML = ToString(v/1000,3,false);                // Aktuelle Geschwindigkeit in km/s ausgeben
  tS1 = (insideSector(1,x,y) ? timeSector(1) : part*PER);  // Zeit seit dem Eintritt in Sektor 1
  tS2 = (insideSector(2,x,y) ? timeSector(2) : part*PER);  // Zeit seit dem Eintritt in Sektor 2
  if (!cb2.checked) return;                                // Falls Geschwindigkeitsvektor unnötig, abbrechen
  var vx = -a2*rAU*Math.sin(phi);                          // x-Komponente Geschwindigkeit
  var vy = b2*(a*eps+rAU*Math.cos(phi));                   // y-Komponente Geschwindigkeit
  var vv = Math.sqrt(vx*vx+vy*vy);                         // Betrag der Geschwindigkeit
  var c = 100*v/(vv*vMax);                                 // Umrechnungsfaktor
  vx *= c; vy *= c;                                        // Geschwindigkeitsvektor (Pixel)
  arrow(x,y,x+vx,y-vy,2.5);                                // Pfeil
  }
  
// Ellipsensektor:
// s ... Nummer des Sektors (1 oder 2)
// Seiteneffekt phi1Min, phi1Max, t0S1 bzw. phi2Min, phi2Max, t0S2
  
function sector (s) {
  var sector1 = (s == 1);                                  // Überprüfung, ob Sektor 1
  var phi = (sector1 ? phi1 : phi2);                       // Positionswinkel Sektorenmitte
  var e = 2*Math.atan(Math.tan(phi/2)/c1);                 // Exzentrische Anomalie Sektorenmitte
  if (e < 0) e += PI2;                                     // Wert zwischen 0 und 2 pi erzwingen
  var m = e-eps*Math.sin(e);                               // Mittlere Anomalie Sektorenmitte
  var m0 = m-part*Math.PI;                                 // Mittlere Anomalie Sektorenanfang 
  if (m0 < 0) m0 += PI2;                                   // Wert zwischen 0 und 2 pi erzwingen
  var m1 = m+part*Math.PI;                                 // Mittlere Anomalie Sektorenende 
  if (m1 > PI2) m1 -= PI2;                                 // Wert zwischen 0 und 2 pi erzwingen
  var e0 = excentricAnomaly(m0);                           // Exzentrische Anomalie Sektorenanfang
  var e1 = excentricAnomaly(m1);                           // Exzentrische Anomalie Sektorenende
  if (sector1) {                                           // Falls Sektor 1 ...
    phi1Min = positionAngle(e0);                           // Positionswinkel Sektorenanfang
    phi1Max = positionAngle(e1);                           // Positionswinkel Sektorenende
    t0S1 = PER*m0/PI2;                                     // Zeit des Eintritts in den Sektor
    }
  else {                                                   // Falls Sektor 2 ...
    phi2Min = positionAngle(e0);                           // Positionswinkel Sektorenanfang
    phi2Max = positionAngle(e1);                           // Positionswinkel Sektorenende
    t0S2 = PER*m0/PI2;                                     // Zeit des Eintritts in den Sektor
    }
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.save();                                              // Grafikkontext speichern
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.translate(X0,Y0);                                    // Ellipsenmittelpunkt als Ursprung des Koordinatensystems 
  ctx.scale(A_PIX,bPix);                                   // Skalierung in x- und y-Richtung
  ctx.arc(0,0,1,PI2-e0,PI2-e1,true);                       // Einheitskreisbogen (wird durch Skalierung zu Ellipsenbogen)
  ctx.restore();                                           // Früheren Grafikkontext wiederherstellen
  ctx.lineTo(X0+ePix,Y0);                                  // Weiter zum rechten Brennpunkt (Sonne)
  ctx.closePath();                                         // Zurück zum Anfangspunkt
  ctx.fillStyle = (sector1 ? color1 : color2);             // Füllfarbe
  ctx.fill(); ctx.stroke();                                // Ausgefüllter Sektor mit Rand  
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
  ctx.font = FONT1;                                        // Zeichensatz
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  alignText(s,1,X0,y+15);                                  // Beschriftung
  }
  
// Uhr:
// nr ... Nummer (1 oder 2)
  
function clock (nr) {
  var c1 = (nr == 1);                                      // Überprüfung, ob Nummer 1
  var x = (c1 ? 2*X0-100 : 100), y = 50;                   // Position des Mittelpunkts (Pixel)
  var c = (c1 ? color1 : color2);                          // Gehäusefarbe
  var t = (c1 ? tS1 : tS2);                                // Angezeigte Zeit
  var s = ToString(t/PER,3,true)+" "+symbolPeriod;         // Zeichenkette
  rectangle(x-60,y-15,120,30,c);                           // Gehäuse
  rectangle(x-50,y-10,100,20,"#000000");                   // Anzeige
  ctx.font = FONT2;                                        // Zeichensatz
  ctx.fillStyle = "#ff0000";                               // Schriftfarbe
  alignText(s,1,x,y+5);                                    // Zeichenkette ausgeben
  }
    
// Grafikausgabe:
// Seiteneffekt t, t0, phi1Min, phi1Max, phi2Min, phi2Max, t0S1, t0S2, tS1, tS2
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // Neuer Bezugszeitpunkt
    var dt = (t1-t0)/1000;                                 // Länge des Zeitintervalls (s)
    if (slow) dt /= 10;                                    // Falls Zeitlupe, Zeitintervall durch 10 dividieren
    t += dt;                                               // Zeitvariable aktualisieren
    t0 = t1;                                               // Neuen Bezugszeitpunkt übernehmen
    }
  if (cb1.checked) {                                       // Falls Option Sektoren ausgewählt ...
    sector(1); sector(2);                                  // Sektoren
    clock(1); clock(2);                                    // Uhren
    } 
  ellipse(X0,Y0,A_PIX,bPix);                               // Bahnellipse
  circle(X0+ePix,Y0,4.5,colorSun);                         // Sonne 
  planet();                                                // Planet, Verbindungslinie, Geschwindigkeitsvektor
  scale();                                                 // Vergleichslänge
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen

