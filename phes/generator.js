// Generator
// Java-Applet (08.05.1998) umgewandelt
// 03.12.2015 - 23.12.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind in einer eigenen Datei (zum Beispiel generator_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorNorth = "#ff0000";                                // Farbe für Nordpol
var colorSouth = "#00ff00";                                // Farbe für Südpol
var colorContact = "#c0c0c0";                              // Farbe für Kontakte (ohne Strom)
var colorInsulator = "#000000";                            // Farbe für Isolator
var	colorCurrent1 = "#ff0000";                             // Farbe für Strom (Drähte)
var colorCurrent2 = "#ff6060";                             // Farbe für Strom (Kontakte)
var colorCurrent3 = "#400000";                             // Farbe für Innenseite eines Schleifrings
var	colorField = "#0000ff";                                // Farbe für Magnetfeld
var colorMotion = "#000000";                               // Farbe für Bewegung
var colorVoltage = "#0000ff";                              // Farbe für Spannung
var colorCrank = "#ffc800";                                // Farbe für Kurbel
var colorResistor = "#c080ff";                             // Farbe für Widerstand

// Sonstige Konstanten:

var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz
var PI = Math.PI;                                          // Abkürzung für pi
var PI2 = 2*Math.PI;                                       // Abkürzung für 2 pi
var PIH = Math.PI/2;                                       // Abkürzung für pi/2
var DEG = Math.PI/180;                                     // Winkelgrad
var PHI = 235*DEG;                                         // Azimutwinkel (Bogenmaß, zwischen pi und 3 pi/2)  
var THETA = 15*DEG;                                        // Höhenwinkel (Bogenmaß, zwischen 0 und pi/2)
var HC = 6;                                                // Halbe Seitenlänge eines Kontakts
var XM1 = 40;                                              // x-Koordinate für Hufeisenmagnet
var YM1 = 5, YM2 = 300, YM3 = 400;                         // y-Koordinaten für Hufeisenmagnet
var ZM1 = 90, ZM2 = 110;                                   // z-Koordinaten für Hufeisenmagnet
var XW1 = 130, XW2 = 140, XW3 = 220, XW4 = 260;            // x-Koordinaten für Drähte
var YW1 = 0, YW2 = -90, YW3 = -110;                        // y-Koordinaten für Drähte
var ZW1 = -100, ZW2 = 75;                                  // z-Koordinaten für Stromquelle und Drähte
var YA1 = 80, YA2 = 200;                                   // y-Koordinaten für Leiterschleife
var ZA1 = 8, ZA2 = 30;                                     // z-Koordinaten für Leiterschleife
var XC1 = 0;                                               // x-Koordinate für Kontakte und Kommutator
var YC1 = 0, YC2 = -40;                                    // y-Koordinate für Kontakte und Kommutator
var ZC1 = 36;                                              // z-Koordinaten für Kontakte
var YC3 = -80, YC4 = -120;                                 // y-Koordinate für Kurbel (Gleichstrom/Wechselstrom)
var XV1 = 120, XV2 = 240;                                  // x-Koordinaten für Voltmeter
var YV1 = -90, YV2 = -50;                                  // y-Koordinaten für Voltmeter
var ZV1 = -120, ZV2 = 50, ZV3 = -50;                       // z-Koordinaten für Voltmeter
var XR1 = 60, XR2 = 100;                                   // x-Koordinaten für Verbraucherwiderstand
var U0 = 300, V0 = 250;                                    // Bildschirmkoordinaten des Ursprungs
var INSMAX = 15*DEG;                                       // Winkel für Isolator
var THICK = 2;                                             // Liniendicke für dicke Linien

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var rb1, rb2;                                              // Radiobuttons
var bu1, bu2;                                              // Schaltknöpfe
var sl;                                                    // Schieberegler
var op;                                                    // Ausgabefeld
var cb1, cb2, cb3;                                         // Optionsfelder

var genDC;                                                 // Flag für Gleichstrom-Generator (mit Kommutator)
var on;                                                    // Flag für Bewegung
var timer;                                                 // Timer für Animation
var t0;                                                    // Bezugszeitpunkt
var t;                                                     // Zeitvariable (s)
var omega;                                                 // Kreisfrequenz (1/s)
var nPer;                                                  // Maximale Zahl der Perioden
var direction;                                             // Drehrichtung (1 für Gegenuhrzeigersinn, -1 für Uhrzeigersinn)
var current;                                               // Stromrichtung (0, 1, -1)
var alpha;                                                 // Drehwinkel (Bogenmaß)
var sinAlpha, cosAlpha;                                    // Trigonometrische Werte
var uRot, vRot;                                            // Aktuelle Koordinaten für rotierende Teile
var vArrows;                                               // Flag: Pfeile für Bewegungsrichtung
var bArrows;                                               // Flag: Pfeile für Magnetfeld
var iArrows;                                               // Flag: Pfeile für induzierten Strom

var a1, a2, b1, b2, b3, c1, c2, c3;                        // Koeffizienten für Parallelprojektion

// Die Lage im Raum wird durch ein kartesisches Koordinatensystem (x, y, z) beschrieben.
// (Ursprung im Mittelpunkt des Kommutators, x-y-Ebene waagrecht (Drehachse als y-Achse), z-Achse nach oben)
// Die Berechnung der Bildschirmkoordinaten (u, v) erfolgt durch die Gleichungen
// u = U0 + a1 * x + a2 * y  und  v = V0 + b1 * x + b2 * y + b3 * z.
// Der Vektor (c1, c2, c3) gibt die Richtung zum Betrachter an.

var pgNorth, pgSouth;                                      // Polygone für Hufeisenmagnet (Nord- bzw. Südpol)
var pgContact1;                                            // Polygon für oberen Schleifkontakt
var pgContact2;                                            // Polygon für unteren Schleifkontakt (mit Kommutator)
var pgContact3;                                            // Polygon für unteren Schleifkontakt (ohne Kommutator)
var pointContact1, pointContact2, pointContact3;           // Innere Punkte des Schleifkontakt-Polygone
var aEllipse, bEllipse;                                    // Große und kleine Halbachse der Kommutator-Ellipsen (Pixel)
var deltaEllipse;                                          // Drehwinkel der Kommutator-Ellipsen (Bogenmaß)
var pgInsulator1, pgInsulator2;                            // Polygone für Isolierschicht des Kommutators 
var pgVoltmeter1;                                          // Polygon für Messgerät insgesamt
var pgVoltmeter2;                                          // Polygon für Skala des Messgeräts
var pgVoltmeter3;                                          // Polygon für unteren Teil des Messgeräts
var pointVoltmeter;                                        // Innerer Punkt für Voltmeter

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
  rb1 = getElement("rb1a");                                // Radiobutton (ohne Kommutator)
  rb1.checked = true;                                      // Radiobutton zunächst ausgewählt
  getElement("rb1b",text01);                               // Erklärender Text (ohne Kommutator)
  rb2 = getElement("rb2a");                                // Radiobutton (mit Kommutator)
  getElement("rb2b",text02);                               // Erklärender Text (mit Kommutator)
  bu1 = getElement("bu1",text03);                          // Schaltknopf (umgekehrte Richtung)
  sl = getElement("sl");                                   // Schieberegler (Drehzahl)
  sl.value = 10;                                           // Anfangszustand (6 U/min) entsprechend T = 10 s
  op = getElement("op");                                   // Ausgabefeld (Drehzahl)
  reactionSlider(false);                                   // Festlegung von omega, Ausgabe der Drehzahl
  bu2 = getElement("bu2",text04[1]);                       // Schaltknopf (Pause/Weiter)
  setButton2State(1);                                      // Anfangszustand des Schaltknopfs
  cb1 = getElement("cb1a");                                // Optionsfeld (Bewegungsrichtung)
  getElement("cb1b",text05);                               // Erklärender Text (Bewegungsrichtung)
  cb2 = getElement("cb2a");                                // Optionsfeld (Magnetfeld)
  getElement("cb2b",text06);                               // Erklärender Text (Magnetfeld)
  cb3 = getElement("cb3a");                                // Optionsfeld (Lorentzkraft)
  getElement("cb3b",text07);                               // Erklärender Text (Lorentzkraft)
  cb1.checked = cb2.checked = cb3.checked = true;          // Optionsfelder zunächst eingeschaltet
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // Übersetzer
  
  genDC = false;                                           // Zunächst Wechselspannungs-Generator (ohne Kommutator)
  nPer = 5;                                                // Maximalzahl der Perioden im Diagramm
  t = 0;                                                   // Zeitvariable (s)
  alpha = 0; cosAlpha = 1; sinAlpha = 0;                   // Drehwinkel (Bogenmaß), trigonometrische Werte
  vArrows = bArrows = iArrows = true;                      // Zunächst Pfeile für Bewegung, Magnetfeld und Strom      
  direction = 1;                                           // Startwert für Drehrichtung (Gegenuhrzeigersinn)
  calcCoeff();                                             // Koeffizienten für Projektion berechnen
  initPolygons();                                          // Polygone vorbereiten
  calcEllipse();                                           // Ellipse für Kommutator vorbereiten
  startAnimation();                                        // Animation starten
  
  rb1.onclick = reactionRadio;                             // Reaktion auf Radiobutton (ohne Kommutator)
  rb2.onclick = reactionRadio;                             // Reaktion auf Radiobutton (mit Kommutator)
  bu1.onclick = reactionReverse;                           // Reaktion auf Schaltknopf (Umgekehrte Richtung)
  sl.onchange = reactionSlider;                            // Reaktion auf Schieberegler
  sl.onclick = reactionSlider;                             // Reaktion auf Schieberegler  
  bu2.onclick = reactionStart;                             // Reaktion auf Schaltknopf (Pause/Weiter)
  cb1.onclick = reactionCheckbox;                          // Reaktion auf Optionsfeld (Bewegungsrichtung)
  cb2.onclick = reactionCheckbox;                          // Reaktion auf Optionsfeld (Magnetfeld)
  cb3.onclick = reactionCheckbox;                          // Reaktion auf Optionsfeld (Induktionsstrom)
  
  } // Ende der Methode start
  
// Zustandsfestlegung für Schaltknopf Start/Pause/Weiter:
// st ... Gewünschter Zustand
// Seiteneffekt bu2.state
  
function setButton2State (st) {
  bu2.state = st;                                          // Zustand speichern
  bu2.innerHTML = text04[st];                              // Text aktualisieren
  }
  
// Umschalten des Schaltknopfs (Start)/Pause/Weiter:
// Seiteneffekt bu2.state
  
function switchButton2 () {
  var st = bu2.state;                                      // Momentaner Zustand
  if (st == 0) st = 1;                                     // Falls Ausgangszustand, starten
  else st = 3-st;                                          // Wechsel zwischen Animation und Unterbrechung
  setButton2State(st);                                     // Neuen Zustand speichern, Text ändern
  }
  
// Reaktion auf Radiobuttons (ohne/mit Kommutator):
// Seiteneffekt genDC, t, alpha, cosAlpha, sinAlpha

function reactionRadio () {
  genDC = rb2.checked;                                     // Flag für Gleichspannungs-Generator (mit Kommutator)  
  reset();                                                 // Ausgangsstellung
  }
    
// Reaktion auf den Schaltknopf (Start)/Pause/Weiter:
// Seiteneffekt t0, bu2.state, on, timer, t0 

function reactionStart () {
  if (bu2.state != 1) t0 = new Date();                     // Falls Animation angeschaltet, neuer Anfangszeitpunkt
  switchButton2();                                         // Zustand des Schaltknopfs ändern
  if (bu2.state == 1) startAnimation();                    // Entweder Animation fortsetzen ...
  else stopAnimation();                                    // ... oder stoppen
  }
  
// Reaktion auf den Schaltknopf Umpolen:
// Seiteneffekt direction, t, alpha, cosAlpha, sinAlpha

function reactionReverse () {
  direction = -direction;                                  // Stromrichtung umkehren
  reset();                                                 // Ausgangsstellung
  }
 
// Zurück in Ausgangsstellung: 
// Seiteneffekt t, alpha, cosAlpha, sinAlpha
  
function reset () {
  t = 0;                                                   // Zeitvariable
  alpha = 0; cosAlpha = 1; sinAlpha = 0;                   // Drehwinkel, trigonometrische Werte
  if (!on) paint();                                        // Falls Animation abgeschaltet, neu zeichnen
  }
  
// Reaktion auf Schieberegler:
// r ... Flag für Ausgangsstellung (optional)
// Seiteneffekt omega, nPer, t, alpha, cosAlpha, sinAlpha

function reactionSlider (r) {
  var n = sl.value;                                        // Position des Schiebereglers
  omega = PI2*n/100;                                       // Kreisfrequenz (1/s) entsprechend T = 100 s / n
  var s = (n*0.6).toFixed(1);                              // Zeichenkette für Wert der Drehzahl
  s = s.replace(".",decimalSeparator);                     // Eventuell Punkt durch Komma ersetzen
  if (n == 0) s = "0";                                     // Sonderfall 0 (ohne Nachkommastelle)
  op.innerHTML = s+" "+rotationsPerMinute;                 // Drehzahl ausgeben (Umdrehungen pro Minute)
  nPer = Math.floor(n/2);                                  // Maximale Zahl der Perioden
  if (r != false) reset();                                 // Falls gewünscht, zurück in Ausgangsstellung
  }
  
// Reaktion auf Optionsfelder:
// Seiteneffekt vArrows, bArrows, iArrows

function reactionCheckbox () {
  vArrows = cb1.checked;                                   // Pfeile für Bewegungsrichtung
  bArrows = cb2.checked;                                   // Pfeile für Magnetfeld
  iArrows = cb3.checked;                                   // Pfeile für Induktionsstrom
  if (!on) paint();                                        // Falls Animation abgeschaltet, neu zeichnen
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

// Polygone initialisieren:
// Seiteneffekt pgSouth, pgNorth

function initPolygons () {
  pgSouth = new Array(8);                                  // Polygon für den Südpol des Hufeisenmagneten
  setPoint(pgSouth,0,-XM1,YM3,0);
  setPoint(pgSouth,1,-XM1,YM3,-ZM2);
  setPoint(pgSouth,2,-XM1,YM1,-ZM2);
  setPoint(pgSouth,3,XM1,YM1,-ZM2);
  setPoint(pgSouth,4,XM1,YM1,-ZM1);
  setPoint(pgSouth,5,XM1,YM2,-ZM1);
  setPoint(pgSouth,6,XM1,YM2,0);
  setPoint(pgSouth,7,-XM1,YM2,0);
  pgNorth = new Array(9);                                  // Polygon für den Nordpol des Hufeisenmagneten
  setPoint(pgNorth,0,-XM1,YM3,0);
  setPoint(pgNorth,1,-XM1,YM2,0);
  setPoint(pgNorth,2,XM1,YM2,0);
  var u0 = screenU(-XM1,YM1);
  var v0 = screenV(-XM1,YM1,ZM1);
  var u1 = screenU(-XM1,YM2);
  var v1 = screenV(-XM1,YM2,ZM1);  
  var uS = screenU(XM1,YM2);
  var q = (uS-u0)/(u1-u0);
  var vS = v0+q*(v1-v0);
  pgNorth[3] = {u: uS, v: vS};
  setPoint(pgNorth,4,-XM1,YM1,ZM1);
  setPoint(pgNorth,5,XM1,YM1,ZM1);
  setPoint(pgNorth,6,XM1,YM1,ZM2);
  setPoint(pgNorth,7,XM1,YM3,ZM2);
  setPoint(pgNorth,8,-XM1,YM3,ZM2);
  pgContact1 = new Array(6);                               // Polygon für den oberen Schleifkontakt
  pointContact1 = initContact(pgContact1,XC1,YC1,ZC1);     // Zugehöriger innerer Punkt
  pgContact2 = new Array(6);                               // Polygon für den unteren Schleifkontakt (mit Kommutator)
  pointContact2 = initContact(pgContact2,XC1,YC1,-ZC1);    // Zugehöriger innerer Punkt
  pgContact3 = new Array(6);                               // Polygon für den unteren Schleifkontakt (ohne Kommutator)
  pointContact3 = initContact(pgContact3,XC1,YC2,-ZC1);    // Zugehöriger innerer Punkt
  pgVoltmeter1 = new Array(6);                             // Polygon für Voltmeter insgesamt
  pointVoltmeter = initCuboid(pgVoltmeter1,XV1,XV2,YV1,YV2,ZV1,ZV2); // Zugehöriger innerer Punkt
  pgVoltmeter2 = new Array(4);                             // Polygon für Skala des Voltmeters
  setPoint(pgVoltmeter2,0,XV1,YV1,ZV3);
  setPoint(pgVoltmeter2,1,XV2,YV1,ZV3);
  setPoint(pgVoltmeter2,2,XV2,YV1,ZV2);
  setPoint(pgVoltmeter2,3,XV1,YV1,ZV2);
  pgVoltmeter3 = new Array(4);                             // Polygon für unteren Teil des Voltmeters
  pgVoltmeter3[0] = pgVoltmeter1[1];
  pgVoltmeter3[1] = pgVoltmeter1[2];
  pgVoltmeter3[2] = pgVoltmeter2[1];
  pgVoltmeter3[3] = pgVoltmeter2[0];
  pgInsulator1 = new Array(20);                            // Polygon für Isolierschicht
  pgInsulator2 = new Array(20);                            // Polygon für Isolierschicht 
  for (i=0; i<20; i++) {                                   // Vorläufige Koordinaten
    pgInsulator1[i] = {u: 0, v: 0};
    pgInsulator2[i] = {u: 0, v: 0};
    }
  }

// Koeffizienten für Projektion berechnen:
// Seiteneffekt a1, a2, b1, b2, b3, c1, c2, c3
  
function calcCoeff () {
  a1 = -Math.sin(PHI); a2 = Math.cos(PHI);                 // Vektor (a1, a2, 0) für waagrechte Bildschirmkoordinate
  b1 = Math.sin(THETA)*a2; b2 = -Math.sin(THETA)*a1;       // Vektor (b1, b2, b3) für senkrechte Bildschirmkoordinate
  b3 = -Math.cos(THETA);
  c1 = a2*b3; c2 = -a1*b3; c3 = a1*b2-a2*b1;               // Vektor (c1, c2, c3) zum Betrachter (Kreuzprodukt)
  }
    
// Waagrechte Bildschirmkoordinate:
// (x,y,z) ... Räumliche Position
  
function screenU (x, y) {
  return U0+a1*x+a2*y;
  }

// Senkrechte Bildschirmkoordinate:
// (x,y,z) ... Räumliche Position
      
function screenV (x, y, z) {
  return V0+b1*x+b2*y+b3*z;
  }
  
// Polygonecke festlegen (Version für nicht bewegte Teile):
// p ......... Array für Bildschirmkoordinaten der Polygonecken
// i ......... Index der Ecke
// (x,y,z) ... Räumliche Position
// Seiteneffekt p[i].u, p[i].v
  
function setPoint (p, i, x, y, z) {
  p[i]= {u: screenU(x,y), v: screenV(x,y,z)};
  }
  
// Polygonecke festlegen (Version für rotierende Teile):
// p ......... Array für Bildschirmkoordinaten der Polygonecken
// i ......... Index der Ecke
// (x,y,z) ... Räumliche Position für alpha = 0
// Seiteneffekt uRot, vRot, p[i].u, p[i].v
  
function setPointRot (p, i, x, y, z) {
  screenCoordsRot(x,y,z);                                  // Bildschirmkoordinaten berechnen
  p[i].u = uRot; p[i].v = vRot;                            // Koordinaten der Polygonecke festlegen
  }
 
// Vorbereitung eines Polygons für ein Quader-Schrägbild:
// pg ......... Polygon für Umrandung
// xx1, xx2 ... Unter- und Obergrenze für x-Koordinate
// yy1, yy2 ... Unter- und Obergrenze für y-Koordinate
// zz1, zz2 ... Unter- und Obergrenze für z-Koordinate
// Rückgabewert: Innerer Punkt (Bildschirmkoordinaten u, v)
      
function initCuboid (pg, xx1, xx2, yy1, yy2, zz1, zz2) {
  pg[0] = {u: screenU(xx1,yy2), v: screenV(xx1,yy2,zz1)};  // Ecke links unten
  pg[1] = {u: screenU(xx1,yy1), v: screenV(xx1,yy1,zz1)};  // Ecke unten
  pg[2] = {u: screenU(xx2,yy1), v: screenV(xx2,yy1,zz1)};  // Ecke rechts unten
  pg[3] = {u: screenU(xx2,yy1), v: screenV(xx2,yy1,zz2)};  // Ecke rechts oben
  pg[4] = {u: screenU(xx2,yy2), v: screenV(xx2,yy2,zz2)};  // Ecke oben
  pg[5] = {u: screenU(xx1,yy2), v: screenV(xx1,yy2,zz2)};  // Ecke links oben
  return {u: screenU(xx1,yy1), v: screenV(xx1,yy1,zz2)};   // Innerer Punkt
  }
  
// Vorbereitung eines Schleifkontakts (Würfel der Seitenlänge 2*HC):
// pg ........ Polygon für Umrandung
// (x,y,z) ... Mittelpunkt
// Rückgabewert: Innerer Punkt (Bildschirmkoordinaten u, v)

function initContact (pg, x, y, z) {
  return initCuboid(pg,x-HC,x+HC,y-HC,y+HC,z-HC,z+HC);
  }
  
// Ausgangspunkt festlegen (Version für nicht bewegte Teile):
// (x,y,z) ... Räumliche Position

function moveTo (x, y, z) {
  ctx.moveTo(screenU(x,y),screenV(x,y,z));
  }
  
// Linie zu einem gegebenen Punkt vorbereiten (Version für nicht bewegte Teile):
// (x,y,z) ... Räumliche Position

function lineTo (x, y, z) {
  ctx.lineTo(screenU(x,y),screenV(x,y,z));
  }
  
// Bildschirmkoordinaten für rotierenden Teil:
// (x,y,z) ... Koordinaten in Ausgangsstellung
// Seiteneffekt uRot, vRot

function screenCoordsRot (x, y, z) {
  var xx = x*cosAlpha-z*sinAlpha;                          // x-Koordinate nach Drehung
  var zz = x*sinAlpha+z*cosAlpha;                          // z-Koordinate nach Drehung
  uRot = U0+a1*xx+a2*y;                                    // Waagrechte Bildschirmkoordinate (Pixel)
  vRot = V0+b1*xx+b2*y+b3*zz;                              // Senkrechte Bildschirmkoordinate (Pixel)
  }
  
// Ausgangspunkt festlegen (Version für rotierende Teile):
// (x,y,z) ... Koordinaten in Ausgangsstellung
// Seiteneffekt uRot, vRot

function moveToRot (x, y, z) {
  screenCoordsRot(x,y,z);                                  // Bildschirmkoordinaten berechnen
  ctx.moveTo(uRot,vRot);                                   // Ausgangsposition festlegen
  }

// Linie zu einem gegebenen Punkt vorbereiten (Version für rotierende Teile):
// (x,y,z) ... Koordinaten in Ausgangsstellung
// Seiteneffekt uRot, vRot

function lineToRot (x, y, z) {
  screenCoordsRot(x,y,z);                                  // Bildschirmkoordinaten berechnen
  ctx.lineTo(uRot,vRot);                                   // Linie vorbereiten
  }  
  
// Berechnungen für Kommutator-Ellipsen:
// Seiteneffekt aEllipse, bEllipse, deltaEllipse

function calcEllipse () {
  var r = ZC1-HC;                                          // Radius  
  // Die Hilfsgrößen c, d und m sind durch folgende Bedingungen bestimmt:
  // Ellipse durch (c|mc) mit unendlicher Steigung
  // Ellipse durch Punkt (0|d) mit Steigung m  
  var c = a1*r, d = -b3*r, m = b1/a1;   
  // Koeffizienten der Ellipsengleichung (c11 u^2 + 2 c12 uv + c22 v^2 + c0 = 0)  
  var c11 = c*c*m*m+d*d;                                   // Koeffizient von u^2
  var c12 = -m*c*c;                                        // Koeffizient von uv
  var c22 = c*c;                                           // Koeffizient von v^2
  var c0 = -c*c*d*d;                                       // Konstanter Summand  
  // Koeffizienten der biquadratischen Gleichung (a^4 + bq a^2 + cq = 0) für die große Halbachse a  
  var bq = -c*c*(1+m*m)-d*d;                               // Koeffizient von a^2
  var cq = c*c*d*d;                                        // Konstanter Summand
  var discr = bq*bq-4*cq;                                  // Diskriminante
  aEllipse = Math.sqrt((-bq-Math.sqrt(discr))/2);          // Große Halbachse (Pixel)
  bEllipse = c*d/aEllipse;                                 // Kleine Halbachse (Pixel)  
  deltaEllipse = Math.atan(2*c12/(c22-c11))/2;             // Drehwinkel (Bogenmaß, negativ)
  }

//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad:
// w ... Liniendicke (optional, Defaultwert 1)

function newPath (w) {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = (w ? w : 1);                             // Liniendicke
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
  ctx.beginPath();                                         // Neuer Grafikpfad
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
  
// Rotierende Linie:
// (x1,y1,z1) ... Anfangspunkt (Koordinaten in Ausgangsstellung)
// (x2,y2,z2) ... Endpunkt (Koordinaten in Ausgangsstellung)
// c ............ Linienfarbe
// w ............ Liniendicke

function lineRot (x1, y1, z1, x2, y2, z2, c, w) {
  newPath(w);                                              // Neuer Grafikpfad
  ctx.strokeStyle = c;                                     // Linienfarbe
  moveToRot(x1,y1,z1);                                     // Anfangspunkt
  lineToRot(x2,y2,z2);                                     // Endpunkt
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Rotierender Pfeil:
// (x1,y1,z1) ... Anfangspunkt (Koordinaten in Ausgangsstellung)
// (x2,y2,z2) ... Endpunkt (Koordinaten in Ausgangsstellung)
  
function arrowRot (x1, y1, z1, x2, y2, z2) {
  var xx1 = x1*cosAlpha-z1*sinAlpha;                       // x-Koordinate des Anfangspunkts nach der Drehung
  var zz1 = x1*sinAlpha+z1*cosAlpha;                       // z-Koordinate des Anfangspunkts nach der Drehung
  var xx2 = x2*cosAlpha-z2*sinAlpha;                       // x-Koordinate des Endpunkts nach der Drehung
  var zz2 = x2*sinAlpha+z2*cosAlpha;                       // z-Koordinate des Endpunkts nach der Drehung
  var u1 = screenU(xx1,y1), v1 = screenV(xx1,y1,zz1);      // Bildschirmkoordinaten des Anfangspunkts
  var u2 = screenU(xx2,y2), v2 = screenV(xx2,y2,zz2);      // Bildschirmkoordinaten des Endpunkts
  arrow(u1,v1,u2,v2,THICK);                                // Pfeil zeichnen
  }
  
// Pfeil auf einer vorhandenen Verbindungslinie (Version für nicht bewegte Teile):
// (x1,y1,z1) ... Räumliche Position des ersten Punkts
// (x2,y2,z2) ... Räumliche Position des zweiten Punkts
// q ............ Bruchteil
// d ............ Flag für Pfeil vom ersten zum zweiten Punkt
  
function arrowLine (x1, y1, z1, x2, y2, z2, q, d) {
  var u1 = screenU(x1,y1), v1 = screenV(x1,y1,z1);         // Bildschirmkoordinaten des ersten Punkts
  var u2 = screenU(x2,y2), v2 = screenV(x2,y2,z2);         // Bildschirmkoordinaten des zweiten Punkts
  var du = u2-u1, dv = v2-v1;                              // Verbindungsvektor
  if (d) arrow(u1,v1,u1+q*du,v1+q*dv,THICK);               // Entweder Pfeil vom ersten Punkt auf den zweiten Punkt zu ...
  else arrow(u2,v2,u2-q*du,v2-q*dv,THICK);                 // ... oder Pfeil vom zweiten Punkt auf den ersten Punkt zu
  }
  
// Pfeil auf einer vorhandenen Verbindungslinie (Version für rotierende Teile):
// (x1,y1,z1) ... Räumliche Position des ersten Punkts
// (x2,y2,z2) ... Räumliche Position des zweiten Punkts
// q ............ Bruchteil
// d ............ Flag für Pfeil vom ersten zum zweiten Punkt
  
function arrowLineRot (x1, y1, z1, x2, y2, z2, q, d) {
  var xx1 = x1*cosAlpha-z1*sinAlpha;                       // x-Koordinate des ersten Punkts nach der Drehung
  var zz1 = x1*sinAlpha+z1*cosAlpha;                       // z-Koordinate des ersten Punkts nach der Drehung
  var xx2 = x2*cosAlpha-z2*sinAlpha;                       // x-Koordinate des zweiten Punkts nach der Drehung
  var zz2 = x2*sinAlpha+z2*cosAlpha;                       // z-Koordinate des zweiten Punkts nach der Drehung
  arrowLine(xx1,y1,zz1,xx2,y2,zz2,q,d);                    // Pfeil zeichnen
  }
  
// Polygon zeichnen:
// p ... Array mit Koordinaten der Ecken
// c ... Füllfarbe

function drawPolygon (p, c) {
  newPath();                                               // Neuer Pfad (Standardwerte)
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.moveTo(p[0].u,p[0].v);                               // Zur ersten Ecke
  for (var i=1; i<p.length; i++)                           // Für alle weiteren Ecken ... 
    ctx.lineTo(p[i].u,p[i].v);                             // Linie zum Pfad hinzufügen
  ctx.closePath();                                         // Zurück zum Ausgangspunkt
  ctx.fill(); ctx.stroke();                                // Polygon ausfüllen und Rand zeichnen   
  }
  
// Verbindungslinie zweier Punkte:
// (u1,v1), (u2,v2) ... Bildschirmkoordinaten der Endpunkte

function line (u1, v1, u2, v2) {
  newPath();                                               // Neuer Pfad (Standardwerte)
  ctx.moveTo(u1,v1); ctx.lineTo(u2,v2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Verbindungslinie eines Punktes im Inneren eines Polygons mit einer Polygonecke:
// (u,v) ... Bildschirmkoordinaten des inneren Punkts
// p ....... Array der Polygonecken
// i ....... Index der Polygonecke

function lineP (u, v, p, i) {
  line(u,v,p[i].u,p[i].v);                                 // Linie zeichnen
  }
  
// Ausgefüllter Kreis:
// (u,v) ... Mittelpunkt (Pixel)
// r ....... Radius (Pixel)
// c ....... Füllfarbe

function circle (u, v, r, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.arc(u,v,r,0,PI2,true);                               // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausfüllen
  }
  
// Südpol des Hufeisenmagneten (unten):

function magnetSouth () {
  drawPolygon(pgSouth,colorSouth);                         // Ausgefülltes Polygon
  var u1 = screenU(-XM1,YM2);                              // 1. innerer Punkt links, waagrechte Bildschirmkoordinate
  var v1 = screenV(-XM1,YM2,-ZM1);                         // 1. innerer Punkt links, senkrechte Bildschirmkoordinate
  lineP(u1,v1,pgSouth,5);                                  // Linie vom 1. inneren Punkt nach rechts oben
  lineP(u1,v1,pgSouth,7);                                  // Linie vom 1. inneren Punkt nach oben
  var u2 = screenU(-XM1,YM1);                              // 2. innerer Punkt rechts, waagrechte Bildschirmkoordinate
  var v2 = screenV(-XM1,YM1,-ZM1);                         // 2. innerer Punkt rechts, senkrechte Bildschirmkoordinate
  lineP(u2,v2,pgSouth,2);                                  // Linie vom 2. inneren Punkt nach unten
  lineP(u2,v2,pgSouth,4);                                  // Linie vom 2. inneren Punkt nach rechts oben  
  line(u1,v1,u2,v2);                                       // Linie zwischen den beiden inneren Punkten  
  }
  
// Nordpol des Hufeisenmagneten (oben):

function magnetNorth () {  
  drawPolygon(pgNorth,colorNorth);                         // Ausgefülltes Polygon
  var u1 = screenU(-XM1,YM2);                              // 1. innerer Punkt links, waagrechte Bildschirmkoordinate
  var v1 = screenV(-XM1,YM2,ZM1);                          // 1. innerer Punkt links, senkrechte Bildschirmkoordinate
  lineP(u1,v1,pgNorth,1);                                  // Linie vom 1. inneren Punkt nach unten
  lineP(u1,v1,pgNorth,3);                                  // Linie vom 1. inneren Punkt nach rechts unten
  var u2 = screenU(-XM1,YM1);                              // 2. innerer Punkt rechts, waagrechte Bildschirmkoordinate
  var v2 = screenV(-XM1,YM1,ZM2);                          // 2. innerer Punkt rechts, senkrechte Bildschirmkoordinate
  lineP(u2,v2,pgNorth,4);                                  // Linie vom 2. inneren Punkt nach unten
  lineP(u2,v2,pgNorth,6);                                  // Linie vom 2. inneren Punkt nach rechts oben
  lineP(u2,v2,pgNorth,8);                                  // Linie vom 2. inneren Punkt nach links oben
  }
  
// Farbe für Drahtstücke (je nach Stromfluss):
  
function colorCurrent () {
  return (current!=0 ? colorCurrent1 : "#000000");
  }

// Ankerhälfte (mit Strompfeil):
// i = 1: Ankerhälfte, die in Ausgangsposition oben ist
// i = 2: Ankerhälfte, die in Ausgangsposition unten ist

function halfArmature (i) {
  var dir = 0;                                             // Richtung des Strompfeils (-1, 0 oder +1)
  var sign = 3-2*i;                                        // Vorzeichen von z in Ausgangsposition
  if (cosAlpha > 0 && current != 0) dir = direction;       // Richtung des Strompfeils, falls Ankerhälfte oben
  if (cosAlpha < 0 && current != 0) dir = -direction;      // Richtung des Strompfeils, falls Ankerhälfte unten
  newPath(THICK);                                          // Neuer Grafikpfad
  ctx.strokeStyle = colorCurrent();                        // Linienfarbe je nach Stromfluss
  var z1 = sign*ZA1, z2 = sign*ZA2;                        // z-Koordinaten innen bzw. außen
  moveToRot(0,0,z1);                                       // Anfangspunkt bei Zuleitung 
  lineToRot(0,YA1,z1);                                     // Linie zum Rechteck 
  lineToRot(0,YA1,z2);                                     // Linie nach außen
  lineToRot(0,YA2,z2);                                     // Linie nach hinten 
  lineToRot(0,YA2,0);                                      // Linie hinten zur Drehachse
  ctx.stroke();                                            // Linien zeichnen
  if (iArrows && current != 0 && omega > 0)                // Falls sinnvoll ... 
    arrowLineRot(0,YA1,z2,0,YA2,z2,0.75,sign*dir<0);       // Pfeilspitze (konventionelle Stromrichtung) 
  } 
  
// Pfeil für Bewegungsrichtung:
// i = 1: Ankerhälfte, die in Ausgangsposition oben ist
// i = 2: Ankerhälfte, die in Ausgangsposition unten ist

function movementArrow (i) {
  if (!vArrows || omega <= 0) return;                      // Falls Pfeil nicht sinnvoll, abbrechen
  var dir = (3-2*i)*direction;                             // Faktor für Drehsinn (1 oder -1)
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.strokeStyle = colorMotion;                           // Farbe für Bewegung
  var y = (YA1+YA2)/2;                                     // y-Koordinate                                    
  if (i == 1) arrowRot(0,y,ZA2,-40*dir,y,ZA2);             // Pfeil für 1. Ankerhälfte
  if (i == 2) arrowRot(0,y,-ZA2,-40*dir,y,-ZA2);           // Pfeil für 2. Ankerhälfte
  }  
  
// Feldlinien des Magnetfelds:
// i1 ... Erster Index
// i2 ... Letzter Index

function fieldLines (i1, i2) {
  if (!cb2.checked) return;                                // Falls Optionsfeld nicht aktiviert, abbrechen
  ctx.beginPath();                                         // Neuer Pfad
  ctx.lineWidth = THICK;                                   // Liniendicke
  ctx.strokeStyle = colorField;                            // Farbe für Magnetfeld
  var y0 = (YA2+YA1)/2;                                    // y-Koordinate für mittlere Feldlinie
  for (i=i1; i<=i2; i++) {                                 // Für alle Linien ...
    var y1 = y0+i*36;                                      // y-Koordinate berechnen
    moveTo(0,y1,-ZM1);                                     // Anfangspunkt berechnen
    lineTo(0,y1,ZM1);                                      // Linie vorbereiten
    }
  ctx.stroke();                                            // Linien zeichnen
  for (i=i1; i<=i2; i++) {                                 // Für alle Linien ...
    var y1 = y0+i*36;                                      // y-Koordinate berechnen
    arrowLine(0,y1,ZM1,0,y1,-ZM1,0.25,true);               // Obere Pfeilspitze zeichnen
    arrowLine(0,y1,ZM1,0,y1,-ZM1,0.85,true);               // Untere Pfeilspitze zeichnen
    }
  }
  
// Ellipsenbogen zum Grafikpfad hinzufügen:
// (u,v) ... Mittelpunkt (Pixel)
// a, b .... Halbachsen (Pixel)
// delta ... Drehwinkel (Bogenmaß)
// w0 ...... Startwinkel (Bogenmaß)
// w1 ...... Endwinkel (Bogenmaß)
  
function addEllipticalArc (u, v, a, b, delta, w0, w1) {
  ctx.save();                                              // Bisherigen Grafikkontext speichern
  ctx.translate(u,v);                                      // Parallelverschiebung
  ctx.rotate(-delta);                                      // Drehung
  ctx.scale(a,b);                                          // Skalierung
  ctx.arc(0,0,1,w0,w1,true);                               // Teil des Einheitskreises (wird zu Teil der Ellipse)
  ctx.restore();                                           // Früheren Grafikkontext wiederherstellen
  }
  
// Kreiszylinder-Schrägbild für Kommutator:
// y ... y-Koordinate (Mittelpunkt, auf y-Achse)
// c ... Füllfarbe
  
function cylinder (y, c) {
  var u = screenU(0,y+HC), v = screenV(0,y+HC,0);          // Mittelpunkt der hinteren Ellipse
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = c;                                       // Füllfarbe
  addEllipticalArc(u,v,aEllipse,bEllipse,deltaEllipse,1.5*PI,0.5*PI);  // Halbellipse hinten links
  u = screenU(0,y-HC); v = screenV(0,y-HC,0);              // Mittelpunkt der vorderen Ellipse
  ctx.lineTo(u+bEllipse*Math.sin(deltaEllipse),v+bEllipse*Math.cos(deltaEllipse));  // Verbindungslinie
  addEllipticalArc(u,v,aEllipse,bEllipse,deltaEllipse,0.5*PI,1.5*PI);  // Halbellipse vorne rechts
  ctx.closePath();                                         // Zurück zum Anfangspunkt
  ctx.fill(); ctx.stroke();                                // Ausgefüllte Fläche mit Rand
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  addEllipticalArc(u,v,aEllipse,bEllipse,deltaEllipse,0,PI2); // Vordere Ellipse
  ctx.stroke();                                            // Rand der vorderen Ellipse  
  }
  
// Hohlzylinder-Schrägbild für Schleifringe:
// y ... y-Koordinate (Mittelpunkt, auf y-Achse)
// c ... Füllfarbe
  
function ring (y, c) {
  var u0 = screenU(0,y+HC), v0 = screenV(0,y+HC,0);        // Mittelpunkt der hinteren Ellipse
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = c;                                       // Füllfarbe (Außenfläche)
  addEllipticalArc(u0,v0,aEllipse,bEllipse,deltaEllipse,1.5*PI,0.5*PI);   // Halbellipse hinten links (außen)
  var u1 = screenU(0,y-HC), v1 = screenV(0,y-HC,0);        // Mittelpunkt der vorderen Ellipse
  ctx.lineTo(u1+bEllipse*Math.sin(deltaEllipse),v1+bEllipse*Math.cos(deltaEllipse)); // Verbindungslinie
  addEllipticalArc(u1,v1,aEllipse,bEllipse,deltaEllipse,0.5*PI,1.5*PI);   // Halbellipse vorne rechts (außen)
  ctx.lineTo(u0-bEllipse*Math.sin(deltaEllipse),v0-bEllipse*Math.cos(deltaEllipse)); // Verbindungslinie
  ctx.moveTo(u1-0.75*aEllipse*Math.cos(deltaEllipse),v1+0.75*aEllipse*Math.sin(deltaEllipse)); // Neuer Anfangspunkt
  addEllipticalArc(u1,v1,-0.75*aEllipse,0.75*bEllipse,deltaEllipse,0,PI2); // Vordere Ellipse (innen)
  ctx.fill(); ctx.stroke();                                 // Ring ausfüllen, Rand
  newPath();                                                // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = colorCurrent3;                            // Füllfarbe (Innenfläche)
  addEllipticalArc(u1,v1,0.75*aEllipse,0.75*bEllipse,deltaEllipse,0.5*PI,1.5*PI); // Halbellipse (vorne)
  addEllipticalArc(u0,v0,-0.75*aEllipse,0.75*bEllipse,deltaEllipse,1.45*PI,0.55*PI); // Ellipsenbogen (hinten)
  ctx.fill(); ctx.stroke();                                 // Fläche ausfüllen, Rand
  newPath();                                                // Neuer Grafikpfad (Standardwerte)
  addEllipticalArc(u1,v1,aEllipse,bEllipse,deltaEllipse,0,PI2); // Vordere Ellipse (außen)
  ctx.stroke();                                             // Ellipsenrand
  }
  
// Markierung für Schleifring:
// y ... y-Koordinate der vorderen Fläche

function mark (y) {
  var r = 0.87*(ZC1-HC);                                   // Radius
  var x = -r*sinAlpha, z = r*cosAlpha;                     // Räumliche Koordinaten
  var uM = screenU(x,y), vM = screenV(x,y,z);              // Bildschirmkoordinaten
  circle(uM,vM,2,"#ffffff");                               // Markierung (weißer Kreis)
  }
  
// Linker (hinterer) Schleifring für Wechselstrom-Generator:

function leftRing () {
  if (sinAlpha > 0)                                        // Falls Zuleitung in der linken Hälfte ...
    lineRot(0,YC1,ZA1,0,YC1,0.75*(ZC1-HC),colorCurrent1,2);// Kurzes Drahtstück zur Innenfläche zeichnen
  ring(YC1,colorCurrent2);                                 // Schrägbild Hohlzylinder
  mark(YC1-HC);                                            // Markierung (weißer Kreis) 
  if (sinAlpha < 0)                                        // Falls Zuleitung in der rechten Hälfte ...
    lineRot(0,YC1,ZA1,0,YC1,0.75*(ZC1-HC),colorCurrent1,2);// Kurzes Drahtstück zur Innenfläche zeichnen       
  if (!genDC)                                              // Falls Wechselstromgenerator ...
    lineRot(0,YC1,-ZA1,0,YC2,-ZA1,colorCurrent1,2);        // Zuleitung für rechten Schleifring verlängern
  }
  
// Rechter (vorderer) Schleifring für Wechselstrom-Generator:

function rightRing () {
  lineRot(0,YC2,-ZA1,0,YC2,0.75*(-ZC1+HC),colorCurrent1,2);// Kurzes Drahtstück zur Innenfläche zeichnen
  ring(YC2,colorCurrent2);                                 // Schrägbild Hohlzylinder   
  mark(YC2-HC);                                            // Markierung (weißer Kreis) 
  if (sinAlpha > 0)                                        // Falls Zuleitung in der rechten Hälfte ...
    lineRot(0,YC2,-ZA1,0,YC2,0.75*(-ZC1+HC),colorCurrent1,2); // Kurzes Drahtstück zur Innenfläche zeichnen
  }
  
// Kommutator:
  
function commutator () {
  var color = (current!=0 ? colorCurrent2 : colorContact); // Farbe für Kreiszylinder
  cylinder(YC1,color);                                     // Schrägbild Kreiszylinder
  // Die Isolierschicht wird näherungsweise durch zwei Polygone dargestellt, eines auf der Vorderfläche (pgInsulator1)
  // und eines auf der Mantelfläche (pgInsulator2).
  var dw = INSMAX/5;                                       // Winkel für Polygonecken (Bogenmaß)
  var r = ZC1-HC;                                          // Radius
  for (i=0; i<20; i++) {                                   // Für alle Polygonecken (Vorderfläche) ...
    var w = (i<10 ? (i-5)*dw : (i-15)*dw+PI);              // Winkel berechnen
    var xx = r*Math.cos(w);                                // x-Koordinate der Polygonecke berechnen
    var zz = r*Math.sin(w);                                // z-Koordinate der Polygonecke berechnen
    setPointRot(pgInsulator1,i,xx,-HC,zz);                 // Bildschirmkoordinaten der Ecke speichern 
    }
  // Durch die Variable seite wird festgestellt, welche Seite des Kommutators sichtbar ist.
  var seite = c1*cosAlpha+c3*sinAlpha;                     // Skalarprodukt
  for (i=0; i<10; i++) {                                   // Für die ersten 10 Polygonecken (Mantelfläche) ...
    var w = (i-5)*dw;                                      // Winkel berechnen
    if (seite > 0) w += PI;                                // Falls falsche Seite, pi addieren
    var xx = r*Math.cos(w);                                // x-Koordinate der Polygonecke berechnen
    var zz = r*Math.sin(w);                                // z-Koordinate der Polygonecke berechnen
    setPointRot(pgInsulator2,i,xx,-HC,zz);                 // Bildschirmkoordinaten für Ecke auf der Vorderseite speichern
    setPointRot(pgInsulator2,19-i,xx,HC,zz);               // Bildschirmkoordinaten für Ecke auf der Rückseite speichern
    }
  drawPolygon(pgInsulator1,colorInsulator);                // Polygon auf der Vorderfläche zeichnen
  drawPolygon(pgInsulator2,colorInsulator);                // Polygon auf der Mantelfläche zeichnen
  }
  
// Handkurbel:
// y ... y-Koordinate (Mittelpunkt der Kurbelscheibe, auf y-Achse)

function crank (y) {
  cylinder(y,colorCrank);                                  // Kurbelscheibe
  var r = 24;                                              // Abstand Mittelpunkt-Kurbelgriff
  var x = -r*sinAlpha, z = r*cosAlpha;                     // Räumliche Koordinaten Kurbelgriff
  var u0 = screenU(x,y-HC), v0 = screenV(x,y-HC,z);        // Bildschirmkoordinaten Kurbelgriff
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = colorCrank;                              // Füllfarbe
  var a = aEllipse/12, b = bEllipse/12;                    // Halbachsen für Kurbelgriff
  addEllipticalArc(u0,v0,a,b,deltaEllipse,1.5*PI,0.5*PI);  // Halbellipse hinten links
  var u1 = screenU(x,y-36), v1 = screenV(x,y-36,z);        // Mittelpunkt der vorderen Ellipse
  ctx.lineTo(u1+b*Math.sin(deltaEllipse),v1+b*Math.cos(deltaEllipse)); // Verbindungslinie
  addEllipticalArc(u1,v1,a,b,deltaEllipse,0.5*PI,1.5*PI);  // Halbellipse vorne rechts
  ctx.closePath();                                         // Zurück zum Anfangspunkt
  ctx.fill(); ctx.stroke();                                // Ausgefüllte Fläche mit Rand
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  addEllipticalArc(u1,v1,a,b,deltaEllipse,0,PI2);          // Vordere Ellipse vorbereiten
  ctx.stroke();                                            // Rand der vorderen Ellipse  
  }
  
// Kontakt zeichnen:
// pg ... Polygon
// pt ... Innerer Punkt

function contact (pg, pt) {
  var col = (current!=0 ? colorCurrent2 : colorContact);   // Farbe (mit bzw. ohne Strom) 
  drawPolygon(pg,col);                                     // Ausgefülltes Polygon mit Rand
  var u = pt.u, v = pt.v;                                  // Innerer Punkt
  lineP(u,v,pg,1);                                         // Linie vom inneren Punkt nach unten
  lineP(u,v,pg,3);                                         // Linie vom inneren Punkt nach rechts oben
  lineP(u,v,pg,5);                                         // Linie vom inneren Punkt nach links oben
  }
  
// Voltmeter (mit Zuleitungen und Strompfeilen):
// rv ... Relative Spannung (zwischen -1 und +1)

function voltmeter (rv) {
  drawPolygon(pgVoltmeter1,colorVoltage);                  // Polygon für Gehäuse
  var u = pointVoltmeter.u, v = pointVoltmeter.v;          // Innerer Punkt
  lineP(u,v,pgVoltmeter1,1);                               // Linie vom inneren Punkt nach unten
  lineP(u,v,pgVoltmeter1,3);                               // Linie vom inneren Punkt nach rechts oben
  lineP(u,v,pgVoltmeter1,5);                               // Linie vom inneren Punkt nach links oben
  drawPolygon(pgVoltmeter2,"#ffffff");                     // Parallelogramm für Skala
  newPath(THICK);                                          // Neuer Grafikpfad für Zeiger
  var x0 = (XW2+XW3)/2;                                    // x-Koordinate der Mittelposition
  var wMax = 0.36;                                         // Maximaler Auslenkungswinkel (Bogenmaß)
  var w = wMax*rv;                                         // Aktueller Auslenkungswinkel (Bogenmaß)
  moveTo(x0,YW2,ZW1);                                      // Anfangspunkt des Zeigers (unten)
  lineTo(x0+125*Math.sin(w),YW2,ZW1+125*Math.cos(w));      // Weiter zum Endpunkt des Zeigers (oben)
  ctx.stroke();                                            // Zeiger zeichnen  
  drawPolygon(pgVoltmeter3,colorVoltage);                  // Unteren Teil neu ausfüllen, Zeiger teilweise verdecken
  u = screenU(XW2,YW2); v = screenV(XW2,YW2,ZW1);          // Bildschirmkoordinaten der linken Buchse (Pixel)
  circle(u,v,3,"#000000");                                 // Linke Buchse
  u = screenU(XW3,YW2); v = screenV(XW3,YW2,ZW1);          // Bildschirmkoordinaten der rechten Buchse (Pixel)
  circle(u,v,3,"#000000");                                 // Rechte Buchse  
  newPath(THICK);                                          // Neuer Grafikpfad für Zuleitungen
  ctx.strokeStyle = colorCurrent();                        // Linienfarbe je nach Stromfluss
  moveTo(XW2,YW2,ZW1);                                     // Anfangspunkt (linke Buchse)
  lineTo(XW2,YW3,ZW1);                                     // Weiter in y-Richtung zum Betrachter
  lineTo(XC1,YW3,ZW1);                                     // Weiter nach links
  moveTo(XW3,YW2,ZW1);                                     // Neuer Anfangspunkt (rechte Buchse)
  lineTo(XW3,YW3,ZW1);                                     // Weiter in y-Richtung zum Betrachter
  lineTo(XW4,YW3,ZW1);                                     // Weiter nach rechts
  ctx.stroke();                                            // Zuleitungen zeichnen
  if (iArrows && current != 0)                             // Falls sinnvoll ...
    arrowLine(XC1,YW3,ZW1,XW2,YW3,ZW1,0.6+current*0.3,current<0); // Pfeilspitze für Stromrichtung
  newPath(3);                                              // Neuer Grafikpfad für Symbole 
  moveTo(XW2-8,YW2,ZW1+15);                                // Anfangspunkt (linkes Ende Minuszeichen)
  lineTo(XW2+8,YW2,ZW1+15);                                // Weiter zum rechten Endpunkt des Minuszeichens
  moveTo(XW3-8,YW2,ZW1+15);                                // Neuer Anfangspunkt (linkes Ende Pluszeichen)
  lineTo(XW3+8,YW2,ZW1+15);                                // Weiter zum rechten Endpunkt des Pluszeichens
  moveTo(XW3,YW2,ZW1+23);                                  // Neuer Anfangspunkt (oberes Ende Pluszeichen)
  lineTo(XW3,YW2,ZW1+7);                                   // Weiter zum unteren Endpunkt des Pluszeichens
  moveTo(x0-7,YW2,ZW1+23);                                 // Neuer Anfangspunkt (linkes oberes Ende 'V')
  lineTo(x0,YW2,ZW1+5);                                    // Weiter zum unteren Ende des 'V'
  lineTo(x0+7,YW2,ZW1+23);                                 // Weiter zum rechten oberen Ende des 'V'
  ctx.stroke();                                            // Symbole '-', '+' und 'V' zeichnen
  newPath(2);                                              // Neuer Grafikpfad für Skala
  for (var i=-2; i<=2; i++) {                              // Für alle Markierungen ...
    if (i == 0) continue;                                  // Mittelposition auslassen
    w = i*wMax/2;                                          // Winkel (Bogenmaß)
    var sin = Math.sin(w), cos = Math.cos(w);              // Trigonometrische Werte
    moveTo(x0+130*sin,YW2,ZW1+130*cos);                    // Anfangspunkt (unten)
    lineTo(x0+140*sin,YW2,ZW1+140*cos);                    // Weiter zum Endpunkt (oben)
    }
  ctx.stroke();                                            // Markierungen zeichnen
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  ctx.textAlign = "center";                                // Textausrichtung
  ctx.fillText("0",screenU(x0,YW2),screenV(x0,YW2,ZW1+130));  // Nullmarkierung  
  }
  
// Drähte vom oberen Kontakt in Richtung rechte Messgerät-Buchse:

function wires1 () {
  newPath(THICK);                                          // Neuer Grafikpfad
  ctx.strokeStyle = colorCurrent();                        // Linienfarbe 
  moveTo(0,YW1,ZC1+HC);                                    // Anfangspunkt (Oberseite des oberen Kontakts)
  lineTo(0,YW1,ZW2);                                       // Weiter nach oben
  lineTo(XW1,YW1,ZW2);                                     // Weiter nach rechts (in Richtung Messgerät)
  lineTo(XW1,YW1,ZW1);                                     // Weiter nach unten
  lineTo(XW4,YW1,ZW1);                                     // Weiter nach rechts (hinter dem Messgerät)
  lineTo(XW4,YW3,ZW1);                                     // Weiter zum Betrachter (rechts vom Messgerät)
  ctx.stroke();                                            // Drähte zeichnen
  if (iArrows && current != 0)                             // Falls sinnvoll ... 
    arrowLine(0,YW1,ZW2,XW1,YW1,ZW2,0.5,current>0);        // Pfeilspitze für Stromrichtung
  }
  
// Drähte vom unteren Kontakt in Richtung linke Messgerät-Buchse:

function wires2 () {
  newPath(THICK);                                          // Neuer Grafikpfad
  ctx.strokeStyle = colorCurrent();                        // Linienfarbe je nach Stromfluss
  var y = (genDC ? YC1 : YC2);                             // y-Koordinate des unteren Kontakts
  moveTo(XC1,y,-ZC1-HC);                                   // Anfangspunkt (Unterseite des unteren Kontakts)
  lineTo(XC1,y,ZW1);                                       // Weiter nach unten
  lineTo(XC1,YW3,ZW1);                                     // Weiter in Richtung Messgerät (linke Buchse)  
  ctx.stroke();                                            // Drahtstücke zeichnen
  }
      
// Widerstand (Verbraucher) mit Zuleitungen:
// Vorschlag von Teun Koops übernommen

function resistor () {
  var c = colorCurrent();                                  // Farbe je nach Stromfluss
  var uR = screenU(XW1,YC1), vR = screenV(XW1,YC1,ZW1);    // Bildschirmkoordinaten für rechten Knoten
  circle(uR,vR,3,c);                                       // Rechter Knoten
  newPath(THICK);                                          // Neuer Grafikpfad
  ctx.strokeStyle = c;                                     // Linienfarbe
  moveTo(XR2,YC1,ZW1);                                     // Neuer Anfangspunkt (rechtes Ende Widerstand)
  lineTo(XW1,YC1,ZW1);                                     // Weiter zum rechten Knoten
  ctx.stroke();                                            // Zuleitung rechts zeichnen
  newPath();                                               // Neuer Grafikpfad
  ctx.fillStyle = colorResistor;                           // Farbe für Widerstand
  var u0 = screenU(XR1,YC1), v0 = screenV(XR1,YC1,ZW1);    // Bildschirmkoordinaten für linkes Ende Widerstand
  var d = 100*DEG;                                         // Drehwinkel (Bogenmaß)
  addEllipticalArc(u0,v0,10,8,d,0,PI);                     // Halbellipse links
  var u1 = screenU(XR2,YC1), v1 = screenV(XR2,YC1,ZW1);    // Bildschirmkoordinaten für rechtes Ende Widerstand
  addEllipticalArc(u1,v1,10,8,d,PI,0);                     // Halbellipse rechts                 
  ctx.closePath();                                         // Grafikpfad schließen
  ctx.fill(); ctx.stroke();                                // Fläche ausfüllen, Rand
  newPath();                                               // Neuer Grafikpfad
  addEllipticalArc(u0,v0,10,8,d,0,PI2);                    // Komplette Ellipse links
  ctx.stroke();                                            // Ellipse zeichnen
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  ctx.textAlign = "center";                                // Textausrichtung
  ctx.fillText(symbolResistor,0.4*u0+0.6*u1,0.4*v0+0.6*v1+4); // Symbol für Widerstand
  var y = (genDC ? YC1 : YC2);                             // y-Koordinate des linken Knotens
  var uL = screenU(0,y), vL = screenV(0,y,ZW1);            // Bildschirmkoordinaten für linken Knoten
  circle(uL,vL,3,c);                                       // Linker Knoten
  newPath(THICK);                                          // Neuer Grafikpfad
  ctx.strokeStyle = c;                                     // Linienfarbe  
  moveTo(0,y,ZW1);                                         // Anfangspunkt (linker Knoten)
  lineTo(0,YC1,ZW1);                                       // Drahtstück in y-Richtung (nur für Wechselstrom-Generator)  
  lineTo(XR1,YC1,ZW1);                                     // Weiter zum linken Ende des Widerstands
  ctx.stroke();                                            // Zuleitung links zeichnen
  }
      
// Hilfsroutine:
// du ... Bildschirmkoordinate relativ zum Ursprung (Pixel)
// f1 ... Faktor für Zeitachse
// f2 ... Faktor für Spannungsachse
// Rückgabewert: Bildschirmkoordinate relativ zum Ursprung (Pixel, oben positiv)

function dvDiagram (du, f1, f2) {
  var dv = f2*Math.cos(du*f1);                             // Bildschirmkoordinate relativ zum Ursprung (Pixel)
  if (genDC) dv = Math.abs(dv);                            // Falls Kommutator, Betrag
  return direction*dv;                                     // Rückgabewert (Vorzeichen je nach Bewegungsrichtung)
  }
  
// Diagramm:
// (u,v) ... Ursprung (Pixel)

function diagram (u, v) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  arrow(u-10,v,u+215,v);                                   // Waagrechte Achse (Zeit t)
  var pixT = 4;                                            // Umrechnungsfaktor (Pixel pro Sekunde)
  for (var i=1; i<=5; i++) {                               // Für alle Ticks der t-Achse (im Abstand 10 s) ...
    var uT = u+i*10*pixT;                                  // Waagrechte Bildschirmkoordinate (Pixel) 
    line(uT,v-3,uT,v+3);                                   // Tick zeichnen
    }
  ctx.fillStyle = "#000000";                               // Schriftfarbe schwarz
  ctx.textAlign = "center";                                // Textausrichtung zentriert
  ctx.fillText(symbolTime,u+210,v+15);                     // Beschriftung t-Achse
  arrow(u,v+45,u,v-45);                                    // Senkrechte Achse (Spannung U)
  for (i=-2; i<=2; i++) {                                  // Für alle Ticks der U-Achse ...
    var vT = v+i*15;                                       // Senkrechte Bildschirmkoordinate (Pixel)
    line(u-3,vT,u+3,vT);                                   // Tick zeichnen
    }
  ctx.textAlign = "right";                                 // Textausrichtung rechtsbündig
  ctx.fillText(symbolVoltage,u-5,v-35);                    // Beschriftung U-Achse
  var a = 75*omega/PI;                                     // Amplitude (Pixel)
  var f1 = omega/pixT;                                     // Faktor für Zeitachse
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.moveTo(u,v-direction*a);                             // Anfangspunkt des Polygonzugs
  var uu = u;                                              // Waagrechte Bildschirmkoordinate
  while (uu < u+200) {                                     // Solange rechtes Ende noch nicht erreicht ...
    uu += 0.5;                                             // Waagrechte Bildschirmkoordinate erhöhen
    var vv = v-dvDiagram(uu-u,f1,a);                       // Senkrechte Bildschirmkoordinate
    // Korrektur für Unterbrechung durch Isolierschicht des Kommutators
    ctx.lineTo(uu,vv);                                     // Linie des Polygonzugs vorbereiten
    }
  ctx.stroke();                                            // Polygonzug zeichnen (Näherung für Kurve)
  var u0 = u+t*pixT;                                       // Waagrechte Bildschirmkoordinate für aktuelle Zeit
  var v0 = v-dvDiagram(u0-u,f1,a);                         // Senkrechte Bildschirmkoordinate für aktuelle Spannung
  circle(u0,v0,2.5,colorVoltage);                          // Markierung für aktuelle Werte
  }
  
// Grafikausgabe:
// Seiteneffekt current, t, t0, alpha, cosAlpha, sinAlpha, current ...
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  ctx.font = FONT;                                         // Zeichensatz
  current = 0;                                             // Richtung des Induktionsstroms, vorläufiger Wert
  if (cosAlpha > 0) current = 1;                           // Richtung des Induktionsstroms, falls Markierung oben
  else if (cosAlpha < 0) current = -1;                     // Richtung des Induktionsstroms, falls Markierung unten
  if (genDC) current = Math.abs(current);                  // Falls Gleichstrom-Generator, Absolutbetrag
  current *= direction;                                    // Richtung des Induktionsstroms je nach Bewegungsrichtung
  if (on && omega > 0) {                                   // Falls Bewegung ...
    var t1 = new Date();                                   // Aktueller Zeitpunkt 
    var dt = (t1-t0)/1000;                                 // Verstrichene Zeit (s)
    t += dt;                                               // Zeitvariable aktualisieren
    t0 = t1;                                               // Neuer Bezugszeitpunkt
    alpha += direction*omega*dt;                           // Winkel aktualisieren
    var n = Math.floor(alpha/PI2);                         // Zahl der ganzen Umdrehungen
    if (alpha >= 0) alpha -= n*PI2;                        // Falls alpha positiv, alpha < 2 pi erzwingen
    else alpha -= (n-1)*PI2;                               // Falls alpha negativ, alpha >= 0 erzwingen
    if (omega > 0 && t > nPer*PI2/omega)                   // Falls Zeitvariable zu groß ...
      t -= nPer*PI2/omega;                                 // t reduzieren
    cosAlpha = Math.cos(alpha);                            // Cosinuswert aktualisieren 
    sinAlpha = Math.sin(alpha);                            // Sinuswert aktualisieren
    } 
  var dw = (genDC ? 0.05 : 0);                             // Toleranz für sinAlpha wegen Isolierschicht
  if (Math.abs(sinAlpha) > 1-dw) current = 0;              // Wenn Isolierschicht an den Kontakten, kein Strom
  magnetSouth();                                           // Südpol des Hufeisenmagneten 
  var qu = Math.floor(alpha/PIH);                          // Quadrant (0 bis 3) für Drehung im Gegenuhrzeigersinn
  if (direction == -1) qu = (qu%2==0 ? qu+1 : qu-1);       // Quadrant (0 bis 3) für Drehung im Uhrzeigersinn
  switch(qu) {                                             // Je nach Quadrant (gegenseitige Verdeckungen!) ...
    case 0:
      movementArrow(2);                                    // Hinterer Pfeil für Bewegungsrichtung
      halfArmature(2);                                     // Hintere Ankerhälfte
      fieldLines(-2,2);                                    // Alle Feldlinien
      halfArmature(1);                                     // Vordere Ankerhälfte
      movementArrow(1); break;                             // Vorderer Pfeil für Bewegungsrichtung
    case 1:
      fieldLines(2,2);                                     // Feldlinie ganz links
      halfArmature(2);                                     // Hintere Ankerhälfte
      fieldLines(0,1);                                     // Feldlinien halblinks und Mitte
      movementArrow(2);                                    // Hinterer Pfeil für Bewegungsrichtung
      movementArrow(1);                                    // Vorderer Pfeil für Bewegungsrichtung
      fieldLines(-2,-1);                                   // Feldlinien halbrechts und ganz rechts
      halfArmature(1); break;                              // Vordere Ankerhälfte
    case 2:
      movementArrow(1);                                    // Hinterer Pfeil für Bewegungsrichtung
      halfArmature(1);                                     // Hintere Ankerhälfte
      fieldLines(-2,2);                                    // Alle Feldlinien
      halfArmature(2);                                     // Vordere Ankerhälfte
      movementArrow(2); break;                             // Vorderer Pfeil für Bewegungsrichtung
    case 3:
      fieldLines(2,2);                                     // Feldlinie ganz links
      halfArmature(1);                                     // Hintere Ankerhälfte 
      fieldLines(0,1);                                     // Feldlinien halblinks und Mitte
      movementArrow(1);                                    // Hinterer Pfeil für Bewegungsrichtung
      movementArrow(2);                                    // Vorderer Pfeil für Bewegungsrichtung
      fieldLines(-2,-1);                                   // Feldlinien halbrechts und ganz rechts
      halfArmature(2); break;                              // Vordere Ankerhälfte
      }
  magnetNorth();                                           // Nordpol des Hufeisenmagneten
  wires2();                                                // Drähte vom unteren Kontakt in Richtung linke Buchse Messgerät
  if (genDC) {                                             // Falls Gleichstrom-Generator (mit Kommutator) ...
    contact(pgContact2,pointContact2);                     // Unterer Schleifkontakt 
    commutator();                                          // Kommutator
    contact(pgContact1,pointContact1);                     // Oberer Schleifkontakt
    resistor();                                            // Widerstand 
    wires1();                                              // Drähte vom oberen Kontakt in Richtung rechte Buchse Messgerät
    crank(YC3);                                            // Handkurbel
    voltmeter(direction*5*omega*Math.abs(cosAlpha)/PI2);   // Messgerät
    }
  else {                                                   // Falls Wechselstrom-Generator (ohne Kommutator) ...
    contact(pgContact3,pointContact3);                     // Unterer Schleifkontakt
    leftRing(); rightRing();                               // Schleifringe
    contact(pgContact1,pointContact1);                     // Oberer Schleifkontakt
    resistor();                                            // Widerstand
    wires1();                                              // Drähte vom oberen Kontakt in Richtung rechte Buchse Messgerät
    crank(YC4);                                            // Handkurbel
    voltmeter(direction*5*omega*cosAlpha/PI2);             // Messgerät
    }
  diagram(360,65);                                         // Diagramm (Spannung in Abhängigkeit von der Zeit)
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen



