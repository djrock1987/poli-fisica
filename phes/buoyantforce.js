// Auftriebskraft in Flüssigkeiten
// Java-Applet (19.04.1998) umgewandelt
// 09.11.2015 - 11.11.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind in einer eigenen Datei (zum Beispiel buoyantforce_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorPot = "#0000ff";                                  // Farbe für Gefäß
var colorLiquid = "#00ffff";                               // Farbe für Flüssigkeit
var colorBody = "#c06040";                                 // Farbe für Quader
var colorBase = "#ffc800";                                 // Farbe für Unterlage
var colorSpringscale = "#0000ff";                          // Farbe für Gehäuse der Federwaage
var colorSpringscale1 = "#ffffff";                         // Farbe für Skala der Federwaage
var colorSpringscale2 = "#ff0000";                         // Farbe für Skala der Federwaage

// Sonstige Konstanten:

var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz
var MAX_FORCE = [                                          // Messbereiche der Federwaage (N)
  2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
var GRAV_ACCELERATION = 9.81;                              // Fallbeschleunigung (m/s²)
var AREA_POT = 0.04;                                       // Grundfläche des Gefäßes (m²)
var T0 = 0.15;                                             // Ursprüngliche Tiefe der Flüssigkeit (m)
var L0 = 0.1875;                                           // Minimale Länge der Federwaage (m)
var L1 = 0.1;                                              // Maximale Verlängerung der Federwaage (m)

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var ip1, ip2, ip3, ip4;                                    // Eingabefelder
var op1, op2, op3, op4, op5;                               // Ausgabefelder
var ch;                                                    // Auswahlfeld (Messbereich)
var drag;                                                  // Flag für Zugmodus

var xM, yM;                                                // Mausposition (Pixel)
var aBody;                                                 // Grundfläche des Quaders (m²)
var hBody;                                                 // Höhe des Quaders (m)
var rho;                                                   // Dichte des Quaders (kg/m³)
var fG;                                                    // Gewicht des Quaders (N)
var h;                                                     // Eintauchtiefe (m)
var t;                                                     // Aktuelle Tiefe der Flüssigkeit (m)
var rho0;                                                  // Dichte der Flüssigkeit (kg/m³)
var fB;                                                    // Auftriebskraft (N)
var fTotal;                                                // Gesamtkraft (N)
var fMax;                                                  // Maximalkraft für Federwaage (N)
var ok;                                                    // Flag (Belastung in Ordnung)
var l;                                                     // Aktuelle Länge der Federwaage (m)
var y;                                                     // Höhe des Mauszeigers über Gefäßboden (m)
var yMax;                                                  // Maximales y (Pixel)

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
  getElement("ip1a",text01);                               // Erklärender Text (Grundfläche)
  ip1 = getElement("ip1b");                                // Eingabefeld (Grundfläche)
  getElement("ip1c",centimeter2);                          // Einheit (Grundfläche)
  getElement("ip2a",text02);                               // Erklärender Text (Höhe)
  ip2 = getElement("ip2b");                                // Eingabefeld (Höhe)
  getElement("ip2c",centimeter);                           // Einheit (Höhe)
  getElement("ip3a",text03);                               // Erklärender Text (Dichte Quader)
  ip3 = getElement("ip3b");                                // Eingabefeld (Dichte Quader)
  getElement("ip3c",gramPerCentimeter3);                   // Einheit (Dichte Quader)
  getElement("ip4a",text04);                               // Erklärender Text (Dichte Flüssigkeit)
  ip4 = getElement("ip4b");                                // Eingabefeld (Dichte Flüssigkeit)
  getElement("ip4c",gramPerCentimeter3);                   // Einheit (Dichte Flüssigkeit)
  getElement("op1a",text05);                               // Erklärender Text (Eintauchtiefe)
  op1 = getElement("op1b");                                // Ausgabefeld (Eintauchtiefe)
  getElement("op1c",centimeter);                           // Einheit (Eintauchtiefe)
  getElement("op2a",text06);                               // Erklärender Text (verdrängtes Volumen)
  op2 = getElement("op2b");                                // Ausgabefeld (verdrängtes Volumen)
  getElement("op2c",centimeter3);                          // Einheit (verdrängtes Volumen)
  getElement("op3a",text07);                               // Erklärender Text (Auftriebskraft)
  op3 = getElement("op3b");                                // Ausgabefeld (Auftriebskraft)
  getElement("op3c",newton);                               // Einheit (Auftriebskraft)
  getElement("op4a",text08);                               // Erklärender Text (Gewichtskraft)
  op4 = getElement("op4b");                                // Ausgabefeld (Gewichtskraft)
  getElement("op4c",newton);                               // Einheit (Gewichtskraft)
  getElement("op5a",text09);                               // Erklärender Text (Gesamtkraft)
  op5 = getElement("op5b");                                // Ausgabefeld (Gesamtkraft)
  getElement("op5c",newton);                               // Einheit (Gesamtkraft)
  getElement("MRa",text10);                                // Erklärender Text (Messbereich Federwaage)
  ch = getElement("MRb");                                  // Auswahlfeld (Messbereich Federwaage)
  initSelect();                                            // Auswahlfeld vorbereiten
  getElement("MRc",newton);                                // Einheit (Messbereich Federwaage)
  getElement("author",author);                             // Autor (und Übersetzer)
  
  ok = true;                                               // Messbereich der Federwaage nicht überschritten
  xM = width/2; yM = 50;                                   // Mausposition (Pixel)
  aBody = 0.01;                                            // Grundfläche des Quaders (m²)
  hBody = 0.05;                                            // Höhe des Quaders (m)
  rho = 3000;                                              // Dichte des Quaders (kg/m³)
  rho0 = 1000;                                             // Dichte der Flüssigkeit (kg/m³)
  t = T0;                                                  // Tiefe der Flüssigkeit (m)
  fMax = 20;                                               // Maximal zulässige Kraft (N)
  calcLimit();                                             // Berechnung von yMax (Pixel)                                             
  drag = false;                                            // Zugmodus zunächst deaktiviert
  
  updateInput();                                           // Eingabefelder aktualisieren
  reaction();                                              // Berechnungen, Ausgabe, Zeichnen
  
  ip1.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Grundfläche)
  ip2.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Höhe)
  ip3.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Dichte des Quaders)
  ip4.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Dichte der Flüssigkeit)
  ch.onchange = reaction;                                  // Reaktion auf Auswahl des Messbereichs

  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Drücken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Berührung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Berührung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers        
  }
  
// Initialisierung des Auswahlfelds:

function initSelect () {
  for (var i=0; i<MAX_FORCE.length; i++) {                 // Für alle Messbereiche der Federwaage ...
    var o = document.createElement("option");              // Neues option-Element
    o.text = ""+MAX_FORCE[i];                              // Messbereich als Text
    ch.add(o);                                             // option-Element hinzufügen
    }
  ch.selectedIndex = 6;                                    // Voreingestellter Index (entspricht 20 N)
  }

// Reaktion auf Drücken der Maustaste:
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen (Auswahl)                    
  }
  
// Reaktion auf Berührung:
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Berührpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen (Auswahl)
  if (drag) e.preventDefault();                            // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Loslassen der Maustaste:
  
function reactionMouseUp (e) {                                             
  drag = false;                                            // Zugmodus deaktivieren                             
  }
  
// Reaktion auf Ende der Berührung:
  
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
  
// Hilfsroutine: Reaktion auf Mausklick oder Berühren mit dem Finger (Auswahl):
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt drag 

function reactionDown (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel)
  if (Math.abs(u-xM) < 50) drag = true;                    // Falls Position in der Mitte, Zugmodus aktivieren  
  }
  
// Reaktion auf Bewegung von Maus oder Finger (Änderung):
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt yM, aBody, hBody, rho, rho0, fMax, yMax, y, fTotal, fG, fB, l, h, t, ok

function reactionMove (u, v) {
  if (!drag) return;                                       // Falls kein Zugmodus, abbrechen
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel)
  yM = v;                                                  // Mausposition aktualisieren 
  reaction();                                              // Eingabe, Berechnungen, Ausgabe, neu zeichnen
  }
      
// Reaktion auf Tastendruck (nur auf Enter-Taste):
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten übernehmen, rechnen, Ausgabe, neu zeichnen                          
  }
  
//-------------------------------------------------------------------------------------------------

// Umwandlung einer Zahl in eine Zeichenkette:
// n ..... Gegebene Zahl
// d ..... Zahl der Stellen
// fix ... Flag für Nachkommastellen (im Gegensatz zu gültigen Ziffern)

function ToString (n, d, fix) {
  var s = (fix ? n.toFixed(d) : n.toPrecision(d));         // Zeichenkette mit Dezimalpunkt
  if (n == 1000) s = "1000";                               // Ausnahme, um "1,00e+3" zu verhindern
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
// Seiteneffekt aBody, hBody, rho, rho0, fMax, yMax, y, fTotal, fG, fB, l, h, t, yM, ok

function input () {
  aBody = inputNumber(ip1,0,true,1000*AREA_POT,9000*AREA_POT)/10000; // Grundfläche des Quaders (m²)
  hBody = inputNumber(ip2,1,true,1,10)/100;                // Höhe des Quaders (m)
  rho = inputNumber(ip3,1,true,0.1,50)*1000;               // Dichte des Quaders (kg/m³)
  rho0 = inputNumber(ip4,1,true,0.1,50)*1000;              // Dichte der Flüssigkeit (kg/m³)
  fMax = MAX_FORCE[ch.selectedIndex];                      // Messbereich der Federwaage (N)
  calcLimit();                                             // Tiefste Mausposition berechnen (yMax)
  calculation(yM);                                         // Berechnungen
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ip1.value = ToString(10000*aBody,0,true);                // Grundfläche des Quaders (cm²)
  ip2.value = ToString(100*hBody,1,true);                  // Höhe des Quaders (cm)
  ip3.value = ToString(rho/1000,1,true);                   // Dichte des Quaders (g/cm³)
  ip4.value = ToString(rho0/1000,1,true);                  // Dichte der Flüssigkeit (g/cm³)
  }
  
// Aktualisierung der Ausgabefelder:

function updateOutput () {
  op1.innerHTML = ToString(h*100,2,true);                  // Eintauchtiefe (cm)
  op2.innerHTML = ToString(aBody*h*1000000,0,true);        // Verdrängtes Volumen (cm³)
  op3.innerHTML = ToString(fB,2,true);                     // Auftriebskraft (N)
  op4.innerHTML = ToString(fG,2,true);                     // Gewichtskraft (N)
  op5.innerHTML = ToString(fTotal,2,true);                 // Gesamtkraft (N)
  }
  
// Eingabe, Berechnungen, Ausgabe, neu zeichnen:
// Seiteneffekt aBody, hBody, rho, rho0, fMax, yMax, y, fTotal, fG, fB, l, h, t, yM, ok 
   
function reaction () {
  input();                                                 // Eingabe
  calculation(yM);                                         // Berechnungen, abhängig von der Mausposition
  updateOutput();                                          // Ausgabe aktualisieren
  paint();                                                 // Neu zeichnen
  }
    
// Berechnung der tiefsten möglichen Mausposition (yMax):
// Seiteneffekt yMax

function calcLimit () {
  if (rho < rho0) {                                        // Falls Quader auf Flüssigkeit schwimmen kann ...
    var hMax = rho*hBody/rho0;                             // Maximale Eintauchtiefe (m)
    var tMax = T0+aBody*hMax/AREA_POT;                     // Maximale Tiefe der Flüssigkeit (m)
    var yMin = tMax-hMax+hBody+L0;                         // Tiefstmögliche Position des Federwaagengriffs (m)
    }
  else {                                                   // Falls Quader vollständig in Flüssigkeit eintauchen kann ...
    tMax = T0+aBody*hBody/AREA_POT;                        // Maximale Tiefe der Flüssigkeit (m)
    var ff = GRAV_ACCELERATION*aBody*hBody*(rho-rho0);     // Maximale Gesamtkraft (N) 
    var lMax = L0+ff/fMax*L1;                              // Maximale Gesamtlänge der Federwaage (m)
    yMin = tMax+lMax;                                      // Tiefstmögliche Position des Federwaagengriffs (m) 
    }
  yMax = height-45-yMin*400;                               // Größtmöglicher Wert von yMax (Pixel) bei schwimmendem Quader
  if (rho >= rho0) yMax += 20;                             // Falls vollständiges Eintauchen möglich, Haken und Schnur berücksichtigen
  if (yMax > 1000) yMax = 1000;                            // Zu großen Wert von yMax verhindern
  }
  
// Berechnung von Flüssigkeitstiefe (t), Länge der Federwaage (l),
// Eintauchtiefe (h), Auftriebskraft (fB) und Gesamtkraft (fTotal):
// y0 ... Mausposition (Pixel)
// Seiteneffekt y, fTotal, fG, fB, l, h, t, yM, ok

function calculation (y0) {
  var fT0 = fTotal;                                        // Bisherige Gesamtkraft speichern
  var fB0 = fB;                                            // Bisherige Auftriebskraft speichern
  var h0 = h;                                              // Bisherige Eintauchtiefe speichern
  var t0 = t;                                              // Bisherige Flüssigkeitstiefe speichern   
  if (y0 > yMax) y0 = yMax;                                // Zu tiefe Position verhindern
  if (y0 < 5) y0 = 5;                                      // Zu hohe Position verhindern
  y = (height-45-y0)/400;                                  // Höhe des Mauszeigers über dem Gefäßboden (m) 
  fG = rho*aBody*hBody*GRAV_ACCELERATION;                  // Gewichtskraft (N)
  l = L0+fG/fMax*L1;                                       // Vorläufiger Wert für Gesamtlänge der Federwaage (m) 
  fB = 0;                                                  // Vorläufiger Wert für Auftriebskraft (N) 
  h = 0;                                                   // Vorläufiger Wert für Eintauchtiefe (m)
  if (l+hBody+T0 < y) t = T0;                              // Falls Quader nicht eingetaucht, ursprüngliche Flüssigkeitstiefe
  else {                                                   // Andernfalls lineares Gleichungssystem für l und h
    var a11 = AREA_POT, a12 = aBody-AREA_POT;              // Koeffizienten der Unbekannten in Gleichung (1)
    var b1 = AREA_POT*(y-hBody-T0);                        // Inhomogener Teil von Gleichung (1)
    var a21 = fMax, a22 = GRAV_ACCELERATION*aBody*rho0*L1; // Koeffizienten der Unbekannten in Gleichung (2)
    var b2 = L0*fMax+rho*aBody*hBody*GRAV_ACCELERATION*L1; // Inhomogener Teil von Gleichung (2)
    var det = a11*a22-a12*a21;                             // Determinante 
    l = (b1*a22-b2*a12)/det;                               // Länge der Federwaage (m) 
    h = (a11*b2-a21*b1)/det;                               // Eintauchtiefe (m)
    if (h > hBody) h = hBody;                              // Eintauchtiefe bei vollständigem Eintauchen (Quaderhöhe)
    fB = rho0*aBody*h*GRAV_ACCELERATION;                   // Auftriebskraft (N) 
    t = y-l-hBody+h;                                       // Tiefe der Flüssigkeit (m)
    if (h == hBody) {                                      // Falls Quader vollständig eingetaucht ...
      l = L0+(fG-fB)/fMax*L1;                              // Gesamtlänge der Federwaage (m) 
      t = T0+aBody*h/AREA_POT;                             // Tiefe der Flüssigkeit (m)
      } 
    }
  if (rho < rho0 && y0 == yMax) {                          // Korrektur für tiefstmögliche Position
    fB = fG;                                               // Auftriebskraft (N)
    h = fB/(rho0*aBody*GRAV_ACCELERATION);                 // Eintauchtiefe (m)
    } 
  fTotal = fG-fB;                                          // Gesamtkraft (N)
  if (fTotal <= fMax) {yM = y0; ok = true;}                // Messbereich eingehalten 
  else {                                                   // Messbereich überschritten
    if (!ok) {fTotal = fT0; fB = fB0; h = h0; t = t0;}     // Notfalls frühere Werte wiederherstellen
    ok = false;                                            // Flag für Einhaltung des Messbereichs                                            
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
  
// Ausgefülltes Rechteck:
// x ... Abstand vom linken Rand (Pixel)
// y ... Abstand vom oberen Rand (Pixel)
// w ... Breite (Pixel)
// h ... Höhe (Pixel)
// c ... Füllfarbe
// border ... Flag für Rand (optional, Defaultwert false)

function rectangle (x, y, w, h, c, border) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)                            
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.fillRect(x,y,w,h);                                   // Rechteck ausfüllen
  if (border) ctx.strokeRect(x,y,w,h);                     // Falls gewünscht, Rand zeichnen
  }
  
// Ausgefüllter Kreis:

function circle (x, y, r, c) {
  newPath();                                               // Neuer Grafikpfad (Standardwerte)
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.arc(x,y,r,0,2*Math.PI,true);                         // Kreis vorbereiten
  ctx.fill();                                              // Kreis ausfüllen
  }
    
// Gefäß mit Flüssigkeit und Unterlage:

function pot () {
  // Innenmaße Gefäß: 20 cm x 20 cm x 20 cm
  rectangle(xM-45,height-45,90,5,colorPot);                // Gefäßboden
  rectangle(xM-45,height-145,5,100,colorPot);              // Linke Gefäßwand
  rectangle(xM+40,height-145,5,100,colorPot);              // Rechte Gefäßwand
  var tt = t*400;                                          // Aktuelle Tiefe (Pixel)
  rectangle(xM-40,height-45-tt,80,tt,colorLiquid);         // Flüssigkeit
  line(xM-40,height-45-tt,xM+40,height-45-tt);             // Flüssigkeitsoberfläche
  rectangle(xM-160,height-40,320,5,"#000000");             // Tischplatte
  rectangle(xM-140,height-36,280,36,colorBase,true);       // Tisch
  }
  
// Federwaage mit Last (senkrecht):
// gx, gy ... Mittelpunkt des Griffs (Pixel)
// part ..... Bruchteil der maximal zulässigen Kraft
 
function springscale (gx, gy, part) {
  circle(gx,gy,5,"#000000");                               // Äußerer Kreis für Griff
  circle(gx,gy,3,colorBackground);                         // Innerer Kreis für Griff
  for (var i=Math.floor(10-part*10); i<10; i++) {          // Für alle sichtbaren Felder der Skala ...
    var y = gy+15+(i+part*10)*4;                           // Oberes Ende (Pixel)
    var c = (i%2==0 ? colorSpringscale1 : colorSpringscale2); // Füllfarbe
    rectangle(gx-3,y,6,4,c,true);                          // Ausgefülltes Rechteck
    }
  var l = part*40+40+15;                                   // Abstand zwischen Griffmittelpunkt und Hakenanfang (Pixel)
  line(gx,gy+l,gx,gy+l+3);                                 // Gerader Teil des Hakens
  newPath(1.5);                                            // Neuer Grafikpfad
  ctx.arc(gx,gy+l+6,3,1.5*Math.PI,0,true);                 // Kreisbogen für Haken vorbereiten
  ctx.stroke();                                            // Kreisbogen für Haken zeichnen
  rectangle(gx-5,gy+5,10,50,colorSpringscale,true);        // Gehäuse
  line(gx,gy+l+10,gx,gy+l+20);                             // Schnur
  var dx = Math.sqrt(aBody)*200;                           // Halbe Breite der Last (Pixel)
  var dy = hBody*400;                                      // Höhe der Last (Pixel)
  rectangle(gx-dx,gy+l+20,2*dx,dy,colorBody,true);         // Last
  }

// Grafikausgabe:
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  pot();                                                   // Gefäß mit Flüssigkeit, Unterlage
  springscale(xM,yM,(ok?fTotal/fMax:1));                   // Federwaage mit Last
  if (ok) return;                                          // Falls Federwaage nicht überbelastet, abbrechen
  ctx.font = FONT;                                         // Zeichensatz
  ctx.fillStyle = "#ff0000";                               // Schriftfarbe (rot)
  ctx.textAlign = "left";                                  // Textausrichtung linksbündig
  ctx.fillText(text11,20,20);                              // Warnmeldung (Messbereich überschritten)
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Nach dem Laden der HTML-Seite Startmethode ausführen


