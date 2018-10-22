// Erzwungene Schwingungen, Resonanz (Federpendel)
// Java-Applet (09.09.1999) umgewandelt
// 04.10.2015 - 05.10.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind einer eigenen Datei (zum Beispiel resonance_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorExciter = "#ff0000";                              // Farbe für Erreger
var colorResonator = "#0000ff";                            // Farbe für Resonator

// Sonstige Konstanten:

var aE = 0.02;                                             // Amplitude des Erregers (m)
var FONT1 = "normal normal bold 12px sans-serif";          // Normaler Zeichensatz

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var bu1, bu2;                                              // Schaltknöpfe (Reset, Start/Pause/Weiter)
var cbSlow;                                                // Optionsfeld Zeitlupe
var ipD, ipM, ipA, ipF;                                    // Eingabefelder
var rb1, rb2, rb3;                                         // Radiobuttons
var on;                                                    // Flag für Bewegung
var slow;                                                  // Flag für Zeitlupe
var t0;                                                    // Anfangszeitpunkt
var t;                                                     // Aktuelle Zeit (s)
var timer;                                                 // Timer für Animation

var d;                                                     // Federkonstante (N/m)
var m;                                                     // Masse (kg)
var gamma;                                                 // Dämpfung (1/s)
var omega;                                                 // Kreisfrequenz (rad/s)
var omega0;                                                // Eigen-Kreisfrequenz (1/s)
var omega1;
var aR;                                                    // Amplitude Resonator (m)
var aAbs, aEla;                                            // Absorbierende und elastische Amplitude (m)
var a1, b1;                                                // Amplitude Einschwingvorgang (m)
var yE;                                                    // Elongation Erreger (m)
var yR;                                                    // Elongation Resonator (m)
var dPhi;                                                  // Phasenunterschied (Bogenmaß)
var reskat;                                                // Flag für Resonanzkatastrophe
var nrSize;                                                // Dargestellte physikalische Größe

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
  getElement("resonator",text04);                          // Erklärender Text (Resonator)
  getElement("ipDa",text05);                               // Erklärender Text (Federkonstante)
  ipD = getElement("ipDb");                                // Eingabefeld (Federkonstante)
  getElement("ipDc",newtonPerMeter);                       // Einheit (Federkonstante)
  getElement("ipMa",text06);                               // Erklärender Text (Masse)
  ipM = getElement("ipMb");                                // Eingabefeld (Masse)
  getElement("ipMc",kilogram);                             // Einheit (Masse)
  getElement("ipAa",text07);                               // Erklärender Text (Dämpfung)
  ipA = getElement("ipAb");                                // Eingabefeld (Dämpfung)
  getElement("ipAc",perSecond);                            // Einheit (Dämpfung)
  getElement("exciter",text08);                            // Erklärender Text (Erreger)
  getElement("ipFa",text09);                               // Erklärender Text (Kreisfrequenz)
  ipF = getElement("ipFb");                                // Eingabefeld (Kreisfrequenz)
  getElement("ipFc",radPerSecond);                         // Einheit (Kreisfrequenz)
  rb1 = getElement("rb1");                                 // Radiobutton (Diagramm Elongation)
  getElement("lb1",text10);                                // Erklärender Text (Diagramm Elongation)
  rb2 = getElement("rb2");                                 // Radiobutton (Diagramm Amplitude)
  rb2.checked = true;                                      // Radiobutton auswählen
  getElement("lb2",text11);                                // Erklärender Text (Diagramm Amplitude)
  rb3 = getElement("rb3");                                 // Radiobutton (Diagramm Phasenunterschied)
  getElement("lb3",text12);                                // Erklärender Text (Diagramm Phasenunterschied)
  getElement("author",author);                             // Autor (und Übersetzer)

  d = 10;                                                  // Startwert Federkonstante (N/m)
  m = 1;                                                   // Startwert Masse (kg)
  gamma = 0.2;                                             // Startwert Dämpfung (1/s) 
  omega = 2;                                               // Startwert Kreisfrequenz (rad/s)
  updateInput();                                           // Eingabefelder aktualisieren 
  calculation();                                           // Berechnungen (Seiteneffekt!)
    
  on = false;                                              // Animation abgeschaltet
  slow = false;                                            // Zeitlupe abgeschaltet
  t = 0;                                                   // Aktuelle Zeit (s)
  t0 = new Date();                                         // Anfangszeitpunkt
  setInterval(paint,40);                                   // Timer-Intervall 0,040 s
  nrSize = 2;                                              // Zunächst Diagramm zur Amplitude
  reskat = false;                                          // Zunächst keine Resonanzkatastrophe
  
  bu1.onclick = reactionReset;                             // Reaktion auf Resetknopf
  bu2.onclick = reactionStart;                             // Reaktion auf Startknopf
  cbSlow.onclick = reactionSlow;                           // Reaktion auf Optionsfeld Zeitlupe
  ipD.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Federkonstante)
  ipM.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Masse)
  ipA.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Dämpfung)
  ipF.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Kreisfrequenz)
  rb1.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Diagramm Elongation)
  rb2.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Diagramm Amplitude)
  rb3.onclick = reactionRadioButton;                       // Reaktion auf Radiobutton (Diagramm Phasenunterschied)
    
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
  ipD.readOnly = !p;                                       // Eingabefeld für Federkonstante
  ipM.readOnly = !p;                                       // Eingabefeld für Masse
  ipA.readOnly = !p;                                       // Eingabefeld für Dämpfung
  ipF.readOnly = !p;                                       // Eingabefeld für Kreisfrequenz
  }
  
// Reaktion auf Resetknopf:
// Seiteneffekt bu2, on, timer, t, reskat, d, m, gamma, omega, omega0, omega1, aAbs, aEla, a1, b1, aR, dPhi, reskat, t0, yE, yR 
   
function reactionReset () {
  setButton2State(0);                                      // Zustand des Schaltknopfs Start/Pause/Weiter
  enableInput(true);                                       // Eingabefelder aktivieren
  stopAnimation();                                         // Animation abschalten
  t = 0;                                                   // Zeitvariable zurücksetzen
  reskat = false;                                          // Keine Resonanzkatastrophe
  reaction();                                              // Eingegebene Werte übernehmen und rechnen
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf den Schaltknopf Start/Pause/Weiter:
// Seiteneffekt bu2, on, timer, t0, d, m, gamma, omega, omega0, omega1, aAbs, aEla, a1, b1, aR, dPhi, reskat 

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
// Seiteneffekt d, m, gamma, omega, omega0, omega1, aAbs, aEla, a1, b1, aR, dPhi, reskat 

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
  if (rb1.checked) nrSize = 1;                             // Entweder Diagramm zur Elongation ...                                
  else if (rb2.checked) nrSize = 2;                        // ... oder Diagramm zur Amplitude
  else nrSize = 3;                                         // ... oder Diagramm zum Phasenunterschied
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

// Berechnungen (zeitunabhängig):
// Seiteneffekt omega0, omega1, aAbs, aEla, a1, b1, aR, dPhi, reskat 

function calculation () {
  omega0 = Math.sqrt(d/m); 
  omega1 = Math.sqrt(Math.abs(d/m-gamma*gamma/4));
  var diff = omega0*omega0-omega*omega;
  var nenner = diff*diff+gamma*gamma*omega*omega;
  if (nenner != 0) {
    aAbs = (d*aE/m)*(gamma*omega/nenner);
    aEla = (d*aE/m)*(diff/nenner);
    }
  a1 = -(aAbs*omega+gamma/2*aEla);                         // aperiodischer Grenzfall
  if (omega1 != 0) a1 /= omega1;                           // Schwingung, Kriechfall
  b1 = -aEla;
  if (nenner > 0) aR = aE*d/(m*Math.sqrt(nenner));
  else aR = 1e6;                                           // unendliche Amplitude
  if (gamma == 0) {                                        // Phasenunterschied ohne Dämpfung
    if (omega < omega0) dPhi = 0;
    else if (omega == omega0) dPhi = Math.PI/2;
    else dPhi = Math.PI;
    }
  else {                                                   // Phasenunterschied mit Dämpfung
    dPhi = Math.atan(gamma*omega/diff);
    if (dPhi < 0) dPhi += Math.PI;
    }
  reskat = false;
  }
  
// Berechnung der Elongation (m):
// t ... Zeit (s)

function elongation (t) {
  var arg = omega*t;                                       // Argument für Sinus und Cosinus (Bogenmaß)
  var yR = aAbs*Math.sin(arg)+aEla*Math.cos(arg);
  if (gamma < 2*omega0) {                                  // Falls Schwingfall ...
    if (gamma > 0 || omega != omega0) {
      var arg1 = omega1*t;
      yR += Math.exp(-gamma*t/2)*(a1*Math.sin(arg1)+b1*Math.cos(arg1));
      }
    else yR = omega*aE*t/2*Math.sin(arg);                  // Resonanz ohne Dämpfung
    }
  else if (gamma == 2*omega0)                              // Falls aperiodischer Grenzfall ...
    yR += Math.exp(-gamma*t/2)*(a1*t+b1);
  else {                                                   // Falls Kriechfall ...
    var pot1 = Math.exp((-gamma/2+omega1)*t);
    var pot2 = Math.exp((-gamma/2-omega1)*t);
    yR += pot1*(b1+a1)/2+pot2*(b1-a1)/2;
    }
  return yR;
  }
  
// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag für Nachkommastellen (im Gegensatz zu gültigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  s = s.replace(".",decimalSeparator);                     // Eventuell Punkt durch Komma ersetzen
  if (fix) return s;                                       // Rückgabewert für gegebene Anzahl von Nachkommastellen
  return s.replace("e+","*10^");                           // Rückgabewert für gegebene Anzahl gültiger Ziffern
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
// Seiteneffekt d, m, gamma, omega

function input () {
  d = inputNumber(ipD,3,false,5,50,3);                     // Federkonstante (N/m)
  m = inputNumber(ipM,3,false,1,10);                       // Masse (kg)
  gamma = inputNumber(ipA,3,false,0,100);                  // Dämpfung (1/s)
  omega = inputNumber(ipF,3,false,0,10);                   // Kreisfrequenz (rad/s)
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ipD.value = ToString(d,3,false);                         // Federkonstante (N/m)
  ipM.value = ToString(m,3,false);                         // Masse (kg)
  ipA.value = ToString(gamma,3,false);                     // Dämpfung (1/s)
  ipF.value = ToString(omega,3,false);                     // Kreisfrequenz (rad/s)
  }
   
//-------------------------------------------------------------------------------------------------

// Neuer Grafikpfad mit Standardwerten:

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
  
// Feder zeichnen:
// (x,yO) ... oberes Ende des gewundenen Teils (Pixel)
// (x,yU) ... unteres Ende des gewundenen Teils (Pixel)

function spring (x, yO, yU) {
  var ampl = 10;                                           // Amplitude (Pixel)
  var k = 2*Math.PI*12/(yU-yO);                            // Hilfsgröße
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.moveTo(x,yO-10);                                     // Anfangspunkt (oben)
  ctx.lineTo(x,yO);                                        // Geraden Abschnitt oben vorbereiten
  var xx = x, yy = yO;                                     // Aktuelle Koordinaten (Pixel)
  while (yy < yU) {                                        // Solange unteres Ende des gewundenen Teils noch nicht erreicht ...
    yy++;                                                  // y-Koordinate erhöhen
    xx = x+ampl*Math.sin(k*(yy-yO));                       // x-Koordinate berechnen
    if (yy > yU) xx = Math.min(xx,x);                      // Am unteren Ende y-Koordinate korrigieren
    ctx.lineTo(xx,yy);                                     // Abschnitt vorbereiten
    } 
  ctx.lineTo(x,yU+10);                                     // Geraden Abschnitt unten vorbereiten         
  ctx.stroke();                                            // Polygonzug zeichnen
  }
  
// Federpendel zeichnen:
// Seiteneffekt yE, yR, reskat 

function pendulum () {
  var pix = 500;                                           // Umrechnungsfaktor (Pixel pro m)
  var x0 = 70;                                             // x-Koordinate (Pixel)
  var yE0 = 90;                                            // Mittlere y-Koordinate Erreger (Pixel)
  var yR0 = 255;                                           // Mittlere y-Koordinate Resonator (Pixel)
  yE = aE*Math.cos(omega*t);                               // Elongation Erreger (m)
  var yyE = pix*yE;                                        // Elongation Erreger (Pixel)
  circle(x0,yE0-yyE,4,colorExciter);                       // Erreger
  yR = elongation(t);                                      // Elongation des Pendelkörpers (m)                        
  var yy = pix*yR;                                         // Elongation des Pendelkörpers (Pixel)
  rectangle(x0-10,yR0-5-yy,20,10,colorResonator);          // Pendelkörper
  if (yy < yyE+120) spring(x0,yE0+10-yyE,yR0-15-yy);       // Schraubenfeder
  else if (!reskat) reskat = true;                         // Unter Umständen Flag für Resonanzkatastrophe
  if (yy > yyE+210) spring(x0,yR0+15-yy,yE0-10-yyE);       // Schraubenfeder
  ctx.strokeStyle = colorExciter;                          // Farbe für Erreger
  arrow(x0-25,yE0-10,x0-25,yE0+10);                        // Doppelpfeil für Erreger (links), unterer Teil 
  arrow(x0-25,yE0+10,x0-25,yE0-10);                        // Doppelpfeil für Erreger (links), oberer Teil       
  line(x0-27,yE0,x0-23,yE0,colorExciter);                  // Querstrich in der Mitte
  ctx.strokeStyle = colorResonator;                        // Farbe für Resonator      
  var y1 = yR0-aR*pix;                                     // Oberer Umkehrpunkt (Pixel)                               
  var y2 = yR0+aR*pix;                                     // Unterer Umkehrpunkt (Pixel)
  arrow(x0+25,y1,x0+25,y2);                                // Doppelpfeil für Resonator (rechts), unterer Teil
  arrow(x0+25,y2,x0+25,y1);                                // Doppelpfeil für Resonator (rechts), oberer Teil          
  line(x0+23,yR0,x0+27,yR0,colorResonator);                // Querstrich in der Mitte
  if (reskat) {                                            // Falls Resonanzkatastrophe ...
    ctx.textAlign = "left";                                // Textausrichtung linksbündig
    ctx.fillText(text13,30,yR0+45);                        // Warnmeldung, 1. Zeile (Resonanzkatastrophe)
    ctx.fillText(text14,30,yR0+65);                        // Warnmeldung, 2. Zeile (Simulation nicht mehr realistisch)
    }
  }
  
// Rechtsbündiger Text mit Index:
// s ....... Text mit Index (optional, Unterstrich als Trennzeichen)
// (x,y) ... Position
// a ....... Ausrichtung (0 für linksbündig, 1 für zentriert, 2 für rechtsbündig)
    
function textIndex (s, x, y, a) {
  var i = s.indexOf("_");                                  // Index Unterstrich oder -1
  var s1 = (i>=0 ? s.substring(0,i) : s);                  // Normaler Text
  var s2 = (i>=0 ? s.substring(i+1) : "");                 // Index (eventuell leer)
  var w1 = ctx.measureText(s1).width;                      // Breite von s1 (Pixel) 
  var w2 = ctx.measureText(s2).width;                      // Breite von s2 (Pixel)
  var x0 = x-a*(w1+w2)/2;                                  // x-Koordinate Textanfang
  ctx.textAlign = "left";                                  // Textausrichtung linksbündig
  ctx.fillText(s1,x0,y);                                   // Normalen Text ausgeben
  if (i >= 0) ctx.fillText(s2,x0+w1+1,y+5);                // Gegebenenfalls Index ausgeben
  }
  
// Diagramm 1 (Elongation in Abhängigkeit von der Zeit):
// (x,y) ... Ursprung (Pixel)

function diagram1 (x, y) {
  var pixT = 20;                                           // Umrechnungsfaktor für Zeitachse (Pixel pro Sekunde)
  var pixE = 50/Math.max(aR,aE);                           // Umrechnungsfaktor für Elongationsachse (Pixel pro Meter)
  if (pixE < 500) pixE = 500;                              // Zu kleinen Umrechnungsfaktor verhindern
  var t0 = Math.max(t-100/pixT,0);                         // Bezugszeitpunkt (s) entsprechend Ursprung
  ctx.strokeStyle = "#000000";                             // Farbe für Achsen des Diagramms
  arrow(x-10,y,x+220,y);                                   // Waagrechte Achse (Zeit t) 
  arrow(x,y+100,x,y-100);                                  // Senkrechte Achse (Elongationen y_E und y_R)
  newPath();                                               // Neuer Grafikpfad (Standardwerte) für Erregerschwingung
  ctx.strokeStyle = colorExciter;                          // Farbe für Erreger
  var xx = x;                                              // Waagrechte Koordinate (Anfangspunkt, Pixel)
  var yy = y-pixE*aE*Math.cos(omega*t0);                   // Senkrechte Koordinate (Anfangspunkt, Pixel)
  ctx.moveTo(xx,yy);                                       // Anfangspunkt festlegen
  while (xx < x+200) {                                     // Solange rechtes Ende noch nicht erreicht ...
    xx++;                                                  // Waagrechte Koordinate erhöhen (Pixel)
    var tt = t0+(xx-x)/pixT;                               // Zeit (aktueller Punkt, s)
    yy = y-pixE*aE*Math.cos(omega*tt);                     // Senkrechte Koordinate (Pixel)
    ctx.lineTo(xx,yy);                                     // Strecke zum Grafikpfad hinzufügen
    }
  ctx.stroke();                                            // Polygonzug für Kurve zeichnen
  xx = x+(t-t0)*pixT; yy = y-yE*pixE;                      // Aktueller Punkt im Diagramm (Pixel)
  circle(xx,yy,2,colorExciter);                            // Markierung zeichnen
  newPath();                                               // Neuer Grafikpfad (Standardwerte) für Resonatorschwingung
  ctx.strokeStyle = colorResonator;                        // Farbe für Resonator
  xx = x;                                                  // Waagrechte Koordinate (Anfangspunkt, Pixel)
  yy = y-pixE*elongation(t0);                              // Senkrechte Koordinate (Anfangspunkt, Pixel)
  ctx.moveTo(xx,yy);                                       // Anfangspunkt festlegen
  while (xx < x+200) {                                     // Solange rechtes Ende noch nicht erreicht ...
    xx++;                                                  // Waagrechte Koordinate erhöhen (Pixel)
    tt = t0+(xx-x)/pixT;                                   // Zeit (aktueller Punkt, s)
    yy = y-pixE*elongation(tt);                            // Senkrechte Koordinate (Pixel)
    ctx.lineTo(xx,yy);                                     // Strecke zum Grafikpfad hinzufügen
    }
  ctx.stroke();                                            // Polygonzug für Kurve zeichnen
  xx = x+(t-t0)*pixT; yy = y-yR*pixE;                      // Aktueller Punkt im Diagramm (Pixel)
  circle(xx,yy,2,colorResonator);                          // Markierung zeichnen  
  ctx.textAlign = "left";                                  // Textausrichtung linksbündig
  ctx.fillStyle = "#000000";                               // Schriftfarbe
  ctx.fillText(symbolTime,x+215,y+15);                     // Beschriftung der Zeitachse
  ctx.fillStyle = colorExciter;                            // Farbe für Erregerschwingung
  textIndex(symbolElongationExciter,x-8,y-92,2);           // Beschriftung für Elongation Erreger (mit Index)
  ctx.fillStyle = colorResonator;                          // Farbe für Resonatorschwingung
  textIndex(symbolElongationResonator,x-8,y-75,2);         // Beschriftung für Elongation Resonator (mit Index)     
  }
  
// Omega-Achse mit Beschriftung für Diagramm 2 und Diagramm 3
// (x,y) ... Ursprung

function omegaAxis (x, y) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  arrow(x-10,y,x+220,y);                                   // Achse zeichnen
  ctx.textAlign = "left";                                  // Textausrichtung linksbündig
  ctx.fillText(symbolAngularFrequency,x+209,y+14);         // Beschriftung (Kreisfrequenz omega)
  line(x+50,y-3,x+50,y+3);                                 // Markierung für Resonanz-Kreisfrequenz
  textIndex(symbolAngularFrequencyResonance,x+50,y+14,1);  // Beschriftung (Resonanz-Kreisfrequenz omega_0)
  }

// Diagramm 2 (Amplitude in Abhängigkeit von der Kreisfrequenz):
// (x,y) ... Ursprung

function diagram2 (x, y) {
  var pixA = 500;                                          // Umrechnungsfaktor für senkrechte Achse (Pixel pro Meter)
  omegaAxis(x,y);                                          // Waagrechte Achse (Kreisfrequenz omega)
  arrow(x,y+10,x,y-180);                                   // Senkrechte Achse (Amplitude A)
  textIndex(symbolAmplitudeResonator,x-8,y-170,2);         // Beschriftung (Amplitude A)
  var a0 = aE*d/m;                                         // Hilfsgröße 
  var b = gamma*gamma;                                     // Hilfsgröße
  var q0 = omega0*omega0;                                  // Hilfsgröße
  var om0 = omega0/50;                                     // Hilfsgröße
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  var xx = x, yy = y-pixA*aE;                              // Anfangspunkt (Pixel)
  ctx.moveTo(xx,yy);                                       // Anfangspunkt festlegen
  while (xx < x+220) {                                     // Solange rechtes Ende noch nicht erreicht ...
    xx++;                                                  // Waagrechte Koordinate erhöhen (Pixel) 
    var o = om0*(xx-x);                                    // Hilfsgröße
    var q = o*o;                                           // Hilfsgröße
    var diff = q0-q;                                       // Hilfsgröße
    var a = a0/Math.sqrt(diff*diff+b*q);                   // Amplitude (m)
    yy = y-pixA*a;                                         // Senkrechte Koordinate (Pixel)
    if (yy < -1) yy = -1;                                  // Negative Koordinate mit großem Betrag verhindern
    ctx.lineTo(xx,yy);                                     // Strecke zum Grafikpfad hinzufügen
    }
  ctx.stroke();                                            // Polygonzug für Kurve zeichnen
  xx = x+omega/om0; yy = y-pixA*aR;                        // Aktueller Punkt im Diagramm (Pixel)
  circle(xx,yy,2,colorResonator);                          // Markierung zeichnen
  }
  
// Diagramm 3 (Phasenunterschied in Abhängigkeit von der Kreisfrequenz):
// (x,y) ... Ursprung

function diagram3 (x, y) {
  var pixD = 120/Math.PI;                                  // Umrechnungsfaktor für senkrechte Achse 
  omegaAxis(x,y);                                          // Waagrechte Achse (Kreisfrequenz omega)
  arrow(x,y+10,x,y-180);                                   // Senkrechte Achse (Phasenunterschied Delta phi)
  line(x-3,y-60,x+3,y-60);                                 // Markierung für pi/2
  line(x-3,y-120,x+3,y-120);                               // Markierung für pi 
  textIndex(symbolPhaseDifference,x-8,y-170,2);            // Beschriftung Phasenunterschied (Delta Phi)
  ctx.textAlign = "center";                                // Textausrichtung zentriert
  ctx.fillText(symbolPi,x-10,y-62);                        // Zähler von Beschriftung pi/2
  line(x-14,y-60,x-6,y-60);                                // Bruchstrich für Beschriftung pi/2
  ctx.fillText("2",x-10,y-48);                             // Nenner von Beschriftung pi/2
  ctx.fillText(symbolPi,x-10,y-117);                       // Beschriftung pi
  var q0 = omega0*omega0;                                  // Hilfsgröße 
  var om0 = omega0/50;                                     // Hilfsgröße
  if (gamma > 0) {                                         // Falls Dämpfung ...
    newPath();                                             // Neuer Grafikpfad (Standardwerte)
    var xx = x, yy = y;                                    // Anfangspunkt (Ursprung, Pixel) 
    ctx.moveTo(xx,yy);                                     // Anfangspunkt festlegen                 
    while (xx < x+220) {                                   // Solange rechtes Ende noch nicht erreicht ...
      xx++;                                                // Waagrechte Koordinate erhöhen (Pixel)
      var o = om0*(xx-x);                                  // Hilfsgröße
      var dphi = Math.atan(gamma*o/(q0-o*o));              // Phasenunterschied (Bogenmaß)
      if (dphi < 0) dphi += Math.PI;                       // Wert im Intervall [0;pi] erzwingen
      var yy = y-pixD*dphi;                                // Senkrechte Koordinate (Pixel)
      ctx.lineTo(xx,yy);                                   // Strecke zum Grafikpfad hinzufügen
      }
    ctx.stroke();                                          // Polygonzug für Kurve zeichnen
    }
  else {                                                   // Falls keine Dämpfung ...
    line(x+50,y,x+50,y-120);                               // Senkrechte Linie (Resonanz-Kreisfrequenz)
    line(x+50,y-120,x+230,y-120);                          // Waagrechte Linie (für große Kreisfrequenz)
    }
  xx = x+omega/om0; yy = y-pixD*dPhi;                      // Aktueller Punkt im Diagramm (Pixel)
  circle(xx,yy,2,colorResonator);                          // Markierung zeichnen
  }
  
// Hilfsroutine: Ausgabe des Wertes einer Größe
// s ... Symbol (links vom Gleichheitszeichen)
// v ... Zahlenwert
// u ... Einheit
// y ... Senkrechte Koordinate (Pixel)

function writeValue (s, v, u, y) {
  var x = 280;                                             // Waagrechte Koordinate des Gleichheitszeichens (Pixel)
  textIndex(s,x-5,y,2);                                    // Symbol (links vom Gleichheitszeichen, rechtsbündig)
  var str = "= "+ToString(v,3,false)+" "+u;                // Zeichenkette ab Gleichheitszeichen
  ctx.fillText(str,x,y);                                   // Ausgabe (linksbündig)
  }
  
// Zahlenangaben:

function writeValues () {
  var y0 = 280;                                            // Senkrechte Koordinate der obersten Zeile (Pixel)
  var x0 = 280;                                            // Waagrechte Koordinate des Gleichheitszeichens (Pixel)
  ctx.fillStyle = colorExciter;                            // Farbe für Erregerschwingung
  writeValue(symbolAngularFrequency,omega,radPerSecondUnicode,y0); // Kreisfrequenz (omega)
  writeValue(symbolAmplitudeExciter,aE*100,centimeter,y0+20);      // Amplitude der Erregerschwingung (A_E)
  ctx.fillStyle = colorResonator;                          // Farbe für Resonatorschwingung
  writeValue(symbolAngularFrequencyResonance,omega0,radPerSecondUnicode,y0+40);  // Resonanz-Kreisfrequenz (omega_0)
  writeValue(symbolAmplitudeResonator,aR*100,centimeter,y0+60);    // Amplitude der Resonatorschwingung (A)
  ctx.fillStyle = "#000000";                               // Farbe schwarz
  writeValue(symbolPhaseDifference,dPhi/Math.PI,symbolPi,y0+80);   // Phasenunterschied (Delta phi)
  }
                  
// Grafikausgabe:
// Seiteneffekt t, t0, yE, yR, reskat 
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  if (on) {                                                // Falls Animation angeschaltet ...
    var t1 = new Date();                                   // ... Aktuelle Zeit
    var dt = (t1-t0)/1000;                                 // ... Länge des Zeitintervalls (s)
    if (slow) dt /= 10;                                    // ... Falls Zeitlupe, Zeitintervall durch 10 dividieren
    t += dt;                                               // ... Zeitvariable aktualisieren
    t0 = t1;                                               // ... Neuer Anfangszeitpunkt
    }
  ctx.font = FONT1;                                        // Zeichensatz
  ctx.beginPath();                                         // Neuer Grafikpfad für Clipping
  ctx.moveTo(0,20);                                        // Ausgangspunkt links oben
  ctx.lineTo(width,20);                                    // Weiter nach rechts oben
  ctx.lineTo(width,height-20);                             // Weiter nach rechts unten
  ctx.lineTo(0,height-20);                                 // Weiter nach links unten
  ctx.closePath();                                         // Zurück zum Ausgangspunkt
  ctx.clip();                                              // Clipping durchführen
  pendulum();                                              // Federpendel
  writeValues();                                           // Zahlenwerte
  if (nrSize == 1) diagram1(180,130);                      // Entweder Diagramm zur Elongation als Funktion der Zeit ...
  else if (nrSize == 2) diagram2(180,210);                 // ... oder zur Amplitude als Funktion der Erreger-Kreisfrequenz
  else diagram3(180,210);                                  // ... oder zum Phasenunterschied als Funktion der Erreger-Kreisfrequenz  
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der Seite Start-Methode aufrufen

