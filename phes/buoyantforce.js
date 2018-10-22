// Auftriebskraft in Fl�ssigkeiten
// Java-Applet (19.04.1998) umgewandelt
// 09.11.2015 - 11.11.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in ver�nderter Form - f�r nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabh�ngige Texte sind in einer eigenen Datei (zum Beispiel buoyantforce_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorPot = "#0000ff";                                  // Farbe f�r Gef��
var colorLiquid = "#00ffff";                               // Farbe f�r Fl�ssigkeit
var colorBody = "#c06040";                                 // Farbe f�r Quader
var colorBase = "#ffc800";                                 // Farbe f�r Unterlage
var colorSpringscale = "#0000ff";                          // Farbe f�r Geh�use der Federwaage
var colorSpringscale1 = "#ffffff";                         // Farbe f�r Skala der Federwaage
var colorSpringscale2 = "#ff0000";                         // Farbe f�r Skala der Federwaage

// Sonstige Konstanten:

var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz
var MAX_FORCE = [                                          // Messbereiche der Federwaage (N)
  2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
var GRAV_ACCELERATION = 9.81;                              // Fallbeschleunigung (m/s�)
var AREA_POT = 0.04;                                       // Grundfl�che des Gef��es (m�)
var T0 = 0.15;                                             // Urspr�ngliche Tiefe der Fl�ssigkeit (m)
var L0 = 0.1875;                                           // Minimale L�nge der Federwaage (m)
var L1 = 0.1;                                              // Maximale Verl�ngerung der Federwaage (m)

// Attribute:

var canvas, ctx;                                           // Zeichenfl�che, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfl�che (Pixel)
var ip1, ip2, ip3, ip4;                                    // Eingabefelder
var op1, op2, op3, op4, op5;                               // Ausgabefelder
var ch;                                                    // Auswahlfeld (Messbereich)
var drag;                                                  // Flag f�r Zugmodus

var xM, yM;                                                // Mausposition (Pixel)
var aBody;                                                 // Grundfl�che des Quaders (m�)
var hBody;                                                 // H�he des Quaders (m)
var rho;                                                   // Dichte des Quaders (kg/m�)
var fG;                                                    // Gewicht des Quaders (N)
var h;                                                     // Eintauchtiefe (m)
var t;                                                     // Aktuelle Tiefe der Fl�ssigkeit (m)
var rho0;                                                  // Dichte der Fl�ssigkeit (kg/m�)
var fB;                                                    // Auftriebskraft (N)
var fTotal;                                                // Gesamtkraft (N)
var fMax;                                                  // Maximalkraft f�r Federwaage (N)
var ok;                                                    // Flag (Belastung in Ordnung)
var l;                                                     // Aktuelle L�nge der Federwaage (m)
var y;                                                     // H�he des Mauszeigers �ber Gef��boden (m)
var yMax;                                                  // Maximales y (Pixel)

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
  getElement("ip1a",text01);                               // Erkl�render Text (Grundfl�che)
  ip1 = getElement("ip1b");                                // Eingabefeld (Grundfl�che)
  getElement("ip1c",centimeter2);                          // Einheit (Grundfl�che)
  getElement("ip2a",text02);                               // Erkl�render Text (H�he)
  ip2 = getElement("ip2b");                                // Eingabefeld (H�he)
  getElement("ip2c",centimeter);                           // Einheit (H�he)
  getElement("ip3a",text03);                               // Erkl�render Text (Dichte Quader)
  ip3 = getElement("ip3b");                                // Eingabefeld (Dichte Quader)
  getElement("ip3c",gramPerCentimeter3);                   // Einheit (Dichte Quader)
  getElement("ip4a",text04);                               // Erkl�render Text (Dichte Fl�ssigkeit)
  ip4 = getElement("ip4b");                                // Eingabefeld (Dichte Fl�ssigkeit)
  getElement("ip4c",gramPerCentimeter3);                   // Einheit (Dichte Fl�ssigkeit)
  getElement("op1a",text05);                               // Erkl�render Text (Eintauchtiefe)
  op1 = getElement("op1b");                                // Ausgabefeld (Eintauchtiefe)
  getElement("op1c",centimeter);                           // Einheit (Eintauchtiefe)
  getElement("op2a",text06);                               // Erkl�render Text (verdr�ngtes Volumen)
  op2 = getElement("op2b");                                // Ausgabefeld (verdr�ngtes Volumen)
  getElement("op2c",centimeter3);                          // Einheit (verdr�ngtes Volumen)
  getElement("op3a",text07);                               // Erkl�render Text (Auftriebskraft)
  op3 = getElement("op3b");                                // Ausgabefeld (Auftriebskraft)
  getElement("op3c",newton);                               // Einheit (Auftriebskraft)
  getElement("op4a",text08);                               // Erkl�render Text (Gewichtskraft)
  op4 = getElement("op4b");                                // Ausgabefeld (Gewichtskraft)
  getElement("op4c",newton);                               // Einheit (Gewichtskraft)
  getElement("op5a",text09);                               // Erkl�render Text (Gesamtkraft)
  op5 = getElement("op5b");                                // Ausgabefeld (Gesamtkraft)
  getElement("op5c",newton);                               // Einheit (Gesamtkraft)
  getElement("MRa",text10);                                // Erkl�render Text (Messbereich Federwaage)
  ch = getElement("MRb");                                  // Auswahlfeld (Messbereich Federwaage)
  initSelect();                                            // Auswahlfeld vorbereiten
  getElement("MRc",newton);                                // Einheit (Messbereich Federwaage)
  getElement("author",author);                             // Autor (und �bersetzer)
  
  ok = true;                                               // Messbereich der Federwaage nicht �berschritten
  xM = width/2; yM = 50;                                   // Mausposition (Pixel)
  aBody = 0.01;                                            // Grundfl�che des Quaders (m�)
  hBody = 0.05;                                            // H�he des Quaders (m)
  rho = 3000;                                              // Dichte des Quaders (kg/m�)
  rho0 = 1000;                                             // Dichte der Fl�ssigkeit (kg/m�)
  t = T0;                                                  // Tiefe der Fl�ssigkeit (m)
  fMax = 20;                                               // Maximal zul�ssige Kraft (N)
  calcLimit();                                             // Berechnung von yMax (Pixel)                                             
  drag = false;                                            // Zugmodus zun�chst deaktiviert
  
  updateInput();                                           // Eingabefelder aktualisieren
  reaction();                                              // Berechnungen, Ausgabe, Zeichnen
  
  ip1.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Grundfl�che)
  ip2.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe H�he)
  ip3.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Dichte des Quaders)
  ip4.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Dichte der Fl�ssigkeit)
  ch.onchange = reaction;                                  // Reaktion auf Auswahl des Messbereichs

  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Dr�cken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Ber�hrung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Ber�hrung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers        
  }
  
// Initialisierung des Auswahlfelds:

function initSelect () {
  for (var i=0; i<MAX_FORCE.length; i++) {                 // F�r alle Messbereiche der Federwaage ...
    var o = document.createElement("option");              // Neues option-Element
    o.text = ""+MAX_FORCE[i];                              // Messbereich als Text
    ch.add(o);                                             // option-Element hinzuf�gen
    }
  ch.selectedIndex = 6;                                    // Voreingestellter Index (entspricht 20 N)
  }

// Reaktion auf Dr�cken der Maustaste:
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen (Auswahl)                    
  }
  
// Reaktion auf Ber�hrung:
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Ber�hrpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen (Auswahl)
  if (drag) e.preventDefault();                            // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Loslassen der Maustaste:
  
function reactionMouseUp (e) {                                             
  drag = false;                                            // Zugmodus deaktivieren                             
  }
  
// Reaktion auf Ende der Ber�hrung:
  
function reactionTouchEnd (e) {             
  drag = false;                                            // Zugmodus deaktivieren
  }
  
// Reaktion auf Bewegen der Maus:
  
function reactionMouseMove (e) {            
  if (!drag) return;                                       // Abbrechen, falls Zugmodus nicht aktiviert
  reactionMove(e.clientX,e.clientY);                       // Position ermitteln, rechnen und neu zeichnen
  }
  
// Reaktion auf Bewegung des Fingers:
  
function reactionTouchMove (e) {            
  if (!drag) return;                                       // Abbrechen, falls Zugmodus nicht aktiviert
  var obj = e.changedTouches[0];                           // Liste der neuen Fingerpositionen     
  reactionMove(obj.clientX,obj.clientY);                   // Position ermitteln, rechnen und neu zeichnen
  e.preventDefault();                                      // Standardverhalten verhindern                          
  }  
  
// Hilfsroutine: Reaktion auf Mausklick oder Ber�hren mit dem Finger (Auswahl):
// u, v ... Bildschirmkoordinaten bez�glich Viewport
// Seiteneffekt drag 

function reactionDown (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)
  if (Math.abs(u-xM) < 50) drag = true;                    // Falls Position in der Mitte, Zugmodus aktivieren  
  }
  
// Reaktion auf Bewegung von Maus oder Finger (�nderung):
// u, v ... Bildschirmkoordinaten bez�glich Viewport
// Seiteneffekt yM, aBody, hBody, rho, rho0, fMax, yMax, y, fTotal, fG, fB, l, h, t, ok

function reactionMove (u, v) {
  if (!drag) return;                                       // Falls kein Zugmodus, abbrechen
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfl�che bez�glich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bez�glich Zeichenfl�che (Pixel)
  yM = v;                                                  // Mausposition aktualisieren 
  reaction();                                              // Eingabe, Berechnungen, Ausgabe, neu zeichnen
  }
      
// Reaktion auf Tastendruck (nur auf Enter-Taste):
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten �bernehmen, rechnen, Ausgabe, neu zeichnen                          
  }
  
//-------------------------------------------------------------------------------------------------

// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  if (n == 1000) s = "1000";                               // Ausnahme, um "1,00e+3" zu verhindern
  return s.replace(".",decimalSeparator);                  // Eventuell Punkt durch Komma ersetzen
  }
  
// Eingabe einer Zahl
// ef .... Eingabefeld
// d ..... Zahl der Stellen
// fix ... Flag f�r Nachkommastellen (im Gegensatz zu g�ltigen Ziffern)
// min ... Minimum des erlaubten Bereichs
// max ... Maximum des erlaubten Bereichs
// R�ckgabewert: Zahl oder NaN
  
function inputNumber (ef, d, fix, min, max) {
  var s = ef.value;                                        // Zeichenkette im Eingabefeld
  s = s.replace(",",".");                                  // Eventuell Komma in Punkt umwandeln
  var n = Number(s);                                       // Umwandlung in Zahl, falls m�glich
  if (isNaN(n)) n = 0;                                     // Sinnlose Eingaben als 0 interpretieren 
  if (n < min) n = min;                                    // Falls Zahl zu klein, korrigieren
  if (n > max) n = max;                                    // Falls Zahl zu gro�, korrigieren
  ef.value = ToString(n,d,fix);                            // Eingabefeld eventuell korrigieren
  return n;                                                // R�ckgabewert
  }
   
// Gesamte Eingabe:
// Seiteneffekt aBody, hBody, rho, rho0, fMax, yMax, y, fTotal, fG, fB, l, h, t, yM, ok

function input () {
  aBody = inputNumber(ip1,0,true,1000*AREA_POT,9000*AREA_POT)/10000; // Grundfl�che des Quaders (m�)
  hBody = inputNumber(ip2,1,true,1,10)/100;                // H�he des Quaders (m)
  rho = inputNumber(ip3,1,true,0.1,50)*1000;               // Dichte des Quaders (kg/m�)
  rho0 = inputNumber(ip4,1,true,0.1,50)*1000;              // Dichte der Fl�ssigkeit (kg/m�)
  fMax = MAX_FORCE[ch.selectedIndex];                      // Messbereich der Federwaage (N)
  calcLimit();                                             // Tiefste Mausposition berechnen (yMax)
  calculation(yM);                                         // Berechnungen
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ip1.value = ToString(10000*aBody,0,true);                // Grundfl�che des Quaders (cm�)
  ip2.value = ToString(100*hBody,1,true);                  // H�he des Quaders (cm)
  ip3.value = ToString(rho/1000,1,true);                   // Dichte des Quaders (g/cm�)
  ip4.value = ToString(rho0/1000,1,true);                  // Dichte der Fl�ssigkeit (g/cm�)
  }
  
// Aktualisierung der Ausgabefelder:

function updateOutput () {
  op1.innerHTML = ToString(h*100,2,true);                  // Eintauchtiefe (cm)
  op2.innerHTML = ToString(aBody*h*1000000,0,true);        // Verdr�ngtes Volumen (cm�)
  op3.innerHTML = ToString(fB,2,true);                     // Auftriebskraft (N)
  op4.innerHTML = ToString(fG,2,true);                     // Gewichtskraft (N)
  op5.innerHTML = ToString(fTotal,2,true);                 // Gesamtkraft (N)
  }
  
// Eingabe, Berechnungen, Ausgabe, neu zeichnen:
// Seiteneffekt aBody, hBody, rho, rho0, fMax, yMax, y, fTotal, fG, fB, l, h, t, yM, ok 
   
function reaction () {
  input();                                                 // Eingabe
  calculation(yM);                                         // Berechnungen, abh�ngig von der Mausposition
  updateOutput();                                          // Ausgabe aktualisieren
  paint();                                                 // Neu zeichnen
  }
    
// Berechnung der tiefsten m�glichen Mausposition (yMax):
// Seiteneffekt yMax

function calcLimit () {
  if (rho < rho0) {                                        // Falls Quader auf Fl�ssigkeit schwimmen kann ...
    var hMax = rho*hBody/rho0;                             // Maximale Eintauchtiefe (m)
    var tMax = T0+aBody*hMax/AREA_POT;                     // Maximale Tiefe der Fl�ssigkeit (m)
    var yMin = tMax-hMax+hBody+L0;                         // Tiefstm�gliche Position des Federwaagengriffs (m)
    }
  else {                                                   // Falls Quader vollst�ndig in Fl�ssigkeit eintauchen kann ...
    tMax = T0+aBody*hBody/AREA_POT;                        // Maximale Tiefe der Fl�ssigkeit (m)
    var ff = GRAV_ACCELERATION*aBody*hBody*(rho-rho0);     // Maximale Gesamtkraft (N) 
    var lMax = L0+ff/fMax*L1;                              // Maximale Gesamtl�nge der Federwaage (m)
    yMin = tMax+lMax;                                      // Tiefstm�gliche Position des Federwaagengriffs (m) 
    }
  yMax = height-45-yMin*400;                               // Gr��tm�glicher Wert von yMax (Pixel) bei schwimmendem Quader
  if (rho >= rho0) yMax += 20;                             // Falls vollst�ndiges Eintauchen m�glich, Haken und Schnur ber�cksichtigen
  if (yMax > 1000) yMax = 1000;                            // Zu gro�en Wert von yMax verhindern
  }
  
// Berechnung von Fl�ssigkeitstiefe (t), L�nge der Federwaage (l),
// Eintauchtiefe (h), Auftriebskraft (fB) und Gesamtkraft (fTotal):
// y0 ... Mausposition (Pixel)
// Seiteneffekt y, fTotal, fG, fB, l, h, t, yM, ok

function calculation (y0) {
  var fT0 = fTotal;                                        // Bisherige Gesamtkraft speichern
  var fB0 = fB;                                            // Bisherige Auftriebskraft speichern
  var h0 = h;                                              // Bisherige Eintauchtiefe speichern
  var t0 = t;                                              // Bisherige Fl�ssigkeitstiefe speichern   
  if (y0 > yMax) y0 = yMax;                                // Zu tiefe Position verhindern
  if (y0 < 5) y0 = 5;                                      // Zu hohe Position verhindern
  y = (height-45-y0)/400;                                  // H�he des Mauszeigers �ber dem Gef��boden (m) 
  fG = rho*aBody*hBody*GRAV_ACCELERATION;                  // Gewichtskraft (N)
  l = L0+fG/fMax*L1;                                       // Vorl�ufiger Wert f�r Gesamtl�nge der Federwaage (m) 
  fB = 0;                                                  // Vorl�ufiger Wert f�r Auftriebskraft (N) 
  h = 0;                                                   // Vorl�ufiger Wert f�r Eintauchtiefe (m)
  if (l+hBody+T0 < y) t = T0;                              // Falls Quader nicht eingetaucht, urspr�ngliche Fl�ssigkeitstiefe
  else {                                                   // Andernfalls lineares Gleichungssystem f�r l und h
    var a11 = AREA_POT, a12 = aBody-AREA_POT;              // Koeffizienten der Unbekannten in Gleichung (1)
    var b1 = AREA_POT*(y-hBody-T0);                        // Inhomogener Teil von Gleichung (1)
    var a21 = fMax, a22 = GRAV_ACCELERATION*aBody*rho0*L1; // Koeffizienten der Unbekannten in Gleichung (2)
    var b2 = L0*fMax+rho*aBody*hBody*GRAV_ACCELERATION*L1; // Inhomogener Teil von Gleichung (2)
    var det = a11*a22-a12*a21;                             // Determinante 
    l = (b1*a22-b2*a12)/det;                               // L�nge der Federwaage (m) 
    h = (a11*b2-a21*b1)/det;                               // Eintauchtiefe (m)
    if (h > hBody) h = hBody;                              // Eintauchtiefe bei vollst�ndigem Eintauchen (Quaderh�he)
    fB = rho0*aBody*h*GRAV_ACCELERATION;                   // Auftriebskraft (N) 
    t = y-l-hBody+h;                                       // Tiefe der Fl�ssigkeit (m)
    if (h == hBody) {                                      // Falls Quader vollst�ndig eingetaucht ...
      l = L0+(fG-fB)/fMax*L1;                              // Gesamtl�nge der Federwaage (m) 
      t = T0+aBody*h/AREA_POT;                             // Tiefe der Fl�ssigkeit (m)
      } 
    }
  if (rho < rho0 && y0 == yMax) {                          // Korrektur f�r tiefstm�gliche Position
    fB = fG;                                               // Auftriebskraft (N)
    h = fB/(rho0*aBody*GRAV_ACCELERATION);                 // Eintauchtiefe (m)
    } 
  fTotal = fG-fB;                                          // Gesamtkraft (N)
  if (fTotal <= fMax) {yM = y0; ok = true;}                // Messbereich eingehalten 
  else {                                                   // Messbereich �berschritten
    if (!ok) {fTotal = fT0; fB = fB0; h = h0; t = t0;}     // Notfalls fr�here Werte wiederherstellen
    ok = false;                                            // Flag f�r Einhaltung des Messbereichs                                            
    }
  }
  
//-------------------------------------------------------------------------------------------------
  
// Neuer Pfad mit Standardwerten:
// w ... Liniendicke (optional, Defaultwert 1)

function newPath(w) {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = (w ? w : 1);                             // Liniendicke
  }
  
// Linie zeichnen:
// x1, y1 ... Anfangspunkt
// x2, y2 ... Endpunkt
// c ........ Farbe (optional, Defaultwert schwarz)

function line (x1, y1, x2, y2, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  if (c) ctx.strokeStyle = c;                              // Linienfarbe festlegen, falls angegeben
  ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);                    // Linie vorbereiten
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Ausgef�lltes Rechteck:
// x ... Abstand vom linken Rand (Pixel)
// y ... Abstand vom oberen Rand (Pixel)
// w ... Breite (Pixel)
// h ... H�he (Pixel)
// c ... F�llfarbe
// border ... Flag f�r Rand (optional, Defaultwert false)

function rectangle (x, y, w, h, c, border) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)                            
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausf�llen
  if (border) ctx.strokeRect(x,y,w,h);                     // Falls gew�nscht, Rand zeichnen
  }
  
// Ausgef�llter Kreis:

function circle (x, y, r, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = c;                                       // F�llfarbe
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausf�llen
  }
    
// Gef�� mit Fl�ssigkeit und Unterlage:

function pot () {
  // Innenma�e Gef��: 20 cm x 20 cm x 20 cm
  rectangle(xM-45,height-45,90,5,colorPot);                // Gef��boden
  rectangle(xM-45,height-145,5,100,colorPot);              // Linke Gef��wand
  rectangle(xM+40,height-145,5,100,colorPot);              // Rechte Gef��wand
  var tt = t*400;                                          // Aktuelle Tiefe (Pixel)
  rectangle(xM-40,height-45-tt,80,tt,colorLiquid);         // Fl�ssigkeit
  line(xM-40,height-45-tt,xM+40,height-45-tt);             // Fl�ssigkeitsoberfl�che
  rectangle(xM-160,height-40,320,5,"#000000");             // Tischplatte
  rectangle(xM-140,height-36,280,36,colorBase,true);       // Tisch
  }
  
// Federwaage mit Last (senkrecht):
// gx, gy ... Mittelpunkt des Griffs (Pixel)
// part ..... Bruchteil der maximal zul�ssigen Kraft
 
function springscale (gx, gy, part) {
  circle(gx,gy,5,"#000000");                               // �u�erer Kreis f�r Griff
  circle(gx,gy,3,colorBackground);                         // Innerer Kreis f�r Griff
  for (var i=Math.floor(10-part*10); i<10; i++) {          // F�r alle sichtbaren Felder der Skala ...
    var y = gy+15+(i+part*10)*4;                           // Oberes Ende (Pixel)
    var c = (i%2==0 ? colorSpringscale1 : colorSpringscale2); // F�llfarbe
    rectangle(gx-3,y,6,4,c,true);                          // Ausgef�lltes Rechteck
    }
  var l = part*40+40+15;                                   // Abstand zwischen Griffmittelpunkt und Hakenanfang (Pixel)
  line(gx,gy+l,gx,gy+l+3);                                 // Gerader Teil des Hakens
  newPath(1.5);                                            // Neuer Grafikpfad
  ctx.arc(gx,gy+l+6,3,1.5*Math.PI,0,true);                 // Kreisbogen f�r Haken vorbereiten
  ctx.stroke();                                            // Kreisbogen f�r Haken zeichnen
  rectangle(gx-5,gy+5,10,50,colorSpringscale,true);        // Geh�use
  line(gx,gy+l+10,gx,gy+l+20);                             // Schnur
  var dx = Math.sqrt(aBody)*200;                           // Halbe Breite der Last (Pixel)
  var dy = hBody*400;                                      // H�he der Last (Pixel)
  rectangle(gx-dx,gy+l+20,2*dx,dy,colorBody,true);         // Last
  }

// Grafikausgabe:
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausf�llen
  pot();                                                   // Gef�� mit Fl�ssigkeit, Unterlage
  springscale(xM,yM,(ok?fTotal/fMax:1));                   // Federwaage mit Last
  if (ok) return;                                          // Falls Federwaage nicht �berbelastet, abbrechen
  ctx.font = FONT;                                         // Zeichensatz
  ctx.fillStyle = "#ff0000";                               // Schriftfarbe (rot)
  ctx.textAlign = "left";                                  // Textausrichtung linksb�ndig
  ctx.fillText(text11,20,20);                              // Warnmeldung (Messbereich �berschritten)
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der HTML-Seite Startmethode ausf�hren


