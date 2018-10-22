// Elektromagnetischer Schwingkreis
// Java-Applet (23.10.1999) umgewandelt
// 14.07.2015 - 02.10.2016

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel oscillationcircuit_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Farbe für Hintergrund
var colorClock1 = "#808080";                               // Farbe für Digitaluhr (Gehäuse)
var colorClock2 = "#000000";                               // Farbe für Digitaluhr (Anzeige)
var colorClock3 = "#ff0000";                               // Farbe für Digitaluhr (Ziffern)
var colorPlus = "#ff0000";                                 // Farbe für Pluspol
var colorMinus = "#0000ff";                                // Farbe für Minuspol
var colorCoilBG = "#808080";                               // Farbe für hinteren Teil der Spule
var colorCoilFG = "#000000";                               // Farbe für vorderen Teil der Spule
var colorE = "#ff0000";                                    // Farbe für elektrisches Feld
var colorB = "#0000ff";                                    // Farbe für magnetisches Feld
var colorVoltage = "#0000ff";                              // Farbe für Spannung
var colorAmperage = "#ff0000";                             // Farbe für Stromstärke

// Weitere Konstanten:

var PIH = Math.PI/2;                                       // 90°-Winkel (Bogenmaß)
var PI2 = 2*Math.PI;                                       // 360°-Winkel (Bogenmaß)
var tSwitch = 0.2;                                         // Zeit für Schaltvorgang (s)
var pixSec = 200;                                          // Pixel pro s
var minCapMy = 100;                                        // Minimale Kapazität (Mikrofarad)
var maxCapMy = 1000;                                       // Maximale Kapazität (Mikrofarad)
var minInd = 1;                                            // Minimale Induktivität (Henry)
var maxInd = 10;                                           // Maximale Induktivität (Henry)
var maxRes = 1000;                                         // Maximaler Widerstand (Ohm)
var FONT1 = "normal normal bold 12px sans-serif";          // Normaler Zeichensatz
var FONT2 = "normal normal bold 16px monospace";           // Zeichensatz für Digitaluhr

// Attribute:

var bu1, bu2;                                              // Schaltknöpfe
var rb1, rblb, rb2, rb2lb;                                 // Obere Radiobuttons (Zeitlupe)
var ip1a, ip1b, ip1c;                                      // Erste Eingabezeile (Kapazität)
var ip2a, ip2b, ip2c;                                      // Zweite Eingabezeile (Induktivität)
var ip3a, ip3b, ip3c;                                      // Dritte Eingabezeile (Widerstand)
var ip4a, ip4b, ip4c;                                      // Vierte Eingabezeile (Maximalspannung)
var rb3, rb3lb, rb4, rb4lb;                                // Untere Radiobuttons (Diagramme)
var canvas;                                                // Zeichenfläche
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var ctx;                                                   // Grafikkontext

var timer;                                                 // Timer für Animation
var t0;                                                    // Bezugszeitpunkt
var t;                                                     // Zeitvariable (s)
var tD;                                                    // Startzeit für Diagramm (s)
var slow;                                                  // Faktor für Zeitlupe

var voltage, voltage0;                                     // Spannung mit Scheitelwert (V)
var amperage, amperage0;                                   // Stromstärke mit Scheitelwert (A)
var cap;                                                   // Kapazität (F)
var ind;                                                   // Induktivität (H)
var res;                                                   // Widerstand (Ohm)
var alpha;                                                 // Dämpfung (1/s)
var omega;                                                 // Kreisfrequenz (1/s)
var omega2;                                                // Quadrat von omega
var T;                                                     // Schwingungsdauer (s)
var phi;                                                   // Phase (Bogenmaß)
var cos, sin, u0exp, c1, c2;                               // Hilfsgrößen für schwache Dämpfung
var beta1, beta2, d1, d2, d3, d4;                          // Hilfsgrößen für starke Dämpfung

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
  bu1 = getElement("bu1",text01);                          // Schaltknopf (Reset)
  bu2 = getElement("bu2",text02[0]);                       // Schaltknopf (Start/Pause/Weiter)
  bu2.state = 0;                                           // Zustand vor Start
  rb1 = getElement("rb1");                                 // Radiobutton (Zeitlupe 10 x)
  rb1.checked = true;                                      // Radiobutton ausgewählt
  rb1lb = getElement("rb1lb",text03);                      // Zugehöriger Text
  rb2 = getElement("rb2");                                 // Radiobutton (Zeitlupe 100 x)
  rb2lb = getElement("rb2lb",text04);                      // Zugehöriger Text
  ip1a = getElement("ip1a",text05);                        // Erklärender Text (Kapazität)
  ip1b = getElement("ip1b");                               // Eingabefeld für Kapazität
  ip1c = getElement("ip1c",microfarad);                    // Einheit (Mikrofarad)
  ip2a = getElement("ip2a",text06);                        // Erklärender Text (Induktivität)
  ip2b = getElement("ip2b");                               // Eingabefeld für Induktivität
  ip2c = getElement("ip2c",henry);                         // Einheit (Henry)
  ip3a = getElement("ip3a",text07);                        // Erklärender Text (Widerstand)
  ip3b = getElement("ip3b");                               // Eingabefeld für Widerstand
  ip3c = getElement("ip3c",ohm);                           // Einheit (Ohm)
  ip4a = getElement("ip4a",text08);                        // Erklärender Text (Maximalspannung)
  ip4b = getElement("ip4b");                               // Eingabefeld für Maximalspannung
  ip4c = getElement("ip4c",volt);                          // Einheit (Volt)
  rb3 = getElement("rb3","");                              // Radiobutton (Spannung/Stromstärke)
  rb3.checked = true;                                      // Radiobutton ausgewählt
  rb3lb = getElement("rb3lb",text09);                      // Zugehöriger Text
  rb4 = getElement("rb4","");                              // Radiobutton (Energie)
  rb4lb = getElement("rb4lb",text10);                      // Zugehöriger Text
  getElement("author",author);                             // Autor, Koautoren
  canvas = document.getElementById("cv");                  // Zeichenfläche
  width = canvas.width; height = canvas.height;            // Abmessungen (Pixel)
  ctx = canvas.getContext("2d");                           // Grafikkontext
  cap = 500/1e6;                                           // Startwert für Kapazität
  ind = 5;                                                 // Startwert für Induktivität
  res = 0;                                                 // Startwert für Widerstand
  voltage0 = 10;                                           // Startwert für Maximalspannung
  updateInput();                                           // Eingabefelder aktualisieren
  t = 0;                                                   // Zeitvariable (s)
  on = false;                                              // Flag für Bewegung
  slow = 10;                                               // Faktor für Zeitlupe (10 oder 100)
  calculation1();                                          // Zeitunabhängige Berechnungen
  paint();                                                 // Zeichnen
  bu1.onclick = reactionReset;                             // Reaktion auf Resetknopf
  bu2.onclick = reactionStart;                             // Reaktion auf Schaltknopf Start/Pause/Weiter
  rb1.onclick = reactionRadio;                             // Reaktion auf Radiobuttons
  rb2.onclick = reactionRadio;                             // Reaktion auf Radiobuttons
  ip1b.onkeydown = reactionEnter;                          // Reaktion auf Enter-Taste (Eingabe Kapazität)
  ip2b.onkeydown = reactionEnter;                          // Reaktion auf Enter-Taste (Eingabe Induktivität)
  ip3b.onkeydown = reactionEnter;                          // Reaktion auf Enter-Taste (Eingabe Widerstand)
  ip4b.onkeydown = reactionEnter;                          // Reaktion auf Enter-Taste (Eingabe Maximalspannung)
  rb3.onclick = reactionRadio;                             // Reaktion auf Radiobuttons
  rb4.onclick = reactionRadio;                             // Reaktion auf Radiobuttons
  }
  
// Zustandsfestlegung für Schaltknopf Start/Pause/Weiter:
// st ... Gewünschter Zustand (0, 1 oder 2)
// Seiteneffekt bu2
  
function setButton2State (st) {
  bu2.state = st;                                          // Zustand speichern
  bu2.innerHTML = text02[st];                              // Text aktualisieren
  }
  
// Umschalten des Schaltknopfs Start/Pause/Weiter:
// Seiteneffekt bu2, on, timer, t0
  
function switchButton2 () {
  var st = bu2.state;                                      // Momentaner Zustand
  if (st == 0) st = 1;                                     // Falls Ausgangszustand, starten
  else st = 3-st;                                          // Wechsel zwischen Animation und Unterbrechung
  setButton2State(st);                                     // Neuen Zustand speichern, Text ändern
  if (st == 1) startAnimation();                           // Falls Zustand 1, Animation starten ...
  else stopAnimation();                                    // Sonst Animation unterbrechen
  }
  
// Aktivierung beziehungsweise Deaktivierung der Eingabefelder:
// p ... Flag für mögliche Eingabe

function enableInput (p) {
  ip1b.readOnly = !p;                                      // Eingabefeld für Kapazität
  ip2b.readOnly = !p;                                      // Eingabefeld für Induktivität
  ip3b.readOnly = !p;                                      // Eingabefeld für Widerstand
  ip4b.readOnly = !p;                                      // Eingabefeld für Maximalspannung
  }
  
// Reaktion auf Resetknopf:
// Seiteneffekt bu2, on, t, t0, tD, cap, ind, res, voltage, voltage0, amperage, amperage0, ip1b, ip2b, ip3b, ip4b, 
// alpha, omega2, omega, c1, c2, beta1, beta2, d1, d2, d3, d4, T, u0exp, sin, cos
   
function reactionReset () {
  setButton2State(0);                                      // Zustand des Schaltknopfs Start/Pause/Weiter
  enableInput(true);                                       // Eingabefelder aktivieren
  stopAnimation();                                         // Animation beenden
  t = 0;                                                   // Zeitvariable zurücksetzen
  reaction(true);                                          // Eingegebene Werte übernehmen, Berechnungen durchführen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf den Schaltknopf Start/Pause/Weiter:
// Seiteneffekt t0, bu2, cap, ind, res, voltage0, ip1b, ip2b, ip3b, ip4b, alpha, omega2, omega, c1, c2, beta1, beta2, 
// d1, d2, d3, d4, T, u0exp, sin, cos, amperage0

function reactionStart () {
  if (bu2.state != 1) t0 = new Date();                     // Falls Animation angeschaltet, neuer Bezugszeitpunkt
  switchButton2();                                         // Zustand des Schaltknopfs ändern
  enableInput(false);                                      // Eingabefelder deaktivieren
  reaction(true);                                          // Eingegebene Werte übernehmen, Berechnungen durchführen
  }
  
// Reaktion auf Radiobuttons:
  
function reactionRadio () {
  slow = (rb1.checked ? 10 : 100);                         // Faktor für Zeitlupe
  if (!on) paint();                                        // Falls Animation abgeschaltet, neu zeichnen
  }
  
// Hilfsroutine: Eingabe übernehmen oder Eingabefelder anpassen, Berechnungen durchführen und Ausgabe aktualisieren
// ip ... Flag für Übernahme der Daten aus den Eingabefeldern
// Seiteneffekt cap, ind, res, voltage0, ip1b, ip2b, ip3b, ip4b, alpha, omega2, omega, c1, c2, beta1, beta2, 
// d1, d2, d3, d4, T, u0exp, sin, cos, amperage0

function reaction (ip) {
  if (ip) input();                                         // Eingegebene Werte übernehmen (eventuell korrigiert) ...
  else updateInput();                                      // ... oder Eingabefelder anpassen
  calculation1();                                          // Zeitunabhängige Berechnungen
  }
  
// Reaktion auf Tastendruck (nur auf Enter-Taste):
// Seiteneffekt cap, ind, res, voltage0, ip1b, ip2b, ip3b, ip4b, alpha, omega2, omega, c1, c2, beta1, beta2, 
// d1, d2, d3, d4, T, u0exp, sin, cos, amperage0
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction(true);                                        // Daten übernehmen, Berechnungen durchführen                       
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
// Seiteneffekt cap, ind, res, voltage0

function input () {
  cap = inputNumber(ip1b,0,true,minCapMy,maxCapMy)/1e6;    // Kapazität (F)
  ind = inputNumber(ip2b,2,true,minInd,maxInd);            // Induktivität (H)
  res = inputNumber(ip3b,1,true,0,maxRes);                 // Widerstand (Ohm)
  voltage0 = inputNumber(ip4b,1,true,5,20);                // Maximalspannung (V)
  } 
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ip1b.value = ToString(cap*1e6,0,true);                   // Kapazität (Mikrofarad)
  ip2b.value = ToString(ind,2,true);                       // Induktivität (H)
  ip3b.value = ToString(res,1,true);                       // Widerstand (Ohm)
  ip4b.value = ToString(voltage0,1,true);                  // Maximalspannung (V)
  }
  
// Zeitunabhängige Berechnungen:
// Seiteneffekt alpha, omega2, omega, c1, c2, beta1, beta2, d1, d2, d3, d4, T, u0exp, sin, cos, amperage0

function calculation1 () {
  alpha = res/(2*ind);                                     // Hilfsgröße für Dämpfung
  var res10 = Math.round(res*10);                          // Wegen Rundungsfehlern
  var a = 4e8*ind-res10*res10*cap*1e6;                     // Hilfsgröße zur Berechnung der Kreisfrequenz omega
  var b = 400*ind*ind*cap*1e6;                             // Hilfsgröße zur Berechnung der Kreisfrequenz omega
  omega2 = a/b;                                            // Quadrat der Kreisfrequenz
  omega = Math.sqrt(Math.abs(omega2));                     // Kreisfrequenz (1/s)
  if (omega2 > 0) {                                        // Falls ungedämpfte oder gedämpfte Schwingung ...
    c1 = alpha/omega;                                      // Hilfsgröße zur Berechnung der momentanen Spannung
    c2 = alpha*alpha/omega+omega;                          // Hilfsgröße zur Berechnung der momentanen Stromstärke
    }
  else if (omega2 < 0) {                                   // Falls Kriechfall ...
    beta1 = alpha-omega; beta2 = alpha+omega;              // Hilfsgrößen für Dämpfung
    d1 = beta2*voltage0/(beta2-beta1);                     // Hilfsgröße zur Berechnung der momentanen Spannung
    d2 = beta1*voltage0/(beta1-beta2);                     // Hilfsgröße zur Berechnung der momentanen Spannung
    d3 = cap*beta1*d1;                                     // Hilfsgröße zur Berechnung der momentanen Stromstärke
    d4 = cap*beta2*d2;                                     // Hilfsgröße zur Berechnung der momentanen Stromstärke
    }
  if (omega2 != 0) T = PI2/omega;                          // Schwingungsdauer (s) bzw. Entsprechung für Kriechfall
  else T = 4/alpha;                                        // Entsprechung für aperiodischen Grenzfall
  calculation2(T/4);                                       // Berechnung von Hilfsgrößen 
  amperage0 = calcAmperage(T/4);                           // Maximale Stromstärke (A), muss noch korrigiert werden
  var c = T/8;                                             // Hilfsgröße (Zeit) für Korrektur
  for (var i=0; i<10; i++) {                               // Wiederhole 10 mal ...
    calculation2(c);                                       // Berechnung von Hilfsgrößen
    amperage0 = Math.max(amperage0,calcAmperage(c));       // Maximale Stromstärke korrigieren, falls nötig
    c /= 2;                                                // Hilfsgröße (Zeit) halbieren
    }
  if (!on) paint();                                        // Falls Animation gestoppt, neu zeichnen
  }

// Zeitabhängige Berechnungen:
// t ... Zeit ab Schließung des Schalters (s)
// Seiteneffekt u0exp, sin, cos

function calculation2 (t) {
  if (omega2 <= 0) return;                                 // Abbrechen, falls Berechnung unnötig
  u0exp = voltage0*Math.exp(-alpha*t);                     // Maximalspannung unter Berücksichtigung der Dämpfung
  sin = Math.sin(omega*t);                                 // Sinuswert
  cos = Math.cos(omega*t);                                 // Cosinuswert
  }

// Momentane Spannung (nach Aufruf von calculation2!):
// t ... Zeit ab Schließung des Schalters (s)
// Rückgabewert: Spannung (V)

function calcVoltage (t) {
  if (omega2 > 0)                                          // Falls ungedämpfte oder gedämpfte Schwingung ...
    return u0exp*(cos+c1*sin);                             // Rückgabewert
  else if (omega2 < 0)                                     // Falls Kriechfall ...
    return d1*Math.exp(-beta1*t)+d2*Math.exp(-beta2*t);    // Rückgabewert
  else                                                     // Falls aperiodischer Grenzfall ...
    return voltage0*(1+alpha*t)*Math.exp(-alpha*t);        // Rückgabewert
  }

// Momentane Stromstärke (nach Aufruf von calculation2!):
// t ... Zeit ab Schließung des Schalters (s)
// Rückgabewert: Stromstärke (A)

function calcAmperage (t) {
  if (omega2 > 0)                                          // Falls ungedämpfte oder gedämpfte Schwingung ...
    return cap*u0exp*c2*sin;                               // Rückgabewert
  else if (omega2 < 0)                                     // Falls Kriechfall ...
    return d3*Math.exp(-beta1*t)+d4*Math.exp(-beta2*t);    // Rückgabewert
  else                                                     // Falls aperiodischer Grenzfall ...
    return cap*alpha*alpha*voltage0*t*Math.exp(-alpha*t);  // Rückgabewert
  }
  
//-------------------------------------------------------------------------------------------------

// Neuer Pfad mit Standardwerten:

function newPath () {
  ctx.beginPath();                                         // Neuer Pfad
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

// Ausgefülltes Rechteck:
// (x,y) ... Koordinaten der Ecke links oben (Pixel)
// w ....... Breite (Pixel)
// h ....... Höhe (Pixel)
// c ....... Füllfarbe (optional)
// d ....... Liniendicke (optional)

function rectangle (x, y, w, h, c, d) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte) 
  if (c) ctx.fillStyle = c;                                // Füllfarbe, falls definiert
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausfüllen
  if (!d) return;                                          // Abbrechen, falls Liniendicke nicht definiert
  ctx.lineWidth = d;                                       // Liniendicke
  ctx.strokeRect(x,y,w,h);                                 // Rand zeichnen
  }
  
// Kreisscheibe mit schwarzem Rand:
// (x,y) ... Mittelpunktskoordinaten (Pixel)
// r ....... Radius (Pixel)
// c ....... Füllfarbe (optional)
// w ....... Liniendicke (optional)

function circle (x, y, r, c, w) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  if (c) ctx.fillStyle = c;                                // Füllfarbe, falls definiert  
  ctx.arc(x,y,r,0,PI2,true);                               // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausfüllen
  if (!w) return;                                          // Abbrechen, falls Liniendicke nicht definiert
  ctx.lineWidth = w;                                       // Liniendicke
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
  if (length < 5) ctx.lineTo(x2,y2);                       // Falls kurzer Pfeil, weiter zum Endpunkt
  else ctx.lineTo(xSp,ySp);                                // Sonst weiter zur einspringenden Ecke
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
  
// Schalter:
// (x,y) ... Position der Drehachse (Pixel)

function switch0 (x, y) {
  circle(x,y,3,colorBackground,2);                         // Drehachse
  circle(x-20,y-40,3,colorBackground,2);                   // Linker Anschluss
  circle(x+20,y-40,3,colorBackground,2);                   // Rechter Anschluss
  var w = 0.35;                                            // Winkel für Endposition (Bogenmaß)
  if (t < tSwitch)                                         // Falls Schalter in Zwischenposition ...
    w = (t-tSwitch/2)*0.7/tSwitch;                         // Winkel für Zwischenposition (Bogenmaß)
  var cos = Math.cos(w), sin = Math.sin(w);                // Trigonometrische Werte
  line(x+4*sin,y-4*cos,x+50*sin,y-50*cos,"#000000",3);     // Beweglicher Teil des Schalters
  }
  
// Pfeil für Feldlinie zum Grafikpfad hinzufügen (nach oben oder unten):
// (x,y) ... Position des Mittelpunkts (Pixel)
// down .... Flag für Pfeil nach unten

function arrowField (x, y, down) {
  var h = (down ? -4 : 4);                                 // Halbe Pfeillänge mit Vorzeichen (Pixel)
  ctx.moveTo(x-2,y+h);                                     // Anfangspunkt (links)
  ctx.lineTo(x,y-h);                                       // Weiter zur Pfeilspitze
  ctx.lineTo(x+2,y+h);                                     // Weiter zum Endpunkt (rechts)
  }
  
// Elektrisches Feldlinienpaar (symmetrisch):
// (x,y) ... Position des Mittelpunkts (Pixel)
// d ....... Abstand zum Mittelpunkt (Pixel)
// Die Feldlinien werden nur für d < 35 gezeichnet.

function fieldLineE (x, y, d) {
  if (voltage == 0) return;                                // Abbrechen, falls Spannung gleich 0
  var positive = (voltage>0);                              // Flag für positive Spannung
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.lineWidth = 1;                                       // Liniendicke  
  if (d <= 30) {                                           // Falls Feldlinie nicht am Rand des Kondensators ...
    var xL = x-d, xR = x+d;                                // x-Koordinaten für linke und rechte Feldlinie                                
    ctx.moveTo(xL,y-10); ctx.lineTo(xL,y+10);              // Linke Feldlinie vorbereiten
    ctx.moveTo(xR,y-10); ctx.lineTo(xR,y+10);              // Rechte Feldlinie vorbereiten   
    arrowField(xL,y,positive);                             // Pfeil für linke Feldlinie vorbereiten
    arrowField(xR,y,positive);                             // Pfeil für rechte Feldlinie vorbereiten
    }
  else if (d < 35) {                                       // Falls Feldlinie am Rand des Kondensators ...
    var h = d-30, a = h*h, b = 10+d/10;                    // Hilfsgrößen
    ctx.moveTo(x-30,y+b);                                  // Anfangspunkt für gebogene Feldlinie links
    ctx.quadraticCurveTo(x-30-a,y+b,x-30-a,y);             // Bogen links unten
    ctx.quadraticCurveTo(x-30-a,y-b,x-30,y-b);             // Bogen links oben
    ctx.moveTo(x+30,y+b);                                  // Anfangspunkt für gebogene Feldlinie rechts
    ctx.quadraticCurveTo(x+30+a,y+b,x+30+a,y);             // Bogen rechts unten
    ctx.quadraticCurveTo(x+30+a,y-b,x+30,y-b);             // Bogen rechts oben
    arrowField(x-30-a,y,positive);                         // Pfeil für linke Feldlinie vorbereiten
    arrowField(x+30+a,y,positive);                         // Pfeil für rechte Feldlinie vorbereiten      
    }
  ctx.stroke();                                            // Feldlinien und Pfeile zeichnen
  }

// Kondensator, elektrische Feldlinien, Ladungsvorzeichen:
// (x,y) ... Position des Mittelpunkts (Pixel)

function condensator (x, y) {
  var h = (voltage>0 ? -25 : +25);                         // Hilfsgröße für Positionen der Ladungsvorzeichen
  var q = Math.abs(voltage/voltage0);                      // Bruchteil der Maximalspannung
  ctx.strokeStyle = colorE;                                // Farbe für elektrisches Feld
  if (q > 0.05) {                                          // Falls Spannung nicht sehr klein ...
    for (var i=0; i<=10; i++) {                            // Für alle Indizes ...
      var d = i*6/Math.sqrt(q);                            // Abstand von der Symmetrieebene (Pixel)
      fieldLineE(x,y,d);                                   // Feldlinien zeichnen (außer bei großem Abstand zur Symmetrieebene)
      }
    }
  rectangle(x-30,y-15,61,5,"#000000");                     // Obere Platte
  rectangle(x-30,y+10,61,5,"#000000");                     // Untere Platte
  rectangle(x-25,y+h-1,11,3,colorPlus);                    // Pluszeichen, waagrechte Linie
  rectangle(x-21,y+h-5,3,11,colorPlus);                    // Pluszeichen, senkrechte Linie
  rectangle(x-25,y-h-1,11,3,colorMinus);                   // Minuszeichen
  }
  
// Magnetisches Feldlinienpaar (symmetrisch):
// (x,y) ... Position des Mittelpunkts (Pixel)
// d ....... Abstand zum Mittelpunkt (Pixel)

function fieldLineB (x, y, d) {
  if (amperage == 0) return;                               // Abbrechen, falls Stromstärke gleich 0
  var positive = (amperage > 0);                           // Flag für positive Stromstärke
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.lineWidth = 1;                                       // Liniendicke  
  if (d == 0) {                                            // Falls mittlere Feldlinie (Spulenachse) ...
    ctx.moveTo(x,y-120); ctx.lineTo(x,y+120);              // Linie vorbereiten
    arrowField(x,y-110,!positive);                         // Oberer Pfeil
    arrowField(x,y+110,!positive);                         // Unterer Pfeil
    } 
  else if (d <= 15) {                                      // Andernfalls ...
    var xL = x-d, xR = x+d;                                // x-Koordinaten für linke und rechte Feldlinie
    var y1 = y-60, y2 = y+60;                              // y-Koordinaten für Endpunkte der geraden Abschnitte
    ctx.moveTo(xL,y1); ctx.lineTo(xL,y2);                  // Gerader Abschnitt der linken Feldlinie
    ctx.moveTo(xR,y1); ctx.lineTo(xR,y2);                  // Gerader Abschnitt der rechten Feldlinie
    arrowField(xL,y,!positive);                            // Pfeil für linke Feldlinie
    arrowField(xR,y,!positive);                            // Pfeil für rechte Feldlinie
    var r = 100/d;                                         // Radius für Viertelkreise (Pixel)
    var a = 2000/(d*d);                                    // Waagrechte Halbachse für Viertelellipsen (Pixel)
    var b = 60+r;                                          // Senkrechte Halbachse für Viertelellipsen (Pixel)
    var closed = (a <= 50);                                // Flag für geschlossen gezeichnete Feldlinie
    ctx.moveTo(xL,y1);                                     // Anfangspunkt für linke Feldlinie
    ctx.quadraticCurveTo(xL,y1-r,xL-r,y1-r);               // Viertelkreis im Gegenuhrzeigersinn
    if (closed) {                                          // Falls Feldlinie geschlossen ...
      ctx.quadraticCurveTo(xL-r-a,y1-r,xL-r-a,y);          // Viertelellipse im Gegenuhrzeigersinn
      ctx.quadraticCurveTo(xL-r-a,y2+r,xL-r,y2+r);         // Weitere Viertelellipse im Gegenuhrzeigersinn
      }
    else ctx.moveTo(xL-r,y2+r);                            // Falls Feldlinie nicht geschlossen, neuer Anfangspunkt
    ctx.quadraticCurveTo(xL,y2+r,xL,y2);                   // Viertelkreis im Gegenuhrzeigersinn
    if (closed) arrowField(xL-r-a,y,positive);             // Pfeil für äußeren Teil der linken Feldlinie
    ctx.moveTo(xR,y1);                                     // Anfangspunkt für rechte Feldlinie
    ctx.quadraticCurveTo(xR,y1-r,xR+r,y1-r);               // Viertelkreis im Uhrzeigersinn
    if (closed) {                                          // Falls Feldlinie geschlossen ... 
      ctx.quadraticCurveTo(xR+r+a,y1-r,xR+r+a,y);          // Viertelellipse im Uhrzeigersinn
      ctx.quadraticCurveTo(xR+r+a,y2+r,xR+r,y2+r);         // Weitere Viertelellipse im Gegenuhrzeigersinn
      }
    else ctx.moveTo(xR+r,y2+r);                            // Falls Feldlinie nicht geschlossen, neuer Anfangspunkt
    ctx.quadraticCurveTo(xR,y2+r,xR,y2);                   // Viertelkreis im Uhrzeigersinn
    if (closed) arrowField(xR+r+a,y,positive);             // Pfeil für äußeren Teil der rechten Feldlinie
    }
  ctx.stroke();                                            // Feldlinien und Pfeile zeichnen
  }   
  
// Spule (hinterer Teil, magnetische Feldlinien, vorderer Teil):
// (x,y) ... Position des Mittelpunkts (Pixel)

function coil (x, y) {
  ctx.beginPath();                                         // Neuer Grafikpfad
  ctx.strokeStyle = colorCoilBG;                           // Farbe für hinteren Teil der Spule
  ctx.lineWidth = 3;                                       // Liniendicke
  var h = Math.PI/12;                                      // Schrittweite (Winkel im Bogenmaß)
  ctx.moveTo(x+20,y-54);                                   // Anfangspunkt (oben)
  for (var i=7; i<=120; i++) {                             // Für alle Indizes ...
    if (i%24 == 19) {                                      // Falls Punkt im vorderen Teil der Spule ...
      i+=11;                                               // Index erhöhen
      ctx.moveTo(x+20*Math.sin(i*h),y-60+i);               // Neuer Anfangspunkt
      }
    else ctx.lineTo(x+20*Math.sin(i*h),y-60+i);            // Falls Punkt im hinteren Teil der Spule, Linie vorbereiten
    }
  ctx.stroke();                                            // Hinteren Teil der Spule zeichnen
  var q = Math.abs(amperage/amperage0);                    // Bruchteil der maximalen Stromstärke
  ctx.strokeStyle = colorB;                                // Farbe für magnetisches Feld 
  if (q > 0.05) {                                          // Falls Stromstärke nicht sehr klein ...
    h = 4/Math.sqrt(q);                                    // Schrittweite (Pixel)
    for (var i=0; i<=10; i++)                              // Für alle Indizes ... 
      fieldLineB(x,y,i*h);                                 // Feldlinien zeichnen (außer bei großem Abstand zur Spulenachse) 
    }
  h = Math.PI/12;                                          // Schrittweite (Winkel im Bogenmaß)
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.strokeStyle = colorCoilFG;                           // Farbe für vorderen Teil der Spule
  ctx.lineWidth = 3;                                       // Liniendicke
  ctx.moveTo(x,y-60);                                      // Anfangspunkt (oben)
  for (var i=1; i<=120; i++) {                             // Für alle Indizes ...
    if (i%24 == 7) {                                       // Falls Punkt im hinteren Teil der Spule ...
      i+=11;                                               // Index erhöhen
      ctx.moveTo(x+20*Math.sin(i*h),y-60+i);               // Neuer Anfangspunkt
      }
    else ctx.lineTo(x+20*Math.sin(i*h),y-60+i);            // Falls Punkt im vorderen Teil der Spule, Linie vorbereiten
    }
  ctx.stroke();                                            // Vorderen Teil der Spule zeichnen
  }
 
// Anschlussdrähte:
    
function wires () {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.lineWidth = 2;                                       // Liniendicke
  ctx.moveTo(60,120);                                      // Anfangspunkt (oberhalb der Spannungsquelle)
  ctx.lineTo(60,40);                                       // Nach oben
  ctx.lineTo(176,40);                                      // Nach rechts zur linken Schalterposition
  ctx.moveTo(200,84);                                      // Neuer Anfangspunkt (Drehachse des Schalters)
  ctx.lineTo(200,115);                                     // Nach unten zum Kondensator
  ctx.moveTo(200,145);                                     // Neuer Anfangspunkt (untere Kondensatorplatte)
  ctx.lineTo(200,220);                                     // Nach unten
  ctx.moveTo(224,40);                                      // Neuer Anfangspunkt (rechte Schalterposition)
  ctx.lineTo(340,40);                                      // Nach rechts
  ctx.lineTo(340,70);                                      // Nach unten zum oberen Spulenende
  ctx.moveTo(340,190);                                     // Neuer Anfangspunkt (unteres Spulenende)
  ctx.lineTo(340,220);                                     // Nach unten
  ctx.lineTo(60,220);                                      // Nach links
  ctx.lineTo(60,138);                                      // Nach oben zur Spannungsquelle
  ctx.stroke();                                            // Linien zeichnen
  circle(200,220,3,"#000000");                             // Knoten
  }
  
// Digitaluhr:
// (x,y) ... Position des Mittelpunkts (Pixel)

function clock (x, y) {
  rectangle(x-60,y-15,120,30,colorClock1,1);               // Gehäuse
  rectangle(x-50,y-10,100,20,colorClock2,1);               // Anzeige
  ctx.fillStyle = colorClock3;                             // Farbe für Ziffern
  var tt = Math.max(t-tSwitch,0);                          // Zeit seit Schließen des Schalters (s)
  var n = Math.floor(tt/100);                              // Zahl von Abschnitten der Länge 100 s 
  tt -= 100*n;                                             // Zeit um Vielfaches von 100 s reduzieren
  var s = (tt<10 ? "0" : "") + ToString(tt,3,true)+ " "+second; // Zeichenkette für Zeitangabe
  alignText(s,1,x,y+5,FONT2);                              // Zeichenkette ausgeben
  }
  
// Text ausrichten:
// s ....... Zeichenkette
// t ....... Typ (0 für linksbündig, 1 für zentriert, 2 für rechtsbündig)
// (x,y) ... Position (Pixel)
// f ....... Zeichensatz (optional, Defaultwert FONT1)

function alignText (s, t, x, y, f) {
  ctx.font = (f ? f : FONT1);                              // Zeichensatz
  if (t == 0) ctx.textAlign = "left";                      // Je nach Wert von t linksbündig ...
  else if (t == 1) ctx.textAlign = "center";               // ... oder zentriert ...
  else ctx.textAlign = "right";                            // ... oder rechtsbündig
  ctx.fillText(s,x,y);                                     // Text ausgeben
  }
  
// Achsen für Diagramm:
// x,y ... Ursprung (Pixel)

function axes (x, y) {
  newPath();
  arrow(x-20,y,x+250,y);                                   // Waagrechte Achse 
  arrow(x,y+80,x,y-80);                                    // Senkrechte Achse
  ctx.fillStyle = "#000000";                               // Farbe für Zeit
  alignText(symbolTime,1,x+245,y+15);                      // Beschriftung für waagrechte Achse (Zeit)
  ctx.fillStyle = colorVoltage;                            // Farbe für Spannung 
  alignText(symbolVoltage,2,x-8,y-70);                     // Beschriftung für senkrechte Achse (Spannung) 
  ctx.fillStyle = colorAmperage;                           // Farbe für Stromstärke
  alignText(symbolAmperage,0,x+8,y-70);                    // Beschriftung für senkrechte Achse (Stromstärke)
  }

// Aktuelle Werte in Diagramm:
// (x,y) ... Position des Ursprungs (Pixel)
// Seiteneffekt tD

function values (x, y) {
  if (t < tSwitch) tD = t;                                 // Vor dem Einschaltvorgang 
  else if (t < tSwitch+120/pixSec) tD = tSwitch;           // Während des Einschaltvorgangs
  else tD = t-120/pixSec;                                  // Nach Schließen des Schalters
  var x0 = x+pixSec*(t-tD);                                // Waagrechte Koordinate für aktuelle Zeit (Pixel)
  var y0 = y-3*voltage;                                    // Senkrechte Koordinate für Spannung (Pixel)
  circle(x0,y0,2.5,colorVoltage);                          // Kreis für momentane Spannung
  y0 = y-40*amperage/amperage0;                            // Senkrechte Koordinate für momentane Stromstärke (Pixel)
  circle(x0,y0,2.5,colorAmperage);                         // Kreis für momentane Stromstärke
  ctx.fillStyle = colorVoltage;                            // Farbe für Spannung
  var s = symbolVoltage + " = ";                           // Anfang der Zeichenkette für Spannung
  s += ToString(voltage,2,true)+" "+voltUnicode;           // Zeichenkette für Spannung vervollständigen
  alignText(s,0,x+40,y-50);                                // Zeichenkette für Spannung ausgeben
  ctx.fillStyle = colorAmperage;                           // Farbe für Stromstärke
  s = symbolAmperage + " = ";                              // Anfang der Zeichenkette für Stromstärke
  s += ToString(amperage,3,true)+" "+ampere;               // Zeichenkette für Stromstärke vervollständigen
  alignText(s,0,x+150,y-50);                               // Zeichenkette für Stromstärke ausgeben
  }
  
// Diagramm für Spannung:
// (x,y) ... Position des Ursprungs (Pixel)
// Seiteneffekt u0exp, sin, cos

function diagramU (x, y) {
  var t0 = Math.max(tD-tSwitch,0);                         // Zeit für Diagramm-Ursprung (s)
  calculation2(t0);                                        // Zeitabhängige Berechnungen (u0exp, sin, cos)
  var u = calcVoltage(t0);                                 // Spannung für linken Rand (V)
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.strokeStyle = colorVoltage;                          // Farbe für Spannung
  ctx.moveTo(x,y-3*u);                                     // Anfangspunkt auf der senkrechten Achse
  var xx = x;                                              // x-Koordinate übernehmen
  while (xx < x+240) {                                     // Solange rechter Rand noch nicht erreicht ...
    xx++;                                                  // x-Koordinate um 1 erhöhen
    var tt = t0+(xx-x)/pixSec;                             // Zeit (s)
    calculation2(tt);                                      // Zeitabhängige Berechnungen (u0exp, sin, cos) 
    u = calcVoltage(tt);                                   // Spannung (V)
    ctx.lineTo(xx,y-3*u);                                  // Verbindungsstrecke zum Grafikpfad hinzufügen
    }
  ctx.stroke();                                            // Polygonzug zeichnen
  }

// Diagramm für Stromstärke:
// (x,y) ... Position des Ursprungs (Pixel)
// Seiteneffekt u0exp, sin, cos

function diagramI (x, y) {
  var t0 = Math.max(tD-tSwitch,0);                         // Zeit für Diagramm-Ursprung (s)
  calculation2(t0);                                        // Zeitabhängige Berechnungen (u0exp, sin, cos)                       
  var i = calcAmperage(t0);                                // Stromstärke für linken Rand (V)
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.strokeStyle = colorAmperage;                         // Farbe für Stromstärke
  ctx.moveTo(x,y-40*i/amperage0);                          // Anfangspunkt auf der senkrechten Achse
  var xx = x;                                              // x-Koordinate übernehmen    
  while (xx < x+240) {                                     // Solange rechter Rand noch nicht erreicht ...
    xx++;                                                  // x-Koordinate um 1 erhöhen
    var tt = t0+(xx-x)/pixSec;                             // Zeit (s)
    calculation2(tt);                                      // Zeitabhängige Berechnungen (u0exp, sin, cos)
    i = calcAmperage(tt);                                  // Stromstärke (A)
    ctx.lineTo(xx,y-40*i/amperage0);                       // Verbindungsstrecke zum Grafikpfad hinzufügen
    }
  ctx.stroke();                                            // Polygonzug zeichnen
  }

// Diagramm für Spannung und Stromstärke:
// (x,y) ... Position des Ursprungs (Pixel)
// Seiteneffekt tD, u0exp, sin, cos

function diagramUI (x, y) {
  axes(x,y);                                               // Achsen 
  values(x,y);                                             // Zahlenwerte
  diagramU(x,y);                                           // Spannung als Funktion der Zeit 
  diagramI(x,y);                                           // Stromstärke als Funktion der Zeit
  }
  
// Balkendiagramm für Energie:
// x,y ... linke obere Ecke (Pixel)

function diagramE (x, y) {
  var e = cap/2*voltage0*voltage0;                         // Gesamtenergie (J)
  var eE = cap/2*voltage*voltage;                          // Energie des elektrischen Feldes (J)
  var hE = 150*eE/e;                                       // Höhe für elektrische Energie (Pixel)
  var eM = ind/2*amperage*amperage;                        // Energie des magnetischen Feldes (J)
  var eEM = eE+eM;                                         // Summe aus elektr. und magn. Energie (J) 
  var hEM = 150*eEM/e;                                     // Höhe für elektr. und magn. Energie (Pixel)
  rectangle(x,y,50,hE,colorE,1);                           // Rechteck für elektrische Energie (oben)
  rectangle(x,y+hE,50,hEM-hE,colorB,1);                    // Rechteck für magnetische Energie (Mitte)
  rectangle(x,y+hEM,50,150-hEM,"#000000",1);               // Rechteck für innere Energie (unten)
  ctx.fillStyle = colorE;                                  // Farbe für elektrisches Feld
  alignText(text12,0,x+70,y+20);                           // Erklärender Text (elektrische Feldenergie)
  var s = ToString(eE,3,false)+" "+joule;                  // Zeichenkette für Energie des elektrischen Feldes
  alignText(s,0,x+70,y+35);                                // Zeichenkette ausgeben
  ctx.fillStyle = colorB;                                  // Farbe für magnetisches Feld
  alignText(text13,0,x+70,y+70);                           // Erklärender Text (magnetische Feldenergie)
  s = ToString(eM,3,false)+" "+joule;                      // Zeichenkette für Energie des magnetischen Feldes
  alignText(s,0,x+70,y+85);                                // Zeichenkette ausgeben
  ctx.fillStyle = "#000000";                               // Farbe schwarz
  alignText(text14,0,x+70,y+120);                          // Erklärender Text (innere Energie)
  var eI = e-eEM; if (eI < 1e-10) eI = 0;                  // Innere Energie (J)
  s = ToString(eI,3,false)+" "+joule;                      // Zeichenkette für innere Energie
  alignText(s,0,x+70,y+135);                               // Zeichenkette ausgeben
  }
      
// Angabe der Schwingungsdauer:
    
function writePeriod () {
  ctx.fillStyle = "#000000";                               // Farbe schwarz
  alignText(text11,1,90,350);                              // Erklärender Text (Schwingungsdauer)
  var s = symbolPeriod+" = "+ToString(T,3,true)+" "+second;// Zeichenkette für Schwingungsdauer
  alignText(s,1,90,370);                                   // Zeichenkette ausgeben
  }
      
// Angabe des Schwingungstyps:
    
function writeType () {
  ctx.fillStyle = "#000000";                               // Farbe schwarz
  var s;                                                   // Variable für Bezeichnung des Schwingungstyps
  if (res == 0) s = text15;                                // Ungedämpfte Schwingung
  else if (omega2 > 0) s = text16;                         // Gedämpfte Schwingung
  else if (omega2 == 0) s = text17;                        // Aperiodischer Grenzfall
  else s = text18;                                         // Kriechfall        
  alignText(s,1,320,390);                                  // Zeichenkette ausgeben
  }
  
// Pfeile für Stromrichtung:
    
function arrowsCurrent () {
  if (Math.abs(amperage/amperage0) <= 0.05) return;        // Abbrechen, falls Stromstärke sehr klein
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.strokeStyle = colorAmperage;                         // Farbe für Stromstärke
  var y0 = (res==0 ? 30 : 20);                             // Senkrechte Koordinate für oberen Pfeil
  if (amperage > 0) {                                      // Falls Stromstärke positiv ...
    arrow(290,230,260,230,3);                              // Unterer Pfeil nach links
    arrow(260,y0,290,y0,3);                                // Oberer Pfeil nach rechts
    }
  else {                                                   // Falls Stromstärke negativ ...
    arrow(260,230,290,230,3);                              // Unterer Pfeil nach rechts
    arrow(290,y0,260,y0,3);                                // Oberer Pfeil nach links
    }       
  }  
  
// Grafik-Ausgabe:
// Seiteneffekt t, t0, u0exp, sin, cos, voltage, amperage, tD
  
function paint () {
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // Aktuelle Zeit
    var dt = (t1-t0)/(1000*slow);                          // Länge des Zeitintervalls (s)
    if (t < tSwitch && slow == 100) dt *= 10;              // Falls Zeitlupe 100-fach, Schaltvorgang verkürzen
    t += dt;                                               // Zeitvariable aktualisieren
    t0 = t1;                                               // Neuer Bezugszeitpunkt
    }
  rectangle(0,0,width,height,colorBackground);             // Hintergrund
  var tt = t-tSwitch;                                      // Zeit seit dem Schließen des Schalters
  if (t > tSwitch) calculation2(tt);                       // Zeitabhängige Berechnungen
  voltage = (t<tSwitch ? voltage0 : calcVoltage(tt));      // Aktuelle Spannung (V)
  amperage = (t<tSwitch ? 0 : calcAmperage(tt));           // Aktuelle Stromstärke (A)
  condensator(200,130);                                    // Kondensator mit elektrischen Feldlinien
  coil(340,130);                                           // Spule mit magnetischen Feldlinien
  rectangle(40,120,41,2,"#000000");                        // Pluspol der Spannungsquelle (oben)
  rectangle(50,132,21,6,"#000000");                        // Minuspol der Spannungsquelle (unten)    
  switch0(200,80);                                         // Schalter      
  wires();                                                 // Anschlussdrähte
  if (res > 0)                                             // Falls Widerstand vorhanden ...
    rectangle(250,33,50,15,colorBackground,2.5);           // Symbol für Widerstand (Rechteck)
  rectangle(25,119,11,3,colorPlus);                        // Pluszeichen, waagrechte Linie (Spannungsquelle oben)
  rectangle(29,115,3,11,colorPlus);                        // Pluszeichen, senkrechte Linie (Spannungsquelle oben)
  rectangle(25,134,11,3,colorMinus);                       // Minuszeichen (Spannungsquelle unten)
  arrowsCurrent();                                         // Pfeile für Stromrichtung
  clock(90,280);                                           // Digitaluhr      
  if (omega2 > 0) writePeriod();                           // Angabe der Schwingungsdauer, falls sinnvoll
  var ui = rb3.checked;                                    // Radiobutton Spannung/Stromstärke ausgewählt?
  if (ui) diagramUI(180,320);                              // Diagramm zu Spannung und Stromstärke      	
  else diagramE(200,250);                                  // Diagramm zur Energie
  if (ui) writeType();                                     // Angabe des Schwingungstyps
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen