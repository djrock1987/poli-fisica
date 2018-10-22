// Zerlegung einer Kraft in zwei Komponenten
// Java-Applet (30.05.2003) umgewandelt
// 31.08.2014 - 10.09.2015

// ****************************************************************************
// * Autor: Walter Fendt (www.walter-fendt.de)                                *
// * Dieses Programm darf - auch in veränderter Form - für nicht-kommerzielle *
// * Zwecke verwendet und weitergegeben werden, solange dieser Hinweis nicht  *
// * entfernt wird.                                                           *
// **************************************************************************** 

// Sprachabhängige Texte sind in einer eigenen Datei (zum Beispiel forceresolution_de.js) abgespeichert.

// Farben:

var colorBackground = "#ffff00";                           // Hintergrundfarbe
var colorBody = "#ffffff";                                 // Farbe für Körper
var colorForce = "#c000c0";                                // Farbe für gegebene Kraft
var colorComp1 = "#0000ff";                                // Farbe für erste Komponente
var colorComp2 = "#ff0000";                                // Farbe für zweite Komponente
var colorAngle1 = "#8080ff";                               // Farbe für ersten Winkel
var colorAngle2 = "#ff8080";                               // Farbe für zweiten Winkel

// Sonstige Konstanten:

var PI2 = 2*Math.PI;                                       // Abkürzung 2 pi
var DEG = Math.PI/180;                                     // Winkelgrad
var FONT = "normal normal bold 12px sans-serif";           // Zeichensatz

// Attribute:

var canvas, ctx;                                           // Zeichenfläche, Grafikkontext
var width, height;                                         // Abmessungen der Zeichenfläche (Pixel)
var ipF, ipA1, ipA2;                                       // Eingabefelder (Kraftbetrag in N, Winkel in Grad)
var opF1, opF2;                                            // Ausgabefelder (Komponenten in N)
var bu1, bu2;                                              // Schaltknöpfe
var active;                                                // Flag für Zugmodus
var nr;                                                    // Nummer für Mausereignisse  
var on;                                                    // Flag für Animation
var t0;                                                    // Anfangszeitpunkt
var t;                                                     // Aktuelle Zeit (s)
var pix;                                                   // Umrechnungsfaktor (Pixel pro N)
var force0;                                                // Vergleichskraft (N)
var f;                                                     // Gegebener Kraftbetrag (N)
var alpha, beta;                                           // Winkel (Bogenmaß)
var f1, f2;                                                // Kraftkomponenten (N)
var x0, y0;                                                // Position Körper (Pixel)
var phi0, phi1, phi2;                                      // Richtungen von Kraft und Komponenten (Bogenmaß) 
var ready1, ready2;                                        // Flags für Ausführung der Konstruktionsschritte

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
  getElement("ipFa",text01);                               // Erklärender Text (Kraftbetrag, erste Zeile)
  getElement("ipFb",text02);                               // Erklärender Text (Kraftbetrag, zweite Zeile)
  ipF = getElement("ipFc");                                // Eingabefeld (Kraftbetrag)
  ipF.focus();                                             // Fokus für dieses Eingabefeld
  getElement("ipFd",newton);                               // Einheit (Kraftbetrag)
  getElement("angles",text03);                             // Erklärender Text (Winkelgrößen)
  getElement("ipA1a",text04);                              // Erklärender Text (1. Winkel)
  ipA1 = getElement("ipA1b");                              // Eingabefeld (1. Winkel)
  getElement("ipA1c",degree);                              // Einheit (1. Winkel)
  getElement("ipA2a",text05);                              // Erklärender Text (2. Winkel)
  ipA2 = getElement("ipA2b");                              // Eingabefeld (2. Winkel)
  getElement("ipA2c",degree);                              // Einheit (2. Winkel)
  getElement("components",text06);                         // Erklärender Text (Beträge der Kraftkomponenten)
  getElement("opF1a",text07);                              // Erklärender Text (1. Komponente)          
  opF1 = getElement("opF1b");                              // Ausgabefeld (1. Komponente)
  getElement("opF1c",newton);                              // Einheit (1. Komponente)
  getElement("opF2a",text08);                              // Erklärender Text (2. Komponente)
  opF2 = getElement("opF2b");                              // Ausgabefeld (2. Komponente)
  getElement("opF2c",newton);                              // Einheit (2. Komponente)
  bu1 = getElement("bu1",text09);                          // Erster Schaltknopf (Konstruieren)
  bu2 = getElement("bu2",text10);                          // Zweiter Schaltknopf (Löschen)
  getElement("author",author);                             // Autor
  getElement("translator",translator);                     // Übersetzer
  
  on = false;                                              // Animation abgeschaltet
  ready1 = ready2 = false;                                 // Komponenten noch nicht konstruiert
  pix = 50;                                                // 50 Pixel pro N 
  force0 = 1;                                              // Vergleichskraft 1 N
  f = 5;                                                   // Gegebener Kraftbetrag (N)
  x0 = 50; y0 = height/2;                                  // Position Körper (Pixel)
  phi0 = 0;                                                // Kraftrichtung (Bogenmaß, nach rechts)
  alpha = 20*DEG; beta = 40*DEG;                           // Gegebene Winkel (Bogenmaß)
  updateInput();                                           // Eingabefelder aktualisieren
  calculation();                                           // Berechnungen
  updateOutput();                                          // Ausgabefelder aktualisieren
  paint();                                                 // Zeichnen
  t0 = new Date();                                         // Aktuelle Zeit
  setInterval(paint,40);                                   // Timer-Intervall 0,040 s
  
  ipF.onkeydown = reactionEnter;                           // Reaktion auf Enter-Taste (Eingabe Kraftbetrag)
  ipA1.onkeydown = reactionEnter;                          // Reaktion auf Enter-Taste (Eingabe 1. Winkel)
  ipA2.onkeydown = reactionEnter;                          // Reaktion auf Enter-Taste (Eingabe 2. Winkel)
  bu1.onclick = reactionButton1;                           // Reaktion auf ersten Schaltknopf (Konstruieren)
  bu2.onclick = reactionButton2;                           // Reaktion auf zweiten Schaltknopf (Löschen)
  canvas.onmousedown = reactionMouseDown;                  // Reaktion auf Drücken der Maustaste
  canvas.ontouchstart = reactionTouchStart;                // Reaktion auf Berührung  
  canvas.onmouseup = reactionMouseUp;                      // Reaktion auf Loslassen der Maustaste
  canvas.ontouchend = reactionTouchEnd;                    // Reaktion auf Ende der Berührung
  canvas.onmousemove = reactionMouseMove;                  // Reaktion auf Bewegen der Maus      
  canvas.ontouchmove = reactionTouchMove;                  // Reaktion auf Bewegen des Fingers        
  }

// Reaktion auf Drücken der Maustaste:
  
function reactionMouseDown (e) {        
  reactionDown(e.clientX,e.clientY);                       // Hilfsroutine aufrufen (Auswahl)                    
  }
  
// Reaktion auf Berührung:
  
function reactionTouchStart (e) {      
  var obj = e.changedTouches[0];                           // Liste der Berührpunkte
  reactionDown(obj.clientX,obj.clientY);                   // Hilfsroutine aufrufen (Auswahl)
  if (active) e.preventDefault();                          // Falls Zugmodus aktiviert, Standardverhalten verhindern
  }
  
// Reaktion auf Loslassen der Maustaste:
  
function reactionMouseUp (e) {                                             
  active = false;                                          // Zugmodus deaktivieren                             
  }
  
// Reaktion auf Ende der Berührung:
  
function reactionTouchEnd (e) {             
  active = false;                                          // Zugmodus deaktivieren
  }
  
// Reaktion auf Bewegen der Maus:
  
function reactionMouseMove (e) {            
  if (!active) return;                                     // Abbrechen, falls Zugmodus nicht aktiviert
  reactionMove(e.clientX,e.clientY);                       // Position ermitteln, rechnen und neu zeichnen
  }
  
// Reaktion auf Bewegung des Fingers:
  
function reactionTouchMove (e) {            
  if (!active) return;                                     // Abbrechen, falls Zugmodus nicht aktiviert
  var obj = e.changedTouches[0];                           // Liste der neuen Fingerpositionen     
  reactionMove(obj.clientX,obj.clientY);                   // Position ermitteln, rechnen und neu zeichnen
  e.preventDefault();                                      // Standardverhalten verhindern                          
  }  
  
// Hilfsroutine: Reaktion auf Mausklick oder Berühren mit dem Finger (Auswahl):
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt active, nr

function reactionDown (u, v) {
  active = true;                                           // Zugmodus aktivieren
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel)  
  var tol1 = 0.05;                                         // Maximale Winkelabweichung (Bogenmaß)
  var tol2 = 10;                                           // Maximale Längenabweichung (Pixel)
  var dx = u-x0, dy = v-y0;                                // Koordinaten des Verbindungsvektors (Pixel)
  var r = Math.sqrt(dx*dx+dy*dy);                          // Abstand zum Angriffspunkt (Pixel)
  if (r < tol2) {nr = 1; return;}                          // Falls Abstand klein, Angriffspunkt ändern
  var phi = Math.atan2(-dy,dx);                            // Winkel gegenüber waagrechter Achse (Bogenmaß)
  var dphi = Math.abs(diffAngle(phi,phi0));                // Winkelabweichung zur Kraftrichtung (Betrag, Bogenmaß) 	
  if (dphi < tol1 && r < f*pix+tol2) {                     // Falls Winkelabweichung klein und Abstand zum Angriffspunkt nicht zu groß ...
    nr = 2; return;                                        // ... Pfeilspitze ändern
    }
  dphi = Math.abs(diffAngle(phi,phi1));                    // Winkelabweichung zur Richtung der ersten Komponente (Betrag, Bogenmaß)
  if (dphi < tol1) {                                       // Falls Winkelabweichung gering ...
    nr = 3; return;                                        // ... Richtung der ersten Komponente ändern
    }
  dphi = Math.abs(diffAngle(phi,phi2));                    // Winkelabweichung zur Richtung der zweiten Komponente (Betrag, Bogenmaß)
  if (dphi < tol1) {                                       // Falls Winkelabweichung gering ...
    nr = 4; return;                                        // Richtung der zweiten Komponente ändern 
    }
  nr = 0; active = false;                                  // Position nicht sinnvoll
  }
  
// Reaktion auf Bewegung von Maus oder Finger (Änderung):
// u, v ... Bildschirmkoordinaten bezüglich Viewport
// Seiteneffekt x0, y0, f, phi0

function reactionMove (u, v) {
  var re = canvas.getBoundingClientRect();                 // Lage der Zeichenfläche bezüglich Viewport
  u -= re.left; v -= re.top;                               // Koordinaten bezüglich Zeichenfläche (Pixel)
  var xM = u, yM = v;                                      // Mausposition übernehmen
  if (xM < 10) xM = 10;                                    // Falls zu weit links, korrigieren
  if (xM > width-10) xM = width-10;                        // Falls zu weit rechts, korrigieren 
  if (yM < 10) yM = 10;                                    // Falls zu weit oben, korrigieren
  if (yM > height-10) yM = height-10;                      // Falls zu weit unten, korrigieren
  var dx = xM-x0, dy = yM-y0;                              // Verbindungsvektor
  switch (nr) {                                            // Fallunterscheidung
    case 1:                                                // 1. Fall: Angriffspunkt ändern
      x0 = xM; y0 = yM;                                    // Neue Position
      break;
    case 2:                                                // 2. Fall: Gegebene Kraft ändern
      f = Math.sqrt(dx*dx+dy*dy)/pix;                      // Neuer Kraftbetrag (N)              
      if (f > 1000) f = 1000;                              // Falls zu groß, korrigieren
      if (f < 0.001) f = 0.001;                            // Falls zu klein, korrigieren
      phi0 = Math.atan2(-dy,dx);                           // Neuer Richtungswinkel (Bogenmaß)
      break; 
    case 3:                                                // 3. Fall: Richtung der ersten Komponente ändern
  	  var phi = Math.atan2(-dy,dx);                        // Neuer Richtungswinkel (Bogenmaß)
  	  alpha = diffAngle(phi0,phi);                         // Neuer Winkel zwischen Kraft und erster Komponente (Bogenmaß)
  	  if (alpha < 0) alpha += PI2;                         // Falls negativ, korrigieren
  	  var dir = compare(phi,phi1);                         // Vergleich mit dem bisherigen Richtungswinkel
  	  if (dir > 0 && compare(phi,phi0) >= 0) {             // Falls Angriffslinie im Gegenuhrzeigersinn überschritten wird ...
  	    alpha = DEG; phi0 = phi+alpha;                     // ... Winkel gleich 1° setzen und Kraftrichtung anpassen
  	    }
  	  if (dir < 0 && compare(phi,phi0+beta-179*DEG) < 0) { // Falls Angriffslinie im Uhrzeigersinn überschritten wird ...
  	    if (alpha > 179*DEG) alpha = 179*DEG;              // ... Winkel gleich 179° setzen
  	    phi0 = phi+alpha;                                  // ... Kraftrichtung anpassen 	      
  	    beta = 179*DEG-alpha;                              // ... Winkel zwischen Kraft und zweiter Komponente anpassen 
  	    }
  	  break;  	 
    case 4:                                                // 4. Fall: Richtung der zweiten Komponente ändern
      phi = Math.atan2(-dy,dx);                            // Neuer Richtungswinkel (Bogenmaß)
      beta = diffAngle(phi,phi0);                          // Neuer Winkel zwischen Kraft und zweiter Komponente (Bogenmaß)
      if (beta < 0) beta += PI2;                           // Falls negativ, korrigieren
      dir = compare(phi,phi2);                             // Vergleich mit dem bisherigen Richtungswinkel
      if (dir < 0 && compare(phi,phi0) <= 0) {             // Falls Angriffslinie im Uhrzeigersinn überschritten wird ...
        beta = DEG; phi0 = phi-beta;                       // ... Winkel gleich 1° setzen und Kraftrichtung anpassen
        }
      if (dir > 0 && compare(phi,phi0-alpha+179*DEG) > 0) {// Falls Angriffslinie im Gegenuhrzeigersinn überschritten wird ...
        if (beta > 179*DEG) beta = 179*DEG;                // ... Winkel gleich 179° setzen
        phi0 = phi-beta;                                   // ... Kraftrichtung anpassen
        alpha = 179*DEG-beta;                              // ... Winkel zwischen Kraft und erster Komponente anpassen
        }
      break;  	       
      } // Ende switch
  if (nr > 1) {                                            // Falls Änderung bei Kraft und Komponenten ...
    calculation();                                         // ... Berechnungen durchführen
    updateInputOutput();                                   // ... Ein- und Ausgabefelder aktualisieren
    }    
  paint();                                                 // Neu zeichnen
  }
    
// Hilfsroutine: Eingabe übernehmen und rechnen
// Seiteneffekt f, alpha, beta, f1, f2, phi1, phi2, force0, pix

function reaction () {
  ready1 = ready2 = false;                                 // Konstruktionsschritte noch nicht abgeschlossen
  input();                                                 // Eingegebene Werte übernehmen (eventuell korrigiert)
  calculation();                                           // Berechnungen (f1, f2, phi1, phi2)
  setPix();                                                // Aktualisierung von Vergleichskraft und Umrechnungsfaktor
  }
  
// Reaktion auf ersten Schaltknopf (Konstruieren):
// Seiteneffekt on, t0, f, alpha, beta, f1, f2, phi1, phi2, force0, pix
  
function reactionButton1 () {
  on = true;                                               // Animation anschalten
  t0 = new Date();                                         // Anfangszeit der Animation
  reaction();                                              // Eingaben übernehmen und rechnen
  }

// Reaktion auf zweiten Schaltknopf (Löschen):
// Seiteneffekt on, t, f, alpha, beta, f1, f2, phi1, phi2, force0, pix
  
function reactionButton2 () {
  on = false;                                              // Animation abschalten
  t = 0;                                                   // Zeit zurücksetzen
  reaction();                                              // Eingaben übernehmen und rechnen
  updateOutput();                                          // Ausgabefelder aktualisieren (Fragezeichen)
  paint();                                                 // Neu zeichnen
  }
  
// Reaktion auf Tastendruck (nur auf Enter-Taste):
  
function reactionEnter (e) {
  if (e.key && String(e.key) == "Enter"                    // Falls Entertaste (Firefox/Internet Explorer) ...
  || e.keyCode == 13)                                      // Falls Entertaste (Chrome) ...
    reaction();                                            // ... Daten übernehmen und rechnen                          
  paint();                                                 // Neu zeichnen
  }
  
//-------------------------------------------------------------------------------------------------
  
// Differenz von Winkeln:
// w1, w2 ... gegebene Winkel
// Rückgabewert im Normalfall w1-w2; falls dieser Wert einen Betrag von mindestens 2 pi hat, wird ein geeignetes ganzzahliges
// Vielfaches von 2 pi addiert oder subtrahiert; das Ergebnis liegt zwischen - 2 pi und + 2 pi und ist positiv für w1 > w2
// und negativ für w1 < w2.
  
function diffAngle (w1, w2) {
  var w = w1-w2;
  var n = Math.floor(w/PI2);
  if (w < 0) n++; 
  return w-n*PI2; 
  }
  
// Vergleich zweier Winkel:
// w1, w2 ... Gegebene Winkel (Bogenmaß)
// Rückgabewert 0, falls sich w1 und w2 um ein ganzzahliges Vielfaches von 2 pi unterscheiden
// Rückgabewert 1, falls es einen Winkel w mit 0 < w < pi gibt, sodass w1 gleichwertig zu w2 + w
// Rückgabewert -1, falls es einen Winkel w mit 0 < w < pi gibt, sodass w1 gleichwertig zu w2 - w
  
function compare (w1, w2) {
  var w = w1-w2;                                           // Differenz
  while (w > Math.PI) w -= PI2;                            // Vielfaches von 2 pi subtrahieren (Ergebnis kleiner oder gleich +pi)
  while (w < -Math.PI) w += PI2;                           // Vielfaches von 2 pi addieren (Ergebnis größer oder gleich -pi)                     
  if (w == 0) return 0;                                    // Falls Winkel w1 und w2 gleichwertig, Rückgabewert 0
  return (w>0 ? 1 : -1);                                   // Rückgabewert bei nicht gleichwertigen Winkeln
  }

// Berechnungen (nach Änderungen):
// Seiteneffekt f1, f2, phi1, phi2
  
function calculation () {
  phi1 = phi0-alpha;                                       // Richtungswinkel der ersten Komponente (Bogenmaß) 
  phi2 = phi0+beta;                                        // Richtungswinkel der zweiten Komponente (Bogenmaß)
  var sinAB = Math.sin(alpha+beta);                        // Hilfsgröße
  f1 = f*Math.sin(beta)/sinAB;                             // Erste Komponente (N)
  f2 = f*Math.sin(alpha)/sinAB;                            // Zweite Komponente (N)
  }
  
// Suche nach einer Zehnerpotenz:
// a ... Gegebene Zahl (positiv)
// Rückgabewert: Größte Zehnerpotenz, die kleiner oder gleich a ist

function floorP10 (a) {
  var n = Math.floor(Math.log(a)/Math.log(10));            // Exponent der gesuchten Zehnerpotenz
  var p = 1;                                               // Startwert für Hilfsgröße
  for (var i=0; i<Math.abs(n); i++) p *= 10;               // Berechnung der Hilfsgröße (Zehnerpotenz bzw. deren Kehrwert)
  return (n>=0 ? p : 1/p);                                 // Rückgabewert 
  }
  
// Aktualisierung der Vergleichskraft und des Umrechnungsfaktors:
// Seiteneffekt force0, pix
  
function setPix () {
  var max = f;                                             // Maximum von f, f1 und f2
  if (f1 > max) max = f1;
  if (f2 > max) max = f2;
  force0 = floorP10(max);                                  // Betrag der Vergleichskraft (N)
  if (max/force0 > 5) pix = 20/force0;                     // Umrechnungsfaktor (Pixel pro N)
  else if (max/force0 > 2) pix = 50/force0;
  else pix = 100/force0;
  }
  
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

function input () {
  f = inputNumber(ipF,3,false,0.001,1000);                 // Betrag der gegebenen Kraft
  alpha = DEG*inputNumber(ipA1,1,true,0.1,179-beta/DEG);   // Erster Winkel
  beta = DEG*inputNumber(ipA2,1,true,0.1,179-alpha/DEG);   // Zweiter Winkel
  }
  
// Aktualisierung der Eingabefelder:

function updateInput () {
  ipF.value = ToString(f,3,false);                         // Eingabefeld für Kraftbetrag
  ipA1.value = ToString(alpha/DEG,1,true);                 // Eingabefeld für ersten Winkel
  ipA2.value = ToString(beta/DEG,1,true);                  // Eingabefeld für zweiten Winkel
  }
  
// Aktualisierung der Ausgabefelder:

function updateOutput () {
  opF1.innerHTML = (ready1 ? ToString(f1,3,false) : "?");  // Erste Komponente (N)
  opF2.innerHTML = (ready2 ? ToString(f2,3,false) : "?");  // Zweite Komponente (N)
  }
  
// Aktualisierung der Ein- und Ausgabefelder:
  
function updateInputOutput () {
  updateInput();                                           // Eingabefelder aktualisieren
  updateOutput();                                          // Ausgabefelder  aktualisieren
  }
  
//-------------------------------------------------------------------------------------------------
  
// Neuer Pfad mit Standardwerten:

function newPath() {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.strokeStyle = "#000000";                             // Linienfarbe schwarz
  ctx.lineWidth = 1;                                       // Liniendicke
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
  
// Pfeil mit Anfangspunkt (x0,y0) und dreifacher Dicke  (vereinfachte Version):    
// r ..... Länge des Pfeils (Pixel)
// phi ... Winkel gegenüber der Waagrechten (Bogenmaß, Gegenuhrzeiger)
    
function thickArrow (phi, r) {
  var x = x0+r*Math.cos(phi);                              // x-Koordinate (Pixel)
  var y = y0-r*Math.sin(phi);                              // y-Koordinate (Pixel)
  arrow(x0,y0,x,y,3);                                      // Pfeil zeichnen
  }
  
// Strecke/Halbgerade/Gerade mit Liniendicke 1:
// x0, y0 ... Anfangspunkt
// phi ...... Winkel gegenüber der Waagrechten (Bogenmaß)
// len ...... Länge (eventuell irrelevant)
// type ..... Strecke/Halbgerade/Gerade (0/1/2)
  	
function line (x0, y0, phi, len, type) {
  var infty = 2*width;                                     // Ersatz für unendliche Länge
  if (len > infty) len = infty;                            // Zu große Länge verhindern
  var sin = Math.sin(phi), cos = Math.cos(phi);            // Trigonometrische Werte
  var x = (type==2 ? x0-infty*cos : x0);                   // x-Koordinate des (eventuell veränderten) Anfangspunkts
  var y = (type==2 ? y0+infty*sin : y0);                   // y-Koordinate des (eventuell veränderten) Anfangspunkts
  var r = (type==0 ? len : infty);                         // Länge (eventuell verändert)                         
  ctx.beginPath();                                         // Neuer Pfad               
  ctx.lineWidth = 1;                                       // Liniendicke
  ctx.moveTo(x,y);                                         // Anfangspunkt
  ctx.lineTo(x0+r*cos,y0-r*sin);                           // Weiter zum Endpunkt
  ctx.stroke();                                            // Linie zeichnen
  }
  
// Winkelmarkierung im Gegenuhrzeigersinn:
// x, y ... Scheitel
// r ...... Radius
// a0 ..... Startwinkel (Bogenmaß)
// a ...... Winkelbetrag (Bogenmaß)
// c ...... Füllfarbe 

function angle0 (x, y, r, a0, a, c) {
  newPath();                                               // Neuer Pfad
  ctx.fillStyle = c;                                       // Füllfarbe
  ctx.moveTo(x,y);                                         // Scheitel als Anfangspunkt
  ctx.lineTo(x+r*Math.cos(a0),y-r*Math.sin(a0));           // Linie auf dem ersten Schenkel
  ctx.arc(x,y,r,PI2-a0,PI2-a0-a,true);                     // Kreisbogen
  ctx.closePath();                                         // Zurück zum Scheitel
  ctx.fill(); ctx.stroke();                                // Kreissektor ausfüllen, Rand zeichnen
  }
  
// Farbige Winkelmarkierung (vereinfachte Version):
// (x0,y0) ... Scheitel (globale Variablen)
// w0 ........ Anfangswinkel (Bogenmaß)
// dw ........ Winkelgröße (Bogenmaß)
// c ......... Farbe

function angle (w0, dw, c) {
  var n = Math.floor(w0/PI2);                              // 0 <= w0 < 2 pi erzwingen
  w0 -= n*PI2;
  n = Math.floor(dw/PI2);                                  // 0 <= dw < 2 pi erzwingen
  dw -= n*PI2;
  angle0(x0,y0,20,w0,dw,c);                                // Winkelmarkierung
  }
  
// Zentrierter Text:
// s ...... Zeichenkette
// x, y ... Position
// c ...... Farbe (optional)

function centeredText (s, x, y, c) {
  if (c) ctx.fillStyle = c;                                // Füllfarbe setzen, falls festgelegt
  ctx.font = FONT;                                         // Zeichensatz
  ctx.textAlign = "center";                                // Textausrichtung (zentriert)
  ctx.fillText(s,x,y);                                     // Text ausgeben
  }
  
// Beschriftung eines Kraftpfeils:
// s ..... Zeichenkette
// phi ... Winkel gegenüber der x-Achse (Bogenmaß)
// r ..... Abstand vom Angriffspunkt (Pixel)
// c ..... Farbe
  
function arrowText (s, phi, r, c) {
  var x = x0+r*Math.cos(phi);                              // x-Koordinate (Pixel) 
  var y = y0-r*Math.sin(phi);                              // y-Koordinate (Pixel)
  centeredText(s,x,y,c);                                   // Text zentriert ausgeben
  } 
  
// Clipping:

function clip () {
  ctx.beginPath();                                         // Neuer Pfad
  ctx.moveTo(2,2);                                         // Anfangspunkt (links oben)
  ctx.lineTo(width-2,2);                                   // Weiter nach rechts oben
  ctx.lineTo(width-2,height-2);                            // Weiter nach rechts unten
  ctx.lineTo(2,height-2);                                  // Weiter nach links unten
  ctx.closePath();                                         // Zurück zum Ausgangspunkt
  ctx.clip();                                              // Zeichenbereich begrenzen
  }

// Grafikausgabe:
  
function paint () {
  ctx.fillStyle = colorBackground;                         // Hintergrundfarbe
  ctx.fillRect(0,0,width,height);                          // Hintergrund ausfüllen
  clip();                                                  // Clipping
  ctx.strokeStyle = "#000000";                             // Farbe für Vergleichspfeil
  arrow(50,height-50,50+force0*pix,height-50,3);           // Vergleichspfeil
  var f0 = ""+Math.round(force0)+" "+newtonUnicode;        // Zeichenkette für Vergleichskraft
  if (force0 < 1)                                          // Falls Vergleichskraft kleiner als 1 N ... 
    f0 = ""+ToString(force0,1,false)+" "+newtonUnicode;    // ... Zahlenwert mit einer gültigen Ziffer
  centeredText(f0,50+force0*pix/2,height-30);              // Wert der Vergleichskraft unter dem Pfeil
  ctx.beginPath();                                         // Neuer Pfad
  ctx.fillStyle = colorBody;                               // Füllfarbe für Körper
  ctx.strokeStyle = "#000000";                             // Randfarbe
  ctx.lineWidth = 1.2;                                     // Liniendicke       
  ctx.arc(x0,y0,5,0,PI2,true);                             // Kreis für Körper vorbereiten
  ctx.fill(); ctx.stroke();                                // Kreis mit Rand zeichnen
  var xF = x0+f*pix*Math.cos(phi0);                        // x-Koordinate der Pfeilspitze
  var yF = y0-f*pix*Math.sin(phi0);                        // y-Koordinate der Pfeilspitze
  angle(phi1,alpha,colorAngle1);                           // Ersten Winkel markieren
  angle(phi0,beta,colorAngle2);                            // Zweiten Winkel markieren
  ctx.strokeStyle = colorForce;                            // Farbe für Kraftpfeil
  thickArrow(phi0,f*pix);                                  // Pfeil für gegebene Kraft
  ctx.strokeStyle = colorComp1;                            // Farbe für erste Komponente
  line(x0,y0,phi1,1,1);                                    // Halbgerade für erste Komponente
  ctx.strokeStyle = colorComp2;                            // Farbe für zweite Komponente
  line(x0,y0,phi2,1,1);                                    // Halbgerade für zweite Komponente
  var q1 = Math.min(t/5,1);                                // Hilfsgrößen für Parallelen 
  var q2 = Math.min((t-5)/5,1);
  var q3 = Math.min((t-10)/5,1);
  var q4 = Math.min((t-15)/5,1);
  var dx = xF-x0, dy = yF-y0;                              // Vektorkoordinaten für gegebene Kraft
  if (on) t = (new Date()-t0)/1000;                        // Aktuelle Zeit (s) 
  newPath();                                               // Neuer Pfad mit Standardwerten
  if (t > 0)                                               // Parallele zur ersten Halbgeraden
    line(x0+q1*dx,y0+q1*dy,phi1+Math.PI,f1*pix,t<10?2:0);
  if (t > 5)                                               // Ab der 5. Sekunde Parallele zur zweiten Halbgeraden 
    line(x0+q2*dx,y0+q2*dy,phi2+Math.PI,f2*pix,t<10?2:0);
  if (t > 10) {                                            // Ab der 10. Sekunde ...
    arrowText(text11,phi1,f1*pix*0.5,colorComp1);          // Beschriftung für erste Komponente
    ctx.strokeStyle = colorComp1;                          // Farbe
    thickArrow(phi1,f1*pix*q3);                            // Pfeil für erste Komponente
    }
  if (t > 15) {                                            // Ab der 15. Sekunde ...
    arrowText(text12,phi2,f2*pix*0.5,colorComp2);          // Beschriftung für zweite Komponente
    ctx.strokeStyle = colorComp2;                          // Farbe
    thickArrow(phi2,f2*pix*q4);                            // Pfeil für zweite Komponente
    if (!ready1) {                                         // Falls Konstruktion der ersten Komponente beendet ... 
      ready1 = true;                                       // ... Flag ändern
      updateInputOutput();                                 // ... Ausgabefeld(er) aktualisieren             
      }
    }
  if (t > 20) {                                            // Ab der 20. Sekunde ...
    if (!ready2) {                                         // Falls Konstruktion der zweiten Komponente beendet ...
      ready2 = true;                                       // ... Flag ändern
      updateInputOutput();                                 // ... Ausgabefeld(er) aktualisieren
      }
    }                       
  }
  
document.addEventListener("DOMContentLoaded",start,false); // Beim Laden der HTML-Seite Startmethode ausführen
