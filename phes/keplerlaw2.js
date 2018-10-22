// Zweites Kepler-Gesetz
// Java-Applet (04.04.2000) umgewandelt
// 05.02.2016 - 10.02.2016

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabh�ngige Texte sind einer eigenen Datei (zum Beispiel keplerlaw2_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorSun = "#ff0000";                                  // Farbe f�r Sonne
var colorPlanet = "#0000ff";                               // Farbe f�r Planet
var color1 = "#00ff00";                                    // Farbe f�r Sektor 1
var color2 = "#ff00ff";                                    // Farbe f�r Sektor 2

// Sonstige Konstanten:

var PI2 = 2*Math.PI;                                       // Abk�rzung f�r 2 pi
var DEG = Math.PI/180;                                     // Grad (Bogenma�)
var X0 = 220, Y0 = 220;                                    // Ellipsenmittelpunkt (Pixel)
var A_PIX = 120;                                           // Gro�e Halbachse (Pixel)
var AU = 1.4959787e11;                                     // Astronomische Einheit (m)
var GAMMA = 6.672e-11;                                     // Gravitationskonstante (SI)
var MS = 1.993e30;                                         // Sonnenmasse (kg)
var PER = 10;                                              // Umlaufzeit f�r Simulation (s)
var FONT1 = "normal normal bold 12px sans-serif";          // Zeichensatz 1 (Vergleichsl�nge)
var FONT2 = "normal normal bold 15px monospace";           // Zeichensatz 2 (Uhren)
var C0 = GAMMA*MS/AU;                                      // Hilfskonstante

var aPlanets = [                                           // Gro�e Halbachsen (AE)
  0.387, 0.723, 1.000, 1.52, 5.20, 9.55,
  19.2, 30.1, 39.7, 17.9];

var epsPlanets = [                                         // Numerische Exzentrit�ten
  0.206, 0.007, 0.017, 0.093, 0.048, 0.056,
  0.046, 0.009, 0.252, 0.967];    

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var ch;                                                    // Auswahlliste (Planeten)
var ip1, ip2;                                              // Eingabefelder (gro�e Halbachse, numerische Exzentrit�t
var bu;                                                    // Schaltknopf (Pause/Weiter)
var cbSlow;                                                // Optionsfeld (Zeitlupe)
var op1, op2, op3, op4;                                    // Ausgabefelder (Entfernung, akt./min./max. Geschwindigkeit)
var cb1, cb2;                                              // Optionsfelder (Sektoren, Geschwindigkeitsvektor)
var sl;                                                    // Schieberegler

var bPix;                                                  // Kleine Halbachse (Pixel)
var ePix;                                                  // Lineare Exzentrit�t (Pixel)
var a, b;                                                  // Halbachsen (AE)
var a2, b2;                                                // Halbachsenquadrate (AE^2)
var eps;                                                   // Numerische Exzentrit�t
var c1;                                                    // Hilfskonstante
var eTotal;                                                // Gesamtenergie/Planetenmasse (J/kg)
var vMin, vMax;                                            // Minimal- und Maximalgeschwindigkeit (m/s)
var phi1, phi2;                                            // Positionswinkel Sektorenmitte (bez�glich Sonne, Bogenma�)
var phi1Min, phi2Min;                                      // Minimale Positionswinkel der Sektoren (bez�glich Sonne, Bogenma�)
var phi1Max, phi2Max;                                      // Maximale Positionswinkel der Sektoren (bez�glich Sonne, Bogenma�)
var part;                                                  // Bruchteil f�r Sektorenfl�che
var nr;                                                    // Nummer des Sektors (1, 2 oder 0, mit Maus ausgew�hlt)
var t0S1, t0S2;                                            // Zeitpunkt des Eintritts in Sektor 1 bzw. 2
var tS1, tS2;                                              // Zeit seit dem Eintritt in Sektor 1 bzw. 2
var unknown;                                               // Flag f�r erfundenen Planeten
var on;                                                    // Flag f�r Bewegung
var t0;                                                    // Bezugszeitpunkt
var timer;                                                 // Timer f�r Animation
var t;                                                     // Zeitvariable (s)
var slow;                                                  // Flag f�r Zeitlupe

// Element der Schaltfl�che (aus HTML-Datei):
// id ..... ID im HTML-Befehl
// text ... Text (optional)

function getElement (id, text) {
  var e = document.getElementById(id);                     // Element
  if (text) e.innerHTML = text;                            // Text festlegen, falls definiert
  return e;                                                // R�ckgabewert
  } 

// Start:

function start () {
  canvas = getElement("cv");                               // Zeichenfl�che
  width = canvas.width; height = canvas.height;            // Abmessungen (Pixel)
  ctx = canvas.getContext("2d");                           // Grafikkontext
  ch = getElement("ch");                                   // Auswahlliste (Planeten)
  initSelect();                                            // Auswahlliste vorbereiten
  getElement("ip1a",text02);                               // Erkl�render Text (Gro�e Halbachse)     
  ip1 = getElement("ip1b");                                // Eingabefeld (Gro�e Halbachse)
  getElement("ip1c",au);                                   // Einheit (Gro�e Halbachse)
  getElement("ip2a",text03);                               // Erkl�render Text (Numerische Exzentrit�t)    
  ip2 = getElement("ip2b");                                // Eingabefeld (Numerische Exzentrit�t)
  bu = getElement("bu",text04[1]);                         // Schaltknopf (Pause/Weiter)
  setButtonState(0);                                       // Zustand festlegen (Animation)
  cbSlow = getElement("cbSlow");                           // Optionsfeld (Zeitlupe)
  cbSlow.checked = false;                                  // Zeitlupe zun�chst abgeschaltet
  getElement("lbSlow",text05);                             // Erkl�render Text (Zeitlupe)
  getElement("op1a",text06[0]);                            // Erkl�render Text, obere Zeile (Entfernung zur Sonne)
  getElement("op1b",text06[1]);                            // Erkl�render Text, untere Zeile (Entfernung zur Sonne)
  op1 = getElement("op1c");                                // Ausgabefeld (Entfernung zur Sonne)
  getElement("op1d",au);                                   // Einheit (Entfernung zur Sonne)
  getElement("lb",text07);                                 // Erkl�render Text (Geschwindigkeit)
  getElement("op2a",text08);                               // Erkl�render Text (Aktuelle Geschwindigkeit)
  op2 = getElement("op2b");                                // Ausgabefeld (Aktuelle Geschwindigkeit)
  getElement("op2c",kilometerPerSecond);                   // Einheit (Aktuelle Geschwindigkeit)
  getElement("op3a",text09);                               // Erkl�render Text (Minimale Geschwindigkeit)
  op3 = getElement("op3b");                                // Ausgabefeld (Minimale Geschwindigkeit)
  getElement("op3c",kilometerPerSecond);                   // Einheit (Minimale Geschwindigkeit)
  getElement("op4a",text10);                               // Erkl�render Text (Maximale Geschwindigkeit)
  op4 = getElement("op4b");                                // Ausgabefeld (Maximale Geschwindigkeit)
  getElement("op4c",kilometerPerSecond);                   // Einheit (Maximale Geschwindigkeit)
  cb1 = getElement("cb1a");                                // Optionsfeld (Sektoren)
  getElement("cb1b",text11);                               // Erkl�render Text (Sektoren)
  sl = getElement("sl");                                   // Schieberegler (Sektorengr��e)
  sl.value = 4;                                            // Anfangsposition Schieberegler
  cb2 = getElement("cb2a");                                // Optionsfeld (Geschwindigkeitsvektor)
  getElement("cb2b",text12);                               // Erkl�render Text (Geschwindigkeitsvektor)

  cb1.checked = true;                                      // Sektoren und Uhren zeichnen
  cb2.checked = false;                                     // Geschwindigkeitsvektor zun�chst nicht zeichnen
  getElement("author",author);                             // Autor (und �bersetzer)
  
  a = aPlanets[0]; eps = epsPlanets[0];                    // Bahndaten (Merkur) 
  unknown = false;                                         // Planet aus Liste
  updateInput();                                           // Eingabefelder aktualisieren
  phi1 = 0;                                                // Positionswinkel Sektorenmitte 1 (bez�glich Sonne, Bogenma�)
  phi2 = Math.PI;                                          // Positionswinkel Sektorenmitte 2 (bez�glich Sonne, Bogenma�)
  part = 0.1;                                              // Bruchteil f�r Sektorenfl�che
  nr = 0;                                                  // Zun�chst kein Sektor ausgew�hlt
  actionEnd();                                             // Berechnungen, Ausgabefelder aktualisieren
  t = 0;                                                   // Zeitvariable (s)
  slow = false;                                            // Zeitlupe zun�chst abgeschaltet
  startAnimation();                                        // Animation angeschaltet
  
  ch.onchange = reactionSelect;                            // Reaktion auf Auswahl (Planet)
  ip1.onkeydown = reactionEnter;                           // Reaktion auf Eingabe (Gro�e Halbachse)
  ip2.onkeydown = reactionEnter;                           // Reaktion auf Eingabe (Numerische Exzentrit�t)
  bu.onclick = reactionButton;                             // Reaktion auf Schaltknopf (Pause/Weiter)
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld (Zeitlupe) 
  cb1.onchange = paint;                                    // Reaktion auf Optionsfeld (Sektoren)                                    
  cb2.onchange = paint;                                    // Reaktion auf Optionsfeld (Geschwindigkeitsvektor)
  sl.onchange = reactionSlider;                            // Reaktion auf Schieberegler
  sl.oninput = reactionSlider;                             // Reaktion auf Schieberegler
  sl.onclick = reactionSlider;                             // Reaktion auf Schieberegler
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Dr�cken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Ber�hrung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Ber�hrung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers        
  
  } // Ende der Methode start
  
// Initialisierung der Auswahlliste:
  
function initSelect () {
  for (var i=0; i<text01.length; i++) {                    // F�r alle Indizes ...
    var o = document.createElement("option");              // Neues option-Element
    o.text = text01[i];                                    // Text des Elements �bernehmen 
    ch.add(o);                                             // Element zur Liste hinzuf�gen
    }
  }
  
// Reaktion auf Auswahl in der Liste:
// Seiteneffekt t, unknown, a, eps, phi1, phi2, b, a2, b2, bPix, ePix, c1, vMin, vMax, eTotal, t0, phi1Min, phi1Max, phi2Min, phi2Max, 
// t0S1, t0S2, tS1, tS2, Wirkung auf Ein- und Ausgabefelder

function reactionSelect () {
  t = 0;                                                   // Zeitvariable zur�cksetzen
  var i = ch.selectedIndex;                                // Index
  var n = aPlanets.length;                                 // Zahl der Planeten usw.
  if (i == n && !unknown) {                                // Falls leeres Feld ausgew�hlt ...
    i--; ch.selectedIndex = i;                             // Index korrigieren
    }
  if (i < n) {                                             // Falls normales Feld ausgew�hlt ...
    unknown = false;                                       // Flag f�r erfundenen Planeten l�schen
    a = aPlanets[i];                                       // Gro�e Halbachse (AE)
    eps = epsPlanets[i];                                   // Numerische Exzentrit�t
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
  
// Zustandsfestlegung f�r Schaltknopf Pause/Weiter:
  
function setButtonState (st) {
  bu.state = st;                                           // Zustand speichern
  bu.innerHTML = text04[st];                               // Text aktualisieren
  }
  
// Reaktion auf Schaltknopf Pause/Weiter:
// Seiteneffekt bu, on, slow, timer, t0

function reactionButton () {
  setButtonState(1-bu.state);                              // Zustand des Schaltknopfs �ndern
  on = (bu.state == 0);                                    // Flag f�r Animation
  slow = cbSlow.checked;                                   // Flag f�r Zeitlupe
  if (on) startAnimation();                                // Animation entweder fortsetzen ...
  else stopAnimation();                                    // ... oder unterbrechen
  if (!on) paint();                                        // Falls n�tig, neu zeichnen
  }
  
// Reaktion auf Optionsfeld Zeitlupe:
// Seiteneffekt slow

function reactionSlow () {
  slow = cbSlow.checked;                                   // Flag f�r Zeitlupe
  }
  
// Reaktion auf Schieberegler:
// Seiteneffekt part, phi1, phi2 b, a2, b2, bPix, ePix, c1, vMin, vMax, eTotal, t, t0, phi1Min, phi1Max, phi2Min, phi2Max, t0S1, t0S2, tS1, tS2

function reactionSlider () {
  part = sl.value/40;                                      // Bruchteil f�r Sektoren
  actionEnd();                                             // Berechnungen, Ausgabe, neu zeichnen
  }
  
// Reaktion auf Dr�cken der Maustaste:
// Seiteneffekt nr
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen (Auswahl eines Sektors)                    
  }
  
// Reaktion auf Ber�hrung:
// Seiteneffekt nr
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Ber�hrpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen (Auswahl eines Sektors)
  if (nr != 0) e.preventDefault();                         // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Loslassen der Maustaste:
  
function reactionMouseUp (e) {                                             
  nr = 0;                                                  // Zugmodus deaktivieren                             
  }
  
// Reaktion auf Ende der Ber�hrung:
  
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
  
// Hilfsroutine: Reaktion auf Mausklick oder Ber�hren mit dem Finger (Auswahl eines Sektors):
// u, v ... Bildschirmkoordinaten bez�glich Viewport
// Seiteneffekt nr

function reactionDown (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)  
  if (insideSector(1,u,v)) nr = 1;                         // Entweder Sektor 1 ...
  else if (insideSector(2,u,v)) nr = 2;                    // ... oder Sektor 2 ...
  else nr = 0;                                             // ... oder kein Sektor ausgew�hlt
  } 
  
// Hilfsroutine: Reaktion auf Bewegung von Maus oder Finger (�nderung):
// u, v ... Bildschirmkoordinaten bez�glich Viewport
// Seiteneffekt phi1, phi2, t, t0, phi1Min, phi1Max, phi2Min, phi2Max, t0S1, t0S2, tS1, tS2

function reactionMove (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)
  var w = atan2(Y0-v,u-X0-ePix);                           // Positionswinkel (Bogenma�, zwischen 0 und 2 pi)
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
  ePix = eps*A_PIX;                                        // Lineare Exzentrit�t (Pixel)
  c1 = Math.sqrt((1+eps)/(1-eps));                         // Hilfskonstante
  var v0 = b/(a*Math.sqrt(a/C0));                          // Hilfsgr��e f�r Geschwindigkeit
  vMin = v0/(1+eps);                                       // Minimale Geschwindigkeit (m/s) 
  vMax = v0/(1-eps);                                       // Maximale Geschwindigkeit (m/s)
  eTotal = vMin*vMin/2-C0/(a*(1+eps));                     // Gesamtenergie/Planetenmasse (J/kg)
  }
  
// Berechnung der exzentrischen Anomalie durch Intervallschachtelung:
// m ... mittlere Anomalie (Bogenma�, 0 <= m <= 2 pi vorausgesetzt)
// R�ckgabewert: L�sung der Keplergleichung (e - epsilon sin e = m) im Bogenma� (zwischen 0 und 2 pi)

function excentricAnomaly (m) {
  var eL = 0, eR = PI2;                                    // Startwerte f�r Intervallgrenzen
  while (eR-eL > 1e-5) {                                   // Solange Intervallbreite gr��er als Genauigkeit ...
    var e = (eL+eR)/2;                                     // Mitte des Intervalls
    if (e-eps*Math.sin(e) < m) eL = e;                     // L�sung entweder in der rechten H�lfte ...
    else eR = e;                                           // ... oder in der linken H�lfte des bisherigen Intervalls
    }
  return e;                                                // R�ckgabewert
  }
  
// Hilfsroutine: Variante von Math.atan2 mit Werten zwischen 0 und 2 pi

function atan2 (dy, dx) {
  var w = Math.atan2(dy,dx);                               // Wert von Math.atan2
  return (w>=0 ? w : w+PI2);                               // R�ckgabewert (eventuell korrigiert)
  }
  
// Positionswinkel bez�glich Sonne:
// e ... exzentrische Anomalie (Bogenma�)
// R�ckgabewert: Positionswinkel bez�glich Sonne (Gegenuhrzeigersinn, Bogenma�, zwischen 0 und 2 pi)

function positionAngle (e) {
  var x = A_PIX*Math.cos(e), y = bPix*Math.sin(e);         // Position bez�glich Sonne (Pixel)
  return atan2(y,x-ePix);                                  // R�ckgabewert
  }
  
// Relativer Positionswinkel:
// phi0 .... Gegebener Positionswinkel (bez�glich Sonne, Bogenma�)
// (x,y) ... Position
// R�ckgabewert: Positionswinkel, bezogen auf die durch phi0 gegebene Halbgerade von der Sonne weg (Bogenma�, zwischen -pi und +pi)

function diff (phi0, x, y) {
  var d = Math.atan2(Y0-y,x-X0-ePix)-phi0;                 // Vorl�ufiger Positionswinkel
  while (d < -Math.PI) d += PI2;                           // Zu kleinen Wert verhindern
  while (d > Math.PI) d -= PI2;                            // Zu gro�en Wert verhindern
  return d;                                                // R�ckgabewert
  }
  
// �berpr�fung, ob Punkt innerhalb von Sektor:
// s ....... Nummer des Sektors (1 oder 2)
// (x,y) ... Position des Punkts (Pixel)

function insideSector (s, x, y) {
  var sector1 = (s == 1);                                     // �berpr�fung, ob Sektor 1
  var phi = (sector1 ? phi1 : phi2);                          // Positionswinkel Sektorenmitte
  var phiMin = (sector1 ? phi1Min : phi2Min);                 // Positionswinkel Sektorenanfang
  if (phiMin > phi) phiMin -= PI2;                            // Wert gr��er als phi verhindern
  var phiMax = (sector1 ? phi1Max : phi2Max);                 // Positionswinkel Sektorenende
  if (phiMax < phi) phiMax += PI2;                            // Wert kleiner als phi verhindern
  if (diff(phiMin,x,y) > 0 && diff(phi,x,y) < 0) return true; // Punkt zwischen Anfang und Mitte des Sektors
  if (diff(phiMax,x,y) < 0 && diff(phi,x,y) > 0) return true; // Punkt zwischen Mitte und Ende des Sektors
  return false;                                               // Punkt au�erhalb des Sektors
  }
  
// Drehung eines Sektors (falls n�tig):
// s ... Nummer des zu drehenden Sektors (1 oder 2)
// Seiteneffekt phi1 bzw. phi2

function moveSector (s) {
  var s0 = 3-s;                                            // Nummer des anderen Sektors
  var dir = 0;                                             // Variable f�r Drehrichtung
  var sector1 = (s == 1);                                  // �berpr�fung, ob Sektor 1
  var phi0 = (sector1 ? phi2 : phi1);                      // Positionswinkel f�r Mitte des festen Sektors
  var phiMin = (sector1 ? phi1Min : phi2Min);              // Positionswinkel f�r Anfang des zu drehenden Sektors
  var phiMax = (sector1 ? phi1Max : phi2Max);              // Positionswinkel f�r Ende des zu drehenden Sektors
  var x = X0+ePix+100*Math.cos(phiMin);                    // Punkt am Anfang des zu drehenden Sektors, x-Koordinate
  var y = Y0-100*Math.sin(phiMin);                         // Punkt am Anfang des zu drehenden Sektors, y-Koordinate
  if (insideSector(s0,x,y)) dir = 1;                       // Falls Punkt im festen Sektor, Drehung im Gegenuhrzeigersinn 
  x = X0+ePix+100*Math.cos(phiMax);                        // Punkt am Ende des zu drehenden Sektors, x-Koordinate
  y = Y0-100*Math.sin(phiMax);                             // Punkt am Ende des zu drehenden Sektors, y-Koordinate
  if (insideSector(s0,x,y)) dir = -1;                      // Falls Punkt im festen Sektor, Drehung im Uhrzeigersinn
  if (dir == 0) return;                                    // Falls keine Drehung n�tig, abbrechen
  var e2 = 2*Math.atan(Math.tan(phi0/2)/c1);               // Exzentrische Anomalie f�r Mitte des festen Sektors
  if (e2 < 0) e2 += PI2;                                   // Negativen Wert verhindern
  var m2 = e2-eps*Math.sin(e2);                            // Mittlere Anomalie f�r Mitte des festen Sektors
  var m1 = m2+dir*part*PI2;                                // Mittlere Anomalie f�r Mitte des gedrehten Sektors
  if (m1 < 0) m1 += PI2;                                   // Negativen Wert verhindern
  if (m1 > PI2) m1 -= PI2;                                 // Wert �ber 2 pi verhindern
  var e1 = excentricAnomaly(m1);                           // Exzentrische Anomalie f�r Mitte des gedrehten Sektors
  var phiNew = 2*Math.atan(c1*Math.tan(e1/2));             // Positionswinkel f�r Mitte des gedrehten Sektors
  if (phiNew < 0) phiNew += PI2;                           // Negativen Wert verhindern
  if (sector1) phi1 = phiNew; else phi2 = phiNew;          // Positionswinkel f�r Mitte des gedrehten Sektors
  }
  
// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }
  
// Eingabe einer Zahl
// ef .... Eingabefeld
// d ..... Zahl der Nachkommastellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)
// min ... Minimum des erlaubten Bereichs
// max ... Maximum des erlaubten Bereichs
// R�ckgabewert: Zahl
  
function inputNumber (ef, d, fix, min, max) {
  var s = ef.value;                                        // Zeichenkette im Eingabefeld
  s = s.replace(decimalSeparator,".");                     // Eventuell Komma in Punkt umwandeln
  var n = Number(s);                                       // Umwandlung in Zahl, falls m�glich
  if (isNaN(n)) n = 0;                                     // Sinnlose Eingaben als 0 interpretieren 
  if (n < min) n = min;                                    // Falls Zahl zu klein, korrigieren
  if (n > max) n = max;                                    // Falls Zahl zu gro�, korrigieren
  ef.value = ToString(n,d,fix);                            // Eingabe verwenden (eventuell korrigiert)
  return n;                                                // R�ckgabewert
  }
   
// Gesamte Eingabe:
// Seiteneffekt a, eps, unknown, Wirkung auf Auswahlliste

function input () {
  a = inputNumber(ip1,3,false,0.1,100);                    // Gro�e Halbachse (AE)
  eps = inputNumber(ip2,3,true,0,0.999);                   // Numerische Exzentrit�t
  unknown = true;                                          // Erfundener Planet
  ch.selectedIndex = aPlanets.length;                      // Leeres Feld ausw�hlen
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ip1.value = ToString(a,3,false);                         // Gro�e Halbachse (AE)
  ip2.value = ToString(eps,3,true);                        // Numerische Exzentrit�t
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
  calculation();                                           // Berechnungen durchf�hren
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
  
// Ausgef�lltes Rechteck:
// x, y ... Ecke links oben (Pixel)
// w, h ... Abmessungen (Pixel)
// c ...... F�llfarbe

function rectangle (x, y, w, h, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.fillRect(x,y,w,h);                                   // Ausgef�lltes Rechteck
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
  var length = Math.sqrt(dx*dx+dy*dy);                     // L�nge
  if (length == 0) return;                                 // Abbruch, falls L�nge 0
  dx /= length; dy /= length;                              // Einheitsvektor
  var s = 2.5*w+7.5;                                       // L�nge der Pfeilspitze 
  var xSp = x2-s*dx, ySp = y2-s*dy;                        // Hilfspunkt f�r Pfeilspitze         
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
  ctx.beginPath();                                         // Neuer Pfad f�r Pfeilspitze
  ctx.fillStyle = ctx.strokeStyle;                         // F�llfarbe wie Linienfarbe
  ctx.moveTo(xSp,ySp);                                     // Anfangspunkt (einspringende Ecke)
  ctx.lineTo(xSp1,ySp1);                                   // Weiter zum Punkt auf einer Seite
  ctx.lineTo(x2,y2);                                       // Weiter zur Spitze
  ctx.lineTo(xSp2,ySp2);                                   // Weiter zum Punkt auf der anderen Seite
  ctx.closePath();                                         // Zur�ck zum Anfangspunkt
  ctx.fill();                                              // Pfeilspitze zeichnen 
  }
  
// Kreisscheibe mit schwarzem Rand:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... F�llfarbe (optional)

function circle (x, y, r, c) {
  if (c) ctx.fillStyle = c;                                // F�llfarbe
  newPath();                                               // Neuer Pfad
  ctx.arc(x,y,r,0,PI2,true);                               // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausf�llen
  ctx.stroke();                                            // Rand zeichnen
  }
  
// Achsenparallele Ellipse (nicht ausgef�llt):
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
  ctx.restore();                                           // Fr�heren Grafikkontext wiederherstellen
  ctx.stroke();                                            // Ellipse zeichnen
  }
  
// Text ausrichten:
// s ....... Zeichenkette
// t ....... Typ (0 f�r linksb�ndig, 1 f�r zentriert, 2 f�r rechtsb�ndig)
// (x,y) ... Position (Pixel)

function alignText (s, t, x, y) {
  if (t == 0) ctx.textAlign = "left";                      // Je nach Wert von t linksb�ndig ...
  else if (t == 1) ctx.textAlign = "center";               // ... oder zentriert ...
  else ctx.textAlign = "right";                            // ... oder rechtsb�ndig
  ctx.fillText(s,x,y);                                     // Text ausgeben
  }
  
// Hilfsroutine: Zeit seit dem Eintritt in einen Sektor
// s ....... Nummer des Sektors (1 oder 2)

function timeSector (s) {
  var t0 = (s==1 ? t0S1 : t0S2);                           // Zeit des Eintritts in den Sektor
  var dt = t-t0;                                           // Zeit seit dem Eintritt in den Sektor
  if (dt < 0) dt += PER;                                   // Negativen Wert verhindern
  return Math.min(dt,part*PER);                            // R�ckgabewert (nicht �ber Maximalwert)
  }
      
// Planet, Verbindungsstrecke, Geschwindigkeitsvektor:
// Seiteneffekt tS1, tS2
// Wirkung auf Ausgabefelder op1, op2

function planet () {
  var n = Math.floor(t/PER);                               // Zahl der vollst�ndigen Uml�ufe 
  if (n > 0) t -= n*PER;                                   // 0 <= t < PER erzwingen
  var e = excentricAnomaly(PI2*t/PER);                     // Exzentrische Anomalie (Bogenma�)
  var phi = 2*Math.atan(c1*Math.tan(e/2));                 // Positionswinkel bez�glich Sonne (Bogenma�)
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
  if (!cb2.checked) return;                                // Falls Geschwindigkeitsvektor unn�tig, abbrechen
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
  var sector1 = (s == 1);                                  // �berpr�fung, ob Sektor 1
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
  ctx.restore();                                           // Fr�heren Grafikkontext wiederherstellen
  ctx.lineTo(X0+ePix,Y0);                                  // Weiter zum rechten Brennpunkt (Sonne)
  ctx.closePath();                                         // Zur�ck zum Anfangspunkt
  ctx.fillStyle = (sector1 ? color1 : color2);             // F�llfarbe
  ctx.fill(); ctx.stroke();                                // Ausgef�llter Sektor mit Rand  
  }
  
// Vergleichsl�nge:

function scale () {
  var len = A_PIX/a;                                       // Umrechnungsfaktor (Pixel pro AE)
  var s = "1";                                             // Zeichenkette f�r 1 AE (Normalfall)
  if (len > 400) {                                         // Falls Vergleichsl�nge 1 AE zu gro� ...
    len /= 10;                                             // Umrechnungsfaktor durch 10 dividieren
    s = ToString(0.1,1,true);                              // Zeichenkette f�r 0,1 AE
    }
  else if (len < 40) {                                     // Falls Vergleichsl�nge 1 AE zu klein ...
    len *= 10;                                             // Umrechnungsfaktor mit 10 multiplizieren
    s = "10";                                              // Zeichenkette f�r 10 AE
    }    
  s += " "+auUnicode;                                      // Leerzeichen und Einheit AE hinzuf�gen  
  var xL = X0-len/2, xR = X0+len/2;                        // x-Koordinaten der Endpunkte (Pixel)
  var y = height-50;                                       // y-Koordinate der Linie (Pixel)
  line(xL,y,xR,y);                                         // Linie (Vergleichsl�nge)
  line(xL,y-5,xL,y+5);                                     // Kurzer Strich am linken Ende 
  line(xR,y-5,xR,y+5);                                     // Kurzer Strich am rechten Ende
  ctx.font = FONT1;                                        // Zeichensatz
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  alignText(s,1,X0,y+15);                                  // Beschriftung
  }
  
// Uhr:
// nr ... Nummer (1 oder 2)
  
function clock (nr) {
  var c1 = (nr == 1);                                      // �berpr�fung, ob Nummer 1
  var x = (c1 ? 2*X0-100 : 100), y = 50;                   // Position des Mittelpunkts (Pixel)
  var c = (c1 ? color1 : color2);                          // Geh�usefarbe
  var t = (c1 ? tS1 : tS2);                                // Angezeigte Zeit
  var s = ToString(t/PER,3,true)+" "+symbolPeriod;         // Zeichenkette
  rectangle(x-60,y-15,120,30,c);                           // Geh�use
  rectangle(x-50,y-10,100,20,"#000000");                   // Anzeige
  ctx.font = FONT2;                                        // Zeichensatz
  ctx.fillStyle = "#ff0000";                               // Schriftfarbe
  alignText(s,1,x,y+5);                                    // Zeichenkette ausgeben
  }
    
// Grafikausgabe:
// Seiteneffekt t, t0, phi1Min, phi1Max, phi2Min, phi2Max, t0S1, t0S2, tS1, tS2
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausf�llen
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // Neuer Bezugszeitpunkt
    var dt = (t1-t0)/1000;                                 // L�nge des Zeitintervalls (s)
    if (slow) dt /= 10;                                    // Falls Zeitlupe, Zeitintervall durch 10 dividieren
    t += dt;                                               // Zeitvariable aktualisieren
    t0 = t1;                                               // Neuen Bezugszeitpunkt �bernehmen
    }
  if (cb1.checked) {                                       // Falls Option Sektoren ausgew�hlt ...
    sector(1); sector(2);                                  // Sektoren
    clock(1); clock(2);                                    // Uhren
    } 
  ellipse(X0,Y0,A_PIX,bPix);                               // Bahnellipse
  circle(X0+ePix,Y0,4.5,colorSun);                         // Sonne 
  planet();                                                // Planet, Verbindungslinie, Geschwindigkeitsvektor
  scale();                                                 // Vergleichsl�nge
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen

