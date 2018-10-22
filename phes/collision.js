// Elastischer und unelastischer Stoß
// Java-Applet (07.11.1998) umgewandelt
// 06.12.2014 - 11.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel collision_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var color1 = "#ff0000";                                    // Farbe für Wagen 1 (links)
var color2 = "#0000ff";                                    // Farbe für Wagen 2 (rechts)
var colorWheel = "#ff8040";                                // Farbe für Räder

// Sonstige Konstanten:

var lWagon = 0.1;                                          // Wagenlänge (m)
var distance = 1;                                          // Strecke (m)
var pix = 400;                                             // Umrechnungsfaktor (Pixel pro m)
var dSpring = 500;                                         // Federkonstante (N/m)
var lSpring = 0.05;                                        // Federlänge (m)
var dMax = 0.09;                                           // Abstand zu Beginn der Ankopplung (m)
var dMin = 0.0575;                                         // Abstand nach Ankopplung (m)
var FONT1 = "normal normal bold 12px sans-serif";          // Zeichensatz

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var bu1, bu2;                                              // Schaltknöpfe (Zurück, Start)
var cbSlow;                                                // Optionsfeld (Zeitlupe)
var ipM1, ipV1;                                            // Eingabefelder für Wagen 1 (Masse, Geschwindigkeit)
var ipM2, ipV2;                                            // Eingabefelder für Wagen 2 (Masse, Geschwindigkeit)
var rb1, rb2;                                              // Radiobuttons (elastisch, unelastisch)
var rbV, rbP, rbE;                                         // Radiobuttons (Geschwindigkeit, Impuls, kinetische Energie)
var on;                                                    // Flag für Bewegung
var slow;                                                  // Flag für Zeitlupe
var t0;                                                    // Anfangszeitpunkt
var t;                                                     // Aktuelle Zeit (s)
var timer;                                                 // Timer für Animation
var yM;                                                    // y-Koordinate der Fahrbahn (Pixel)
var elastic;                                               // Flag für elastischen Stoß
var m1, m2;                                                // Massen (kg)
var mSum;                                                  // Gesamtmasse (kg)
var mRed;                                                  // Reduzierte Masse (kg)
var v1Old, v2Old, v1New, v2New;                            // Geschwindigkeiten (m/s)
var vS;                                                    // Geschwindigkeit des Schwerpunkts (m/s)
var p1Old, p2Old, p1New, p2New;                            // Impulse (m kg/s)
var e1Old, e2Old, e1New, e2New;                            // Kinetische Energien (J)
var tBeg, tMid, tEnd;                                      // Zeit des Zusammenstoßes (s)
var x1, x2;                                                // x-Koordinaten der Wagenmittelpunkte (m)
var x1Beg, x2Beg;                                          // x-Koordinaten bei Stoßbeginn (m)
var x1End, x2End;                                          // x-Koordinaten bei Stoßende (m)
var hWagon1, hWagon2;                                      // Wagenhöhen (Pixel)
var omega;                                                 // Hilfsgröße für elastischen Stoß (1/s)
var c1, c2;                                                // Hilfsgrößen für elastischen Stoß
var c4, c5, c6, c7, d0;                                    // Hilfsgrößen für unelastischen Stoß
var poly1a, poly1b, poly3;                                 // Polygone für Kupplung
var cos, sin;                                              // Trigonometrische Werte für Kupplung

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
  rb1 = getElement("rb1");                                 // Radiobutton (elastischer Stoß)
  rb1.checked = true;                                      // Radiobutton auswählen
  getElement("lb1",text01);                                // Erklärender Text (elastischer Stoß)
  rb2 = getElement("rb2");                                 // Radiobutton (unelastischer Stoß)
  getElement("lb2",text02);                                // Erklärender Text (unelastischer Stoß)
  bu1 = getElement("bu1",text03);                          // Resetknopf
  bu2 = getElement("bu2",text04);                          // Startknopf
  bu2.disabled = false;                                    // Startknopf aktiviert
  cbSlow = getElement("cbSlow");                           // Optionsfeld (Zeitlupe)
  cbSlow.checked = false;                                  // Zeitlupe zunächst abgeschaltet
  getElement("lbSlow",text05);                             // Erklärender Text (Zeitlupe)
  getElement("wagon1",text06);                             // Erklärender Text (Wagen 1)
  getElement("ipM1a",text08);                              // Erklärender Text (Masse 1)
  ipM1 = getElement("ipM1b");                              // Eingabefeld (Masse 1)
  getElement("ipM1c",kilogram);                            // Einheit (Masse 1)
  getElement("ipV1a",text09);                              // Erklärender Text (Geschwindigkeit 1)
  ipV1 = getElement("ipV1b");                              // Eingabefeld (Geschwindigkeit 1)
  getElement("ipV1c",meterPerSecond);                      // Einheit (Geschwindigkeit 1)
  getElement("wagon2",text07);                             // Erklärender Text (Wagen 2)
  getElement("ipM2a",text08);                              // Erklärender Text (Masse 2)
  ipM2 = getElement("ipM2b");                              // Eingabefeld (Masse 2)
  getElement("ipM2c",kilogram);                            // Einheit (Masse 2)
  getElement("ipV2a",text09);                              // Erklärender Text (Geschwindigkeit 2)
  ipV2 = getElement("ipV2b");                              // Eingabefeld (Geschwindigkeit 2)
  getElement("ipV2c",meterPerSecond);                      // Einheit (Geschwindigkeit 2)
  rbV = getElement("rbV");                                 // Radiobutton (Geschwindigkeit)
  rbV.checked = true;                                      // Radiobutton auswählen
  getElement("lbV",text10);                                // Erklärender Text (Geschwindigkeit)
  rbP = getElement("rbP");                                 // Radiobutton (Impuls)
  getElement("lbP",text11);                                // Erklärender Text (Impuls)
  rbE = getElement("rbE");                                 // Radiobutton (kinetische Energie)
  getElement("lbE",text12);                                // Erklärender Text (kinetische Energie)
  getElement("author",author);                             // Autor
  
  yM = height/2;                                           // y-Koordinate der Fahrbahn (Pixel)
  poly1a = new Array(8);                                   // Polygon für festen Teil der Kupplung von Wagen 1
  poly1b = new Array(6);                                   // Polygon für drehbaren Teil der Kupplung von Wagen 1
  poly2 = new Array(12);                                   // Polygon für Kupplung von Wagen 2
  on = slow = false;                                       // Animation und Zeitlupe zunächst abgeschaltet
  m1 = m2 = 0.5;                                           // Anfangswerte der Massen (kg)
  v1Old = 0.2; v2Old = 0;                                  // Anfangswerte der Geschwindigkeiten vor dem Stoß (m/s)
  updateInput();                                           // Eingabefelder aktualisieren 
  enableInput(true);                                       // Eingabe zunächst möglich
  t = 0;                                                   // Zeitvariable (s)  
  calculation();                                           // Berechnungen (Seiteneffekt!)
  paint();                                                 // Zeichnen    
  slow = false;                                            // Zeitlupe zunächst abgeschaltet
  rb1.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (elastischer Stoß)
  rb2.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (unelastischer Stoß)
  bu1.onclick = reactionReset;                             // Reaktion auf Resetknopf
  bu2.onclick = reactionStart;                             // Reaktion auf Startknopf
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld Zeitlupe
  ipM1.onkeydown = reactionEnter;                          // Reaktion auf Enter-Taste (Masse 1)
  ipV1.onkeydown = reactionEnter;                          // Reaktion auf Enter-Taste (Geschwindigkeit 1)
  ipM2.onkeydown = reactionEnter;                          // Reaktion auf Enter-Taste (Masse 2)
  ipV2.onkeydown = reactionEnter;                          // Reaktion auf Enter-Taste (Geschwindigkeit 2)
  rbV.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Geschwindigkeit)
  rbP.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Impuls)
  rbE.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (kinetische Energie)    
  } // Ende der Methode start
  
// Aktivierung bzw. Deaktivierung der Eingabefelder:
// p ... Flag für mögliche Eingabe

function enableInput (p) {
  rb1.disabled = !p;                                       // Radiobutton für elastischen Stoß
  rb2.disabled = !p;                                       // Radiobutton für unelastischen Stoß
  ipM1.readOnly = !p;                                      // Eingabefeld für Masse 1
  ipV1.readOnly = !p;                                      // Eingabefeld für Geschwindigkeit 1
  ipM2.readOnly = !p;                                      // Eingabefeld für Masse 2
  ipV2.readOnly = !p;                                      // Eingabefeld für Geschwindigkeit 2
  }
  
// Reaktion auf Resetknopf:
   
function reactionReset () {
  bu2.disabled = false;                                    // Startknopf aktivieren
  enableInput(true);                                       // Eingabefelder aktivieren
  stopAnimation();                                         // Animation abschalten
  t = 0;                                                   // Zeitvariable zurücksetzen
  reaction();                                              // Eingegebene Werte übernehmen und rechnen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf den Schaltknopf Start:

function reactionStart () {
  bu2.disabled = true;                                     // Startknopf deaktivieren
  enableInput(false);                                      // Eingabefelder deaktivieren
  startAnimation();                                        // Animation starten
  reaction();                                              // Eingegebene Werte übernehmen und rechnen
  }
  
// Reaktion auf Optionsfeld Zeitlupe:
// Seiteneffekt slow

function reactionSlow () {
  slow = cbSlow.checked;                                   // Flag setzen
  }
  
// Hilfsroutine: Eingabe übernehmen und rechnen

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
  elastic = rb1.checked;                                   // Flag für elastischen Stoß
  if (elastic) calcElastic(); else calcInelastic();        // Berechnungen (je nach Art des Stoßes)
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

// Berechnung von Impuls und kinetischer Energie:
// Seiteneffekt p1Old, p2Old, p1New, p2New, e1Old, e2Old, e1New, e1New

function calcPE () {
  p1Old = m1*v1Old; p2Old = m2*v2Old;                      // Impulswerte vor dem Stoß (kg m/s)
  p1New = m1*v1New; p2New = m2*v2New;                      // Impulswerte nach dem Stoß (kg m/s)
  e1Old = m1/2*v1Old*v1Old; e2Old = m2/2*v2Old*v2Old;      // Energiewerte vor dem Stoß (J)
  e1New = m1/2*v1New*v1New; e2New = m2/2*v2New*v2New;      // Energiewerte nach dem Stoß (J)
  }

// Hilfsroutine (Zeiten für Zusammenstoß):
// dt ... Halbe Dauer des Stoßvorgangs (s)
// Seiteneffekt tBeg, tMid, tEnd

function setTime (dt) {
  tBeg = -dt;                                              // Vorläufiger Anfangszeitpunkt (s)
  var t10 = 0;                                    
  if (v1Old > 0) t10 = tBeg-(x1Beg+lWagon/2)/v1Old;
  else if (v1Old < 0) 
    t10 = tBeg-(distance+lWagon/2-x1Beg)/(-v1Old);
  var t20 = 0;
  if (v2Old > 0) t20 = tBeg-(x2Beg+lWagon/2)/v2Old;
  else if (v2Old < 0) t20 = tBeg-(distance+lWagon/2-x2Beg)/(-v2Old); 
  tMid = -Math.min(t10,t20)+0.5;
  tBeg = tMid-dt; tEnd = tMid+dt;
  }
    
// Berechnungen für elastischen Stoß:
// Seiteneffekt v1New, v2New, p1Old, p2Old, p1New, p2New, e1Old, e2Old, e1New, e1New,
// omega, c1, c2, x1Beg, x2Beg, x1End, x2End, tBeg, tMid, tEnd

function calcElastic () {
  v1New = (m1*v1Old+m2*(2*v2Old-v1Old))/mSum;              // Geschwindigkeit von Wagen 1 nach dem Stoß (m/s)
  v2New = (m2*v2Old+m1*(2*v1Old-v2Old))/mSum;              // Geschwindigkeit von Wagen 2 nach dem Stoß (m/s)
  calcPE();                                                // Impuls und Energie vor und nach dem Stoß (SI-Einheiten)
  omega = Math.sqrt(dSpring/mRed);                         // Kreisfrequenz (1/s)
  c1 = (v1Old-vS)/omega;                                   // Amplitude (m)
  c2 = -m2*(lWagon+lSpring)/mSum;                          // Hilfsgröße (m)
  var dt = Math.PI/(2*omega);                              // Halbe Dauer des Stoßvorgangs (s)
  var xS = distance/2-vS*dt;                               // Schwerpunktsposition zu Beginn des Stoßes (m)
  var h = (lWagon+lSpring)/mSum;                           // Hilfsgröße (m/kg)
  x1Beg = xS-m2*h; x2Beg = xS+m1*h;                        // Positionen der Wagenmittelpunkte zu Beginn des Stoßes (m)
  xS = distance/2+vS*dt;                                   // Schwerpunktsposition am Ende des Stoßes (m)
  x1End = xS-m2*h; x2End = xS+m1*h;                        // Positionen der Wagenmittelpunkte am Ende des Stoßes (m)
  setTime(dt);                                             // Anfang, Mitte und Ende des Stoßes (s)
  }

// Berechnungen für unelastischen Stoß:
// Seiteneffekt v1New, v2New, p1Old, p2Old, p1New, p2New, e1Old, e2Old, e1New, e1New,
// c4, c5, c6, c7, d0, x1Beg, x2Beg, x1End, x2End, tBeg, tMid, tEnd

function calcInelastic () {
  v1New = v2New = vS;                                      // Gemeinsame Geschwindigkeit nach dem Stoß (m/s)
  calcPE();                                                // Impuls und Energie vor und nach dem Stoß (SI-Einheiten)
  var dt = (dMax-dMin)/(v1Old-v2Old);                      // Halbe Dauer des Ankopplungsvorgangs (s) 
  c4 = (v1New-v1Old)/(4*dt);                               // Halbe Beschleunigung von Wagen 1 (m/s²) 
  c5 = (v1Old+v1New)/2;                                    // Geschwindigkeit von Wagen 1 nach der Hälfte des Ankopplungsvorgangs (m/s)
  c6 = (v2New-v2Old)/(4*dt);                               // Halbe Beschleunigung von Wagen 2 (m/s²)
  c7 = (v2Old+v2New)/2;                                    // Geschwindigkeit von Wagen 2 nach der Hälfte des Ankopplungsvorgangs (m/s)
  d0 = (c4-c6)*dt*dt+(c7-c5)*dt+dMax;                      // Abstand eines Wagens vom Mittelpunkt (m)
  x1Beg = c4*dt*dt-c5*dt+(distance-d0-lWagon)/2;           // x-Koordinate des Mittelpunkts von Wagen 1 zu Beginn (m) 
  x1End = x1Beg+2*c5*dt;                                   // x-Koordinate des Mittelpunkts von Wagen 1 am Ende (m) 
  x2Beg = c6*dt*dt-c7*dt+(distance+d0+lWagon)/2;           // x-Koordinate des Mittelpunkts von Wagen 2 zu Beginn (m)          
  x2End = x2Beg+2*c7*dt;                                   // x-Koordinate des Mittelpunkts von Wagen 2 am Ende (m)
  setTime(dt);                                             // Zeit für Beginn, Mitte und Ende des Ankopplungsvorgangs (s)
  }

// Berechnung der momentanen Positionen:
// Seiteneffekt x1, x2
  
function calculateX () {
  if (t < tBeg) {                                          // Falls Zeitpunkt vor dem Stoßvorgang ...
    var dt1 = t-tBeg;                                      // ... Zeit relativ zum Beginn des Stoßes (s, negativ)
    x1 = x1Beg+v1Old*dt1;                                  // ... x-Koordinate des Mittelpunkts von Wagen 1 (m)
    x2 = x2Beg+v2Old*dt1;                                  // ... x-Koordinate des Mittelpunkts von Wagen 2 (m)
    }
  else if (t < tEnd) {                                     // Falls Zeitpunkt während des Stoßvorgangs ...
    var dt2 = t-tMid;                                      // ... Zeit relativ zur Halbzeit des Stoßes (s)
    if (elastic) {                                         // ... Falls elastischer Stoß ...
      var u1 = c1*Math.cos(omega*dt2)+c2, u2 = -m1*u1/m2;  // ... Relative Positionen bezüglich Schwerpunkt (m)
      var xS = distance/2+vS*dt2;                          // ... Position des Schwerpunkts (m)
      x1 = xS+u1; x2 = xS+u2;                              // ... Positionen der Wagenmittelpunkte (m)
      }
    else {                                                 // ... Falls unelastischer Stoß ...
      x1 = c4*dt2*dt2+c5*dt2+(distance-d0-lWagon)/2;       // ... x-Koordinate des Mittelpunkts von Wagen 1 (m) 
      x2 = c6*dt2*dt2+c7*dt2+(distance+d0+lWagon)/2;       // ... x-Koordinate des Mittelpunkts von Wagen 2 (m)
      }
    }
  else {                                                   // Falls Zeitpunkt nach dem Stoßvorgang ...
    var dt3 = t-tEnd;                                      // ... Zeit seit dem Ende des Stoßes (positiv) 
    x1 = x1End+v1New*dt3;                                  // ... x-Koordinate des Mittelpunkts von Wagen 1 (m) 
    x2 = x2End+v2New*dt3;                                  // ... x-Koordinate des Mittelpunkts von Wagen 2 (m)
    }
  }

// Berechnungen:
// Seiteneffekt mSum, mRed, vS, elastic, v1New, v2New, p1Old, p2Old, p1New, p2New, e1Old, e2Old, e1New, e1New,
// omega, c1, c2, c4, c5, c6, c7, d0, x1Beg, x2Beg, x1End, x2End, tBeg, tMid, tEnd, hWagon1, hWagon2

function calculation () {
  mSum = m1+m2;                                            // Gesamtmasse (kg)
  mRed = m1*m2/mSum;                                       // Reduzierte Masse (kg)
  vS = (m1*v1Old+m2*v2Old)/mSum;                           // Geschwindigkeit des Schwerpunkts (m/s)
  elastic = rb1.checked;                                   // Flag für elastischen Stoß
  if (elastic) calcElastic(); else calcInelastic();        // Berechnungen (je nach Art des Stoßes)
  hWagon1 = 15+20*m1;                                      // Höhe von Wagen 1 (Pixel)
  hWagon2 = 15+20*m2;                                      // Höhe von Wagen 2 (Pixel)
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
// Seiteneffekt m1, v1Old, m2, v2Old

function input () {
  m1 = inputNumber(ipM1,1,true,0.1,1);                     // Masse von Wagen 1 (kg)
  v1Old = inputNumber(ipV1,1,true,v2Old+0.1,0.5);          // Geschwindigkeit von Wagen 1 vor dem Stoß (m/s)
  m2 = inputNumber(ipM2,1,true,0.1,1);                     // Masse von Wagen 2 (kg)
  v2Old = inputNumber(ipV2,1,true,-0.5,v1Old-0.1);         // Geschwindigkeit von Wagen 2 vor dem Stoß (m/s)
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ipM1.value = ToString(m1,1,true);                        // Eingabefeld für Masse 1
  ipV1.value = ToString(v1Old,1,true);                     // Eingabefeld für Geschwindigkeit 1
  ipM2.value = ToString(m2,1,true);                        // Eingabefeld für Masse 2
  ipV2.value = ToString(v2Old,1,true);                     // Eingabefeld für Geschwindigkeit 2
  }
   
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Grafikpfad
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
  
// Polygon zeichnen:
// p ... Array mit Koordinaten der Ecken
// c ... Füllfarbe

function polygon (p, c) {
  newPath();                                               // Neuer Pfad (Standardwerte)
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.moveTo(p[0].u,p[0].v);                               // Zur ersten Ecke
  for (var i=1; i<p.length; i++)                           // Für alle weiteren Ecken ... 
    ctx.lineTo(p[i].u,p[i].v);                             // Linie zum Pfad hinzufügen
  ctx.closePath();                                         // Zurück zum Ausgangspunkt
  ctx.fill(); ctx.stroke();                                // Polygon ausfüllen und Rand zeichnen   
  }
  
// Text ausrichten (Zeichensatz FONT1):
// s ....... Zeichenkette
// t ....... Typ (0 für linksbündig, 1 für zentriert, 2 für rechtsbündig)
// (x,y) ... Position (Pixel)

function alignText (s, t, x, y) {
  ctx.font = FONT1;                                        // Zeichensatz
  if (t == 0) ctx.textAlign = "left";                      // Je nach Wert von t linksbündiger ...
  else if (t == 1) ctx.textAlign = "center";               // ... oder zentrierter ...
  else ctx.textAlign = "right";                            // ... oder rechtsbündiger Text
  ctx.fillText(s,x,y);                                     // Text ausgeben
  }
  
// Wagen:
// c ... Farbe
// x ... x-Koordinate des Mittelpunkts (m)
// h ... Höhe (Pixel)

function wagon (c, x, h) {
  var x0 = x*pix;                                          // x-Koordinate des Mittelpunkts (Pixel) 
  var d1 = lWagon*pix/2, d2 = d1/2;                        // Halbe und viertel Wagenlänge (Pixel)
  rectangle(x0-d1,yM-12-h,2*d1,h,c);                       // Rechteck für Wagen
  circle(x0-d2,yM-10,6,colorWheel);                        // Kreis für linkes Rad
  circle(x0+d2,yM-10,6,colorWheel);                        // Kreis für rechtes Rad
  }
  
// Feder (beim elastischen Stoß):
// xL ... x-Koordinate für linkes Ende (m)
// xR ... x-Koordinate für rechtes Ende (m)

function spring (xL, xR) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  var xxL = xL*pix, xxR = xR*pix;                          // x-Koordinaten links/rechts (Pixel)
  var y0 = yM-20;                                          // y-Koordinate für Mittelachse
  ctx.moveTo(xxL,y0);                                      // Anfangspunkt (links)
  ctx.lineTo(xxL+2,y0);                                    // Kurzes gerades Stück nach rechts
  var  x = xxL+2, y = y0;                                  // Anfangspunkt des gewundenen Teils 
  var k = 6*Math.PI/(xxR-x);                               // Hilfsgröße (entsprechend 3 Windungen)
  while (x < xxR) {                                        // Solange rechtes Ende noch nicht erreicht ...
    x++;                                                   // x-Koordinate erhöhen
    y = y0+10*Math.sin(k*(x-xxL)); // ...-2 ???            // y-Koordinate berechnen
    ctx.lineTo(x,y);                                       // Linie zum Polygonzug hinzufügen
    }
  ctx.lineTo(x+1,y0);                                      // Polygonzug abschließen
  ctx.stroke();                                            // Polygonzug zeichnen
  }
  
// Hilfsroutine: Fester Teil der Kupplung von Wagen 1, Festlegung einer Polygonecke:
// i ....... Index der Polygonecke
// x0 ...... x-Koordinate des Bezugspunkts
// (x,y) ... Koordinaten relativ zum Bezugspunkt
// Seiteneffekt poly1a

function setPoint1a (i, x0, x, y) {
  poly1a[i] = {u: x0+x, v: yM-20-y}; 
  }
  
// Hilfsroutine: Drehbarer Teil der Kupplung von Wagen 1, Festlegung einer Polygonecke:
// i ....... Index der Polygonecke
// x0 ...... x-Koordinate des Bezugspunkts
// (x,y) ... Koordinaten relativ zum Bezugspunkt
// Seiteneffekt poly1b

function setPoint1b (i, x0, x, y) {
  poly1b[i] = {u: x0+x*cos-y*sin, v: yM-23-y*cos-x*sin};
  }
  
// Hilfsroutine: Kupplung von Wagen 2, Festlegung einer Polygonecke:
// i ....... Index der Polygonecke
// x0 ...... x-Koordinate des Bezugspunkts
// (x,y) ... Koordinaten relativ zum Bezugspunkt
// Seiteneffekt poly2

function setPoint2 (i, x0, x, y) {
  poly2[i] = {u: x0+x, v: yM-20-y};
  }
  
// Kupplung (beim unelastischen Stoß):
// alpha ... Drehwinkel (Bogenmaß)

function coupling (alpha) {
  var xL = (x1+lWagon/2)*pix;                              // Rechter Rand von Wagen 1 (Pixel) 
  setPoint1a(0,xL,0,2); setPoint1a(1,xL,0,-3); 
  setPoint1a(2,xL,2,-3); setPoint1a(3,xL,2,-6); 
  setPoint1a(4,xL,6,-6); setPoint1a(5,xL,6,5);
  setPoint1a(6,xL,2,5); setPoint1a(7,xL,2,2); 
  polygon(poly1a,"#000000");                               // Polygon für festen Teil der Kupplung von Wagen 1
  var xA = xL+4;                                           // Drehachse (Pixel)
  cos = Math.cos(alpha); sin = Math.sin(alpha);            // Trigonometrische Werte
  setPoint1b(0,xA,-2,2); setPoint1b(1,xA,-2,-2);
  setPoint1b(2,xA,8,-2); setPoint1b(3,xA,8,-5);
  setPoint1b(4,xA,12,-1); setPoint1b(5,xA,12,2);
  polygon(poly1b,"#000000");                               // Polygon für drehbaren Teil der Kupplung von Wagen 1 
  var xR = (x2-lWagon/2)*pix;                              // Linker Rand von Wagen 2 (Pixel) 
  setPoint2(0,xR,0,2); setPoint2(1,xR,-2,2);
  setPoint2(2,xR,-2,5); setPoint2(3,xR,-6,5);
  setPoint2(4,xR,-6,-2); setPoint2(5,xR,-12,-2);
  setPoint2(6,xR,-12,1); setPoint2(7,xR,-16,-3);
  setPoint2(8,xR,-16,-6); setPoint2(9,xR,-2,-6);
  setPoint2(10,xR,-2,-3); setPoint2(11,xR,0,-3);
  polygon(poly2,"#000000");                                // Polygon für Kupplung von Wagen 2
  }    
  
// Waagrechter Pfeil mit Liniendicke 3:
// (x,y) .... Anfangspunkt
// len ... Länge (Pixel); negativer Wert bedeutet Pfeil nach links
// Für -1 < len < 1 wird ein Kreis gezeichnet.

function horizontalArrow (x, y, len, c) {
  if (Math.abs(len) >= 1) {                                // Falls Länge mindestens 1 Pixel ...
    ctx.strokeStyle = c;                                   // Farbe übernehmen
    arrow(x,y,x+len,y,3);                                  // Dicker Pfeil
    }
  else circle(x,y,1.5,c);                                  // Falls Länge sehr klein, Kreis für Nullvektor
  }
  
// Ausgabe eines Zahlenwerts:
// text .... Erklärungstext (links)
// z ....... Zahl
// unit .... Einheit
// (x,y) ... Position
// align ... Ausrichtung (-1 linksbündig, 0 zentriert, +1 rechtsbündig)

function write (text, z, unit, x, y, align) {
  var s = text + "  " + ToString(z,3,false) + " " + unit;  // Zeichenkette
  var a = "center";                                        // Textausgabe zentriert ...
  if (align < 0) a = "left";                               // ... oder linksbündig ... 
  if (align > 0) a = "right";                              // ... oder rechtsbündig
  ctx.textAlign = a;                                       // Textausrichtung festlegen
  ctx.fillText(s,x,y);                                     // Ausgabe der Zeichenkette
  }
  
// Hilfsroutine: Geschwindigkeitsvektoren und Zahlenwerte
// nr ..... Nummer des Wagens (1 oder 2)
// vOld ... Geschwindigkeit vor dem Stoß (m/s, mit Vorzeichen)
// vNew ... Geschwindigkeit nach dem Stoß (m/s, mit Vorzeichen)
    
function drawArrows (nr, vOld, vNew) {
  var pixV = 200;                                          // Umrechnungsfaktor (Pixel pro m/s)
  var vvOld = vOld*pixV, vvNew = vNew*pixV;                // Pfeillänge vor und nach dem Stoß (Pixel)
  var x = (nr==1 ? 50 : 350);                              // Position links (Wagen 1) oder rechts (Wagen 2)
  var color = (nr==1 ? color1 : color2);                   // Farbe des Wagens
  var xx = x;                                              // Anfangspunkt des oberen Pfeils (vorläufig)
  if (nr == 1 && vvOld < 0) xx = x-vvOld;                  // Pfeil für Wagen 1 linksbündig machen                  
  if (nr == 2 && vvOld >= 0) xx = x-vvOld;                 // Pfeil für Wagen 2 rechtsbündig machen
  horizontalArrow(xx,85,vvOld,color);                      // Pfeil für Geschwindigkeit vor dem Stoß (oben)
  xx = x;                                                  // Anfangspunkt des unteren Pfeils (vorläufig)
  if (nr == 1 && vvNew < 0) xx = x-vvNew;                  // Pfeil für Wagen 1 linksbündig machen
  if (nr == 2 && vvNew >= 0) xx = x-vvNew;                 // Pfeil für Wagen 2 rechtsbündig machen
  horizontalArrow(xx,height-95,vvNew,color);               // Pfeil für Geschwindigkeit nach dem Stoß 
  var mps = meterPerSecondUnicode;                         // Abkürzung m/s
  var w = (nr==1 ? text13 : text14);                       // Text "Wagen 1" oder "Wagen 2"
  write(w,vOld,mps,x,115,nr==1?-1:1);                      // Wert der Geschwindigkeit vor dem Stoß
  write(w,vNew,mps,x,height-65,nr==1?-1:1);                // Wert der Geschwindigkeit nach dem Stoß
  }
  
// Darstellung der Geschwindigkeit:

function velocity () {
  drawArrows(1,v1Old,v1New);                               // Pfeile für Wagen 1 (vorher/nachher)
  drawArrows(2,v2Old,v2New);                               // Pfeile für Wagen 2 (vorher/nachher)
  ctx.textAlign = "left";                                  // Text linksbündig
  ctx.fillStyle = "#000000";                               // Schriftfarbe schwarz
  ctx.fillText(text15,50,60);                              // Geschwindigkeit vor dem Stoß
  ctx.fillText(text16,50,height-120);                      // Geschwindigkeit nach dem Stoß
  }
  
// Darstellung zur Addition der Impulsvektoren:
// p1, p2 ... Einzelimpulse (kg m/s, mit Vorzeichen)
// y ........ Position (Pixel)

function sumVectors (p1, p2, y) {
  var pixP = 300;                                          // Umrechnungsfaktor (Pixel pro kg m/s)
  var y2 = (p1*p2>0 ? y : y+5);                            // Falls Pfeile gleichgerichtet, Position weiter unten
  var w1 = pixP*p1, w2 = pixP*p2;                          // Pfeillängen für Einzelimpulse (Pixel, mit Vorzeichen) 
  var w = w1+w2;                                           // Pfeillänge für Gesamtimpuls (Pixel, mit Vorzeichen)
  var x = 200-w/2;                                         // Anfangspunkt für ersten Pfeil
  horizontalArrow(x,y,w1,color1);                          // Pfeil für Impulsvektor von Wagen 1
  horizontalArrow(x+w1,y2,w2,color2);                      // Pfeil für Impulsvektor von Wagen 2
  horizontalArrow(x,y+10,w,"#000000");                     // Pfeil für Gesamtimpulsvektor      
  }
  
// Darstellung des Impulses:

function momentum () {
  var p = p1Old+p2Old;                                     // Gesamtimpuls (m kg/s)
  ctx.textAlign = "left";                                  // Text linksbündig
  ctx.fillStyle = "#000000";                               // Schriftfarbe schwarz
  sumVectors(p1Old,p2Old,65);                              // Darstellung Vektoraddition (Impuls vorher)
  sumVectors(p1New,p2New,height-120);                      // Darstellung Vektoraddition (Impuls nachher)   
  ctx.fillText(text17,50,40);                              // Impulse vor dem Stoß
  ctx.fillText(text18,50,height-145);                      // Impulse nach dem Stoß
  var u = kilogramMeterPerSecond;                          // Impulseinheit
  write(text21,p,u,200,130,0);                             // Gesamtimpuls vorher
  write(text21,p,u,200,height-55,0);                       // Gesamtimpuls nachher
  ctx.fillStyle = color1;                                  // Farbe für Wagen 1
  write(text13,p1Old,u,50,105,-1);                         // Impuls von Wagen 1 vor dem Stoß
  write(text13,p1New,u,50,height-80,-1);                   // Impuls von Wagen 1 nach dem Stoß
  ctx.fillStyle = color2;                                  // Farbe für Wagen 2
  write(text14,p2Old,u,350,105,1);                         // Impuls von Wagen 2 vor dem Stoß
  write(text14,p2New,u,350,height-80,1);                   // Impuls von Wagen 2 nach dem Stoß
  }
  
// Hilfsroutine: Balkendiagramm
// y .............. Oberer Rand (Pixel)
// part1, part2 ... Bruchteile (Wagen 1 und Wagen 2)
    
function diagram (y, part1, part2) {
  var len = 300;                                           // Gesamte Länge (Pixel)
  var h = 30;                                              // Höhe (Pixel)
  var x = 50;                                              // Linker Rand (Pixel)
  var w1 = part1*len, w2 = part2*len;                      // Breite für Anteil von Wagen 1 bzw. 2 (Pixel)
  rectangle(x,y,w1,h,color1);                              // Rechteck für Anteil von Wagen 1
  var w2 = part2*len;                                      // Breite für Anteil von Wagen 2 (Pixel)
  rectangle(x+len-w2,y,w2,h,color2);                       // Rechteck für Anteil von Wagen 2
  ctx.strokeRect(x,y,len,h);                               // Rand des gesamten Balkendiagramms
  }

// Darstellung der Energie:

function energy () {
  var eOld = e1Old+e2Old;                                  // Gesamte kinetische Energie vor dem Stoß (J)
  diagram(60,e1Old/eOld,e2Old/eOld);                       // Balkendiagramm für Energie vor dem Stoß
  diagram(height-130,e1New/eOld,e2New/eOld);               // Balkendiagramm für Energie nach dem Stoß
  ctx.textAlign = "left";                                  // Text linksbündig
  ctx.fillStyle = "#000000";                               // Schriftfarbe schwarz 
  ctx.fillText(text19,50,50);                              // Kinetische Energie vor dem Stoß
  ctx.fillText(text20,50,height-140);                      // Kinetische Energie nach dem Stoß 
  ctx.fillStyle = color1;                                  // Farbe für Wagen 1
  write(text13,e1Old,joule,50,105,-1);                     // Kinetische Energie von Wagen 1 vor dem Stoß (J)
  write(text13,e1New,joule,50,height-85,-1);               // Kinetische Energie von Wagen 1 nach dem Stoß (J)  
  ctx.fillStyle = color2;                                  // Farbe für Wagen 2
  write(text14,e2Old,joule,350,105,1);                     // Kinetische Energie von Wagen 2 vor dem Stoß (J)
  write(text14,e2New,joule,350,height-85,1);               // Kinetische Energie von Wagen 2 nach dem Stoß (J) 
  ctx.fillStyle = "#000000";                               // Schriftfarbe schwarz
  write(text22,eOld,joule,200,130,0);                      // Gesamte kinetische Energie vor dem Stoß (J) 
  write(text22,e1New+e2New,joule,200,height-60,0);         // Gesamte kinetische Energie nach dem Stoß (J)
  }
  
// Grafikausgabe:
// Seiteneffekt  
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  if (on) {                                                // Falls Animation läuft ...
    var t1 = new Date();                                   // Aktuelle Zeit
    var dt = (t1-t0)/1000; if (slow) dt /= 10;             // Länge des Zeitintervalls (s)
    t += dt; t0 = t1;                                      // Zeitvariable und Anfangszeitpunkt aktualisieren
    }
  ctx.font = FONT1;                                        // Zeichensatz
  ctx.fillStyle = "#000000";                               // Farbe für Fahrbahn
  ctx.fillRect(0,yM-5,width,10);                           // Fahrbahn
  calculateX();                                            // Berechnung der momentanen Positionen
  wagon(color1,x1,hWagon1);                                // Wagen 1 (links) 
  wagon(color2,x2,hWagon2);                                // Wagen 2 (rechts)
  if (elastic) {                                           // Falls elastischer Stoß ...
    var xL = x1+lWagon/2;                                  // ... Rechter Rand von Wagen 1 (Pixel)
    if (t < tBeg || t > tEnd) spring(xL,xL+lSpring);       // ... Vor und nach dem Stoß Feder mit normaler Länge zeichnen 
    else spring(xL,x2-lWagon/2);                           // ... Während des Stoßvorgangs verkürzte Feder zeichnen
    }
  else {                                                   // Falls unelastischer Stoß ...
    var dt = tEnd-tBeg;                                    // ... Dauer des Ankopplungsvorgangs (s)                                    
    var hor = (t < tBeg || t > tEnd-0.2*dt);               // ... Flag für horizontale Lage
    var alpha = (hor ? 0 : (t-tBeg)*0.25/dt);              // ... Drehwinkel (Bogenmaß)
    coupling(alpha);                                       // ... Kupplung zeichnen
    }
  var xS = (distance/2+vS*(t-tMid))*pix;                   // x-Koordinate des Schwerpunkts (Pixel) 
  if (t > 0) circle(xS,yM,2,colorBackground);              // Markierung für Schwerpunkt   
  if (rbV.checked) velocity();                             // Informationen zur Geschwindigkeit
  else if (rbP.checked) momentum();                        // Informationen zum Impuls
  else if (rbE.checked) energy();                          // Informationen zur Energie
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen



